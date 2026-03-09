const express = require('express');
const {
    uploadForReconciliation,
    getJobDetails,
    processReconciliationJob,
    getReconciliationResults,
    uploadErpTemplate,
    getJobMatches,
    processBatchMatches
} = require('../controllers/reconciliationController');
const { batchMatchAction, paramsJobId } = require('../validations/schemas');
const { exportJobReport } = require('../controllers/reportController');
const { authenticateToken, checkRole } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { uploadReconciliation, uploadErp, paramsId } = require('../validations/schemas');
const { upload } = require('../Upload/multerConfig');
const { ROLES } = require('../config/roles');

const OPERATIONAL_ROLES = [ROLES.ANALISTA, ROLES.GESTOR, ROLES.ADMIN, ROLES.SUPER_ADMIN];

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * /reconciliation-jobs/upload:
 *   post:
 *     summary: Faz o upload de ficheiros de extrato bancário e cria um novo trabalho de reconciliação.
 *     description: Recebe até 10 ficheiros (CSV, XLSX, OFX) e cria um 'Job' de reconciliação associado a uma empresa e a um período.
 *     tags: [7. Trabalhos de Reconciliação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               companyId: { type: string, format: uuid }
 *               periodStart: { type: string, format: date, example: "2025-11-01" }
 *               periodEnd: { type: string, format: date, example: "2025-11-30" }
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       202:
 *         description: Ficheiros recebidos e enfileirados para processamento.
 *       400:
 *         description: Dados em falta ou ficheiros inválidos.
 */
router.post('/upload',
    checkRole(OPERATIONAL_ROLES),
    upload.array('files', 5),
    validate(uploadReconciliation),
    uploadForReconciliation
);

/**
 * @swagger
 * /reconciliation-jobs/upload-erp:
 *   post:
 *     summary: Faz o upload de um ficheiro de template ERP e associa-o a um trabalho existente.
 *     description: Recebe um ficheiro (template CSV do ERP) e liga-o a um 'Job' de reconciliação já criado.
 *     tags: [7. Trabalhos de Reconciliação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               jobId: { type: string, format: uuid }
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       202:
 *         description: Template ERP recebido com sucesso.
 */
router.post('/upload-erp',
    validate(uploadErp),
    checkRole(OPERATIONAL_ROLES),
    upload.array('files', 10),
    uploadErpTemplate
);

/**
 * @swagger
 * /reconciliation-jobs/{jobId}:
 *   get:
 *     summary: Obtém os detalhes de um trabalho de reconciliação.
 *     description: Retorna informações detalhadas sobre um 'job' específico, incluindo a lista de ficheiros enviados.
 *     tags: [7. Trabalhos de Reconciliação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema: { type: string, format: uuid }
 *         required: true
 *         description: O ID do trabalho.
 *     responses:
 *       200:
 *         description: Detalhes do trabalho.
 */
router.get('/:jobId',
    validate(paramsJobId),
    checkRole(OPERATIONAL_ROLES),
    getJobDetails
);

/**
 * @swagger
 * /reconciliation-jobs/{jobId}/process:
 *   post:
 *     summary: (Simulação) Inicia o processamento de um trabalho de reconciliação.
 *     description: Dispara a lógica de processamento simulada que lê os ficheiros, cria transações e sugere matches. Num sistema real, isto seria uma tarefa assíncrona.
 *     tags: [7. Trabalhos de Reconciliação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema: { type: string, format: uuid }
 *         required: true
 *         description: O ID do trabalho a ser processado.
 *     responses:
 *       200:
 *         description: Trabalho processado com sucesso.
 */
router.post('/:jobId/process',
    validate(paramsJobId),
    checkRole(OPERATIONAL_ROLES),
    processReconciliationJob
);

/**
 * @swagger
 * /reconciliation-jobs/{jobId}/results:
 *   get:
 *     summary: Obtém os resultados de um trabalho de reconciliação processado.
 *     description: Retorna os resultados de um 'job' concluído, incluindo os matches sugeridos e as transações não reconciliadas.
 *     tags: [7. Trabalhos de Reconciliação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema: { type: string, format: uuid }
 *         required: true
 *         description: O ID do trabalho.
 *     responses:
 *       200:
 *         description: Resultados da reconciliação.
 */
router.get('/:jobId/results',
    validate(paramsJobId),
    checkRole(OPERATIONAL_ROLES),
    getReconciliationResults
);

/**
 * @swagger
 * /reconciliation-jobs/{jobId}/matches:
 *   get:
 *     summary: Lista os matches de um trabalho com paginação e filtros.
 *     description: Retorna a lista de correspondências (matches) encontradas pela IA para um job específico. Suporta paginação (page, pageSize) e filtros (status, confidence).
 *     tags: [7. Trabalhos de Reconciliação]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [suggested, confirmed, rejected] }
 *         description: Filtra pelo estado do match.
 *       - in: query
 *         name: confidence
 *         schema: { type: string, enum: [high, medium, low] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Lista de matches.
 */
router.get('/:jobId/matches',
    validate(paramsJobId),
    checkRole(OPERATIONAL_ROLES),
    getJobMatches
);


/**
 * @swagger
 * /reconciliation-jobs/{jobId}/matches/batch:
 *   post:
 *     summary: Confirma ou Rejeita múltiplos matches de uma vez.
 *     tags: [7. Trabalhos de Reconciliação]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action, matchIds]
 *             properties:
 *               action: { type: string, enum: [confirm, reject] }
 *               matchIds: { type: array, items: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Lote processado com sucesso.
 */
router.post('/:jobId/matches/batch',
    validate(paramsJobId),
    validate(batchMatchAction),
    checkRole(OPERATIONAL_ROLES),
    processBatchMatches
);

/**
 * @swagger
 * /reconciliation-jobs/{jobId}/reports/export:
 *   get:
 *     summary: Exporta um relatório detalhado de um trabalho em CSV.
 *     description: Gera e serve um ficheiro CSV para download, contendo todas as transações de um 'job' específico.
 *     tags: [7. Trabalhos de Reconciliação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema: { type: string, format: uuid }
 *         required: true
 *         description: O ID do trabalho a ser exportado.
 *     responses:
 *       200:
 *         description: Download do ficheiro CSV.
 */
router.get('/:jobId/reports/export',
    checkRole(OPERATIONAL_ROLES),
    exportJobReport
);


module.exports = router;
