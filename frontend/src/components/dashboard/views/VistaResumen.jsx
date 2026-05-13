/* VistaResumen.jsx - Componente principal para la vista de resumen financiero, mostrando estadísticas clave, alertas de presupuesto y una gráfica de tendencia anual. Utiliza sub-componentes internos para mantener el código organizado y enfocado. */
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

import { PRESUPUESTO_LIMITE } from "../../../constants";
import { formatearPesos, formatearMillones } from "../../../utils/formatters";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes internos — pequeños y enfocados
// ─────────────────────────────────────────────────────────────────────────────

function AlertaPresupuesto({ totalGastado }) {
  return (
    <div className="db-alert">
      <span>⚠️</span>
      <span>
        ¡Has superado tu presupuesto mensual! Gastaste{" "}
        <strong>{formatearPesos(totalGastado)}</strong> de un límite de{" "}
        <strong>{formatearPesos(PRESUPUESTO_LIMITE)}</strong>.
      </span>
    </div>
  );
}

function TarjetaStat({ etiqueta, valor, color, icono }) {
  return (
    <div className="db-stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="db-stat-icon">{icono}</div>
      <div className="db-stat-label">{etiqueta}</div>
      <div className="db-stat-value" style={{ color }}>{valor}</div>
    </div>
  );
}

function BarraPresupuesto({ porcentaje, totalGastado, superado }) {
  return (
    <div className="db-card">
      <div className="db-budget-header">
        <span>Presupuesto mensual</span>
        <span style={{ color: superado ? "#f87171" : "#9ba3c7" }}>
          {porcentaje}% — {formatearPesos(totalGastado)} / {formatearPesos(PRESUPUESTO_LIMITE)}
        </span>
      </div>
      <div className="db-budget-track">
        <div
          className={`db-budget-fill ${superado ? "over" : "ok"}`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
}

function GraficaTendencia({ transacciones }) {
  // Agrupa por mes para la gráfica
  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

  const datos = meses.map((mes, i) => {
    const delMes = transacciones.filter(t => {
      const d = new Date(t.trans_date);
      return d.getMonth() === i;
    });
    const ingresos = delMes.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const gastos   = delMes.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { mes, ingresos, gastos, ahorros: ingresos - gastos };
  });

  return (
    <div className="db-card">
      <h3 className="db-card-title">Tendencia anual</h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={datos} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0}   />
            </linearGradient>
            <linearGradient id="gradGastos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f87171" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f87171" stopOpacity={0}   />
            </linearGradient>
            <linearGradient id="gradAhorros" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#5b6ef5" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#5b6ef5" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(91,110,245,0.18)" />
          <XAxis dataKey="mes" stroke="#9ba3c7" tick={{ fontSize: 12 }} />
          <YAxis stroke="#9ba3c7" tick={{ fontSize: 12 }} tickFormatter={formatearMillones} />
          <Tooltip
            contentStyle={{
              background: "#21253a",
              border: "1px solid rgba(91,110,245,0.18)",
              borderRadius: 10,
              color: "#f0f2ff",
            }}
            formatter={v => formatearPesos(v)}
          />
          <Legend wrapperStyle={{ fontSize: "0.8rem", color: "#9ba3c7" }} />
          <Area type="monotone" dataKey="ingresos" stroke="#34d399" fill="url(#gradIngresos)" strokeWidth={2} name="Ingresos" />
          <Area type="monotone" dataKey="gastos"   stroke="#f87171" fill="url(#gradGastos)"   strokeWidth={2} name="Gastos"   />
          <Area type="monotone" dataKey="ahorros"  stroke="#5b6ef5" fill="url(#gradAhorros)"  strokeWidth={2} name="Ahorros"  />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VistaResumen — Componente principal de esta vista
// Solo orquesta sub-componentes, no tiene lógica de cálculo
// ─────────────────────────────────────────────────────────────────────────────

export default function VistaResumen({ finanzas }) {
  const { resumen, transacciones, loading, error } = finanzas;

  if (loading) return <div className="db-empty"><span>Cargando...</span></div>;
  if (error)   return <div className="db-empty"><span>⚠️ {error}</span></div>;

  const {
    totalGastado,
    totalGanado,
    totalAhorrado,
    porcentajePresupuesto,
    presupuestoSuperado,
    cantidadTransacciones,
  } = resumen;

  const tarjetas = [
    { etiqueta: "Total Gastado",  valor: formatearPesos(totalGastado),  color: "#f87171", icono: "💸" },
    { etiqueta: "Total Ganado",   valor: formatearPesos(totalGanado),   color: "#34d399", icono: "💰" },
    { etiqueta: "Ahorrado",       valor: formatearPesos(totalAhorrado), color: "#5b6ef5", icono: "🏦" },
    { etiqueta: "Transacciones",  valor: cantidadTransacciones,         color: "#9b59f5", icono: "🔄" },
  ];

  return (
    <div>
      <h2 className="db-view-title">
        Resumen del mes — <span>{new Date().toLocaleString("es-CO", { month: "long", year: "numeric" })}</span>
      </h2>

      {presupuestoSuperado && <AlertaPresupuesto totalGastado={totalGastado} />}

      <div className="db-stat-grid">
        {tarjetas.map(tarjeta => (
          <TarjetaStat key={tarjeta.etiqueta} {...tarjeta} />
        ))}
      </div>

      <BarraPresupuesto
        porcentaje={porcentajePresupuesto}
        totalGastado={totalGastado}
        superado={presupuestoSuperado}
      />

      <GraficaTendencia transacciones={transacciones} />
    </div>
  );
}