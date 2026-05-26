import { useState, useMemo } from "react";
import { formatearPesos }    from "../../../utils/formatters";
import DetalleTransaccion    from "../modals/DetalleTransaccion";
import ConfirmarEliminar     from "../modals/ConfirmarEliminar";


import "../../../styles/historial.css";
import "../../../styles/modal.css";

function FilaTransaccion({ transaccion, onVerDetalle, onEliminar }) {
  const esGasto = transaccion.type === "expense";
  return (
    <div className="hist-fila" onClick={() => onVerDetalle(transaccion)}>
      <div className="hist-icono"
        style={{ background: esGasto ? "rgba(248,113,113,0.1)" : "rgba(52,211,153,0.1)" }}>
        {esGasto ? "💸" : "💰"}
      </div>
      <div className="hist-info">
        <span className="hist-categoria">
          {transaccion.category_name}
          {transaccion.is_recurring && (
            <span className="hist-recurrente-badge" title="Recurrente">🔁</span>
          )}
        </span>
        {transaccion.description && (
          <span className="hist-descripcion">{transaccion.description}</span>
        )}
      </div>
      <div className="hist-monto" style={{ color: esGasto ? "#f87171" : "#34d399" }}>
        {esGasto ? "−" : "+"}{formatearPesos(transaccion.amount)}
      </div>
      <button
        className="hist-btn-eliminar"
        onClick={e => { e.stopPropagation(); onEliminar(transaccion); }}
        title="Eliminar"
      >
        🗑️
      </button>
    </div>
  );
}

function etiquetaDia(fechaStr) {
  const [year, month, day] = fechaStr.slice(0, 10).split("-").map(Number);
  const fecha = new Date(year, month - 1, day);
  const hoy   = new Date();
  const ayer  = new Date();
  ayer.setDate(hoy.getDate() - 1);
  const mismodia = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate();
  if (mismodia(fecha, hoy))  return "Hoy";
  if (mismodia(fecha, ayer)) return "Ayer";
  return fecha.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
}

const FILTROS_TIPO = [
  { value: "",        label: "Todos" },
  { value: "expense", label: "💸 Gastos" },
  { value: "income",  label: "💰 Ingresos" },
];

const FILTROS_FREQ = [
  { value: "monthly",  label: "Mensual" },
  { value: "weekly",   label: "Semanal" },
  { value: "biweekly", label: "Quincenal" },
  { value: "annual",   label: "Anual" },
];

export default function VistaHistorial({ finanzas }) {
  const { transacciones, loading, error, recargar } = finanzas;
  const [detalle,       setDetalle]       = useState(null);
  const [eliminar,      setEliminar]      = useState(null);
  const [panelAbierto,  setPanelAbierto]  = useState(false);

  // Filtros
  const [busqueda,      setBusqueda]      = useState("");
  const [filtroTipo,    setFiltroTipo]    = useState("");
  const [filtrosCat,    setFiltrosCat]    = useState([]); // array de category_id
  const [filtroRecurr,  setFiltroRecurr]  = useState(false);
  const [filtroFreqs,   setFiltroFreqs]   = useState([]);
  const [fechaDesde,    setFechaDesde]    = useState("");
  const [fechaHasta,    setFechaHasta]    = useState("");

  // Categorías únicas disponibles
  const categorias = useMemo(() => {
    const mapa = {};
    for (const t of transacciones) {
      if (!mapa[t.category_id]) mapa[t.category_id] = t.category_name;
    }
    return Object.entries(mapa).map(([id, name]) => ({ id: parseInt(id), name }));
  }, [transacciones]);

  const toggleCat  = (id)   => setFiltrosCat(prev  => prev.includes(id)   ? prev.filter(x => x !== id)   : [...prev, id]);
  const toggleFreq = (freq) => setFiltroFreqs(prev => prev.includes(freq) ? prev.filter(x => x !== freq) : [...prev, freq]);

  const hayFiltrosActivos = busqueda || filtroTipo || filtrosCat.length ||
    filtroRecurr || filtroFreqs.length || fechaDesde || fechaHasta;

  const limpiarFiltros = () => {
    setBusqueda(""); setFiltroTipo(""); setFiltrosCat([]);
    setFiltroRecurr(false); setFiltroFreqs([]); setFechaDesde(""); setFechaHasta("");
  };

  const transaccionesFiltradas = useMemo(() => {
    return transacciones.filter(t => {
      if (busqueda) {
        const q = busqueda.toLowerCase();
        if (!t.category_name.toLowerCase().includes(q) &&
            !(t.description ?? "").toLowerCase().includes(q)) return false;
      }
      if (filtroTipo && t.type !== filtroTipo) return false;
      if (filtrosCat.length && !filtrosCat.includes(t.category_id)) return false;
      if (filtroRecurr && !t.is_recurring) return false;
      if (filtroFreqs.length && !filtroFreqs.includes(t.frequency)) return false;
      if (fechaDesde && t.trans_date.slice(0, 10) < fechaDesde) return false;
      if (fechaHasta && t.trans_date.slice(0, 10) > fechaHasta) return false;
      return true;
    });
  }, [transacciones, busqueda, filtroTipo, filtrosCat, filtroRecurr, filtroFreqs, fechaDesde, fechaHasta]);

  const grupos = useMemo(() => {
    const mapa = {};
    for (const t of transaccionesFiltradas) {
      const clave = t.trans_date.slice(0, 10);
      if (!mapa[clave]) mapa[clave] = [];
      mapa[clave].push(t);
    }
    return Object.entries(mapa).sort(([a], [b]) => b.localeCompare(a));
  }, [transaccionesFiltradas]);

  if (loading) return <div className="db-empty"><span>Cargando...</span></div>;
  if (error)   return <div className="db-empty"><span>⚠️ {error}</span></div>;

  if (transacciones.length === 0) {
    return (
      <div className="db-empty">
        <span className="db-empty-icon">📋</span>
        <p>Aún no tienes transacciones este mes.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="hist-topbar">
        <h2 className="db-view-title" style={{ margin: 0 }}>Historial</h2>

        {/* Buscador */}
        <div className="hist-search-wrap">
          <span className="hist-search-icon">🔍</span>
          <input
            className="hist-search"
            placeholder="Buscar por categoría o descripción..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button className="hist-search-clear" onClick={() => setBusqueda("")}>✕</button>
          )}
        </div>

        {/* Botón filtros */}
        <button
          className={`hist-filtrar-btn ${panelAbierto ? "activo" : ""} ${hayFiltrosActivos ? "con-filtros" : ""}`}
          onClick={() => setPanelAbierto(p => !p)}
        >
          ⚙️ Filtros
          {hayFiltrosActivos && <span className="hist-filtrar-dot" />}
        </button>
      </div>

      {/* Panel de filtros */}
      {panelAbierto && (
        <div className="hist-panel">

          {/* Tipo */}
          <div className="hist-panel-seccion">
            <span className="hist-panel-label">Tipo</span>
            <div className="hist-chips">
              {FILTROS_TIPO.map(f => (
                <button
                  key={f.value}
                  className={`hist-chip ${filtroTipo === f.value ? "activo" : ""}`}
                  onClick={() => setFiltroTipo(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categorías */}
          <div className="hist-panel-seccion">
            <span className="hist-panel-label">Categorías</span>
            <div className="hist-chips">
              {categorias.map(c => (
                <button
                  key={c.id}
                  className={`hist-chip ${filtrosCat.includes(c.id) ? "activo" : ""}`}
                  onClick={() => toggleCat(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Recurrente */}
          <div className="hist-panel-seccion">
            <span className="hist-panel-label">Recurrencia</span>
            <div className="hist-chips">
              <button
                className={`hist-chip ${filtroRecurr ? "activo" : ""}`}
                onClick={() => setFiltroRecurr(p => !p)}
              >
                🔁 Solo automáticas
              </button>
            </div>
            {filtroRecurr && (
              <div className="hist-chips" style={{ marginTop: 8 }}>
                {FILTROS_FREQ.map(f => (
                  <button
                    key={f.value}
                    className={`hist-chip hist-chip-sm ${filtroFreqs.includes(f.value) ? "activo" : ""}`}
                    onClick={() => toggleFreq(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rango de fechas */}
          <div className="hist-panel-seccion">
            <span className="hist-panel-label">Rango de fechas</span>
            <div className="hist-fechas">
              <input
                type="date"
                className="hist-fecha-input"
                value={fechaDesde}
                onChange={e => setFechaDesde(e.target.value)}
              />
              <span className="hist-fecha-sep">→</span>
              <input
                type="date"
                className="hist-fecha-input"
                value={fechaHasta}
                onChange={e => setFechaHasta(e.target.value)}
              />
            </div>
          </div>

          {/* Limpiar */}
          {hayFiltrosActivos && (
            <button className="hist-limpiar" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Resultados */}
      {grupos.length === 0 ? (
        <div className="db-empty">
          <span className="db-empty-icon">🔍</span>
          <p>Sin resultados para esta búsqueda.</p>
        </div>
      ) : (
        grupos.map(([fecha, items]) => {
          const totalDia = items.reduce((acc, t) =>
            t.type === "income" ? acc + t.amount : acc - t.amount, 0);
          return (
            <div key={fecha} className="hist-grupo">
              <div className="hist-grupo-header">
                <span className="hist-grupo-fecha">{etiquetaDia(fecha)}</span>
                <span className="hist-grupo-total"
                  style={{ color: totalDia >= 0 ? "#34d399" : "#f87171" }}>
                  {totalDia >= 0 ? "+" : "−"}{formatearPesos(Math.abs(totalDia))}
                </span>
              </div>
              <div className="db-card">
                {items.map(t => (
                  <FilaTransaccion
                    key={t.trans_id}
                    transaccion={t}
                    onVerDetalle={setDetalle}
                    onEliminar={setEliminar}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}

      {detalle && (
        <DetalleTransaccion transaccion={detalle}
          onClose={() => setDetalle(null)} onSuccess={recargar} />
      )}
      {eliminar && (
        <ConfirmarEliminar transaccion={eliminar}
          onClose={() => setEliminar(null)}
          onSuccess={() => { recargar(); setEliminar(null); }} />

      )}
    </div>
  );
}