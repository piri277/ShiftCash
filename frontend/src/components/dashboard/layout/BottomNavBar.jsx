import { 
  LayoutDashboard, 
  History, 
  BarChart3,
  Layers, 
  Wallet2, 
  Target
} from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";

export default function BottomNavBar({ vistaActiva, onCambiarVista }) {
  const { user } = useAuth();
  const iniciales = user?.username?.slice(0, 2).toUpperCase() ?? "??";

  const menuItems = [
    { key: "resumen",      etiqueta: "Dashboard",  icon: LayoutDashboard },
    { key: "historial",    etiqueta: "Historial",  icon: History },
    { key: "graficas",     etiqueta: "Gráficas",   icon: BarChart3 },
    { key: "categorias",   etiqueta: "Categorías", icon: Layers },
    { key: "presupuestos", etiqueta: "Budgets",    icon: Wallet2 },
    { key: "metas",        etiqueta: "Metas",      icon: Target },
  ];

  const isConfigActive = vistaActiva === "configuracion";

  return (
    <nav className="db-bottom-nav">
      {menuItems.map(item => {
        const Icon = item.icon;
        const isActive = vistaActiva === item.key;
        return (
          <button
            key={item.key}
            className={`bottom-nav-item ${isActive ? "active" : ""}`}
            onClick={() => onCambiarVista(item.key)}
            title={item.etiqueta}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 1.8} className="bottom-nav-icon" />
          </button>
        );
      })}

      {/* Botón de perfil con avatar */}
      <button
        className={`bottom-nav-item ${isConfigActive ? "active" : ""}`}
        onClick={() => onCambiarVista("configuracion")}
        title="Perfil"
      >
        <div className={`bottom-nav-avatar ${isConfigActive ? "active" : ""}`}>
          {user?.profile_pic
            ? <img src={user.profile_pic} alt="perfil" />
            : <span>{iniciales}</span>
          }
        </div>
      </button>
    </nav>
  );
}