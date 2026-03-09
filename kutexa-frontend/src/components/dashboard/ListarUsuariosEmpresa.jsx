import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_URL from "../../config/apiConfig";
import { useAlert } from "../../contexts/AlertContext";

export default function ListarUsuariosEmpresa() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useAlert();
  const { id: companyId } = useParams();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !companyId) {
      setLoading(false);
      return;
    }

    const fetchUsuarios = async () => {
      try {
        const response = await fetch(`${API_URL}/companies/${companyId}/users`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUsuarios(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, [companyId]);

  if (loading) return <div className="apple-loader">Carregando membros...</div>;

  return (
    <div className="apple-view-container">
      <div className="dashboard-header-apple">
        <div className="header-text">
          <h1>Membros da Equipa</h1>
          <p>Gerencie as permissões e acessos dos usuários associados a esta empresa.</p>
        </div>
      </div>

      <div className="apple-card glass-effect apple-shadow">
        {usuarios.length === 0 ? (
          <div className="empty-state">Nenhum membro encontrado.</div>
        ) : (
          <div className="apple-table-wrapper">
            <table className="apple-table">
              <thead>
                <tr>
                  <th>E-mail Corporativo</th>
                  <th>Nível de Acesso</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((user, index) => (
                  <tr key={index}>
                    <td className="font-medium">{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role?.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .apple-view-container { padding: 1rem; }
        .empty-state { padding: 3rem; text-align: center; color: var(--system-text-muted); }
        .role-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
        .role-badge.admin { background: rgba(0, 113, 227, 0.1); color: #0071e3; }
        .role-badge.user { background: rgba(0, 0, 0, 0.05); color: #1d1d1f; }
        .font-medium { font-weight: 500; }
      `}</style>
    </div>
  );
}
