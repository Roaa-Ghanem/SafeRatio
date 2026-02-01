// src/pages/admin/AdminDashboard.js - النسخة المحدثة
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('month');
    const [activeTab, setActiveTab] = useState('overview');
    const [error, setError] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/';

    useEffect(() => {
        fetchAdminStats();
    }, [timeRange]);

    const fetchAdminStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`${API_URL}/api/admin/dashboard-stats/`, {
                params: { time_range: timeRange },
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data) {
                setStats(response.data);
            } else {
                throw new Error('لا توجد بيانات');
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            setError('فشل في تحميل البيانات. تأكد من صلاحيات المسؤول.');
            
            // بيانات تجريبية للاختبار
            setStats({
                users: {
                    total: 150,
                    active_today: 25,
                    new_today: 5,
                    by_type: { individual: 100, organization: 40, admin: 10 },
                    growth: {
                        new_users: 15,
                        active_users: 85,
                        monthly_growth: [
                            { month: '2024-01', users: 120 },
                            { month: '2024-02', users: 135 },
                            { month: '2024-03', users: 150 }
                        ]
                    }
                },
                policies: {
                    health: {
                        total: 45,
                        active: 30,
                        pending: 10,
                        revenue: 75000,
                        avg_premium: 1666.67
                    },
                    car: {
                        total: 25,
                        active: 18,
                        revenue: 50000,
                        avg_premium: 2000
                    },
                    total_active: 48,
                    total_revenue: 125000
                },
                quotes: {
                    pending: 12,
                    accepted: 33,
                    rejected: 5,
                    conversion_rate: 73.33
                },
                companies: {
                    total: 40,
                    by_sector: [
                        { sector: 'health_hospital', count: 10 },
                        { sector: 'tech_software', count: 8 },
                        { sector: 'construction_civil', count: 6 },
                        { sector: 'retail_store', count: 5 },
                        { sector: 'services_logistics', count: 4 }
                    ]
                },
                recent_activities: [
                    { 
                        type: 'user', 
                        description: 'مستخدم جديد مسجل: أحمد محمد', 
                        time: '2024-03-20T10:30:15Z',
                        user: 'أحمد محمد'
                    },
                    { 
                        type: 'policy', 
                        description: 'تم إنشاء بوليصة تأمين صحي جديدة: HP-ABC123', 
                        time: '2024-03-20T09:15:22Z',
                        user: 'شركة التقنية'
                    }
                ],
                period: {
                    range: timeRange
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'YER',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getUserTypeLabel = (type) => {
        const types = {
            individual: 'أفراد',
            organization: 'مؤسسات',
            admin: 'مسؤولين'
        };
        return types[type] || type;
    };

    const getSectorLabel = (sector) => {
        const sectors = {
            'health_hospital': 'مستشفيات',
            'tech_software': 'برمجيات',
            'construction_civil': 'مقاولات إنشائية',
            'retail_store': 'متاجر تجزئة',
            'services_logistics': 'شحن ولوجستيات'
        };
        return sectors[sector] || sector;
    };

    const arabicContent = {
        title: 'لوحة تحكم المسؤول',
        welcome: `مرحباً ${user?.first_name || user?.username}`,
        tabs: {
            overview: 'نظرة عامة',
            users: 'المستخدمين',
            policies: 'البوالص',
            companies: 'الشركات'
        },
        cards: {
            totalUsers: 'إجمالي المستخدمين',
            activeToday: 'نشطون اليوم',
            newToday: 'جدد اليوم',
            totalPolicies: 'إجمالي البوالص',
            activePolicies: 'البوالص النشطة',
            totalRevenue: 'إجمالي الإيرادات',
            pendingQuotes: 'عروض قيد الانتظار',
            conversionRate: 'معدل التحويل'
        }
    };

    if (loading) {
        return (
            <div className="admin-dashboard-loading" dir="rtl">
                <div className="loading-spinner"></div>
                <p>جاري تحميل بيانات لوحة التحكم...</p>
            </div>
        );
    }

    if (error && !stats) {
        return (
            <div className="admin-dashboard-error" dir="rtl">
                <div className="error-icon">!</div>
                <h3>حدث خطأ</h3>
                <p>{error}</p>
                <button onClick={fetchAdminStats} className="retry-btn">
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="admin-dashboard" dir="rtl">
            {/* Header */}
            <header className="admin-header">
                <div className="header-left">
                    <h1>{arabicContent.title}</h1>
                    <p className="welcome-message">{arabicContent.welcome}</p>
                    {error && (
                        <div className="warning-message">
                            ⚠️ {error} (يتم عرض بيانات تجريبية)
                        </div>
                    )}
                </div>
                <div className="header-right">
                    <div className="time-selector">
                        <select 
                            value={timeRange} 
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="time-select"
                        >
                            <option value="day">اليوم</option>
                            <option value="week">الأسبوع</option>
                            <option value="month">الشهر</option>
                            <option value="year">السنة</option>
                        </select>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        تسجيل خروج
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="admin-tabs">
                {Object.entries(arabicContent.tabs).map(([key, label]) => (
                    <button
                        key={key}
                        className={`admin-tab ${activeTab === key ? 'active' : ''}`}
                        onClick={() => setActiveTab(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <main className="admin-main">
                {activeTab === 'overview' && stats && (
                    <div className="overview-tab">
                        {/* Stats Cards */}
                        <div className="stats-grid">
                            <div className="stat-card admin-stat">
                                <div className="stat-icon">
                                    {/* <span className="material-symbols-outlined">people</span> */}
                                </div>
                                <div className="stat-content">
                                    <h3>{arabicContent.cards.totalUsers}</h3>
                                    <div className="stat-number">
                                        {stats.users?.total || 0}
                                    </div>
                                    <div className="stat-breakdown">
                                        {Object.entries(stats.users?.by_type || {}).map(([type, count]) => (
                                            <span key={type} className="type-count">
                                                {getUserTypeLabel(type)}: {count}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card admin-stat">
                                <div className="stat-icon">
                                    {/* <span className="material-symbols-outlined">shield</span> */}
                                </div>
                                <div className="stat-content">
                                    <h3>{arabicContent.cards.activePolicies}</h3>
                                    <div className="stat-number">
                                        {stats.policies?.total_active || 0}
                                    </div>
                                    <div className="stat-breakdown">
                                        <span className="type-count">
                                            صحي: {stats.policies?.health?.active || 0}
                                        </span>
                                        <span className="type-count">
                                            سيارات: {stats.policies?.car?.active || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card admin-stat">
                                <div className="stat-icon">
                                    {/* <span className="material-symbols-outlined">attach_money</span> */}
                                </div>
                                <div className="stat-content">
                                    <h3>{arabicContent.cards.totalRevenue}</h3>
                                    <div className="stat-number">
                                        {formatCurrency(stats.policies?.total_revenue || 0)}
                                    </div>
                                    <div className="stat-breakdown">
                                        <span className="type-count">
                                            صحي: {formatCurrency(stats.policies?.health?.revenue || 0)}
                                        </span>
                                        <span className="type-count">
                                            سيارات: {formatCurrency(stats.policies?.car?.revenue || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card admin-stat">
                                <div className="stat-icon">
                                    {/* <span className="material-symbols-outlined">request_quote</span> */}
                                </div>
                                <div className="stat-content">
                                    <h3>{arabicContent.cards.conversionRate}</h3>
                                    <div className="stat-number">
                                        {stats.quotes?.conversion_rate || 0}%
                                    </div>
                                    <div className="stat-breakdown">
                                        <span className="type-count">
                                            معلق: {stats.quotes?.pending || 0}
                                        </span>
                                        <span className="type-count">
                                            مقبول: {stats.quotes?.accepted || 0}
                                        </span>
                                        <span className="type-count">
                                            مرفوض: {stats.quotes?.rejected || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User Growth Chart */}
                        <div className="chart-section">
                            <h3>نمو المستخدمين</h3>
                            <div className="growth-chart">
                                {stats.users?.growth?.monthly_growth?.map((monthData, index) => (
                                    <div key={index} className="growth-bar">
                                        <div 
                                            className="bar-fill"
                                            style={{ height: `${(monthData.users / 200) * 100}%` }}
                                        >
                                            <span className="bar-value">{monthData.users}</span>
                                        </div>
                                        <div className="bar-label">{monthData.month}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activities */}
                        <div className="activities-card">
                            <div className="card-header">
                                <h3>آخر النشاطات</h3>
                                <button 
                                    className="view-all-btn"
                                    onClick={() => navigate('/admin/logs')}
                                >
                                    عرض الكل
                                </button>
                            </div>
                            <div className="activities-list">
                                {stats.recent_activities?.map((activity, index) => (
                                    <div key={index} className="activity-item">
                                        <div className="activity-icon">
                                            <span className="material-symbols-outlined">
                                                {activity.type === 'user' ? 'person_add' :
                                                 activity.type === 'policy' ? 'shield' :
                                                 'info'}
                                            </span>
                                        </div>
                                        <div className="activity-details">
                                            <p className="activity-description">
                                                {activity.description}
                                            </p>
                                            <span className="activity-time">
                                                {formatDate(activity.time)}
                                            </span>
                                        </div>
                                        <div className="activity-user">
                                            {activity.user}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && stats && (
                    <div className="users-tab">
                        <div className="tab-header">
                            <h2>إحصائيات المستخدمين</h2>
                            <button 
                                className="btn-primary"
                                onClick={() => navigate('/admin/users')}
                            >
                                عرض جميع المستخدمين
                            </button>
                        </div>
                        
                        <div className="users-stats">
                            <div className="stat-row">
                                <div className="stat-item">
                                    <div className="stat-label">إجمالي المستخدمين</div>
                                    <div className="stat-value">{stats.users?.total || 0}</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-label">نشطون اليوم</div>
                                    <div className="stat-value">{stats.users?.active_today || 0}</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-label">جدد اليوم</div>
                                    <div className="stat-value">{stats.users?.new_today || 0}</div>
                                </div>
                            </div>

                            <div className="user-type-distribution">
                                <h4>توزيع المستخدمين حسب النوع</h4>
                                <div className="distribution-chart">
                                    {Object.entries(stats.users?.by_type || {}).map(([type, count]) => (
                                        <div key={type} className="distribution-item">
                                            <div className="type-label">
                                                {getUserTypeLabel(type)}
                                            </div>
                                            <div className="type-bar">
                                                <div 
                                                    className="bar-fill"
                                                    style={{ 
                                                        width: `${(count / stats.users.total) * 100}%`,
                                                        backgroundColor: getTypeColor(type)
                                                    }}
                                                >
                                                    <span className="count">{count}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'policies' && stats && (
                    <div className="policies-tab">
                        <div className="tab-header">
                            <h2>إحصائيات البوالص</h2>
                        </div>
                        
                        <div className="policies-stats">
                            <div className="stat-row">
                                <div className="stat-item">
                                    <div className="stat-label">إجمالي بوالص التأمين الصحي</div>
                                    <div className="stat-value">{stats.policies?.health?.total || 0}</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-label">بوالص التأمين الصحي النشطة</div>
                                    <div className="stat-value">{stats.policies?.health?.active || 0}</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-label">إيرادات التأمين الصحي</div>
                                    <div className="stat-value">{formatCurrency(stats.policies?.health?.revenue || 0)}</div>
                                </div>
                            </div>

                            <div className="stat-row">
                                <div className="stat-item">
                                    <div className="stat-label">إجمالي بوالص تأمين السيارات</div>
                                    <div className="stat-value">{stats.policies?.car?.total || 0}</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-label">بوالص تأمين السيارات النشطة</div>
                                    <div className="stat-value">{stats.policies?.car?.active || 0}</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-label">إيرادات تأمين السيارات</div>
                                    <div className="stat-value">{formatCurrency(stats.policies?.car?.revenue || 0)}</div>
                                </div>
                            </div>

                            <div className="revenue-comparison">
                                <h4>مقارنة الإيرادات</h4>
                                <div className="comparison-bars">
                                    <div className="comparison-item">
                                        <div className="item-label">التأمين الصحي</div>
                                        <div className="item-bar">
                                            <div 
                                                className="bar-fill health"
                                                style={{ 
                                                    width: `${(stats.policies?.health?.revenue / stats.policies?.total_revenue) * 100 || 0}%` 
                                                }}
                                            >
                                                <span>{formatCurrency(stats.policies?.health?.revenue || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="comparison-item">
                                        <div className="item-label">تأمين السيارات</div>
                                        <div className="item-bar">
                                            <div 
                                                className="bar-fill car"
                                                style={{ 
                                                    width: `${(stats.policies?.car?.revenue / stats.policies?.total_revenue) * 100 || 0}%` 
                                                }}
                                            >
                                                <span>{formatCurrency(stats.policies?.car?.revenue || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'companies' && stats && (
                    <div className="companies-tab">
                        <div className="tab-header">
                            <h2>إحصائيات الشركات</h2>
                        </div>
                        
                        <div className="companies-stats">
                            <div className="stat-item large">
                                <div className="stat-label">إجمالي الشركات المسجلة</div>
                                <div className="stat-value">{stats.companies?.total || 0}</div>
                            </div>

                            <div className="sectors-distribution">
                                <h4>توزيع الشركات حسب القطاع</h4>
                                <div className="sectors-list">
                                    {stats.companies?.by_sector?.slice(0, 10).map((sector, index) => (
                                        <div key={index} className="sector-item">
                                            <div className="sector-name">
                                                {getSectorLabel(sector.sector)}
                                            </div>
                                            <div className="sector-bar">
                                                <div 
                                                    className="bar-fill"
                                                    style={{ 
                                                        width: `${(sector.count / stats.companies.total) * 100}%` 
                                                    }}
                                                >
                                                    <span className="count">{sector.count}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

// دالة للحصول على ألوان لأنواع المستخدمين
const getTypeColor = (type) => {
    const colors = {
        individual: '#3498db',
        organization: '#2ecc71',
        admin: '#e74c3c'
    };
    return colors[type] || '#95a5a6';
};

export default AdminDashboard;