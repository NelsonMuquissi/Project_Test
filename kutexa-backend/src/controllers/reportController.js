const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const CompanyUser = require('../models/CompanyUser');
const ReconciliationJob = require('../models/ReconciliationJob');
const Transaction = require('../models/Transaction');
const ReconciliationMatch = require('../models/ReconciliationMatch');
const BankAccount = require('../models/BankAccount');
const { Parser } = require('json2csv');

// KPI Dashboard (Gestor)
const getDashboardKPIs = async (req, res, next) => {
    const userId = req.user.id;
    const { companyId } = req.params;
    const { startDate, endDate } = req.query;

    try {
        const membership = await CompanyUser.findOne({ where: { userId, companyId } });
        if (!membership) {
            return res.status(403).json({ error: 'Acesso não permitido a esta empresa.' });
        }

        const whereCondition = { companyId };
        if (startDate && endDate) {
            whereCondition.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        // Estatísticas Gerais
        const totalJobs = await ReconciliationJob.count({ where: whereCondition });
        const completedJobs = await ReconciliationJob.count({ where: { ...whereCondition, status: 'completed' } });

        // Buscar Jobs relevantes para calcular transações
        const relevantJobs = await ReconciliationJob.findAll({ where: whereCondition, attributes: ['id'] });
        const jobIds = relevantJobs.map(job => job.id);

        let totalTransactions = 0;
        let reconciledTransactions = 0;
        let totalMatches = 0;
        let confirmedMatches = 0;

        if (jobIds.length > 0) {
            totalTransactions = await Transaction.count({ where: { jobId: { [Op.in]: jobIds } } });

            // Status novos: 'reconciled' ou 'matched' (dependendo da versão do enum)
            reconciledTransactions = await Transaction.count({
                where: {
                    jobId: { [Op.in]: jobIds },
                    status: { [Op.in]: ['reconciled', 'matched'] }
                }
            });

            totalMatches = await ReconciliationMatch.count({ where: { jobId: { [Op.in]: jobIds } } });
            confirmedMatches = await ReconciliationMatch.count({ where: { jobId: { [Op.in]: jobIds }, status: 'confirmed' } });
        }

        const pendingTransactions = totalTransactions - reconciledTransactions;
        const matchRate = totalTransactions > 0 ? (reconciledTransactions / totalTransactions) * 100 : 0;

        // 4. Bank Account Distribution (Real Data)
        const bankAccounts = await BankAccount.findAll({
            where: { companyId },
            include: [{
                model: Transaction,
                where: { jobId: { [Op.in]: jobIds } },
                required: false
            }]
        });

        const bankStats = bankAccounts.map(acc => ({
            name: acc.bankName,
            balance: acc.Transactions?.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0) || 0,
            count: acc.Transactions?.length || 0,
            currency: acc.currency
        }));

        // 5. Efficiency Trend (Last 7 Jobs)
        const efficiencyTrend = await ReconciliationJob.findAll({
            where: { companyId, status: 'completed' },
            limit: 7,
            order: [['createdAt', 'DESC']],
            attributes: ['createdAt', 'matchCount']
        });

        return res.status(200).json({
            kpis: {
                totalJobs,
                completedJobs,
                pendingTransactions,
                confirmedMatches,
                totalMatches,
                matchRate: parseFloat(matchRate.toFixed(2))
            },
            bankStats,
            efficiencyTrend: efficiencyTrend.reverse()
        });

    } catch (error) {
        console.error("Erro ao gerar KPIs:", error);
        next(error);
    }
};

// Exportação CSV (Analista/Gestor)
const exportJobReport = async (req, res, next) => {
    const userId = req.user.id;
    const { jobId } = req.params;

    try {
        const job = await ReconciliationJob.findByPk(jobId);
        if (!job) return res.status(404).json({ error: 'Trabalho não encontrado.' });

        const membership = await CompanyUser.findOne({ where: { userId, companyId: job.companyId } });
        if (!membership) return res.status(403).json({ error: 'Acesso não permitido.' });

        // 1. Buscar Dados (Raw para performance)
        const transactions = await Transaction.findAll({
            where: { jobId },
            raw: true,
            order: [['date', 'ASC']]
        });

        const matches = await ReconciliationMatch.findAll({
            where: { jobId },
            raw: true
        });

        // 2. OTIMIZAÇÃO: Criar Mapa de Matches (O(1) lookup)
        const matchMap = {};
        matches.forEach(m => {
            matchMap[m.bankTransactionId] = m;
            matchMap[m.erpTransactionId] = m;
        });

        // 3. Montar Relatório
        const reportData = transactions.map(tx => {
            const match = matchMap[tx.id];

            return {
                data_transacao: tx.date, // Nome correto da coluna
                descricao: tx.description,
                valor: parseFloat(tx.amount).toFixed(2),
                moeda: tx.currency || 'AOA',
                tipo: tx.type === 'credit' ? 'Crédito' : 'Débito',
                origem: tx.sourceType === 'bank' ? 'Extrato Bancário' : 'Razão ERP',
                status_final: translateStatus(tx.status),
                id_match: match ? match.id : 'N/A',
                // Nome correto: confidenceScore
                confianca_match: match ? (match.confidenceScore * 100).toFixed(0) + '%' : '-',
                status_match: match ? translateStatus(match.status) : '-'
            };
        });

        const fields = [
            'data_transacao', 'descricao', 'valor', 'moeda', 'tipo',
            'origem', 'status_final', 'id_match', 'confianca_match', 'status_match'
        ];

        const json2csvParser = new Parser({ fields, delimiter: ',' });
        const csv = json2csvParser.parse(reportData);

        res.header('Content-Type', 'text/csv');
        res.attachment(`Kutexa_Relatorio_${jobId}.csv`);
        return res.send(csv);

    } catch (error) {
        console.error("Erro ao exportar relatório:", error);
        next(error);
    }
};

// Auxiliar de Tradução
function translateStatus(status) {
    const dict = {
        'pending': 'Pendente',
        'matched': 'Conciliado',
        'reconciled': 'Conciliado',
        'unreconciled': 'Não Conciliado',
        'pending_review': 'Aguardando Revisão',
        'confirmed': 'Confirmado',
        'rejected': 'Rejeitado',
        'suggested': 'Sugerido'
    };
    return dict[status] || status;
}

module.exports = {
    getDashboardKPIs,
    exportJobReport,
};