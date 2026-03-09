
function Header({ onMenuClick }) {
  return (
    <header className="header">
      <button className="mobile-menu-btn" id="mobileMenuBtn" onClick={onMenuClick}>
        <i className="fas fa-bars"></i>
      </button>
      <div className="breadcrumb-apple">
        <span>Kutexa</span>
        <i className="fas fa-chevron-right"></i>
        <span className="current-page">Dashboard</span>
      </div>
      <div className="user-actions">
        <div className="notification-btn">
          <i className="fas fa-bell"></i>
        </div>
        <a href="/perfil">
          <div className="user-profile">
            <i className="fas fa-user"></i>
          </div>
        </a>
      </div>
      <style>{`
        .header { display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; height: var(--header-height); }
        .breadcrumb-apple { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--system-text-secondary); }
        .breadcrumb-apple i { font-size: 0.7rem; opacity: 0.5; }
        .current-page { color: var(--system-text); font-weight: 600; }
        .mobile-menu-btn { display: none; }
        
        @media (max-width: 1024px) {
          .mobile-menu-btn { display: block; background: none; border: none; font-size: 1.2rem; cursor: pointer; }
          .breadcrumb-apple { display: none; }
        }
      `}</style>
    </header>
  );
}

export default Header;