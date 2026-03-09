const { Parser } = require('json2csv');

const getTemplate = (req, res) => {
    const { type } = req.params;

    let fields = [];
    let exampleData = [];
    let fileName = '';

    if (type === 'bank_statement') {
        fields = ['date', 'description', 'amount', 'type'];
        exampleData = [
            { date: '2025-01-15', description: 'PAGAMENTO SERVICO', amount: '-5000.00', type: 'debit' },
            { date: '2025-01-20', description: 'RECEBIMENTO CLIENTE X', amount: '12000.00', type: 'credit' }
        ];
        fileName = 'template_extrato_bancario.csv';
    } else if (type === 'erp_ledger') {
        fields = ['date', 'description', 'amount', 'type'];
        exampleData = [
            { date: '2025-01-15', description: 'Venda Fatura 001', amount: '12000.00', type: 'credit' },
            { date: '2025-01-15', description: 'Compra Material', amount: '-2000.00', type: 'debit' }
        ];
        fileName = 'template_erp_razao.csv';
    } else {
        return res.status(400).json({ error: 'Tipo de template inválido. Use "bank_statement" ou "erp_ledger".' });
    }

    try {
        const parser = new Parser({ fields });
        const csv = parser.parse(exampleData);

        res.header('Content-Type', 'text/csv');
        res.attachment(fileName);
        return res.send(csv);
    } catch (error) {
        console.error('Erro ao gerar template:', error);
        return res.status(500).json({ error: 'Erro ao gerar o template.' });
    }
};

module.exports = { getTemplate };