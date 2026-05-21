import api from './axios';

export const getBudgets = () => api.get('/budgets/').then(r => r.data);
export const crearBudget = (data) => api.post('/budgets/', data).then(r => r.data);
export const actualizarBudget = (id, data) => api.put(`/budgets/${id}`, data).then(r => r.data);
export const eliminarBudget = (id) => api.delete(`/budgets/${id}`);
