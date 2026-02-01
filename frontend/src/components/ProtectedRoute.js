import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly= false }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/" />;
    }

    // إذا كانت الصفحة للمسؤولين فقط
    if (adminOnly) {
        // تحقق من صلاحية المسؤول
        const isAdmin = user.user_type === 'admin' || user.is_staff || user.is_superuser;
        if (!isAdmin) {
            return <Navigate to="/admin/dashboard" />;
        }
    }

    return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;