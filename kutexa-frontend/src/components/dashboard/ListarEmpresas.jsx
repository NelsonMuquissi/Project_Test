import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "../../config/apiConfig";

export default function ListarEmpresas() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: "", nif: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Abrir modal automaticamente se vier da sidebar com ?new=true
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("new") === "true") {
      setShowModal(true);
    }
  }, [location.search]);

  const fetchCompanies = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
        setFilteredCompanies(data);
      }
    } catch {
      console.error("Erro ao buscar empresas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    const res = companies.filter(c =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nif?.includes(searchTerm)
    );
    setFilteredCompanies(res);
  }, [searchTerm, companies]);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/companies`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCompany),
      });
      if (response.ok) {
        setShowModal(false);
        setNewCompany({ name: "", nif: "", email: "", phone: "" });
        fetchCompanies();
        // Limpar o query param
        navigate("/minhas-empresas", { replace: true });
      } else {
        const data = await response.json();
        setError(data.message || data.error || "Erro ao criar empresa.");
      }
    } catch {
      setError("Erro de comunicação com o servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setError("");
    navigate("/minhas-empresas", { replace: true });
  };

  return (
    <div className="companies-page-apple">
      <div className="dashboard-header-apple">
        <div className="header-text">
          <h1>Empresas</h1>
          <p>Gerencie todas as entidades registadas no sistema Kutexa.</p>
        </div>
        <button className="btn-primary apple-shadow" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus mr-2"></i> Adicionar Empresa
        </button>
      </div>

      <div className="search-bar-container-apple glass-effect apple-shadow">
        <div className="search-input-wrapper">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Pesquisar por nome ou NIF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="companies-grid">
        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3].map(i => <div key={i} className="company-card-skeleton glass-effect"></div>)}
          </div>
        ) : filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
            <div key={company.id} className="company-card glass-effect apple-shadow">
              <div className="company-icon-large">
                <i className="fas fa-building"></i>
              </div>
              <div className="company-details">
                <h3>{company.name}</h3>
                <div className="company-info-row">
                  <span className="info-label">NIF:</span>
                  <span className="info-value">{company.nif || 'N/A'}</span>
                </div>
                <div className="company-info-row">
                  <span className="info-label">ID:</span>
                  <span className="info-value">#{company.id?.substring(0, 6)}</span>
                </div>
              </div>
              <div className="company-card-actions">
                <button
                  className="btn-access"
                  onClick={() => navigate(`/configurar-empresa/${company.id}`)}
                >
                  Configurar <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state-full glass-effect">
            <i className="fas fa-building"></i>
            <p>Nenhuma empresa encontrada.</p>
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>
              <i className="fas fa-plus mr-2"></i> Adicionar Primeira Empresa
            </button>
          </div>
        )}
      </div>

      {/* Modal Adicionar Empresa */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box glass-effect apple-shadow" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nova Empresa</h2>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreateCompany}>
              <div className="form-group">
                <label>Nome da Empresa *</label>
                <input
                  type="text" required placeholder="Ex: Empresa Lda."
                  value={newCompany.name}
                  onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>NIF</label>
                <input
                  type="text" placeholder="Ex: 5401234567"
                  value={newCompany.nif}
                  onChange={e => setNewCompany({ ...newCompany, nif: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email" placeholder="empresa@email.com"
                  value={newCompany.email}
                  onChange={e => setNewCompany({ ...newCompany, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="text" placeholder="Ex: +244 9xx xxx xxx"
                  value={newCompany.phone}
                  onChange={e => setNewCompany({ ...newCompany, phone: e.target.value })}
                />
              </div>
              {error && <p className="form-error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <i className="fas fa-spinner fa-spin"></i> : 'Criar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .companies-page-apple { padding-bottom: 2rem; }
        .search-bar-container-apple { padding: 1rem 1.5rem; border-radius: 15px; margin-bottom: 2rem; }
        .search-input-wrapper { display: flex; align-items: center; gap: 12px; }
        .search-input-wrapper i { color: var(--system-text-secondary); font-size: 1.1rem; }
        .search-input-wrapper input { border: none; background: transparent; width: 100%; font-size: 1rem; color: var(--system-text); outline: none; }
        
        .companies-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .company-card { padding: 1.5rem; border-radius: var(--border-radius); display: flex; flex-direction: column; transition: transform 0.2s; }
        .company-card:hover { transform: translateY(-5px); }
        
        .company-icon-large { width: 48px; height: 48px; background: var(--system-accent); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1.2rem; }
        .company-details h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; color: var(--system-text); }
        .company-info-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem; }
        .info-label { color: var(--system-text-secondary); }
        .info-value { font-weight: 500; color: var(--system-text); }
        
        .company-card-actions { margin-top: 1.5rem; padding-top: 1.2rem; border-top: 1px solid var(--system-border); }
        .btn-access { background: transparent; border: none; color: var(--system-accent); font-weight: 600; cursor: pointer; padding: 0; display: flex; align-items: center; gap: 8px; transition: gap 0.2s; }
        .btn-access:hover { gap: 12px; }
        
        .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; width: 100%; }
        .company-card-skeleton { height: 200px; border-radius: var(--border-radius); opacity: 0.5; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }
        
        .empty-state-full { grid-column: 1 / -1; padding: 5rem; text-align: center; border-radius: var(--border-radius); color: var(--system-text-secondary); }
        .empty-state-full i { font-size: 3rem; margin-bottom: 1rem; display: block; }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-box { background: var(--system-surface, #1c1c1e); border-radius: 20px; padding: 2rem; width: 90%; max-width: 480px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .modal-header h2 { font-size: 1.4rem; font-weight: 700; color: var(--system-text); }
        .modal-close { background: none; border: none; color: var(--system-text-secondary); font-size: 1.2rem; cursor: pointer; padding: 4px 8px; border-radius: 8px; }
        .modal-close:hover { background: var(--system-border); }
        .form-group { margin-bottom: 1.2rem; }
        .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--system-text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        .form-group input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--system-border); background: var(--system-background, #000); color: #ffffff; font-size: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .form-group input:focus { border-color: var(--system-accent); }
        .form-error { color: #ff3b30; font-size: 0.9rem; margin-bottom: 1rem; }
        .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
        .btn-secondary { background: var(--system-border); border: none; padding: 12px 20px; border-radius: 12px; color: var(--system-text); font-weight: 600; cursor: pointer; }
        .ml-2 { margin-left: 8px; }
        .mr-2 { margin-right: 8px; }
      `}</style>
    </div>
  );
}
