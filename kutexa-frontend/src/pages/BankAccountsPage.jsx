import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { useAlert } from "../contexts/AlertContext";
import API_URL from "../config/apiConfig";

export default function BankAccountsPage({ onLogout }) {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [company, setCompany] = useState(null);
    const { showNotification } = useAlert();

    // Estados para Edição
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ bankName: "", accountNumber: "", iban: "", currency: "" });

    useEffect(() => {
        fetchCompanyData();
        fetchAccounts();
    }, [companyId]);

    const fetchCompanyData = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/companies/${companyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCompany(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAccounts = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/companies/${companyId}/bank-accounts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAccounts(data);
            } else {
                const errData = await response.json();
                showNotification(errData.detail || errData.message || "Erro ao carregar contas", "error");
            }
        } catch (err) {
            showNotification("Erro de conexão", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Tem certeza que deseja eliminar esta conta?")) return;
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/companies/${companyId}/bank-accounts/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                showNotification("Conta eliminada", "success");
                setAccounts(accounts.filter(a => a.id !== id));
            } else {
                showNotification("Erro ao eliminar conta", "error");
            }
        } catch (err) {
            showNotification("Erro de conexão", "error");
        }
    };

    const handleEditClick = (account) => {
        setEditingId(account.id);
        setEditForm({
            bankName: account.bankName,
            accountNumber: account.accountNumber,
            iban: account.iban || "",
            currency: account.currency
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/companies/${companyId}/bank-accounts/${editingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });
            if (response.ok) {
                showNotification("Conta atualizada", "success");
                setEditingId(null);
                fetchAccounts();
            } else {
                showNotification("Erro ao atualizar conta", "error");
            }
        } catch (err) {
            showNotification("Erro de conexão", "error");
        }
    };

    return (
        <DashboardLayout onLogout={onLogout}>
            <div className="bank-accounts-page">
                <div className="page-header-apple">
                    <div className="header-info">
                        <h1>Contas Bancárias</h1>
                        <p>{company ? `Gestão de contas para ${company.name}` : "Carregando..."}</p>
                    </div>
                    <button className="btn-apple-secondary" onClick={() => navigate(-1)}>Voltar</button>
                </div>

                <div className="accounts-list-container">
                    {loading ? (
                        <p className="loading-text">Carregando contas...</p>
                    ) : accounts.length === 0 ? (
                        <div className="empty-state-apple glass-effect apple-shadow">
                            <p>Nenhuma conta bancária registada.</p>
                        </div>
                    ) : (
                        <div className="apple-grid">
                            {accounts.map(account => (
                                <div key={account.id} className="apple-card glass-effect apple-shadow account-card">
                                    {editingId === account.id ? (
                                        <form onSubmit={handleUpdate} className="edit-form-apple">
                                            <div className="apple-input-group">
                                                <label>Banco</label>
                                                <input
                                                    type="text"
                                                    className="apple-input-small"
                                                    value={editForm.bankName}
                                                    onChange={e => setEditForm({ ...editForm, bankName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="apple-input-group">
                                                <label>Número da Conta</label>
                                                <input
                                                    type="text"
                                                    className="apple-input-small"
                                                    value={editForm.accountNumber}
                                                    onChange={e => setEditForm({ ...editForm, accountNumber: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="action-buttons-edit">
                                                <button type="submit" className="btn-apple-primary-small">Salvar</button>
                                                <button type="button" className="btn-apple-ghost" onClick={() => setEditingId(null)}>Cancelar</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="account-main-info">
                                                <h3>{account.bankName}</h3>
                                                <p className="account-number">{account.accountNumber}</p>
                                                {account.iban && <p className="iban">IBAN: {account.iban}</p>}
                                                <span className="currency-badge">{account.currency}</span>
                                            </div>
                                            <div className="account-actions">
                                                <button className="btn-icon-apple" onClick={() => handleEditClick(account)}>
                                                    <i className="fas fa-edit"></i> Editar
                                                </button>
                                                <button className="btn-icon-apple delete" onClick={() => handleDelete(account.id)}>
                                                    <i className="fas fa-trash"></i> Eliminar
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .bank-accounts-page { padding: 20px 0; }
        .page-header-apple { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
        .header-info h1 { font-size: 2rem; font-weight: 700; color: var(--system-text); margin-bottom: 4px; }
        .header-info p { color: var(--system-text-secondary); }

        .apple-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .account-card { padding: 1.5rem; border-radius: 20px; display: flex; flex-direction: column; justify-content: space-between; min-height: 180px; }
        
        .account-main-info h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 8px; }
        .account-number { font-family: monospace; font-size: 1rem; color: var(--system-text-secondary); margin-bottom: 4px; }
        .iban { font-size: 0.8rem; color: var(--system-text-tertiary); margin-bottom: 12px; }
        
        .currency-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; background: rgba(0,0,0,0.05); font-size: 0.75rem; font-weight: 600; }
        
        .account-actions { display: flex; gap: 12px; margin-top: 1.5rem; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 1rem; }
        .btn-icon-apple { background: none; border: none; font-size: 0.85rem; font-weight: 500; cursor: pointer; color: var(--system-accent); display: flex; align-items: center; gap: 4px; }
        .btn-icon-apple.delete { color: #FF3B30; }
        .btn-icon-apple:hover { opacity: 0.7; }

        .edit-form-apple { display: flex; flex-direction: column; gap: 12px; }
        .apple-input-small { width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--system-border); outline: none; font-size: 0.9rem; }
        .btn-apple-primary-small { padding: 8px 16px; border-radius: 8px; border: none; background: var(--system-accent); color: white; font-weight: 600; cursor: pointer; }
        .action-buttons-edit { display: flex; gap: 10px; margin-top: 10px; }
        .btn-apple-ghost { padding: 8px 16px; border-radius: 8px; border: none; background: none; color: var(--system-text-secondary); font-weight: 500; cursor: pointer; }

        .empty-state-apple { padding: 4rem; text-align: center; border-radius: 24px; color: var(--system-text-secondary); }
      `}</style>
        </DashboardLayout>
    );
}
