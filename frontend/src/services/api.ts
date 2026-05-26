import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string | undefined) || '/api',
  withCredentials: true,
});

// Interceptor: redireciona para login se o token expirar (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@sigti:user');

      // Só redireciona se não estiver já na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
