import { 
  LayoutDashboard, 
  History, 
  BarChart3,
  Layers, 
  Wallet2,
  Target, 
  User
} from "lucide-react";

export default function BottomNavBar({ vistaActiva, onCambiarVista }) {
  const menuItems = [
    { key: "resumen",    etiqueta: "Dashboard", icon: LayoutDashboard },
    { key: "historial",  etiqueta: "History",   icon: History },
    { key: "graficas",   etiqueta: "Charts",    icon: BarChart3 },
    { key: "categorias", etiqueta: "Categories", icon: Layers },
    { key: "presupuestos", etiqueta: "Budgets", icon: Wallet2 },
    { key: "metas",      etiqueta: "Goals",     icon: Target },
    { key: "perfil",     etiqueta: "Profile",   icon: User },
  ];

  const handleNavClick = (key) => {
    if (key === "perfil") {
      // Para perfil, navegar a configuración por ahora
      onCambiarVista("configuracion");
    } else {
      onCambiarVista(key);
    }
  };

  return (
    <nav className="db-bottom-nav">
      {menuItems.map(item => {
        const Icon = item.icon;
        const isActive = vistaActiva === item.key || (item.key === "perfil" && vistaActiva === "configuracion");
        
        return (
          <button
            key={item.key}
            className={`bottom-nav-item ${isActive ? "active" : ""}`}
            onClick={() => handleNavClick(item.key)}
            title={item.etiqueta}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 1.8} className="bottom-nav-icon" />
          </button>
        );
      })}
    </nav>
  );
}
