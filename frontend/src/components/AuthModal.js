import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import './AuthModal.css'; 


const AuthModal = ({ isOpen, onClose, initialView = 'login' }) => {
    const [currentView, setCurrentView] = useState(initialView);

    // Keep currentView in sync when parent changes the initialView
    useEffect(() => {
        if (isOpen) {
            setCurrentView(initialView);
        }
    }, [initialView, isOpen]);

    if (!isOpen) return null;

    const switchToLogin = () => setCurrentView('login');
    const switchToRegister = () => setCurrentView('register');

    return (
        <div className="modal-overlay">
            {currentView === 'login' ? (
                <Login onClose={onClose} switchToRegister={switchToRegister} />
            ) : (
                <Register onClose={onClose} switchToLogin={switchToLogin} />
            )}
        </div>
    );
};

export default AuthModal;