// src/context/AuthContext.js - إصلاح لجلب بيانات كاملة
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('access_token');
                
                if (token) {
                    // ⭐⭐ **جلب بيانات المستخدم الكاملة من API**
                    try {
                        console.log('🔄 جلب بيانات المستخدم من API...');
                        const response = await api.get('/api/auth/profile/');
                        
                        if (response.data) {
                            const userData = response.data;
                            
                            // ⭐⭐ **تأكد من وجود user_type**
                            console.log('✅ بيانات المستخدم:', userData);
                            
                            setUser({
                                ...userData,
                                access_token: token
                            });
                            
                            // ⭐⭐ **حفظ user_type بشكل منفصل للوصول السريع**
                            if (userData.user_type) {
                                localStorage.setItem('user_type', userData.user_type);
                            }
                        }
                    } catch (profileError) {
                        console.error('❌ فشل جلب بيانات المستخدم:', profileError);
                        
                        // ⭐ إذا فشل جلب البروفايل، استخدم البيانات المخزنة
                        const storedUser = localStorage.getItem('user');
                        if (storedUser) {
                            try {
                                const parsedUser = JSON.parse(storedUser);
                                setUser(parsedUser);
                            } catch (e) {
                                console.error('❌ خطأ في تحليل بيانات المستخدم المخزنة:', e);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('خطأ في تحميل بيانات المستخدم:', error);
            } finally {
                setLoading(false);
            }
        };
        
        initAuth();
    }, []);

    const login = async (username, password) => {
        try {
            console.log('🔑 محاولة تسجيل الدخول:', username);
            
            // 1. الحصول على التوكن
            const tokenResponse = await api.post('/api/token/', {
                username,
                password
            });

            console.log('✅ تسجيل الدخول ناجح');
            const { access, refresh } = tokenResponse.data;
            
            // 2. حفظ التوكنات
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            
            // 3. جلب بيانات المستخدم الكاملة
            try {
                const userResponse = await api.get('/api/auth/profile/');
                const userData = userResponse.data;
                
                console.log('✅ بيانات المستخدم الكاملة:', userData);
                
                // 4. إنشاء كائن المستخدم الكامل
                const user = {
                    ...userData,
                    access_token: access,
                    refresh_token: refresh
                };
                
                // 5. الحفظ
                localStorage.setItem('user', JSON.stringify(user));
                
                if (userData.user_type) {
                    localStorage.setItem('user_type', userData.user_type);
                }
                
                setUser(user);
                
                // 6. التوجيه الذكي
                setTimeout(() => {
                    if (userData.user_type === 'organization') {
                        window.location.href = '/health-insurance';
                    } else if (userData.user_type === 'individual') {
                        window.location.href = '/vehicles-insurance';
                    } else if (userData.user_type === 'admin') {
                        window.location.href = '/admin/dashboard';
                    } else {
                        window.location.href = '/admin/dashboard';
                    }
                }, 500);

                return { success: true, user };
                
            } catch (profileError) {
                console.error('❌ فشل جلب البروفايل:', profileError);
                
                // ⭐ البديل: إنشاء مستخدم أساسي
                const basicUser = {
                    username,
                    access_token: access,
                    refresh_token: refresh,
                    user_type: 'individual' // ⭐ افتراضياً
                };
                
                localStorage.setItem('user', JSON.stringify(basicUser));
                localStorage.setItem('user_type', 'individual');
                setUser(basicUser);
                
                // توجيه افتراضي
                setTimeout(() => {
                    window.location.href = '/vehicles-insurance';
                }, 500);
                
                return { success: true, user: basicUser };
            }
            
        } catch (error) {
            console.error('❌ خطأ تسجيل الدخول:', error.response?.data || error.message);
            
            let errorMessage = 'فشل تسجيل الدخول';
            if (error.response?.status === 401) {
                errorMessage = 'اسم المستخدم أو كلمة المرور غير صحيحة';
            }
            
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        console.log('👋 تسجيل الخروج...');
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_type');
        
        setUser(null);
        window.location.href = '/';
    };

    const value = {
        user,
        setUser,
        login,
        logout,
        loading,
        isAuthenticated: !!localStorage.getItem('access_token')
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};