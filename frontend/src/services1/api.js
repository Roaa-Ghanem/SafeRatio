// src/services/api.js - ملف واحد شامل
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// إنشاء axios instance أساسية
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request Interceptor لإضافة التوكن
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor لتجديد التوكن
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                
                if (!refreshToken) {
                    throw new Error('لا يوجد refresh token');
                }
                
                const refreshResponse = await axios.post(
                    `${API_BASE_URL}/api/token/refresh/`,
                    { refresh: refreshToken }
                );
                
                const newAccessToken = refreshResponse.data.access;
                localStorage.setItem('access_token', newAccessToken);
                
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
                
            } catch (refreshError) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }
        }
        
        return Promise.reject(error);
    }
);

// ⭐⭐ دوال authService يمكن تضمينها هنا
export const sendVerificationEmail = async (email) => {
    try {
        const response = await api.post('/api/auth/send-verification/', { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const confirmEmail = async (uid, token) => {
    try {
        const response = await api.get(`/api/auth/confirm-verification/?uid=${uid}&token=${token}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const sendPasswordReset = async (email) => {
    try {
        const response = await api.post('/api/auth/send-reset/', { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const resetPassword = async (uid, token, newPassword, newPassword2) => {
    try {
        const response = await api.post('/api/auth/reset-password/', {
            uid,
            token,
            new_password: newPassword,
            new_password2: newPassword2
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getProfile = async () => {
    try {
        const response = await api.get('/api/auth/profile/');
        return { success: true, data: response.data };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || error.message 
        };
    }
};

export const updateProfile = async (payload) => {
    try {
        const response = await api.put('/api/auth/profile/', payload);
        return { success: true, data: response.data };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || error.message 
        };
    }
};

export const uploadAvatar = async (avatarFile) => {
    try {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        const response = await api.post('/api/auth/upload-avatar/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || error.message 
        };
    }
};

// تصدير api للاستخدام المباشر + الدوال المساعدة
export { api };
export default {
    sendVerificationEmail,
    confirmEmail,
    sendPasswordReset,
    resetPassword,
    getProfile,
    updateProfile,
    uploadAvatar,
    api
};