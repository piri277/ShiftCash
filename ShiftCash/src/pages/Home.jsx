import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css'; 

function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero-section" id="hero">
        <div className="container py-5">
          <div className="row align-items-center text-center">
            <div className="col-md-6 py-5">
              <h1>Impulsa tus ahorros con ShiftCash</h1>
              <p>En ShiftCash, ayudamos a gestionar tus finanzas con soluciones innovadoras y accesibles.</p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/login" className="btn" id="btn-iniciar-sesion">Inicia Sesion</Link>
                <Link to="/registro" className="btn" id="btn-registrarse">Registrate</Link>
              </div>
            </div>
            <div className="col-md-6">
              <img id="logo" src="/Logo-sinFondo.png" alt="Shift Cash" className="img-fluid" />
            </div>
          </div>
        </div>
      </section>

      {/* Quiénes Somos */}
      <section id="somos" className="somos-section py-5">
        <div className="container">
          <div className="row align-items-center text-center">
            <div className="col-md-6">
              <img id="grafica" src="/Grafica.jpg" alt="Grafica de barras" className="img-fluid" />
            </div>
            <div className="col-md-6 py-5">
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
    </main>
  );
}

// Componente pequeño para las tarjetas
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