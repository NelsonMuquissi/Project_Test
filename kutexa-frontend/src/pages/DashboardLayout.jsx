import { useEffect, useState } from 'react';
import Header from '../components/dashboard/Header';
import Sidebar from '../components/dashboard/Sidebar';
import '../styles/dashboard.css';

export default function DashboardLayout({ children, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('Usuário');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLogout = () => { if (window.confirm('Tem certeza que deseja sair?')) onLogout(); };



  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.name) setUserName(user.name);
  }, []);


  return (
    <div className="dashboard-container">
      {sidebarOpen && <div className="menu-overlay active" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onLogout={handleLogout} />

      <div className="main-content">
        <Header onMenuClick={toggleSidebar} />

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}
