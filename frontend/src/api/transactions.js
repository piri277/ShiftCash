import api from './axios';

export const getCategorias = () =>
  api.get('/transactions/categories').then(r => r.data);

export const crearTransaccion = (data) =>
  api.post('/transactions/', data).then(r => r.data);

export const getTransacciones = () =>
  api.get('/transactions/').then(r => r.data);

export const actualizarTransaccion = (id, data) =>
  api.put(`/transactions/${id}`, data).then(r => r.data);

export const eliminarTransaccion = (id) =>
  api.delete(`/transactions/${id}`);