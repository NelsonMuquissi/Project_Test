const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const API_URL = 'http://localhost:3000/api/v1';

async function testUploadFullFlow() {
    try {
        const unique = Date.now();
        const email = `test_recon_${unique}@example.com`;
        const password = 'Password123!';
        const phone = `+244923456${unique.toString().slice(-3)}`;

        // 1. Register
        console.log('Registering user...');
        await axios.post(`${API_URL}/auth/register`, {
            name: 'Test Recon User',
            email,
            password,
            phone_number: phone
        });

        // 2. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
        });
        const token = loginRes.data.access_token;

        // 3. Create Company
        console.log('Creating company...');
        const compRes = await axios.post(`${API_URL}/companies/`, {
            name: `Company Recon ${unique}`,
            nif: `500123${unique.toString().slice(-6)}`
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const companyId = compRes.data.company.id; // Usually returns { message, company: { id, ... } }
        console.log(`Company created: ${companyId}`);

        // 4. Perform upload
        console.log('Preparing upload...');
        const form = new FormData();
        form.append('companyId', companyId);
        form.append('periodStart', '2025-01-01');
        form.append('periodEnd', '2025-12-31');

        form.append('files', fs.createReadStream('C:/tmp/test_bank_statement.csv'));
        form.append('files', fs.createReadStream('C:/tmp/test_invoices.csv'));

        console.log('Sending upload request...');
        const uploadRes = await axios.post(`${API_URL}/reconciliation-jobs/upload`, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Upload Response:', uploadRes.data);
        console.log('✅ RECONCILIATION TEST SUCCESSFUL');

    } catch (err) {
        if (err.response) {
            console.error('❌ HTTP ERROR:', err.response.status, JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('❌ CONNECTION ERROR:', err.message);
        }
    }
}

testUploadFullFlow();
