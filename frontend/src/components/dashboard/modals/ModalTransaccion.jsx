/* ModalTransaccion.jsx - Componente modal para crear una nueva transacción, con campos para tipo (gasto/ingreso), monto, categoría (con dropdown personalizado), descripción y fecha. Maneja validación, errores y estados de carga. */
import { useState, useEffect } from 'react';
import { useCategorias } from '../../../hooks/useCategorias';
import { createPortal }       from "react-dom";


import { useTransaccionForm } from '../../../hooks/useTransaccionForm';

import "../../../styles/modal.css";

export default function ModalTransaccion({ onClose, onSuccess }) {
  const { categorias, loadingCats } = useCategorias();
  const { form, error, loading, handleChange, handleSubmit } = useTransaccionForm(() => {
    onSuccess?.();
    onClose();
  });

  const [dropdownAbierto, setDropdownAbierto] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const categoriasFiltradas = categorias.filter(
    c => c.type === form.type || c.type === 'both'
  );

  const handleTipoChange = (value) => {
    handleChange({ target: { name: 'type', value } });
    handleChange({ target: { name: 'category_id', value: '' } });
    setDropdownAbierto(false);
  };

  // Formatea el valor para mostrar puntos de miles (ej: 100000 -> 100.000)
  const formatDisplay = (val) => {
    if (!val) return "";
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Limpia los puntos antes de actualizar el estado del formulario
  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, ""); // Mantiene solo dígitos
    handleChange({ target: { name: 'amount', value: rawValue } });
  };

  const categoriaSeleccionada = categoriasFiltradas.find(
    c => c.category_id === parseInt(form.category_id)
  );

  // Detectar si hay un error específico de categoría
  const hasCategoryError = 
    !!error && 
    !form.category_id && 
    error.toLowerCase().includes('categoría');

  return createPortal(
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
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={formatDisplay(form.amount)}
              onChange={handleAmountChange}
              required
            />
          </div>

          {/* Categoría — dropdown personalizado */}
          <div className="modal-field">
            <label>Categoría *</label>
            <div className="custom-select-wrapper">
              <div
                className={`custom-select-trigger ${hasCategoryError ? 'error' : ''}`}
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


          {/* Recurrente */}
        <div
          className={`modal-recurrente-toggle ${form.is_recurring ? 'activo' : ''}`}
          onClick={() =>
            handleChange({ target: { name: 'is_recurring', type: 'checkbox', checked: !form.is_recurring } })
          }
        >
          <div className="modal-recurrente-label">
            <span>🔁</span>
            Repetir automáticamente
          </div>
          <div className="modal-switch" />
        </div>

        {form.is_recurring && (
          <div className="modal-field">
            <label htmlFor="frequency">Frecuencia *</label>
            <select
              id="frequency"
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una frecuencia</option>
              <option value="monthly">Mensual</option>
              <option value="weekly">Semanal</option>
              <option value="biweekly">Quincenal</option>
              <option value="annual">Anual</option>
            </select>
          </div>
        )}
        
          <button type="submit" className="modal-submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar transacción'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}