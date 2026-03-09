import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "./DashboardLayout";
import { useAlert } from "../contexts/AlertContext";
import API_URL from "../config/apiConfig";

export default function TeamPage({ onLogout }) {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showNotification } = useAlert();

    // Novas estados para modais
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('invite'); // 'invite' | 'edit'
    const [formData, setFormData] = useState({ email: "", role: "analista" });
    const [targetMember, setTargetMember] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/companies/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCompanies(data);
                if (data.length > 0) setSelectedCompany(data[0].id);
            }
        } catch (err) {
            showNotification("Erro ao buscar empresas", "error");
        }
    };

    const fetchTeam = useCallback(async (companyId) => {
        if (!companyId) return;
        setLoading(true);
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/companies/${companyId}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTeam(data);
            }
        } catch (err) {
            showNotification("Erro ao carregar equipa", "error");
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        if (selectedCompany) fetchTeam(selectedCompany);
    }, [selectedCompany, fetchTeam]);

    const handleAction = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${API_URL}/companies/${selectedCompany}/users`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userEmail: formData.email,
                    role: formData.role
                })
            });

            if (response.ok) {
                showNotification(modalType === 'invite' ? "Convite enviado com sucesso!" : "Membro atualizado!", "success");
                setShowModal(false);
                fetchTeam(selectedCompany);
            } else {
                const errorData = await response.json();
                showNotification(errorData.error || "Erro ao processar ação", "error");
            }
        } catch (err) {
            showNotification("Erro de conexão", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const openModal = (type, member = null) => {
        setModalType(type);
        setTargetMember(member);
        if (type === 'edit' && member) {
            setFormData({ email: member.email, role: member.role || 'analista' });
        } else {
            setFormData({ email: "", role: "analista" });
        }
        setShowModal(true);
    };

    return (
        <DashboardLayout onLogout={onLogout}>
            <div className="team-page-apple">
                <div className="page-header-apple">
                    <h1>Gestão de Equipa</h1>
                    <p>Administre os membros e níveis de acesso por empresa.</p>
                </div>

                <div className="team-controls glass-effect apple-shadow">
                    <div className="filter-group">
                        <label>Selecionar Empresa</label>
                        <select
                            value={selectedCompany}
                            onChange={(e) => setSelectedCompany(e.target.value)}
                            className="apple-select-large"
                        >
                            <option value="">Selecione...</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        className="apple-button-primary"
                        onClick={() => openModal('invite')}
                        disabled={!selectedCompany}
                    >
                        Convidar Membro
                    </button>
                </div>

                <div className="team-container glass-effect apple-shadow">
                    {loading ? (
                        <div className="loading-state">A carregar equipa...</div>
                    ) : team.length > 0 ? (
                        <table className="apple-table">
                            <thead>
                                <tr>
                                    <th>Membro</th>
                                    <th>E-mail</th>
                                    <th>Nível de Acesso</th>
                                    <th className="text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {team.map(member => (
                                    <tr key={member.id}>
                                        <td>
                                            <div className="member-cell">
                                                <div className="member-avatar-small">{member.name?.charAt(0)}</div>
                                                <span>{member.name || 'Pendente'}</span>
                                            </div>
                                        </td>
                                        <td>{member.email}</td>
                                        <td>
                                            <span className={`role-pill ${member.role}`}>
                                                {member.role || 'Membro'}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <button
                                                className="apple-button-secondary py-1 px-3"
                                                onClick={() => openModal('edit', member)}
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">Nenhum membro encontrado para esta empresa.</div>
                    )}
                </div>
            </div>

            {/* Modal de Ação */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box glass-effect apple-shadow" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalType === 'invite' ? 'Convidar Membro' : 'Editar Membro'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleAction}>
                            <div className="form-group">
                                <label>E-mail do Utilizador</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="exemplo@email.com"
                                    value={formData.email}
                                    disabled={modalType === 'edit'}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Nível de Acesso</label>
                                <select
                                    className="apple-select-large w-full"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="admin">Administrador</option>
                                    <option value="gestor">Gestor</option>
                                    <option value="analista">Analista</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="apple-button-primary" disabled={submitting}>
                                    {submitting ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
                                    {modalType === 'invite' ? 'Enviar Convite' : 'Guardar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .team-page-apple { padding: 20px 0; }
                .team-controls { padding: 1.5rem 2rem; border-radius: 20px; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; }
                .filter-group { display: flex; flex-direction: column; gap: 8px; flex: 1; max-width: 300px; }
                .filter-group label { font-size: 0.85rem; font-weight: 600; color: var(--system-text-secondary); }

                .team-container { border-radius: 24px; overflow: hidden; }
                
                .member-cell { display: flex; align-items: center; gap: 12px; }
                .member-avatar-small { width: 32px; height: 32px; border-radius: 50%; background: var(--system-accent); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }
                
                .role-pill { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
                .role-pill.admin { background: rgba(0, 113, 227, 0.1); color: var(--system-accent); }
                .role-pill.gestor { background: rgba(52, 199, 89, 0.1); color: var(--system-success); }
                .role-pill.analista { background: rgba(0, 0, 0, 0.05); color: var(--system-text-secondary); }

                .loading-state, .empty-state { padding: 4rem; text-align: center; color: var(--system-text-secondary); }
                .text-right { text-align: right; }

                /* Modal Adjustments */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
                .modal-box { background: #1c1c1e; border-radius: 24px; padding: 2.5rem; width: 90%; max-width: 440px; border: 1px solid rgba(255,255,255,0.1); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .modal-header h2 { font-size: 1.5rem; font-weight: 700; color: white; margin: 0; }
                .modal-close { background: rgba(255,255,255,0.05); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
                .form-group input, .form-group select { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white; font-size: 1rem; outline: none; box-sizing: border-box; }
                .form-group input:focus { border-color: var(--system-accent); background: rgba(255,255,255,0.08); }
                .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 2rem; }
                .btn-secondary { background: rgba(255,255,255,0.05); border: none; padding: 12px 24px; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .btn-secondary:hover { background: rgba(255,255,255,0.1); }
                .w-full { width: 100%; }
            `}</style>
        </DashboardLayout>
    );
}

