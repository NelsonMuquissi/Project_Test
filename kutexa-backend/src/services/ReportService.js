const { sequelize } = require('../config/database');
const Transaction = require('../models/Transaction');
const ReconciliationMatch = require('../models/ReconciliationMatch');
const ReconciliationJob = require('../models/ReconciliationJob');
const { Parser } = require('json2csv');

class ReportService {

    static async generateJobCsv(jobId) {
        // 1. Buscar o Job
        const job = await ReconciliationJob.findByPk(jobId);
        if (!job) throw new Error('Job not found');

        // 2. Buscar todas as transações deste Job
        const transactions = await Transaction.findAll({
            where: { jobId },
            raw: true,
            order: [['date', 'ASC']]
        });

        // 3. Buscar os Matches confirmados/sugeridos para enriquecer o relatório
        const matches = await ReconciliationMatch.findAll({
            where: { jobId },
            raw: true
        });

        // Criar um mapa para acesso rápido aos matches
        // Chave: TransactionID -> Valor: Match Info
        const matchMap = {};
        matches.forEach(m => {
            matchMap[m.bankTransactionId] = m;
            matchMap[m.erpTransactionId] = m;
        });

        // 4. Transformar os dados para o formato de Relatório
        const reportData = transactions.map(tx => {
            const match = matchMap[tx.id];
            
            return {
                Data: tx.date,
                Descricao: tx.description,
                Valor: parseFloat(tx.amount).toFixed(2), // Formatar dinheiro
                Moeda: tx.currency,
                Origem: tx.sourceType === 'bank' ? 'Extrato Bancário' : 'Razão ERP',
                Tipo: tx.type === 'credit' ? 'Crédito' : 'Débito',
                Status_Final: this.translateStatus(tx.status),
                Match_ID: match ? match.id : 'N/A',
                Confianca_Match: match ? (match.confidenceScore * 100).toFixed(0) + '%' : '-',
                Status_Match: match ? this.translateStatus(match.status) : '-'
            };
        });

        // 5. Gerar CSV
        const fields = [
            'Data', 'Descricao', 'Valor', 'Moeda', 'Origem', 'Tipo', 
            'Status_Final', 'Match_ID', 'Confianca_Match', 'Status_Match'
        ];
        
        const json2csvParser = new Parser({ fields, delimiter: ',' });
        const csv = json2csvParser.parse(reportData);

        return { 
            filename: `Relatorio_Conciliacao_${jobId}_${new Date().toISOString().split('T')[0]}.csv`,
            content: csv 
        };
    }

    // Auxiliar para traduzir ENUMs para Português legível
    static translateStatus(status) {
        const dictionary = {
            'pending': 'Pendente',
            'processing': 'Processando',
            'completed': 'Concluído',
            'failed': 'Falhou',
            'matched': 'Conciliado',
            'reconciled': 'Conciliado (Confirmado)',
            'unreconciled': 'Não Conciliado',
            'pending_review': 'Aguardando Revisão',
            'confirmed': 'Confirmado',
            'rejected': 'Rejeitado',
            'suggested': 'Sugerido'
        };
        return dictionary[status] || status;
    }
}

module.exports = ReportService;