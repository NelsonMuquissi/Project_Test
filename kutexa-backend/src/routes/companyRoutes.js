const express = require('express');
const { createCompany, getUserCompanies, getCompanyById, getCompanyUsers, addUserToCompany } = require('../controllers/companyController');
const { addBankAccount, listAccounts, updateBankAccount, deleteBankAccount } = require('../controllers/bankAccountController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { getDashboardKPIs } = require('../controllers/reportController');
const { listJobsByCompany } = require('../controllers/reconciliationController');
const validate = require('../middlewares/validationMiddleware');
const { createCompany: createCompanySchema, paramsId, paramsCompanyId } = require('../validations/schemas');

const router = express.Router();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: 4. Empresas
 *   description: Gestão completa de empresas, incluindo membros e contas bancárias.
 */

router.use(authenticateToken);

/**
 * @swagger
 * /companies/:
 *   post:
 *     summary: Cria uma nova empresa.
 *     description: Registra uma nova entidade empresarial. O usuário que cria a empresa torna-se automaticamente o seu 'admin'.
 *     tags: [4. Empresas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, nif]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Minha Empresa, Lda."
 *               nif:
 *                 type: string
 *                 example: "500100200300"
 *               defaultCurrency:
 *                 type: string
 *                 example: "AOA"
 *     responses:
 *       201:
 *         description: Empresa criada com sucesso.
 *       409:
 *         description: Já existe uma empresa com este NIF.
 */
router.post('/', validate(createCompanySchema), createCompany);

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Lista as empresas do usuário logado.
 *     description: Retorna um array de todas as empresas às quais o usuário autenticado pertence.
 *     tags: [4. Empresas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empresas do usuário.
 */
router.get('/', getUserCompanies);

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Obtém os detalhes de uma empresa específica.
 *     description: Retorna os dados de uma empresa pelo seu ID, incluindo a lista de contas bancárias associadas, se o usuário tiver permissão.
 *     tags: [4. Empresas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string, format: uuid }
 *         required: true
 *         description: O ID da empresa.
 *     responses:
 *       200:
 *         description: Detalhes da empresa.
 *       404:
 *         description: Empresa não encontrada ou acesso não permitido.
 */
router.get('/:id', validate(paramsCompanyId), getCompanyById);

/**
 * @swagger
 * /companies/{companyId}/users:
 *   get:
 *     summary: Lista os usuários de uma empresa.
 *     description: Retorna uma lista de todos os usuários que são membros de uma empresa específica, juntamente com os seus papéis.
 *     tags: [4. Empresas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         schema: { type: string, format: uuid }
 *         required: true
 *         description: O ID da empresa.
 *     responses:
 *       200:
 *         description: Lista de usuários.
 *       403:
 *         description: Acesso não permitido.
 */
router.get('/:companyId/users', validate(paramsCompanyId), getCompanyUsers);

/**
 * @swagger
 * /companies/{companyId}/users:
 *   post:
 *     summary: Adiciona um usuário a uma empresa.
 *     description: Convida um usuário existente na plataforma para se juntar a uma empresa com um papel específico. Apenas 'admins' da empresa podem executar esta ação.
 *     tags: [4. Empresas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         schema: { type: string, format: uuid }
 *         required: true
 *         description: O ID da empresa.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userEmail, role]
 *             properties:
 *               userEmail:
 *                 type: string
 *                 format: email
 *                 example: "novo.membro@email.com"
 *               role:
 *                 type: string
 *                 enum: [admin, gestor, analista]
 *     responses:
 *       200:
 *         description: Usuário adicionado com sucesso.
 *       403:
 *         description: Apenas administradores podem adicionar usuários.
 *       404:
 *         description: Usuário com o e-mail fornecido não foi encontrado.
 */
router.post('/:companyId/users', addUserToCompany);

/**
 * @swagger
 * /companies/{companyId}/bank-accounts:
 *   post:
 *     summary: Adiciona uma nova conta bancária a uma empresa.
 *     description: Cria uma nova conta bancária e associa-a à empresa especificada. Apenas 'admins' e 'gestores' podem executar esta ação.
 *     tags: [4. Empresas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         schema: { type: string, format: uuid }
 *         required: true
 *         description: O ID da empresa.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bankName, accountNumber]
 *             properties:
 *               bankName: { type: string, example: "Banco BAI" }
 *               accountNumber: { type: string, example: "1234567890" }
 *               iban: { type: string, example: "AO06..." }
 *               currency: { type: string, example: "AOA" }
 *     responses:
 *       201:
 *         description: Conta bancária adicionada com sucesso.
 *       403:
 *         description: Permissão insuficiente.
 */
router.get('/:companyId/bank-accounts', listAccounts);
router.post('/:companyId/bank-accounts', addBankAccount);
router.put('/:companyId/bank-accounts/:id', updateBankAccount);
router.delete('/:companyId/bank-accounts/:id', deleteBankAccount);

/**
 * @swagger
 * /companies/{companyId}/reconciliation-jobs:
 *   get:
 *     summary: Lista os trabalhos de reconciliação de uma empresa
 *     description: Retorna o histórico de todos os 'jobs' de reconciliação para uma empresa específica. Suporta filtros, ordenação e paginação.
 *     tags: [4. Empresas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         schema: { type: string, format: uuid }
 *         required: true
 *         description: O ID da empresa.
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, processing, completed, failed] }
 *         description: "Filtra por status. Múltiplos valores podem ser separados por vírgula (ex: completed,failed)."
 *       - in: query
 *         name: sort
 *         schema: { type: string, example: "createdAt,desc" }
 *         description: "Campo para ordenação e direção (asc/desc), separados por vírgula."
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Lista de trabalhos de reconciliação.
 */
router.get('/:companyId/reconciliation-jobs', listJobsByCompany);

/**
 * @swagger
 * /companies/{companyId}/reports/kpis:
 *   get:
 *     summary: Obtém os KPIs para o dashboard de uma empresa
 *     description: Calcula e retorna um conjunto de métricas de desempenho chave para uma empresa, opcionalmente filtradas por um período.
 *     tags: [4. Empresas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         schema: { type: string, format: uuid }
 *         required: true
 *         description: O ID da empresa.
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *         description: Data de início do período (YYYY-MM-DD).
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *         description: Data de fim do período (YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: Objeto contendo os KPIs.
 */
router.get('/:companyId/reports/kpis', getDashboardKPIs);

module.exports = router;
