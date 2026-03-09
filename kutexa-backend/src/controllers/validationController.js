const { parseCsvFromUrl } = require('../utils/fileParser');
const { cloudinary } = require('../Upload/multerConfig');

const cleanupFile = async (file) => {
    if (!file) return;
    try {
        await cloudinary.uploader.destroy(file.filename, { resource_type: 'raw' });
    } catch (err) {
        console.error(`Erro ao limpar ficheiro de preview ${file.filename}:`, err.message);
    }
};

const previewFile = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Nenhum ficheiro enviado.' });
    }
    
    const file = req.files[0];
    const { type } = req.body; 

    if (!['bank_statement', 'erp_ledger'].includes(type)) {
        await cleanupFile(file);
        return res.status(400).json({ error: 'Tipo de ficheiro inválido. Use "bank_statement" ou "erp_ledger".' });
    }

    try {
        console.log(`Iniciando Preview para: ${file.originalName}`);

        const rawData = await parseCsvFromUrl(file.fileUrl || file.path);
        
        const stats = {
            rowsTotal: rawData.length,
            rowsValid: 0,
            rowsInvalid: 0,
            errors: [],
            warnings: []
        };

        const previewData = [];

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        
        const amountRegex = /^-?\d+(\.\d+)?$/;

        rawData.forEach((row, index) => {
            const rowNumber = index + 1;
            const errors = [];

            if (!row.date) {
                errors.push(`Linha ${rowNumber}: Campo 'date' em falta.`);
            } else if (!dateRegex.test(row.date.trim())) {
                errors.push(`Linha ${rowNumber}: Formato de data incorreto '${row.date}'. Use YYYY-MM-DD.`);
            } else if (isNaN(new Date(row.date).getTime())) {
                errors.push(`Linha ${rowNumber}: Data inexistente '${row.date}'.`);
            }

            if (!row.amount) {
                errors.push(`Linha ${rowNumber}: Campo 'amount' em falta.`);
            } else {
                const cleanAmount = row.amount.toString().trim();
                if (!amountRegex.test(cleanAmount)) {
                    errors.push(`Linha ${rowNumber}: Valor inválido '${row.amount}'. Contém caracteres não numéricos.`);
                }
            }

            if (!row.description) {
                stats.warnings.push(`Linha ${rowNumber}: Descrição vazia.`);
            }

            if (errors.length > 0) {
                stats.rowsInvalid++;
                if (stats.errors.length < 50) {
                    stats.errors.push(...errors);
                }
            } else {
                stats.rowsValid++;
                if (previewData.length < 5) {
                    previewData.push(row);
                }
            }
        });

        await cleanupFile(file);

        return res.status(200).json({
            fileName: file.originalName,
            validationType: type,
            qualityScore: stats.rowsTotal > 0 ? Math.round((stats.rowsValid / stats.rowsTotal) * 100) : 0,
            statistics: stats,
            previewSample: previewData
        });

    } catch (error) {
        await cleanupFile(file);
        console.error("Erro no preview:", error);
        return res.status(500).json({ error: 'Erro ao processar ficheiro para preview.' });
    }
};

module.exports = { previewFile };