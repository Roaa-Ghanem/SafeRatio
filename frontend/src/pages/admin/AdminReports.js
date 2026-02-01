// src/pages/admin/AdminReports.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaPeopleArrows } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminReports = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [selectedReport, setSelectedReport] = useState('financial');
    const [dateRange, setDateRange] = useState('month');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const reports = [
        { id: 'financial', name: 'التقرير المالي', icon: 'payments', description: 'تحليل الإيرادات والمصروفات' },
        { id: 'users', name: 'تقرير المستخدمين', icon: 'FaPeopleArrows', description: 'إحصائيات نمو المستخدمين' },
        { id: 'policies', name: 'تقرير البوالص', icon: 'shield', description: 'تحليل البوالص والتحويلات' },
        { id: 'claims', name: 'تقرير المطالبات', icon: 'warning', description: 'تحليل المطالبات ومعدلاتها' },
    ];

    return (
        <div className="admin-reports-page" dir="rtl">
            <header className="admin-header">
                <div className="header-left">
                    <h1>التقارير والإحصائيات</h1>
                    <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
                        العودة للوحة التحكم
                    </button>
                </div>
                <div className="header-right">
                    <div className="date-range-selector">
                        <select 
                            value={dateRange} 
                            onChange={(e) => setDateRange(e.target.value)}
                            className="time-select"
                        >
                            <option value="day">اليوم</option>
                            <option value="week">هذا الأسبوع</option>
                            <option value="month">هذا الشهر</option>
                            <option value="quarter">هذا الربع</option>
                            <option value="year">هذا العام</option>
                        </select>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        تسجيل خروج
                    </button>
                </div>
            </header>

            <main className="admin-main">
                <div className="reports-grid">
                    {reports.map(report => (
                        <div 
                            key={report.id}
                            className={`report-card ${selectedReport === report.id ? 'selected' : ''}`}
                            onClick={() => setSelectedReport(report.id)}
                        >
                            <div className="report-icon">
                                <span className="material-symbols-outlined">{report.icon}</span>
                            </div>
                            <h3>{report.name}</h3>
                            <p>{report.description}</p>
                            <button className="generate-btn">
                                توليد التقرير
                            </button>
                        </div>
                    ))}
                </div>

                <div className="report-preview">
                    <h2>معاينة التقرير</h2>
                    <div className="preview-content">
                        <div className="preview-placeholder">
                            <span className="material-symbols-outlined">summarize</span>
                            <h3>تقرير {reports.find(r => r.id === selectedReport)?.name}</h3>
                            <p>سيظهر هنا ملخص التقرير والرسوم البيانية عند توليده</p>
                            <div className="preview-stats">
                                <div className="stat-box">
                                    <div className="stat-value">1,250</div>
                                    <div className="stat-label">عملية</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-value">$45,000</div>
                                    <div className="stat-label">إجمالي</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-value">+15%</div>
                                    <div className="stat-label">نمو</div>
                                </div>
                            </div>
                            <button className="btn-primary download-btn">
                                <span className="material-symbols-outlined">download</span>
                                تحميل التقرير PDF
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminReports;