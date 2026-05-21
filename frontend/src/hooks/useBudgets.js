import { useState, useEffect } from 'react';
import { getBudgets, crearBudget, actualizarBudget, eliminarBudget } from '../api/budgets';
import { getCategorias } from '../api/categories';

export function useBudgets() {
  const [budgets, setBudgets] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      try {
        const [presupuestosData, categoriasData] = await Promise.all([
          getBudgets(),
          getCategorias()
        ]);
        setBudgets(presupuestosData);
        setCategorias(categoriasData);
      } catch (err) {
        setError(err.response?.data?.detail || 'Error al cargar presupuestos');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const recargar = async () => {
    try {
      const data = await getBudgets();
      setBudgets(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al recargar presupuestos');
    }
  };

  const guardar = async (formData) => {
    try {
      const nuevoPresupuesto = await crearBudget(formData);
      setBudgets(prev => [...prev, nuevoPresupuesto]);
      return { success: true, data: nuevoPresupuesto };
    } catch (err) {
      const mensajeError = err.response?.data?.detail || 'Error al crear presupuesto';
      throw new Error(mensajeError);
    }
  };

  const actualizar = async (budgetId, formData) => {
    try {
      const presupuestoActualizado = await actualizarBudget(budgetId, formData);
      setBudgets(prev =>
        prev.map(p => p.budget_id === budgetId ? presupuestoActualizado : p)
      );
      return { success: true, data: presupuestoActualizado };
    } catch (err) {
      const mensajeError = err.response?.data?.detail || 'Error al actualizar presupuesto';
      throw new Error(mensajeError);
    }
  };

  const eliminar = async (budgetId) => {
    try {
      await eliminarBudget(budgetId);
      setBudgets(prev => prev.filter(p => p.budget_id !== budgetId));
      return { success: true };
    } catch (err) {
      const mensajeError = err.response?.data?.detail || 'Error al eliminar presupuesto';
      throw new Error(mensajeError);
    }
  };

  return {
    budgets,
    categorias,
    loading,
    error,
    recargar,
    guardar,
    actualizar,
    eliminar,
  };
}
