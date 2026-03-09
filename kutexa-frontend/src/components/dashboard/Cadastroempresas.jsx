import { useState } from "react";
import { useAlert } from "../../contexts/AlertContext";
import API_URL from "../../config/apiConfig";

export default function Cadastroempresas() {
  const [name, setName] = useState("");
  const [nif, setNif] = useState("");
  const [loading, setLoading] = useState(false);
  const { showNotification } = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, nif, defaultCurrency: "AOA" })
      });
      if (response.ok) {
        showNotification("Empresa cadastrada com sucesso!", "success");
        setName("");
        setNif("");
      } else {
        const error = await response.json();
        showNotification(error.message || error.error || "Erro ao cadastrar", "error");
      }
    } catch {
      showNotification("Erro de conexão", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apple-form-page">
      <div className="dashboard-header-apple">
        <div className="header-text">
          <h1>Cadastrar Empresa</h1>
          <p>Adicione uma nova entidade para reconciliação financeira.</p>
        </div>
      </div>

      <div className="apple-card glass-effect apple-shadow max-w-600">
        <form onSubmit={handleSubmit}>
          <div className="apple-input-group">
            <label>Nome da Empresa</label>
            <input
              type="text"
              className="apple-input"
              placeholder="Ex: Kutexa Tecnologias"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="apple-input-group">
            <label>NIF (Número de Identificação Fiscal)</label>
            <input
              type="text"
              className="apple-input"
              placeholder="9 dígitos numéricos"
              value={nif}
              onChange={(e) => setNif(e.target.value)}
              required
            />
          </div>

          <button className="btn-apple-primary" type="submit" disabled={loading}>
            {loading ? "Processando..." : "Cadastrar Empresa"}
          </button>
        </form>
      </div>

      <style>{`
        .apple-form-page { padding: 1rem; display: flex; flex-direction: column; align-items: flex-start; }
        .max-w-600 { width: 100%; max-width: 600px; padding: 2.5rem; border-radius: 24px; margin-top: 2rem; }
        .apple-input-group { margin-bottom: 2rem; }
        .apple-input-group label { display: block; font-size: 0.9rem; font-weight: 600; color: var(--system-text); margin-bottom: 10px; }
        .apple-input { width: 100%; padding: 16px; border-radius: 12px; border: 1px solid var(--system-border); background: white; font-size: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .apple-input:focus { border-color: var(--system-accent); }
        .btn-apple-primary { width: 100%; padding: 16px; border-radius: 14px; border: none; background: var(--system-accent); color: white; font-size: 1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s; margin-top: 1rem; }
        .btn-apple-primary:hover { opacity: 0.9; }
        .btn-apple-primary:disabled { opacity: 0.5; }
      `}</style>
    </div>
  );
}
