// src/pages/admin/AdminSettings.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminSettings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        siteName: 'SafeRatio',
        siteDescription: 'نظام إدارة التأمينات',
        maintenanceMode: false,
        emailNotifications: true,
        smsNotifications: false,
        autoBackup: true,
        backupFrequency: 'daily',
        currency: 'YER',
        language: 'ar',
    });

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleInputChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const saveSettings = () => {
        alert('تم حفظ الإعدادات بنجاح');
        // Here you would normally send to API
    };

    return (
        <div className="admin-settings-page" dir="rtl">
            <header className="admin-header">
                <div className="header-left">
                    <h1>إعدادات النظام</h1>
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
                <div className="settings-tabs">
                    <button 
                        className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        الإعدادات العامة
                    </button>
                    <button 
                        className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        الإشعارات
                    </button>
                    <button 
                        className={`settings-tab ${activeTab === 'backup' ? 'active' : ''}`}
                        onClick={() => setActiveTab('backup')}
                    >
                        النسخ الاحتياطي
                    </button>
                    <button 
                        className={`settings-tab ${activeTab === 'advanced' ? 'active' : ''}`}
                        onClick={() => setActiveTab('advanced')}
                    >
                        إعدادات متقدمة
                    </button>
                </div>

                <div className="settings-content">
                    {activeTab === 'general' && (
                        <div className="settings-section">
                            <h3>الإعدادات العامة</h3>
                            <div className="form-group">
                                <label>اسم الموقع</label>
                                <input 
                                    type="text" 
                                    value={settings.siteName}
                                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>وصف الموقع</label>
                                <textarea 
                                    value={settings.siteDescription}
                                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>العملة</label>
                                <select 
                                    value={settings.currency}
                                    onChange={(e) => handleInputChange('currency', e.target.value)}
                                >
                                    <option value="YER">ريال يمني</option>
                                    <option value="SAR">ريال سعودي</option>
                                    <option value="USD">دولار أمريكي</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>اللغة الافتراضية</label>
                                <select 
                                    value={settings.language}
                                    onChange={(e) => handleInputChange('language', e.target.value)}
                                >
                                    <option value="ar">العربية</option>
                                    <option value="en">الإنجليزية</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <h3>إعدادات الإشعارات</h3>
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={settings.emailNotifications}
                                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                                    />
                                    <span>تفعيل الإشعارات عبر البريد الإلكتروني</span>
                                </label>
                            </div>
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={settings.smsNotifications}
                                        onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                                    />
                                    <span>تفعيل الإشعارات عبر الرسائل النصية</span>
                                </label>
                            </div>
                            <div className="form-group">
                                <label>عنوان البريد الإلكتروني للإشعارات</label>
                                <input type="email" placeholder="notifications@saferatio.com" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'backup' && (
                        <div className="settings-section">
                            <h3>إعدادات النسخ الاحتياطي</h3>
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={settings.autoBackup}
                                        onChange={(e) => handleInputChange('autoBackup', e.target.checked)}
                                    />
                                    <span>النسخ الاحتياطي التلقائي</span>
                                </label>
                            </div>
                            <div className="form-group">
                                <label>تكرار النسخ الاحتياطي</label>
                                <select 
                                    value={settings.backupFrequency}
                                    onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                                >
                                    <option value="hourly">كل ساعة</option>
                                    <option value="daily">يومياً</option>
                                    <option value="weekly">أسبوعياً</option>
                                    <option value="monthly">شهرياً</option>
                                </select>
                            </div>
                            <button className="btn-secondary">
                                <span className="material-symbols-outlined">backup</span>
                                إنشاء نسخة احتياطية يدوياً
                            </button>
                        </div>
                    )}

                    {activeTab === 'advanced' && (
                        <div className="settings-section">
                            <h3>الإعدادات المتقدمة</h3>
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                                    />
                                    <span>وضع الصيانة</span>
                                </label>
                                <p className="help-text">عند تفعيل وضع الصيانة، لن يتمكن المستخدمون من الوصول للموقع</p>
                            </div>
                            <div className="form-group">
                                <label>مفتاح API</label>
                                <input type="password" value="****************" readOnly />
                                <button className="btn-small">توليد مفتاح جديد</button>
                            </div>
                            <div className="danger-zone">
                                <h4>منطقة الخطر</h4>
                                <button className="btn-danger">
                                    <span className="material-symbols-outlined">delete</span>
                                    حذف جميع البيانات
                                </button>
                                <p className="warning-text">تحذير: لا يمكن التراجع عن هذه العملية</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="settings-footer">
                    <button className="btn-secondary" onClick={() => navigate('/admin/dashboard')}>
                        إلغاء
                    </button>
                    <button className="btn-primary" onClick={saveSettings}>
                        حفظ التغييرات
                    </button>
                </div>
            </main>
        </div>
    );
};

export default AdminSettings;