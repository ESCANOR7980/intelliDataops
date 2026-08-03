import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';
const AuthCtx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) { API.get('/auth/me').then(r => setUser(r.data.user)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false)); }
    else { setLoading(false); }
  }, []);
  const login = async (email, password) => {
    const r = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', r.data.token); setUser(r.data.user); return r.data;
  };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };
  return <AuthCtx.Provider value={{ user, login, logout, loading }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);