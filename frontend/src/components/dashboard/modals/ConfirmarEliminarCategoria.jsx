import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { eliminarCategoria } from '../../../api/categories';

export default function ConfirmarEliminarCategoria({ categoria, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

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