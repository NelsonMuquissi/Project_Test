import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { useAlert } from "../contexts/AlertContext";
import API_URL from "../config/apiConfig";

export default function ReportsSummaryPage({ onLogout }) {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [kpis, setKpis] = useState(null);
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
                if (data.length > 0) {
                    setSelectedCompany(data[0].id);
                    fetchKPIs(data[0].id);
                }
            }
        } catch (err) {
            showNotification("Erro ao buscar empresas", "error");
        }
    };

    const fetchKPIs = async (companyId) => {
        if (!companyId) return;
        setLoading(true);
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/companies/${companyId}/reports/kpis`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setKpis(data.kpis);
            }
        } catch (err) {
            showNotification("Erro ao carregar indicadores", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCompanyChange = (e) => {
        const cid = e.target.value;
        setSelectedCompany(cid);
        fetchKPIs(cid);
    };

    return (
        <DashboardLayout onLogout={onLogout}>
            <div className="reports-page-apple">
                <div className="page-header-apple">
                    <h1>Resumo de Relatórios</h1>
                    <p>Visão geral consolidada dos seus indicadores de reconciliação.</p>
                </div>

                <div className="filter-section-apple glass-effect apple-shadow">
                    <div className="filter-group">
                        <label>Selecionar Empresa</label>
                        <select
                            value={selectedCompany}
                            onChange={handleCompanyChange}
                            className="apple-select-large"
                        >
                            <option value="">Selecione...</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state-large">A processar dados...</div>
                ) : kpis ? (
                    <div className="reports-grid">
                        <div className="report-card glass-effect apple-shadow">
                            <span className="card-label">Eficiência de Match</span>
                            <div className="card-value-group">
                                <span className="card-value">{kpis.matchRate}%</span>
                                <div className="progress-bar-container">
                                    <div className="progress-bar-fill" style={{ width: `${kpis.matchRate}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="report-card glass-effect apple-shadow">
                            <span className="card-label">Volume de Reconciliações</span>
                            <span className="card-value">{kpis.totalJobs}</span>
                            <p className="card-subtext">{kpis.completedJobs} concluídas</p>
                        </div>

                        <div className="report-card glass-effect apple-shadow">
                            <span className="card-label">Transações Pendentes</span>
                            <span className="card-value orange">{kpis.pendingTransactions}</span>
                            <p className="card-subtext">A aguardar atenção</p>
                        </div>

                        <div className="report-card glass-effect apple-shadow">
                            <span className="card-label">Matches Confirmados</span>
                            <span className="card-value green">{kpis.confirmedMatches}</span>
                            <p className="card-subtext">De um total de {kpis.totalMatches}</p>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state-large">
                        <i className="fas fa-chart-line"></i>
                        <p>Selecione uma empresa para visualizar o relatório.</p>
                    </div>
                )}
            </div>

            <style>{`
                .reports-page-apple { padding: 20px 0; }
                .filter-section-apple { padding: 1.5rem; border-radius: 20px; margin-bottom: 2rem; max-width: 400px; }
                .filter-group { display: flex; flex-direction: column; gap: 8px; }
                .filter-group label { font-size: 0.85rem; font-weight: 600; color: var(--system-text-secondary); }

                .reports-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
                .report-card { padding: 2rem; border-radius: 24px; display: flex; flex-direction: column; gap: 1rem; }
                
                .card-label { font-size: 0.9rem; font-weight: 500; color: var(--system-text-secondary); }
                .card-value { font-size: 2.5rem; font-weight: 700; color: var(--system-text); }
                .card-value.orange { color: #FF9500; }
                .card-value.green { color: #34C759; }
                
                .card-subtext { font-size: 0.85rem; color: var(--system-text-tertiary); }
                
                .progress-bar-container { height: 8px; background: rgba(0, 0, 0, 0.05); border-radius: 4px; margin-top: 1rem; overflow: hidden; }
                .progress-bar-fill { height: 100%; background: var(--system-accent); border-radius: 4px; transition: width 1s ease-out; }

                .loading-state-large, .empty-state-large { padding: 6rem; text-align: center; color: var(--system-text-secondary); }
                .empty-state-large i { font-size: 3rem; margin-bottom: 1rem; color: var(--system-border); }
            `}</style>
        </DashboardLayout>
    );
}
