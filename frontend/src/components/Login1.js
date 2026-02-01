import React, { useState } from 'react';
import BrandIcon from './BrandIcon';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = ({ onClose, switchToRegister }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error on type
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.username || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        const result = await login(formData.username, formData.password);

        if (result.success) {
            const loggedUser = result.user;
            if (loggedUser && loggedUser.user_type === 'admin') {
                // redirect admin to dashboard
                navigate('/dashboard');
            } else {
                if (onClose) onClose(); // Close modal on success for regular users
            }
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const handleForgot = () => {
        // navigate to forgot password page
        navigate('/forgot-password');
    };

    const handleResendVerification = async () => {
        const email = window.prompt('Enter your email to resend verification:');
        if (!email) return;
        try {
            await authService.sendVerificationEmail(email);
            alert('Verification email sent (check backend console in dev).');
        } catch (err) {
            alert('Failed to send verification email.');
        }
    };

    return (
        <div className="auth-modal">
                <div className="auth-content">
                    <div className="auth-header">
                            <div className="auth-header-left">
                                <span className="auth-icon" aria-hidden>
                                    { /* use shared BrandIcon */ }
                                    <BrandIcon variant="user" size={32} color="#10b981" />
                                </span>
                                <h2>Sign In</h2>
                            </div>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <button type="submit" disabled={loading} className="submit-btn">
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        <button type="button" className="link-btn" onClick={handleForgot}>
                            Forgot password?
                        </button>
                        &nbsp;|&nbsp;
                        <button type="button" className="link-btn" onClick={switchToRegister}>
                            Sign Up
                        </button>
                        &nbsp;|&nbsp;
                        <button type="button" className="link-btn" onClick={handleResendVerification}>
                            Resend verification
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;