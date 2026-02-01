// src/App.js - الإصدار المصحح
import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';
import React, { useState, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthModal from "./components/AuthModal";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import VehicleList from "./pages/VehicleList";
import ConfirmEmail from './pages/ConfirmEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import HealthInsurance from './pages/HealthInsurance';
import VehiclesInsurance from './pages/VehiclesInsurance';
import "./App.css";
import QuoteDetails from './pages/QuoteDetails';
import PolicyDetails from './pages/PolicyDetails';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogs from './pages/admin/AdminLogs';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminUserEdit from './pages/admin/AdminUserEdit';

// هذا المكون يجب أن يكون داخل AuthProvider
function AppContent() {
    const { loading } = useAuth(); // الآن هذه ستكون داخل AuthProvider
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState("login");

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    const openLogin = () => {
        setAuthModalView("login");
        setAuthModalOpen(true);
    };

    const openRegister = () => {
        setAuthModalView("register");
        setAuthModalOpen(true);
    };

    return (
        <>
            <Routes>
                <Route
                    path="/"
                    element={
                        <LandingPage
                            onLoginClick={openLogin}
                            onRegisterClick={openRegister}
                        />
                    }
                />
                
                {/* Role-based routes */}
                <Route
                    path="/health-insurance"
                    element={
                        <ProtectedRoute>
                            <HealthInsurance />
                        </ProtectedRoute>
                    }
                />
                
                <Route
                    path="/vehicles-insurance"
                    element={
                        <ProtectedRoute>
                            <VehiclesInsurance />
                        </ProtectedRoute>
                    }
                />
                
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                
                <Route
                    path="/vehicles"
                    element={
                        <ProtectedRoute>
                            <VehicleList />
                        </ProtectedRoute>
                    }
                />
                <Route path="/confirm-email" element={<ConfirmEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/car-insurance/quotes/:id"
                    element={
                        <ProtectedRoute>
                            <QuoteDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/car-insurance/policies/:id"
                    element={
                        <ProtectedRoute>
                            <PolicyDetails />
                        </ProtectedRoute>
                    }
                />
                
                {/* Admin route - simple version for now */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminUsers />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/users/create"
                    element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminUserEdit />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/users/:id"
                    element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminUserDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/users/:id/edit"
                    element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminUserEdit />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/reports"
                    element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminReports />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/settings"
                    element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminSettings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/logs"
                    element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminLogs />
                        </ProtectedRoute>
                    }
                />
                
                {/* نزيل RoleBasedRedirect من هنا ونضيف redirect مباشرة */}
                <Route 
                    path="/role-redirect" 
                    element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} 
                />
            </Routes>

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialView={authModalView}
            />
        </>
    );
}

// مكون RoleRedirect منفصل بداخل ProtectedRoute
function RoleRedirect() {
    const { user } = useAuth();
    
    if (!user) {
        return <Navigate to="/" />;
    }
    
    // Redirect based on user_type
    switch(user.user_type) {
        case 'organization':
            return <Navigate to="/health-insurance" />;
        case 'individual':
            return <Navigate to="/vehicles-insurance" />;
        case 'admin':
            return <Navigate to="/admin/dashboard" />;
        default:
            return <Navigate to="/admin/dashboard" />;
    }
}

// App الرئيسي
function App() {
    return (
        <I18nextProvider i18n={i18n}>
      <Suspense fallback={<div>Loading...</div>}>
        <Router>
            <AuthProvider>
                <div className="App">
                    <AppContent />
                </div>
            </AuthProvider>
        </Router>
        </Suspense>
    </I18nextProvider>
    );
}

export default App;