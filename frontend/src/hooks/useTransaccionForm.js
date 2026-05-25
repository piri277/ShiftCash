import { useState } from 'react';
import { crearTransaccion, actualizarTransaccion } from '../api/transactions';

const INITIAL_STATE = {
  category_id:  '',
  type:         'expense',
  amount:       '',
  description:  '',
  trans_date:   '',
  is_recurring: false,   
  frequency:    '',      
};

export function useTransaccionForm(onSuccess, transaccionExistente = null) {
  const [form, setForm] = useState(
    transaccionExistente
      ? {
          category_id:  transaccionExistente.category_id,
          type:         transaccionExistente.type,
          amount:       transaccionExistente.amount,
          description:  transaccionExistente.description || '',
          trans_date:   transaccionExistente.trans_date,
          is_recurring: transaccionExistente.is_recurring ?? false,  
          frequency:    transaccionExistente.frequency    ?? '',     
        }
      : INITIAL_STATE
  );
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError(''); // Limpia el error cuando el usuario interactúa
    setForm(prev => ({
      ...prev,
      // los checkbox usan checked, el resto usan value
      [name]: type === 'checkbox' ? checked : value,
      // si desactivan recurrente, limpia la frecuencia
      ...(name === 'is_recurring' && !checked ? { frequency: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones más específicas
    if (!form.amount && !form.category_id) {
      setError('El monto y la categoría son obligatorios');
      return;
    }
    if (!form.amount) {
      setError('El monto es obligatorio');
      return;
    }
    if (!form.category_id) {
      setError('Debes seleccionar una categoría');
      return;
    }


    // Si marcó recurrente, la frecuencia es obligatoria
    if (form.is_recurring && !form.frequency) {
      setError('Selecciona la frecuencia de repetición');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        amount:       parseFloat(form.amount),
        trans_date:   form.trans_date || undefined,
        frequency:    form.is_recurring ? form.frequency : null,
      };

      if (transaccionExistente) {
        await actualizarTransaccion(transaccionExistente.trans_id, payload);
      } else {
        await crearTransaccion(payload);
      }

      setForm(INITIAL_STATE);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar la transacción');
    } finally {
      setLoading(false);
    }
  };

  return { form, error, loading, handleChange, handleSubmit };
}