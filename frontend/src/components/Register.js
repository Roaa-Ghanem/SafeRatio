import React, { useState, useEffect } from 'react';
import BrandIcon from './BrandIcon';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './AuthModal.css';

const Register = ({ onClose, switchToLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
        user_type: 'individual',
        phone: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Get user_type from URL query parameter
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const userTypeParam = queryParams.get('user_type');
        
        const validTypes = ['individual', 'organization', 'admin'];
        if (userTypeParam && validTypes.includes(userTypeParam)) {
            setFormData(prev => ({ 
                ...prev, 
                user_type: userTypeParam 
            }));
        }
    }, [location]);

    const { register } = useAuth();

    const validateForm = () => {
        const newErrors = {};
        
        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one number';
        } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one special character (@$!%*?&)';
        }
        
        // Confirm password
        if (!formData.password2) {
            newErrors.password2 = 'Please confirm your password';
        } else if (formData.password !== formData.password2) {
            newErrors.password2 = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user types in this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleUserTypeChange = (type) => {
        setFormData(prev => ({
            ...prev,
            user_type: type
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitAttempted(true);

        console.log('=== REGISTER FORM SUBMISSION START ===');
        console.log('Form data:', formData);
        console.log('Current errors:', errors);
        
        // Validate form
        if (!validateForm()) {
            console.log('Form validation failed:', errors);
            return;
        }
        
        console.log('Submitting registration...');
        setLoading(true);
        
        try {
            const result = await register(formData);
            console.log('Registration result:', result);
            
            if (result.success) {
                // Registration successful - redirect
                console.log('Registration successful, redirecting...');
                if (onClose) onClose();
                
                // Redirect based on user_type
                if (formData.user_type === 'organization') {
                    navigate('/health-insurance');
                } else if (formData.user_type === 'individual') {
                    navigate('/vehicles-insurance');
                } else {
                    navigate('/admin/dashboard');
                }
            } else {
                // Handle backend errors - THIS IS WHERE ERRORS SHOULD BE DISPLAYED
                console.log('Registration failed with backend errors:', result.error);
                
                if (result.error) {
                    // Create a new errors object
                    const backendErrors = {};
                    
                    // Map backend errors to form fields
                    if (result.error.username) {
                        backendErrors.username = result.error.username;
                    }
                    if (result.error.email) {
                        backendErrors.email = result.error.email;
                    }
                    if (result.error.phone) {
                        backendErrors.phone = result.error.phone;
                    }
                    if (result.error.password) {
                        backendErrors.password = result.error.password;
                    }
                    if (result.error.user_type) {
                        backendErrors.user_type = result.error.user_type;
                    }
                    if (result.error.general) {
                        backendErrors.general = result.error.general;
                    }
                    
                    // If no field-specific errors but there's a general error
                    if (Object.keys(backendErrors).length === 0 && typeof result.error === 'string') {
                        backendErrors.general = result.error;
                    }
                    
                    console.log('Setting backend errors:', backendErrors);
                    setErrors(backendErrors);
                } else {
                    setErrors({ general: 'Registration failed. Please try again.' });
                }
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            setErrors({ general: 'An unexpected error occurred. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const getUserTypeDisplay = (type) => {
        const types = {
            'individual': 'Individual',
            'organization': 'Organization'
        };
        return types[type] || type;
    };

    return (
        <div className="auth-modal">
            <div className="auth-content" onClick={(e) => e.stopPropagation()}>
                
                <div className="auth-header">
                    <div className="auth-header-left">
                        <span className="auth-icon" aria-hidden>
                            <BrandIcon variant="shield" size={32} color="#4f46e5" />
                        </span>
                        <h2>Create Account</h2>
                    </div>
                <button className="close-btn" onClick={onClose} disabled={loading}>×</button>
                </div>
                
                {/* General error message */}
                {errors.general && (
                    <div className="error-message general-error">
                        <strong>Error:</strong> {errors.general}
                    </div>
                )}
                
                {/* User type selection */}
                <div className="user-type-section">
                    <label>Account Type</label>
                    <div className="user-type-buttons">
                        {['individual', 'organization'].map(type => (
                            <button
                                key={type}
                                type="button"
                                className={`user-type-btn ${formData.user_type === type ? 'active' : ''}`}
                                onClick={() => handleUserTypeChange(type)}
                                disabled={loading}
                            >
                                {getUserTypeDisplay(type)}
                            </button>
                        ))}
                    </div>
                    <p className="user-type-description">
                        {formData.user_type === 'individual' 
                            ? 'For personal car insurance'
                            : 'For employee health insurance plans'}
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} noValidate>
                    {/* Name fields */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="Optional"
                                disabled={loading}
                                className={errors.first_name ? 'error' : ''}
                            />
                            {errors.first_name && <span className="field-error">{errors.first_name}</span>}
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="Optional"
                                disabled={loading}
                                className={errors.last_name ? 'error' : ''}
                            />
                            {errors.last_name && <span className="field-error">{errors.last_name}</span>}
                        </div>
                    </div>

                    {/* Username - THIS SHOULD SHOW "username already exists" */}
                    <div className="form-group">
                        <label>Username *</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={loading}
                            className={errors.username ? 'error' : ''}
                            required
                        />
                        {errors.username && (
                            <span className="field-error username-error">
                                {errors.username}
                            </span>
                        )}
                        {!errors.username && formData.username && submitAttempted && (
                            <span className="field-success">✓ Username looks good</span>
                        )}
                    </div>

                    {/* Email - THIS SHOULD SHOW "email already exists" */}
                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                            className={errors.email ? 'error' : ''}
                            required
                        />
                        {errors.email && (
                            <span className="field-error email-error">
                                {errors.email}
                            </span>
                        )}
                        {!errors.email && formData.email && submitAttempted && (
                            <span className="field-success">✓ Email looks good</span>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                        <label>Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+967 123 456 789"
                            disabled={loading}
                            className={errors.phone ? 'error' : ''}
                        />
                        {errors.phone && <span className="field-error">{errors.phone}</span>}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label>Password *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            className={errors.password ? 'error' : ''}
                            required
                        />
                        {errors.password && <span className="field-error">{errors.password}</span>}
                        {!errors.password && formData.password && submitAttempted && (
                            <span className="field-success">✓ Password meets requirements</span>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label>Confirm Password *</label>
                        <input
                            type="password"
                            name="password2"
                            value={formData.password2}
                            onChange={handleChange}
                            disabled={loading}
                            className={errors.password2 ? 'error' : ''}
                            required
                        />
                        {errors.password2 && <span className="field-error">{errors.password2}</span>}
                        {!errors.password2 && formData.password2 && formData.password === formData.password2 && (
                            <span className="field-success">✓ Passwords match</span>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="submit-btn primary-btn"
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Creating Account...
                            </>
                        ) : `Register as ${formData.user_type}`}
                    </button>
                </form>

                {/* Footer links */}
                <div className="auth-footer">
                    <p>
                        Already have an account? 
                        <button 
                            type="button" 
                            className="link-btn" 
                            onClick={switchToLogin}
                            disabled={loading}
                        >
                            Sign In
                        </button>
                    </p>
                    <p className="terms-text">
                        By registering, you agree to our 
                        <a href="/terms" className="link-btn"> Terms</a> and 
                        <a href="/privacy" className="link-btn"> Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;