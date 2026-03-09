const express = require('express');
const { confirmMatch, rejectMatch } = require('../controllers/reconciliationController');
const { authenticateToken, checkRole } = require('../middlewares/authMiddleware');
const { ROLES } = require('../config/roles');

const router = express.Router();

const OPERATIONAL_ROLES = [ROLES.ANALISTA, ROLES.GESTOR, ROLES.ADMIN, ROLES.SUPER_ADMIN];

/**
 * @swagger
 * tags:
 *   name: 8. Matches de Reconciliação
 *   description: Endpoints para a gestão manual de matches (correspondências) sugeridos pela IA.
 */

router.use(authenticateToken);

/**
 * @swagger
 * /reconciliation-matches/{matchId}/confirm:
 *   post:
 *     summary: Confirma um match de reconciliação sugerido.
 *     description: Permite ao usuário aceitar uma correspondência sugerida, mudando o status do match para 'confirmed'.
 *     tags: [8. Matches de Reconciliação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         schema: { type: string, format: uuid }
 *         required: true
 *         description: O ID do match a ser confirmado.
 *     responses:
 *       200:
 *         description: Match confirmado com sucesso.
 */
router.post('/:matchId/confirm', 
    checkRole(OPERATIONAL_ROLES),
    confirmMatch
);

/**
 * @swagger
 * /reconciliation-matches/{matchId}/reject:
 *   post:
 *     summary: Rejeita um match de reconciliação sugerido.
 *     description: Permite ao usuário rejeitar uma correspondência sugerida, mudando o status do match para 'rejected'.
 *     tags: [8. Matches de Reconciliação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         schema: { type: string, format: uuid }
 *         required: true
 *         description: O ID do match a ser rejeitado.
 *     responses:
 *       200:
 *         description: Match rejeitado com sucesso.
 */
router.post('/:matchId/reject', 
    checkRole(OPERATIONAL_ROLES),
    rejectMatch
);

module.exports = router;
