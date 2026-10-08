import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('apex_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('apex_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh/', { refresh: refreshToken });
          const newAccessToken = res.data.access;
          localStorage.setItem('apex_access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('apex_access_token');
          localStorage.removeItem('apex_refresh_token');
          localStorage.removeItem('apex_user');
          window.dispatchEvent(new Event('auth:logout'));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
