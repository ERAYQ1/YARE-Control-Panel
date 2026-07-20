import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('yare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('yare_refresh_token');
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const res = await axios.post('/api/v1/auth/refresh', { refreshToken });
          localStorage.setItem('yare_token', res.data.token);
          localStorage.setItem('yare_refresh_token', res.data.refreshToken);
          error.config.headers.Authorization = `Bearer ${res.data.token}`;
          return axios(error.config);
        } catch {
          localStorage.removeItem('yare_token');
          localStorage.removeItem('yare_refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
