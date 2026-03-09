import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import API_URL from "../../config/apiConfig";

export default function ReconciliationDetails() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useAlert();

    const [jobContext, setJobContext] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const fetchJobDetails = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/reconciliation-jobs/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setJobContext(data);
            }
        } catch (err) {
            console.error("Erro ao carregar detalhes", err);
        }
    }, [jobId]);

    const fetchMatches = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/reconciliation-jobs/${jobId}/matches`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMatches(data.rows || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        fetchJobDetails();
        fetchMatches();
    }, [fetchJobDetails, fetchMatches]);

    const handleProcessJob = async () => {
        setProcessing(true);
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/reconciliation-jobs/${jobId}/process`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                showNotification("✅ Processamento concluído com sucesso!", "success");
                fetchJobDetails();
                fetchMatches();
            } else {
                showNotification("Erro ao processar reconciliação", "error");
            }
        } catch (err) {
            showNotification("Erro de conexão", "error");
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed': return <span className="badge badge-success">Concluído</span>;
            case 'confirmed': return <span className="badge badge-success">Confirmado</span>;
            case 'suggested': return <span className="badge badge-info">Sugerido</span>;
            case 'pending': return <span className="badge badge-warning">Pendente</span>;
            case 'processing': return <span className="badge badge-info pulse">Processando...</span>;
            case 'failed': return <span className="badge badge-danger">Falhou</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(val);
    };

    if (loading) return <div className="loading-container-apple">A carregar detalhes...</div>;

    return (
        <div className="reconciliation-details-apple">
            <div className="details-header-apple">
                <button onClick={() => navigate('/reconciliation-history')} className="btn-back-apple">
                    <i className="fas fa-arrow-left"></i> Voltar
                </button>
                <div className="header-main">
                    <h2>Detalhes da Reconciliação</h2>
                    {jobContext?.status === 'pending' && (
                        <button
                            className="apple-button-primary"
                            onClick={handleProcessJob}
                            disabled={processing}
                        >
                            {processing ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-play mr-2"></i>}
                            {processing ? "A Processar..." : "Processar Agora"}
                        </button>
                    )}
                </div>
            </div>

            {jobContext && (
                <div className="stats-grid-apple">
                    <div className="stat-card glass-effect apple-shadow">
                        <span className="stat-label">Estado</span>
                        <div className="stat-value">{getStatusBadge(jobContext.status)}</div>
                    </div>
                    <div className="stat-card glass-effect apple-shadow">
                        <span className="stat-label">Período</span>
                        <div className="stat-value small">{new Date(jobContext.periodStart).toLocaleDateString()} - {new Date(jobContext.periodEnd).toLocaleDateString()}</div>
                    </div>
                    <div className="stat-card glass-effect apple-shadow">
                        <span className="stat-label">Total Extrato</span>
                        <div className="stat-value">{jobContext.stats?.totalBank || 0}</div>
                    </div>
                    <div className="stat-card glass-effect apple-shadow">
                        <span className="stat-label">Total ERP</span>
                        <div className="stat-value">{jobContext.stats?.totalErp || 0}</div>
                    </div>
                </div>
            )}

            <div className="matches-section-apple glass-effect apple-shadow">
                <div className="section-header">
                    <h3>Matches Encontrados ({matches.length})</h3>
                </div>

                {matches.length > 0 ? (
                    <div className="table-responsive-apple">
                        <table className="apple-table-details">
                            <thead>
                                <tr>
                                    <th>Extrato Bancário</th>
                                    <th className="text-center">Match</th>
                                    <th>ERP / Fatura</th>
                                    <th className="text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.map((match) => (
                                    <tr key={match.id}>
                                        <td className="tx-cell">
                                            {match.bankTransaction ? (
                                                <div className="tx-info">
                                                    <span className="tx-date">{new Date(match.bankTransaction.date).toLocaleDateString('pt-PT')}</span>
                                                    <span className="tx-desc">{match.bankTransaction.description}</span>
                                                    <span className={`tx-amount ${match.bankTransaction.amount < 0 ? 'neg' : 'pos'}`}>
                                                        {formatCurrency(match.bankTransaction.amount)}
                                                    </span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="match-cell text-center">
                                            {getStatusBadge(match.status)}
                                            <span className="confidence-label">Conf: {Math.round(match.confidenceScore * 100)}%</span>
                                        </td>
                                        <td className="tx-cell border-left">
                                            {match.erpTransaction ? (
                                                <div className="tx-info">
                                                    <span className="tx-date">{new Date(match.erpTransaction.date).toLocaleDateString('pt-PT')}</span>
                                                    <span className="tx-desc">{match.erpTransaction.description}</span>
                                                    <span className={`tx-amount ${match.erpTransaction.amount < 0 ? 'neg' : 'pos'}`}>
                                                        {formatCurrency(match.erpTransaction.amount)}
                                                    </span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="text-right actions-cell">
                                            <button className="icon-btn success"><i className="fas fa-check"></i></button>
                                            <button className="icon-btn danger"><i className="fas fa-times"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state-card">
                        <i className="fas fa-search-dollar"></i>
                        <p>Nenhum match foi encontrado ou gerado ainda para esta reconciliação.</p>
                        {jobContext?.status === 'pending' && <p className="small">Clique em "Processar Agora" para iniciar o motor de IA.</p>}
                    </div>
                )}
            </div>

            <style>{`
                .reconciliation-details-apple { padding: 10px 0; }
                .details-header-apple { margin-bottom: 2rem; }
                .btn-back-apple { background: transparent; border: none; color: var(--system-text-secondary); cursor: pointer; padding: 0; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; font-weight: 500; }
                .header-main { display: flex; justify-content: space-between; align-items: center; }
                .header-main h2 { margin: 0; font-size: 1.8rem; font-weight: 700; }

                .stats-grid-apple { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
                .stat-card { padding: 1.5rem; border-radius: 20px; display: flex; flex-direction: column; gap: 8px; }
                .stat-label { font-size: 0.8rem; font-weight: 600; color: var(--system-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
                .stat-value { font-size: 1.4rem; font-weight: 700; color: var(--system-text); }
                .stat-value.small { font-size: 1rem; }

                .matches-section-apple { border-radius: 24px; overflow: hidden; padding: 0; }
                .section-header { padding: 1.5rem 2rem; border-bottom: 1px solid var(--system-border); }
                .section-header h3 { margin: 0; font-size: 1.2rem; }

                .apple-table-details { width: 100%; border-collapse: collapse; }
                .apple-table-details th { text-align: left; padding: 1rem 2rem; background: rgba(0,0,0,0.02); color: var(--system-text-secondary); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
                .apple-table-details td { padding: 1.2rem 2rem; border-bottom: 1px solid var(--system-border); vertical-align: top; }
                
                .tx-info { display: flex; flex-direction: column; gap: 4px; }
                .tx-date { font-size: 0.8rem; color: var(--system-text-secondary); }
                .tx-desc { font-weight: 600; color: var(--system-text); }
                .tx-amount { font-family: 'SF Mono', monospace; font-weight: 700; }
                .tx-amount.pos { color: var(--system-success); }
                .tx-amount.neg { color: var(--system-error, #ff3b30); }

                .match-cell { display: flex; flex-direction: column; align-items: center; gap: 6px; }
                .confidence-label { font-size: 0.75rem; color: var(--system-text-secondary); font-weight: 500; }

                .badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
                .badge-success { background: rgba(52, 199, 89, 0.1); color: var(--system-success); }
                .badge-warning { background: rgba(255, 149, 0, 0.1); color: var(--system-warning); }
                .badge-info { background: rgba(0, 113, 227, 0.1); color: var(--system-accent); }
                .badge-danger { background: rgba(255, 59, 48, 0.1); color: var(--system-error, #ff3b30); }

                .icon-btn { width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; margin-left: 8px; }
                .icon-btn.success { background: rgba(52, 199, 89, 0.1); color: var(--system-success); }
                .icon-btn.danger { background: rgba(255, 59, 48, 0.1); color: var(--system-error, #ff3b30); }
                .icon-btn:hover { transform: scale(1.1); }

                .empty-state-card { padding: 4rem 2rem; text-align: center; color: var(--system-text-secondary); }
                .empty-state-card i { font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; }
                .empty-state-card p.small { font-size: 0.9rem; margin-top: 5px; }

                .pulse { animation: pulse-animation 1.5s infinite; }
                @keyframes pulse-animation { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
                
                .mr-2 { margin-right: 8px; }
            `}</style>
        </div>
    );
}
