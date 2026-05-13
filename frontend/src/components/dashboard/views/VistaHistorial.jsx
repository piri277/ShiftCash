/* VistaHistorial.jsx - Componente para mostrar el historial de transacciones del usuario, con opciones para ver detalles y eliminar transacciones. Maneja estados de carga, error y muestra un mensaje cuando no hay transacciones. */
import { useState }              from "react";
import { formatearPesos }        from "../../../utils/formatters";
import DetalleTransaccion        from "../DetalleTransaccion";
import ConfirmarEliminar         from "../ConfirmarEliminar";

import "../../../styles/historial.css";
import "../../../styles/modal.css";

function FilaTransaccion({ transaccion, onVerDetalle, onEliminar }) {
  const esGasto = transaccion.type === "expense";
  return (
    <div className="hist-fila" onClick={() => onVerDetalle(transaccion)}
      style={{ cursor: "pointer" }}>
      <div className="hist-icono"
        style={{ background: esGasto ? "rgba(248,113,113,0.1)" : "rgba(52,211,153,0.1)" }}>
        {esGasto ? "💸" : "💰"}
      </div>
      <div className="hist-info">
        <span className="hist-categoria">{transaccion.category_name}</span>
        {transaccion.description && (
          <span className="hist-descripcion">{transaccion.description}</span>
        )}
      </div>
      <div className="hist-fecha">
        {new Date(transaccion.trans_date).toLocaleDateString("es-CO")}
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

export default function VistaHistorial({ finanzas }) {
  const { transacciones, loading, error, recargar } = finanzas;
  const [detalle,  setDetalle]  = useState(null);
  const [eliminar, setEliminar] = useState(null);

  if (loading) return <div className="db-empty"><span>Cargando...</span></div>;
  if (error)   return <div className="db-empty"><span>⚠️ {error}</span></div>;

  if (transacciones.length === 0) {
    return (
      <div className="db-empty">
        <span className="db-empty-icon">📋</span>
        <p>Aún no tienes gastos este mes.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="db-view-title">Historial de transacciones</h2>
      <div className="db-card">
        {transacciones.map(t => (
          <FilaTransaccion
            key={t.trans_id}
            transaccion={t}
            onVerDetalle={setDetalle}
            onEliminar={setEliminar}
          />
        ))}
      </div>

      {detalle && (
        <DetalleTransaccion
          transaccion={detalle}
          onClose={() => setDetalle(null)}
          onSuccess={recargar}
        />
      )}

      {eliminar && (
        <ConfirmarEliminar
          transaccion={eliminar}
          onClose={() => setEliminar(null)}
          onSuccess={() => { recargar(); setEliminar(null); }}
        />
      )}
    </div>
  );
}