// ملف: src/pages/QuoteDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './QuoteDetails.css';

const QuoteDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        fetchQuoteDetails();
    }, [id]);

    const fetchQuoteDetails = async () => {
        try {
            setLoading(true);
            // استخدم المسار الصحيح للـ API
            const response = await api.get(`/api/car-insurance/quotes/${id}/`);
            setQuote(response.data);
        } catch (error) {
            console.error('Error fetching quote:', error);
            alert('Failed to load quote details');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptQuote = async () => {
        if (!window.confirm('Are you sure you want to accept this quote?')) {
            return;
        }

        setAccepting(true);
        try {
            // هذا هو المسار الصحيح للـ API
            const response = await api.post(`/api/car-insurance/quotes/${id}/accept/`);
            
            alert('Quote accepted successfully! Policy created.');
            
            if (response.data.policy) {
                // الانتقال إلى صفحة الوثيقة
                navigate(`/insurance/policies/${response.data.policy.policy_number}`);
            }
            
        } catch (error) {
            console.error('Error accepting quote:', error);
            const errorMsg = error.response?.data?.error || 
                            'Failed to accept quote';
            alert(`Error: ${errorMsg}`);
        } finally {
            setAccepting(false);
        }
    };

    const handleBack = () => {
        navigate(-1); // العودة للصفحة السابقة
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading quote details...</p>
            </div>
        );
    }

    if (!quote) {
        return (
            <div className="error-container">
                <h2>Quote Not Found</h2>
                <p>The requested quote could not be found.</p>
                <button onClick={handleBack} className="btn btn-primary">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="quote-details-container">
            <div className="quote-header">
                <button onClick={handleBack} className="back-btn">
                    ← Back
                </button>
                <h1>Quote Details: {quote.quote_number}</h1>
                <span className={`status-badge status-${quote.status}`}>
                    {quote.status_display || quote.status}
                </span>
            </div>

            <div className="quote-content">
                <div className="quote-section">
                    <h3>Vehicle Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <strong>Make:</strong> {quote.vehicle?.make || 'N/A'}
                        </div>
                        <div className="info-item">
                            <strong>Model:</strong> {quote.vehicle?.model || 'N/A'}
                        </div>
                        <div className="info-item">
                            <strong>Year:</strong> {quote.vehicle?.year || 'N/A'}
                        </div>
                        <div className="info-item">
                            <strong>VIN:</strong> {quote.vehicle?.chassis_number || 'N/A'}
                        </div>
                    </div>
                </div>

                <div className="quote-section">
                    <h3>Quote Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <strong>Coverage Type:</strong> 
                            {quote.coverage_type_display || quote.coverage_type}
                        </div>
                        <div className="info-item">
                            <strong>Premium:</strong>
                            <span className="premium">
                                ${quote.final_premium || '0.00'}
                            </span>
                        </div>
                        <div className="info-item">
                            <strong>Excess Amount:</strong> ${quote.excess_amount || '0.00'}
                        </div>
                        <div className="info-item">
                            <strong>Created:</strong> 
                            {new Date(quote.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <div className="actions-section">
                    <h3>Actions</h3>
                    <div className="action-buttons">
                        <button 
                            className="btn btn-secondary"
                            onClick={() => window.print()}
                        >
                            🖨️ Print Quote
                        </button>
                        
                        <button 
                            className="btn btn-primary"
                            onClick={handleAcceptQuote}
                            disabled={accepting || quote.status !== 'quoted'}
                        >
                            {accepting ? 'Processing...' : '✅ Accept Quote'}
                        </button>
                        
                        {quote.status === 'accepted' && quote.policy && (
                            <button 
                                className="btn btn-success"
                                onClick={() => navigate(`/insurance/policies/${quote.policy}`)}
                            >
                                📄 View Policy
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteDetails;