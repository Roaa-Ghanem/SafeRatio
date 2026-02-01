// src/components/AdminRoute.js
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    // التحقق إذا كان المستخدم مسؤولاً
    if (!user || (user.user_type !== 'admin' && !user.is_staff && !user.is_superuser)) {
        // يمكنك تحسين هذا بناءً على نموذج المستخدم الخاص بك
        return <Navigate to="/dashboard" />;
    }
    
    return children;
};

export default AdminRoute;