// components/SimplePolicyPdf.js
import React, { useState, useRef } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { FaFilePdf, FaDownload, FaPrint, FaTimes } from 'react-icons/fa';

// دالة مساعدة لتحميل المكتبات ديناميكياً
const loadPdfLibraries = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // تحميل المكتبات بشكل ديناميكي لتجنب زيادة حجم الحزمة
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      
      resolve({
        html2canvas: html2canvasModule.default,
        jsPDF: jsPDFModule.default
      });
    } catch (error) {
      reject(error);
    }
  });
};

const SimplePolicyPdf = ({ policyData, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pdfContentRef = useRef(null);

  // دالة لإنشاء PDF
  const generatePDF = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // تحميل المكتبات
      const { html2canvas, jsPDF } = await loadPdfLibraries();
      
      // استخدام العنصر الحالي بدلاً من إنشاء عنصر جديد
      const element = pdfContentRef.current;
      if (!element) {
        throw new Error('لم يتم العثور على محتوى PDF');
      }
      
      // نسخ العنصر للتحويل
      const clonedElement = element.cloneNode(true);
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      clonedElement.style.top = '0';
      clonedElement.style.width = '210mm';
      clonedElement.style.backgroundColor = 'white';
      document.body.appendChild(clonedElement);
      
      // تحويل إلى Canvas
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      // إنشاء PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      
      // تحميل PDF
      const fileName = `وثيقة_تأمين_${policyData.policy_number}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
      
      // تنظيف
      document.body.removeChild(clonedElement);
      
      // تأكيد النجاح
      setTimeout(() => {
        alert('✅ تم تحميل PDF بنجاح!');
      }, 500);
      
    } catch (err) {
      console.error('❌ خطأ في إنشاء PDF:', err);
      setError('فشل إنشاء PDF. يمكنك استخدام نسخة HTML للطباعة.');
      
      // فتح نسخة HTML للطباعة
      setTimeout(() => {
        if (window.confirm('هل تريد فتح نسخة HTML للطباعة بدلاً من ذلك؟')) {
          openHtmlForPrint();
        }
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  // دالة لفتح HTML للطباعة
  const openHtmlForPrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>وثيقة تأمين - ${policyData.policy_number}</title>
        <style>
          @media print {
            @page { margin: 20mm; }
            body { margin: 0; }
          }
          
          body {
            font-family: 'Arial', 'Tahoma', sans-serif;
            line-height: 1.6;
            direction: rtl;
            text-align: right;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            color: #007bff;
            margin-bottom: 10px;
          }
          
          .policy-info {
            margin: 25px 0;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px dashed #ccc;
          }
          
          .info-label {
            font-weight: bold;
            color: #333;
            min-width: 150px;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          
          .print-btn {
            text-align: center;
            margin: 30px 0;
          }
          
          button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 30px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>وثيقة تأمين صحي</h1>
          <h3>رقم الوثيقة: ${policyData.policy_number}</h3>
          <p><em>(وثيقة معلوماتية - غير ملزمة قانونيًا)</em></p>
        </div>
        
        <div class="policy-info">
          <div class="info-row">
            <span class="info-label">الشركة:</span>
            <span>${policyData.company_name || 'غير محدد'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">خطة التغطية:</span>
            <span>${policyData.coverage_plan_name || 'غير محدد'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">تاريخ البدء:</span>
            <span>${policyData.inception_date_arabic || policyData.inception_date}</span>
          </div>
          <div class="info-row">
            <span class="info-label">تاريخ الانتهاء:</span>
            <span>${policyData.expiry_date_arabic || policyData.expiry_date}</span>
          </div>
          <div class="info-row">
            <span class="info-label">القسط الإجمالي:</span>
            <span style="color: green; font-weight: bold;">
              ${parseFloat(policyData.total_premium || 0).toLocaleString()} دولار
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">الحالة:</span>
            <span>${policyData.status_display || 'غير محدد'}</span>
          </div>
        </div>
        
        <div class="print-btn">
          <button onclick="window.print()">
            🖨️ طباعة الوثيقة
          </button>
        </div>
        
        <div class="footer">
          <p>تم إنشاء هذه الوثيقة بواسطة نظام SafeRatio للتأمين الصحي</p>
          <p>التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
          <p>للاستفسارات: info@saferatio.com</p>
        </div>
        
        <script>
          // طباعة تلقائية عند تحميل الصفحة
          window.onload = function() {
            setTimeout(() => {
              window.print();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // دالة لطباعة مباشرة من المتصفح
  const handlePrint = () => {
    const printContent = document.getElementById('pdf-preview-content').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>طباعة وثيقة تأمين</title>
        <style>
          body {
            font-family: 'Arial', 'Tahoma', sans-serif;
            line-height: 1.6;
            direction: rtl;
            text-align: right;
            padding: 20px;
          }
          
          @media print {
            @page {
              size: A4;
              margin: 20mm;
            }
            
            body {
              padding: 0;
            }
            
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        ${printContent}
        <div class="no-print" style="text-align:center; margin-top:30px;">
          <button onclick="window.close()" style="
            background: #dc3545;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
          ">
            إغلاق النافذة
          </button>
        </div>
      </body>
      </html>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* زر الإغلاق */}
      <div style={{ textAlign: 'left', marginBottom: '20px' }}>
        <Button 
          variant="outline-secondary" 
          size="sm"
          onClick={onClose}
        >
          <FaTimes /> إغلاق
        </Button>
      </div>
      
      {/* حالة التحميل */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spinner animation="border" variant="primary" />
          <p style={{ marginTop: '15px', color: '#666' }}>
            جاري إنشاء PDF... قد يستغرق بضع ثوانٍ
          </p>
        </div>
      )}
      
      {/* رسالة الخطأ */}
      {error && (
        <Alert variant="warning" className="mb-4">
          <strong>⚠️ تنبيه:</strong> {error}
        </Alert>
      )}
      
      {/* محتوى PDF المعاينة */}
      <div 
        id="pdf-preview-content" 
        ref={pdfContentRef}
        style={{
          backgroundColor: 'white',
          padding: '30px',
          border: '1px solid #dee2e6',
          borderRadius: '10px',
          direction: 'rtl',
          textAlign: 'right',
          fontFamily: "'Arial', 'Tahoma', sans-serif",
          lineHeight: '1.8',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}
      >
        {/* الرأس */}
        <div style={{ textAlign: 'center', borderBottom: '3px solid #007bff', paddingBottom: '20px', marginBottom: '30px' }}>
          <h1 style={{ color: '#007bff', marginBottom: '10px' }}>وثيقة تأمين صحي</h1>
          <p style={{ color: '#666', fontSize: '18px' }}>(بيان معلوماتي - غير ملزم قانونيًا)</p>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
            <h3 style={{ margin: '0', color: '#495057' }}>رقم الوثيقة: {policyData.policy_number}</h3>
          </div>
        </div>
        
        {/* معلومات الوثيقة */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ backgroundColor: '#e9ecef', padding: '10px 15px', borderRight: '4px solid #28a745', color: '#495057' }}>
            المعلومات الأساسية
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '20px' }}>
            <div style={{ padding: '10px 0', borderBottom: '1px dashed #dee2e6' }}>
              <strong style={{ color: '#495057' }}>الشركة:</strong>
              <span style={{ marginRight: '10px' }}>{policyData.company_name || 'غير محدد'}</span>
            </div>
            
            <div style={{ padding: '10px 0', borderBottom: '1px dashed #dee2e6' }}>
              <strong style={{ color: '#495057' }}>خطة التغطية:</strong>
              <span style={{ marginRight: '10px' }}>{policyData.coverage_plan_name || 'غير محدد'}</span>
            </div>
            
            <div style={{ padding: '10px 0', borderBottom: '1px dashed #dee2e6' }}>
              <strong style={{ color: '#495057' }}>تاريخ البدء:</strong>
              <span style={{ marginRight: '10px' }}>{policyData.inception_date_arabic || policyData.inception_date}</span>
            </div>
            
            <div style={{ padding: '10px 0', borderBottom: '1px dashed #dee2e6' }}>
              <strong style={{ color: '#495057' }}>تاريخ الانتهاء:</strong>
              <span style={{ marginRight: '10px' }}>{policyData.expiry_date_arabic || policyData.expiry_date}</span>
            </div>
            
            <div style={{ padding: '10px 0', borderBottom: '1px dashed #dee2e6' }}>
              <strong style={{ color: '#495057' }}>الأيام المتبقية:</strong>
              <span style={{ marginRight: '10px', color: '#007bff', fontWeight: 'bold' }}>
                {policyData.days_remaining || 0} يوم
              </span>
            </div>
            
            <div style={{ padding: '10px 0', borderBottom: '1px dashed #dee2e6' }}>
              <strong style={{ color: '#495057' }}>حالة الوثيقة:</strong>
              <span style={{ marginRight: '10px', color: '#28a745', fontWeight: 'bold' }}>
                {policyData.status_display || policyData.status || 'غير محدد'}
              </span>
            </div>
          </div>
        </div>
        
        {/* التفاصيل المالية */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ backgroundColor: '#e9ecef', padding: '10px 15px', borderRight: '4px solid #dc3545', color: '#495057' }}>
            التفاصيل المالية
          </h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'right' }}>البند</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>المبلغ (دولار)</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '10px' }}>القسط الإجمالي</td>
                <td style={{ padding: '10px', color: '#28a745', fontWeight: 'bold' }}>
                  {parseFloat(policyData.total_premium || 0).toLocaleString()}
                </td>
                <td style={{ padding: '10px' }}>إجمالي</td>
              </tr>
              
              <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '10px' }}>المبلغ المدفوع</td>
                <td style={{ padding: '10px', color: '#28a745' }}>
                  {parseFloat(policyData.paid_amount || 0).toLocaleString()}
                </td>
                <td style={{ padding: '10px' }}>{policyData.payment_status_display || 'غير محدد'}</td>
              </tr>
              
              <tr style={{ backgroundColor: '#f8d7da', fontWeight: 'bold' }}>
                <td style={{ padding: '10px' }}>المبلغ المتبقي</td>
                <td style={{ padding: '10px', color: '#dc3545' }}>
                  {parseFloat(policyData.due_amount || 0).toLocaleString()}
                </td>
                <td style={{ padding: '10px' }}>قيد الدفع</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* تذييل الوثيقة */}
        <div style={{ 
          marginTop: '50px', 
          paddingTop: '20px', 
          borderTop: '2px solid #dee2e6',
          textAlign: 'center',
          color: '#666'
        }}>
          <p>تم إنشاء هذه الوثيقة آليًا بواسطة نظام SafeRatio للتأمين الصحي</p>
          <p>التاريخ: {policyData.generated_date_arabic || new Date().toLocaleDateString('ar-SA')}</p>
          <p>للاستفسارات: info@saferatio.com | www.saferatio.com</p>
          <p style={{ fontSize: '12px', marginTop: '15px' }}>
            <em>ملاحظة: هذه وثيقة معلوماتية وغير ملزمة قانونيًا</em>
          </p>
        </div>
      </div>
      
      {/* أزرار التحكم */}
      {!loading && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '15px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          flexWrap: 'wrap'
        }}>
          <Button 
            variant="primary" 
            onClick={generatePDF}
            disabled={loading}
            style={{ minWidth: '150px' }}
          >
            <FaDownload className="me-2" />
            تحميل PDF
          </Button>
          
          <Button 
            variant="success" 
            onClick={handlePrint}
            style={{ minWidth: '150px' }}
          >
            <FaPrint className="me-2" />
            طباعة مباشرة
          </Button>
          
          <Button 
            variant="outline-info" 
            onClick={openHtmlForPrint}
            style={{ minWidth: '150px' }}
          >
            <FaFilePdf className="me-2" />
            فتح للطباعة
          </Button>
        </div>
      )}
    </div>
  );
};

export default SimplePolicyPdf;