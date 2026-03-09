const express = require('express');
const { markOnboardingAsComplete, getMyAuditLog } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware'); 

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: 3. Usuários
 *   description: Endpoints relacionados com a gestão da conta do usuário.
 */

router.use(authenticateToken);

/**
 * @swagger
 * /users/complete-onboarding:
 *   post:
 *     summary: Marca o onboarding inicial do usuário como concluído.
 *     description: Endpoint a ser chamado quando o usuário opta por 'pular' a configuração inicial ou após criar a sua primeira empresa, sinalizando que não deve ver mais a tela de onboarding.
 *     tags: [3. Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding marcado como concluído.
 */
router.post('/complete-onboarding', markOnboardingAsComplete);

/**
 * @swagger
 * /users/my-audit-log:
 *   get:
 *     summary: Obtém um log de auditoria simplificado para o usuário logado.
 *     description: Retorna uma lista das ações mais recentes realizadas pelo usuário, focada nos trabalhos de reconciliação que ele iniciou.
 *     tags: [3. Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Uma lista de eventos de log.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   action: { type: string }
 *                   details: { type: string }
 *                   status: { type: string }
 *                   timestamp: { type: string, format: date-time }
 */
router.get('/my-audit-log', getMyAuditLog);

module.exports = router;
