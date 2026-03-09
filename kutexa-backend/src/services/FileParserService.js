const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const axios = require('axios'); // Necessário para baixar do Cloudinary

class FileParserService {
  
  static async parseFile(filePathOrUrl, mimeType) {
    console.log(`[PARSER] Processando: ${filePathOrUrl} (${mimeType})`);

    // 1. Decidir estratégia: Local ou Remoto (URL)
    const isRemote = filePathOrUrl.startsWith('http');
    
    // 2. Encaminhar para o parser correto
    if (mimeType.includes('csv') || filePathOrUrl.endsWith('.csv') || mimeType === 'application/octet-stream') {
        // Cloudinary às vezes devolve 'octet-stream' para CSVs
        return this.parseCSV(filePathOrUrl, isRemote);
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || filePathOrUrl.endsWith('.xlsx')) {
        return this.parseExcel(filePathOrUrl, isRemote);
    } else {
        console.warn(`[PARSER] Tipo desconhecido: ${mimeType}. Tentando CSV como fallback.`);
        return this.parseCSV(filePathOrUrl, isRemote);
    }
  }

  /**
   * Parser CSV (Suporta Stream Local e HTTP)
   */
  static parseCSV(path, isRemote) {
    return new Promise(async (resolve, reject) => {
      const results = [];
      let stream;

      try {
        if (isRemote) {
            // Baixa o arquivo do Cloudinary como stream
            const response = await axios({
                method: 'get',
                url: path,
                responseType: 'stream'
            });
            stream = response.data;
        } else {
            // Lê do disco local
            stream = fs.createReadStream(path);
        }

        stream
          .pipe(csv())
          .on('data', (data) => {
            const normalized = this.normalizeTransaction(data);
            if (normalized) results.push(normalized);
          })
          .on('end', () => resolve(results))
          .on('error', (err) => reject(err));

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Parser Excel (Precisa baixar arquivo inteiro para memória se for remoto)
   */
  static async parseExcel(path, isRemote) {
    let workbook;

    if (isRemote) {
        // Axios para baixar como ArrayBuffer
        const response = await axios.get(path, { responseType: 'arraybuffer' });
        workbook = xlsx.read(response.data, { type: 'buffer' });
    } else {
        workbook = xlsx.readFile(path);
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    
    return jsonData.map(row => this.normalizeTransaction(row)).filter(Boolean);
  }

  static normalizeTransaction(data) {
    // 1. Tenta encontrar a Data
    let date = data['date'] || data['Data'] || data['data_transacao'] || data['Date'];
    
    // 2. Tenta encontrar a Descrição
    let description = data['description'] || data['Descricao'] || data['Historico'] || data['Description'] || 'Sem descrição';
    
    let amount = 0;

    // 3. Lógica de Valor (Crédito/Débito ou Coluna Única)
    if (data['credit'] || data['Credito'] || data['Credit']) {
        let val = data['credit'] || data['Credito'] || data['Credit'];
        amount = parseFloat(val.toString().replace(/[^0-9.-]+/g, ""));
    } else if (data['debit'] || data['Debito'] || data['Debit']) {
        let val = data['debit'] || data['Debito'] || data['Debit'];
        amount = -Math.abs(parseFloat(val.toString().replace(/[^0-9.-]+/g, "")));
    } else if (data['amount'] || data['Valor'] || data['Amount']) {
        let valStr = (data['amount'] || data['Valor'] || data['Amount']).toString();
        // Remove 'Kz', '$', espaços, vírgulas de milhar
        valStr = valStr.replace(/[^0-9.-]+/g, ""); 
        amount = parseFloat(valStr);
    }

    // Validação mínima
    if (!date || isNaN(amount)) return null;

    return {
      date: new Date(date), // Sequelize lida bem com ISO String
      description: description.trim(),
      amount: amount,
      status: 'pending'
    };
  }
}

module.exports = FileParserService;