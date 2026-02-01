// src/components/ProtectedRoute.js - الإصدار المصحح
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // ⭐⭐ **لا تتحقق من التوكن في كل مرة!**
    // فقط اعتمد على حالة isAuthenticated
    
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">جار التحميل...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // حفظ الصفحة الحالية
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;