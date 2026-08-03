import axios from 'axios';

const API = axios.create({
  baseURL: 'https://intellidataops-zbsi.onrender.com/api'
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const fmt = n => n?.toLocaleString() ?? '0';

export const fmtDate = d =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
    : '—';

export const fmtTime = d =>
  d
    ? new Date(d).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
    : '—';

export default API;