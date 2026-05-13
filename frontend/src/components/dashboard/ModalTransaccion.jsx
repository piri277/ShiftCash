/* ModalTransaccion.jsx - Componente modal para crear una nueva transacción, con campos para tipo (gasto/ingreso), monto, categoría (con dropdown personalizado), descripción y fecha. Maneja validación, errores y estados de carga. */
import { useState } from 'react';
import { useCategorias } from '../../hooks/useCategorias';
import { useTransaccionForm } from '../../hooks/useTransaccionForm';

import "../../styles/modal.css";

export default function ModalTransaccion({ onClose, onSuccess }) {
  const { categorias, loadingCats } = useCategorias();
  const { form, error, loading, handleChange, handleSubmit } = useTransaccionForm(() => {
    onSuccess?.();
    onClose();
  });

  const [dropdownAbierto, setDropdownAbierto] = useState(false);

  const categoriasFiltradas = categorias.filter(
    c => c.type === form.type || c.type === 'both'
  );

  const handleTipoChange = (value) => {
    handleChange({ target: { name: 'type', value } });
    handleChange({ target: { name: 'category_id', value: '' } });
    setDropdownAbierto(false);
  };

  const categoriaSeleccionada = categoriasFiltradas.find(
    c => c.category_id === parseInt(form.category_id)
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nueva Transacción</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* Tipo */}
          <div className="modal-field">
            <label>Tipo</label>
            <div className="modal-type-toggle">
              <button
                type="button"
                className={`toggle-btn ${form.type === 'expense' ? 'active-expense' : ''}`}
                onClick={() => handleTipoChange('expense')}
              >
                💸 Gasto
              </button>
              <button
                type="button"
                className={`toggle-btn ${form.type === 'income' ? 'active-income' : ''}`}
                onClick={() => handleTipoChange('income')}
              >
                💰 Ingreso
              </button>
            </div>
          </div>

          {/* Monto */}
          <div className="modal-field">
            <label htmlFor="amount">Monto *</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="1"
              placeholder="0"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>

          {/* Categoría — dropdown personalizado */}
          <div className="modal-field">
            <label>Categoría *</label>
            <div className="custom-select-wrapper">
              <div
                className="custom-select-trigger"
                onClick={() => setDropdownAbierto(p => !p)}
              >
                <span>
                  {categoriaSeleccionada
                    ? `${categoriaSeleccionada.icon} ${categoriaSeleccionada.name_cat}`
                    : 'Selecciona una categoría'
                  }
                </span>
                <span className="custom-select-arrow">
                  {dropdownAbierto ? '▲' : '▼'}
                </span>
              </div>

              {dropdownAbierto && (
                <div className="custom-select-dropdown">
                  {loadingCats ? (
                    <div className="custom-select-option disabled">Cargando...</div>
                  ) : (
                    categoriasFiltradas.map(cat => (
                      <div
                        key={cat.category_id}
                        className={`custom-select-option ${categoriaSeleccionada?.category_id === cat.category_id ? 'selected' : ''}`}
                        onClick={() => {
                          handleChange({ target: { name: 'category_id', value: cat.category_id } });
                          setDropdownAbierto(false);
                        }}
                      >
                        {cat.icon} {cat.name_cat}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Input oculto para que el form lo tome como requerido */}
            <input
              type="text"
              name="category_id"
              value={form.category_id}
              onChange={() => {}}
              required
              style={{ display: 'none' }}
            />
          </div>

          {/* Descripción */}
          <div className="modal-field">
            <label htmlFor="description">Descripción (opcional)</label>
            <input
              id="description"
              name="description"
              type="text"
              placeholder="Ej: Almuerzo con el equipo"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* Fecha */}
          <div className="modal-field">
            <label htmlFor="trans_date">Fecha (opcional)</label>
            <input
              id="trans_date"
              name="trans_date"
              type="date"
              value={form.trans_date}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="modal-submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar transacción'}
          </button>
        </form>
      </div>
    </div>
  );
}