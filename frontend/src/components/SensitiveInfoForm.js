import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import './SensitiveInfoForm.css';

const SensitiveInfoForm = ({ onComplete, userData }) => {
    const [formData, setFormData] = useState({
        date_of_birth: '',
        driving_license_number: '',
        driving_license_issue_date: '',
        national_id: '',
        gender: ''
    });
    const [loading, setLoading] = useState(false);
    const [sensitiveInfoStatus, setSensitiveInfoStatus] = useState({
        completed: false,
        locked: false
    });

    useEffect(() => {
        checkSensitiveInfo();
    }, []);

    const checkSensitiveInfo = async () => {
        try {
            const response = await api.get('users/sensitive-info/');
            setSensitiveInfoStatus({
                completed: response.data.sensitive_info_completed,
                locked: response.data.sensitive_info_locked
            });
        } catch (error) {
            console.error('Error checking sensitive info:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // تحذير للمستخدم
        const confirmed = window.confirm(
            '⚠️ تحذير مهم!\n\n' +
            'المعلومات التالية لا يمكن تعديلها بعد الحفظ:\n' +
            '- تاريخ الميلاد\n' +
            '- رقم رخصة القيادة\n' +
            '- رقم الهوية الوطنية\n\n' +
            'هل أنت متأكد من صحة المعلومات؟'
        );
        
        if (!confirmed) {
            toast.warning('تم إلغاء العملية. يرجى التحقق من المعلومات قبل الحفظ.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('users/sensitive-info/', formData);
            
            toast.success(response.data.message);
            toast.warning(response.data.warning);
            
            setSensitiveInfoStatus({
                completed: true,
                locked: true
            });
            
            if (onComplete) {
                onComplete(response.data.profile);
            }
        } catch (error) {
            console.error('Error saving sensitive info:', error);
            if (error.response?.data) {
                // عرض الأخطاء
                Object.values(error.response.data).forEach(errorMsg => {
                    if (Array.isArray(errorMsg)) {
                        errorMsg.forEach(msg => toast.error(msg));
                    } else {
                        toast.error(errorMsg);
                    }
                });
            } else {
                toast.error('فشل في حفظ المعلومات الحساسة');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (sensitiveInfoStatus.locked) {
        return (
            <div className="sensitive-info-locked">
                <div className="locked-card">
                    <div className="lock-icon">🔒</div>
                    <h3>المعلومات الحساسة مقفلة</h3>
                    <p>لا يمكن تعديل تاريخ الميلاد ورقم رخصة القيادة بعد الإدخال الأول.</p>
                    <small>للتعديل، يرجى الاتصال بدعم العملاء.</small>
                </div>
            </div>
        );
    }

    return (
        <div className="sensitive-info-form">
            <div className="form-header">
                <h3>المعلومات الحساسة (إدخال أول)</h3>
                <div className="warning-alert">
                    <strong>⚠️ تنبيه:</strong> هذه المعلومات لا يمكن تعديلها بعد الحفظ
                </div>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>تاريخ الميلاد *</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            required
                            max={new Date().toISOString().split('T')[0]}
                        />
                        <small>يجب أن يكون عمرك 18 سنة على الأقل</small>
                    </div>
                    
                    <div className="form-group">
                        <label>رقم رخصة القيادة *</label>
                        <input
                            type="text"
                            name="driving_license_number"
                            value={formData.driving_license_number}
                            onChange={handleChange}
                            required
                            placeholder="مثال: 123456789"
                            minLength="5"
                        />
                        <small>5 أحرف على الأقل</small>
                    </div>
                    
                    <div className="form-group">
                        <label>تاريخ إصدار الرخصة</label>
                        <input
                            type="date"
                            name="driving_license_issue_date"
                            value={formData.driving_license_issue_date}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>رقم الهوية الوطنية</label>
                        <input
                            type="text"
                            name="national_id"
                            value={formData.national_id}
                            onChange={handleChange}
                            placeholder="مثال: 1234567890"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>الجنس</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="">اختر الجنس</option>
                            <option value="male">ذكر</option>
                            <option value="female">أنثى</option>
                        </select>
                    </div>
                </div>
                
                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="btn-warning"
                        disabled={loading}
                    >
                        {loading ? 'جاري الحفظ...' : 'حفظ المعلومات الحساسة'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SensitiveInfoForm;