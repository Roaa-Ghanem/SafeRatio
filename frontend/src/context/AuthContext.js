import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';


const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user exists in localStorage
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');
        
        if (token && userData) {
            try {
                // Make sure it's valid JSON
                if (userData && userData !== 'undefined' && userData !== 'null') {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    console.log('User loaded from localStorage:', parsedUser);
                } else {
                    // Clear invalid data
                    localStorage.clear();
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            console.log('Attempting login for:', username);
            
            const response = await axios.post('http://localhost:8000/api/auth/login/', {
                username,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            console.log('Login response:', response.data);
    
            const { access, refresh } = response.data;
            
            // Store tokens first
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            
            // Fetch the user profile
            const profileResponse = await axios.get('http://localhost:8000/api/auth/profile/', {
                headers: {
                    'Authorization': `Bearer ${access}`
                }
            });
            
            console.log('Profile response:', profileResponse.data);
            
            // Extract user data from the nested structure
            const profileData = profileResponse.data;
            
            // Create a complete user object combining profile and nested user data
            const userData = {
                // From the nested user object
                id: profileData.user?.id,
                username: profileData.user?.username,
                email: profileData.user?.email,
                first_name: profileData.user?.first_name,
                last_name: profileData.user?.last_name,
                user_type: profileData.user?.user_type, // This is the KEY field!
                
                // From the profile object
                profile_id: profileData.id,
                age: profileData.age,
                sensitive_info_completed: profileData.sensitive_info_completed,
                date_of_birth: profileData.date_of_birth,
                
                // Add access token for API calls
                accessToken: access,
                refreshToken: refresh
            };
            
            console.log('Processed user data:', userData);
            
            // Store in localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Update state
            setUser(userData);
    
            return { success: true, user: userData };
        } catch (error) {
            console.error('Login error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            return { 
                success: false, 
                error: error.response?.data?.detail || 
                       error.response?.data?.error || 
                       'Login failed. Please check your credentials.' 
            };
        }
    };

const register = async (userData) => {
    console.log('AuthContext: Starting registration for', userData.username);
    setLoading(true);
    try {
        const response = await axios.post('http://localhost:8000/api/auth/register/', userData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('AuthContext: Registration successful', response.data);
        
        const { access, refresh, user } = response.data;
        
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        
        return { success: true, user };
    } catch (error) {
        console.error('AuthContext: Registration error details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        
        // Initialize error object
        const formattedErrors = {};
        
        // Check if we have a response from the server
        if (error.response && error.response.data) {
            const errorData = error.response.data;
            
            console.log('AuthContext: Raw error data from server:', errorData);
            
            // Handle different error formats from Django REST Framework
            if (typeof errorData === 'object') {
                // Field-specific errors
                if (errorData.username) {
                    formattedErrors.username = Array.isArray(errorData.username) 
                        ? errorData.username[0] 
                        : errorData.username;
                    console.log('Username error:', formattedErrors.username);
                }
                if (errorData.email) {
                    formattedErrors.email = Array.isArray(errorData.email) 
                        ? errorData.email[0] 
                        : errorData.email;
                    console.log('Email error:', formattedErrors.email);
                }
                if (errorData.phone) {
                    formattedErrors.phone = Array.isArray(errorData.phone) 
                        ? errorData.phone[0] 
                        : errorData.phone;
                }
                if (errorData.password) {
                    formattedErrors.password = Array.isArray(errorData.password) 
                        ? errorData.password[0] 
                        : errorData.password;
                }
                if (errorData.user_type) {
                    formattedErrors.user_type = Array.isArray(errorData.user_type) 
                        ? errorData.user_type[0] 
                        : errorData.user_type;
                }
                if (errorData.non_field_errors) {
                    formattedErrors.general = Array.isArray(errorData.non_field_errors)
                        ? errorData.non_field_errors[0]
                        : errorData.non_field_errors;
                }
                if (errorData.detail) {
                    formattedErrors.general = errorData.detail;
                }
            } else if (typeof errorData === 'string') {
                // General error string
                formattedErrors.general = errorData;
            }
        } else if (error.request) {
            // The request was made but no response was received
            formattedErrors.general = 'No response from server. Please try again.';
        } else {
            // Something happened in setting up the request
            formattedErrors.general = error.message || 'Registration failed. Please try again.';
        }
        
        // Ensure we have at least one error message
        if (Object.keys(formattedErrors).length === 0) {
            formattedErrors.general = 'Registration failed. Please try again.';
        }
        
        console.log('AuthContext: Final formatted errors to return:', formattedErrors);
        return { 
            success: false, 
            error: formattedErrors 
        };
    } finally {
        setLoading(false);
    }
};

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
    };

        const refreshUser = async (updatedUserData = null) => {
        if (updatedUserData) {
            // تحديث من بيانات ممررة
            setUser(updatedUserData);
            localStorage.setItem('user', JSON.stringify(updatedUserData));
        } else {
            // جلب بيانات جديدة من السيرفر
            try {
                const response = await authService.getProfile();
                if (response.success) {
                    setUser(response.data);
                    localStorage.setItem('user', JSON.stringify(response.data));
                }
            } catch (error) {
                console.error('Refresh user error:', error);
            }
        }
    };

    // ✅ دالة مساعدة لتحديث بيانات معينة فقط
    const updateUserField = (field, value) => {
        if (user) {
            const updatedUser = { ...user, [field]: value };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    // ✅ دالة لتحديث الصورة الشخصية
    const updateUserAvatar = (avatarUrl) => {
        if (user) {
            const updatedUser = { ...user, avatar_url: avatarUrl };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const value = {
        user,
        setUser,
        login,
        register,
        logout,
        loading,
        updateUserAvatar,
        refreshUser,
        updateUserField,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};