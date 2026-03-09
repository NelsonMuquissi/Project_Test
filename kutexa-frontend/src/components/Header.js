import { Link } from "react-router-dom";

const Header = () => {
  return (
     <header className="cyber-header">
        <div className="header-grid">
          <div className="cyber-logo">
            <div className="logo-text">KUTEXA</div>
          </div>
          <nav className="cyber-nav">
            <a href="#quantum-hero" className="nav-link active">
              Início
            </a>
            <a href="#quantum-mission" className="nav-link">
              Missão
            </a>
            <a href="#quantum-features" className="nav-link">
              Recursos
            </a>
            <a href="#quantum-pricing" className="nav-link">
              Planos
            </a>
            <a href="#quantum-contact" className="nav-link">
              Contacto
            </a>
          </nav>
              <div className="header-actions">
              <Link to="/login" style={{ textDecoration: "none" }}>
                <button className="cyber-button">
                  <span>ACESSO</span>
                  <i className="fas fa-terminal"></i>
                </button>
              </Link>
            </div>

        </div>
      </header>

  );
};

export default Header;
