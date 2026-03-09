const axios = require('axios');
const API_URL = 'http://localhost:3000/api/v1';

async function testHistoryEndpoints() {
    try {
        // 1. O user 'test_recon_...' foi criado na run anterior.
        console.log('Logging in...');
        // Vou pesquisar o ficheiro db ou apenas tentar gerar um token de admin
        // Para simplificar, vou registar um novo admin/user e uma empresa, 
        // ou simplesmente usar o user padrão do script anterior se for previsível.
        // Vamos com um user fresco:
        const unique = Date.now();
        const email = `test_history_${unique}@example.com`;
        const password = 'Password123!';

        await axios.post(`${API_URL}/auth/register`, {
            name: 'History Test User', email, password, phone_number: `+244923456${unique.toString().slice(-3)}`
        });

        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        const token = loginRes.data.access_token;
        console.log('Login successful.');

        console.log('Creating company...');
        const compRes = await axios.post(`${API_URL}/companies/`, {
            name: `History Co ${unique}`, nif: `500123${unique.toString().slice(-6)}`
        }, { headers: { Authorization: `Bearer ${token}` } });
        const companyId = compRes.data.company.id;

        // Fake a job upload to get a jobId
        const fs = require('fs');
        const FormData = require('form-data');
        const form = new FormData();
        form.append('companyId', companyId);
        form.append('periodStart', '2025-01-01');
        form.append('periodEnd', '2025-12-31');
        form.append('files', fs.createReadStream('C:/tmp/test_bank_statement.csv'));
        form.append('files', fs.createReadStream('C:/tmp/test_invoices.csv'));

        const uploadRes = await axios.post(`${API_URL}/reconciliation-jobs/upload`, form, {
            headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
        });
        const jobId = uploadRes.data.jobId;
        console.log(`Upload successful. Job ID: ${jobId}`);

        console.log('Testing GET /companies/:companyId/reconciliation-jobs ...');
        const listRes = await axios.get(`${API_URL}/companies/${companyId}/reconciliation-jobs`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (listRes.data && listRes.data.rows && listRes.data.rows.length > 0) {
            console.log('✅ List of jobs is working!');
        } else {
            console.error('❌ Failed to list jobs or list is empty.');
        }

        console.log(`Testing GET /reconciliation-jobs/${jobId} ...`);
        const detailsRes = await axios.get(`${API_URL}/reconciliation-jobs/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (detailsRes.data && detailsRes.data.stats) {
            console.log('✅ Job Details is working!', detailsRes.data.stats);
        } else {
            console.error('❌ Failed to fetch job details.');
        }

        console.log(`Testing GET /reconciliation-jobs/${jobId}/matches ...`);
        const matchesRes = await axios.get(`${API_URL}/reconciliation-jobs/${jobId}/matches`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (matchesRes.data && matchesRes.data.rows) {
            console.log(`✅ Matches listing is working! Found: ${matchesRes.data.count}`);
        } else {
            console.error('❌ Failed to fetch matches.');
        }

        console.log('✅✅ ALL API ENDPOINTS TESTED SUCCESSFULLY ✅✅');

    } catch (err) {
        if (err.response) {
            console.error('HTTP ERROR:', err.response.status, err.response.data);
        } else {
            console.error('ERROR:', err);
        }
    }
}
testHistoryEndpoints();
