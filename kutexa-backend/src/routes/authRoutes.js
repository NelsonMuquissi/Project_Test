const express = require('express');
const { register, login, confirmEmail, logout, refreshToken  } = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware'); 
const validate = require('../middlewares/validationMiddleware');
const { authRegister, authLogin } = require('../validations/schemas');
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({ windowMs:15*60*1000, max:10, message: { error: 'Too many attempts' }});

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: 1. Autenticação
 *   description: Endpoints para registro de novos usuários, login, confirmação de e-mail e logout. Este é o ponto de partida para qualquer interação com a API.
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário na plataforma.
 *     description: Cria uma nova conta de usuário. Após o sucesso, um e-mail de confirmação é enviado para o endereço fornecido, contendo um link para ativar a conta.
 *     tags: [1. Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, phone_number]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao.silva@email.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: "A senha deve ter uma complexidade mínima (a ser definida no frontend)."
 *                 example: "SenhaSegura123"
 *               phone_number:
 *                 type: string
 *                 description: "Número de telefone angolano válido, começando com +244."
 *                 example: "+244923456789"
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso. Um link de confirmação foi enviado.
 *       400:
 *         description: Erro de validação. Dados em falta ou em formato incorreto.
 *       409:
 *         description: Conflito. O e-mail ou número de telefone já existem na base de dados.
 */
router.post('/register',authLimiter, validate(authRegister), register);

/**
 * @swagger
 * /auth/confirm-email:
 *   get:
 *     summary: Confirma o e-mail de um usuário através de um token.
 *     description: Endpoint ativado pelo link enviado por e-mail após o registro. Valida o token e o e-mail, e ativa a conta do usuário, permitindo o login.
 *     tags: [1. Autenticação]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema: { type: string }
 *         required: true
 *         description: O token de confirmação recebido no link de e-mail.
 *       - in: query
 *         name: email
 *         schema: { type: string }
 *         required: true
 *         description: O e-mail do usuário a ser confirmado.
 *     responses:
 *       200:
 *         description: E-mail confirmado com sucesso. O usuário já pode fazer login.
 *       400:
 *         description: Token/e-mail inválido, expirado ou em falta nos parâmetros.
 */
router.get('/confirm-email', confirmEmail);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica um usuário e retorna um token de acesso JWT.
 *     description: Valida as credenciais (e-mail e senha) de um usuário. Se forem válidas e o e-mail estiver confirmado, retorna um `access_token` que deve ser usado para autenticar todas as requisições subsequentes.
 *     tags: [1. Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao.silva@email.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SenhaSegura123"
 *     responses:
 *       200:
 *         description: Autenticação bem-sucedida.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token: { type: string }
 *                 token_type: { type: string, example: "bearer" }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     name: { type: string }
 *                     email: { type: string }
 *                     hasCompletedOnboarding: { type: boolean }
 *       401:
 *         description: Credenciais inválidas (e-mail ou senha incorretos).
 *       403:
 *         description: Proibido. O usuário ainda não confirmou o seu e-mail.
 */
router.post('/login', authLimiter, validate(authLogin), login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renova o Access Token usando um Refresh Token.
 *     tags: [1. Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [requestToken]
 *             properties:
 *               requestToken: { type: string }
 *     responses:
 *       200:
 *         description: Novo token gerado.
 *       403:
 *         description: Refresh Token inválido ou expirado.
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Efetua o logout do usuário.
 *     description: Sinaliza ao cliente que a sessão deve ser encerrada. O cliente é responsável por apagar o token JWT armazenado localmente.
 *     tags: [1. Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout bem-sucedido.
 *       401:
 *         description: Não autorizado (token em falta ou inválido).
 */
router.post('/logout', authenticateToken, logout);


module.exports = router;
