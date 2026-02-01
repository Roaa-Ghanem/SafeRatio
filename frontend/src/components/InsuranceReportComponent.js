// InsuranceReportComponent.js
import React, { useState } from 'react';
import api from '../services/api';
import './InsuranceReport.css';

const InsuranceReportComponent = ({ quote }) => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('preview');

    const generateReport = async (format = 'html') => {
        if (!quote?.id) {
            setError('الرجاء اختيار اقتباس');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.get(
                `/api/car-insurance/quotes/${quote.id}/generate_detailed_report/`,
                { params: { format } }
            );

            if (format === 'pdf') {
                // معالجة تحميل PDF
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `تقرير_تأمين_${quote.quote_number}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } else {
                setReportData(response.data);
                setActiveTab('report');
            }

        } catch (error) {
            console.error('Report generation error:', error);
            setError('فشل في إنشاء التقرير');
        } finally {
            setLoading(false);
        }
    };

    const compareQuotes = async (quoteIds) => {
        setLoading(true);
        try {
            const response = await api.get('/api/car-insurance/quotes/compare_quotes/', {
                params: { quote_ids: quoteIds.join(',') }
            });
            setReportData(response.data);
            setActiveTab('comparison');
        } catch (error) {
            setError('فشل في مقارنة الاقتباسات');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="insurance-report-container">
            <div className="report-header">
                <h2>📊 تقارير تأمين ذكية</h2>
                <p>احصل على تحليل مفصل باستخدام الذكاء الاصطناعي</p>
            </div>

            <div className="report-actions">
                <div className="action-buttons">
                    <button
                        className="btn-primary"
                        onClick={() => generateReport('html')}
                        disabled={loading || !quote}
                    >
                        {loading ? 'جاري الإنشاء...' : 'عرض التقرير التفاعلي'}
                    </button>
                    
                    <button
                        className="btn-secondary"
                        onClick={() => generateReport('pdf')}
                        disabled={loading || !quote}
                    >
                        تحميل PDF
                    </button>
                    
                    <button
                        className="btn-success"
                        onClick={() => generateReport('json')}
                        disabled={loading || !quote}
                    >
                        بيانات JSON
                    </button>
                </div>

                {quote && (
                    <div className="quote-summary">
                        <h4>الاقتباس المحدد:</h4>
                        <p><strong>رقم الاقتباس:</strong> {quote.quote_number}</p>
                        <p><strong>المركبة:</strong> {quote.vehicle?.make} {quote.vehicle?.model}</p>
                        <p><strong>القسط:</strong> ${quote.final_premium}</p>
                        <p><strong>نوع التغطية:</strong> {quote.coverage_type_display}</p>
                    </div>
                )}
            </div>

            {/* التبويبات */}
            <div className="report-tabs">
                <button
                    className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preview')}
                >
                    معاينة
                </button>
                <button
                    className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
                    onClick={() => setActiveTab('report')}
                    disabled={!reportData}
                >
                    التقرير الكامل
                </button>
                <button
                    className={`tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
                    onClick={() => setActiveTab('comparison')}
                >
                    مقارنة
                </button>
            </div>

            {/* محتوى التبويبات */}
            <div className="tab-content">
                {activeTab === 'preview' && (
                    <div className="preview-section">
                        <h3>ماذا سيحتوي تقريرك؟</h3>
                        <div className="preview-features">
                            <div className="feature">
                                <div className="feature-icon">🔍</div>
                                <h4>تحليل المخاطر</h4>
                                <p>تقييم دقيق لمستوى الخطر بناءً على بيانات سيارتك</p>
                            </div>
                            <div className="feature">
                                <div className="feature-icon">💡</div>
                                <h4>توصيات ذكية</h4>
                                <p>نصائح مخصصة من الذكاء الاصطناعي لتخفيض الأقساط</p>
                            </div>
                            <div className="feature">
                                <div className="feature-icon">📈</div>
                                <h4>مقارنة السوق</h4>
                                <p>مقارنة أقساطك مع متوسطات السوق</p>
                            </div>
                            <div className="feature">
                                <div className="feature-icon">🛡️</div>
                                <h4>تحسين التغطية</h4>
                                <p>اقتراحات لتحسين وثيقتك التأمينية</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'report' && reportData && (
                    <div className="report-section">
                        <div className="report-meta">
                            <span className="report-id">رقم التقرير: {reportData.report_id}</span>
                            <span className="report-date">تاريخ الإنشاء: {reportData.generated_at}</span>
                        </div>
                        
                        <div className="report-content">
                            {reportData.report_html ? (
                                <div 
                                    className="gemini-report"
                                    dangerouslySetInnerHTML={{ __html: reportData.report_html }}
                                />
                            ) : (
                                <div className="markdown-report">
                                    <pre>{reportData.report_markdown}</pre>
                                </div>
                            )}
                        </div>

                        <div className="premium-breakdown">
                            <h4>تفصيل القسط</h4>
                            {reportData.premium_breakdown && (
                                <table className="breakdown-table">
                                    <thead>
                                        <tr>
                                            <th>البند</th>
                                            <th>القيمة</th>
                                            <th>التفسير</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>القسط الأساسي</td>
                                            <td>${reportData.premium_breakdown.base_premium}</td>
                                            <td>بناءً على قيمة المركبة</td>
                                        </tr>
                                        <tr>
                                            <td>عامل الخطر</td>
                                            <td>{reportData.premium_breakdown.risk_multiplier}x</td>
                                            <td>{reportData.premium_breakdown.risk_level}</td>
                                        </tr>
                                        <tr>
                                            <td>خصم عدم المطالبات</td>
                                            <td>{reportData.premium_breakdown.no_claim_discount_percent}%</td>
                                            <td>{quote?.no_claims_years} سنوات</td>
                                        </tr>
                                        <tr className="total-row">
                                            <td>القسط النهائي</td>
                                            <td>${reportData.premium_breakdown.final_premium}</td>
                                            <td>بعد تطبيق جميع العوامل</td>
                                        </tr>
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'comparison' && (
                    <div className="comparison-section">
                        <h3>مقارنة الاقتباسات</h3>
                        <p>اختر عدة اقتباسات للمقارنة:</p>
                        {/* هنا يمكنك إضافة قائمة من الاقتباسات للمقارنة */}
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>جاري إنشاء التقرير باستخدام الذكاء الاصطناعي...</p>
                </div>
            )}
        </div>
    );
};

export default InsuranceReportComponent;