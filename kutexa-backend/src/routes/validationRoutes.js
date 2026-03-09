const express = require('express');
const { previewFile } = require('../controllers/validationController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { upload } = require('../Upload/multerConfig');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: 6. Validações e Data Quality
 *   description: Endpoints para verificar integridade de arquivos antes do processamento.
 */

router.use(authenticateToken);

/**
 * @swagger
 * /validations/preview:
 *   post:
 *     summary: Valida um ficheiro CSV e retorna estatísticas (Dry-Run).
 *     description: Faz o upload temporário, analisa a qualidade dos dados (formato de data, números) e retorna erros sem salvar nada no banco de dados.
 *     tags: [6. Validações e Data Quality]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type: 
 *                 type: string
 *                 enum: [bank_statement, erp_ledger]
 *                 description: Tipo de arquivo para aplicar as regras corretas.
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Análise concluída com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 qualityScore: { type: integer, description: "Percentagem de linhas válidas (0-100)" }
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     rowsTotal: { type: integer }
 *                     rowsValid: { type: integer }
 *                     rowsInvalid: { type: integer }
 *                     errors: { type: array, items: { type: string } }
 *       400:
 *         description: Ficheiro inválido ou erro de formato.
 */
router.post('/preview', upload.array('files', 1), previewFile);

module.exports = router;