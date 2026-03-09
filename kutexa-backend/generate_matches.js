const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const testFilesDir = path.join('C:', 'Users', 'HP', 'Desktop', 'Antigravity_Skills', 'test-files');

// Ensure directory exists
if (!fs.existsSync(testFilesDir)) {
    fs.mkdirSync(testFilesDir, { recursive: true });
}

// 4 match scenarios: exact match, match with date variation, match with description variation, negative amount
const dataBank = [
    { Date: '2023-10-01', Description: 'PAGAMENTO FATURA 001', Amount: 1500.00 },
    { Date: '2023-10-02', Description: 'TRANSFERENCIA RECEBIDA CLIENTE A', Amount: 2000.50 },
    { Date: '2023-10-03', Description: 'TARIFA BANCARIA MANUTENCAO', Amount: -15.00 },
    { Date: '2023-10-04', Description: 'PAGAMENTO FORNECEDOR XPTO', Amount: -500.00 }
];

const dataERP = [
    { Data: '2023-10-01', Historico: 'PAGAMENTO FATURA 001', Valor: 1500.00 }, // Exact
    { Data: '2023-10-03', Historico: 'TRANSFERENCIA RECEBIDA', Valor: 2000.50 }, // 1 day diff, partial desc (score > 0.6)
    { Data: '2023-10-03', Historico: 'TARIFA BANCARIA MANUTENCAO', Valor: -15.00 }, // Exact negative
    { Data: '2023-10-04', Historico: 'PAGAMENTO FORNECEDOR XPTO', Valor: -500.00 } // Exact negative
];

const wbBank = xlsx.utils.book_new();
const wsBank = xlsx.utils.json_to_sheet(dataBank);
xlsx.utils.book_append_sheet(wbBank, wsBank, "Bank");
xlsx.writeFile(wbBank, path.join(testFilesDir, 'banco_match.xlsx'));

const wbERP = xlsx.utils.book_new();
const wsERP = xlsx.utils.json_to_sheet(dataERP);
xlsx.utils.book_append_sheet(wbERP, wsERP, "ERP");
xlsx.writeFile(wbERP, path.join(testFilesDir, 'erp_match.xlsx'));

console.log('Archivos Excel creados con exito en:', testFilesDir);
