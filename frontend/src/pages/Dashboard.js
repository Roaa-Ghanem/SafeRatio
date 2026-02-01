import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const insuranceCards = [
        {
            title: 'Car Insurance',
            description: 'Manage your vehicle insurance policies',
            icon: 'directions_car',
            action: () => navigate('/vehicles'),
            enabled: true
        },
        {
            title: 'Health Insurance',
            description: 'Organization health insurance management',
            icon: 'medical_services',
            action: () => alert('Coming soon!'),
            enabled: false
        },
        {
            title: 'Insurance Quotes',
            description: 'View and manage your insurance quotes',
            icon: 'request_quote',
            action: () => navigate('/quotes'),
            enabled: true
        },
        {
            title: 'Claims',
            description: 'Track and manage insurance claims',
            icon: 'assignment',
            action: () => navigate('/claims'),
            enabled: true
        }
    ];

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>SafeRatio Dashboard</h1>
                <div className="user-info">
                    <span>Welcome, {user?.first_name || user?.username}!</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </header>
            
            <main className="dashboard-main">
                <div className="welcome-section">
                    <h2>Insurance Management Portal</h2>
                    <p>Manage all your insurance policies in one place</p>
                </div>

                <div className="dashboard-cards">
                    {insuranceCards.map((card, index) => (
                        <div key={index} className={`card ${!card.enabled ? 'disabled' : ''}`}>
                            <div className="card-icon">
                                <span className="material-symbols-outlined">{card.icon}</span>
                            </div>
                            <h3>{card.title}</h3>
                            <p>{card.description}</p>
                            <button 
                                onClick={card.action} 
                                disabled={!card.enabled}
                                className={card.enabled ? 'btn-primary' : 'btn-disabled'}
                            >
                                {card.enabled ? 'Manage' : 'Coming Soon'}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="quick-stats">
                    <div className="stat-card">
                        <h4>Active Policies</h4>
                        <div className="stat-number">0</div>
                        <p>No active policies</p>
                    </div>
                    <div className="stat-card">
                        <h4>Pending Quotes</h4>
                        <div className="stat-number">0</div>
                        <p>No pending quotes</p>
                    </div>
                    <div className="stat-card">
                        <h4>Open Claims</h4>
                        <div className="stat-number">0</div>
                        <p>No open claims</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;