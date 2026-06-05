import api from './axios';

export const getMe = () =>
  api.get('/users/me').then(r => r.data);

export const actualizarPerfil = (data) =>
  api.put('/users/me', data).then(r => r.data);

export const cambiarPassword = (data) =>
  api.put('/users/me/password', data).then(r => r.data);

export const actualizarMoneda = (currency) =>
  api.put('/users/me/currency', { currency }).then(r => r.data);

export const eliminarCuenta = () =>
  api.delete('/users/me');

export async function subirFotoPerfil(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/users/me/picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function eliminarFotoPerfil() {
  const { data } = await api.delete("/users/me/picture");
  return data;
}