import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { useAlert } from "../contexts/AlertContext";
import API_URL from "../config/apiConfig";

export default function ProfilePage({ onLogout }) {
    const [user, setUser] = useState(null);
    const [auditLog, setAuditLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useAlert();

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        const token = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (!token || !storedUser) {
            onLogout();
            return;
        }

        setUser(storedUser);

        try {
            const response = await fetch(`${API_URL}/users/me/audit-log`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAuditLog(data);
            }
        } catch (err) {
            console.error(err);
            showNotification("Erro ao carregar histórico de atividades", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout onLogout={onLogout}>
            <div className="profile-page-apple">
                <div className="page-header-apple">
                    <h1>O meu Perfil</h1>
                    <p>Gerencie suas informações pessoais e visualize sua atividade.</p>
                </div>

                <div className="profile-grid">
                    <div className="profile-card glass-effect apple-shadow">
                        <div className="profile-avatar">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="profile-info">
                            <h3>{user?.name || "Utilizador"}</h3>
                            <p className="email">{user?.email}</p>
                            <span className="role-tag">{user?.role || "Utilizador"}</span>
                        </div>
                        <div className="profile-details-list">
                            <div className="detail-item">
                                <label>Membro desde</label>
                                <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-PT') : "---"}</span>
                            </div>
                            <div className="detail-item">
                                <label>Onboarding</label>
                                <span>{user?.hasCompletedOnboarding ? "Concluído" : "Pendente"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="activity-card glass-effect apple-shadow">
                        <div className="card-header">
                            <h3>Histórico de Atividade</h3>
                        </div>
                        <div className="activity-list">
                            {loading ? (
                                <div className="loading-inline">A carregar...</div>
                            ) : auditLog.length > 0 ? (
                                auditLog.map((log, index) => (
                                    <div key={index} className="activity-item">
                                        <div className="activity-dot"></div>
                                        <div className="activity-content">
                                            <p className="action">{log.action}</p>
                                            <p className="details">{log.details}</p>
                                            <span className="time">{new Date(log.timestamp).toLocaleString('pt-PT')}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-activity">Nenhuma atividade recente.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .profile-page-apple { padding: 20px 0; }
                .profile-grid { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; margin-top: 2rem; }
                
                .profile-card { padding: 2.5rem; border-radius: 24px; text-align: center; height: fit-content; }
                .profile-avatar { 
                    width: 100px; height: 100px; border-radius: 50%; background: var(--system-accent); 
                    color: white; font-size: 2.5rem; font-weight: 600; display: flex; align-items: center; 
                    justify-content: center; margin: 0 auto 1.5rem; 
                }
                .profile-info h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
                .profile-info .email { color: var(--system-text-secondary); margin-bottom: 1rem; }
                .role-tag { 
                    padding: 4px 12px; background: rgba(0, 113, 227, 0.1); color: var(--system-accent); 
                    border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase;
                }
                
                .profile-details-list { margin-top: 2rem; text-align: left; border-top: 1px solid var(--system-border); padding-top: 2rem; }
                .detail-item { display: flex; justify-content: space-between; margin-bottom: 1rem; }
                .detail-item label { color: var(--system-text-secondary); font-size: 0.9rem; }
                .detail-item span { font-weight: 500; font-size: 0.9rem; }

                .activity-card { border-radius: 24px; overflow: hidden; display: flex; flex-direction: column; }
                .activity-card .card-header { padding: 1.5rem 2rem; border-bottom: 1px solid var(--system-border); }
                .activity-list { padding: 2rem; max-height: 500px; overflow-y: auto; }
                
                .activity-item { display: flex; gap: 1.5rem; margin-bottom: 2rem; position: relative; }
                .activity-item::before { 
                    content: ''; position: absolute; left: 6px; top: 20px; bottom: -25px; 
                    width: 2px; background: var(--system-border); 
                }
                .activity-item:last-child::before { display: none; }
                
                .activity-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--system-accent); margin-top: 4px; z-index: 1; }
                .activity-content { flex: 1; }
                .activity-content .action { font-weight: 600; margin-bottom: 4px; }
                .activity-content .details { font-size: 0.9rem; color: var(--system-text-secondary); margin-bottom: 4px; }
                .activity-content .time { font-size: 0.8rem; color: var(--system-text-tertiary); }

                @media (max-width: 1024px) {
                    .profile-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </DashboardLayout>
    );
}
