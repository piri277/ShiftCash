import { useState } from 'react';
import { crearTransaccion, actualizarTransaccion } from '../api/transactions';

const INITIAL_STATE = {
<<<<<<< HEAD
  category_id:  '',
  type:         'expense',
  amount:       '',
  description:  '',
  trans_date:   '',
  is_recurring: false,   
  frequency:    '',      
=======
  category_id: '',
  type: 'expense',
  amount: '',
  description: '',
  trans_date: '',
>>>>>>> 3fa000b36689b6ccfcd60856f5a0318f4bfa9617
};

export function useTransaccionForm(onSuccess, transaccionExistente = null) {
  const [form, setForm] = useState(
    transaccionExistente
      ? {
<<<<<<< HEAD
          category_id:  transaccionExistente.category_id,
=======
          category_id: transaccionExistente.category_id,
>>>>>>> 3fa000b36689b6ccfcd60856f5a0318f4bfa9617
          type:         transaccionExistente.type,
          amount:       transaccionExistente.amount,
          description:  transaccionExistente.description || '',
          trans_date:   transaccionExistente.trans_date,
<<<<<<< HEAD
          is_recurring: transaccionExistente.is_recurring ?? false,  
          frequency:    transaccionExistente.frequency    ?? '',     
=======
>>>>>>> 3fa000b36689b6ccfcd60856f5a0318f4bfa9617
        }
      : INITIAL_STATE
  );
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
<<<<<<< HEAD
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      // los checkbox usan checked, el resto usan value
      [name]: type === 'checkbox' ? checked : value,
      // si desactivan recurrente, limpia la frecuencia
      ...(name === 'is_recurring' && !checked ? { frequency: '' } : {}),
    }));
=======
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
>>>>>>> 3fa000b36689b6ccfcd60856f5a0318f4bfa9617
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.amount || !form.category_id) {
      setError('El monto y la categoría son obligatorios');
      return;
    }

<<<<<<< HEAD
    // Si marcó recurrente, la frecuencia es obligatoria
    if (form.is_recurring && !form.frequency) {
      setError('Selecciona la frecuencia de repetición');
      return;
    }

=======
>>>>>>> 3fa000b36689b6ccfcd60856f5a0318f4bfa9617
    setLoading(true);
    try {
      const payload = {
        ...form,
<<<<<<< HEAD
        amount:       parseFloat(form.amount),
        trans_date:   form.trans_date || undefined,
        frequency:    form.is_recurring ? form.frequency : null,
=======
        amount: parseFloat(form.amount),
        trans_date: form.trans_date || undefined,
>>>>>>> 3fa000b36689b6ccfcd60856f5a0318f4bfa9617
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