/* VistaPresupuestos.jsx */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBudgets } from '../../../hooks/useBudgets';
import { formatearPesos } from '../../../utils/formatters';
import PresupuestoModal from '../modals/PresupuestoModal';

import "../../../styles/presupuestos.css";
import "../../../styles/modal.css";

const PERIODOS = [
  { value: "diariamente",  label: "Diariamente"  },
  { value: "semanalmente", label: "Semanalmente" },
  { value: "mensualmente", label: "Mensualmente" },
  { value: "único",        label: "Único"        },
];

// Función auxiliar para obtener el color de la barra según el progreso
const getBarColor = (pct) => {
  if (pct >= 100) return "linear-gradient(90deg, #f87171, #ef4444)"; // Rojo (Superado)
  if (pct >= 85)  return "linear-gradient(90deg, #fb923c, #f87171)"; // Naranja Rojizo (Crítico)
  if (pct >= 60)  return "linear-gradient(90deg, #9b59f5, #fb923c)"; // Violeta Naranja (Advertencia)
  if (pct >= 35)  return "linear-gradient(90deg, #7c8df7, #9b59f5)"; // Azul Violáceo (Moderado)
  return "linear-gradient(90deg, #5b6ef5, #7c8df7)";                // Azul (Saludable)
};

// ─── Agrupa todos los presupuestos del tipo seleccionado por su fecha ───
function agruparPresupuestos(budgets, periodo) {
  const delTipo = budgets.filter(b => {
    if (periodo === "diariamente")  return b.period_type === "daily";
    if (periodo === "semanalmente") return b.period_type === "weekly";
    if (periodo === "mensualmente") return b.period_type === "monthly";
    if (periodo === "único")        return b.period_type === "unique";
    return false;
  });

  if (periodo === "diariamente") {
    const grupos = {};
    delTipo.forEach(b => {
      const clave = b.start_date || "Sin fecha";
      if (!grupos[clave]) grupos[clave] = [];
      grupos[clave].push(b);
    });
    return Object.entries(grupos)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([fecha, items]) => ({
        titulo: fecha === "Sin fecha" ? "Sin fecha" :
          new Date(fecha + "T00:00:00").toLocaleDateString("es-ES", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
          }),
        items,
      }));
  }

  if (periodo === "semanalmente") {
    const grupos = {};
    delTipo.forEach(b => {
      const fecha  = b.start_date ? new Date(b.start_date + "T00:00:00") : new Date();
      const lunes  = new Date(fecha);
      lunes.setDate(fecha.getDate() - ((fecha.getDay() + 6) % 7));
      const domingo = new Date(lunes);
      domingo.setDate(lunes.getDate() + 6);
      const clave  = lunes.toISOString().split("T")[0];
      const titulo = `${lunes.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} — ${domingo.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}`;
      if (!grupos[clave]) grupos[clave] = { titulo, items: [] };
      grupos[clave].items.push(b);
    });
    return Object.entries(grupos)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([, grupo]) => grupo);
  }

  if (periodo === "mensualmente") {
    const grupos = {};
    delTipo.forEach(b => {
      const mes   = b.month || new Date().getMonth() + 1;
      const anio  = b.year  || new Date().getFullYear();
      const clave = `${anio}-${String(mes).padStart(2, "0")}`;
      const titulo = new Date(anio, mes - 1, 1).toLocaleDateString("es-ES", {
        month: "long", year: "numeric"
      });
      if (!grupos[clave]) grupos[clave] = { titulo, items: [] };
      grupos[clave].items.push(b);
    });
    return Object.entries(grupos)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([, grupo]) => grupo);
  }

  if (periodo === "único") {
    const grupos = {};
    delTipo.forEach(b => {
      const clave  = `${b.start_date}_${b.end_date}`;
      const inicio = b.start_date ? new Date(b.start_date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "?";
      const fin    = b.end_date   ? new Date(b.end_date   + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "?";
      const titulo = `${inicio} — ${fin}`;
      if (!grupos[clave]) grupos[clave] = { titulo, items: [] };
      grupos[clave].items.push(b);
    });
    return Object.entries(grupos)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([, grupo]) => grupo);
  }

  return [];
}

// ─── Tarjeta individual ───
function TarjetaPresupuesto({ budget, onEditar, onEliminar }) {
  const superado      = budget.percentage > 100;
  const gastoVsMonto  = `${formatearPesos(budget.spent)} / ${formatearPesos(budget.amount)}`;

  return (
    <div className="presupuestos-card">
      <div className="presupuestos-card-header">
        <div className="presupuestos-card-icon-name">
          <div className="presupuestos-card-icon">{budget.category_icon}</div>
          <div>
            <div className="presupuestos-card-name">{budget.name}</div>
            <div className="presupuestos-card-category">{budget.category_name}</div>
          </div>
        </div>
        <button
          className="presupuestos-card-menu"
          onClick={() => onEditar(budget)}
          title="Editar presupuesto"
        >
          ⚙️
        </button>
      </div>

      <div className="presupuestos-card-stats">
        <div className="presupuestos-card-stat-item">
          <div className="presupuestos-card-stat-label">Gasto</div>
          <div className={`presupuestos-card-stat-value ${superado ? "alert" : ""}`}>
            {formatearPesos(budget.spent)}
          </div>
        </div>
        <div className="presupuestos-card-stat-item">
          <div className="presupuestos-card-stat-label">Asignado</div>
          <div className="presupuestos-card-stat-value">
            {formatearPesos(budget.amount)}
          </div>
        </div>
      </div>

      <div>
        <div className="presupuestos-progress-label">
          <span style={{ color: superado ? "#f87171" : "inherit" }}>
            {budget.percentage > 999
              ? "+999%"
              : `${budget.percentage.toFixed(0)}%`
            }
          </span>
          <span style={{ fontSize: "0.65rem" }}>{gastoVsMonto}</span>
        </div>
        <div className="presupuestos-card-progress">
          <div
            className="presupuestos-card-progress-fill"
            style={{ 
              width: `${Math.min(budget.percentage, 100)}%`,
              background: getBarColor(budget.percentage)
            }}
          />
        </div>
      </div>

      <button
        onClick={() => onEliminar(budget)}
        style={{
          background: "rgba(248,113,113,0.1)",
          border: "1px solid rgba(248,113,113,0.2)",
          color: "#f87171",
          borderRadius: "8px",
          padding: "8px",
          cursor: "pointer",
          fontSize: "0.8rem",
          fontWeight: "600",
          transition: "all 0.15s",
          marginTop: "8px",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.15)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(248,113,113,0.1)"}
      >
        🗑️ Eliminar
      </button>
    </div>
  );
}

// ─── Vista principal ───
export default function VistaPresupuestos({ budgets: budgetsFromProps }) {
  const budgetsHook = useBudgets();
  const { budgets, categorias, loading, error, recargar, guardar, actualizar, eliminar } =
    budgetsFromProps || budgetsHook;

  // Forzar recarga al montar la vista para asegurar datos frescos tras cambios en transacciones
  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [periodo,             setPeriodo]             = useState("mensualmente");
  const [modalAbierto,        setModalAbierto]        = useState(false);
  const [presupuestoEditar,   setPresupuestoEditar]   = useState(null);
  const [presupuestoEliminar, setPresupuestoEliminar] = useState(null);

  const grupos         = agruparPresupuestos(budgets, periodo);
  const todosFiltrados = grupos.flatMap(g => g.items);
  const totalAsignado  = todosFiltrados.reduce((sum, b) => sum + b.amount, 0);
  const totalGastado   = todosFiltrados.reduce((sum, b) => sum + b.spent,  0);
  const porcentajeTotal = totalAsignado > 0 ? (totalGastado / totalAsignado) * 100 : 0;
  const superado        = porcentajeTotal > 100;

  const handleEditar = (budget) => { setPresupuestoEditar(budget); setModalAbierto(true); };
  const handleEliminar = (budget) => setPresupuestoEliminar(budget);

  const handleConfirmarEliminar = async () => {
    try {
      await eliminar(presupuestoEliminar.budget_id);
      setPresupuestoEliminar(null);
      recargar();
    } catch (err) {
      console.error("Error al eliminar:", err.message);
    }
  };

  if (loading) return <div className="db-empty"><span>Cargando presupuestos...</span></div>;
  if (error)   return <div className="db-empty"><span>⚠️ {error}</span></div>;

  return (
    <>
      {/* ── RESUMEN ── */}
      <div className="presupuestos-section">
        <div className="presupuestos-section-header">
          <h2 className="db-view-title" style={{ margin: 0 }}>Presupuestos</h2>
          <button
            className="presupuestos-btn-add"
            onClick={() => { setPresupuestoEditar(null); setModalAbierto(true); }}
          >
            + Nuevo Presupuesto
          </button>
        </div>

        <div className="presupuestos-summary">
          <div className="presupuestos-summary-header">
            <h3 className="presupuestos-summary-title">Resumen General</h3>
            <div className="presupuestos-periodo-selector">
              {PERIODOS.map(p => (
                <button
                  key={p.value}
                  className={`presupuestos-periodo-chip ${periodo === p.value ? "active" : ""}`}
                  onClick={() => setPeriodo(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="presupuestos-summary-stats">
            <div className="presupuestos-stat">
              <div className="presupuestos-stat-label">Total Asignado</div>
              <div className="presupuestos-stat-value">{formatearPesos(totalAsignado)}</div>
            </div>
            <div className="presupuestos-stat">
              <div className="presupuestos-stat-label">Total Gastado</div>
              <div className={`presupuestos-stat-value ${superado ? "alert" : ""}`}>
                {formatearPesos(totalGastado)}
              </div>
            </div>
          </div>

          <div className="presupuestos-progress-container">
            <div className="presupuestos-progress-label">
              <span>Progreso total</span>
              <span style={{ color: superado ? "#f87171" : "#f0f2ff", fontSize: "0.82rem" }}>
                {porcentajeTotal > 999 ? "+999%" : `${porcentajeTotal.toFixed(0)}%`}
                {" — "}{formatearPesos(totalGastado)} / {formatearPesos(totalAsignado)}
              </span>
            </div>
            <div style={{
              width: "100%",
              height: 10,
              background: "rgba(91,110,245,0.1)",
              borderRadius: 99,
              overflow: "hidden",
              boxSizing: "border-box",
            }}>
              <div style={{
                height: "100%",
                width: `${Math.min(porcentajeTotal, 100)}%`,
                maxWidth: "100%",
                background: getBarColor(porcentajeTotal),
                borderRadius: 99,
                transition: "width 0.4s ease, background 0.4s ease"
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── LISTA AGRUPADA ── */}
      <div className="presupuestos-section">
        <div className="presupuestos-section-header">
          <h2 className="presupuestos-section-title">Mis Presupuestos</h2>
        </div>

        {grupos.length === 0 ? (
          <div className="presupuestos-empty">
            <div className="presupuestos-empty-icon">💰</div>
            <h3 className="presupuestos-empty-title">No hay presupuestos</h3>
            <p className="presupuestos-empty-text">
              Crea tu primer presupuesto para comenzar a controlar tus gastos por categoría.
            </p>
            <button
              className="presupuestos-btn-add"
              onClick={() => { setPresupuestoEditar(null); setModalAbierto(true); }}
            >
              + Crear Presupuesto
            </button>
          </div>
        ) : (
          grupos.map((grupo, i) => (
            <div key={i} style={{ marginBottom: 32 }}>

              {/* Encabezado del grupo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: '#9ba3c7',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  whiteSpace: 'nowrap',
                }}>
                  {grupo.titulo}
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(91,110,245,0.1)' }} />
                <span style={{ fontSize: '0.75rem', color: '#555e82', whiteSpace: 'nowrap' }}>
                  {grupo.items.length} {grupo.items.length === 1 ? 'presupuesto' : 'presupuestos'}
                </span>
              </div>

              {/* Tarjetas */}
              <div className="presupuestos-grid">
                {grupo.items.map(budget => (
                  <TarjetaPresupuesto
                    key={budget.budget_id}
                    budget={budget}
                    onEditar={handleEditar}
                    onEliminar={handleEliminar}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── MODAL CREAR / EDITAR ── */}
      {modalAbierto && createPortal(
        <PresupuestoModal
          presupuesto={presupuestoEditar}
          categorias={categorias}
          onClose={() => { setModalAbierto(false); setPresupuestoEditar(null); }}
          onSuccess={() => { setModalAbierto(false); setPresupuestoEditar(null); recargar(); }}
          onGuardar={presupuestoEditar ? actualizar : guardar}
        />,
        document.body
      )}

      {/* ── MODAL CONFIRMAR ELIMINAR ── */}
      {presupuestoEliminar && createPortal(
        <div className="presupuestos-modal-overlay" onClick={() => setPresupuestoEliminar(null)}>
          <div className="presupuestos-modal" onClick={e => e.stopPropagation()}>
            <div className="presupuestos-modal-header">
              <h3 className="presupuestos-modal-title">Eliminar Presupuesto</h3>
              <button className="presupuestos-modal-close" onClick={() => setPresupuestoEliminar(null)}>✕</button>
            </div>
            <p style={{ color: "#9ba3c7", fontSize: "0.95rem", marginBottom: 24 }}>
              ¿Eliminar el presupuesto{" "}
              <strong style={{ color: "#f0f2ff" }}>
                {presupuestoEliminar.category_icon} {presupuestoEliminar.name}
              </strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="presupuestos-modal-btn presupuestos-modal-btn-cancel"
                onClick={() => setPresupuestoEliminar(null)}
              >
                Cancelar
              </button>
              <button
                className="presupuestos-modal-btn presupuestos-modal-btn-submit"
                onClick={handleConfirmarEliminar}
                style={{ background: "linear-gradient(90deg, #f87171, #ef4444)" }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}