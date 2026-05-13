import { useState } from "react";

import Sidebar            from "./Sidebar";
import Topbar             from "./Topbar";
import VistaResumen       from "./views/VistaResumen";
import VistaHistorial     from "./views/VistaHistorial";
import VistaGraficas      from "./views/VistaGraficas";
import VistaConfiguracion from "./views/VistaConfiguracion";
import { MENU_ITEMS }     from "../../constants";

import "../../styles/dashboard.css";

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard — Solo layout y routing de vistas.
// Para agregar una nueva vista: añadirla en MENU_ITEMS (constants) y acá abajo.
// ─────────────────────────────────────────────────────────────────────────────

const VISTAS = {
  resumen:       <VistaResumen       />,
  historial:     <VistaHistorial     />,
  graficas:      <VistaGraficas      />,
  configuracion: <VistaConfiguracion />,
};

export default function Dashboard() {
  const [vistaActiva, setVistaActiva] = useState("resumen");

  const itemActivo = MENU_ITEMS.find(item => item.key === vistaActiva);

  const handleNuevaTransaccion = () => {
    // TODO: abrir modal de nueva transacción
    console.log("TODO: abrir modal de nueva transacción");
  };

  return (
    <div className="db-app">
      <Sidebar
        vistaActiva={vistaActiva}
        onCambiarVista={setVistaActiva}
      />

      <div className="db-main">
        <Topbar
          itemActivo={itemActivo}
          onNuevaTransaccion={handleNuevaTransaccion}
        />
        <main className="db-content">
          {VISTAS[vistaActiva]}
        </main>
      </div>
    </div>
  );
}