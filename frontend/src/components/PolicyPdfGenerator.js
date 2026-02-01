// components/PolicyPdfGenerator.js
import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { FaFilePdf, FaDownload, FaPrint } from 'react-icons/fa';

const PolicyPdfGenerator = ({ policyData, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const generatePDF = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. إنشاء عنصر HTML مخفي للتصدير
      const element = document.createElement('div');
      element.id = 'pdf-content-' + Date.now();
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';
      element.style.width = '210mm'; // حجم A4
      element.style.padding = '20mm';
      element.style.backgroundColor = 'white';
      element.style.direction = 'rtl';
      element.style.textAlign = 'right';
      element.style.fontFamily = "'Arial', 'Tahoma', sans-serif";
      element.style.lineHeight = '1.6';
      
      // 2. بناء محتوى HTML
      element.innerHTML = buildPdfContent(policyData);
      document.body.appendChild(element);
      
      // 3. تحويل HTML إلى Canvas
      const canvas = await html2canvas(element, {
        scale: 2, // دقة عالية
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // تحسين النسخة المستنسخة
          const clonedElement = clonedDoc.getElementById(element.id);
          clonedElement.style.width = '210mm';
          clonedElement.style.boxSizing = 'border-box';
        }
      });
      
      // 4. إنشاء PDF من Canvas
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // عرض A4
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      
      // 5. تحميل PDF
      pdf.save(`وثيقة_تأمين_${policyData.policy_number}.pdf`);
      
      // 6. تنظيف
      document.body.removeChild(element);
      setPdfGenerated(true);
      
      // 7. طباعة تلقائية (اختياري)
      setTimeout(() => {
        if (window.confirm('هل تريد طباعة الوثيقة؟')) {
          const pdfBlob = pdf.output('blob');
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(pdfUrl);
          if (printWindow) {
            printWindow.onload = () => printWindow.print();
          }
        }
      }, 1000);
      
    } catch (err) {
      console.error('❌ خطأ في إنشاء PDF:', err);
      setError('فشل إنشاء PDF. الرجاء المحاولة مرة أخرى.');
      
      // بديل: فتح HTML في نافذة جديدة
      alert('سيتم فتح نسخة HTML للطباعة');
      openHtmlVersion(policyData);
      
    } finally {
      setLoading(false);
    }
  };

  const buildPdfContent = (data) => {
    // حساب إجمالي أفراد العائلة
    const familyMembers = data.family_members || {};
    const totalFamily = Object.values(familyMembers).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
    
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            margin: 0;
            size: A4;
          }
          
          body {
            margin: 0;
            padding: 20mm;
            font-family: 'Arial', 'Tahoma', sans-serif;
            line-height: 1.6;
            color: #333;
            direction: rtl;
            text-align: right;
          }
          
          .header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 3px solid #007bff;
          }
          
          .header h1 {
            color: #007bff;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          
          .header .subtitle {
            color: #666;
            font-size: 16px;
          }
          
          .policy-number {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            margin: 15px 0;
            border: 1px solid #dee2e6;
          }
          
          .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          
          .section-title {
            background: #e9ecef;
            padding: 8px 15px;
            border-right: 4px solid #28a745;
            margin-bottom: 12px;
            font-weight: bold;
            color: #495057;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 15px;
          }
          
          .info-item {
            padding: 8px 0;
            border-bottom: 1px dashed #dee2e6;
          }
          
          .info-label {
            font-weight: bold;
            color: #495057;
            min-width: 120px;
            display: inline-block;
          }
          
          .info-value {
            color: #212529;
          }
          
          .financial-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          
          .financial-table th {
            background: #007bff;
            color: white;
            padding: 10px;
            text-align: right;
          }
          
          .financial-table td {
            padding: 8px 10px;
            border: 1px solid #dee2e6;
          }
          
          .total-row {
            background: #d4edda !important;
            font-weight: bold;
          }
          
          .coverage-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin: 15px 0;
          }
          
          .coverage-item {
            background: #f0f8ff;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #cce5ff;
          }
          
          .signature-section {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #dee2e6;
          }
          
          .signature-box {
            display: inline-block;
            width: 45%;
            text-align: center;
            margin: 0 2%;
            vertical-align: top;
          }
          
          .signature-line {
            width: 200px;
            height: 1px;
            background: #000;
            margin: 30px auto 5px;
          }
          
          .warning-box {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
          }
          
          .success-text {
            color: #28a745;
            font-weight: bold;
          }
          
          .danger-text {
            color: #dc3545;
            font-weight: bold;
          }
          
          .primary-text {
            color: #007bff;
            font-weight: bold;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #dee2e6;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <!-- رأس الوثيقة -->
        <div class="header">
          <h1>وثيقة تأمين صحي</h1>
          <p class="subtitle">(بيان معلوماتي - غير ملزم قانونيًا)</p>
          <div class="policy-number">
            <strong>رقم الوثيقة:</strong> ${data.policy_number || 'غير محدد'}
          </div>
        </div>
        
        <!-- معلومات أساسية -->
        <div class="section">
          <div class="section-title">المعلومات الأساسية</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">الشركة:</span>
              <span class="info-value">${data.company_name || 'غير محدد'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">خطة التغطية:</span>
              <span class="info-value">${data.coverage_plan_name || 'غير محدد'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">نوع التأمين:</span>
              <span class="info-value">${data.insurance_type_name || 'غير محدد'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">حالة الوثيقة:</span>
              <span class="info-value success-text">${data.status_display || 'غير محدد'}</span>
            </div>
          </div>
        </div>
        
        <!-- فترة التغطية -->
        <div class="section">
          <div class="section-title">فترة التغطية</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">تاريخ البدء:</span>
              <span class="info-value">${data.inception_date_arabic || data.inception_date}</span>
            </div>
            <div class="info-item">
              <span class="info-label">تاريخ الانتهاء:</span>
              <span class="info-value">${data.expiry_date_arabic || data.expiry_date}</span>
            </div>
            <div class="info-item">
              <span class="info-label">الأيام المتبقية:</span>
              <span class="info-value primary-text">${data.days_remaining || 0} يوم</span>
            </div>
            <div class="info-item">
              <span class="info-label">تاريخ الإنشاء:</span>
              <span class="info-value">${data.generated_date_arabic || data.generated_date}</span>
            </div>
          </div>
        </div>
        
        <!-- التفاصيل المالية -->
        <div class="section">
          <div class="section-title">التفاصيل المالية</div>
          <table class="financial-table">
            <thead>
              <tr>
                <th>البند</th>
                <th>المبلغ (دولار)</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>القسط الإجمالي</td>
                <td>${parseFloat(data.total_premium || 0).toLocaleString()}</td>
                <td>إجمالي</td>
              </tr>
              <tr>
                <td>القسط السنوي</td>
                <td>${parseFloat(data.annual_premium || 0).toLocaleString()}</td>
                <td>سنوي</td>
              </tr>
              <tr>
                <td>القسط الشهري</td>
                <td>${parseFloat(data.monthly_premium || 0).toLocaleString()}</td>
                <td>شهري</td>
              </tr>
              <tr>
                <td>المبلغ المدفوع</td>
                <td class="success-text">${parseFloat(data.paid_amount || 0).toLocaleString()}</td>
                <td>${data.payment_status_display || 'غير محدد'}</td>
              </tr>
              <tr class="total-row">
                <td><strong>المبلغ المتبقي</strong></td>
                <td class="danger-text"><strong>${parseFloat(data.due_amount || 0).toLocaleString()}</strong></td>
                <td><strong>قيد الدفع</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- تفاصيل التغطية -->
        <div class="section">
          <div class="section-title">تفاصيل التغطية</div>
          <div class="coverage-grid">
            <div class="coverage-item">
              <strong>الموظفون:</strong> ${data.coverage_details?.employee_coverage || '100%'}
            </div>
            ${familyMembers.spouses ? `<div class="coverage-item">
              <strong>الزوجات (${familyMembers.spouses}):</strong> ${data.coverage_details?.spouse_coverage || '50%'}
            </div>` : ''}
            ${familyMembers.children ? `<div class="coverage-item">
              <strong>الأبناء (${familyMembers.children}):</strong> ${data.coverage_details?.children_coverage || '50%'}
            </div>` : ''}
            ${familyMembers.parents ? `<div class="coverage-item">
              <strong>الوالدان (${familyMembers.parents}):</strong> ${data.coverage_details?.parents_coverage || '30%'}
            </div>` : ''}
            <div class="coverage-item">
              <strong>الحد السنوي:</strong> ${data.coverage_details?.annual_limit || '$50,000'}
            </div>
            <div class="coverage-item">
              <strong>الخصم:</strong> ${data.coverage_details?.deductible || '$500'}
            </div>
          </div>
        </div>
        
        <!-- تنبيهات مهمة -->
        <div class="section">
          <div class="section-title">ملاحظات هامة</div>
          <div class="warning-box">
            <h4 style="margin-top: 0; color: #856404;">⚠️ تنبيهات:</h4>
            <ul style="margin-bottom: 0;">
              <li>هذه وثيقة معلوماتية وليست عقد تأمين رسمي</li>
              <li>جميع الأسعار عرضة للتغيير</li>
              <li>التغطية الفعلية تخضع لشروط العقد الأصلي</li>
              <li>يرجى التواصل مع شركة التأمين للتفاصيل النهائية</li>
            </ul>
          </div>
        </div>
        
        <!-- التوقيعات -->
        <div class="signature-section">
          <div>
            <div class="signature-box">
              <p><strong>شركة التأمين</strong></p>
              <p>SafeRatio Insurance</p>
              <div class="signature-line"></div>
              <p>التوقيع والختم</p>
            </div>
            
            <div class="signature-box">
              <p><strong>الطرف المؤمَّن له</strong></p>
              <p>${data.company_name || 'غير محدد'}</p>
              <div class="signature-line"></div>
              <p>التوقيع والختم</p>
            </div>
          </div>
        </div>
        
        <!-- التذييل -->
        <div class="footer">
          <p>تم إنشاء هذا البيان آليًا بواسطة نظام SafeRatio للتأمين الصحي</p>
          <p>تاريخ الإنشاء: ${data.generated_date || new Date().toLocaleString()}</p>
          <p>للاستفسارات: info@saferatio.com | www.saferatio.com</p>
        </div>
      </body>
      </html>
    `;
  };

  const openHtmlVersion = (data) => {
    const htmlContent = buildPdfContent(data);
    const newWindow = window.open();
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    
    // إضافة زر الطباعة
    newWindow.onload = () => {
      newWindow.document.body.innerHTML += `
        <div style="text-align:center; margin:20px;">
          <button onclick="window.print()" style="
            background:#007bff;
            color:white;
            border:none;
            padding:10px 30px;
            border-radius:5px;
            cursor:pointer;
            font-size:16px;
          ">
            🖨️ طباعة الوثيقة
          </button>
        </div>
      `;
    };
  };

  useEffect(() => {
    if (policyData) {
      generatePDF();
    }
  }, [policyData]);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      {loading && (
        <div>
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">جاري إنشاء PDF... قد يستغرق بضع ثوانٍ</p>
        </div>
      )}
      
      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}
      
      {pdfGenerated && (
        <Alert variant="success">
          ✅ تم إنشاء PDF بنجاح!
        </Alert>
      )}
      
      <div className="mt-4">
        <Button 
          variant="primary" 
          onClick={generatePDF}
          disabled={loading}
          className="me-2"
        >
          <FaDownload className="me-2" />
          {loading ? 'جاري الإنشاء...' : 'تحميل PDF مرة أخرى'}
        </Button>
        
        <Button 
          variant="outline-secondary" 
          onClick={() => openHtmlVersion(policyData)}
        >
          <FaPrint className="me-2" />
          فتح نسخة للطباعة
        </Button>
      </div>
    </div>
  );
};

export default PolicyPdfGenerator;