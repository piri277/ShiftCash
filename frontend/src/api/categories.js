import api from './axios';

export const getCategorias       = ()         => api.get('/categories/').then(r => r.data);
export const crearCategoria      = (data)     => api.post('/categories/', data).then(r => r.data);
export const actualizarCategoria = (id, data) => api.put(`/categories/${id}`, data).then(r => r.data);
export const eliminarCategoria   = (id)       => api.delete(`/categories/${id}`);