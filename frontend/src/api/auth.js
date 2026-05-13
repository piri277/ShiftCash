import api from './axios';

export const loginUser = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data; // { access_token, token_type }
};

export const registerUser = async (username, email, password) => {
  const { data } = await api.post('/auth/register', { username, email, password });
  return data; // { id, username, email }
};