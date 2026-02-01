import React, { useEffect, useState, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import authService from '../services/authService';
import api from '../services/api';
import './Profile.css';

export default function Profile() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: '',
    language: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const navigate = useNavigate();
  const { user, refreshUser, updateUserAvatar } = useAuth();
  const fileInputRef = useRef(null);

  // دالة لتحميل البيانات
  const loadProfileData = async () => {
    try {
      setLoading(true);
      // const response = await authService.getProfile();
      const response = await api.get('/api/auth/profile/');
      
      // تأكد من أن البيانات موجودة
      if (response.data) {
        const userData = response.data.user || response.data;
        
        // تعبئة النموذج بالبيانات
        setForm({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          country: userData.country || '',
          language: userData.language || 'ar'
        });
        
        // تحديث صورة البروفايل
        if (userData.avatar_url || userData.avatar) {
          const avatarUrl = userData.avatar_url || userData.avatar;
          setAvatarPreview(avatarUrl);
          updateUserAvatar(avatarUrl);
        }
        
        setIsDataLoaded(true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('فشل في تحميل بيانات الملف الشخصي');
      
      // حاول استخدام البيانات من context إذا فشل الطلب
      if (user) {
        setForm({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          country: user.country || '',
          language: user.language || 'ar'
        });
        
        if (user.avatar_url) {
          setAvatarPreview(user.avatar_url);
        }
        setIsDataLoaded(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
    
    // إضافة listener لحدث تحديث المستخدم
    const handleUserUpdate = () => {
      if (!isDataLoaded) {
        loadProfileData();
      }
    };
    
    window.addEventListener('userUpdated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // مسح خطأ الحقل عند التعديل
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!form.first_name?.trim()) {
      errors.first_name = 'الاسم الأول مطلوب';
    }
    
    if (!form.last_name?.trim()) {
      errors.last_name = 'اسم العائلة مطلوب';
    }
    
    if (!form.email?.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'بريد إلكتروني غير صالح';
    }
    
    return errors;
  };

    const handleOpenCamera = () => {
    // افتح الكاميرا
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          // معالجة التقاط الصورة من الكاميرا
          // (سيحتاج تنفيذ إضافي)
          console.log('Camera opened successfully');
          // هنا يمكنك إضافة كود لالتقاط صورة من الكاميرا
        })
        .catch(err => {
          console.error('Camera error:', err);
          alert('تعذر فتح الكاميرا');
        });
    } else {
      alert('الكاميرا غير مدعومة في هذا المتصفح');
    }
    setAvatarMenuOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من صحة النموذج
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('يرجى تصحيح الأخطاء أدناه');
      return;
    }
    
    setSaving(true);
    setError(null);
    setFieldErrors({});
    
    try {
      console.log('Saving profile data:', form);
      
      // حاول تحديث الملف الشخصي
      let response;
      try {
        // response = await authService.updateProfile(form);
        response = await api.put('/api/auth/profile/', form);
        console.log('Update response:', response.data);
      } catch (updateError) {
        console.error('Update error:', updateError);
        
        // إذا كان الخطأ 405 (Method Not Allowed)، جرب POST
        if (updateError.response?.status === 405) {
          const token = localStorage.getItem('token');
          const axios = (await import('axios')).default;
          const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
          
          response = await axios.post(
            `${API_URL}/api/auth/profile/update/`,
            form,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
        } else {
          throw updateError;
        }
      }
      
      // استخراج بيانات المستخدم من الاستجابة
      const updatedUserData = response.data.user || response.data;
      
      if (!updatedUserData) {
        throw new Error('لم يتم استلام بيانات المستخدم');
      }
      
      // تحديث context
      refreshUser(updatedUserData);
      
      // تحديث localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const mergedUser = {
        ...storedUser,
        ...updatedUserData,
        // تأكد من وجود الحقول الأساسية
        first_name: updatedUserData.first_name || form.first_name,
        last_name: updatedUserData.last_name || form.last_name,
        email: updatedUserData.email || form.email,
        phone: updatedUserData.phone || form.phone,
        country: updatedUserData.country || form.country,
        language: updatedUserData.language || form.language
      };
      
      localStorage.setItem('user', JSON.stringify(mergedUser));
      
      // تحديث حالة النموذج بالبيانات الجديدة
      setForm({
        first_name: mergedUser.first_name || '',
        last_name: mergedUser.last_name || '',
        email: mergedUser.email || '',
        phone: mergedUser.phone || '',
        country: mergedUser.country || '',
        language: mergedUser.language || 'ar'
      });
      
      // إرسال حدث لتحديث المكونات الأخرى
      window.dispatchEvent(new Event('userUpdated'));
      
      // عرض رسالة نجاح
      alert('تم تحديث الملف الشخصي بنجاح!');
      
      // الانتقال للصفحة الرئيسية بعد ثانيتين
      setTimeout(() => {
        navigate('/vehicles-insurance');
      }, 2000);
      
    } catch (err) {
      console.error('Save error details:', err);
      
      const data = err.response?.data;
      if (data) {
        if (typeof data === 'object') {
          // معالجة الأخطاء من الخادم
          const serverErrors = {};
          Object.keys(data).forEach(key => {
            if (Array.isArray(data[key])) {
              serverErrors[key] = data[key].join(', ');
            } else {
              serverErrors[key] = data[key];
            }
          });
          setFieldErrors(serverErrors);
          setError('يرجى تصحيح الأخطاء أدناه');
        } else if (typeof data === 'string') {
          setError(data);
        } else {
          setError('حدث خطأ أثناء حفظ البيانات');
        }
      } else {
        setError('فشل في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFieldErrors({ ...fieldErrors, avatar: 'الرجاء رفع صورة بصيغة JPG, PNG أو GIF' });
      e.target.value = '';
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors({ ...fieldErrors, avatar: 'حجم الصورة يجب أن يكون أقل من 5MB' });
      e.target.value = '';
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    setFieldErrors({ ...fieldErrors, avatar: null });
    
    try {
      let processedFile = file;
      if (file.size > 1 * 1024 * 1024) {
        processedFile = await resizeImage(file, 512);
      }
      
      const formData = new FormData();
      formData.append('avatar', processedFile);
      
      // const response = await authService.uploadAvatar(formData);
      const response = await api.post('/api/auth/upload-avatar/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const data = response.data;
      
      // تحديث حالة المستخدم
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { 
        ...stored, 
        avatar_url: data.avatar_url || data.avatar 
      };
      
      refreshUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      
      if (data.avatar_url || data.avatar) {
        const timestamp = new Date().getTime();
        const newAvatarUrl = `${data.avatar_url || data.avatar}?t=${timestamp}`;
        setAvatarPreview(newAvatarUrl);
        updateUserAvatar(newAvatarUrl);
      }
      
      // إرسال حدث تحديث
      window.dispatchEvent(new Event('userUpdated'));
      
      alert('تم تحديث الصورة الشخصية بنجاح!');
      
    } catch (err) {
      console.error('Avatar upload error:', err);
      const errorMessage = err?.response?.data?.error || 
                          err?.response?.data?.detail || 
                          'فشل في رفع الصورة';
      setFieldErrors({ ...fieldErrors, avatar: errorMessage });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  // دالة إعادة تعيين البيانات
  const resetForm = () => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
        language: user.language || 'ar'
      });
      
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      }
    }
  };

  // دالة للتحقق مما إذا تم تغيير البيانات
  const isFormChanged = () => {
    if (!user) return false;
    
    return (
      form.first_name !== (user.first_name || '') ||
      form.last_name !== (user.last_name || '') ||
      form.email !== (user.email || '') ||
      form.phone !== (user.phone || '') ||
      form.country !== (user.country || '') ||
      form.language !== (user.language || 'ar')
    );
  };

  if (loading && !isDataLoaded) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>جاري تحميل بيانات الملف الشخصي...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← الرجوع
        </button>
        <h2>الملف الشخصي</h2>
        
        {isFormChanged() && (
          <button 
            className="reset-button"
            onClick={resetForm}
            type="button"
          >
            إلغاء التغييرات
          </button>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button 
            className="retry-button"
            onClick={loadProfileData}
            style={{ marginRight: 'auto', marginLeft: '10px' }}
          >
            إعادة المحاولة
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="profile-form">
        {/* قسم الصورة الشخصية */}
        <div className="form-group avatar-section-improved">
          <label>صورة الملف الشخصي</label>
          <div className="avatar-container">
            <div className="avatar-wrapper" onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}>
              <img
                src={avatarPreview || user?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp&s=200'}
                alt="الصورة الشخصية"
                className="avatar-image-large"
                onError={(e) => {
                  e.target.src = 'https://www.gravatar.com/avatar/?d=mp&s=200';
                }}
              />
              
              <div className="avatar-edit-overlay">
                <span className="edit-icon">✏️</span>
                <span className="edit-text">تعديل الصورة</span>
              </div>
              
              {uploading && (
                <div className="uploading-overlay">
                  <div className="spinner"></div>
                  <span>جاري الرفع...</span>
                </div>
              )}
            </div>
            
            {avatarMenuOpen && (
              <div className="avatar-menu">
                <button 
                  className="menu-item camera-item"
                  onClick={handleOpenCamera}
                  type="button"
                >
                  <span className="menu-icon">📷</span>
                  <span className="menu-text">فتح الكاميرا</span>
                </button>
                
                <button 
                  type="button"
                  className="menu-item gallery-item"
                  onClick={() => {
                    fileInputRef.current.click();
                    setAvatarMenuOpen(false);
                  }}
                >
                  <span className="menu-icon">🖼️</span>
                  <span className="menu-text">اختيار صورة</span>
                </button>
                
                {avatarPreview && (
                  <button 
                    type="button"
                    className="menu-item delete-item"
                    onClick={() => {
                      setAvatarPreview(null);
                      updateUserAvatar(null);
                      setAvatarMenuOpen(false);
                    }}
                  >
                    <span className="menu-icon">🗑️</span>
                    <span className="menu-text">حذف الصورة</span>
                  </button>
                )}
                
                <button 
                  type="button"
                  className="menu-item cancel-item"
                  onClick={() => setAvatarMenuOpen(false)}
                >
                  إلغاء
                </button>
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          
          {fieldErrors.avatar && (
            <div className="field-error">{fieldErrors.avatar}</div>
          )}
        </div>

        {/* حقول البيانات */}
        <div className="form-section">
          <h3>المعلومات الأساسية</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>الاسم الأول *</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
                disabled={saving}
              />
              {fieldErrors.first_name && (
                <div className="field-error">{fieldErrors.first_name}</div>
              )}
            </div>
            
            <div className="form-group">
              <label>اسم العائلة *</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
                disabled={saving}
              />
              {fieldErrors.last_name && (
                <div className="field-error">{fieldErrors.last_name}</div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label>البريد الإلكتروني *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={saving}
            />
            {fieldErrors.email && (
              <div className="field-error">{fieldErrors.email}</div>
            )}
          </div>
          
          <div className="form-group">
            <label>رقم الهاتف</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+966 5X XXX XXXX"
              disabled={saving}
            />
            {fieldErrors.phone && (
              <div className="field-error">{fieldErrors.phone}</div>
            )}
          </div>
        </div>
        
        <div className="form-section">
          <h3>التفضيلات</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>البلد</label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="">اختر البلد</option>
                <option value="السعودية">السعودية</option>
                <option value="اليمن">اليمن</option>
                <option value="الإمارات">الإمارات</option>
                <option value="الكويت">الكويت</option>
                <option value="قطر">قطر</option>
                <option value="عمان">عمان</option>
                <option value="البحرين">البحرين</option>
              </select>
              {fieldErrors.country && (
                <div className="field-error">{fieldErrors.country}</div>
              )}
            </div>
            
            <div className="form-group">
              <label>اللغة</label>
              <select
                name="language"
                value={form.language}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="ar">العربية</option>
                <option value="en">الإنجليزية</option>
              </select>
              {fieldErrors.language && (
                <div className="field-error">{fieldErrors.language}</div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/dashboard')}
            disabled={saving}
          >
            رجوع
          </button>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={saving || uploading || !isFormChanged()}
          >
            {saving ? (
              <>
                <span className="spinner-small"></span>
                جاري الحفظ...
              </>
            ) : 'حفظ التغييرات'}
          </button>
        </div>
      </form>
    </div>
  );
}

// دالة resizeImage
const resizeImage = (file, maxSize = 512) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      if (width <= maxSize && height <= maxSize) {
        URL.revokeObjectURL(url);
        resolve(file);
        return;
      }
      const scale = Math.min(maxSize / width, maxSize / height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) resolve(new File([blob], file.name, { type: 'image/webp' }));
        else reject(new Error('Image resize failed'));
      }, 'image/webp', 0.85);
    };
    img.onerror = (e) => { 
      URL.revokeObjectURL(url); 
      reject(e); 
    };
    img.src = url;
  });
};