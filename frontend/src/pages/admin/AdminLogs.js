// src/pages/admin/AdminLogs.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminLogs = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [logType, setLogType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Mock log data
    const logs = [
        { id: 1, type: 'user', message: 'مستخدم جديد مسجل: أحمد محمد', timestamp: '2024-03-20 10:30:15', severity: 'info' },
        { id: 2, type: 'policy', message: 'تم إنشاء بوليصة جديدة #POL-123456', timestamp: '2024-03-20 09:15:22', severity: 'info' },
        { id: 3, type: 'payment', message: 'دفع قسط تأمين بقيمة $500', timestamp: '2024-03-20 08:45:10', severity: 'success' },
        { id: 4, type: 'error', message: 'خطأ في الاتصال بقاعدة البيانات', timestamp: '2024-03-19 23:10:05', severity: 'error' },
        { id: 5, type: 'security', message: 'محاولة دخول فاشلة لحساب admin', timestamp: '2024-03-19 22:30:45', severity: 'warning' },
        { id: 6, type: 'system', message: 'تم تشغيل النسخ الاحتياطي التلقائي', timestamp: '2024-03-19 03:00:00', severity: 'info' },
        { id: 7, type: 'user', message: 'تم تحديث ملف تعريف المستخدم: سارة علي', timestamp: '2024-03-18 16:20:30', severity: 'info' },
        { id: 8, type: 'policy', message: 'بوليصة #POL-123450 منتهية', timestamp: '2024-03-18 14:15:00', severity: 'warning' },
    ];

    const filteredLogs = logs.filter(log => {
        const matchesType = logType === 'all' || log.type === logType;
        const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    const getSeverityColor = (severity) => {
        const colors = {
            info: '#3498db',
            success: '#2ecc71',
            warning: '#f39c12',
            error: '#e74c3c',
            security: '#9b59b6'
        };
        return colors[severity] || '#95a5a6';
    };

    const getLogTypeLabel = (type) => {
        const labels = {
            user: 'مستخدم',
            policy: 'بوليصة',
            payment: 'دفع',
            error: 'خطأ',
            security: 'أمان',
            system: 'نظام'
        };
        return labels[type] || type;
    };

    return (
        <div className="admin-logs-page" dir="rtl">
            <header className="admin-header">
                <div className="header-left">
                    <h1>سجلات النظام</h1>
                    <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
                        العودة للوحة التحكم
                    </button>
                </div>
                <div className="header-right">
                    <button onClick={handleLogout} className="logout-btn">
                        تسجيل خروج
                    </button>
                </div>
            </header>

            <main className="admin-main">
                <div className="logs-controls">
                    <div className="controls-left">
                        <div className="filter-buttons">
                            <button 
                                className={`filter-btn ${logType === 'all' ? 'active' : ''}`}
                                onClick={() => setLogType('all')}
                            >
                                الكل
                            </button>
                            <button 
                                className={`filter-btn ${logType === 'user' ? 'active' : ''}`}
                                onClick={() => setLogType('user')}
                            >
                                المستخدمين
                            </button>
                            <button 
                                className={`filter-btn ${logType === 'policy' ? 'active' : ''}`}
                                onClick={() => setLogType('policy')}
                            >
                                البوالص
                            </button>
                            <button 
                                className={`filter-btn ${logType === 'security' ? 'active' : ''}`}
                                onClick={() => setLogType('security')}
                            >
                                الأمان
                            </button>
                            <button 
                                className={`filter-btn ${logType === 'error' ? 'active' : ''}`}
                                onClick={() => setLogType('error')}
                            >
                                الأخطاء
                            </button>
                        </div>
                    </div>
                    <div className="controls-right">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="بحث في السجلات..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <span className="material-symbols-outlined search-icon">search</span>
                        </div>
                        <button className="btn-secondary">
                            <span className="material-symbols-outlined">download</span>
                            تصدير السجلات
                        </button>
                        <button className="btn-danger">
                            <span className="material-symbols-outlined">delete</span>
                            مسح السجلات
                        </button>
                    </div>
                </div>

                <div className="logs-table-container">
                    <table className="logs-table">
                        <thead>
                            <tr>
                                <th>التسلسل</th>
                                <th>النوع</th>
                                <th>الرسالة</th>
                                <th>المستوى</th>
                                <th>الوقت والتاريخ</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <tr key={log.id} className={`log-row ${log.severity}`}>
                                    <td>{log.id}</td>
                                    <td>
                                        <span className="log-type">
                                            {getLogTypeLabel(log.type)}
                                        </span>
                                    </td>
                                    <td>{log.message}</td>
                                    <td>
                                        <span 
                                            className="severity-badge"
                                            style={{ backgroundColor: getSeverityColor(log.severity) }}
                                        >
                                            {log.severity}
                                        </span>
                                    </td>
                                    <td>{log.timestamp}</td>
                                    <td>
                                        <button className="btn-view">تفاصيل</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredLogs.length === 0 && (
                    <div className="empty-state">
                        <span className="material-symbols-outlined empty-icon">history</span>
                        <h3>لا توجد سجلات</h3>
                        <p>لم يتم العثور على سجلات مطابقة للبحث</p>
                    </div>
                )}

                <div className="logs-stats">
                    <div className="stat-card">
                        <div className="stat-value">{logs.length}</div>
                        <div className="stat-label">إجمالي السجلات</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{logs.filter(l => l.severity === 'error').length}</div>
                        <div className="stat-label">أخطاء</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{logs.filter(l => l.severity === 'warning').length}</div>
                        <div className="stat-label">تحذيرات</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{logs.filter(l => l.type === 'security').length}</div>
                        <div className="stat-label">أحداث أمنية</div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLogs;