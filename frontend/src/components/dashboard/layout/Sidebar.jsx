import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { 
  LayoutDashboard, 
  History, 
  PieChart, 
  Layers, 
  Wallet2, 
  Target, 
  Settings, 
  LogOut, 
  ChevronUp, 
  User,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

export default function Sidebar({ vistaActiva, onCambiarVista }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth(); 
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Inicia colapsado por defecto

  // Definimos los items aquí para mapear los iconos de Lucide
  const menuItems = useMemo(() => [
    { key: "resumen",       etiqueta: "Resumen",         icon: LayoutDashboard },
    { key: "historial",     etiqueta: "Historial",       icon: History },
    { key: "graficas",      etiqueta: "Gráficas",        icon: PieChart },
    { key: "categorias",    etiqueta: "Categorías",      icon: Layers },
    { key: "presupuestos",  etiqueta: "Presupuestos",    icon: Wallet2 },
    { key: "metas",         etiqueta: "Metas de Ahorro", icon: Target },
  ], []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className={`db-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Brand sin borde inferior, más limpio */}
      <div className="db-brand">
        <div className="brand-logo brand-bounce">
          {"Shift".split("").map((l, i) => (
            <span key={i} className="bounce-letter logo-text" style={{ animationDelay: `${i * 0.1}s` }}>{l}</span>
          ))}
          {"Cash".split("").map((l, i) => (
            <span key={i} className="bounce-letter logo-accent" style={{ animationDelay: `${(i + 5) * 0.1}s` }}>{l}</span>
          ))}
        </div>
        <button 
          className="btn-sidebar-toggle" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir" : "Contraer"}
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      {/* Navegación Principal */}
      <nav className="db-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = vistaActiva === item.key;
          return (
            <div
              key={item.key}
              className={`db-nav-item ${isActive ? "active" : ""}`}
              onClick={() => onCambiarVista(item.key)}
            >
              {isActive && <div className="active-indicator" />}
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} className="nav-icon" />
              <span className="nav-label">{item.etiqueta}</span>
            </div>
          );
        })}
      </nav>

      {/* Perfil Inferior con Dropdown Moderno */}
      <div className="db-user-section">
        {dropdownOpen && (
          <div className="db-profile-dropdown glass-effect">
            <div className="dropdown-user-info">
              <p className="user-name">{user?.username}</p>
              <p className="user-email">{user?.email}</p>
            </div>
            <button className="dropdown-item" onClick={() => { onCambiarVista('configuracion'); setDropdownOpen(false); }}>
              <Settings size={16} />
              <span>Configuración</span>
            </button>
            <button className="dropdown-item logout" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}

        <div 
          className={`db-compact-profile ${dropdownOpen ? 'active' : ''}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="profile-avatar">
            <User size={18} />
          </div>
          <div className="profile-details">
            <span className="profile-name">{user?.username}</span>
          </div>
          <ChevronUp 
            size={16} 
            className={`chevron-icon ${dropdownOpen ? 'rotated' : ''}`} 
          />
        </div>
      </div>
    </aside>
  );
}