import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_URL from "../../config/apiConfig";
import { useAlert } from "../../contexts/AlertContext";

export default function CadastramentoDeUsuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("gestor");
  const [dadosBancarios, setDadosBancarios] = useState({
    bankName: "",
    accountNumber: "",
    iban: "",
    currency: "AOA"
  });

  const { showNotification } = useAlert();
  const { id: companyId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, bankRes] = await Promise.all([
        fetch(`${API_URL}/companies/${companyId}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/companies/${companyId}/bank-accounts`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (userRes.ok) setUsuarios(await userRes.json());
      if (bankRes.ok) {
        setBankAccounts(await bankRes.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/companies/${companyId}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userEmail: email, role }),
      });
      if (response.ok) {
        showNotification("Membro adicionado com sucesso!", "success");
        setEmail("");
        fetchData();
      } else {
        const err = await response.json();
        showNotification(err.error || "Erro ao adicionar usuário", "error");
      }
    } catch (error) {
      showNotification("Erro na conexão", "error");
    }
  };

  const handleAddBank = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/companies/${companyId}/bank-accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dadosBancarios),
      });
      if (response.ok) {
        showNotification("Conta bancária salva!", "success");
        setDadosBancarios({ bankName: "", accountNumber: "", iban: "", currency: "AOA" });
        fetchData();
      } else {
        const err = await response.json();
        showNotification(err.detail || err.error || err.message || "Erro ao cadastrar conta", "error");
      }
    } catch (error) {
      console.error(error);
      showNotification("Erro na conexão com o servidor ao cadastrar conta", "error");
    }
  };

  if (loading) return <div className="apple-loader text-center py-5">Sincronizando dados...</div>;

  return (
    <div className="apple-view-container">
      <div className="dashboard-header-apple">
        <div className="header-text">
          <h1>Gestão da Conta</h1>
          <p>Configure acessos, membros e dados financeiros da sua empresa.</p>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="grid-left">
          {/* User Management Section */}
          <section className="apple-card glass-effect apple-shadow mb-6">
            <div className="section-header-apple">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-users-cog text-blue"></i>
                <h2>Membros da Equipa</h2>
              </div>
            </div>

            <form onSubmit={handleAddUser} className="apple-inline-form">
              <input
                type="email"
                className="apple-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Endereço de e-mail institucional"
                required
              />
              <select className="apple-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="admin">Administrador</option>
                <option value="gestor">Gestor</option>
                <option value="analista">Analista</option>
              </select>
              <button type="submit" className="btn-primary apple-shadow">
                <i className="fas fa-plus"></i>
              </button>
            </form>

            <div className="apple-table-wrapper mt-4">
              <table className="apple-table">
                <thead>
                  <tr>
                    <th>Membro</th>
                    <th>Nível</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u, i) => (
                    <tr key={i}>
                      <td className="font-medium">{u.email}</td>
                      <td><span className={`badge-role ${u.role}`}>{u.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="grid-right">
          {/* Bank Accounts Section */}
          <section className="apple-card glass-effect apple-shadow">
            <div className="section-header-apple">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-university text-green"></i>
                <h2>Canais Bancários</h2>
              </div>
            </div>

            <form onSubmit={handleAddBank} className="apple-stacked-form">
              <input
                type="text"
                className="apple-input"
                value={dadosBancarios.bankName}
                onChange={(e) => setDadosBancarios({ ...dadosBancarios, bankName: e.target.value })}
                placeholder="Nome do Banco"
                required
              />
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="apple-input w-100"
                  value={dadosBancarios.accountNumber}
                  onChange={(e) => setDadosBancarios({ ...dadosBancarios, accountNumber: e.target.value })}
                  placeholder="Nº da Conta"
                  required
                />
                <select
                  className="apple-select"
                  value={dadosBancarios.currency}
                  onChange={(e) => setDadosBancarios({ ...dadosBancarios, currency: e.target.value })}
                >
                  <option value="AOA">AOA</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <input
                type="text"
                className="apple-input"
                value={dadosBancarios.iban}
                onChange={(e) => setDadosBancarios({ ...dadosBancarios, iban: e.target.value })}
                placeholder="IBAN"
                required
              />
              <button type="submit" className="btn-primary w-100 mt-2 apple-shadow">
                Salvar Conta
              </button>
            </form>

            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h3 className="sub-title m-0">Contas Ativas</h3>
                <button
                  className="btn-link-apple"
                  onClick={() => navigate(`/bank-accounts/${companyId}`)}
                >
                  Gerir Todas <i className="fas fa-external-link-alt ml-1"></i>
                </button>
              </div>
              <div className="bank-list">
                {bankAccounts.map((acc, i) => (
                  <div key={i} className="bank-item apple-shadow">
                    <div className="bank-info">
                      <span className="bank-name">{acc.bankName}</span>
                      <span className="acc-number">{acc.accountNumber} ({acc.currency})</span>
                    </div>
                    <button className="btn-reconcile" onClick={() => window.location.href = '/reconciliation'}>
                      Reconciliar
                    </button>
                  </div>
                ))}
                {bankAccounts.length === 0 && <p className="empty-text">Nenhuma conta vinculada.</p>}
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .apple-view-container { padding: 1.5rem; }
        .apple-card { padding: 2rem; border-radius: 20px; }
        .section-header-apple { margin-bottom: 1.5rem; }
        .section-header-apple h2 { font-size: 1.2rem; font-weight: 600; margin: 0; }
        .apple-inline-form { display: flex; gap: 10px; }
        .apple-stacked-form { display: flex; flex-direction: column; gap: 12px; }
        .text-blue { color: var(--system-accent); }
        .text-green { color: var(--system-success); }
        .font-medium { font-weight: 500; }
        
        .badge-role { padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
        .badge-role.admin { background: rgba(0, 113, 227, 0.1); color: #0071e3; }
        
        .sub-title { font-size: 0.9rem; font-weight: 600; color: var(--system-text-secondary); margin-bottom: 1rem; }
        .bank-list { display: flex; flex-direction: column; gap: 10px; }
        .bank-item { background: #fff; padding: 12px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; }
        .bank-info { display: flex; flex-direction: column; }
        .bank-name { font-weight: 600; font-size: 0.95rem; }
        .acc-number { font-size: 0.8rem; color: var(--system-text-secondary); }
        .btn-reconcile { background: #000; color: #fff; border: none; padding: 6px 12px; border-radius: 10px; font-size: 0.75rem; cursor: pointer; }
        .empty-text { font-size: 0.85rem; color: var(--system-text-secondary); text-align: center; padding: 1rem; }
        
        @media (max-width: 1024px) {
          .dashboard-main-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
