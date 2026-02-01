import React, { useState, useRef } from 'react';
import api from '../services/api';
import './HealthInsurance.css';

const HealthInsuranceDashboard = ({ company }) => {
    const [uploading, setUploading] = useState(false);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // التحقق من نوع الملف
        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            setError('الرجاء رفع ملف Excel بصيغة .xlsx أو .xls');
            return;
        }

        setUploading(true);
        setError(null);
        setUploadStatus(null);

        const formData = new FormData();
        formData.append('excel_file', file);

        try {
            const response = await api.post(
                `/api/health-insurance/companies/${company.id}/upload_employees_excel/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setUploadStatus({
                success: true,
                message: response.data.message,
                summary: response.data.analysis_summary,
                recommendations: response.data.recommendations
            });

            // تحديث بيانات الشركة
            if (company.onUpdate) {
                company.onUpdate();
            }

        } catch (error) {
            console.error('Upload error:', error);
            setError(error.response?.data?.error || 'فشل في رفع الملف');
        } finally {
            setUploading(false);
            event.target.value = ''; // مسح حقل الإدخال
        }
    };

    const generateReport = async (format) => {
        if (!company?.id) {
            setError('الرجاء اختيار شركة');
            return;
        }

        setGeneratingReport(true);
        setError(null);

        try {
            const response = await api.get(
                `/api/health-insurance/companies/${company.id}/generate_company_report/`,
                {
                    params: { format },
                    responseType: 'blob'
                }
            );

            // إنشاء رابط للتحميل
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            const extension = format === 'excel' ? 'xlsx' : 'pdf';
            link.setAttribute('download', `تقرير_تأمين_${company.name}.${extension}`);
            
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Report generation error:', error);
            setError('فشل في إنشاء التقرير');
        } finally {
            setGeneratingReport(false);
        }
    };

    const downloadTemplate = () => {
        // بيانات نموذج Excel
        const templateData = [
            ['employee_id', 'full_name', 'age', 'gender', 'department', 'salary', 'email', 'phone', 'marital_status', 'dependents', 'medical_history'],
            ['EMP001', 'أحمد محمد', 30, 'male', 'التسويق', 5000, 'ahmed@company.com', '0551234567', 'married', 2, 'لا يوجد'],
            ['EMP002', 'سارة خالد', 28, 'female', 'المالية', 4500, 'sara@company.com', '0557654321', 'single', 0, 'حساسية'],
            ['EMP003', 'علي حسن', 35, 'male', 'التقنية', 6000, 'ali@company.com', '0559876543', 'married', 3, 'ضغط دم'],
        ];

        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        templateData.forEach(row => {
            csvContent += row.join(',') + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'نموذج_بيانات_الموظفين.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div className="health-insurance-dashboard">
            <div className="dashboard-header">
                <h2>🏢 نظام التأمين الصحي للشركات</h2>
                <p>إدارة تأمين الموظفين وتحليل البيانات الصحية</p>
            </div>

            <div className="dashboard-sections">
                {/* قسم رفع الملفات */}
                <div className="upload-section">
                    <h3>📤 رفع بيانات الموظفين</h3>
                    <div className="upload-card">
                        <div className="upload-icon">📊</div>
                        <p>ارفع ملف Excel يحتوي على بيانات موظفيك</p>
                        
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".xlsx,.xls"
                            style={{ display: 'none' }}
                        />
                        
                        <button
                            className="upload-btn"
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploading}
                        >
                            {uploading ? 'جاري الرفع...' : 'اختر ملف Excel'}
                        </button>
                        
                        <button 
                            className="template-btn"
                            onClick={downloadTemplate}
                        >
                            تحميل النموذج
                        </button>
                        
                        <div className="upload-notes">
                            <h4>ملاحظات هامة:</h4>
                            <ul>
                                <li>يجب أن يحتوي الملف على الأعمدة التالية: employee_id, full_name, age, gender, department, salary</li>
                                <li>يمكنك إضافة أعمدة اختيارية: email, phone, marital_status, dependents, medical_history</li>
                                <li>الحد الأقصى لحجم الملف: 10MB</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* قسم التقارير */}
                <div className="reports-section">
                    <h3>📋 التقارير والتحليلات</h3>
                    <div className="reports-grid">
                        <div className="report-card">
                            <h4>تقرير Excel شامل</h4>
                            <p>تقرير مفصل بجميع بيانات الموظفين والتحليلات</p>
                            <button
                                className="report-btn"
                                onClick={() => generateReport('excel')}
                                disabled={generatingReport || !company?.employee_count}
                            >
                                {generatingReport ? 'جاري الإنشاء...' : 'تحميل Excel'}
                            </button>
                        </div>
                        
                        <div className="report-card">
                            <h4>تقرير PDF مختصر</h4>
                            <p>ملخص التحليلات والتوصيات بتنسيق PDF</p>
                            <button
                                className="report-btn"
                                onClick={() => generateReport('pdf')}
                                disabled={generatingReport || !company?.employee_count}
                            >
                                {generatingReport ? 'جاري الإنشاء...' : 'تحميل PDF'}
                            </button>
                        </div>
                        
                        <div className="report-card">
                            <h4>تحليل المخاطر</h4>
                            <p>تقييم المخاطر الصحية للشركة باستخدام الذكاء الاصطناعي</p>
                            <button
                                className="report-btn"
                                onClick={() => window.open(`/company/${company.id}/risk-analysis/`)}
                                disabled={!company?.employee_count}
                            >
                                عرض التحليل
                            </button>
                        </div>
                    </div>
                </div>

                {/* حالة الرفع */}
                {uploadStatus && (
                    <div className="upload-status success">
                        <h4>✅ تم الرفع بنجاح</h4>
                        <p>{uploadStatus.message}</p>
                        
                        {uploadStatus.summary && (
                            <div className="analysis-summary">
                                <h5>ملخص التحليل:</h5>
                                <p>{uploadStatus.summary}</p>
                            </div>
                        )}
                        
                        {uploadStatus.recommendations && uploadStatus.recommendations.length > 0 && (
                            <div className="recommendations">
                                <h5>التوصيات:</h5>
                                <ul>
                                    {uploadStatus.recommendations.map((rec, index) => (
                                        <li key={index}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthInsuranceDashboard;