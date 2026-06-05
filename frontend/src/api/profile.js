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
  const token = localStorage.getItem("token");
  const res = await fetch("/api/profile/picture", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function eliminarFotoPerfil() {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/profile/picture", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}