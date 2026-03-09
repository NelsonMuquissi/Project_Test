const ReconciliationJob = require('../models/ReconciliationJob');
const UploadedFile = require('../models/UploadedFile');
const CompanyUser = require('../models/CompanyUser');
const Transaction = require('../models/Transaction');
const ReconciliationMatch = require('../models/ReconciliationMatch');
const FileParserService = require('../services/FileParserService');
const ReconciliationService = require('../services/ReconciliationService');
const { parseQueryOptions } = require('../utils/queryHelper');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { cloudinary } = require('../Upload/multerConfig');

// Função auxiliar para limpar ficheiros em caso de erro
const cleanupUploadedFiles = async (files) => {
    if (!files) return;
    console.log(`[CLEANUP] Removendo ${files.length} arquivos órfãos...`);
    await Promise.all(
        files.map(file =>
            cloudinary.uploader.destroy(file.filename, { resource_type: 'raw' })
                .catch(() => { })
        )
    );
};

// 1. Upload Inicial (Bank Statement)
const uploadForReconciliation = async (req, res, next) => {
    const userId = req.user.id;
    const { companyId, periodStart, periodEnd } = req.body;

    // Validações básicas
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Pelo menos um ficheiro deve ser enviado.' });
    }

    if (!companyId || !periodStart || !periodEnd) {
        await cleanupUploadedFiles(req.files);
        return res.status(400).json({ error: 'companyId, periodStart e periodEnd são obrigatórios.' });
    }

    const transaction = await sequelize.transaction();

    try {
        // Validação de Permissão (RBAC)
        const membership = await CompanyUser.findOne({ where: { userId, companyId } });
        if (!membership) {
            await cleanupUploadedFiles(req.files);
            return res.status(403).json({ error: 'Acesso não permitido a esta empresa.' });
        }

        // Criar o Job
        const job = await ReconciliationJob.create({
            companyId,
            userId, // Quem iniciou
            periodStart,
            periodEnd,
            status: 'pending'
        }, { transaction });

        let totalTransactions = 0;

        // Processar cada arquivo enviado
        for (const file of req.files) {
            // 1. Salvar Metadados do Arquivo
            const uploadedFile = await UploadedFile.create({
                jobId: job.id,
                originalName: file.originalname,
                storageName: file.filename, // ID do Cloudinary ou nome local
                fileUrl: file.path,         // URL ou path
                mimeType: file.mimetype,
                size: file.size,
                sourceType: 'bank_statement'
            }, { transaction });

            // 2. FASE B: Parsing e Normalização (Usando o Service)
            // Nota: Se o file.path for URL (Cloudinary), o FileParserService deve saber lidar (via axios/fetch)
            const parsedData = await FileParserService.parseFile(file.path, file.mimetype);

            if (parsedData && parsedData.length > 0) {
                const transactionsToSave = parsedData.map(tx => ({
                    jobId: job.id,
                    fileId: uploadedFile.id,
                    date: tx.date,
                    description: tx.description,
                    amount: tx.amount,
                    currency: 'AOA', // Default, ou extraído do arquivo
                    sourceType: 'bank',
                    status: 'pending'
                }));

                await Transaction.bulkCreate(transactionsToSave, { transaction });
                totalTransactions += transactionsToSave.length;
            }
        }

        await transaction.commit();

        return res.status(201).json({
            message: 'Ficheiros processados e transações importadas.',
            jobId: job.id,
            stats: { transactionsImported: totalTransactions }
        });

    } catch (error) {
        await transaction.rollback();
        await cleanupUploadedFiles(req.files);
        next(error); // Passa o erro para o middleware global de erro
    }
};

// 2. Upload ERP Template
const uploadErpTemplate = async (req, res, next) => {
    const userId = req.user.id;
    const { jobId } = req.body;
    const transaction = await sequelize.transaction();

    if (!jobId || !req.files || req.files.length === 0) {
        await cleanupUploadedFiles(req.files);
        return res.status(400).json({ error: 'jobId e ficheiros são obrigatórios.' });
    }

    try {
        const job = await ReconciliationJob.findByPk(jobId);
        if (!job) {
            await cleanupUploadedFiles(req.files);
            return res.status(404).json({ error: 'Job não encontrado.' });
        }

        // Validação de Permissão
        const membership = await CompanyUser.findOne({
            where: {
                userId,
                companyId: job.companyId
            },
            transaction
        });

        if (!membership) {
            await cleanupUploadedFiles(req.files);
            return res.status(403).json({ error: 'Acesso não permitido.' });
        }

        let totalTransactions = 0;

        for (const file of req.files) {
            const uploadedFile = await UploadedFile.create({
                jobId: job.id,
                originalName: file.originalname,
                storageName: file.filename,
                fileUrl: file.path,
                mimeType: file.mimetype,
                size: file.size,
                sourceType: 'erp_ledger'
            }, { transaction });

            // Parsing e Normalização
            const parsedData = await FileParserService.parseFile(file.path, file.mimetype);

            if (parsedData && parsedData.length > 0) {
                const transactionsToSave = parsedData.map(tx => ({
                    jobId: job.id,
                    fileId: uploadedFile.id,
                    date: tx.date,
                    description: tx.description,
                    amount: tx.amount, // O Service já deve devolver o sinal correto (+/-)
                    currency: 'AOA',
                    sourceType: 'erp',
                    status: 'pending'
                }));

                await Transaction.bulkCreate(transactionsToSave, { transaction });
                totalTransactions += transactionsToSave.length;
            }
        }

        await transaction.commit();
        return res.status(201).json({
            message: 'Template ERP importado com sucesso.',
            jobId: job.id,
            stats: { transactionsImported: totalTransactions }
        });

    } catch (error) {
        await transaction.rollback();
        await cleanupUploadedFiles(req.files);
        next(error);
    }
};

// 3. Processar Job (O MOTOR - FASE C)
const processReconciliationJob = async (req, res, next) => {
    const userId = req.user.id;
    const { jobId } = req.params;

    try {
        const job = await ReconciliationJob.findByPk(jobId);
        if (!job) return res.status(404).json({ error: 'Trabalho não encontrado.' });

        const membership = await CompanyUser.findOne({ where: { userId, companyId: job.companyId } });
        if (!membership) return res.status(403).json({ error: 'Acesso não permitido.' });

        if (job.status === 'completed' || job.status === 'processing') {
            return res.status(409).json({ error: 'Este trabalho já foi ou está a ser processado.' });
        }

        // Atualiza status para processing
        await job.update({ status: 'processing' });

        // Chama o Serviço de Conciliação (Algoritmo do PDF)
        // Isso executa a lógica pesada de Value Match, Date Window e Text Similarity
        const stats = await ReconciliationService.performReconciliation(jobId);

        // Atualiza status para completed
        await job.update({
            status: 'completed',
            summary: stats
        });

        return res.status(200).json({
            message: 'Processamento concluído.',
            stats,
            jobId: job.id
        });

    } catch (error) {
        await ReconciliationJob.update({ status: 'failed' }, { where: { id: jobId } });
        console.error("Erro processamento:", error);
        next(error);
    }
};

// 4. Listar Jobs
const listJobsByCompany = async (req, res, next) => {
    const userId = req.user.id;
    const { companyId } = req.params;
    try {
        const membership = await CompanyUser.findOne({ where: { userId, companyId } });
        if (!membership) return res.status(403).json({ error: 'Acesso não permitido.' });

        const queryOptions = parseQueryOptions(req.query);
        queryOptions.where.companyId = companyId;

        const { count, rows } = await ReconciliationJob.findAndCountAll(queryOptions);
        return res.status(200).json({ count, rows }); // Formato padrão melhor
    } catch (error) {
        next(error);
    }
};

// 5. Detalhes do Job (Dashboard)
const getJobDetails = async (req, res, next) => {
    const userId = req.user.id;
    const { jobId } = req.params;

    try {
        const job = await ReconciliationJob.findByPk(jobId);
        if (!job) return res.status(404).json({ error: 'Job não encontrado.' });

        const membership = await CompanyUser.findOne({ where: { userId, companyId: job.companyId } });
        if (!membership) return res.status(403).json({ error: 'Acesso não permitido.' });

        const files = await UploadedFile.findAll({ where: { jobId } });

        // Contagens usando o banco
        const stats = {
            totalBank: await Transaction.count({ where: { jobId, sourceType: 'bank' } }),
            totalErp: await Transaction.count({ where: { jobId, sourceType: 'erp' } }),
            matchesConfirmed: await ReconciliationMatch.count({ where: { jobId, status: 'confirmed' } }),
            matchesSuggested: await ReconciliationMatch.count({ where: { jobId, status: { [Op.in]: ['suggested', 'pending'] } } }),
            unreconciled: await Transaction.count({ where: { jobId, status: 'unreconciled' } })
        };

        return res.status(200).json({ ...job.toJSON(), files, stats });

    } catch (error) {
        next(error);
    }
};

// 6. Listar Matches (Para revisão manual)
const getJobMatches = async (req, res, next) => {
    const userId = req.user.id;
    const { jobId } = req.params;

    try {
        const job = await ReconciliationJob.findByPk(jobId);
        if (!job) return res.status(404).json({ error: 'Job não encontrado.' });

        const membership = await CompanyUser.findOne({ where: { userId, companyId: job.companyId } });
        if (!membership) return res.status(403).json({ error: 'Acesso não permitido.' });

        const queryOptions = parseQueryOptions(req.query);
        queryOptions.where.jobId = jobId;

        // Incluir detalhes das transações para mostrar lado a lado no Front
        queryOptions.include = [
            { model: Transaction, as: 'bankTransaction' },
            { model: Transaction, as: 'erpTransaction' }
        ];

        const { count, rows } = await ReconciliationMatch.findAndCountAll(queryOptions);
        return res.status(200).json({ count, rows });

    } catch (error) {
        next(error);
    }
};

// 7. Ações Manuais (Confirm/Reject)
const manageMatchStatus = async (req, res, next, newStatus) => {
    const userId = req.user.id;
    const { matchId } = req.params;
    const transaction = await sequelize.transaction();

    try {
        const match = await ReconciliationMatch.findByPk(matchId);
        if (!match) { await transaction.rollback(); return res.status(404).json({ error: 'Match não encontrado.' }); }

        const job = await ReconciliationJob.findByPk(match.jobId);
        const membership = await CompanyUser.findOne({ where: { userId, companyId: job.companyId } });
        if (!membership) { await transaction.rollback(); return res.status(403).json({ error: 'Acesso não permitido.' }); }

        // Atualizar Match
        match.status = newStatus;
        await match.save({ transaction });

        // Atualizar Transações
        const txStatus = newStatus === 'confirmed' ? 'matched' : 'unreconciled'; // 'matched' no modelo novo

        await Transaction.update({ status: txStatus }, {
            where: { id: match.bankTransactionId }, transaction
        });
        await Transaction.update({ status: txStatus }, {
            where: { id: match.erpTransactionId }, transaction
        });

        await transaction.commit();
        return res.status(200).json({ message: `Match ${newStatus}.`, match });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

const confirmMatch = async (req, res, next) => manageMatchStatus(req, res, next, 'confirmed');
const rejectMatch = async (req, res, next) => manageMatchStatus(req, res, next, 'rejected');

// 8. Processamento em Lote (Batch Matches)
const processBatchMatches = async (req, res, next) => {
    const userId = req.user.id;
    const { jobId } = req.params;
    const { action, matchIds } = req.body; // action: 'confirm' ou 'reject'

    const transaction = await sequelize.transaction();

    try {
        const job = await ReconciliationJob.findByPk(jobId, { transaction });
        if (!job) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Trabalho não encontrado.' });
        }

        const membership = await CompanyUser.findOne({ where: { userId, companyId: job.companyId }, transaction });
        if (!membership) {
            await transaction.rollback();
            return res.status(403).json({ error: 'Acesso não permitido.' });
        }

        // Buscar todos os matches solicitados que ainda estão pendentes/sugeridos
        const matches = await ReconciliationMatch.findAll({
            where: {
                id: { [Op.in]: matchIds },
                jobId: jobId,
                status: { [Op.in]: ['suggested', 'pending'] }
            },
            transaction
        });

        if (matches.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Nenhum match válido encontrado para processamento.' });
        }

        const newMatchStatus = action === 'confirm' ? 'confirmed' : 'rejected';
        const newTransactionStatus = action === 'confirm' ? 'matched' : 'unreconciled'; // 'matched' no novo modelo

        // 1. Atualizar o status dos Matches
        await ReconciliationMatch.update(
            { status: newMatchStatus },
            {
                where: { id: { [Op.in]: matches.map(m => m.id) } },
                transaction
            }
        );

        // 2. Juntar os IDs das transações bancárias e ERP afetadas
        const transactionIds = [];
        matches.forEach(m => {
            if (m.bankTransactionId) transactionIds.push(m.bankTransactionId);
            if (m.erpTransactionId) transactionIds.push(m.erpTransactionId);
        });

        // 3. Atualizar o status das Transações
        if (transactionIds.length > 0) {
            await Transaction.update(
                { status: newTransactionStatus },
                {
                    where: { id: { [Op.in]: transactionIds } },
                    transaction
                }
            );
        }

        await transaction.commit();

        return res.status(200).json({
            message: `Sucesso. ${matches.length} matches processados como '${newMatchStatus}'.`,
            processedCount: matches.length,
            requestedCount: matchIds.length
        });

    } catch (error) {
        await transaction.rollback();
        console.error("Erro em batch:", error);
        next(error);
    }
};

// Exportação antiga (Pode manter ou remover)
const getReconciliationResults = async (req, res) => {
    // Implementação simplificada ou redirecionamento para getJobMatches
    res.status(200).json({ message: "Use getJobMatches e getJobDetails para resultados." });
};

module.exports = {
    uploadForReconciliation,
    uploadErpTemplate,
    processReconciliationJob,
    listJobsByCompany,
    getJobDetails,
    getJobMatches,
    confirmMatch,
    rejectMatch,
    getReconciliationResults,
    processBatchMatches,
};