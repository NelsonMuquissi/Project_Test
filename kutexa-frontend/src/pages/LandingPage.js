
import { useEffect } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../styles/main.css";
const LandingPage = () => {
  useEffect(() => {
    const cursor = document.getElementById("neonCursor");
    const grid = document.querySelector(".quantum-grid");
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".quantum-section, .quantum-hero");
    const cyberButtons = document.querySelectorAll(".cyber-button");
    const contactForm = document.querySelector(".contact-form-neo");

    // Cursor + Quantum Grid movement
    const handleMouseMove = (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";

      const x = (e.clientX / window.innerWidth) * 50;
      const y = (e.clientY / window.innerHeight) * 50;
      grid.style.backgroundPosition = `${x}px ${y}px`;
    };
    document.addEventListener("mousemove", handleMouseMove);

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        if (targetId === "#") return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: "smooth",
          });
        }
      });
    });

    // Animate counters
    const animateCounter = (element, target) => {
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          element.textContent = target.toFixed(1);
          clearInterval(timer);
        } else {
          element.textContent = current.toFixed(1);
        }
      }, 20);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const statValues = entry.target.querySelectorAll(".stat-value[data-target]");
            statValues.forEach((stat) => {
              const target = parseFloat(stat.getAttribute("data-target"));
              if (!stat.classList.contains("animated")) {
                animateCounter(stat, target);
                stat.classList.add("animated");
              }
            });
            entry.target.classList.add("quantum-visible");
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((section) => observer.observe(section));

    // Active navigation link on scroll
    const setActiveNavLink = () => {
      let current = "";
      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          current = section.getAttribute("id");
        }
      });
      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
          link.classList.add("active");
        }
      });
    };
    window.addEventListener("scroll", setActiveNavLink);
    setActiveNavLink();

    // Cyber button hover effect
    cyberButtons.forEach((button) => {
      button.addEventListener("mouseenter", () => {
        button.style.boxShadow = "0 0 30px rgba(200, 169, 81, 0.6)";
      });
      button.addEventListener("mouseleave", () => {
        button.style.boxShadow = "";
      });
    });

    // Contact form submission
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const button = contactForm.querySelector(".cyber-button");
        const originalText = button.innerHTML;

        button.innerHTML = '<i className="fas fa-spinner fa-spin"></i> ENVIANDO...';
        button.style.background = "var(--neo-primary)";

        setTimeout(() => {
          button.innerHTML = '<i className="fas fa-check"></i> MENSAGEM ENVIADA';
          button.style.background = "var(--gradient-neo)";
          contactForm.reset();

          setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = "";
          }, 3000);
        }, 1500);
      });
    }

    // Cleanup listeners on unmount
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", setActiveNavLink);
    };
  }, []);

  return (
    <div className="neo-theme">
      {/* Quantum Grid Background */}
      <div className="quantum-grid"></div>

      {/* Neon Cursor */}
      <div className="neon-cursor" id="neonCursor"></div>

      {/* Header */}
    <Header/>
      {/* Hero Section */}
      <section className="quantum-hero" id="quantum-hero">
        <div className="hero-orbit">
          <div className="orbital-ring"></div>
          <div className="orbital-ring"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Reconciliação Bancária Inteligente</h1>
            <p className="hero-description">
              Simplifique sua gestão financeira com o Kutexa. Automatize processos, elimine erros e ganhe controle
              total sobre suas transações bancárias com tecnologia de ponta.
            </p>

            <div className="hero-stats">
              <div className="stat-orb">
                <div className="stat-value" data-target="99.9">
                  99
                </div>
                <div className="stat-label">Precisão</div>
              </div>
              <div className="stat-orb">
                <div className="stat-value">40h</div>
                <div className="stat-label">Economizadas</div>
              </div>
              <div className="stat-orb">
                <div className="stat-value" data-target="98.7">
                  99
                </div>
                <div className="stat-label">Eficiência</div>
              </div>
            </div>

            <button className="cyber-button" style={{ marginTop: "var(--space-xl)", padding: "16px 32px" }}>
              <span>INICIAR DEMONSTRAÇÃO</span> <i className="fas fa-rocket"></i>
            </button>
          </div>

          <div className="holo-dashboard">
            <div className="dashboard-frame">
              <div className="dashboard-header">
                <div className="dashboard-title">SISTEMA NEURAL</div>
                <div className="dashboard-status">
                  <span style={{ color: "var(--neo-primary)", fontFamily: "var(--font-mono)" }}>
                    <i className="fas fa-circle" style={{ fontSize: "0.8em", marginRight: "8px" }}></i>
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
                  <div className="widget-progress" style={{ "--progress": "98.7%" }}></div>
                </div>
                <div className="dashboard-widget">
                  <div className="widget-header">
                    <div className="widget-title">TEMPO ECONOMIZADO</div>
                    <div className="widget-value">15h/mês</div>
                  </div>
                  <div className="widget-progress" style={{ "--progress": "85%" }}></div>
                </div>
                <div className="dashboard-widget">
                  <div className="widget-header">
                    <div className="widget-title">PRECISÃO</div>
                    <div className="widget-value">99.9%</div>
                  </div>
                  <div className="widget-progress" style={{ "--progress": "99.9%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="quantum-section quantum-missions" id="quantum-mission">
        <div className="section-header">
          <h2 className="section-title">Missão & Visão</h2>
          <p className="section-subtitle">
            Transformamos dados financeiros em insights estratégicos através de tecnologia neural avançada.
          </p>
        </div>
        <div className="mission-matrix">
          <div className="mission-core">
            <h3 className="mission-title">Missão</h3>
            <p className="mission-text">
              Transformar a reconciliação bancária em um processo simples, rápido e confiável, permitindo que
              empresas foquem no que realmente importa: seu crescimento e sucesso sustentável no mercado angolano
              e além.
            </p>
          </div>
          <div className="mission-core">
            <h3 className="mission-title">Visão</h3>
            <p className="mission-text">
              Ser a plataforma líder em soluções de reconciliação bancária em Angola e África, reconhecida pela
              excelência tecnológica, inovação contínua e compromisso inabalável com a satisfação dos nossos
              clientes.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="quantum-section" id="quantum-features">
        <div className="section-header">
          <h2 className="section-title">Por que Kutexa?</h2>
          <p className="section-subtitle">Tecnologia quântica aplicada à reconciliação bancária</p>
        </div>
        <div className="quantum-features">
          <div className="feature-neuron">
            <div className="feature-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h3 className="feature-title">Segurança</h3>
            <p className="feature-description">
              Criptografia de nível bancário e conformidade com padrões internacionais de segurança
            </p>
          </div>
          <div className="feature-neuron">
            <div className="feature-icon">
              <i className="fas fa-chart-bar"></i>
            </div>
            <h3 className="feature-title">Automação Total</h3>
            <p className="feature-description">
              Elimine tarefas manuais e economize até 90% do tempo gasto em reconciliação bancária.
            </p>
          </div>
          <div className="feature-neuron">
            <div className="feature-icon">
              <i className="fas fa-brain"></i>
            </div>
            <h3 className="feature-title">IA Generativa</h3>
            <p className="feature-description">
              Machine learning generativo que aprende e se adapta aos seus padrões únicos de transação em tempo
              real.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="quantum-section quantum-pricing" id="quantum-pricing">
        <div className="section-header">
          <h2 className="section-title">Escolha Sua Dimensão</h2>
          <p className="section-subtitle">Selecione o plano que se alinha com suas necessidades dimensionais</p>
        </div>
        <div className="pricing-grid-neo">
          <div className="pricing-quantum">
            <div className="pricing-header">
              <h3 className="pricing-name">PLATINA</h3>
              <div className="pricing-amount">4.500</div>
              <div className="pricing-period">Kz / mês</div>
            </div>
            <ul className="pricing-features-neo">
              <li>Até 500 transações/mês</li>
              <li>1 conta bancária</li>
              <li>Relatórios básicos</li>
              <li>Suporte por email</li>
              <li>Integração com 1 banco</li>
            </ul>
            <button className="cyber-button" style={{ width: "100%" }}>
              <span>ASSINAR AGORA</span>
            </button>
          </div>
          <div className="pricing-quantum featured">
            <div className="pricing-header">
              <h3 className="pricing-name">SAFIRA</h3>
              <div className="pricing-amount">12.000</div>
              <div className="pricing-period">Kz / mês</div>
            </div>
            <ul className="pricing-features-neo">
              <li>Até 5.000 transações/mês</li>
              <li>5 contas bancárias</li>
              <li>Relatórios avançados</li>
              <li>Suporte prioritário</li>
              <li>Integração ilimitada</li>
              <li>API access</li>
              <li>Análise com IA</li>
            </ul>
            <button className="cyber-button" style={{ width: "100%", background: "var(--gradient-neo)" }}>
              <span>ASSINAR AGORA</span>
            </button>
          </div>
          <div className="pricing-quantum">
            <div className="pricing-header">
              <h3 className="pricing-name">DIAMANTE</h3>
              <div className="pricing-amount">17.500</div>
              <div className="pricing-period">Kz / mês</div>
            </div>
            <ul className="pricing-features-neo">
              <li>Transações ilimitadas</li>
              <li>Contas ilimitadas</li>
              <li>Relatórios personalizados</li>
              <li>Suporte 24/7 dedicado</li>
              <li>Integração completa</li>
              <li>API Premium</li>
              <li>Consultoria estratégica</li>
              <li>Treinamento da equipe</li>
            </ul>
            <button className="cyber-button" style={{ width: "100%" }}>
              <span>ASSINAR AGORA</span>
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="quantum-section quantum-contact" id="quantum-contact">
        <div className="section-header">
          <h2 className="section-title">Entre em Contacto</h2>
          <p className="section-subtitle">Estabeleça uma conexão neural com nossa equipe</p>
        </div>
        <div className="contact-grid">
          <div className="contact-hologram">
            <div className="hologram-sphere">
              <div className="sphere-inner"></div>
            </div>
          </div>
          <div className="contact-form-neo">
            <form>
              <div className="form-group-neo">
                <label className="form-label-neo">Nome Completo</label>
                <input type="text" className="form-input-neo" placeholder="Seu nome" />
              </div>
              <div className="form-group-neo">
                <label className="form-label-neo">Email</label>
                <input type="email" className="form-input-neo" placeholder="seu@email.com" />
              </div>
              <div className="form-group-neo">
                <label className="form-label-neo">Telefone</label>
                <input type="tel" className="form-input-neo" placeholder="+244 923 456 789" />
              </div>
              <div className="form-group-neo">
                <label className="form-label-neo">Empresa</label>
                <input type="text" className="form-input-neo" placeholder="Nome da sua empresa" />
              </div>
              <div className="form-group-neo">
                <label className="form-label-neo">Mensagem</label>
                <textarea className="form-input-neo" rows="5" placeholder="Como podemos ajudar?"></textarea>
              </div>
              <button className="cyber-button" style={{ width: "100%", padding: "18px" }}>
                <span>ENVIAR MENSAGEM</span>
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
     <Footer/>
    </div>
  );
};

export default LandingPage;
