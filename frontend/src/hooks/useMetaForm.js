import { useState } from 'react';
import { createSavingGoal, updateSavingGoal } from '../api/savings';

const INITIAL_STATE = {
  name: '',
  description: '',
  target_amount: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  image_url: '',
};

export function useMetaForm(onSuccess, metaExistente = null) {
  const [form, setForm] = useState(
    metaExistente
      ? {
          name: metaExistente.name,
          description: metaExistente.description || '',
          target_amount: metaExistente.target_amount,
          start_date: metaExistente.start_date,
          end_date: metaExistente.end_date,
          image_url: metaExistente.image_url || '',
        }
      : INITIAL_STATE
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(''); // Limpia el error cuando el usuario interactúa
    
    // Si es el monto, solo permitir números redondos (múltiplos de 1000)
    if (name === 'target_amount') {
      // Solo permitir dígitos
      const onlyNumbers = value.replace(/\D/g, '');
      
      setForm(prev => ({
        ...prev,
        [name]: onlyNumbers,
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!form.name.trim()) {
      setError('El nombre de la meta es obligatorio');
      return;
    }

    if (!form.target_amount || parseFloat(form.target_amount) <= 0) {
      setError('El monto objetivo debe ser mayor a 0');
      return;
    }

    const amount = parseFloat(form.target_amount);
    
    // Validar que sea múltiplo de 1000
    if (amount % 1000 !== 0) {
      setError('El monto debe ser un número redondo (múltiplo de 1000). Ej: 30000, 50000');
      return;
    }

    if (!form.end_date) {
      setError('La fecha de fin es obligatoria');
      return;
    }

    const endDate = new Date(form.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (endDate < today) {
      setError('La fecha de fin debe ser hoy o en el futuro');
      return;
    }

    // Validar que start_date sea antes que end_date si se proporciona
    if (form.start_date) {
      const startDate = new Date(form.start_date);
      if (startDate > endDate) {
        setError('La fecha de inicio debe ser anterior a la fecha de fin');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        target_amount: parseFloat(form.target_amount),
        start_date: form.start_date,
        end_date: form.end_date,
        image_url: form.image_url.trim() || null,
      };

      if (metaExistente) {
        await updateSavingGoal(metaExistente.goal_id, payload);
      } else {
        await createSavingGoal(payload);
      }

      setForm(INITIAL_STATE);
      onSuccess?.();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Error al guardar la meta'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(INITIAL_STATE);
    setError('');
  };

  return {
    form,
    error,
    loading,
    handleChange,
    handleSubmit,
    resetForm,
  };
}
