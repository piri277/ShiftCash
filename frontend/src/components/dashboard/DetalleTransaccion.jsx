/* DetalleTransaccion.jsx - Componente modal para mostrar los detalles de una transacción específica, con opciones para editar la transacción. Maneja estados de edición, carga y error, y utiliza hooks personalizados para gestionar el formulario de transacción. */
import { useState }            from "react";
import { useCategorias }       from "../../hooks/useCategorias";
import { useTransaccionForm }  from "../../hooks/useTransaccionForm";
import { formatearPesos }      from "../../utils/formatters";

import "../../styles/modal.css";

export default function DetalleTransaccion({ transaccion, onClose, onSuccess }) {
  const [editando, setEditando] = useState(false);
  const { categorias, loadingCats } = useCategorias();
  const { form, error, loading, handleChange, handleSubmit } = useTransaccionForm(
    () => { onSuccess(); onClose(); },
    transaccion
  );

  const esGasto = transaccion.type === "expense";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <h3>{editando ? "Editar transacción" : "Detalle"}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Modo lectura */}
        {!editando && (
          <div className="detalle-body">
            <div className="detalle-monto" style={{ color: esGasto ? "#f87171" : "#34d399" }}>
              {esGasto ? "−" : "+"}{formatearPesos(transaccion.amount)}
            </div>
            <div className="detalle-grid">
              <div className="detalle-campo">
                <span className="detalle-label">Categoría</span>
                <span className="detalle-valor">{transaccion.category_name}</span>
              </div>
              <div className="detalle-campo">
                <span className="detalle-label">Tipo</span>
                <span className="detalle-valor">{esGasto ? "💸 Gasto" : "💰 Ingreso"}</span>
              </div>
              <div className="detalle-campo">
                <span className="detalle-label">Fecha</span>
                <span className="detalle-valor">
                  {new Date(transaccion.trans_date).toLocaleDateString("es-CO", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric"
                  })}
                </span>
              </div>
              <div className="detalle-campo">
                <span className="detalle-label">Descripción</span>
                <span className="detalle-valor">{transaccion.description || "Sin descripción"}</span>
              </div>
            </div>
            <button className="modal-submit" onClick={() => setEditando(true)}>
              ✏️ Editar
            </button>
          </div>
        )}

        {/* Modo edición */}
        {editando && (
          <form onSubmit={handleSubmit}>
            {error && <div className="modal-error">{error}</div>}

            <div className="modal-field">
              <label>Tipo</label>
              <div className="modal-type-toggle">
                <button type="button"
                  className={`toggle-btn ${form.type === 'expense' ? 'active-expense' : ''}`}
                  onClick={() => handleChange({ target: { name: 'type', value: 'expense' } })}
                >💸 Gasto</button>
                <button type="button"
                  className={`toggle-btn ${form.type === 'income' ? 'active-income' : ''}`}
                  onClick={() => handleChange({ target: { name: 'type', value: 'income' } })}
                >💰 Ingreso</button>
              </div>
            </div>

            <div className="modal-field">
              <label>Monto *</label>
              <input name="amount" type="number" min="1"
                value={form.amount} onChange={handleChange} required />
            </div>

            <div className="modal-field">
              <label>Categoría *</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} required>
                <option value="">Selecciona una categoría</option>
                {loadingCats ? (
                  <option disabled>Cargando...</option>
                ) : (
                  categorias
                    .filter(c => c.type === form.type || c.type === 'both')
                    .map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.name_cat}
                      </option>
                    ))
                )}
              </select>
            </div>

            <div className="modal-field">
              <label>Descripción (opcional)</label>
              <input name="description" type="text"
                value={form.description} onChange={handleChange} />
            </div>

            <div className="modal-field">
              <label>Fecha (opcional)</label>
              <input name="trans_date" type="date"
                value={form.trans_date} onChange={handleChange} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="modal-submit"
                style={{ background: "#2e303a", boxShadow: "none" }}
                onClick={() => setEditando(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="modal-submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}