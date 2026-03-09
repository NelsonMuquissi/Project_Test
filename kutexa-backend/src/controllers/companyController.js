const { sequelize } = require('../config/database');
const Company = require('../models/Company');
const User = require('../models/User');
const CompanyUser = require('../models/CompanyUser');
const BankAccount = require('../models/BankAccount');
const { ROLES } = require('../config/roles'); // <--- Importante

// 1. Criar Empresa
const createCompany = async (req, res, next) => {
    const { name, nif, email, phone, defaultCurrency } = req.body;
    const userId = req.user.id;
    const transaction = await sequelize.transaction();

    try {
        if (!name || !nif) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Nome e NIF são obrigatórios.' });
        }

        const newCompany = await Company.create({
            name, nif, email, phone, defaultCurrency: defaultCurrency || 'AOA'
        }, { transaction });

        // Quem cria é ADMIN
        await CompanyUser.create({
            userId,
            companyId: newCompany.id,
            role: ROLES.ADMIN
        }, { transaction });

        // Marcar onboarding como feito
        await User.update({ hasCompletedOnboarding: true }, { where: { id: userId }, transaction });

        await transaction.commit();

        return res.status(201).json({
            message: 'Empresa criada com sucesso!',
            company: newCompany
        });

    } catch (error) {
        await transaction.rollback();
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Já existe uma empresa com este NIF.' });
        }
        next(error);
    }
};

// 2. Listar Minhas Empresas
const getUserCompanies = async (req, res, next) => {
    const userId = req.user.id;
    try {
        const user = await User.findByPk(userId, {
            include: {
                model: Company,
                through: { attributes: ['role'] }
            }
        });

        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        // Formatar resposta
        const companies = user.Companies.map(c => ({
            id: c.id,
            name: c.name,
            nif: c.nif,
            role: c.CompanyUser.role // Retorna o papel do user nesta empresa
        }));

        return res.status(200).json(companies);
    } catch (error) {
        next(error);
    }
};

// 3. Detalhes (Só membros podem ver)
const getCompanyById = async (req, res, next) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        // Verificar se é membro
        const membership = await CompanyUser.findOne({ where: { userId, companyId: id } });
        if (!membership && req.user.role !== ROLES.SUPER_ADMIN) {
            return res.status(403).json({ error: 'Acesso não permitido.' });
        }

        const company = await Company.findByPk(id, {
            include: [BankAccount]
        });

        if (!company) return res.status(404).json({ error: 'Empresa não encontrada.' });

        return res.status(200).json(company);
    } catch (error) {
        next(error);
    }
};

// 4. Adicionar Conta (Gestor/Admin)
const addBankAccount = async (req, res, next) => {
    const userId = req.user.id;
    const { companyId } = req.params;
    const { bankName, accountNumber, iban, currency } = req.body;

    try {
        const membership = await CompanyUser.findOne({ where: { userId, companyId } });

        // Validação de Permissão (RBAC Local)
        const allowed = [ROLES.ADMIN, ROLES.GESTOR];
        if (!membership || !allowed.includes(membership.role)) {
            return res.status(403).json({ error: 'Apenas Gestores e Admins podem adicionar contas.' });
        }

        const newAccount = await BankAccount.create({
            bankName, accountNumber, iban, currency, companyId
        });

        return res.status(201).json(newAccount);
    } catch (error) {
        next(error);
    }
};

// 5. Adicionar Usuário (Só Admin)
const addUserToCompany = async (req, res, next) => {
    const requesterId = req.user.id;
    const { companyId } = req.params;
    const { userEmail, role } = req.body;

    // Validar se o role pedido existe no sistema
    const validRoles = Object.values(ROLES);
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Papel inválido.' });
    }

    try {
        // Verificar se quem pede é Admin desta empresa
        const requesterMembership = await CompanyUser.findOne({ where: { userId: requesterId, companyId } });

        if ((!requesterMembership || requesterMembership.role !== ROLES.ADMIN) && req.user.role !== ROLES.SUPER_ADMIN) {
            return res.status(403).json({ error: 'Apenas Administradores podem adicionar membros.' });
        }

        const userToAdd = await User.findOne({ where: { email: userEmail } });
        if (!userToAdd) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        // Se já existe, atualiza o papel; se não, cria.
        const [member, created] = await CompanyUser.findOrCreate({
            where: { userId: userToAdd.id, companyId },
            defaults: { role }
        });

        if (!created) {
            member.role = role;
            await member.save();
            return res.status(200).json({ message: 'Papel do usuário atualizado.' });
        }

        return res.status(201).json({ message: 'Usuário adicionado à empresa.' });

    } catch (error) {
        next(error);
    }
};

// 6. Listar Usuários
const getCompanyUsers = async (req, res, next) => {
    const { companyId } = req.params;
    try {
        // Buscar diretamente na tabela de junção (CompanyUser)
        // e incluir os dados do usuário (User)
        const companyUsers = await CompanyUser.findAll({
            where: { companyId },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email'] // Só o que interessa
            }]
        });

        // Formatar para ficar bonito
        const users = companyUsers.map(cu => ({
            id: cu.User.id,
            name: cu.User.name,
            email: cu.User.email,
            role: cu.role, // O papel vem da tabela de junção
            joinedAt: cu.createdAt
        }));

        return res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCompany,
    getUserCompanies,
    getCompanyById,
    addBankAccount,
    getCompanyUsers,
    addUserToCompany,
};