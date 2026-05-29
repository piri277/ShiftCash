import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar navbar-expand-md">
      <div className="container">
        <Link className="navbar-brand brand-bounce" to="/">
          <span className="bounce-letter">S</span>
          <span className="bounce-letter">h</span>
          <span className="bounce-letter">i</span>
          <span className="bounce-letter">f</span>
          <span className="bounce-letter">t</span>
          <span className="bounce-letter text-cash">C</span>
          <span className="bounce-letter text-cash">a</span>
          <span className="bounce-letter text-cash">s</span>
          <span className="bounce-letter text-cash">h</span>
          <i className="bi bi-coin fs-4 text-primary bounce-letter ms-2"></i>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item d-flex align-items-center">
              <div className="theme-toggle-home">
                <button 
                  className={theme === 'light' ? 'light' : ''} 
                  onClick={toggleTheme}
                  aria-label="Cambiar tema"
                >
                  <div className="toggle-circle">{theme === 'dark' ? '🌙' : '☀️'}</div>
                </button>
              </div>
            </li>
            <li className="nav-item"><Link className="nav-link" to="/">Inicio</Link></li>
            <li className="nav-item"><Link className="nav-link btn-navbar-enter" to="/auth">Entrar</Link></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;