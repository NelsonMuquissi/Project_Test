import "./Hero.css";

export default function Hero() {
  return (
    <section className="quantum-hero" id="quantum-hero">
      <div className="hero-orbit">
        <div className="orbital-ring"></div>
        <div className="orbital-ring"></div>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">Reconciliação Bancária Inteligente</h1>
          <p className="hero-description">
            Simplifique sua gestão financeira com o Kutexa. Automatize processos, elimine erros e ganhe controle total sobre suas transações bancárias com tecnologia de ponta.
          </p>

          <div className="hero-stats">
            <div className="stat-orb">
              <div className="stat-value" data-target="99.9">99</div>
              <div className="stat-label">Precisão</div>
            </div>
            <div className="stat-orb">
              <div className="stat-value">40h</div>
              <div className="stat-label">Economizadas</div>
            </div>
            <div className="stat-orb">
              <div className="stat-value" data-target="98.7">99</div>
              <div className="stat-label">Eficiência</div>
            </div>
          </div>

          <button className="cyber-button" style={{marginTop: "var(--space-xl)", padding: "16px 32px"}}>
            <span>INICIAR DEMONSTRAÇÃO</span>
            <i className="fas fa-rocket"></i>
          </button>
        </div>

        <div className="holo-dashboard">
          <div className="dashboard-frame">
            <div className="dashboard-header">
              <div className="dashboard-title">SISTEMA NEURAL</div>
              <div className="dashboard-status">
                <span style={{color: "var(--neo-primary)", fontFamily: "var(--font-mono)"}}>
                  <i className="fas fa-circle" style={{fontSize: "0.8em", marginRight: "8px"}}></i>
                  ONLINE
                </span>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-widget">
                <div className="widget-header">
                  <div className="widget-title">RECONCILIAÇÃO</div>
                  <div className="widget-value">98.7%</div>
                </div>
                <div className="widget-progress" style={{"--progress": "98.7%"}}></div>
              </div>

              <div className="dashboard-widget">
                <div className="widget-header">
                  <div className="widget-title">TEMPO ECONOMIZADO</div>
                  <div className="widget-value">15h/mês</div>
                </div>
                <div className="widget-progress" style={{"--progress": "85%"}}></div>
              </div>

              <div className="dashboard-widget">
                <div className="widget-header">
                  <div className="widget-title">PRECISÃO</div>
                  <div className="widget-value">99.9%</div>
                </div>
                <div className="widget-progress" style={{"--progress": "99.9%"}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
