/* ConfirmarEliminar.jsx - Componente modal para confirmar la eliminación de una transacción, mostrando un mensaje de advertencia y manejando la lógica de eliminación con estados de carga y error. */
import { useState } from "react";
import { eliminarTransaccion } from "../../api/transactions";

export default function ConfirmarEliminar({ transaccion, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleEliminar = async () => {
    setLoading(true);
    try {
      await eliminarTransaccion(transaccion.trans_id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Eliminar transacción</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ color: "#9ba3c7", fontSize: "0.95rem", marginBottom: 24 }}>
          ¿Eliminar este gasto? <strong style={{ color: "#f0f2ff" }}>Esta acción no se puede deshacer.</strong>
        </p>
        {error && <div className="modal-error">{error}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button className="modal-submit"
            style={{ background: "#2e303a", boxShadow: "none" }}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button className="modal-submit"
            style={{ background: "linear-gradient(90deg, #f87171, #ef4444)" }}
            onClick={handleEliminar}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Confirmar eliminación"}
          </button>
        </div>
      </div>
    </div>
  );
}