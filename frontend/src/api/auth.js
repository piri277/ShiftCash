import api from './axios';

export const loginUser = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const registerUser = async (username, email, password) => {
  const { data } = await api.post('/auth/register', { username, email, password });
  return data;
};

export const googleAuthUser = async (accessToken) => {
  const { data } = await api.post('/auth/google', { access_token: accessToken });
  return data;
};