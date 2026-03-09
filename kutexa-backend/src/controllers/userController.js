const User = require('../models/User');
const ReconciliationJob = require('../models/ReconciliationJob');
const Company = require('../models/Company');
const { parseQueryOptions } = require('../utils/queryHelper');

const markOnboardingAsComplete = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        user.hasCompletedOnboarding = true;
        await user.save();

        return res.status(200).json({
            message: 'Onboarding marcado como concluído.',
            user: {
                id: user.id,
                hasCompletedOnboarding: user.hasCompletedOnboarding
            }
        });

    } catch (error) {
        console.error('Erro ao marcar onboarding como concluído:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

const getMyAuditLog = async (req, res) => {
    const userId = req.user.id;

    try {
         const queryOptions = parseQueryOptions(req.query);
        queryOptions.where.userId = userId; 
        
        queryOptions.include = [{
            model: Company,
            attributes: ['id', 'name']
        }];

        const { count, rows } = await ReconciliationJob.findAndCountAll(queryOptions);

        const auditLog = rows.map(job => ({
            action: `Iniciou trabalho de reconciliação (#${job.id.split('-')[0]})`,
            details: `Empresa: ${job.Company.name}`,
            status: job.status,
            timestamp: job.createdAt
        }));
	
	res.setHeader('X-Total-Count', count);
        return res.status(200).json(auditLog);

    } catch (error) {
        console.error('Erro ao buscar log de auditoria:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

module.exports = {
    markOnboardingAsComplete,
    getMyAuditLog,
};
