import React, { useState } from 'react';
import api from '../services/api';
import './InsuranceReports.css';

const CarInsuranceReport = ({ vehicle }) => {
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);

    const generateReport = async () => {
        if (!vehicle?.id) {
            setError('الرجاء اختيار مركبة');
            return;
        }

        setGenerating(true);
        setError(null);

        try {
            const response = await api.get(
                `/api/car-insurance/vehicles/${vehicle.id}/generate_comprehensive_report/`,
                { responseType: 'blob' } // مهم لتحميل الملف
            );

            // إنشاء رابط للتحميل
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `تقرير_تأمين_${vehicle.make}_${vehicle.model}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error generating report:', error);
            setError('فشل في إنشاء التقرير. يرجى المحاولة مرة أخرى');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="report-section">
            <div className="report-header">
                <h3>📊 تقرير تأمين شامل</h3>
                <p>احصل على تحليل كامل لتأمين سيارتك مع توصيات مخصصة</p>
            </div>

            <div className="report-features">
                <div className="feature-card">
                    <div className="feature-icon">📈</div>
                    <h4>تحليل المخاطر</h4>
                    <p>تقييم مستوى الخطر بناءً على بيانات سيارتك</p>
                </div>
                
                <div className="feature-card">
                    <div className="feature-icon">💡</div>
                    <h4>توصيات ذكية</h4>
                    <p>نصائح مخصصة لتخفيض أقساط التأمين</p>
                </div>
                
                <div className="feature-card">
                    <div className="feature-icon">📋</div>
                    <h4>مقارنة شاملة</h4>
                    <p>مقارنة بين جميع خطط التأمين المتاحة</p>
                </div>
            </div>

            <button 
                className="generate-report-btn"
                onClick={generateReport}
                disabled={generating || !vehicle}
            >
                {generating ? (
                    <>
                        <span className="spinner"></span>
                        جاري إنشاء التقرير...
                    </>
                ) : 'إنشاء تقرير PDF'}
            </button>

            {error && <div className="error-message">{error}</div>}

            <div className="report-preview">
                <h4>محتوى التقرير:</h4>
                <ul>
                    <li>✅ معلومات السيارة الأساسية</li>
                    <li>✅ تحليل المخاطر والتقييم</li>
                    <li>✅ مقارنة خطط التأمين</li>
                    <li>✅ توصيات لتخفيض الأقساط</li>
                    <li>✅ نصائح السلامة المرورية</li>
                    <li>✅ تحليل تاريخ المطالبات</li>
                </ul>
            </div>
        </div>
    );
};

export default CarInsuranceReport;