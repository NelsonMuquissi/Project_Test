import { useState } from 'react';
import API_URL from "../../config/apiConfig";

function Sidebar({ isOpen }) {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (id) => {
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const onLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
    } catch (error) {
      console.error('Erro ao fazer logout', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const menuItems = [
    { id: 'home', icon: 'fas fa-chart-pie', text: 'Resumo', active: window.location.pathname === '/dashboard', onClick: () => window.location.href = '/dashboard' },
    {
      id: 'companies', icon: 'fas fa-building', text: 'Empresas', hasSubmenu: true,
      submenu: [
        { text: 'Minhas Empresas', onClick: () => window.location.href = '/minhas-empresas' },
        { text: 'Adicionar Nova', onClick: () => window.location.href = '/minhas-empresas?new=true' }
      ]
    },
    {
      id: 'reconciliation', icon: 'fas fa-sync-alt', text: 'Reconciliação', hasSubmenu: true,
      submenu: [
        { text: 'Novo Processo', onClick: () => window.location.href = '/reconciliation' },
        { text: 'Histórico', onClick: () => window.location.href = '/reconciliation-history' },
        { text: 'Regras de IA', onClick: () => window.location.href = '/ia-rules' }
      ]
    },
    {
      id: 'reports', icon: 'fas fa-file-invoice-dollar', text: 'Relatórios', hasSubmenu: true,
      submenu: [
        { text: 'Resumo Geral', onClick: () => window.location.href = '/reports-summary' },
        { text: 'Desempenho', onClick: () => window.location.href = '/reports-performance' },
        { text: 'Exportações', onClick: () => window.location.href = '/reports-exports' }
      ]
    },
    { id: 'users', icon: 'fas fa-user-friends', text: 'Equipa', onClick: () => window.location.href = '/team' },
    { id: 'license', icon: 'fas fa-shield-alt', text: 'Subscrição', onClick: () => window.location.href = '/subscription' },
    { id: 'settings', icon: 'fas fa-sliders-h', text: 'Definições', onClick: () => window.location.href = '/settings' },
    { id: 'logout', icon: 'fas fa-power-off', text: 'Sair', onClick: onLogout, style: { marginTop: 'auto', color: '#ff3b30' } }
  ];

  return (
    <div className={`sidebar ${isOpen ? 'active' : ''}`} id="sidebar">
      <div className="sidebar-header">
        <div className="kutexa-logo">
          <i className="fas fa-layer-group text-blue-500"></i>
          <span>Kutexa</span>
        </div>
      </div>
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <div key={item.id} className="menu-group">
            <div
              className={`menu-item ${item.active ? 'active' : ''}`}
              style={item.style}
              onClick={() => item.hasSubmenu ? toggleMenu(item.id) : item.onClick()}
            >
              <i className={item.icon}></i>
              <span className="menu-item-text">{item.text}</span>
              {item.hasSubmenu && (
                <i className={`fas fa-chevron-right menu-arrow ${openMenus[item.id] ? 'rotated' : ''}`}></i>
              )}
            </div>

            {item.hasSubmenu && (
              <div className={`submenu ${openMenus[item.id] ? 'show' : ''}`}>
                {item.submenu.map((subItem, index) => (
                  <div key={index} className="submenu-item" onClick={subItem.onClick}>
                    {subItem.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <style>{`
        .kutexa-logo { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 1.4rem; color: #fff; }
        .kutexa-logo i { background: var(--system-accent); padding: 8px; border-radius: 8px; font-size: 1rem; }
        .menu-arrow { margin-left: auto; font-size: 0.7rem; transition: transform 0.3s ease; opacity: 0.5; }
        .menu-arrow.rotated { transform: rotate(90deg); }
        .menu-group { display: flex; flex-direction: column; }
      `}</style>
    </div>
  );
}

export default Sidebar;
