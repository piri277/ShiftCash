/* VistaCategorias.jsx - Componente principal para la gestión de categorías, mostrando categorías predeterminadas y personalizadas, con opciones para crear, editar y eliminar categorías personalizadas. */
import { useState }             from 'react';
import { eliminarCategoria }    from '../../../api/categories';
import { useCategoriasCRUD }    from '../../../hooks/useCategoriasCRUD';
import { createPortal } from 'react-dom';
import VistaCategoriasForm      from './VistaCategoriasForm';

import "../../../styles/categorias.css";
import "../../../styles/modal.css";

// ── Tarjeta de categoría predeterminada (solo lectura) ──
function TarjetaDefault({ categoria }) {
  return (
    <div className="cat-card cat-card--default">
      <div className="cat-card-icon">{categoria.icon}</div>
      <div className="cat-card-name">{categoria.name_cat}</div>
      <div className="cat-card-type">{categoria.type === 'expense' ? 'Gasto' : categoria.type === 'income' ? 'Ingreso' : 'Ambos'}</div>
    </div>
  );
}

// ── Tarjeta de categoría personalizada (con acciones) ──
function TarjetaPersonalizada({ categoria, onEditar, onEliminar }) {
  const [abierta, setAbierta] = useState(false);

  // Extraemos el emoji del nombre si es que viene pegado, 
  // o usamos el campo icon si ya lo tienes separado en la DB.
  const nombreLimpio = categoria.name_cat.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
  const iconoGrande = categoria.icon || (categoria.name_cat.match(/[\u{1F300}-\u{1F9FF}]/gu) || [])[0] || '📁';

  const modalDetalle = (
    <div className="modal-overlay" onClick={() => setAbierta(false)}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Detalle de Categoría</h3>
          <button className="modal-close" onClick={() => setAbierta(false)}>✕</button>
        </div>

        <div className="detalle-body" style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>{iconoGrande}</div>
          <h2 style={{ fontSize: '1.5rem', color: '#f0f2ff', marginBottom: '10px' }}>
            {nombreLimpio}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span className={`toggle-btn ${
              categoria.type === 'expense' ? 'active-expense' : 
              categoria.type === 'income' ? 'active-income' : 'active-both'
            }`} style={{ cursor: 'default', pointerEvents: 'none' }}>
              {categoria.type === 'expense' ? '💸 Gasto' : 
               categoria.type === 'income' ? '💰 Ingreso' : '🔁 Ambos'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
          <button
            className="modal-submit"
            style={{ background: 'rgba(91,110,245,0.15)', color: '#7c8df7', boxShadow: 'none', marginTop: 0 }}
            onClick={() => { setAbierta(false); onEditar(categoria); }}
          >
            ✏️ Editar
          </button>
          <button
            className="modal-submit"
            style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', boxShadow: 'none', marginTop: 0 }}
            onClick={() => { setAbierta(false); onEliminar(categoria); }}
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        className="cat-card cat-card--default" // Usamos la misma clase que la default para el diseño
        style={{ cursor: 'pointer', border: abierta ? '1px solid #5b6ef5' : '1px solid transparent' }}
        onClick={() => setAbierta(true)}
      >
        {/* Aquí está el truco: el icono va en su propio div arriba */}
        <div className="cat-card-icon">{iconoGrande}</div>
        <div className="cat-card-name">{nombreLimpio}</div>
        <div className="cat-card-type">
          {categoria.type === 'expense' ? 'Gasto' : categoria.type === 'income' ? 'Ingreso' : 'Ambos'}
        </div>
      </div>
      {abierta && createPortal(modalDetalle, document.body)}
    </>
  );
}

// ── Modal confirmación eliminar ──
function ConfirmarEliminarCategoria({ categoria, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEliminar = async () => {
    setLoading(true);
    try {
      await eliminarCategoria(categoria.category_id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Eliminar categoría</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ color: '#9ba3c7', fontSize: '0.95rem', marginBottom: 24 }}>
          ¿Eliminar <strong style={{ color: '#f0f2ff' }}>{categoria.icon} {categoria.name_cat}</strong>?{' '}
          Esta acción no se puede deshacer.
        </p>
        {error && <div className="modal-error">{error}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="modal-submit" style={{ background: '#2e303a', boxShadow: 'none' }} onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-submit"
            style={{ background: 'linear-gradient(90deg, #f87171, #ef4444)' }}
            onClick={handleEliminar} disabled={loading}>
            {loading ? 'Eliminando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Vista principal ──
export default function VistaCategorias() {
  const { predeterminadas, personalizadas, loading, error, recargar } = useCategoriasCRUD();
  const [modalCrear,   setModalCrear]   = useState(false);
  const [catEditar,    setCatEditar]    = useState(null);
  const [catEliminar,  setCatEliminar]  = useState(null);

  if (loading) return <div className="db-empty"><span>Cargando...</span></div>;
  if (error)   return <div className="db-empty"><span>⚠️ {error}</span></div>;

  return (
    <div>
      <h2 className="db-view-title">Categorías</h2>

      {/* Predeterminadas */}
      <div className="cat-section">
        <div className="cat-section-header">
          <h3 className="cat-section-title">Predeterminadas</h3>
        </div>
        <div className="cat-grid">
          {predeterminadas.map(c => (
            <TarjetaDefault key={c.category_id} categoria={c} />
          ))}
        </div>
      </div>

      {/* Personalizadas */}
      <div className="cat-section">
        <div className="cat-section-header">
          <h3 className="cat-section-title">Mis categorías</h3>
          <button className="btn-primary cat-btn-nueva" onClick={() => setModalCrear(true)}>
            ＋ Nueva categoría
          </button>
        </div>

        {personalizadas.length === 0 ? (
          <div className="db-empty" style={{ padding: '32px' }}>
            <span className="db-empty-icon">🗂️</span>
            <p>Aún no tienes categorías personalizadas.</p>
          </div>
        ) : (
          <div className="cat-grid">
            {personalizadas.map(c => (
              <TarjetaPersonalizada
                key={c.category_id}
                categoria={c}
                onEditar={setCatEditar}
                onEliminar={setCatEliminar}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      {modalCrear && (
        <VistaCategoriasForm
          onSuccess={() => { recargar(); setModalCrear(false); }}
          onCancel={() => setModalCrear(false)}
        />
      )}

      {catEditar && (
        <VistaCategoriasForm
          categoriaEditar={catEditar}
          onSuccess={() => { recargar(); setCatEditar(null); }}
          onCancel={() => setCatEditar(null)}
        />
      )}

      {catEliminar && (
        <ConfirmarEliminarCategoria
          categoria={catEliminar}
          onClose={() => setCatEliminar(null)}
          onSuccess={recargar}
        />
      )}
    </div>
  );
}