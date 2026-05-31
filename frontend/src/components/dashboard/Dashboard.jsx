/* Dashboard.jsx - Componente principal del dashboard, manejando el layout general, navegación entre vistas y la apertura del modal de nueva transacción. Utiliza un sistema de routing interno basado en estado para mostrar la vista activa. */
import { useState } from "react";

import Sidebar            from "./layout/Sidebar";
import Topbar             from "./layout/Topbar";
import BottomNavBar       from "./layout/BottomNavBar";
import VistaResumen       from "./views/VistaResumen";
import VistaHistorial     from "./views/VistaHistorial";
import VistaGraficas      from "./views/VistaGraficas";
import VistaConfiguracion from "./views/VistaConfiguracion";
import VistaCategorias    from "./views/VistaCategorias";
import VistaPresupuestos  from "./views/VistaPresupuestos";
import VistaMetas         from "./views/VistaMetas";
import ModalTransaccion   from "./modals/ModalTransaccion";
import { useFinanzas }    from "../../hooks/useFinanzas";
import { useBudgets }     from "../../hooks/useBudgets";
import { useMediaQuery }  from "../../hooks/useMediaQuery";
import { useTheme }       from "../../hooks/useTheme";
import { MENU_ITEMS }     from "../../constants";
import SplashScreen       from "./SplashScreen";

import "../../styles/dashboard.css";
import "../../styles/TemaClaro.css";

// Dashboard 

export default function Dashboard() {
  useTheme(); // Esto ahora leerá de localStorage automáticamente

  const [vistaActiva, setVistaActiva] = useState("resumen");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loading, setLoading] = useState(true);
  const finanzas = useFinanzas();
  const budgets = useBudgets();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const itemActivo = MENU_ITEMS.find(item => item.key === vistaActiva);

  const VISTAS = {
    resumen:       <VistaResumen       finanzas={finanzas} budgets={budgets} />,
    historial:     <VistaHistorial     finanzas={finanzas} />,
    graficas:      <VistaGraficas      finanzas={finanzas} />,
    categorias:    <VistaCategorias    />,
    presupuestos:  <VistaPresupuestos  budgets={budgets} />,
    metas:         <VistaMetas         />,
    configuracion: <VistaConfiguracion />,
  };

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }

  return (
    <div className="db-app">
      {/* Sidebar: solo en desktop */}
      {!isMobile && <Sidebar vistaActiva={vistaActiva} onCambiarVista={setVistaActiva} />}

      <div className="db-main">
        <Topbar
          itemActivo={itemActivo}
          onNuevaTransaccion={() => setModalAbierto(true)}
        />
        <main className="db-content">
          {VISTAS[vistaActiva]}
        </main>
      </div>

      {/* Bottom Nav: solo en móvil */}
      {isMobile && <BottomNavBar vistaActiva={vistaActiva} onCambiarVista={setVistaActiva} />}

      {modalAbierto && (
        <ModalTransaccion
          onClose={() => setModalAbierto(false)}
          onSuccess={() => {
            finanzas.recargar();
            budgets.recargar();
          }}
        />
      )}
    </div>
  );
}