const express = require('express');
const { getTemplate } = require('../controllers/templateController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: 5. Templates
 *   description: Download de modelos CSV para importação de dados.
 */

router.use(authenticateToken);

/**
 * @swagger
 * /templates/{type}:
 *   get:
 *     summary: Baixa um modelo CSV de exemplo.
 *     description: Retorna um ficheiro CSV formatado corretamente para uso na importação.
 *     tags: [5. Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         schema: { type: string, enum: [bank_statement, erp_ledger] }
 *         required: true
 *         description: O tipo de template desejado.
 *     responses:
 *       200:
 *         description: Download do ficheiro CSV.
 *         content:
 *           text/csv:
 *             schema: { type: string }
 */
router.get('/:type', getTemplate);

module.exports = router;