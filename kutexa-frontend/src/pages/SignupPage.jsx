import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config/apiConfig";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone,
        })
      });
      if (response.ok) {
        navigate('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao criar a conta. Verifique os dados informados.');
      }
    } catch (error) {
      console.error(error);
      setError('Erro de conexão ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="apple-signup-container">
      <style>{`
        .apple-signup-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f5f7; padding: 2rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .signup-box { width: 100%; max-width: 500px; padding: 40px; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); border-radius: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
        .signup-header { text-align: center; margin-bottom: 2.5rem; }
        .signup-header h1 { font-size: 1.8rem; font-weight: 700; color: #1d1d1f; margin-bottom: 0.5rem; }
        .signup-header p { color: #86868b; font-size: 0.95rem; }
        
        .signup-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 500px) { .signup-grid { grid-template-columns: 1fr; } }
        
        .apple-input-group { margin-bottom: 1.2rem; }
        .apple-input-group.full { grid-column: 1 / -1; }
        .apple-input-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #1d1d1f; margin-bottom: 6px; margin-left: 4px; }
        .apple-input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #d2d2d7; background: white; font-size: 1rem; outline: none; transition: all 0.2s; box-sizing: border-box; }
        .apple-input:focus { border-color: #0071e3; box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1); }
        
        .btn-apple-primary { width: 100%; padding: 14px; border-radius: 12px; border: none; background: #0071e3; color: white; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-top: 1rem; }
        .btn-apple-primary:hover { background: #0077ed; transform: scale(1.01); }
        .error-message { background: #ffefef; color: #d32f2f; padding: 12px; border-radius: 10px; margin-bottom: 1.5rem; font-size: 0.9rem; text-align: center; border: 1px solid #f8d7da; }
        
        .signup-footer { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #d2d2d7; text-align: center; font-size: 0.9rem; color: #86868b; }
        .signup-footer a { color: #0071e3; text-decoration: none; font-weight: 500; }
      `}</style>

      <div className="signup-box">
        <div className="signup-header">
          <h1>Criar ID Kutexa</h1>
          <p>Uma única conta para gerir todas as suas finanças corporativas.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="signup-grid">
            <div className="apple-input-group full">
              <label>Nome Completo</label>
              <input type="text" name="name" className="apple-input" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="apple-input-group full">
              <label>Email</label>
              <input type="email" name="email" className="apple-input" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="apple-input-group">
              <label>Telefone</label>
              <input type="tel" name="phone" className="apple-input" value={formData.phone} onChange={handleChange} placeholder="+244..." />
            </div>

            <div className="apple-input-group">
              <label>Palavra-passe</label>
              <input type="password" name="password" className="apple-input" value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          <button className="btn-apple-primary" type="submit" disabled={loading}>
            {loading ? "Criando Conta..." : "Criar ID Kutexa"}
          </button>
        </form>

        <div className="signup-footer">
          Já tem um ID Kutexa? <Link to="/login">Inicie sessão aqui</Link>
        </div>
      </div>
    </div>
  );
}