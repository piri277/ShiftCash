/* VistaMetas.jsx - Vista principal de metas de ahorro con grid de tarjetas */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMetas } from '../../../hooks/useMetas';
import { formatearPesos, formatearAK } from '../../../utils/formatters';
import MetaFormModal from '../modals/MetaFormModal';
import { useMediaQuery } from '../../../hooks/useMediaQuery'; // Import useMediaQuery

import "../../../styles/metas.css";
import "../../../styles/modal.css";

// Función para obtener el color dinámico (gradual) basado en el progreso
const getProgresoColor = (pct) => {
  if (pct >= 100) return "#059669"; // Verde (Completado)
  if (pct >= 75)  return "#5b6ef5"; // Azul (Muy avanzado)
  if (pct >= 50)  return "#9b59f5"; // Violeta (Progreso medio)
  if (pct >= 25)  return "#fb923c"; // Naranja (Iniciando)
  return "#f87171";                // Rojo (Bajo)
};

// Función para obtener el degradado dinámico para la barra de metas
const getProgresoGradient = (pct) => {
  if (pct >= 100) return "linear-gradient(90deg, #34d399, #059669)";
  if (pct >= 75)  return "linear-gradient(90deg, #7c8df7, #5b6ef5)";
  if (pct >= 50)  return "linear-gradient(90deg, #fb923c, #9b59f5)";
  if (pct >= 25)  return "linear-gradient(90deg, #f87171, #fb923c)";
  return "linear-gradient(90deg, #ef4444, #f87171)";
};

export default function VistaMetas() {
  const { metas, loading, error, cargarMetas, eliminarMeta } = useMetas();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [metaSeleccionada, setMetaSeleccionada] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  useEffect(() => {
    cargarMetas();
  }, [cargarMetas]);

  const handleNuevaMeta = () => {
    setMetaSeleccionada(null);
    setModalAbierto(true);
  };

  const handleEditarMeta = (meta, e) => {
    e.stopPropagation();
    setMetaSeleccionada(meta);
    setModalAbierto(true);
  };

  const handleEliminarMeta = async (goalId, e) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar esta meta?')) {
      try {
        await eliminarMeta(goalId);
      } catch (err) {
        console.error('Error al eliminar meta:', err);
      }
    }
  };

  const handleVerDetalle = (meta) => {
    setMetaSeleccionada(meta);
    setMostrarDetalle(true);
  };

  const handleCerrarDetalle = () => {
    setMostrarDetalle(false);
    setMetaSeleccionada(null);
    cargarMetas(); // Recargar metas por si hubo cambios
  };

  const calcularProgreso = (meta) => {
    // Si viene el progreso del backend, usarlo
    if (meta.progress && typeof meta.progress.percentage === 'number') {
      return meta.progress.percentage;
    }
    // Fallback: calcular por monto monetario para ser consistente
    if (!meta.daily_amounts || !meta.target_amount) return 0;
    
    const ahorrado = (meta.completed_days || []).reduce((sum, day) => {
      return sum + (meta.daily_amounts[day.toString()] || 0);
    }, 0);
    
    return (ahorrado / meta.target_amount) * 100;
  };

  if (loading && metas.length === 0) {
    return <div className="vista-container"><p>Cargando metas...</p></div>;
  }

  return (
    <>
      <div className="vista-container metas-view">
        <div className="metas-header">
          <h1>MIS METAS DE AHORRO</h1>
          <button className="btn-nueva-meta" onClick={handleNuevaMeta}>
            + Nueva Meta
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {metas.length === 0 ? (
          <div className="metas-empty">
            <p>No tienes metas de ahorro aún</p>
            <p>Crea una meta para empezar tu reto de ahorro</p>
            <button className="btn-crear-primera-meta" onClick={handleNuevaMeta}>
              Crear Primera Meta
            </button>
          </div>
        ) : (
          <div className="metas-grid">
            {metas.map(meta => {
              const progreso = calcularProgreso(meta);
              return (
                <div
                  key={meta.goal_id}
                  className="meta-card"
                  onClick={() => handleVerDetalle(meta)}
                >
                  <div className={`meta-card-image ${!meta.image_url ? 'no-image' : ''}`}>
                    {meta.image_url && (
                      <img
                        key={meta.image_url} // Forzar refresco si el contenido cambia
                        src={meta.image_url}
                        alt={meta.name}
                        onLoad={(e) => e.target.parentElement.classList.remove('no-image')}
                        onError={(e) => e.target.parentElement.classList.add('no-image')}
                      />
                    )}
                  </div>

                  <div className="meta-card-content">
                    <h3>{meta.name}</h3>

                    <div className="meta-amount">
                      <span className="label">Objetivo</span>
                      <span className="value">{formatearPesos(meta.target_amount)}</span>
                    </div>

                    <div className="meta-progress-section">
                      <div className="progress-info">
                        <span className="dias-completados">
                          {meta.completed_days?.length || 0} días
                        </span>
                        <span className="porcentaje" style={{ color: getProgresoColor(progreso) }}>{Math.round(progreso)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progreso}%`, background: getProgresoGradient(progreso) }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="meta-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="action-btn edit-btn"
                      onClick={(e) => handleEditarMeta(meta, e)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={(e) => handleEliminarMeta(meta.goal_id, e)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalAbierto &&
        createPortal(
          <MetaFormModal
            metaExistente={metaSeleccionada}
            onClose={() => {
              setModalAbierto(false);
              setMetaSeleccionada(null);
            }}
            onSuccess={() => {
              setModalAbierto(false);
              setMetaSeleccionada(null);
              cargarMetas();
            }}
          />,
          document.body
        )}

      {mostrarDetalle && metaSeleccionada &&
        createPortal(
          <PlantillaReto meta={metaSeleccionada} onClose={handleCerrarDetalle} />,
          document.body
        )}
    </>
  );
}

// Componente interno: PlantillaReto renderizado dinámicamente
function PlantillaReto({ meta, onClose }) {
  const isMobile = useMediaQuery('(max-width: 768px)'); // Detect mobile
  const { alternarDia } = useMetas();
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState(new Set(meta.completed_days || []));
  const [saved, setSaved] = useState(false);

  const calcularNumDias = () => {
    return Object.keys(meta.daily_amounts || {}).length;
  };

  const calcularDiasParaRevelar = () => {
    const totalDias = calcularNumDias();
    if (isMobile) return 3; // Mostrar 3 columnas en móvil
    if (totalDias <= 20) return 4;
    if (totalDias <= 50) return 6;
    return 8;
  };

  const handleToggleDay = (dayNumber) => {
    const newSelected = new Set(selectedDays);
    if (newSelected.has(dayNumber)) {
      newSelected.delete(dayNumber);
    } else {
      newSelected.add(dayNumber);
    }
    setSelectedDays(newSelected);
    setSaved(false); // Marcar como no guardado
  };

  const handleGuardar = async () => {
    setLoading(true);
    try {
      const completedArray = Array.from(selectedDays).sort((a, b) => a - b);
      
      // Obtener los días que había antes
      const oldCompleted = new Set(meta.completed_days || []);
      const newCompleted = new Set(completedArray);
      
      // Encontrar diferencias
      const toAdd = [...newCompleted].filter(d => !oldCompleted.has(d));
      const toRemove = [...oldCompleted].filter(d => !newCompleted.has(d));
      
      // Aplicar cambios uno por uno
      for (const day of toRemove) {
        await alternarDia(meta.goal_id, day);
      }
      for (const day of toAdd) {
        await alternarDia(meta.goal_id, day);
      }
      
      setSaved(true);
      
      // Cerrar la modal automáticamente después de 1 segundo
      // para que el usuario vea el "✓ Guardado"
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error al guardar días:', err);
      setSaved(false);
    } finally {
      setLoading(false);
    }
  };

  const numDias = calcularNumDias();
  const columnasReveal = calcularDiasParaRevelar();
  
  // Calcular dinero ahorrado
  const dineroAhorrado = Array.from(selectedDays).reduce((sum, day) => {
    return sum + (meta.daily_amounts?.[day.toString()] || 0);
  }, 0);

  // El progreso ahora se basa en el dinero ahorrado vs el objetivo total
  const progreso = meta.target_amount > 0 ? (dineroAhorrado / meta.target_amount) * 100 : 0;

  return (
    <div className="plantilla-overlay" onClick={onClose}>
      <div className="plantilla-container" onClick={(e) => e.stopPropagation()}>
        <div className="plantilla-header">
          <h2>{meta.name}</h2>
          <button className="plantilla-close" onClick={onClose}>✕</button>
        </div>

        <div className="plantilla-content">
          {/* Información de la meta */}
          <div className="plantilla-info">
            <div className="info-item">
              <span className="info-label">Objetivo:</span>
              <span className="info-value">{formatearAK(meta.target_amount)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Ahorrado:</span>
              <span className="info-value" style={{ color: '#5b6ef5' }}>
                {formatearAK(dineroAhorrado)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Días marcados:</span>
              <span className="info-value">{selectedDays.size} / {numDias}</span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="plantilla-progress">
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progreso}%`, background: getProgresoGradient(progreso) }}></div>
            </div>
            <p className="progress-percentage" style={{ color: getProgresoColor(progreso) }}>{Math.round(progreso)}% completado</p>
          </div>

          {/* Grid de días */}
          <div
            className="plantilla-grid"
            style={{
              gridTemplateColumns: `repeat(${columnasReveal}, 1fr)`,
              overflowX: isMobile ? 'auto' : 'unset', // Habilitar scroll horizontal en móvil
            }}
          >
            {Array.from({ length: numDias }, (_, i) => {
              const dayNumber = i + 1;
              const isSelected = selectedDays.has(dayNumber);
              const dailyAmount = meta.daily_amounts?.[dayNumber.toString()] || 0;

              return (
                <button
                  key={dayNumber}
                  className={`plantilla-day ${isSelected ? 'completed' : ''}`}
                  onClick={() => handleToggleDay(dayNumber)}
                  disabled={loading}
                  type="button"
                >
                  <div className="day-number">Día {dayNumber}</div>
                  <div className="day-amount">{formatearAK(dailyAmount)}</div>
                  {isSelected && <div className="day-checkmark">✓</div>}
                </button>
              );
            })}
          </div>

          {/* Botones de acción */}
          <div className="plantilla-actions">
            <button 
              className="btn-cancelar-plantilla" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              className={`btn-guardar-plantilla ${saved ? 'saved' : ''}`}
              onClick={handleGuardar}
              disabled={loading}
            >
              {loading ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar Días'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
