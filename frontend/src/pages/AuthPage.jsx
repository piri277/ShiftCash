import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { loginUser, registerUser, googleAuthUser } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isActive, setIsActive] = useState(false);

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register states
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Google OAuth
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setGoogleError('');
      try {
        const data = await googleAuthUser(tokenResponse.access_token);
        login(data.access_token, data.user);
        navigate('/dashboard');
      } catch {
        setGoogleError('Error al iniciar sesión con Google');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setGoogleError('Error al iniciar sesión con Google'),
  });

  // En desktop bloquea el scroll del body para que no aparezca scrollbar innecesario.
  // En móvil (<=650px) lo deja libre para que el formulario sea scrolleable.
  useEffect(() => {
    const isMobile = window.innerWidth <= 650;
    if (!isMobile) {
      document.body.style.overflow = 'hidden';
    }
    window.scrollTo(0, 0); // Asegura que la página empiece arriba del todo
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Password validation
  const validatePassword = (value) => {
    if (value.length > 0 && value.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
    } else {
      setPasswordError('');
    }
  };

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const data = await loginUser(loginEmail, loginPassword);
      login(data.access_token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.response?.data?.detail || 'Credenciales incorrectas');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (registerPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (registerPassword !== registerConfirm) {
      setRegisterError('Las contraseñas no coinciden');
      return;
    }

    setRegisterLoading(true);
    try {
      await registerUser(registerUsername, registerEmail, registerPassword);
      setRegisterError('');
      alert('Registro exitoso. Por favor inicia sesión.');
      setIsActive(false);
      setRegisterUsername('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirm('');
      setPasswordError('');
    } catch (err) {
      setRegisterError(err.response?.data?.detail || 'Error al registrarse');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className={`auth-form-box ${isActive ? 'active' : ''}`}>

        {/* LOGIN FORM */}
        <div className="form-box login">
          <form onSubmit={handleLoginSubmit}>
            <h1>Login</h1>
            {loginError && <div className="alert alert-error">{loginError}</div>}

            <div className="input-box">
              <input
                type="email"
                placeholder="Correo Electrónico"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                name="email"
                autoComplete="email"
                required
              />
              <i className="bi bi-envelope"></i>
            </div>

            <div className="input-box">
              <input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                name="password"
                autoComplete="current-password"
                required
              />
              <i 
                className={`bi ${showLoginPassword ? 'bi-eye-slash' : 'bi-eye'} toggle-password`}
                onClick={() => setShowLoginPassword(!showLoginPassword)}
              ></i>
            </div>

            <div className="forgot-link">
              <a href="#">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className="btn" disabled={loginLoading}>
              {loginLoading ? 'Cargando...' : 'Login'}
            </button>

            <p>Inicia sesión con</p>
            {googleError && <div className="alert alert-error">{googleError}</div>}
            <div className="social-icons">
              <button
                type="button"
                className="google"
                onClick={() => triggerGoogleLogin()}
                disabled={googleLoading}
                title="Iniciar sesión con Google"
              >
                <i className="bi bi-google"></i>
              </button>
              <a href="#" className="facebook"><i className="bi bi-facebook"></i></a>
            </div>
          </form>
        </div>

        {/* REGISTER FORM */}
        <div className="form-box register">
          <form onSubmit={handleRegisterSubmit}>
            <h1>Regístrate</h1>
            {registerError && <div className="alert alert-error">{registerError}</div>}

            <div className="input-box">
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                name="username"
                autoComplete="username"
                required
              />
              <i className="bi bi-person"></i>
            </div>

            <div className="input-box">
              <input
                type="email"
                placeholder="Correo Electrónico"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                name="email"
                autoComplete="email"
                required
              />
              <i className="bi bi-envelope"></i>
            </div>

            <div className="input-box">
              <input
                type={showRegisterPassword ? "text" : "password"}
                placeholder="Contraseña"
                className={passwordError ? 'input-error' : ''}
                value={registerPassword}
                onChange={(e) => {
                  setRegisterPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                name="password"
                autoComplete="new-password"
                required
              />
              <i 
                className={`bi ${showRegisterPassword ? 'bi-eye-slash' : 'bi-eye'} toggle-password`}
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
              ></i>
              {passwordError && <span className="error-text">{passwordError}</span>}
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Confirmar Contraseña"
                value={registerConfirm}
                onChange={(e) => setRegisterConfirm(e.target.value)}
                name="confirm-password"
                autoComplete="new-password"
                required
              />
              <i className="bi bi-shield-lock"></i>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={registerLoading || passwordError !== ''}
            >
              {registerLoading ? 'Cargando...' : 'Regístrate'}
            </button>

            <p>Regístrate con</p>
            {googleError && <div className="alert alert-error">{googleError}</div>}
            <div className="social-icons">
              <button
                type="button"
                className="google"
                onClick={() => triggerGoogleLogin()}
                disabled={googleLoading}
                title="Registrarse con Google"
              >
                <i className="bi bi-google"></i>
              </button>
              <a href="#" className="facebook"><i className="bi bi-facebook"></i></a>
            </div>
          </form>
        </div>

        {/* TOGGLE SECTION */}
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>¡Hola, Bienvenido!</h1>
            <p>¿No tienes una cuenta?</p>
            <button
              type="button"
              className="btn register-btn"
              onClick={() => setIsActive(true)}
            >
              Regístrate
            </button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>¡Hola de nuevo!</h1>
            <p>¿Ya tienes una cuenta?</p>
            <button
              type="button"
              className="btn login-btn"
              onClick={() => setIsActive(false)}
            >
              Login
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AuthPage;