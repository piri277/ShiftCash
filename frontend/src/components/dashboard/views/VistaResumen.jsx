/* VistaResumen.jsx */
import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
} from "recharts";

import { useBudgets } from "../../../hooks/useBudgets";
import { useMetas } from "../../../hooks/useMetas";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { formatearPesos, formatearEjeY } from "../../../utils/formatters";
import { parsearFechaLocal, fechaAString } from "../../../utils/dates"; // ✅ fix

import "../../../styles/modal.css";

const TOOLTIP_STYLE = {
  background: "var(--surface, #21253a)",
  border: "1px solid var(--border, rgba(91,110,245,0.18))",
  borderRadius: 10,
  color: "var(--text-primary, #f0f2ff)",
};

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const DIAS  = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

// Función auxiliar para obtener el color de la barra según el progreso
const getBarColor = (pct) => {
  if (pct >= 100) return "linear-gradient(90deg, #f87171, #ef4444)";
  if (pct >= 85)  return "linear-gradient(90deg, #fb923c, #f87171)";
  if (pct >= 60)  return "linear-gradient(90deg, #9b59f5, #fb923c)";
  if (pct >= 35)  return "linear-gradient(90deg, #7c8df7, #9b59f5)";
  return "linear-gradient(90deg, #5b6ef5, #7c8df7)";
};

// Helpers de filtrado 
function filtrarPorPeriodo(transacciones, periodo) {
  const hoy = new Date();

  if (periodo === "semanalmente") {
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    lunes.setHours(0, 0, 0, 0);
    return transacciones.filter(t => parsearFechaLocal(t.trans_date) >= lunes); 
  }

  if (periodo === "mensualmente") {
    return transacciones.filter(t => {
      const d = parsearFechaLocal(t.trans_date); 
      return d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear();
    });
  }

  if (periodo === "diariamente") {
    return transacciones.filter(t => {
      const d = parsearFechaLocal(t.trans_date); 
      return d.toDateString() === hoy.toDateString();
    });
  }

  return transacciones;
}

function construirDatos(transacciones, periodo) {
  const txFiltradas = filtrarPorPeriodo(transacciones, periodo);

  if (periodo === "diariamente") {
    return [{
      label: "Hoy",
      ingresos: txFiltradas.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
      gastos: txFiltradas.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      ahorros: 0
    }].map(d => ({ ...d, ahorros: d.ingresos - d.gastos }));
  }

  if (periodo === "semanalmente") {
    const hoy   = new Date();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    return DIAS.map((dia, i) => {
      const fecha    = new Date(lunes);
      fecha.setDate(lunes.getDate() + i);
      const str      = fechaAString(fecha); 
      const delDia   = txFiltradas.filter(t => t.trans_date.slice(0, 10) === str);
      const ingresos = delDia.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const gastos   = delDia.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { label: dia, ingresos, gastos, ahorros: ingresos - gastos };
    });
  }

  if (periodo === "mensualmente") {
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

  // único o por defecto - anual
  return MESES.map((mes, i) => {
    const delMes   = transacciones.filter(t => parsearFechaLocal(t.trans_date).getMonth() === i); // ✅ fix
    const ingresos = delMes.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const gastos   = delMes.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { label: mes, ingresos, gastos, ahorros: ingresos - gastos };
  });
}

// ── Sub-componentes ───────────────────────────────────────────────────────────
function AlertaPresupuesto({ totalGastado, totalAsignado, periodo, porcentaje }) {
  const label = periodo === "mensualmente" ? "mensual" : periodo === "semanalmente" ? "semanal" : "diario";
  const esSuperado = porcentaje >= 100;

  return (
    <div className={`db-alert ${esSuperado ? 'danger' : 'warning'}`}>
      <span>{esSuperado ? '🚨' : '⚠️'}</span>
      <span>
        {esSuperado 
          ? `¡Has superado tu presupuesto ${label}!` 
          : `¡Atención! Estás cerca de alcanzar tu límite ${label} (${porcentaje.toFixed(0)}%).`}
        {" "}
        Gastaste <strong>{formatearPesos(totalGastado)}</strong> de{" "}
        <strong>{formatearPesos(totalAsignado)}</strong>.
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

function BarraPresupuesto({ presupuestosDelPeriodo, periodo, setPeriodo }) {
  const totalAsignado = presupuestosDelPeriodo.reduce((sum, b) => sum + b.amount, 0);
  const totalGastado = presupuestosDelPeriodo.reduce((sum, b) => sum + b.spent, 0);
  const porcentaje = totalAsignado > 0 ? (totalGastado / totalAsignado) * 100 : 0;
  const superado = porcentaje > 100;

  const OPCIONES_PERIODOS = [
    { value: "diariamente", label: "Diariamente" },
    { value: "semanalmente", label: "Semanalmente" },
    { value: "mensualmente", label: "Mensualmente" },
  ];

  return (
    <div className="db-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: 8, flexWrap: "wrap" }}>
        <span>Presupuesto Total</span>
        <div style={{ display: "flex", gap: 6 }}>
          {OPCIONES_PERIODOS.map(p => (
            <button key={p.value} onClick={() => setPeriodo(p.value)}
              style={{
                padding: "3px 12px",
                borderRadius: 99,
                border: "1px solid",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                borderColor: periodo === p.value ? "#5b6ef5" : "rgba(91,110,245,0.2)",
                background: periodo === p.value ? "rgba(91,110,245,0.15)" : "transparent",
                color: periodo === p.value ? "#a0aaff" : "#555e82",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="db-budget-header">
        <span>{porcentaje.toFixed(0)}% — {formatearPesos(totalGastado)} / {formatearPesos(totalAsignado)}</span>
        <span style={{ color: superado ? "#f87171" : "#9ba3c7" }}>
          {presupuestosDelPeriodo.length} presupuestos
        </span>
      </div>
      <div className="db-budget-track">
        <div 
          className="db-budget-fill"
          style={{ 
            width: `${Math.min(porcentaje, 100)}%`,
            background: getBarColor(porcentaje),
            transition: "width 0.4s ease, background 0.4s ease"
          }} 
        />
      </div>
    </div>
  );
}

// ── Carousel header ───────────────────────────────────────────────────────────
const GRAFICAS = ["tendencia", "barras"];
const LABELS   = { tendencia: "Tendencia", barras: "Ingresos vs Gastos" };
const OPCIONES_GRAFICAS = [
  { value: "diariamente", label: "Diariamente" },
  { value: "semanalmente", label: "Semanalmente" },
  { value: "mensualmente", label: "Mensualmente" },
  { value: "único", label: "Único" },
];

function GraficaCarousel({ transacciones }) {
  const [indice,  setIndice]  = useState(0);
  const [periodo, setPeriodo] = useState("mensualmente");
  const isMobile = useMediaQuery('(max-width: 768px)');

  const grafica  = GRAFICAS[indice];
  const datos    = construirDatos(transacciones, periodo);
  const chartHeight = isMobile ? 160 : 240;
  const etiqueta = periodo === "semanalmente" ? "esta semana"
                 : periodo === "mensualmente"  ? MESES[new Date().getMonth()]
                 : periodo === "diariamente"   ? "hoy"
                 : "período único";

  return (
    <div className="db-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", gap: 8, flexWrap: "wrap" }}>
        <div>
          <h3 className="db-card-title" style={{ margin: 0 }}>{LABELS[grafica]}</h3>
          <span style={{ fontSize: "0.75rem", color: "#555e82" }}>{etiqueta}</span>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {OPCIONES_GRAFICAS.map(p => (
            <button key={p.value} onClick={() => setPeriodo(p.value)}
              style={{
                padding: "3px 12px",
                borderRadius: 99,
                border: "1px solid",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                borderColor: periodo === p.value ? "#5b6ef5" : "rgba(91,110,245,0.2)",
                background:  periodo === p.value ? "rgba(91,110,245,0.15)" : "transparent",
                color:       periodo === p.value ? "#a0aaff" : "#555e82",
              }}
            >
              {p.label}
            </button>
          ))}

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

      {grafica === "tendencia" && (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart data={datos} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              {[["gradIngresos","#34d399"],["gradGastos","#f87171"],["gradAhorros","#5b6ef5"]].map(([id, color]) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0}   />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
            <XAxis dataKey="label" stroke="var(--text-faint)" tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis stroke="var(--text-faint)" tick={{ fontSize: isMobile ? 10 : 12 }} tickFormatter={formatearEjeY} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => formatearPesos(v)} />
            <Legend wrapperStyle={{ fontSize: isMobile ? "0.7rem" : "0.8rem", color: "#9ba3c7" }} />
            <Area type="monotone" dataKey="ingresos" stroke="#34d399" fill="url(#gradIngresos)" strokeWidth={2} name="Ingresos" />
            <Area type="monotone" dataKey="gastos"   stroke="#f87171" fill="url(#gradGastos)"   strokeWidth={2} name="Gastos"   />
            <Area type="monotone" dataKey="ahorros"  stroke="#5b6ef5" fill="url(#gradAhorros)"  strokeWidth={2} name="Ahorros"  />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {grafica === "barras" && (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={datos} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
            <XAxis dataKey="label" stroke="var(--text-faint)" tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis stroke="var(--text-faint)" tick={{ fontSize: isMobile ? 10 : 12 }} tickFormatter={formatearEjeY} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => formatearPesos(v)} />
            <Legend wrapperStyle={{ fontSize: isMobile ? "0.7rem" : "0.8rem", color: "#9ba3c7" }} />
            <Bar dataKey="ingresos" fill="#34d399" radius={[4,4,0,0]} name="Ingresos" />
            <Bar dataKey="gastos"   fill="#f87171" radius={[4,4,0,0]} name="Gastos"   />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// Vista principal 
export default function VistaResumen({ finanzas, budgets: budgetsFromProps }) {
  const { resumen, transacciones, loading, error } = finanzas;
  const budgetsHook = useBudgets();
  const { metas, cargarMetas, loading: loadingMetas } = useMetas();
  const [indiceMeta, setIndiceMeta] = useState(0);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);

  const { budgets, loading: loadingBudgets, recargar: recargarBudgets } = budgetsFromProps || budgetsHook;
  const [periodoBudget, setPeriodoBudget] = useState("mensualmente");

  useEffect(() => {
    if (recargarBudgets) recargarBudgets();
    cargarMetas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || loadingBudgets || loadingMetas) return <div className="db-empty"><span>Cargando...</span></div>;
  if (error) return <div className="db-empty"><span>⚠️ {error}</span></div>;

  const { totalGastado, totalGanado, totalAhorrado, cantidadTransacciones } = resumen;

  function presupuestoPerteneceAlPeriodo(budget, periodo) {
    const hoy = new Date();
    const hoyString = fechaAString(hoy); 

    if (periodo === "diariamente") {
      if (budget.period_type !== "daily") return false;
      if (budget.is_permanent) return true;
      return budget.start_date === hoyString;
    }

    if (periodo === "semanalmente") {
      if (budget.period_type !== "weekly") return false;
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
      const domingo = new Date(lunes);
      domingo.setDate(lunes.getDate() + 6);
      if (budget.is_permanent) return true;
      const budgetDateStr = budget.start_date;
      const lunesStr   = fechaAString(lunes);   
      const domingoStr = fechaAString(domingo); 
      return budgetDateStr >= lunesStr && budgetDateStr <= domingoStr;
    }

    if (periodo === "mensualmente") {
      if (budget.period_type !== "monthly") return false;
      const hoyMonth = hoy.getMonth() + 1;
      const hoyYear  = hoy.getFullYear();
      if (budget.is_permanent) return true;
      const budgetMonth = budget.month || hoyMonth;
      const budgetYear  = budget.year  || hoyYear;
      return budgetMonth === hoyMonth && budgetYear === hoyYear;
    }

    if (periodo === "único") {
      return budget.period_type === "unique";
    }

    return false;
  }

  const presupuestosFiltrados = budgets.filter(b => presupuestoPerteneceAlPeriodo(b, periodoBudget));

  const threshold = parseInt(localStorage.getItem("budget_threshold") || "80");

  const alertasVisibles = ["mensualmente", "semanalmente", "diariamente"].map(p => {
    const filtrados  = budgets.filter(b => presupuestoPerteneceAlPeriodo(b, p));
    const asignado   = filtrados.reduce((sum, b) => sum + b.amount, 0);
    const gastado    = filtrados.reduce((sum, b) => sum + b.spent, 0);
    const porcentaje = asignado > 0 ? (gastado / asignado) * 100 : 0;
    if (asignado > 0 && porcentaje >= threshold) return { gastado, asignado, p, porcentaje };
    return null;
  }).filter(Boolean);

  const metaActiva = metas && metas.length > 0 ? (metas[indiceMeta] || metas[0]) : null;

  const tarjetas = [
    { etiqueta: "Total Gastado",   valor: formatearPesos(totalGastado),  color: "#f87171", icono: "💸" },
    { etiqueta: "Total Ganado",    valor: formatearPesos(totalGanado),   color: "#34d399", icono: "💰" },
    { etiqueta: "Ahorrado",        valor: formatearPesos(totalAhorrado), color: "#5b6ef5", icono: "🏦" },
    { etiqueta: "Transacciones",   valor: cantidadTransacciones,         color: "#9b59f5", icono: "🔄" },
  ];

  return (
    <div>
      <h2 className="db-view-title">
        Resumen del mes — <span>{new Date().toLocaleString("es-CO", { month: "long", year: "numeric" })}</span>
      </h2>

      {alertasVisibles.map((alerta, i) => (
        <AlertaPresupuesto 
          key={i} 
          totalGastado={alerta.gastado} 
          totalAsignado={alerta.asignado} 
          periodo={alerta.p}
          porcentaje={alerta.porcentaje}
        />
      ))}

      <div className="db-stat-grid">
        {tarjetas.map(t => <TarjetaStat key={t.etiqueta} {...t} />)}
      </div>

      <BarraPresupuesto presupuestosDelPeriodo={presupuestosFiltrados} periodo={periodoBudget} setPeriodo={setPeriodoBudget} />

      {metaActiva && (
        <div className="db-card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", gap: "12px", flexWrap: "wrap" }}>
            <h3 className="db-card-title" style={{ margin: 0 }}>Seguimiento de Meta: {metaActiva.name}</h3>
            {metas.length > 1 && (
              <div className="custom-select-wrapper" style={{ minWidth: "260px" }}>
                <div 
                  className="db-meta-selector custom-select-trigger"
                  onClick={() => setDropdownAbierto(!dropdownAbierto)}
                >
                  <span>{metaActiva.name}</span>
                  <span className="custom-select-arrow">{dropdownAbierto ? '▲' : '▼'}</span>
                </div>

                {dropdownAbierto && (
                  <div className="custom-select-dropdown">
                    {metas.map((m, idx) => (
                      <div 
                        key={m.goal_id}
                        className={`custom-select-option ${indiceMeta === idx ? 'selected' : ''}`}
                        onClick={() => {
                          setIndiceMeta(idx);
                          setDropdownAbierto(false);
                        }}
                      >
                        {m.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="db-budget-header" style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f0f2ff" }}>
                {(() => {
                  const hoy = new Date();
                  hoy.setHours(0, 0, 0, 0);
                  const inicio = parsearFechaLocal(metaActiva.start_date); // ✅ fix
                  const diffTime = hoy - inicio;
                  const numDiaActual = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
                  const totalDiasReto = Object.keys(metaActiva.daily_amounts || {}).length;
                  const estaCompletadoHoy = metaActiva.completed_days?.includes(numDiaActual);
                  const montoHoy = metaActiva.daily_amounts?.[numDiaActual.toString()] || 0;

                  if (numDiaActual < 1) return `⏳ El reto inicia en ${Math.abs(numDiaActual) + 1} días`;
                  if (numDiaActual > totalDiasReto) return `🎉 ¡Reto de ahorro finalizado!`;
                  return estaCompletadoHoy 
                    ? "✅ ¡Ahorro de hoy completado!" 
                    : `🎯 Pendiente para hoy: ${formatearPesos(montoHoy)}`;
                })()}
              </span>
              <span style={{ color: "#9ba3c7", fontSize: "0.8rem", fontWeight: 500 }}>
                Progreso: {metaActiva.completed_days?.length || 0} de {Object.keys(metaActiva.daily_amounts || {}).length} días listos
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "1.2rem", fontWeight: "800", color: "#9b59f5" }}>
                {Math.round(metaActiva.progress?.percentage || 0)}%
              </span>
            </div>
          </div>

          <div className="db-budget-track">
            <div 
              className="db-budget-fill"
              style={{ 
                width: `${Math.min(metaActiva.progress?.percentage || 0, 100)}%`,
                background: "var(--gradient-accent)",
                transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
              }} 
            />
          </div>
        </div>
      )}

      <GraficaCarousel transacciones={transacciones} />
    </div>
  );
}