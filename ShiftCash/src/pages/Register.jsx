import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/registro.css'; 

function Register() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registrando usuario...");
  };

  return (
    <div id="fondo">
      <section className="form-section" id="principal">
        <div className="container text-center" id="tarjeta">
          <h2>Regístrate</h2>
          <form className="needs-validation" onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Nombre de usuario</label>
              <input type="text" className="form-control" id="username" placeholder="Ingresa tu nombre de usuario" required />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Correo Electrónico</label>
              <input type="email" className="form-control" id="email" placeholder="Ingresa tu correo electrónico" required />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input type="password" className="form-control" id="password" placeholder="Ingresa tu contraseña" required />
            </div>
            <div className="mb-3">
              <label htmlFor="confirm-password" className="form-label">Confirmar Contraseña</label>
              <input type="password" className="form-control" id="confirm-password" placeholder="Confirma tu contraseña" required />
            </div>
            <button type="submit" className="btn" id="btn-registrate">Registrate</button>
          </form>
          <div className="container text-center mt-3">
            <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Register;