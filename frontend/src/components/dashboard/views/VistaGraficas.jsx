/* VistaGraficas.jsx */
import { useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from "recharts";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { formatearPesos, formatearEjeY } from "../../../utils/formatters";
import { parsearFechaLocal, fechaAString } from "../../../utils/dates"; 

const COLORES = ["#5b6ef5","#9b59f5","#34d399","#fbbf24","#f87171","#38bdf8","#fb923c"];
const MESES   = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const TOOLTIP_STYLE = {
  background: "var(--surface, #21253a)",
  border: "1px solid var(--border, rgba(91,110,245,0.18))",
  borderRadius: 10,
  color: "var(--text-primary, #f0f2ff)",
};

const PERIODOS = [
  { value: "semana", label: "Esta semana" },
  { value: "mes",    label: "Este mes"    },
  { value: "anual",  label: "Este año"    },
];

const TIPOS_FILTRO = [
  { value: "",        label: "Todos"       },
  { value: "expense", label: "💸 Gastos"   },
  { value: "income",  label: "💰 Ingresos" },
];

// ── Filtrado ──────────────────────────────────────────────────────────────────
function aplicarFiltros(transacciones, { periodo, tipo, categorias, soloRecurrentes }) {
  const hoy = new Date();
  let resultado = [...transacciones];

  if (periodo === "semana") {
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    lunes.setHours(0, 0, 0, 0);
    resultado = resultado.filter(t => parsearFechaLocal(t.trans_date) >= lunes); 
  } else if (periodo === "mes") {
    resultado = resultado.filter(t => {
      const d = parsearFechaLocal(t.trans_date); 
      return d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear();
    });
  } else {
    resultado = resultado.filter(t => parsearFechaLocal(t.trans_date).getFullYear() === hoy.getFullYear()); 
  }

  if (tipo)               resultado = resultado.filter(t => t.type === tipo);
  if (categorias.length)  resultado = resultado.filter(t => categorias.includes(t.category_id));
  if (soloRecurrentes)    resultado = resultado.filter(t => t.is_recurring);

  return resultado;
}

function construirDatosPeriodo(transacciones, periodo) {
  const hoy = new Date();

  if (periodo === "semana") {
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    return ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((dia, i) => {
      const fecha    = new Date(lunes);
      fecha.setDate(lunes.getDate() + i);
      const str      = fechaAString(fecha); 
      const delDia   = transacciones.filter(t => t.trans_date.slice(0, 10) === str);
      const ingresos = delDia.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const gastos   = delDia.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { label: dia, ingresos, gastos, ahorros: ingresos - gastos };
    });
  }

  if (periodo === "mes") {
    const diasMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
    return Array.from({ length: diasMes }, (_, i) => {
      const dia    = i + 1;
      const str    = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
      const delDia = transacciones.filter(t => t.trans_date.slice(0,10) === str);
      const ingresos = delDia.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const gastos   = delDia.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { label: String(dia), ingresos, gastos, ahorros: ingresos - gastos };
    });
  }

  return MESES.map((mes, i) => {
    const delMes   = transacciones.filter(t => parsearFechaLocal(t.trans_date).getMonth() === i); 
    const ingresos = delMes.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const gastos   = delMes.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { label: mes, ingresos, gastos, ahorros: ingresos - gastos };
  });
}

// Gráficas 
function GraficaCategoriasBase({ transacciones, tipo, isMobile }) {
  const datos = Object.values(
    transacciones
      .filter(t => t.type === tipo)
      .reduce((acc, t) => {
        acc[t.category_name] = acc[t.category_name] ?? { name: t.category_name, value: 0 };
        acc[t.category_name].value += t.amount;
        return acc;
      }, {})
  );

  if (!datos.length) return (
    <div className="db-empty" style={{ padding: "1.5rem" }}>
      <span className="db-empty-icon" style={{ fontSize: "1.5rem" }}>🍩</span>
      <p>Sin datos.</p>
    </div>
  );

  const chartHeight = isMobile ? 180 : 220;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <PieChart>
        <Pie data={datos} dataKey="value" nameKey="name"
          cx="50%" cy="50%" innerRadius={isMobile ? 35 : 50} outerRadius={isMobile ? 70 : 85} paddingAngle={3}>
          {datos.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => formatearPesos(v)} />
        <Legend wrapperStyle={{ fontSize: isMobile ? "0.7rem" : "0.75rem", color: "#9ba3c7" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function GraficaBarras({ datos, isMobile }) {
  const tickFormatterY = formatearEjeY;
  const chartHeight = isMobile ? 200 : 240;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={datos} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
        <XAxis dataKey="label" stroke="var(--text-faint)" tick={{ fontSize: isMobile ? 10 : 12 }} />
        <YAxis stroke="var(--text-faint)" tick={{ fontSize: isMobile ? 10 : 12 }} tickFormatter={tickFormatterY} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => formatearPesos(v)} />
        <Legend wrapperStyle={{ fontSize: isMobile ? "0.7rem" : "0.8rem", color: "#9ba3c7" }} />
        <Bar dataKey="ingresos" fill="#34d399" radius={[4,4,0,0]} name="Ingresos" />
        <Bar dataKey="gastos"   fill="#f87171" radius={[4,4,0,0]} name="Gastos"   />
      </BarChart>
    </ResponsiveContainer>
  );
}

function GraficaAhorro({ datos, isMobile }) {
  const tickFormatterY = formatearEjeY;
  const chartHeight = isMobile ? 180 : 220;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <AreaChart data={datos} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="gradAhorroVista" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#5b6ef5" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#5b6ef5" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
        <XAxis dataKey="label" stroke="var(--text-faint)" tick={{ fontSize: isMobile ? 10 : 12 }} />
        <YAxis stroke="var(--text-faint)" tick={{ fontSize: isMobile ? 10 : 12 }} tickFormatter={tickFormatterY} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => formatearPesos(v)} />
        <Area type="monotone" dataKey="ahorros" stroke="#5b6ef5"
          fill="url(#gradAhorroVista)" strokeWidth={2} name="Ahorros" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Chip reutilizable ─────────────────────────────────────────────────────────
function Chip({ activo, onClick, children, small }) {
  return (
    <button className={`hist-chip${small ? " hist-chip-sm" : ""}${activo ? " activo" : ""}`}
      onClick={onClick}>
      {children}
    </button>
  );
}

// Vista principal 
export default function VistaGraficas({ finanzas }) {
  const { transacciones, loading, error } = finanzas;
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [panelAbierto,    setPanelAbierto]    = useState(false);
  const [periodo,         setPeriodo]         = useState("anual");
  const [filtroTipo,      setFiltroTipo]      = useState("");
  const [filtrosCat,      setFiltrosCat]      = useState([]);
  const [soloRecurrentes, setSoloRecurrentes] = useState(false);

  const categorias = useMemo(() => {
    const mapa = {};
    for (const t of transacciones) {
      if (!mapa[t.category_id]) mapa[t.category_id] = t.category_name;
    }
    return Object.entries(mapa).map(([id, name]) => ({ id: parseInt(id), name }));
  }, [transacciones]);

  const toggleCat = id => setFiltrosCat(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const hayFiltros = filtroTipo || filtrosCat.length || soloRecurrentes || periodo !== "anual";

  const limpiar = () => {
    setPeriodo("anual"); setFiltroTipo(""); setFiltrosCat([]); setSoloRecurrentes(false);
  };

  const txFiltradas = useMemo(() =>
    aplicarFiltros(transacciones, { periodo, tipo: filtroTipo, categorias: filtrosCat, soloRecurrentes }),
    [transacciones, periodo, filtroTipo, filtrosCat, soloRecurrentes]
  );

  const datosPeriodo = useMemo(() => construirDatosPeriodo(txFiltradas, periodo), [txFiltradas, periodo]);

  const etiquetaPeriodo = periodo === "semana" ? "esta semana"
    : periodo === "mes" ? MESES[new Date().getMonth()]
    : String(new Date().getFullYear());

  if (loading) return <div className="db-empty"><span>Cargando...</span></div>;
  if (error)   return <div className="db-empty"><span>⚠️ {error}</span></div>;

  return (
    <div>
      {/* Topbar */}
      <div className="hist-topbar">
        <h2 className="db-view-title" style={{ margin: 0 }}>
          Gráficas — <span>{etiquetaPeriodo}</span>
        </h2>
        <button
          className={`hist-filtrar-btn${panelAbierto ? " activo" : ""}${hayFiltros ? " con-filtros" : ""}`}
          onClick={() => setPanelAbierto(p => !p)}
        >
          ⚙️ Filtros
          {hayFiltros && <span className="hist-filtrar-dot" />}
        </button>
      </div>

      {/* Panel de filtros */}
      {panelAbierto && (
        <div className="hist-panel">

          <div className="hist-panel-seccion">
            <span className="hist-panel-label">Período</span>
            <div className="hist-chips">
              {PERIODOS.map(p => (
                <Chip key={p.value} activo={periodo === p.value} onClick={() => setPeriodo(p.value)}>
                  {p.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="hist-panel-seccion">
            <span className="hist-panel-label">Tipo</span>
            <div className="hist-chips">
              {TIPOS_FILTRO.map(f => (
                <Chip key={f.value} activo={filtroTipo === f.value} onClick={() => setFiltroTipo(f.value)}>
                  {f.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="hist-panel-seccion">
            <span className="hist-panel-label">Categorías</span>
            <div className="hist-chips">
              {categorias.map(c => (
                <Chip key={c.id} activo={filtrosCat.includes(c.id)} onClick={() => toggleCat(c.id)}>
                  {c.name}
                </Chip>
              ))}
            </div>
          </div>

          <div className="hist-panel-seccion">
            <span className="hist-panel-label">Recurrencia</span>
            <div className="hist-chips">
              <Chip activo={soloRecurrentes} onClick={() => setSoloRecurrentes(p => !p)}>
                🔁 Solo automáticas
              </Chip>
            </div>
          </div>

          {hayFiltros && (
            <button className="hist-limpiar" onClick={limpiar}>Limpiar filtros</button>
          )}
        </div>
      )}

      {/* Gráficas */}
      <div className={`graf-doble${filtroTipo !== "" ? " solo" : ""}`}>
        {filtroTipo !== "income" && (
         <div className="graf-doble-item">
           <h3 className="db-card-title">Gastos por categoría</h3>
           <GraficaCategoriasBase transacciones={txFiltradas} tipo="expense" isMobile={isMobile} />
         </div>
       )}
        {filtroTipo !== "expense" && (
         <div className="graf-doble-item">
           <h3 className="db-card-title">Ingresos por categoría</h3>
            <GraficaCategoriasBase transacciones={txFiltradas} tipo="income" isMobile={isMobile} />
         </div>
        )}
      </div>

      <div className="db-card">
        <h3 className="db-card-title">Ingresos vs Gastos</h3>
        <GraficaBarras datos={datosPeriodo} isMobile={isMobile} />
      </div>

      <div className="db-card">
        <h3 className="db-card-title">Evolución del ahorro</h3>
        <GraficaAhorro datos={datosPeriodo} isMobile={isMobile} />
      </div>
    </div>
  );
}