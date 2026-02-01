import React, { useState } from 'react';
import { Card, Button, Table, Badge, Modal, Alert } from 'react-bootstrap';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FaDownload, FaPrint, FaFilePdf, FaFileWord, FaEye } from 'react-icons/fa';

const InsuranceDocuments = ({ quote, company, previewData }) => {
  const [showDocuments, setShowDocuments] = useState(false);

  // دالة لإنشاء PDF للاقتباس
  const generateQuotePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // العنوان
    doc.setFontSize(20);
    doc.text('عرض سعر التأمين الصحي', 105, 20, { align: 'center' });
    
    // معلومات الشركة
    doc.setFontSize(12);
    doc.text(`الشركة: ${company?.name || 'غير محدد'}`, 20, 40);
    doc.text(`نوع التأمين: ${previewData?.rules?.name || 'غير محدد'}`, 20, 50);
    doc.text(`تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}`, 20, 60);
    
    // تفاصيل المشتركين
    doc.text('تفاصيل المشتركين:', 20, 80);
    const details = previewData?.insuredBreakdown?.counts;
    if (details) {
      doc.text(`- الموظفين: ${details.employees}`, 30, 90);
      doc.text(`- الزوجات: ${details.spouses}`, 30, 100);
      doc.text(`- الأبناء: ${details.children}`, 30, 110);
      doc.text(`- الوالدين: ${details.parents}`, 30, 120);
    }
    
    // التكلفة
    doc.text(`التكلفة الإجمالية: $${previewData?.totalPremium?.toLocaleString() || '0'}`, 20, 140);
    
    // حفظ الملف
    doc.save(`عرض_سعر_${company?.name || 'تأمين'}_${new Date().getTime()}.pdf`);
  };

  // دالة لإنشاء وثيقة PDF
  const generatePolicyPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // رأس الوثيقة
    doc.setFontSize(24);
    doc.text('وثيقة التأمين الصحي', 105, 30, { align: 'center' });
    
    // محتوى الوثيقة
    doc.setFontSize(12);
    doc.text('شروط وأحكام الوثيقة:', 20, 60);
    
    const terms = [
      '1. هذه الوثيقة سارية لمدة سنة ميلادية كاملة',
      '2. تشمل العلاج الداخلي والخارجي',
      '3. نسبة التحمل حسب نوع الخطة المختارة',
      '4. لا تشمل الأمراض الموجودة قبل التعاقد',
      '5. يمكن تجديد الوثيقة قبل انتهائها بشهر'
    ];
    
    terms.forEach((term, index) => {
      doc.text(term, 25, 75 + (index * 10));
    });
    
    doc.text(`رقم الوثيقة: ${quote?.quote_number || 'غير معروف'}`, 20, 150);
    doc.text(`القسط السنوي: $${previewData?.totalPremium?.toLocaleString() || '0'}`, 20, 160);
    doc.text(`القسط الشهري: $${Math.round(previewData?.totalPremium / 12)?.toLocaleString() || '0'}`, 20, 170);
    
    doc.save(`وثيقة_تأمين_${company?.name || 'شركة'}_${new Date().getTime()}.pdf`);
  };

  // دالة لإنشاء تقرير Excel
  const generateExcelReport = () => {
    const csvContent = [
      ['نوع البيانات', 'القيمة', 'الملاحظات'],
      ['اسم الشركة', company?.name || '', ''],
      ['عدد الموظفين', previewData?.insuredBreakdown?.counts?.employees || 0, ''],
      ['عدد الزوجات', previewData?.insuredBreakdown?.counts?.spouses || 0, 'زوجة واحدة لكل متزوج'],
      ['عدد الأبناء', previewData?.insuredBreakdown?.counts?.children || 0, ''],
      ['عدد الوالدين', previewData?.insuredBreakdown?.counts?.parents || 0, ''],
      ['القسط الإجمالي', `$${previewData?.totalPremium || 0}`, 'سنوي'],
      ['القسط الشهري', `$${Math.round(previewData?.totalPremium / 12) || 0}`, ''],
      ['تاريخ الإنشاء', new Date().toLocaleDateString('ar-SA'), ''],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_تأمين_${company?.name || 'شركة'}.csv`;
    link.click();
  };

  return (
    <>
      <Button 
        variant="success" 
        onClick={() => setShowDocuments(true)}
        className="mt-3"
      >
        📄 إدارة الوثائق
      </Button>

      <Modal show={showDocuments} onHide={() => setShowDocuments(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📋 وثائق التأمين القابلة للتنزيل</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <strong>ملاحظة:</strong> جميع المستندات تحتوي على:
            <ul className="mb-0 mt-2">
              <li>✅ زوجة واحدة فقط لكل موظف متزوج</li>
              <li>✅ تضمين الوالدين إذا تم اختياره</li>
              <li>✅ الأسعار النهائية المدققة</li>
              <li>✅ تاريخ انتهاء الصلاحية (30 يوم)</li>
            </ul>
          </Alert>

          <div className="documents-grid">
            <Card className="document-card">
              <Card.Body className="text-center">
                <FaFilePdf size={40} className="text-danger mb-3" />
                <Card.Title>عرض السعر (PDF)</Card.Title>
                <Card.Text>
                  عرض سعر رسمي للتوقيع
                </Card.Text>
                <Button variant="outline-danger" onClick={generateQuotePDF}>
                  <FaDownload /> تحميل PDF
                </Button>
              </Card.Body>
            </Card>

            <Card className="document-card">
              <Card.Body className="text-center">
                <FaFilePdf size={40} className="text-primary mb-3" />
                <Card.Title>وثيقة التأمين</Card.Title>
                <Card.Text>
                  وثيقة رسمية شاملة الشروط
                </Card.Text>
                <Button variant="outline-primary" onClick={generatePolicyPDF}>
                  <FaDownload /> تحميل الوثيقة
                </Button>
              </Card.Body>
            </Card>

            <Card className="document-card">
              <Card.Body className="text-center">
                <FaFileWord size={40} className="text-success mb-3" />
                <Card.Title>تقرير Excel</Card.Title>
                <Card.Text>
                  بيانات رقمية للتحليل
                </Card.Text>
                <Button variant="outline-success" onClick={generateExcelReport}>
                  <FaDownload /> تحميل Excel
                </Button>
              </Card.Body>
            </Card>
          </div>

          <div className="mt-4">
            <h6>معاينة سريعة:</h6>
            <Table striped bordered size="sm">
              <thead>
                <tr>
                  <th>البند</th>
                  <th>العدد</th>
                  <th>التكلفة</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>الموظفون</td>
                  <td>{previewData?.insuredBreakdown?.counts?.employees || 0}</td>
                  <td>${previewData?.insuredBreakdown?.costs?.employees?.toLocaleString() || 0}</td>
                </tr>
                <tr>
                  <td>الزوجات (واحدة لكل متزوج)</td>
                  <td>{previewData?.insuredBreakdown?.counts?.spouses || 0}</td>
                  <td>${previewData?.insuredBreakdown?.costs?.spouses?.toLocaleString() || 0}</td>
                </tr>
                <tr>
                  <td>الأبناء</td>
                  <td>{previewData?.insuredBreakdown?.counts?.children || 0}</td>
                  <td>${previewData?.insuredBreakdown?.costs?.children?.toLocaleString() || 0}</td>
                </tr>
                <tr>
                  <td>الوالدين</td>
                  <td>{previewData?.insuredBreakdown?.counts?.parents || 0}</td>
                  <td>${previewData?.insuredBreakdown?.costs?.parents?.toLocaleString() || 0}</td>
                </tr>
                <tr className="table-success">
                  <td><strong>الإجمالي</strong></td>
                  <td><strong>{previewData?.totalInsured || 0}</strong></td>
                  <td><strong>${previewData?.totalPremium?.toLocaleString() || 0}</strong></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDocuments(false)}>
            إغلاق
          </Button>
          <Button variant="primary" onClick={() => {
            generateQuotePDF();
            setTimeout(() => generatePolicyPDF(), 500);
            setTimeout(() => generateExcelReport(), 1000);
          }}>
            تحميل الكل
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InsuranceDocuments;