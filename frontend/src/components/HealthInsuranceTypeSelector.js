// HealthInsuranceTypeSelector.js
import React, { useState } from "react";
import "./HealthInsuranceTypeSelector.css";

function HealthInsuranceTypeSelector({ onSelect, selectedType, onDownloadPDF }) {
  const [showComparison, setShowComparison] = useState(false);

  // تعريف الأنواع الثلاثة بناءً على وثائق CAC
  const insuranceTypes = [
    {
      id: 'A',
      name: 'التغطية الشاملة (A)',
      description: 'للموظفين وعائلاتهم - أعلى مستوى',
      icon: '🏥',
      color: '#2e7d32',
      features: [
        'الموظفون + العائلة الكاملة',
        'نسبة تحمل داخلية: 10% فقط',
        'حد سنوي داخلي: $10,000',
        'حد سنوي خارجي: $2,000',
        'يشمل العلاج في مصر والأردن والهند',
        'نقل الجثة: $2,500',
        'نظارات طبية: $50 سنوي'
      ],
      requirements: [
        'يشمل جميع أفراد العائلة من البداية',
        'عدد الأبناء ≥ عدد الموظفين',
        'عدد الوالدين ≥ 50% من الموظفين',
        'لا قيود عمرية (0-65 سنة)'
      ],
      coInsurance: {
        inpatient: '10%',
        outpatient: '15%',
        emergency: '80%',
        selective: '0%'
      },
      priceRange: 'مرتفع'
    },
    {
      id: 'B',
      name: 'تغطية الموظفين فقط (B)',
      description: 'للموظفين فقط - اقتصادي',
      icon: '👨‍💼',
      color: '#1565c0',
      features: [
        'الموظفون فقط (لا عائلة)',
        'نسبة تحمل داخلية: 20%',
        'حد سنوي داخلي: $8,000',
        'حد سنوي خارجي: $1,500',
        'علاج الأسنان: $80 سنوي',
        'نظارات طبية: $30 سنوي',
        'الحد العمري: 18-65 سنة'
      ],
      requirements: [
        'الموظفون فقط (لا تشمل العائلة)',
        'الحد العمري: 18-65 سنة',
        'لا شروط للعائلة'
      ],
      coInsurance: {
        inpatient: '20%',
        outpatient: '25%',
        emergency: '70%',
        selective: '50%'
      },
      priceRange: 'اقتصادي'
    },
    {
      id: 'C',
      name: 'التغطية الأساسية (C)',
      description: 'للموظفين وعائلاتهم - متوازن',
      icon: '🏢',
      color: '#f57c00',
      features: [
        'الموظفون + العائلة الأساسية',
        'نسبة تحمل داخلية: 15%',
        'حد سنوي داخلي: $6,000',
        'حد سنوي خارجي: $1,000',
        'علاج الأسنان: $50 سنوي',
        'نقل الجثة: $1,000',
        'الأدوية المزمنة: $30/شهر'
      ],
      requirements: [
        'يشمل العائلة الأساسية',
        'عدد الأبناء ≥ عدد الموظفين',
        'عدد الوالدين ≥ 50% من الموظفين',
        'لا قيود عمرية (0-65 سنة)'
      ],
      coInsurance: {
        inpatient: '15%',
        outpatient: '25%',
        emergency: '50%',
        selective: '0%'
      },
      priceRange: 'متوسط'
    }
  ];

  const handleTypeSelect = (typeId) => {
    if (onSelect) {
      onSelect(typeId);
    }
  };

  return (
    <div className="insurance-type-selector">
      <div className="selector-header">
        <h2>📋 اختر نوع التأمين المناسب</h2>
        <p className="subtitle">
          اختر أحد الأنواع الثلاثة بناءً على احتياجات مؤسستك
        </p>
        
        <div className="header-actions">
          <button 
            className="btn-compare"
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? 'إخفاء المقارنة' : 'عرض المقارنة التفصيلية'}
          </button>
          <button 
            className="btn-pdf"
            onClick={onDownloadPDF}
          >
            📥 تحميل دليل الاختيار (PDF)
          </button>
        </div>
      </div>

      {/* جدول المقارنة السريع */}
      {showComparison && (
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>المعيار</th>
                <th>النوع A (شامل)</th>
                <th>النوع B (اقتصادي)</th>
                <th>النوع C (أساسي)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>المشمولين</td>
                <td>موظفون + عائلة</td>
                <td>موظفون فقط</td>
                <td>موظفون + عائلة</td>
              </tr>
              <tr>
                <td>نسبة التحمل (داخل)</td>
                <td>10%</td>
                <td>20%</td>
                <td>15%</td>
              </tr>
              <tr>
                <td>الحد السنوي الداخلي</td>
                <td>$10,000</td>
                <td>$8,000</td>
                <td>$6,000</td>
              </tr>
              <tr>
                <td>الحد السنوي الخارجي</td>
                <td>$2,000</td>
                <td>$1,500</td>
                <td>$1,000</td>
              </tr>
              <tr>
                <td>الحد العمري</td>
                <td>0-65 سنة</td>
                <td>18-65 سنة</td>
                <td>0-65 سنة</td>
              </tr>
              <tr>
                <td>التكلفة المتوقعة</td>
                <td>$$$$</td>
                <td>$$</td>
                <td>$$$</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* بطاقات اختيار النوع */}
      <div className="type-cards-container">
        {insuranceTypes.map((type) => (
          <div 
            key={type.id}
            className={`type-card ${selectedType === type.id ? 'selected' : ''}`}
            onClick={() => handleTypeSelect(type.id)}
            style={{ borderColor: type.color }}
          >
            <div className="card-header" style={{ backgroundColor: `${type.color}15` }}>
              <span className="card-icon">{type.icon}</span>
              <h3 style={{ color: type.color }}>{type.name}</h3>
              <span className="price-badge" style={{ backgroundColor: type.color }}>
                {type.priceRange}
              </span>
            </div>

            <div className="card-body">
              <p className="card-description">{type.description}</p>
              
              <div className="features-section">
                <h4>✅ المميزات الرئيسية:</h4>
                <ul>
                  {type.features.slice(0, 4).map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="coinsurance-section">
                <h4>💰 نسب التحمل:</h4>
                <div className="coinsurance-grid">
                  <div className="coinsurance-item">
                    <span className="label">داخل المستشفى:</span>
                    <span className="value">{type.coInsurance.inpatient}</span>
                  </div>
                  <div className="coinsurance-item">
                    <span className="label">خارج المستشفى:</span>
                    <span className="value">{type.coInsurance.outpatient}</span>
                  </div>
                </div>
              </div>

              <div className="requirements-section">
                <h4>📋 الشروط الإلزامية:</h4>
                <ul>
                  {type.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card-footer">
              <button 
                className={`select-btn ${selectedType === type.id ? 'selected' : ''}`}
                style={{ 
                  backgroundColor: selectedType === type.id ? type.color : '#fff',
                  color: selectedType === type.id ? '#fff' : type.color,
                  borderColor: type.color
                }}
              >
                {selectedType === type.id ? '✓ محدَد' : 'اختيار هذا النوع'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* توجيهات الاختيار */}
      <div className="selection-guidance">
        <h3>🎯 كيف تختار النوع المناسب؟</h3>
        <div className="guidance-cards">
          <div className="guidance-card">
            <h4>اختر النوع A إذا:</h4>
            <ul>
              <li>تريد تغطية شاملة للموظفين وعائلاتهم</li>
              <li>ميزانيتك تسمح بأعلى مستوى تغطية</li>
              <li>لديك موظفون يسافرون للعلاج</li>
              <li>تريد أقل نسب تحمل</li>
            </ul>
          </div>
          <div className="guidance-card">
            <h4>اختر النوع B إذا:</h4>
            <ul>
              <li>ميزانيتك محدودة</li>
              <li>تريد تغطية الموظفين فقط</li>
              <li>جميع موظفيك بين 18-65 سنة</li>
              <li>لا تريد شروط عائلية معقدة</li>
            </ul>
          </div>
          <div className="guidance-card">
            <h4>اختر النوع C إذا:</h4>
            <ul>
              <li>تريد توازن بين التكلفة والتغطية</li>
              <li>تريد تغطية عائلية أساسية</li>
              <li>تريد نسب تحمل متوسطة</li>
              <li>ميزانيتك متوسطة</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthInsuranceTypeSelector;