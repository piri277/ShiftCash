import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MENU_ITEMS } from "../../constants";
import { useAuth } from "../../hooks/useAuth";

export default function Sidebar({ vistaActiva, onCambiarVista }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth(); 
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const handleToggleMenu = () => {
    setMenuUsuarioAbierto(prev => {
      if (prev) setMostrarConfirmacion(false); // resetea al cerrar
      return !prev;
    });
  };

  const ejecutarLogout = () => {
    logout();
    navigate("/");
  };

  const iniciales = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

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
          {!mostrarConfirmacion ? (
            <>
              <div className="db-user-menu-info">
                <div className="db-user-name">{user?.username}</div>
                <div className="db-user-email">{user?.email}</div>
              </div>
              <hr className="db-user-menu-divider" />
              <button
                className="db-user-menu-item db-user-menu-item--danger"
                onClick={() => setMostrarConfirmacion(true)} // Cambia a modo confirmación
              >
                <span>🚪</span>
                <span>Cerrar sesión</span>
              </button>
            </>
          ) : (
            // Vista de confirmación dentro del mismo menú
            <div className="db-user-menu-confirmacion">
              <p>¿Cerrar sesión?</p>
              <div className="db-user-menu-confirmacion-btns">
                <button className="btn-confirm-si" onClick={ejecutarLogout}>
                  Sí, salir
                </button>
                <button className="btn-confirm-no" onClick={() => setMostrarConfirmacion(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

        <div
          className="db-user"
          onClick={handleToggleMenu}
          title="Opciones de cuenta"
        >
          <div className="db-avatar">{iniciales}</div>
          <div style={{ minWidth: 0 }}>
            <div className="db-user-name">{user?.username}</div>
            <div className="db-user-email">{user?.email}</div>
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