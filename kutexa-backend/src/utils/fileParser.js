// src/utils/fileParser.js
const axios = require('axios');
const csv = require('csv-parser');
const { Readable } = require('stream');

const parseCsvFromUrl = async (fileUrl) => {
    return new Promise(async (resolve, reject) => {
        const results = [];
        
        try {
            const response = await axios({
                method: 'get',
                url: fileUrl,
                responseType: 'stream'
            });

            response.data
                .pipe(csv())
                .on('data', (data) => {
                    const normalizedData = {};
                    Object.keys(data).forEach(key => {
                        normalizedData[key.toLowerCase().trim()] = data[key];
                    });
                    results.push(normalizedData);
                })
                .on('end', () => {
                    resolve(results);
                })
                .on('error', (error) => {
                    reject(error);
                });

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { parseCsvFromUrl };