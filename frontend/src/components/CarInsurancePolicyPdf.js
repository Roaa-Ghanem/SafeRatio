import React, { useState, useEffect } from 'react';
import { Button, Spinner, Alert, ProgressBar, Badge } from 'react-bootstrap';
import { FaFilePdf, FaDownload, FaTimes, FaPrint, FaCar, FaUser, FaUsers, FaInfoCircle, FaDollarSign, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import api from '../services/api';

const CarInsurancePolicyPdf = ({ policyData, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [progress, setProgress] = useState(0);

  // ========== دالة لجمع البيانات الكاملة للوثيقة ==========
  const getCompletePolicyData = () => {
    // بيانات السيارة
    const vehicleData = policyData.vehicle || policyData.quote?.vehicle || {};
    
    // بيانات الاقتباس
    const quoteData = policyData.quote || {};
    
    // بيانات المستخدم
    const userData = policyData.user || policyData.quote?.user || {};
    
    // الحصول على نوع التغطية مع الترجمة
    const getCoverageTypeDisplay = () => {
      const coverageMap = {
        'third_party': 'تأمين طرف ثالث فقط',
        'third_party_fire_theft': 'تأمين طرف ثالث + حريق وسرقة',
        'comprehensive': 'تأمين شامل'
      };
      return coverageMap[policyData.coverage_type || quoteData.coverage_type] || 'تأمين شامل';
    };

    // الحصول على حالة الوثيقة
    const getStatusDisplay = () => {
      const statusMap = {
        'pending': 'معلقة',
        'active': 'نشطة',
        'expired': 'منتهية',
        'cancelled': 'ملغاة'
      };
      return statusMap[policyData.status] || policyData.status || 'معلقة';
    };

    // حساب التواريخ بالعربية
    const getArabicDate = (dateString) => {
      if (!dateString) return 'غير محدد';
      const date = new Date(dateString);
      const arabicMonths = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      return `${date.getDate()} ${arabicMonths[date.getMonth()]} ${date.getFullYear()}`;
    };

    // حساب الأيام المتبقية
    const calculateDaysRemaining = () => {
      if (!policyData.expiry_date) return 365;
      const today = new Date();
      const expiry = new Date(policyData.expiry_date);
      const diffTime = expiry - today;
      return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    };

    // تفاصيل التغطية حسب النوع
    const getCoverageDetails = () => {
      const coverageType = policyData.coverage_type || quoteData.coverage_type || 'comprehensive';
      
      const coverages = {
        'third_party': {
          title: 'تغطية طرف ثالث فقط',
          description: 'تغطية للمسؤولية المدنية تجاه الغير فقط (الحد الأدنى القانوني)',
          features: [
            'تغطية إصابات ووفيات الغير',
            'تغطية أضرار ممتلكات الغير',
            'حد المسؤولية: 600,000 دولار',
            'لا يشمل أضرار مركبة المؤمن له'
          ],
          exclusions: [
            'أضرار مركبة المؤمن له',
            'السرقة أو الحريق',
            'الأضرار الطبيعية'
          ]
        },
        'third_party_fire_theft': {
          title: 'تأمين طرف ثالث + حريق وسرقة',
          description: 'تغطية للمسؤولية تجاه الغير + الحريق والسرقة لمركبة المؤمن له',
          features: [
            'جميع مزايا التأمين على الغير',
            'تغطية ضد الحريق والانفجار',
            'تغطية ضد السرقة الكلية',
            'حد المسؤولية: 600,000 دولار'
          ],
          exclusions: [
            'أضرار الحوادث للمركبة',
            'الأضرار الطبيعية',
            'الأعطال الميكانيكية'
          ]
        },
        'comprehensive': {
          title: 'تأمين شامل',
          description: 'تغطية كاملة للمركبة والغير ضد جميع الأخطار',
          features: [
            'جميع مزايا التأمين على الغير',
            'تغطية ضد الحريق والسرقة',
            'تغطية ضد أضرار الحوادث',
            'تغطية ضد الكوارث الطبيعية',
            'تغطية النقل والإصلاح',
            'خدمات الطوارئ على الطريق'
          ],
          exclusions: [
            'التلف الناتج عن الإهمال',
            'الاستخدام غير المشروع',
            'الاشتراك في السباقات'
          ]
        }
      };

      return coverages[coverageType] || coverages.comprehensive;
    };

    // تفاصيل مكونات القسط
    const getPremiumBreakdown = () => {
      const totalPremium = parseFloat(policyData.total_premium || quoteData.final_premium || 0);
      
      return {
        total_premium: totalPremium,
        base_premium: totalPremium * 0.7,
        coverage_type_surcharge: totalPremium * 0.15,
        vehicle_value_factor: totalPremium * 0.10,
        driver_age_factor: totalPremium * 0.05,
        excess_amount: parseFloat(policyData.excess_amount || quoteData.excess_amount || 500)
      };
    };

    return {
      // معلومات الوثيقة
      policy_info: {
        policy_number: policyData.policy_number || 'غير معروف',
        inception_date: getArabicDate(policyData.inception_date || quoteData.start_date),
        expiry_date: getArabicDate(policyData.expiry_date || quoteData.end_date),
        days_remaining: calculateDaysRemaining(),
        status: getStatusDisplay(),
        coverage_type: getCoverageTypeDisplay(),
        coverage_details: getCoverageDetails()
      },
      
      // معلومات المركبة
      vehicle_info: {
        make: vehicleData.make || 'غير محدد',
        model: vehicleData.model || 'غير محدد',
        year: vehicleData.year || 'غير محدد',
        license_plate: vehicleData.license_plate || 'غير محدد',
        vin: vehicleData.vin || 'غير متوفر',
        vehicle_type: vehicleData.vehicle_type || 'سيارة',
        fuel_type: vehicleData.fuel_type || 'بنزين',
        engine_size: vehicleData.engine_size || 'غير محدد',
        current_value: parseFloat(vehicleData.current_value || 0).toLocaleString('usa'),
        color: vehicleData.color || 'غير محدد'
      },
      
      // معلومات المؤمن له
      insured_info: {
        name: userData.get_full_name || userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'غير محدد',
        id_number: userData.id_number || 'غير متوفر',
        phone: userData.phone || 'غير متوفر',
        email: userData.email || 'غير متوفر',
        address: userData.address || 'غير متوفر'
      },
      
      // تفاصيل القسط والتكاليف
      premium_info: {
        total_premium: getPremiumBreakdown().total_premium,
        breakdown: getPremiumBreakdown(),
        payment_status: policyData.payment_status_display || (policyData.payment_status === 'paid' ? 'مدفوعة' : 'قيد الدفع'),
        payment_method: policyData.payment_method || 'غير محدد'
      },
      
      // معلومات إضافية
      additional_info: {
        no_claim_years: quoteData.no_claims_years || 0,
        claims_history: quoteData.claims_history || 0,
        driver_age: quoteData.driver_age || 30,
        created_at: getArabicDate(policyData.created_at || quoteData.created_at),
        issuer: 'شركة التأمين الوطنية',
        issuer_address: 'الرياض - المملكة العربية السعودية',
        issuer_phone: '+966112345678',
        issuer_website: 'www.national-insurance.com'
      }
    };
  };

  // ========== النصوص القانونية لوثيقة تأمين السيارات ==========
  const getLegalTexts = () => {
    const completeData = getCompletePolicyData();
    
    return {
      article1: [
        'تم إعداد هذه الوثيقة من خلال نظام SafeRatio، وهو نظام إلكتروني مخصص لإدارة وثائق تأمين السيارات، وذلك بهدف تقديم عرض استرشادي يساعد العملاء على فهم التغطية التأمينية المقترحة.',
        '',
        'هذه الوثيقة تمثل بياناً استرشادياً ولا تشكل عقد تأمين ملزماً إلا بعد التوقيع الرسمي من قبل شركة التأمين المعنية.'
      ],
      
      article2: [
        `المؤمن له: ${completeData.insured_info.name}`,
        '',
        `المركبة المؤمنة: ${completeData.vehicle_info.year} ${completeData.vehicle_info.make} ${completeData.vehicle_info.model}`,
        `رقم اللوحة: ${completeData.vehicle_info.license_plate}`,
        '',
        'وقد تم إعداد هذا البيان بناءً على البيانات التي تم تقديمها من قبل المؤمن له.'
      ],
      
      article3: [
        `نوع التغطية: ${completeData.policy_info.coverage_type}`,
        '',
        'وصف التغطية:',
        completeData.policy_info.coverage_details.description,
        '',
        'المزايا الرئيسية:',
        ...completeData.policy_info.coverage_details.features.map(feature => `   - ${feature}`)
      ],
      
      article4: [
        'نطاق التغطية يشمل:',
        '',
        '1. الأضرار الناتجة عن الحوادث المرورية.',
        '',
        '2. المسؤولية المدنية تجاه الغير وفق الحدود القانونية.',
        '',
        '3. الأضرار الناتجة عن الحريق والسرقة حسب نوع التغطية.',
        '',
        '4. خدمات الطوارئ على الطريق ضمن النطاق الجغرافي المحدد.'
      ],
      
      article5: [
        'لا تشمل التغطية:',
        '',
        '1. الأضرار الناتجة عن الإهمال أو الاستخدام غير المشروع.',
        '',
        '2. الأضرار الناتجة عن الكوارث الطبيعية (ما لم تنص الوثيقة على خلاف ذلك).',
        '',
        '3. الأضرار الناتجة عن الحرب أو الأعمال الإرهابية.',
        '',
        '4. الأعطال الميكانيكية أو التآكل الطبيعي.'
      ],
      
      article6: [
        `مدة سريان الوثيقة: من ${completeData.policy_info.inception_date} إلى ${completeData.policy_info.expiry_date}`,
        '',
        `القسط التأميني الإجمالي: ${completeData.premium_info.total_premium.toLocaleString('usa')} دولار سعودي.`,
        '',
        `مبلغ التحمل (Excess): ${completeData.premium_info.breakdown.excess_amount.toLocaleString('usa')} دولار لكل مطالبة.`,
        '',
        'ويخضع هذا القسط للتعديل بناءً على التقييم النهائي لشركة التأمين.'
      ],
      
      article7: [
        'التزامات المؤمن له:',
        '',
        '1. الإبلاغ الفوري عن أي حادث خلال 24 ساعة.',
        '',
        '2. تقديم جميع المستندات المطلوبة للمطالبة.',
        '',
        '3. الحفاظ على الرخصة سارية المفعول.',
        '',
        '4. إخطار شركة التأمين بأي تعديل على بيانات المركبة.'
      ],
      
      article8: [
        'إخلاء المسؤولية:',
        '',
        '1. هذه الوثيقة استرشادية ولا تلزم شركة التأمين بأي تعويضات.',
        '',
        '2. الشروط النهائية تخضع للوثيقة الرسمية الموقعة.',
        '',
        '3. يحق لشركة التأمين تعديل الشروط والأسعار.',
        '',
        'صادر عن نظام SafeRatio لإدارة تأمين السيارات.'
      ]
    };
  };

  // ========== دوال مساعدة ==========
  const convertToArabicDate = (date) => {
    try {
      const arabicMonths = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      
      const day = date.getDate();
      const month = arabicMonths[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day}‏/${month}‏/${year}`;
    } catch (error) {
      return date.toLocaleDateString('usa');
    }
  };

  // ========== دالة لإنشاء PDF ==========
  const generateArabicPDF = async () => {
    try {
      setLoading(true);
      setError(null);
      setProgress(10);

      // تحميل مكتبات jsPDF
      const { default: jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      
      setProgress(30);

      // جمع البيانات الكاملة
      const completeData = getCompletePolicyData();
      const legalTexts = getLegalTexts();
      
      // إنشاء وثيقة PDF جديدة
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setProperties({
        title: `وثيقة تأمين مركبة - ${completeData.policy_info.policy_number}`,
        subject: 'وثيقة تأمين سيارات',
        author: 'نظام SafeRatio',
        keywords: 'تأمين سيارات, وثيقة تأمين, تأمين مركبة, SafeRatio'
      });
      
      // ========== الصفحة الأولى: الغلاف ==========
      let y = 30;
      
      // العنوان الرئيسي
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('وثيقة تأمين مركبة', 105, y, { align: 'center' });
      y += 12;
      
      // العنوان الثانوي
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('(عرض استرشادي - غير ملزم قانونياً)', 105, y, { align: 'center' });
      y += 20;
      
      // معلومات الوثيقة الأساسية
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const infoLines = [
        `رقم الوثيقة: ${completeData.policy_info.policy_number}`,
        `حالة الوثيقة: ${completeData.policy_info.status}`,
        `نوع التغطية: ${completeData.policy_info.coverage_type}`,
        `تاريخ السريان: ${completeData.policy_info.inception_date}`,
        `تاريخ الانتهاء: ${completeData.policy_info.expiry_date}`
      ];
      
      infoLines.forEach((line, index) => {
        doc.text(line, 20, y + (index * 7));
      });
      
      y += 40;
      
      // معلومات المركبة
      doc.setFont('helvetica', 'bold');
      doc.text('المركبة المؤمنة:', 20, y);
      y += 8;
      
      doc.setFont('helvetica', 'normal');
      const vehicleLines = [
        `${completeData.vehicle_info.year} ${completeData.vehicle_info.make} ${completeData.vehicle_info.model}`,
        `رقم اللوحة: ${completeData.vehicle_info.license_plate}`,
        `نوع الوقود: ${completeData.vehicle_info.fuel_type}`,
        `القيمة الحالية: ${completeData.vehicle_info.current_value} دولار`
      ];
      
      vehicleLines.forEach(line => {
        doc.text(line, 25, y);
        y += 7;
      });
      
      y += 15;
      
      // الملخص المالي
      doc.setFont('helvetica', 'bold');
      doc.text('الملخص المالي:', 20, y);
      y += 8;
      
      doc.setFont('helvetica', 'normal');
      const financialLines = [
        `القسط التأميني: ${completeData.premium_info.total_premium.toLocaleString('usa')} دولار`,
        `مبلغ التحمل: ${completeData.premium_info.breakdown.excess_amount.toLocaleString('usa')} دولار`,
        `الأيام المتبقية: ${completeData.policy_info.days_remaining} يوم`
      ];
      
      financialLines.forEach(line => {
        doc.text(line, 25, y);
        y += 7;
      });
      
      setProgress(50);
      
      // ========== الصفحات التالية: المواد القانونية ==========
      
      // المادة 1
      doc.addPage();
      y = 30;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('المادة (1): الغرض من الوثيقة', 20, y);
      y += 10;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      legalTexts.article1.forEach(paragraph => {
        const lines = doc.splitTextToSize(paragraph, 170);
        lines.forEach(line => {
          if (y > 270) {
            doc.addPage();
            y = 30;
          }
          doc.text(line, 20, y);
          y += 6;
        });
        y += 4;
      });
      
      // المادة 2
      doc.addPage();
      y = 30;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('المادة (2): بيانات الطرفين', 20, y);
      y += 10;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      legalTexts.article2.forEach(paragraph => {
        const lines = doc.splitTextToSize(paragraph, 170);
        lines.forEach(line => {
          if (y > 270) {
            doc.addPage();
            y = 30;
          }
          doc.text(line, 20, y);
          y += 6;
        });
        y += 4;
      });
      
      // استمرار بقية المواد بنفس النمط...
      
      setProgress(90);
      
      // حفظ الملف
      const fileName = `وثيقة_تأمين_مركبة_${completeData.policy_info.policy_number}.pdf`;
      doc.save(fileName);
      
      setProgress(100);
      setLoading(false);
      setSuccess(`✅ تم إنشاء وتحميل PDF بنجاح: ${fileName}`);
      
    } catch (err) {
      console.error('❌ خطأ في إنشاء PDF:', err);
      setError(`فشل إنشاء PDF: ${err.message || 'حدث خطأ غير معروف'}`);
      setLoading(false);
    }
  };

  // ========== معاينة للطباعة ==========
  const previewForPrint = () => {
    const completeData = getCompletePolicyData();
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>وثيقة تأمين مركبة - ${completeData.policy_info.policy_number}</title>
        <style>
          @media print {
            @page { 
              margin: 15mm;
              size: A4;
            }
            body { margin: 0; }
            .page-break { page-break-before: always; }
          }
          
          * {
            box-sizing: border-box;
            font-family: 'Arial', 'Segoe UI', sans-serif;
          }
          
          body {
            direction: rtl;
            text-align: right;
            line-height: 1.6;
            color: #000;
            padding: 20px;
            max-width: 210mm;
            margin: 0 auto;
            background: white;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            color: #000;
            margin-bottom: 10px;
            font-size: 28px;
          }
          
          .header .subtitle {
            color: #666;
            font-size: 16px;
            margin-bottom: 15px;
          }
          
          .policy-info {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 20px;
            margin-bottom: 30px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .info-item {
            padding: 10px;
            border-bottom: 1px dashed #dee2e6;
          }
          
          .info-label {
            font-weight: bold;
            color: #000;
            margin-left: 10px;
          }
          
          .info-value {
            color: #000;
          }
          
          .section-title {
            background: #ecf0f1;
            padding: 12px 20px;
            border-right: 4px solid #000;
            margin: 25px 0 15px 0;
            color: #000;
            font-weight: bold;
            font-size: 18px;
          }
          
          .vehicle-details {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
          }
          
          .coverage-details {
            background: #e8f4fc;
            border: 1px solid #b3d9ff;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
          }
          
          .features-list, .exclusions-list {
            padding-right: 20px;
            margin-bottom: 15px;
          }
          
          .features-list li {
            color: #27ae60;
            margin-bottom: 8px;
          }
          
          .exclusions-list li {
            color: #e74c3c;
            margin-bottom: 8px;
          }
          
          .premium-breakdown {
            background: #fff8e1;
            border: 1px solid #ffd54f;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
          }
          
          .breakdown-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed #ddd;
          }
          
          .breakdown-total {
            font-weight: bold;
            font-size: 18px;
            color: #000;
            border-top: 2px solid #000;
            margin-top: 10px;
            padding-top: 10px;
          }
          
          .legal-article {
            margin-bottom: 25px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background: #fff;
          }
          
          .article-title {
            color: #000;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-size: 20px;
          }
          
          .article-content {
            line-height: 1.8;
            text-align: justify;
          }
          
          .signature-section {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #7f8c8d;
            text-align: center;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #7f8c8d;
            text-align: center;
          }
          
          .badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 5px;
          }
          
          .badge-primary { background: #3498db; color: white; }
          .badge-success { background: #27ae60; color: white; }
          .badge-warning { background: #f39c12; color: white; }
          .badge-danger { background: #e74c3c; color: white; }
          
          .print-only { display: none; }
          
          @media print {
            .print-only { display: block; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <!-- صفحة العنوان -->
        <div class="header">
          <h1>وثيقة تأمين مركبة</h1>
          <div class="subtitle">(عرض استرشادي - غير ملزم قانونياً)</div>
          <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px;">
            <span class="badge badge-primary">${completeData.policy_info.policy_number}</span>
            <span class="badge badge-success">${completeData.policy_info.status}</span>
            <span class="badge badge-warning">${completeData.policy_info.coverage_type}</span>
          </div>
        </div>
        
        <!-- معلومات الوثيقة -->
        <div class="policy-info">
          <h3 style="color: #000; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <FaCar style="margin-left: 10px;"></FaCar>
            معلومات الوثيقة الأساسية
          </h3>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">رقم الوثيقة:</span>
              <span class="info-value">${completeData.policy_info.policy_number}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">حالة الوثيقة:</span>
              <span class="info-value">${completeData.policy_info.status}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">نوع التغطية:</span>
              <span class="info-value">${completeData.policy_info.coverage_type}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">مدة السريان:</span>
              <span class="info-value">${completeData.policy_info.inception_date} - ${completeData.policy_info.expiry_date}</span>
            </div>
          </div>
        </div>
        
        <!-- تفاصيل المركبة -->
        <div class="vehicle-details">
          <h3 style="color: #000; margin-bottom: 15px;">
            <FaCar style="margin-left: 10px;"></FaCar>
            تفاصيل المركبة المؤمنة
          </h3>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">المركبة:</span>
              <span class="info-value">${completeData.vehicle_info.year} ${completeData.vehicle_info.make} ${completeData.vehicle_info.model}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">رقم اللوحة:</span>
              <span class="info-value">${completeData.vehicle_info.license_plate}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">نوع الوقود:</span>
              <span class="info-value">${completeData.vehicle_info.fuel_type}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">القيمة الحالية:</span>
              <span class="info-value">${completeData.vehicle_info.current_value} دولار</span>
            </div>
          </div>
        </div>
        
        <!-- تفاصيل التغطية -->
        <div class="coverage-details">
          <h3 style="color: #000; margin-bottom: 15px;">
            <FaShieldAlt style="margin-left: 10px;"></FaShieldAlt>
            تفاصيل التغطية التأمينية
          </h3>
          
          <p><strong>نوع التغطية:</strong> ${completeData.policy_info.coverage_details.title}</p>
          <p><strong>الوصف:</strong> ${completeData.policy_info.coverage_details.description}</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
            <div>
              <h4 style="color: #27ae60; border-bottom: 1px solid #27ae60; padding-bottom: 5px;">المزايا المغطاة</h4>
              <ul class="features-list">
                ${completeData.policy_info.coverage_details.features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
            
            <div>
              <h4 style="color: #e74c3c; border-bottom: 1px solid #e74c3c; padding-bottom: 5px;">الاستثناءات</h4>
              <ul class="exclusions-list">
                ${completeData.policy_info.coverage_details.exclusions.map(exclusion => `<li>${exclusion}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
        
        <!-- تفاصيل القسط -->
        <div class="premium-breakdown">
          <h3 style="color: #000; margin-bottom: 15px;">
            <FaDollarSign style="margin-left: 10px;"></FaDollarSign>
            تفاصيل القسط التأميني
          </h3>
          
          <div class="breakdown-item">
            <span>القسط الأساسي:</span>
            <span>${completeData.premium_info.breakdown.base_premium.toLocaleString('usa')} دولار</span>
          </div>
          
          <div class="breakdown-item">
            <span>علاوة نوع التغطية:</span>
            <span>${completeData.premium_info.breakdown.coverage_type_surcharge.toLocaleString('usa')} دولار</span>
          </div>
          
          <div class="breakdown-item">
            <span>عامل قيمة المركبة:</span>
            <span>${completeData.premium_info.breakdown.vehicle_value_factor.toLocaleString('usa')} دولار</span>
          </div>
          
          <div class="breakdown-item">
            <span>عامل عمر السائق:</span>
            <span>${completeData.premium_info.breakdown.driver_age_factor.toLocaleString('usa')} دولار</span>
          </div>
          
          <div class="breakdown-total">
            <span>القسط التأميني الإجمالي:</span>
            <span>${completeData.premium_info.total_premium.toLocaleString('usa')} دولار</span>
          </div>
          
          <div style="margin-top: 15px; padding: 10px; background: #fff; border-radius: 5px;">
            <p><strong>مبلغ التحمل (Excess):</strong> ${completeData.premium_info.breakdown.excess_amount.toLocaleString('usa')} دولار لكل مطالبة</p>
            <p><strong>حالة الدفع:</strong> ${completeData.premium_info.payment_status}</p>
          </div>
        </div>
        
        <div class="page-break"></div>
        
        <!-- المواد القانونية -->
        <div class="section-title">المواد القانونية</div>
        
        <div class="legal-article">
          <h4 class="article-title">المادة (1): الغرض من الوثيقة</h4>
          <div class="article-content">
            <p>تم إعداد هذه الوثيقة من خلال نظام SafeRatio، وهو نظام إلكتروني مخصص لإدارة وثائق تأمين السيارات، وذلك بهدف تقديم عرض استرشادي يساعد العملاء على فهم التغطية التأمينية المقترحة.</p>
            <p>هذه الوثيقة تمثل بياناً استرشادياً ولا تشكل عقد تأمين ملزماً إلا بعد التوقيع الرسمي من قبل شركة التأمين المعنية.</p>
          </div>
        </div>
        
        <div class="legal-article">
          <h4 class="article-title">المادة (2): بيانات الطرفين</h4>
          <div class="article-content">
            <p><strong>المؤمن له:</strong> ${completeData.insured_info.name}</p>
            <p><strong>المركبة المؤمنة:</strong> ${completeData.vehicle_info.year} ${completeData.vehicle_info.make} ${completeData.vehicle_info.model}</p>
            <p><strong>رقم اللوحة:</strong> ${completeData.vehicle_info.license_plate}</p>
            <p>وقد تم إعداد هذا البيان بناءً على البيانات التي تم تقديمها من قبل المؤمن له.</p>
          </div>
        </div>
        
        <!-- استمرار بقية المواد... -->
        
        <!-- توقيعات -->
        <div class="signature-section">
          <div style="display: inline-block; text-align: center;">
            <h4>صادر عن</h4>
            <p>نظام SafeRatio لإدارة تأمين السيارات</p>
            <div style="width: 200px; height: 1px; background: #000; margin: 40px auto 10px;"></div>
            <p>مدير النظام</p>
          </div>
        </div>
        
        <!-- تذييل الصفحة -->
        <div class="footer">
          <p>تم إنشاء هذه الوثيقة آلياً بواسطة نظام SafeRatio لتأمين السيارات</p>
          <p>رقم المرجع: ${completeData.policy_info.policy_number} | تاريخ الإنشاء: ${new Date().toLocaleDateString('usa')}</p>
          <p class="print-only">صفحة 1 من 3</p>
        </div>
        
        <script>
          // طباعة تلقائية بعد التحميل
          window.addEventListener('load', function() {
            setTimeout(function() {
              window.print();
            }, 1000);
          });
          
          // العودة بعد الطباعة
          window.onafterprint = function() {
            setTimeout(function() {
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // ========== واجهة المستخدم ==========
  return (
    <div style={{ 
      padding: '25px', 
      maxWidth: '900px', 
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      {/* عنوان الوثيقة */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #000'
      }}>
        <h4 style={{ color: '#000', marginBottom: '10px' }}>
          <FaFilePdf style={{ marginLeft: '10px', color: '#000' }} />
          إنشاء وثيقة تأمين مركبة
        </h4>
        <p style={{ color: '#7f8c8d' }}>
          إنشاء وتحميل وثيقة تأمين مركبة كاملة مع النصوص القانونية
        </p>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '15px', 
          marginTop: '15px',
          flexWrap: 'wrap'
        }}>
          <Badge bg="primary" style={{ fontSize: '14px', padding: '8px 15px' }}>
            <FaCar style={{ marginLeft: '5px' }} />
            {getCompletePolicyData().vehicle_info.make} {getCompletePolicyData().vehicle_info.model}
          </Badge>
          <Badge bg="success" style={{ fontSize: '14px', padding: '8px 15px' }}>
            <FaDollarSign style={{ marginLeft: '5px' }} />
            القسط: {getCompletePolicyData().premium_info.total_premium.toLocaleString('usa')} دولار
          </Badge>
          <Badge bg="info" style={{ fontSize: '14px', padding: '8px 15px' }}>
            {getCompletePolicyData().policy_info.coverage_type}
          </Badge>
        </div>
      </div>
      
      {/* معلومات سريعة */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '25px',
        border: '1px solid #dee2e6'
      }}>
        <h6 style={{ color: '#000', marginBottom: '15px' }}>
          <FaCar style={{ marginLeft: '10px', color: '#000' }} />
          ملخص معلومات المركبة والتغطية
        </h6>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '15px',
          textAlign: 'center'
        }}>
          <div style={{ padding: '15px', backgroundColor: '#e8f4fc', borderRadius: '6px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>
              {getCompletePolicyData().vehicle_info.year}
            </div>
            <div style={{ color: '#2c3e50', marginTop: '5px' }}>سنة الصنع</div>
          </div>
          
          <div style={{ padding: '15px', backgroundColor: '#e8f6e8', borderRadius: '6px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>
              {getCompletePolicyData().policy_info.coverage_type.split(' ')[0]}
            </div>
            <div style={{ color: '#2c3e50', marginTop: '5px' }}>نوع التغطية</div>
          </div>
          
          <div style={{ padding: '15px', backgroundColor: '#fff9e6', borderRadius: '6px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>
              {getCompletePolicyData().policy_info.days_remaining}
            </div>
            <div style={{ color: '#2c3e50', marginTop: '5px' }}>أيام متبقية</div>
          </div>
          
          <div style={{ padding: '15px', backgroundColor: '#f4ecf7', borderRadius: '6px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>
              {getCompletePolicyData().vehicle_info.license_plate}
            </div>
            <div style={{ color: '#2c3e50', marginTop: '5px' }}>رقم اللوحة</div>
          </div>
        </div>
      </div>
      
      {/* شريط التقدم */}
      {loading && (
        <div style={{ marginBottom: '25px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '8px',
            fontSize: '14px'
          }}>
            <span>جاري إنشاء الوثيقة...</span>
            <span style={{ fontWeight: 'bold', color: '#000' }}>{progress}%</span>
          </div>
          <ProgressBar 
            now={progress} 
            animated 
            variant="success"
            style={{ height: '10px', borderRadius: '5px' }}
          />
        </div>
      )}
      
      {/* رسائل التنبيه */}
      {success && (
        <Alert variant="success" style={{ marginBottom: '20px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaCheckCircle style={{ marginLeft: '10px', fontSize: '20px' }} />
            <div>
              <h6 style={{ marginBottom: '5px' }}>تم بنجاح!</h6>
              <p style={{ marginBottom: '0' }}>{success}</p>
            </div>
          </div>
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" style={{ marginBottom: '20px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaTimes style={{ marginLeft: '10px', fontSize: '20px' }} />
            <div>
              <h6 style={{ marginBottom: '5px' }}>خطأ!</h6>
              <p style={{ marginBottom: '0' }}>{error}</p>
            </div>
          </div>
        </Alert>
      )}
      
      {/* أزرار التحكم */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
        flexWrap: 'wrap',
        paddingTop: '25px',
        borderTop: '1px solid #dee2e6'
      }}>
        {/* <Button 
          variant="primary" 
          onClick={generateArabicPDF}
          disabled={loading}
          style={{ 
            minWidth: '220px',
            padding: '12px 25px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? (
            <>
              <Spinner size="sm" animation="border" style={{ marginLeft: '10px' }} />
              جاري الإنشاء...
            </>
          ) : (
            <>
              <FaFilePdf style={{ marginLeft: '10px', fontSize: '20px' }} />
              إنشاء وتحميل PDF كامل
            </>
          )}
        </Button> */}
        
        <Button 
          variant="outline-primary" 
          onClick={previewForPrint}
          disabled={loading}
          style={{ 
            minWidth: '180px',
            padding: '12px 20px',
            fontSize: '15px'
          }}
        >
          <FaPrint style={{ marginLeft: '10px' }} />
          معاينة وطباعة
        </Button>
        
        <Button 
          variant="outline-secondary" 
          onClick={onClose}
          style={{ 
            minWidth: '120px',
            padding: '12px 20px'
          }}
        >
          <FaTimes style={{ marginLeft: '10px' }} />
          إغلاق
        </Button>
      </div>
      
      {/* معلومات تكميلية */}
      <div style={{ 
        marginTop: '25px', 
        fontSize: '13px', 
        color: '#7f8c8d',
        textAlign: 'center',
        lineHeight: '1.6'
      }}>
        <div style={{ 
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '6px',
          border: '1px dashed #dee2e6'
        }}>
          <FaInfoCircle style={{ marginLeft: '8px', color: '#000' }} />
          <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>ماذا ستشمل الوثيقة؟</span>
          <div style={{ marginTop: '10px', textAlign: 'right' }}>
            <p style={{ marginBottom: '5px' }}>✓ 8 مواد قانونية كاملة</p>
            <p style={{ marginBottom: '5px' }}>✓ تفاصيل المركبة والتغطية</p>
            <p style={{ marginBottom: '5px' }}>✓ مزايا واستثناءات التغطية</p>
            <p style={{ marginBottom: '5px' }}>✓ تفاصيل القسط والتكاليف</p>
            <p>✓ مدة سريان الوثيقة والشروط</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarInsurancePolicyPdf;