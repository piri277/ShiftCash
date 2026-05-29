/* MetaFormModal.jsx - Modal para crear/editar metas de ahorro */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMetaForm } from '../../../hooks/useMetaForm';

import "../../../styles/modal.css";

export default function MetaFormModal({ metaExistente, onClose, onSuccess }) {
  const { form, error, loading, handleChange, handleSubmit } = useMetaForm(
    onSuccess,
    metaExistente
  );

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Función para manejar la subida de archivos y convertirlos a Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Creamos un canvas para redimensionar la imagen
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // Tamaño ideal para la card
                const scaleSize = MAX_WIDTH / img.width;
                
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Convertimos a JPEG con calidad 0.7 (mucho más ligero que el PNG original)
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                
                handleChange({ target: { name: 'image_url', value: compressedBase64 } });
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
  };

  // Formatea el valor para mostrar puntos de miles (ej: 100000 -> 100.000)
  const formatDisplay = (val) => {
    if (val === null || val === undefined || val === "") return "";
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Formatear fecha a YYYY-MM-DD para el input
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    return dateStr;
  };

  const titulo = metaExistente ? 'Editar Meta' : 'Nueva Meta de Ahorro';
  const bottonText = metaExistente ? 'Actualizar Meta' : 'Crear Meta';

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{titulo}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="modal-field">
            <label htmlFor="name">Nombre de la Meta *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="ej: Viaje a Europa"
              required
            />
          </div>

          {/* Monto Objetivo */}
          <div className="modal-field">
            <label htmlFor="target_amount">Monto Objetivo (COP) *</label>
            <input
              id="target_amount"
              name="target_amount"
              type="text"
              value={formatDisplay(form.target_amount)}
              onChange={handleChange}
              placeholder="30000, 50000, 100000"
              inputMode="numeric"
              required
            />
            <small style={{ color: '#a0a8d8', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Números redondos (múltiplos de 1000)
            </small>
          </div>

          {/* Fecha de Inicio */}
          <div className="modal-field">
            <label htmlFor="start_date">Fecha de Inicio</label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              value={formatDate(form.start_date)}
              onChange={handleChange}
            />
          </div>

          {/* Fecha de Fin */}
          <div className="modal-field">
            <label htmlFor="end_date">Fecha de Fin *</label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              value={formatDate(form.end_date)}
              onChange={handleChange}
              required
            />
          </div>

          {/* Imagen */}
          <div className="modal-field">
            <label>Imagen de la meta (opcional)</label>

            {/* Selector de archivo */}
            <div className="image-upload-wrapper">
              <label htmlFor="file-upload" className="btn-upload-image">
                <span>📷</span> Subir desde el equipo
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              <span className="image-separator">o pega la dirección de una imagen</span>
            </div>

            {/* Vista previa de imagen */}
            {form.image_url && (
              <div className="image-preview">
                <img
                  key={form.image_url}
                  src={form.image_url}
                  alt="Preview"
                  onError={(e) => (e.target.style.display = 'none')}
                />
                <button 
                  type="button" 
                  className="btn-remove-image"
                  onClick={() => handleChange({ target: { name: 'image_url', value: '' } })}
                >
                  Quitar imagen
                </button>
              </div>
            )}

            {/* Input de URL */}
            <div className="image-input-group">
              <input
                name="image_url"
                type="url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://..."
                className="image-url-input"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="modal-actions">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="modal-btn-submit"
              disabled={loading}
            >
              {loading ? 'Guardando...' : bottonText}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
