import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { useAlert } from "../contexts/AlertContext";
import API_URL from "../config/apiConfig";

export default function SubscriptionPage({ onLogout }) {
    const [license, setLicense] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activationKey, setActivationKey] = useState("");
    const [isActivating, setIsActivating] = useState(false);
    const { showNotification } = useAlert();

    useEffect(() => {
        fetchLicense();
    }, []);

    const fetchLicense = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/licenses/my-license`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLicense(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (e) => {
        e.preventDefault();
        if (!activationKey) return;

        setIsActivating(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${API_URL}/licenses/activate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ licenseKey: activationKey })
            });

            const data = await response.json();

            if (response.ok) {
                showNotification("Licença ativada com sucesso!", "success");
                setLicense(data.license);
                setActivationKey("");
                fetchLicense(); // Refresh
            } else {
                showNotification(data.error || "Erro ao ativar licença", "error");
            }
        } catch (err) {
            showNotification("Erro na conexão", "error");
        } finally {
            setIsActivating(false);
        }
    };

    return (
        <DashboardLayout onLogout={onLogout}>
            <div className="subscription-page-apple">
                <div className="page-header-apple">
                    <h1>Subscrição</h1>
                    <p>Gerencie seu plano e ative novos recursos.</p>
                </div>

                <div className="subs-grid">
                    <div className="plan-card glass-effect apple-shadow">
                        <div className="card-header">
                            <h3>Plano Atual</h3>
                            <span className={`status-pill ${license?.isActive ? 'active' : 'inactive'}`}>
                                {license?.isActive ? 'Ativo' : 'Nenhum'}
                            </span>
                        </div>

                        {loading ? (
                            <div className="loading-state">A carregar...</div>
                        ) : license ? (
                            <div className="plan-details">
                                <div className="plan-name">
                                    <i className="fas fa-gem icon-pro"></i>
                                    <span>{license.plan.toUpperCase()}</span>
                                </div>
                                <div className="details-list">
                                    <div className="detail">
                                        <label>Expira em</label>
                                        <span>{new Date(license.expiresAt).toLocaleDateString('pt-PT')}</span>
                                    </div>
                                    <div className="detail">
                                        <label>ID da Licença</label>
                                        <span className="mono">{license.key}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="no-plan-state">
                                <p>Não tem nenhuma subscrição ativa.</p>
                                <p className="small">Ative uma licença abaixo para desbloquear todos os recursos.</p>
                            </div>
                        )}
                    </div>

                    <div className="activate-card glass-effect apple-shadow">
                        <div className="card-header">
                            <h3>Ativar Licença</h3>
                        </div>
                        <form onSubmit={handleActivate} className="activation-form">
                            <p>Introduza a chave de licença enviada pela nossa equipa.</p>
                            <input
                                type="text"
                                placeholder="KUTEXA-XXXX-XXXX-XXXX"
                                value={activationKey}
                                onChange={(e) => setActivationKey(e.target.value)}
                                className="apple-input-large"
                                required
                            />
                            <button
                                type="submit"
                                className="apple-button-primary full-width"
                                disabled={isActivating}
                            >
                                {isActivating ? "A processar..." : "Ativar Agora"}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="available-plans">
                    <h4 className="section-title">Upgrade Disponíveis</h4>
                    <div className="plans-showcase">
                        <div className="showcase-item glass-effect">
                            <h5>Business Pro</h5>
                            <p>Transações ilimitadas, relatórios PDF avançados e suporte prioriatário.</p>
                        </div>
                        <div className="showcase-item glass-effect">
                            <h5>Enterprise</h5>
                            <p>Integração personalizada via API, multi-utilizador e auditoria completa.</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .subscription-page-apple { padding: 20px 0; }
                .subs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem; }
                
                .plan-card, .activate-card { padding: 2rem; border-radius: 24px; display: flex; flex-direction: column; }
                .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                
                .status-pill { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
                .status-pill.active { background: rgba(52, 199, 89, 0.1); color: #34C759; }
                .status-pill.inactive { background: rgba(255, 59, 48, 0.1); color: #FF3B30; }

                .plan-name { display: flex; align-items: center; gap: 10px; font-size: 1.8rem; font-weight: 700; color: var(--system-accent); margin-bottom: 2rem; }
                .icon-pro { font-size: 1.4rem; }
                
                .details-list .detail { display: flex; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--system-border); }
                .details-list .detail label { color: var(--system-text-secondary); }
                .mono { font-family: monospace; font-size: 0.9rem; }

                .no-plan-state { text-align: center; padding: 2rem 0; color: var(--system-text-secondary); }
                .no-plan-state .small { font-size: 0.85rem; margin-top: 0.5rem; }

                .activation-form { display: flex; flex-direction: column; gap: 1.5rem; }
                .activation-form p { color: var(--system-text-secondary); font-size: 0.9rem; }

                .available-plans { margin-top: 3rem; }
                .section-title { margin-bottom: 1.5rem; color: var(--system-text-secondary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
                .plans-showcase { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .showcase-item { padding: 1.5rem; border-radius: 16px; border: 1px dashed var(--system-border); }
                .showcase-item h5 { margin-bottom: 0.5rem; color: var(--system-accent); }
                .showcase-item p { font-size: 0.85rem; color: var(--system-text-secondary); }

                @media (max-width: 900px) {
                    .subs-grid, .plans-showcase { grid-template-columns: 1fr; }
                }
            `}</style>
        </DashboardLayout>
    );
}
