import axios from 'axios';

const API = axios.create({ 
  baseURL: 'https://intellidataops.onrender.com/api'
});

API.interceptors.request.use(c => {
  const token = localStorage.getItem('token');
  if (token) c.headers.Authorization = `Bearer ${token}`;
  return c;
});

API.interceptors.response.use(r => r, e => {
  if (e.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(e);
});

export const fmt = n => n?.toLocaleString() ?? '0';
export const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const fmtTime = d => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

export default API;