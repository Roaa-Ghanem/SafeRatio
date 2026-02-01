// components/SavedPoliciesPdf.js
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner } from 'react-bootstrap';
import { FaDownload, FaEye, FaTrash, FaDatabase } from 'react-icons/fa';
import api from '../api';

const SavedPoliciesPdf = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPoliciesWithPdf();
  }, []);
  
  const fetchPoliciesWithPdf = async () => {
    try {
      const response = await api.get('/api/health/health-insurance-policies/');
      const policiesWithPdf = response.data.filter(policy => policy.pdf_document);
      setPolicies(policiesWithPdf);
    } catch (error) {
      console.error('❌ خطأ في جلب السياسات:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' بايت';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' كيلوبايت';
    return (bytes / (1024 * 1024)).toFixed(1) + ' ميجابايت';
  };
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-3">جاري تحميل الوثائق المحفوظة...</p>
      </div>
    );
  }
  
  return (
    <Card>
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <div>
          <FaDatabase className="me-2" />
          الوثائق المحفوظة في قاعدة البيانات
        </div>
        <Badge bg="light" text="dark">
          {policies.length} وثيقة
        </Badge>
      </Card.Header>
      
      <Card.Body>
        {policies.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <FaDatabase size={48} className="mb-3" />
            <h5>لا توجد وثائق محفوظة</h5>
            <p>قم بإنشاء وتخزين PDF لأي وثيقة لظهورها هنا</p>
          </div>
        ) : (
          <Table hover responsive>
            <thead>
              <tr>
                <th>رقم الوثيقة</th>
                <th>الشركة</th>
                <th>حجم الملف</th>
                <th>تاريخ الإنشاء</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {policies.map(policy => (
                <tr key={policy.id}>
                  <td>
                    <strong>{policy.policy_number}</strong>
                  </td>
                  <td>{policy.company_name}</td>
                  <td>
                    {policy.pdf_file_size ? (
                      <Badge bg="info">
                        {formatFileSize(policy.pdf_file_size)}
                      </Badge>
                    ) : 'غير معروف'}
                  </td>
                  <td>
                    {policy.pdf_generated_at ? (
                      new Date(policy.pdf_generated_at).toLocaleDateString('ar-SA')
                    ) : 'غير معروف'}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={() => window.open(`/api/health/health-insurance-policies/${policy.id}/download_pdf/`)}
                    >
                      <FaDownload /> تحميل
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => window.open(`/api/health/health-insurance-policies/${policy.id}/get_pdf_info/`)}
                    >
                      <FaEye /> معلومات
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default SavedPoliciesPdf;