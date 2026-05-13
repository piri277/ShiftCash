import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth';
import '../styles/registro.css';

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Estado para el error de contraseña
  const [passwordError, setPasswordError] = useState('');

  // 2. Función de validación inline
  const validatePassword = (value) => {
    if (value.length > 0 && value.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 3. Bloqueo de envío si la contraseña es corta
    if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await registerUser(username, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="fondo">
      <section className="form-section" id="principal">
        <div className="container text-center" id="tarjeta">
          <h2>Regístrate</h2>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Nombre de usuario</label>
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Ingresa tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Contraseña</label>
              {/* 4. Input con clase dinámica is-invalid */}
              <input
                type="password"
                className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                id="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                required
              />
              {/* 5. Mensaje de error con clase invalid-feedback */}
              {passwordError && (
                <div className="invalid-feedback text-start">{passwordError}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="confirm-password" className="form-label">Confirmar Contraseña</label>
              <input
                type="password"
                className="form-control"
                id="confirm-password"
                placeholder="Confirma tu contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              id="btn-registrate" 
              disabled={loading || passwordError !== ''}
            >
              {loading ? 'Cargando...' : 'Regístrate'}
            </button>
          </form>

          <div className="mt-3">
            <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Register;