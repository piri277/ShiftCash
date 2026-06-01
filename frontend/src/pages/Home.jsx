import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import api from '../api/axios';
import logoImg from '../assets/Logo-sinFondo1.png';
import graficaImg from '../assets/Grafica.png';
import '../styles/home.css';

function Home() {
  useTheme();

  useEffect(() => {
    // Forzamos la recalculación de inmediato
    window.dispatchEvent(new Event('resize'));
    
    // Y un pequeño refuerzo tras el primer renderizado
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Wake up backend silenciosamente (para evitar que se duerma en Render)
  useEffect(() => {
    const wakeUpBackend = async () => {
      try {
        await api.get('/');
      } catch {
        // Silencio: no hacer nada si hay error, es solo un ping de mantenimiento
      }
    };
    wakeUpBackend();
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="hero-section" id="hero">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-md-6 py-5 text-center text-md-start">
              <h1>Impulsa tus ahorros con <span>ShiftCash</span></h1>
              <p>En ShiftCash, ayudamos a gestionar tus finanzas con soluciones innovadoras y accesibles.</p>
              <div className="d-flex justify-content-center justify-content-md-start">
                <Link to="/auth" className="btn-hero-enter">Entrar</Link>
              </div>
            </div>
            <div className="col-md-6 d-flex justify-content-center">
              <img
                id="logo"
                src={logoImg}
                alt="Shift Cash"
                className="img-fluid"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quiénes Somos */}
      <section id="somos" className="somos-section py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 d-flex justify-content-center mb-4 mb-md-0">
              <img
                id="grafica"
                src={graficaImg}
                alt="Grafica de barras"
                className="img-fluid"
              />
            </div>
            <div className="col-md-6 py-5 text-center text-md-start">
              <h2>¿Quiénes somos?</h2>
              <p>Somos un equipo de profesionales apasionados por la tecnología y las finanzas, dedicados a crear soluciones que faciliten la gestión financiera de nuestros usuarios.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="services-section py-5" id="servicios">
        <div className="container">
          <h2 className="text-center mb-4">Nuestros Servicios</h2>
          <div className="row row-cols-1 row-cols-md-3 g-4">
            <ServiceCard
              icon="bi-wallet"
              title="Registrar tus gastos"
              text="Registra y categoriza tus gastos de manera sencilla y eficiente."
            />
            <ServiceCard
              icon="bi-arrow-90deg-up"
              title="Manejo de ingresos"
              text="Controla y organiza tus ingresos de manera efectiva."
            />
            <ServiceCard
              icon="bi-graph-up"
              title="Análisis de presupuesto"
              text="Analiza tu presupuesto con gráficas personalizadas para mejorar tus finanzas."
            />
          </div>
        </div>
      </section>

      {/* SECCIÓN CONTACTANOS */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-card">
            <div className="row g-0">
              
              {/* Columna Izquierda: Info */}
              <div className="col-lg-6 info-col">
                <div className="info-content">
                  <h2>Contáctanos</h2>
                  <p>¿Tienes preguntas sobre ShiftCash? Nuestro equipo de expertos financieros está listo para ayudarte a escalar tus ahorros.</p>
                  
                  <div className="contact-data">
                    <div className="contact-item">
                      <i className="bi bi-envelope-fill"></i>
                      <span>soporte@shiftcash.com</span>
                    </div>
                    <div className="contact-item">
                      <i className="bi bi-telephone-fill"></i>
                      <span>+1 (800) SHIFT-HELP</span>
                    </div>
                  </div>
                </div>
      
                {/* Social Badge Vertical */}
                <div className="social-badge">
                  <a href="#"><i className="bi bi-twitter-x"></i></a>
                  <a href="#"><i className="bi bi-facebook"></i></a>
                  <a href="#"><i className="bi bi-instagram"></i></a>
                  <a href="#"><i className="bi bi-youtube"></i></a>
                </div>
              </div>
      
              {/* Columna Derecha: Formulario */}
              <div className="col-lg-6 form-col">
                <form>
                  <div className="row">
                    <div className="col-md-6 form-group">
                      <label className="form-label">Nombre</label>
                      <input type="text" className="form-input" placeholder="Tu nombre" required />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-input" placeholder="correo@ejemplo.com" required />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Mensaje</label>
                    <textarea className="form-input" rows="4" placeholder="¿Cómo podemos ayudarte hoy?" required></textarea>
                  </div>
      
                  <button type="submit" className="btn-submit">
                    Enviar Mensaje <i className="bi bi-send-fill ms-2"></i>
                  </button>
                </form>
              </div>
      
            </div>
          </div>
        </div>
      </section>
      
    </main>
  );
}

function ServiceCard({ icon, title, text }) {
  return (
    <div className="col">
      <div className="card h-100 border-0 shadow-sm card-hover">
        <div className="card-body text-center p-4">
          <div className="icon-box mb-3">
            <i className={`bi ${icon} fs-1 text-primary`}></i>
          </div>
          <h5 className="card-title fw-bold">{title}</h5>
          <p className="card-text text-muted">{text}</p>
        </div>
      </div>
    </div>
  );
}

export default Home;