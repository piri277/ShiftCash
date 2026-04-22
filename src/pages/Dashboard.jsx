import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import "../styles/Dashboard.css";

// ─────────────────────────────────────────────────────────────────────────────
// DATOS DE EJEMPLO (mock data)
// Aquí se definen los datos falsos que se muestran en el prototipo
// Más adelante estos vendrán del backend y la base de datos
// ─────────────────────────────────────────────────────────────────────────────

// Datos para la gráfica de mes
const datosAnuales = [
  { mes: "Ene", gastos: 420000,  ingresos: 1200000, ahorros: 780000  },
  { mes: "Feb", gastos: 510000,  ingresos: 1300000, ahorros: 790000  },
  { mes: "Mar", gastos: 380000,  ingresos: 1250000, ahorros: 870000  },
  { mes: "Abr", gastos: 950000,  ingresos: 3850000, ahorros: 2900000 },
];

// Lista de transacciones del mes actual
const transacciones = [
  { id: 1, tipo: "gasto",   descripcion: "Mercado Éxito",      categoria: "Alimentación",    monto: 87500   },
  { id: 2, tipo: "ingreso", descripcion: "Salario Abril",       categoria: "Sin categoría",   monto: 3200000 },
  { id: 3, tipo: "gasto",   descripcion: "Uber",                categoria: "Transporte",      monto: 14600   },
  { id: 4, tipo: "gasto",   descripcion: "Netflix",             categoria: "Entretenimiento", monto: 17900   },
  { id: 5, tipo: "ingreso", descripcion: "Freelance diseño",    categoria: "Sin categoría",   monto: 450000  },
  { id: 6, tipo: "gasto",   descripcion: "Farmacia Cruz Verde", categoria: "Salud",           monto: 32000   },
  { id: 7, tipo: "gasto",   descripcion: "Gym Smart Fit",       categoria: "Salud",           monto: 59000   },
];

// Límite de presupuesto mensual
const PRESUPUESTO_LIMITE = 900000;

function formatearPesos(numero) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(numero);
}

// RESUMEN 
// Muestra las tarjetas de totales, la barra de presupuesto,
// la alerta si se supera el límite y la gráfica anual, es basicamente la pagina
// principal del dashboard
function VistaResumen() {
  const totalGastado  = transacciones
    .filter(t => t.tipo === "gasto")
    .reduce((suma, t) => suma + t.monto, 0);

  const totalGanado   = transacciones
    .filter(t => t.tipo === "ingreso")
    .reduce((suma, t) => suma + t.monto, 0);

  const totalAhorrado = totalGanado - totalGastado;

  const porcentajePresupuesto = Math.min(100, Math.round((totalGastado / PRESUPUESTO_LIMITE) * 100));

  const presupuestoSuperado = totalGastado > PRESUPUESTO_LIMITE;

  const tarjetas = [
    { etiqueta: "Total Gastado",  valor: formatearPesos(totalGastado),  color: "#f87171", icono: "💸" },
    { etiqueta: "Total Ganado",   valor: formatearPesos(totalGanado),   color: "#34d399", icono: "💰" },
    { etiqueta: "Ahorrado",       valor: formatearPesos(totalAhorrado), color: "#5b6ef5", icono: "🏦" },
    { etiqueta: "Transacciones",  valor: transacciones.length,          color: "#9b59f5", icono: "🔄" },
  ];

  return (
    <div>
      <h2 className="db-view-title">
        Resumen del mes — <span>Abril 2025</span>
      </h2>

      {/* Alerta de presupuesto superado */}
      {presupuestoSuperado && (
        <div className="db-alert">
          <span>⚠️</span>
          <span>
            ¡Has superado tu presupuesto mensual! Gastaste{" "}
            <strong>{formatearPesos(totalGastado)}</strong> de un límite de{" "}
            <strong>{formatearPesos(PRESUPUESTO_LIMITE)}</strong>.
          </span>
        </div>
      )}

      {/*  Tarjetas de resumen  */}
      <div className="db-stat-grid">
        {tarjetas.map(tarjeta => (
          <div
            key={tarjeta.etiqueta}
            className="db-stat-card"
            style={{ borderTop: `3px solid ${tarjeta.color}` }}
          >
            <div className="db-stat-icon">{tarjeta.icono}</div>
            <div className="db-stat-label">{tarjeta.etiqueta}</div>
            <div className="db-stat-value" style={{ color: tarjeta.color }}>
              {tarjeta.valor}
            </div>
          </div>
        ))}
      </div>

      {/* Barra de progreso del presupuesto */}
      <div className="db-card">
        <div className="db-budget-header">
          <span>Presupuesto mensual</span>
          <span style={{ color: presupuestoSuperado ? "#f87171" : "#9ba3c7" }}>
            {porcentajePresupuesto}% — {formatearPesos(totalGastado)} / {formatearPesos(PRESUPUESTO_LIMITE)}
          </span>
        </div>
        <div className="db-budget-track">
          {/* La clase "over" o "ok" cambia el color de la barra en el CSS <- tengan esto en
          cuenta cuando vayan a editar el codigo */}
          <div
            className={`db-budget-fill ${presupuestoSuperado ? "over" : "ok"}`}
            style={{ width: `${porcentajePresupuesto}%` }}
          />
        </div>
      </div>

      {/* Gráfica de tendencia anual */}
      <div className="db-card">
        <h3 className="db-card-title">Tendencia anual</h3>
    
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={datosAnuales} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>

            {/* Gradientes de relleno para cada área */}
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
            <YAxis
              stroke="#9ba3c7"
              tick={{ fontSize: 12 }}
              tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`}
            />
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
    </div>
  );
}

// VISTA: HISTORIAL pendiente de implementar
function VistaHistorial() {
  return (
    <div className="db-empty">
      <span className="db-empty-icon">📋</span>
      <p>El historial de transacciones estará disponible pronto.</p>
    </div>
  );
}

// VISTA: GRÁFICAS  pendiente de implementar
function VistaGraficas() {
  return (
    <div className="db-empty">
      <span className="db-empty-icon">📈</span>
      <p>Las gráficas detalladas estarán disponibles pronto.</p>
    </div>
  );
}


function Dashboard() {
  // Valor inicial: "resumen"
  const [vistaActiva, setVistaActiva] = useState("resumen");

  const itemsMenu = [
    { key: "resumen",   etiqueta: "Resumen",   icono: "📊" },
    { key: "historial", etiqueta: "Historial", icono: "📋" },
    { key: "graficas",  etiqueta: "Gráficas",  icono: "📈" },
  ];

  const itemActivo = itemsMenu.find(item => item.key === vistaActiva);

  return (
    <div className="db-app">

      <aside className="db-sidebar">

        {/* Logo */}
        <div className="db-brand">
          Shift<span>Cash</span>
        </div>

        <nav className="db-nav">
          {itemsMenu.map(item => (
            <div
              key={item.key}
              className={`db-nav-item ${vistaActiva === item.key ? "active" : ""}`}
              onClick={() => setVistaActiva(item.key)}
            >
              <span>{item.icono}</span>
              <span>{item.etiqueta}</span>
            </div>
          ))}
        </nav>

        <div className="db-user">
          <div className="db-avatar">JD</div>
          <div>
            <div className="db-user-name">Juan Doe</div>
            <div className="db-user-email">juan@email.com</div>
          </div>
        </div>
      </aside>

      <div className="db-main">

        <header className="db-topbar">
          <span className="db-topbar-title">
            {itemActivo?.icono} {itemActivo?.etiqueta}
          </span>
          <div className="db-topbar-right">
            <span className="db-topbar-date">Abril 2025</span>
            <button className="btn-primary">＋ Transacción</button>
          </div>
        </header>

        <main className="db-content">
          {vistaActiva === "resumen"   && <VistaResumen   />}
          {vistaActiva === "historial" && <VistaHistorial />}
          {vistaActiva === "graficas"  && <VistaGraficas  />}
        </main>

      </div>
    </div>
  );
}

export default Dashboard;