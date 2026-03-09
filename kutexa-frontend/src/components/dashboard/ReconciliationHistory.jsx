import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import API_URL from "../../config/apiConfig";

export default function ReconciliationHistory() {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showNotification } = useAlert();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            showNotification("Sessão expirada. Faça login novamente.", "error");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/companies/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Erro ao buscar empresas");

            const data = await response.json();
            setCompanies(data);
            if (data.length > 0) {
                setSelectedCompany(data[0].id);
                fetchJobs(data[0].id);
            }
        } catch (err) {
            console.error(err);
            showNotification("Erro ao carregar empresas", "error");
        }
    };

    const fetchJobs = async (companyId) => {
        if (!companyId) return;
        setLoading(true);
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/companies/${companyId}/reconciliation-jobs`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setJobs(data.rows || []);
            }
        } catch (err) {
            showNotification("Erro de conexão", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCompanyChange = (e) => {
        const cid = e.target.value;
        setSelectedCompany(cid);
        fetchJobs(cid);
    };

    return (
        <div className="history-page-apple">
            <div className="dashboard-header-apple">
                <div className="header-text">
                    <h1>Histórico</h1>
                    <p>Reveja e acompanhe todos os processos de reconciliação realizados.</p>
                </div>
            </div>

            <div className="filter-section-apple glass-effect apple-shadow">
                <div className="filter-group">
                    <label>Filtrar por Empresa</label>
                    <select
                        value={selectedCompany}
                        onChange={handleCompanyChange}
                        className="apple-select-large"
                    >
                        <option value="">Selecione uma empresa</option>
                        {companies.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="jobs-container glass-effect apple-shadow">
                {loading ? (
                    <div className="loading-state">
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>A carregar histórico...</span>
                    </div>
                ) : jobs.length > 0 ? (
                    <table className="apple-table">
                        <thead>
                            <tr>
                                <th>Data de Início</th>
                                <th>Período</th>
                                <th>Estado</th>
                                <th className="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <tr key={job.id}>
                                    <td>
                                        <div className="date-info">
                                            <span className="main-date">{new Date(job.createdAt).toLocaleDateString('pt-PT')}</span>
                                            <span className="sub-date">{new Date(job.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="period-pill">
                                            {new Date(job.periodStart).toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${job.status}`}>
                                            {job.status === 'completed' ? 'Concluído' : job.status}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <button
                                            onClick={() => navigate(`/reconciliation-history/${job.id}`)}
                                            className="btn-view"
                                        >
                                            Detalhes <i className="fas fa-chevron-right ml-2"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <i className="fas fa-search"></i>
                        <p>Nenhuma reconciliação encontrada.</p>
                    </div>
                )}
            </div>

            <style>{`
                .history-page-apple { padding: 20px 0; }
                .filter-section-apple { padding: 1.5rem; border-radius: var(--border-radius); margin-bottom: 2rem; display: flex; gap: 2rem; }
                .filter-group { display: flex; flex-direction: column; gap: 8px; flex: 1; max-width: 300px; }
                .filter-group label { font-size: 0.85rem; font-weight: 600; color: var(--system-text-secondary); }
                .apple-select-large { padding: 12px; border-radius: 10px; border: 1px solid var(--system-border); background: white; font-size: 1rem; outline: none; }
                
                .jobs-container { border-radius: var(--border-radius); overflow: hidden; }
                .loading-state, .empty-state { padding: 4rem; text-align: center; color: var(--system-text-secondary); }
                .loading-state i, .empty-state i { font-size: 2rem; margin-bottom: 1rem; display: block; }
                
                .date-info { display: flex; flex-direction: column; }
                .main-date { font-weight: 600; color: var(--system-text); }
                .sub-date { font-size: 0.8rem; color: var(--system-text-secondary); }
                
                .period-pill { padding: 4px 12px; background: rgba(0, 113, 227, 0.05); color: var(--system-accent); border-radius: 20px; font-size: 0.85rem; font-weight: 500; display: inline-block; }
                
                .btn-view { background: transparent; border: 1px solid var(--system-accent); color: var(--system-accent); padding: 8px 16px; border-radius: 20px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
                .btn-view:hover { background: var(--system-accent); color: white; }
                
                .text-right { text-align: right; }
                .ml-2 { margin-left: 8px; }
            `}</style>
        </div>
    );
}
