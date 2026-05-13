import { useState } from 'react';
import { crearTransaccion, actualizarTransaccion } from '../api/transactions';

const INITIAL_STATE = {
  category_id: '',
  type: 'expense',
  amount: '',
  description: '',
  trans_date: '',
};

export function useTransaccionForm(onSuccess, transaccionExistente = null) {
  const [form, setForm] = useState(
    transaccionExistente
      ? {
          category_id: transaccionExistente.category_id,
          type:         transaccionExistente.type,
          amount:       transaccionExistente.amount,
          description:  transaccionExistente.description || '',
          trans_date:   transaccionExistente.trans_date,
        }
      : INITIAL_STATE
  );
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.amount || !form.category_id) {
      setError('El monto y la categoría son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        trans_date: form.trans_date || undefined,
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