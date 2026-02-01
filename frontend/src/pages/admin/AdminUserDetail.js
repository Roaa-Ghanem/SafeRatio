// src/pages/admin/AdminUserDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const AdminUserDetail = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('info');

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchUserDetails();
    }, [id]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('accessToken');
            
            // التحقق من أن id موجود وصالح
            if (!id || id === 'undefined' || id === 'null') {
                throw new Error('معرف المستخدم غير صالح');
            }
            
            console.log('Fetching user details for ID:', id);
            
            const response = await axios.get(`${API_BASE_URL}/api/admin/users/${id}/`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            console.log('User details response:', response.data);
            
            if (response.data) {
                setUserData(response.data);
            } else {
                throw new Error('لا توجد بيانات');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            
            if (error.response?.status === 404) {
                setError('المستخدم غير موجود');
            } else if (error.response?.status === 403) {
                setError('غير مصرح بالوصول');
            } else if (error.message.includes('غير صالح')) {
                setError('معرف المستخدم غير صالح');
            } else {
                setError('فشل في تحميل بيانات المستخدم: ' + (error.response?.data?.error || error.message));
            }
            
            // بيانات تجريبية للاختبار
            setUserData({
                user: {
                    id: id,
                    username: 'مستخدم تجريبي',
                    email: 'test@example.com',
                    first_name: 'أحمد',
                    last_name: 'محمد',
                    user_type: 'individual',
                    phone: '777123456',
                    country: 'Yemen',
                    language: 'ar',
                    is_active: true,
                    is_staff: false,
                    is_superuser: false,
                    date_joined: new Date().toISOString(),
                    last_login: new Date().toISOString(),
                    profile_completed: true
                },
                profile: {
                    age: 30,
                    gender: 'male',
                    marital_status: 'married',
                    occupation: 'مهندس',
                    date_of_birth: '1994-01-15',
                    driving_license_number: 'ABC123456',
                    national_id: '123456789',
                    sensitive_info_completed: true,
                    sensitive_info_locked: true
                },
                stats: {
                    health_policies_count: 2,
                    car_policies_count: 1,
                    companies_count: 0,
                    vehicles_count: 1,
                    total_premiums: 4500
                },
                recent_items: {
                    health_policies: [
                        {
                            id: 1,
                            policy_number: 'HP-123456',
                            status: 'active',
                            total_premium: 2500,
                            created_at: new Date().toISOString()
                        }
                    ],
                    car_policies: [
                        {
                            id: 1,
                            policy_number: 'CP-789012',
                            status: 'active',
                            total_premium: 2000,
                            created_at: new Date().toISOString()
                        }
                    ],
                    companies: [],
                    vehicles: [
                        {
                            id: 1,
                            make: 'Toyota',
                            model: 'Camry',
                            license_plate: '123ABC',
                            current_value: 50000
                        }
                    ]
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`هل أنت متأكد من حذف المستخدم "${userData?.user?.username}"؟`)) {
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            await axios.delete(`${API_BASE_URL}/api/admin/users/${id}/delete/`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            alert('تم حذف المستخدم بنجاح');
            navigate('/admin/users');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('فشل في حذف المستخدم: ' + (error.response?.data?.error || error.message));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'غير متوفر';
        return new Date(dateString).toLocaleDateString('ar-SA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getUserTypeLabel = (type) => {
        const types = {
            individual: 'فرد',
            organization: 'مؤسسة',
            admin: 'مسؤول'
        };
        return types[type] || type;
    };

    if (loading) {
        return (
            <div className="admin-page-loading" dir="rtl">
                <div className="loading-spinner"></div>
                <p>جاري تحميل بيانات المستخدم...</p>
            </div>
        );
    }

    if (error || !userData) {
        return (
            <div className="admin-page-error" dir="rtl">
                <div className="error-icon">!</div>
                <h3>حدث خطأ</h3>
                <p>{error || 'بيانات المستخدم غير متوفرة'}</p>
                <button onClick={() => navigate('/admin/users')} className="back-btn">
                    العودة للقائمة
                </button>
            </div>
        );
    }

    return (
        <div className="admin-user-detail" dir="rtl">
            <header className="admin-header">
                <div className="header-left">
                    <h1>تفاصيل المستخدم</h1>
                    <button onClick={() => navigate('/admin/users')} className="back-btn">
                        ← العودة للقائمة
                    </button>
                </div>
                <div className="header-right">
                    <div className="action-buttons">
                        <button 
                            className="btn-edit"
                            onClick={() => navigate(`/admin/users/${id}/edit`)}
                        >
                            تعديل
                        </button>
                        <button 
                            className="btn-danger"
                            onClick={handleDelete}
                        >
                            حذف
                        </button>
                    </div>
                </div>
            </header>

            <div className="user-header">
                <div className="user-avatar">
                    <span className="material-symbols-outlined">account_circle</span>
                </div>
                <div className="user-info">
                    <h2>
                        {userData.user?.first_name && userData.user?.last_name 
                            ? `${userData.user.first_name} ${userData.user.last_name}`
                            : userData.user?.username}
                    </h2>
                    <p className="user-email">{userData.user?.email}</p>
                    <div className="user-tags">
                        <span className={`user-type-badge ${userData.user?.user_type}`}>
                            {getUserTypeLabel(userData.user?.user_type)}
                        </span>
                        <span className={`status-badge ${userData.user?.is_active ? 'active' : 'inactive'}`}>
                            {userData.user?.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                        {userData.user?.is_staff && <span className="staff-badge">طاقم</span>}
                        {userData.user?.is_superuser && <span className="superuser-badge">مدير</span>}
                    </div>
                </div>
            </div>

            <div className="detail-tabs">
                <button 
                    className={`detail-tab ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                    المعلومات الأساسية
                </button>
                <button 
                    className={`detail-tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    الملف الشخصي
                </button>
                <button 
                    className={`detail-tab ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    الإحصائيات
                </button>
                <button 
                    className={`detail-tab ${activeTab === 'activity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('activity')}
                >
                    النشاطات
                </button>
            </div>

            <main className="detail-content">
                {activeTab === 'info' && (
                    <div className="info-section">
                        <div className="info-grid">
                            <div className="info-item">
                                <label>اسم المستخدم</label>
                                <div className="info-value">{userData.user?.username}</div>
                            </div>
                            <div className="info-item">
                                <label>البريد الإلكتروني</label>
                                <div className="info-value">{userData.user?.email}</div>
                            </div>
                            <div className="info-item">
                                <label>رقم الهاتف</label>
                                <div className="info-value">{userData.user?.phone || 'غير متوفر'}</div>
                            </div>
                            <div className="info-item">
                                <label>البلد</label>
                                <div className="info-value">{userData.user?.country || 'غير محدد'}</div>
                            </div>
                            <div className="info-item">
                                <label>تاريخ التسجيل</label>
                                <div className="info-value">{formatDate(userData.user?.date_joined)}</div>
                            </div>
                            <div className="info-item">
                                <label>آخر دخول</label>
                                <div className="info-value">{formatDate(userData.user?.last_login)}</div>
                            </div>
                            <div className="info-item">
                                <label>اللغة</label>
                                <div className="info-value">{userData.user?.language === 'ar' ? 'العربية' : 'الإنجليزية'}</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="profile-section">
                        {userData.profile?.error ? (
                            <div className="no-profile">
                                <span className="material-symbols-outlined">warning</span>
                                <p>لا يوجد ملف شخصي لهذا المستخدم</p>
                            </div>
                        ) : (
                            <div className="profile-grid">
                                <div className="profile-item">
                                    <label>العمر</label>
                                    <div className="profile-value">{userData.profile?.age || 'غير محدد'}</div>
                                </div>
                                <div className="profile-item">
                                    <label>الجنس</label>
                                    <div className="profile-value">
                                        {userData.profile?.gender === 'male' ? 'ذكر' : 
                                         userData.profile?.gender === 'female' ? 'أنثى' : 'غير محدد'}
                                    </div>
                                </div>
                                <div className="profile-item">
                                    <label>الحالة الاجتماعية</label>
                                    <div className="profile-value">
                                        {userData.profile?.marital_status === 'single' ? 'أعزب' :
                                         userData.profile?.marital_status === 'married' ? 'متزوج' :
                                         userData.profile?.marital_status === 'divorced' ? 'مطلق' :
                                         userData.profile?.marital_status === 'widowed' ? 'أرمل' : 'غير محدد'}
                                    </div>
                                </div>
                                <div className="profile-item">
                                    <label>المهنة</label>
                                    <div className="profile-value">{userData.profile?.occupation || 'غير محدد'}</div>
                                </div>
                                <div className="profile-item">
                                    <label>تاريخ الميلاد</label>
                                    <div className="profile-value">
                                        {userData.profile?.date_of_birth || 'غير محدد'}
                                    </div>
                                </div>
                                <div className="profile-item">
                                    <label>رقم رخصة القيادة</label>
                                    <div className="profile-value">
                                        {userData.profile?.driving_license_number || 'غير محدد'}
                                    </div>
                                </div>
                                <div className="profile-item">
                                    <label>رقم الهوية</label>
                                    <div className="profile-value">
                                        {userData.profile?.national_id || 'غير محدد'}
                                    </div>
                                </div>
                                <div className="profile-item full">
                                    <label>حالة الملف الشخصي</label>
                                    <div className="profile-value">
                                        {userData.profile?.sensitive_info_completed 
                                            ? 'مكتمل ✓' 
                                            : 'غير مكتمل ✗'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="stats-section">
                        <div className="stats-cards">
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <span className="material-symbols-outlined">health_and_safety</span>
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">بوالص التأمين الصحي</div>
                                    <div className="stat-number">{userData.stats?.health_policies_count || 0}</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <span className="material-symbols-outlined">directions_car</span>
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">بوالص تأمين السيارات</div>
                                    <div className="stat-number">{userData.stats?.car_policies_count || 0}</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <span className="material-symbols-outlined">business</span>
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">الشركات</div>
                                    <div className="stat-number">{userData.stats?.companies_count || 0}</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <span className="material-symbols-outlined">attach_money</span>
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">إجمالي الأقساط</div>
                                    <div className="stat-number">
                                        {userData.stats?.total_premiums?.toLocaleString() || 0} ر.ي
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="activity-section">
                        <h3>آخر النشاطات</h3>
                        
                        {userData.recent_items?.health_policies?.length > 0 && (
                            <div className="activity-group">
                                <h4>بوالص التأمين الصحي</h4>
                                {userData.recent_items.health_policies.map(policy => (
                                    <div key={policy.id} className="activity-item">
                                        <div className="activity-icon">
                                            <span className="material-symbols-outlined">shield</span>
                                        </div>
                                        <div className="activity-details">
                                            <p>بوليصة رقم: {policy.policy_number}</p>
                                            <span className="activity-time">
                                                {formatDate(policy.created_at)}
                                            </span>
                                        </div>
                                        <div className="activity-status">
                                            <span className={`status-badge ${policy.status}`}>
                                                {policy.status === 'active' ? 'نشطة' : 
                                                 policy.status === 'pending' ? 'معلقة' : policy.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {userData.recent_items?.car_policies?.length > 0 && (
                            <div className="activity-group">
                                <h4>بوالص تأمين السيارات</h4>
                                {userData.recent_items.car_policies.map(policy => (
                                    <div key={policy.id} className="activity-item">
                                        <div className="activity-icon">
                                            <span className="material-symbols-outlined">directions_car</span>
                                        </div>
                                        <div className="activity-details">
                                            <p>بوليصة رقم: {policy.policy_number}</p>
                                            <span className="activity-time">
                                                {formatDate(policy.created_at)}
                                            </span>
                                        </div>
                                        <div className="activity-status">
                                            <span className={`status-badge ${policy.status}`}>
                                                {policy.status === 'active' ? 'نشطة' : 
                                                 policy.status === 'pending' ? 'معلقة' : policy.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {Object.values(userData.recent_items || {}).every(arr => arr.length === 0) && (
                            <div className="no-activity">
                                <span className="material-symbols-outlined">history</span>
                                <p>لا توجد نشاطات مسجلة</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminUserDetail;