
require('dotenv').config();
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

function joinUrl(base, apiPath = '/api/v1') {
  let b = base || 'http://localhost:3000';

  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(b)) {
    b = 'http://' + b;
  }

  try {
    const url = new URL(apiPath, b);
    return url.toString().replace(/\/$/, '');
  } catch (err) {
    return (b.replace(/\/$/, '') + '/' + apiPath.replace(/^\//, '')).replace(/\/$/, '');
  }
}

const backendUrl = process.env.BACKEND_URL;
const backendApiPath = process.env.BACKEND_API_PATH;

const serverUrl = backendApiPath ? joinUrl(backendUrl, backendApiPath) : (backendUrl ? backendUrl.replace(/\/$/, '') : 'http://localhost:3000/api/v1');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kutexa API',
      version: '1.0.0',
      description: 'Documentação da API para o sistema de reconciliação bancária Kutexa.',
      contact: {
        name: 'Suporte Kutexa',
        email: 'suporte@kutexa.com',
      },
    },
     tags: [
      {
        name: '1. Autenticação',
        description: 'Endpoints para registro, login, confirmação de e-mail e logout.'
      },
      {
        name: '2. Licenças',
        description: 'Endpoints para ativação e gestão da licença de uso.'
      },
      {
        name: '3. Usuários',
        description: 'Endpoints relacionados com a gestão da conta do próprio usuário.'
      },
      {
        name: '4. Empresas',
        description: 'Gestão de empresas, membros, contas bancárias e recursos associados.'
      },
      {
        name: '5. Templates',
        description: 'Download de modelos CSV para importação de dados.'
      },
       {
        name: '6. Validações e Data Quality',
        description: 'Endpoints para verificar integridade de arquivos antes do processamento.'
      },
      {
        name: '7. Trabalhos de Reconciliação',
        description: 'Endpoints para criar e gerir trabalhos ("jobs") de reconciliação.'
      },
      {
        name: '8. Matches de Reconciliação',
        description: 'Endpoints para a gestão manual de matches (correspondências).'
      },
     
    ],
    servers: [
      {
        url: serverUrl,
        description: 'Servidor Principal',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, './src/routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
