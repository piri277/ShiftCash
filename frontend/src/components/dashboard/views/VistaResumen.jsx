/* VistaResumen.jsx */
import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
} from "recharts";

import { PRESUPUESTO_LIMITE } from "../../../constants";
import { formatearPesos, formatearEjeY } from "../../../utils/formatters";

const TOOLTIP_STYLE = {
  background: "#21253a",
  border: "1px solid rgba(91,110,245,0.18)",
  borderRadius: 10,
  color: "#f0f2ff",
};

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const DIAS  = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

// Helpers de filtrado 
function filtrarPorPeriodo(transacciones, periodo) {
  const hoy = new Date();

  if (periodo === "semana") {
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    lunes.setHours(0, 0, 0, 0);
    return transacciones.filter(t => new Date(t.trans_date) >= lunes);
  }

  if (periodo === "mes") {
    return transacciones.filter(t => {
      const d = new Date(t.trans_date);
      return d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear();
    });
  }

  return transacciones; // anual
}


function construirDatos(transacciones, periodo) {

 const txFiltradas = filtrarPorPeriodo(transacciones, periodo);

  if (periodo === "semana") {
     const hoy   = new Date();
     const lunes = new Date(hoy);
     lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
     return DIAS.map((dia, i) => {
      const fecha    = new Date(lunes);
      fecha.setDate(lunes.getDate() + i);
      const str      = fecha.toISOString().slice(0, 10);
      const delDia   = txFiltradas.filter(t => t.trans_date.slice(0, 10) === str);
      const ingresos = delDia.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const gastos   = delDia.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { label: dia, ingresos, gastos, ahorros: ingresos - gastos };
    });
  }

  if (periodo === "mes") {
    const hoy      = new Date();
    const diasMes  = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
    return Array.from({ length: diasMes }, (_, i) => {
      const dia      = i + 1;
      const fechaStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
      const delDia   = transacciones.filter(t => t.trans_date.slice(0, 10) === fechaStr);
      const ingresos = delDia.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const gastos   = delDia.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { label: String(dia), ingresos, gastos, ahorros: ingresos - gastos };
    });
  }

  // anual
  return MESES.map((mes, i) => {
    const delMes   = transacciones.filter(t => new Date(t.trans_date).getMonth() === i);
    const ingresos = delMes.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const gastos   = delMes.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { label: mes, ingresos, gastos, ahorros: ingresos - gastos };
  });
}

// ── Sub-componentes ───────────────────────────────────────────────────────────
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
        <div className={`db-budget-fill ${superado ? "over" : "ok"}`}
          style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  );
}

// ── Carousel header ───────────────────────────────────────────────────────────
const GRAFICAS = ["tendencia", "barras"];
const LABELS   = { tendencia: "Tendencia", barras: "Ingresos vs Gastos" };
const PERIODOS = [
  { value: "semana", label: "Semana" },
  { value: "mes",    label: "Mes"    },
  { value: "anual",  label: "Año"    },
];

function GraficaCarousel({ transacciones }) {
  const [indice,  setIndice]  = useState(0);
  const [periodo, setPeriodo] = useState("anual");

  const grafica  = GRAFICAS[indice];
  const datos    = construirDatos(transacciones, periodo);
  const etiqueta = periodo === "semana" ? "esta semana"
                 : periodo === "mes"    ? MESES[new Date().getMonth()]
                 : String(new Date().getFullYear());

  return (
    <div className="db-card">
      {/* Header con el título*/}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", gap: 8, flexWrap: "wrap" }}>

        {/* Título y etiqueta periodo */}
        <div>
          <h3 className="db-card-title" style={{ margin: 0 }}>{LABELS[grafica]}</h3>
          <span style={{ fontSize: "0.75rem", color: "#555e82" }}>{etiqueta}</span>
        </div>

        {/* Chips de periodo */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {PERIODOS.map(p => (
            <button key={p.value} onClick={() => setPeriodo(p.value)}
              style={{
                padding: "3px 12px",
                borderRadius: 99,
                border: "1px solid",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                borderColor:    periodo === p.value ? "#5b6ef5" : "rgba(91,110,245,0.2)",
                background:     periodo === p.value ? "rgba(91,110,245,0.15)" : "transparent",
                color:          periodo === p.value ? "#a0aaff" : "#555e82",
              }}
            >
              {p.label}
            </button>
          ))}

          {/* Flechas */}
          <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
            {["←", "→"].map((flecha, fi) => (
              <button key={flecha}
                onClick={() => setIndice(p => (p + (fi === 0 ? -1 : 1) + GRAFICAS.length) % GRAFICAS.length)}
                style={{
                  width: 28, height: 28,
                  borderRadius: 8,
                  border: "1px solid rgba(91,110,245,0.2)",
                  background: "rgba(91,110,245,0.07)",
                  color: "#9ba3c7",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(91,110,245,0.18)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(91,110,245,0.07)"}
              >
                {flecha}
              </button>
            ))}
          </div>

          {/* Indicador de puntos */}
          <div style={{ display: "flex", gap: 4 }}>
            {GRAFICAS.map((_, i) => (
              <div key={i} onClick={() => setIndice(i)}
                style={{
                  width: i === indice ? 16 : 6,
                  height: 6,
                  borderRadius: 99,
                  background: i === indice ? "#5b6ef5" : "rgba(91,110,245,0.2)",
                  cursor: "pointer",
                  transition: "all 0.25s",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Gráfica activa */}
      {grafica === "tendencia" && (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={datos} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              {[["gradIngresos","#34d399"],["gradGastos","#f87171"],["gradAhorros","#5b6ef5"]].map(([id, color]) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0}   />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(91,110,245,0.18)" />
            <XAxis dataKey="label" stroke="#9ba3c7" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9ba3c7" tick={{ fontSize: 12 }} tickFormatter={formatearEjeY} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => formatearPesos(v)} />
            <Legend wrapperStyle={{ fontSize: "0.8rem", color: "#9ba3c7" }} />
            <Area type="monotone" dataKey="ingresos" stroke="#34d399" fill="url(#gradIngresos)" strokeWidth={2} name="Ingresos" />
            <Area type="monotone" dataKey="gastos"   stroke="#f87171" fill="url(#gradGastos)"   strokeWidth={2} name="Gastos"   />
            <Area type="monotone" dataKey="ahorros"  stroke="#5b6ef5" fill="url(#gradAhorros)"  strokeWidth={2} name="Ahorros"  />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {grafica === "barras" && (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={datos} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(91,110,245,0.18)" />
            <XAxis dataKey="label" stroke="#9ba3c7" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9ba3c7" tick={{ fontSize: 12 }} tickFormatter={formatearEjeY} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => formatearPesos(v)} />
            <Legend wrapperStyle={{ fontSize: "0.8rem", color: "#9ba3c7" }} />
            <Bar dataKey="ingresos" fill="#34d399" radius={[4,4,0,0]} name="Ingresos" />
            <Bar dataKey="gastos"   fill="#f87171" radius={[4,4,0,0]} name="Gastos"   />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// Vista principal 
export default function VistaResumen({ finanzas }) {
  const { resumen, transacciones, loading, error } = finanzas;

  if (loading) return <div className="db-empty"><span>Cargando...</span></div>;
  if (error)   return <div className="db-empty"><span>⚠️ {error}</span></div>;

  const { totalGastado, totalGanado, totalAhorrado,
          porcentajePresupuesto, presupuestoSuperado, cantidadTransacciones } = resumen;

  const tarjetas = [
    { etiqueta: "Total Gastado", valor: formatearPesos(totalGastado),  color: "#f87171", icono: "💸" },
    { etiqueta: "Total Ganado",  valor: formatearPesos(totalGanado),   color: "#34d399", icono: "💰" },
    { etiqueta: "Ahorrado",      valor: formatearPesos(totalAhorrado), color: "#5b6ef5", icono: "🏦" },
    { etiqueta: "Transacciones", valor: cantidadTransacciones,         color: "#9b59f5", icono: "🔄" },
  ];

  return (
    <div>
      <h2 className="db-view-title">
        Resumen del mes — <span>{new Date().toLocaleString("es-CO", { month: "long", year: "numeric" })}</span>
      </h2>

      {presupuestoSuperado && <AlertaPresupuesto totalGastado={totalGastado} />}

      <div className="db-stat-grid">
        {tarjetas.map(t => <TarjetaStat key={t.etiqueta} {...t} />)}
      </div>

      <BarraPresupuesto porcentaje={porcentajePresupuesto}
        totalGastado={totalGastado} superado={presupuestoSuperado} />

      <GraficaCarousel transacciones={transacciones} />
    </div>
  );
}