const express = require('express');
const { activateLicense, getMyLicense } = require('../controllers/licenseController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: 2. Licenças
 *   description: Endpoints para ativação e gestão da licença de uso do software.
 */

router.use(authenticateToken);

/**
 * @swagger
 * /licenses/activate:
 *   post:
 *     summary: Ativa uma chave de licença para o usuário logado.
 *     description: Associa uma chave de licença pré-existente e válida ao usuário autenticado. Este passo é obrigatório para desbloquear as funcionalidades principais da aplicação.
 *     tags: [2. Licenças]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [licenseKey]
 *             properties:
 *               licenseKey:
 *                 type: string
 *                 example: "KUTEXA-PRO-TESTE-2025"
 *     responses:
 *       200:
 *         description: Licença ativada com sucesso.
 *       400:
 *         description: Chave de licença em falta no corpo da requisição.
 *       404:
 *         description: A chave de licença fornecida não foi encontrada.
 *       409:
 *         description: A chave de licença já está em uso.
 */
router.post('/activate', activateLicense);

/**
 * @swagger
 * /licenses/my-license:
 *   get:
 *     summary: Obtém os detalhes da licença ativa do usuário logado.
 *     description: Retorna informações sobre a licença do usuário, como o plano e a data de expiração.
 *     tags: [2. Licenças]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detalhes da licença.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 key: { type: string }
 *                 plan: { type: string, enum: [basic, pro, enterprise] }
 *                 expiresAt: { type: string, format: date-time }
 *                 isActive: { type: boolean }
 *       404:
 *         description: Nenhuma licença ativa encontrada para o usuário.
 */
router.get('/my-license', getMyLicense);

module.exports = router;
