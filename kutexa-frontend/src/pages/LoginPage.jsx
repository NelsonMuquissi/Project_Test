import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config/apiConfig";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorVisible("");
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setErrorVisible(data.detail || data.message || data.error || "Erro ao realizar login");
      }
    } catch (err) {
      console.error(err);
      setErrorVisible("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apple-login-container">
      <style>{`
        .apple-login-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .login-box { width: 100%; max-width: 400px; padding: 40px; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); border-radius: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); text-align: center; }
        .logo-area { margin-bottom: 2rem; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .logo-area i { font-size: 2.5rem; color: #0071e3; }
        .logo-area h1 { font-size: 1.8rem; font-weight: 700; color: #1d1d1f; margin: 0; letter-spacing: -0.5px; }
        .logo-area p { color: #86868b; font-size: 0.95rem; }
        
        .apple-input-group { margin-bottom: 1.5rem; text-align: left; }
        .apple-input-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #1d1d1f; margin-bottom: 8px; margin-left: 4px; }
        .apple-input { width: 100%; padding: 14px 18px; border-radius: 12px; border: 1px solid #d2d2d7; background: white; font-size: 1rem; outline: none; transition: all 0.2s; box-sizing: border-box; }
        .apple-input:focus { border-color: #0071e3; box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1); }
        
        .btn-apple-primary { width: 100%; padding: 14px; border-radius: 12px; border: none; background: #0071e3; color: white; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-top: 1rem; }
        .btn-apple-primary:hover { background: #0077ed; transform: scale(1.02); }
        .btn-apple-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        
        .login-footer { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #d2d2d7; font-size: 0.9rem; color: #86868b; }
        .login-footer a { color: #0071e3; text-decoration: none; font-weight: 500; }
        .error-banner { background: #fff2f2; color: #ff3b30; padding: 12px; border-radius: 12px; margin-bottom: 1.5rem; font-size: 0.9rem; font-weight: 500; border: 1px solid #ffcfcc; text-align: left; }
        .mr-2 { margin-right: 8px; }
      `}</style>

      <div className="login-box">
        <div className="logo-area">
          <i className="fas fa-layer-group"></i>
          <h1>Kutexa</h1>
          <p>Inicie sessão para gerir as suas finanças.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {errorVisible && (
            <div className="error-banner apple-shadow">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {errorVisible}
            </div>
          )}
          <div className="apple-input-group">
            <label>Endereço de Email</label>
            <input
              type="email"
              className="apple-input"
              placeholder="nome@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="apple-input-group">
            <label>Palavra-passe</label>
            <input
              type="password"
              className="apple-input"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn-apple-primary" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Continuar"}
          </button>
        </form>

        <div className="login-footer">
          Não tem uma conta? <Link to="/signup">Criar ID Kutexa</Link>
        </div>
      </div>
    </div>
  );
}
