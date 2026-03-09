const BankAccount = require('../models/BankAccount');
const CompanyUser = require('../models/CompanyUser');
const { ROLES } = require('../config/roles');

// Criar Conta
const addBankAccount = async (req, res, next) => {
    const { companyId } = req.params;
    const { bankName, accountNumber, iban, currency } = req.body;

    try {
        // Verificar Permissão (Analista não pode criar conta - PDF Tabela 1)
        const membership = await CompanyUser.findOne({ where: { userId: req.user.id, companyId } });

        // Apenas Admin e Gestor podem gerir contas
        const allowedRoles = [ROLES.ADMIN, ROLES.GESTOR, ROLES.SUPER_ADMIN];

        if (!membership || !allowedRoles.includes(membership.role)) {
            // Fallback: Se o user for Super Admin global, passa
            if (req.user.role !== ROLES.SUPER_ADMIN) {
                return res.status(403).json({ error: 'Sem permissão para gerir contas bancárias.' });
            }
        }

        const account = await BankAccount.create({
            companyId,
            bankName,
            accountNumber,
            iban,
            currency: currency || 'AOA'
        });

        return res.status(201).json(account);

    } catch (error) {
        next(error);
    }
};

// Atualizar Conta
const updateBankAccount = async (req, res, next) => {
    const { id } = req.params;
    const { bankName, accountNumber, iban, currency } = req.body;
    try {
        const account = await BankAccount.findByPk(id);
        if (!account) return res.status(404).json({ error: 'Conta bancária não encontrada.' });
        const membership = await CompanyUser.findOne({ where: { userId: req.user.id, companyId: account.companyId } });
        const allowedRoles = [ROLES.ADMIN, ROLES.GESTOR, ROLES.SUPER_ADMIN];
        if (!membership || !allowedRoles.includes(membership.role)) {
            if (req.user.role !== ROLES.SUPER_ADMIN) {
                return res.status(403).json({ error: 'Sem permissão para editar contas bancárias.' });
            }
        }
        await account.update({ bankName, accountNumber, iban, currency });
        return res.status(200).json(account);
    } catch (error) {
        next(error);
    }
};

// Listar Contas
const listAccounts = async (req, res, next) => {
    const { companyId } = req.params;
    try {
        // Qualquer membro da empresa pode ver as contas (para selecionar no upload)
        const membership = await CompanyUser.findOne({ where: { userId: req.user.id, companyId } });
        if (!membership && req.user.role !== ROLES.SUPER_ADMIN) {
            return res.status(403).json({ error: 'Acesso negado.' });
        }

        const accounts = await BankAccount.findAll({ where: { companyId } });
        return res.status(200).json(accounts);
    } catch (error) {
        next(error);
    }
};

const deleteBankAccount = async (req, res, next) => {
    const { id } = req.params;
    try {
        const account = await BankAccount.findByPk(id);
        if (!account) return res.status(404).json({ error: 'Conta bancária não encontrada.' });
        const membership = await CompanyUser.findOne({ where: { userId: req.user.id, companyId: account.companyId } });
        const allowedRoles = [ROLES.ADMIN, ROLES.GESTOR, ROLES.SUPER_ADMIN];
        if (!membership || !allowedRoles.includes(membership.role)) {
            if (req.user.role !== ROLES.SUPER_ADMIN) {
                return res.status(403).json({ error: 'Sem permissão para eliminar contas bancárias.' });
            }
        }
        await account.destroy();
        return res.status(200).json({ message: 'Conta bancária eliminada com sucesso.' });
    } catch (error) {
        next(error);
    }
};

module.exports = { addBankAccount, listAccounts, updateBankAccount, deleteBankAccount };