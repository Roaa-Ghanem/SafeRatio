// HealthPremiumCalculator.js
import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./HealthPremiumCalculator.css";

function HealthPremiumCalculator({ company, coveragePlans, onCancel, onQuoteCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  
  // حالة النموذج
  const [formData, setFormData] = useState({
    coverage_plan_id: "",
    insured_employees: 1,
    coverage_period: 12,
    notes: ""
  });
  
  // تأثير لملء البيانات تلقائياً عند تغيير الشركة
  useEffect(() => {
    if (company) {
      console.log("🏢 تم تحميل بيانات الشركة في الحاسبة:", company);
      
      // ملء بيانات الشركة تلقائياً
      setFormData(prev => ({
        ...prev,
        insured_employees: company.total_employees || 1,
        // يمكنك إضافة حقول أخرى هنا
      }));
      
      // اختيار أول خطة تأمين افتراضياً
      if (coveragePlans && coveragePlans.length > 0) {
        setFormData(prev => ({
          ...prev,
          coverage_plan_id: coveragePlans[0].id
        }));
      }
    }
  }, [company, coveragePlans]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      console.log("📤 إنشاء اقتباس للشركة:", company?.id, company?.name);
      console.log("📋 بيانات النموذج:", formData);
      
      if (!company) {
        throw new Error("الرجاء اختيار شركة أولاً");
      }
      
      const response = await api.post("api/health/health-insurance-quotes/", {
        company: company.id,
        ...formData
      });
      
      console.log("✅ تم إنشاء الاقتباس:", response.data);
      setResult(response.data);
      
      if (onQuoteCreated) {
        onQuoteCreated(response.data);
      }
      
    } catch (error) {
      console.error("❌ خطأ في إنشاء الاقتباس:", error);
      setError(error.response?.data?.error || error.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="calculator-modal">
      <div className="calculator-content">
        <div className="calculator-header">
          <h2>🧮 حاسبة أقساط التأمين الصحي</h2>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>
        
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}
        
        {/* معلومات الشركة المختارة */}
        {/* {company && (
          <div className="company-info-card" style={{
            background: '#e8f5e9',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #c8e6c9'
          }}>
            <h3 style={{margin: '0 0 10px 0', color: '#2e7d32'}}>
              🏢 {company.name}
            </h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
              <div>
                <strong>القطاع:</strong> {company.sector_display || company.sector}
              </div>
              <div>
                <strong>الموظفين:</strong> {company.total_employees}
              </div>
              <div>
                <strong>المدينة:</strong> {company.city}
              </div>
              <div>
                <strong>عمر الشركة:</strong> {company.establishment_age} سنة
              </div>
            </div>
          </div>
        )} */}
        
        {!company ? (
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <h3>لم تختر شركة</h3>
            <p>الرجاء اختيار شركة من قائمة الشركات أولاً</p>
            <button className="btn-primary" onClick={onCancel}>
              العودة للشركات
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="calculator-form">
            {/* خطط التغطية */}
            <div className="form-group">
              <label htmlFor="coverage_plan_id">خطة التغطية *</label>
              <select
                id="coverage_plan_id"
                name="coverage_plan_id"
                value={formData.coverage_plan_id}
                onChange={handleChange}
                required
                disabled={!coveragePlans || coveragePlans.length === 0}
              >
                <option value="">اختر خطة التغطية</option>
                {coveragePlans && coveragePlans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - {plan.base_price_per_employee} دولار/موظف
                  </option>
                ))}
              </select>
              {(!coveragePlans || coveragePlans.length === 0) && (
                <small style={{color: '#f44336'}}>لا توجد خطط تأمين متاحة</small>
              )}
            </div>
            
            {/* عدد الموظفين المؤمن عليهم */}
            <div className="form-group">
              <label htmlFor="insured_employees">
                عدد الموظفين المؤمن عليهم *
                {company && (
                  <span style={{color: '#666', fontSize: '12px', marginRight: '5px'}}>
                    (العدد الكلي: {company.total_employees})
                  </span>
                )}
              </label>
              <input
                type="number"
                id="insured_employees"
                name="insured_employees"
                value={formData.insured_employees}
                onChange={handleChange}
                required
                min="1"
                max={company?.total_employees || 1000}
              />
            </div>
            
            {/* فترة التغطية */}
            <div className="form-group">
              <label htmlFor="coverage_period">فترة التغطية (شهر) *</label>
              <select
                id="coverage_period"
                name="coverage_period"
                value={formData.coverage_period}
                onChange={handleChange}
                required
              >
                <option value="6">6 أشهر</option>
                <option value="12">12 شهر</option>
                <option value="24">24 شهر</option>
              </select>
            </div>
            
            {/* ملاحظات */}
            <div className="form-group">
              <label htmlFor="notes">ملاحظات إضافية (اختياري)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="أي ملاحظات إضافية..."
              />
            </div>
            
            {/* النتيجة */}
            {result && (
              <div className="result-card" style={{
                background: '#e3f2fd',
                padding: '20px',
                borderRadius: '8px',
                margin: '20px 0',
                border: '1px solid #bbdefb'
              }}>
                <h3 style={{color: '#1976d2', marginTop: 0}}>✅ تم إنشاء الاقتباس</h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                  <div>
                    <strong>رقم الاقتباس:</strong> {result.quote_number}
                  </div>
                  <div>
                    <strong>القسط الإجمالي:</strong> {result.total_premium?.toLocaleString()} دولار
                  </div>
                  <div>
                    <strong>القسط الشهري:</strong> {result.monthly_premium?.toLocaleString()} دولار
                  </div>
                  <div>
                    <strong>الحالة:</strong> {result.status_display || result.status}
                  </div>
                </div>
              </div>
            )}
            
            {/* الأزرار */}
            <div className="calculator-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !formData.coverage_plan_id}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    جاري الحساب...
                  </>
                ) : (
                  "إنشاء اقتباس"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default HealthPremiumCalculator;