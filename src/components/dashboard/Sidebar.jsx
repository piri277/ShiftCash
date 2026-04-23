import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MENU_ITEMS } from "../../constants";
import { usuarioActual } from "../../data/mockData";

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar — Navegación + menú de usuario con opción de cerrar sesión
// El menú del perfil se abre/cierra al hacer click en el bloque de usuario
// ─────────────────────────────────────────────────────────────────────────────

export default function Sidebar({ vistaActiva, onCambiarVista }) {
  const navigate = useNavigate();
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

  const handleCerrarSesion = () => {
    // TODO: cuando llegue el backend, limpiar token/sesión aquí antes de navegar
    // Ejemplo futuro: authService.logout();
    setMenuUsuarioAbierto(false);
    navigate("/");
  };

  return (
    <aside className="db-sidebar">
      <div className="db-brand">
        Shift<span>Cash</span>
      </div>

      <nav className="db-nav">
        {MENU_ITEMS.map(item => (
          <div
            key={item.key}
            className={`db-nav-item ${vistaActiva === item.key ? "active" : ""}`}
            onClick={() => onCambiarVista(item.key)}
          >
            <span>{item.icono}</span>
            <span>{item.etiqueta}</span>
          </div>
        ))}
      </nav>

      {/* Bloque de usuario — click abre/cierra el menú */}
      <div className="db-user-wrapper">

        {/* Menú flotante — visible solo cuando menuUsuarioAbierto es true */}
        {menuUsuarioAbierto && (
          <div className="db-user-menu">
            <div className="db-user-menu-info">
              <div className="db-user-name">{usuarioActual.nombre}</div>
              <div className="db-user-email">{usuarioActual.email}</div>
            </div>
            <hr className="db-user-menu-divider" />
            <button
              className="db-user-menu-item db-user-menu-item--danger"
              onClick={handleCerrarSesion}
            >
              <span>🚪</span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}

        <div
          className="db-user"
          onClick={() => setMenuUsuarioAbierto(prev => !prev)}
          title="Opciones de cuenta"
        >
          <div className="db-avatar">{usuarioActual.iniciales}</div>
          <div>
            <div className="db-user-name">{usuarioActual.nombre}</div>
            <div className="db-user-email">{usuarioActual.email}</div>
          </div>
          {/* Flecha que indica si el menú está abierto o cerrado */}
          <span className="db-user-chevron">
            {menuUsuarioAbierto ? "▲" : "▼"}
          </span>
        </div>
      </div>
    </aside>
  );
}