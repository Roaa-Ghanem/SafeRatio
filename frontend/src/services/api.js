import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // ⚠️ حاول جميع المفاتيح الممكنة
    const token = localStorage.getItem('accessToken') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token found, adding to request');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('🔄 Attempting token refresh...');
      
      // ⚠️ حاول جميع المفاتيح الممكنة للـ refresh token
      const refreshToken = localStorage.getItem('refreshToken') || 
                          localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken
          });
          
          const newAccessToken = response.data.access;
          
          // حفظ الـ token الجديد بجميع المفاتيح الممكنة
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('token', newAccessToken);
          
          console.log('✅ Token refreshed successfully');
          
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          // If refresh fails, logout user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else {
        console.error('❌ No refresh token found');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;