
const  Footer = () => {
    return ( 
    
    <footer className="quantum-footer">
        <div className="footer-grid">
          <div className="footer-core">
            <h3 className="footer-title">KUTEXA</h3>
            <p className="footer-description">
              Reconciliação bancária neural para empresas do futuro. Transformamos dados financeiros em vantagem
              competitiva através de tecnologia quântica aplicada.
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-links-title">Produto</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#quantum-features">Recursos</a>
              </li>
              <li>
                <a href="#quantum-pricing">Planos</a>
              </li>
              <li>
                <a href="#">API</a>
              </li>
              <li>
                <a href="#">Documentação</a>
              </li>
              <li>
                <a href="#">Atualizações</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-links-title">Empresa</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#quantum-mission">Sobre</a>
              </li>
              <li>
                <a href="#">Carreiras</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
              <li>
                <a href="#">Parceiros</a>
              </li>
              <li>
                <a href="#">Imprensa</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-links-title">Contactos</h4>
            <ul className="footer-links-list">
              <li>
                <a href="mailto:contato@kutexa.ao">contato@kutexa.ao</a>
              </li>
              <li>
                <a href="tel:+244975347393">+244 975 347 393</a>
              </li>
              <li>
                <a href="#">Luanda, Angola</a>
              </li>
              <li>
                <a href="#">Segunda a Sexta</a>
              </li>
              <li>
                <a href="#">09:00 - 18:00</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copyright">&copy; 2025 KUTEXA. Todos os direitos reservados.</div>
          <div className="footer-legal">
            <a href="#">Termos de Uso</a>
            <a href="#">Política de Privacidade</a>
            <a href="#">Cookies</a>
          </div>
        </div>
    </footer>)
}

export default Footer;
