import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { useAlert } from "../contexts/AlertContext";
import API_URL from "../config/apiConfig";

export default function ReportsExportsPage({ onLogout }) {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showNotification } = useAlert();

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

    useEffect(() => {
        if (selectedCompany) fetchJobs(selectedCompany);
    }, [selectedCompany]);

    const fetchJobs = async (companyId) => {
        setLoading(true);
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/companies/${companyId}/reconciliation-jobs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setJobs(data.rows || []);
            }
        } catch (err) {
            showNotification("Erro ao carregar processos", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (jobId) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/reports/export-job/${jobId}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Relatorio_Kutexa_${jobId}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                showNotification("Exportação concluída!", "success");
            } else {
                showNotification("Erro ao exportar arquivo", "error");
            }
        } catch (err) {
            showNotification("Erro na conexão", "error");
        }
    };

    return (
        <DashboardLayout onLogout={onLogout}>
            <div className="exports-page-apple">
                <div className="page-header-apple">
                    <h1>Exportações</h1>
                    <p>Descarregue relatórios detalhados em formato CSV para análise externa.</p>
                </div>

                <div className="filter-section-apple glass-effect apple-shadow">
                    <div className="filter-group">
                        <label>Empresa</label>
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
                </div>

                <div className="exports-container glass-effect apple-shadow">
                    {loading ? (
                        <div className="loading-state">A carregar processos...</div>
                    ) : jobs.length > 0 ? (
                        <table className="apple-table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Período</th>
                                    <th>Estado</th>
                                    <th className="text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map(job => (
                                    <tr key={job.id}>
                                        <td>{new Date(job.createdAt).toLocaleDateString('pt-PT')}</td>
                                        <td>{new Date(job.periodStart).toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })}</td>
                                        <td>
                                            <span className={`status-pill ${job.status}`}>
                                                {job.status === 'completed' ? 'Concluído' : 'Processando'}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <button
                                                onClick={() => handleExport(job.id)}
                                                className="apple-button-secondary py-1 px-4"
                                            >
                                                Exportar CSV <i className="fas fa-download ml-2"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">Nenhum processo disponível para exportação.</div>
                    )}
                </div>
            </div>

            <style>{`
                .exports-page-apple { padding: 20px 0; }
                .filter-section-apple { padding: 1.5rem; border-radius: 20px; margin-bottom: 2rem; max-width: 300px; }
                .exports-container { border-radius: 24px; overflow: hidden; }
                
                .status-pill { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
                .status-pill.completed { background: rgba(52, 199, 89, 0.1); color: #34C759; }
                .status-pill.processing { background: rgba(0, 113, 227, 0.1); color: var(--system-accent); }

                .loading-state, .empty-state { padding: 4rem; text-align: center; color: var(--system-text-secondary); }
                .text-right { text-align: right; }
                .ml-2 { margin-left: 8px; }
            `}</style>
        </DashboardLayout>
    );
}
