// src/pages/admin/AdminUserEdit.js - النسخة المصححة
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const AdminUserEdit = () => {
    const { user: currentUser } = useAuth();
    const { action, id } = useParams(); // تغيير من id فقط إلى action و id
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        user_type: 'individual',
        country: 'Yemen',
        language: 'ar',
        is_active: true,
        password: '',
        confirm_password: ''
    });
    const [formErrors, setFormErrors] = useState({});

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
    
    // تحديد وضع العمل بناءً على action و id
    const isEditMode = useMemo(() => {
        console.log('Params analysis:', { action, id, pathname: location.pathname });
        
        // إذا كان المسار يحتوي على "create" فهو إنشاء جديد
        if (location.pathname.includes('/create')) {
            return false;
        }
        
        // إذا كان هناك id (رقم) فهو تعديل
        if (id && !isNaN(parseInt(id)) && parseInt(id) > 0) {
            return true;
        }
        
        // إذا كان action هو "edit" فهو تعديل
        if (action === 'edit' && id) {
            return true;
        }
        
        // بشكل افتراضي، إذا كان هناك أي id فهو تعديل
        return !!id;
    }, [action, id, location.pathname]);

    // تسجيل معلومات التحميل
    useEffect(() => {
        console.log('AdminUserEdit loaded:', { 
            action, 
            id, 
            isEditMode,
            fullPath: location.pathname 
        });
    }, [action, id, isEditMode, location.pathname]);

    const fetchUserData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // تأكد أن لدينا id صالح
            const userId = id;
            if (!userId || userId === 'undefined' || userId === 'null') {
                console.log('No valid user ID for editing');
                setLoading(false);
                return;
            }
            
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('يرجى تسجيل الدخول أولاً');
                setLoading(false);
                return;
            }
            
            console.log('Fetching user data for ID:', userId);
            
            const response = await axios.get(`${API_BASE_URL}/api/admin/users/${userId}/`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('User data response:', response.data);
            
            if (response.data.success && response.data.user) {
                const user = response.data.user;
                setFormData({
                    username: user.username || '',
                    email: user.email || '',
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    phone: user.phone || '',
                    user_type: user.user_type || 'individual',
                    country: user.country || 'Yemen',
                    language: user.language || 'ar',
                    is_active: user.is_active !== undefined ? user.is_active : true,
                    password: '',
                    confirm_password: ''
                });
            } else {
                throw new Error(response.data.error || 'بيانات المستخدم غير كاملة');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            const errorMessage = error.response?.data?.error || error.message || 'فشل في تحميل بيانات المستخدم';
            setError(`خطأ: ${errorMessage}`);
            
            if (error.response?.status === 404) {
                setTimeout(() => {
                    alert('المستخدم غير موجود');
                    navigate('/admin/users');
                }, 1000);
            }
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, id, navigate]);

    useEffect(() => {
        console.log('Fetch effect running:', { isEditMode, id });
        
        if (isEditMode && id) {
            fetchUserData();
        } else {
            setLoading(false);
            // إعادة تعيين النموذج لوضع الإنشاء
            setFormData({
                username: '',
                email: '',
                first_name: '',
                last_name: '',
                phone: '',
                user_type: 'individual',
                country: 'Yemen',
                language: 'ar',
                is_active: true,
                password: '',
                confirm_password: ''
            });
        }
    }, [isEditMode, id, fetchUserData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.username.trim()) {
            errors.username = 'اسم المستخدم مطلوب';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            errors.username = 'اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام فقط';
        }

        if (!formData.email.trim()) {
            errors.email = 'البريد الإلكتروني مطلوب';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'البريد الإلكتروني غير صالح';
        }

        if (!isEditMode && !formData.password) {
            errors.password = 'كلمة المرور مطلوبة';
        } else if (!isEditMode && formData.password.length < 8) {
            errors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
        }

        if (formData.password && formData.password !== formData.confirm_password) {
            errors.confirm_password = 'كلمات المرور غير متطابقة';
        }

        setFormErrors(errors);
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log('Form submission:', { isEditMode, id, formData });
        
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setError('يرجى تصحيح الأخطاء في النموذج');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                setError('يرجى تسجيل الدخول أولاً');
                setSaving(false);
                return;
            }

            const submitData = { ...formData };
            delete submitData.confirm_password;
            
            if (isEditMode && !submitData.password) {
                delete submitData.password;
            }
            
            if (!isEditMode && !submitData.password) {
                setError('كلمة المرور مطلوبة للمستخدم الجديد');
                setSaving(false);
                return;
            }

            // تسجيل البيانات قبل الإرسال
            console.log('Preparing to submit:', { submitData, isEditMode });

            let response;
            if (isEditMode) {
                // تأكد أن لدينا id صالح للتعديل
                if (!id || id === 'undefined') {
                    setError('معرف المستخدم غير صالح');
                    setSaving(false);
                    return;
                }
                
                response = await axios.put(
                    `${API_BASE_URL}/api/admin/users/${id}/update/`,
                    submitData,
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else {
                response = await axios.post(
                    `${API_BASE_URL}/api/admin/users/create/`,
                    submitData,
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            console.log('API Response:', response.data);

            if (response.data.success) {
                alert('تم حفظ المستخدم بنجاح');
                navigate('/admin/users');
            } else {
                // معالجة أخطاء الخادم
                if (response.data.errors) {
                    const fieldErrors = {};
                    Object.entries(response.data.errors).forEach(([key, value]) => {
                        fieldErrors[key] = Array.isArray(value) ? value.join(', ') : value;
                    });
                    setFormErrors(fieldErrors);
                    setError('يرجى تصحيح الأخطاء في النموذج');
                } else {
                    setError(response.data.error || 'حدث خطأ أثناء الحفظ');
                }
            }
        } catch (error) {
            console.error('Submit error:', error);
            
            if (error.response) {
                console.error('Server error details:', error.response.data);
                
                if (error.response.status === 400) {
                    // معالجة أخطاء التحقق من الصحة
                    if (error.response.data.errors) {
                        const fieldErrors = {};
                        Object.entries(error.response.data.errors).forEach(([key, value]) => {
                            fieldErrors[key] = Array.isArray(value) ? value.join(', ') : value;
                        });
                        setFormErrors(fieldErrors);
                        setError('يرجى تصحيح الأخطاء أدناه');
                    } else {
                        setError(error.response.data.error || 'بيانات غير صالحة');
                    }
                } else if (error.response.status === 401) {
                    setError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
                } else {
                    setError(`خطأ في الخادم: ${error.response.status}`);
                }
            } else if (error.request) {
                setError('تعذر الاتصال بالخادم');
            } else {
                setError(error.message || 'حدث خطأ غير متوقع');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('هل تريد إلغاء التغييرات؟')) {
            navigate('/admin/users');
        }
    };

    if (loading) {
        return (
            <div className="admin-page-loading" dir="rtl">
                <div className="loading-spinner"></div>
                <p>جاري تحميل البيانات...</p>
            </div>
        );
    }

    return (
        <div className="admin-user-edit" dir="rtl">
            <header className="admin-header">
                <div className="header-left">
                    <h1>{isEditMode ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h1>
                    <button onClick={() => navigate('/admin/users')} className="back-btn">
                        ← العودة للقائمة
                    </button>
                </div>
            </header>

            <main className="edit-content">
                <form onSubmit={handleSubmit} className="user-form">
                    {error && !Object.keys(formErrors).length && (
                        <div className="form-error">
                            <span className="material-symbols-outlined">error</span>
                            {error}
                        </div>
                    )}

                    <div className="form-section">
                        <h3>المعلومات الأساسية</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="username">اسم المستخدم *</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    disabled={isEditMode}
                                    placeholder="أدخل اسم مستخدم فريد"
                                    className={isEditMode ? 'disabled-field' : ''}
                                />
                                {formErrors.username && (
                                    <div className="field-error">{formErrors.username}</div>
                                )}
                                {isEditMode && (
                                    <small>لا يمكن تغيير اسم المستخدم بعد الإنشاء</small>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">البريد الإلكتروني *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="user@example.com"
                                />
                                {formErrors.email && (
                                    <div className="field-error">{formErrors.email}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="first_name">الاسم الأول</label>
                                <input
                                    type="text"
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="أحمد"
                                />
                                {formErrors.first_name && (
                                    <div className="field-error">{formErrors.first_name}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="last_name">الاسم الأخير</label>
                                <input
                                    type="text"
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="محمد"
                                />
                                {formErrors.last_name && (
                                    <div className="field-error">{formErrors.last_name}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">رقم الهاتف</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="777123456"
                                />
                                {formErrors.phone && (
                                    <div className="field-error">{formErrors.phone}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="user_type">نوع المستخدم *</label>
                                <select
                                    id="user_type"
                                    name="user_type"
                                    value={formData.user_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="individual">فرد</option>
                                    <option value="organization">مؤسسة</option>
                                    <option value="admin">مسؤول</option>
                                </select>
                                {formErrors.user_type && (
                                    <div className="field-error">{formErrors.user_type}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="country">البلد</label>
                                <select
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                >
                                    <option value="Yemen">اليمن</option>
                                    <option value="Saudi Arabia">السعودية</option>
                                    <option value="UAE">الإمارات</option>
                                    <option value="Qatar">قطر</option>
                                    <option value="Oman">عمان</option>
                                    <option value="Kuwait">الكويت</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="language">اللغة</label>
                                <select
                                    id="language"
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                >
                                    <option value="ar">العربية</option>
                                    <option value="en">الإنجليزية</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* قسم كلمة المرور - يظهر فقط في وضع الإنشاء */}
                    {!isEditMode && (
                        <div className="form-section">
                            <h3>كلمة المرور</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="password">كلمة المرور *</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required={!isEditMode}
                                        placeholder="أدخل كلمة مرور قوية"
                                    />
                                    {formErrors.password && (
                                        <div className="field-error">{formErrors.password}</div>
                                    )}
                                    <small>يجب أن تكون 8 أحرف على الأقل</small>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirm_password">تأكيد كلمة المرور *</label>
                                    <input
                                        type="password"
                                        id="confirm_password"
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        required={!isEditMode}
                                        placeholder="أعد إدخال كلمة المرور"
                                    />
                                    {formErrors.confirm_password && (
                                        <div className="field-error">{formErrors.confirm_password}</div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="password-note">
                                <span className="material-symbols-outlined">info</span>
                                <p>سيتم إرسال كلمة المرور للمستخدم عبر البريد الإلكتروني المسجل</p>
                            </div>
                        </div>
                    )}

                    {/* قسم إعدادات الحساب - يظهر فقط في وضع التعديل */}
                    {isEditMode && (
                        <div className="form-section">
                            <h3>إعدادات الحساب</h3>
                            <div className="form-grid">
                                <div className="form-group checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                        />
                                        <span>الحساب نشط</span>
                                    </label>
                                    <small>عند إلغاء التفعيل، لن يتمكن المستخدم من الدخول</small>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="new_password">كلمة مرور جديدة (اختياري)</label>
                                    <input
                                        type="password"
                                        id="new_password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="اتركه فارغاً إذا كنت لا تريد تغيير كلمة المرور"
                                    />
                                    <small>اتركه فارغاً للحفاظ على كلمة المرور الحالية</small>
                                </div>

                                {formData.password && (
                                    <div className="form-group">
                                        <label htmlFor="confirm_new_password">تأكيد كلمة المرور الجديدة</label>
                                        <input
                                            type="password"
                                            id="confirm_new_password"
                                            name="confirm_password"
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                            placeholder="تأكيد كلمة المرور الجديدة"
                                        />
                                        {formErrors.confirm_password && (
                                            <div className="field-error">{formErrors.confirm_password}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn-secondary"
                            disabled={saving}
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="loading-spinner-small"></span>
                                    جاري الحفظ...
                                </>
                            ) : (
                                isEditMode ? 'حفظ التغييرات' : 'إنشاء المستخدم'
                            )}
                        </button>
                    </div>
                </form>
                
                {/* نصائح للمستخدم الجديد */}
                {!isEditMode && (
                    <div className="creation-tips">
                        <h4>💡 نصائح لإضافة مستخدم جديد:</h4>
                        <ul>
                            <li>اسم المستخدم يجب أن يكون فريداً ولا يحتوي على مسافات</li>
                            <li>استخدم بريد إلكتروني صالح لتلقي الإشعارات</li>
                            <li>اختر كلمة مرور قوية لا تقل عن 8 أحرف</li>
                            <li>سيتم إرسال بيانات الدخول للمستخدم عبر البريد الإلكتروني</li>
                        </ul>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminUserEdit;