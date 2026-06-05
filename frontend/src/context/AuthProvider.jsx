import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  useEffect(() => {
    function onPerfilActualizado(e) {
      const detail = e.detail;
      localStorage.setItem('user', JSON.stringify(detail));
      setUser(detail);
    }
    window.addEventListener('perfil-actualizado', onPerfilActualizado);
    return () => window.removeEventListener('perfil-actualizado', onPerfilActualizado);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}