/* VistaCategoriasForm.jsx - Componente de formulario para crear o editar categorías, con campos para nombre, tipo (gasto/ingreso/ambos) y selección de emoji. Maneja validación, errores y estados de carga. */
import { useState } from 'react';
import { crearCategoria, actualizarCategoria } from '../../../api/categories';

import "../../../styles/categorias.css";
import "../../../styles/modal.css";

const EMOJIS = [
  "🍔","🚗","🎵","❤️","📚","💡","✈️","🏠","👗","💪",
  "🎮","🐶","🌿","☕","🎁","💼","💻","📱","🏦","⭐",
  "🛒","🎓","🏥","🍕","🎨","🏋️","🌍","🔧","🎯","💰",
];

const INITIAL = { name_cat: '', icon: '⭐', type: 'expense' };

export default function VistaCategoriasForm({ categoriaEditar, onSuccess, onCancel }) {
  const [form,    setForm]    = useState(categoriaEditar
    ? { name_cat: categoriaEditar.name_cat, icon: categoriaEditar.icon, type: categoriaEditar.type }
    : INITIAL
  );
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name_cat.trim()) { setError('El nombre es obligatorio'); return; }
    setLoading(true);
    setError('');
    try {
      if (categoriaEditar) {
        await actualizarCategoria(categoriaEditar.category_id, form);
      } else {
        await crearCategoria(form);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{categoriaEditar ? 'Editar categoría' : 'Nueva categoría'}</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label>Nombre *</label>
            <input
              type="text"
              placeholder="Ej: Mascota, Gym, Netflix..."
              value={form.name_cat}
              onChange={e => setForm(p => ({ ...p, name_cat: e.target.value }))}
              required
            />
          </div>

          <div className="modal-field">
            <label>Tipo *</label>
            <div className="modal-type-toggle">
              {['expense','income','both'].map(t => (
                <button key={t} type="button"
                  className={`toggle-btn ${form.type === t ? (t === 'expense' ? 'active-expense' : t === 'income' ? 'active-income' : 'active-both') : ''}`}
                  onClick={() => setForm(p => ({ ...p, type: t }))}
                >
                  {t === 'expense' ? '💸 Gasto' : t === 'income' ? '💰 Ingreso' : '🔄 Ambos'}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-field">
            <label>Emoji</label>
            <div className="cat-emoji-grid">
              {EMOJIS.map(emoji => (
                <button key={emoji} type="button"
                  className={`cat-emoji-btn ${form.icon === emoji ? 'selected' : ''}`}
                  onClick={() => setForm(p => ({ ...p, icon: emoji }))}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="modal-submit" disabled={loading}>
            {loading ? 'Guardando...' : categoriaEditar ? 'Guardar cambios' : 'Crear categoría'}
          </button>
        </form>
      </div>
    </div>
  );
}