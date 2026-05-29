import { useState, useCallback } from 'react';
import { getSavingGoals, createSavingGoal, updateSavingGoal, deleteSavingGoal, toggleDay } from '../api/savings';

export function useMetas() {
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar todas las metas
  const cargarMetas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSavingGoals();
      setMetas(data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar las metas');
      console.error('Error cargando metas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear una nueva meta
  const crearMeta = useCallback(async (metaData) => {
    setLoading(true);
    setError(null);
    try {
      const nuevaMeta = await createSavingGoal(metaData);
      setMetas(prev => [...prev, nuevaMeta]);
      return nuevaMeta;
    } catch (err) {
      setError(err.message || 'Error al crear la meta');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar una meta
  const actualizarMeta = useCallback(async (metaId, metaData) => {
    setLoading(true);
    setError(null);
    try {
      const metaActualizada = await updateSavingGoal(metaId, metaData);
      setMetas(prev => prev.map(m => m.goal_id === metaId ? metaActualizada : m));
      return metaActualizada;
    } catch (err) {
      setError(err.message || 'Error al actualizar la meta');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar una meta
  const eliminarMeta = useCallback(async (metaId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteSavingGoal(metaId);
      setMetas(prev => prev.filter(m => m.goal_id !== metaId));
    } catch (err) {
      setError(err.message || 'Error al eliminar la meta');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Alternar un día como completado
  const alternarDia = useCallback(async (metaId, dayNumber) => {
    try {
      const resultado = await toggleDay(metaId, dayNumber);
      
      // Actualizar la meta con los nuevos días completados y progreso
      setMetas(prev => prev.map(m => {
        if (m.goal_id === metaId) {
          return {
            ...m,
            completed_days: resultado.completed_days,
            progress: resultado.progress
          };
        }
        return m;
      }));
      
      return resultado;
    } catch (err) {
      setError(err.message || 'Error al alternar el día');
      throw err;
    }
  }, []);

  // Recargar metas
  const recargar = cargarMetas;

  return {
    metas,
    loading,
    error,
    cargarMetas,
    crearMeta,
    actualizarMeta,
    eliminarMeta,
    alternarDia,
    recargar,
  };
}
