// src/components/health/HealthEstablishmentList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Form,
  Alert,
  Spinner,
  InputGroup,
  Pagination
} from 'react-bootstrap';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaHospital,
  FaCalculator,
  FaFileMedical,
  Row, Col
} from 'react-icons/fa';
import api from '../../services/api';
import './HealthEstablishmentList.css';

const HealthEstablishmentList = ({ refreshTrigger }) => {
  const navigate = useNavigate();
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [establishmentToDelete, setEstablishmentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEstablishments();
  }, [refreshTrigger, currentPage]);

  const fetchEstablishments = async () => {
    try {
      setLoading(true);
      const response = await api.get('api/health/health-establishments/');
      setEstablishments(response.data);
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
    } catch (error) {
      console.error('Error fetching establishments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (establishment) => {
    setEstablishmentToDelete(establishment);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`api/health/health-establishments/${establishmentToDelete.id}/`);
      setEstablishments(establishments.filter(e => e.id !== establishmentToDelete.id));
      setShowDeleteModal(false);
      setEstablishmentToDelete(null);
    } catch (error) {
      console.error('Error deleting establishment:', error);
      alert('حدث خطأ أثناء حذف المنشأة');
    }
  };

  const handleCalculatePremium = (establishment) => {
    navigate(`api/health/calculator?establishment=${establishment.id}`);
  };

  const handleViewQuotes = (establishment) => {
    navigate(`api/health/quotes?establishment=${establishment.id}`);
  };

  const filteredEstablishments = establishments.filter(establishment =>
    establishment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    establishment.cr_number.includes(searchTerm) ||
    establishment.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedEstablishments = filteredEstablishments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getEstablishmentTypeBadge = (type) => {
    const types = {
      'hospital': { label: 'مستشفى', color: 'danger' },
      'clinic': { label: 'عيادة', color: 'primary' },
      'pharmacy': { label: 'صيدلية', color: 'success' },
      'lab': { label: 'مختبر', color: 'info' },
      'center': { label: 'مركز طبي', color: 'warning' },
      'other': { label: 'أخرى', color: 'secondary' }
    };
    const typeInfo = types[type] || { label: type, color: 'secondary' };
    return <Badge bg={typeInfo.color}>{typeInfo.label}</Badge>;
  };

  const getSizeBadge = (size) => {
    const sizes = {
      'small': { label: 'صغيرة', color: 'success' },
      'medium': { label: 'متوسطة', color: 'warning' },
      'large': { label: 'كبيرة', color: 'danger' }
    };
    const sizeInfo = sizes[size] || { label: size, color: 'secondary' };
    return <Badge bg={sizeInfo.color}>{sizeInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">جاري تحميل المنشآت...</p>
      </div>
    );
  }

  return (
    <div className="health-establishment-list">
      {/* رأس القائمة */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">
                <FaHospital className="me-2" />
                قائمة المنشآت الصحية
              </h5>
              <p className="text-muted mb-0">
                إدارة جميع المنشآت الصحية المسجلة لديك
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/health/establishments/create')}
            >
              <FaPlus className="me-1" />
              إضافة منشأة جديدة
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* شريط البحث والتحكم */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="ابحث بالاسم أو رقم السجل أو المدينة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="text-end">
              <span className="text-muted">
                {filteredEstablishments.length} منشأة
              </span>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* جدول المنشآت */}
      <Card>
        <Card.Body className="p-0">
          {filteredEstablishments.length === 0 ? (
            <div className="text-center py-5">
              <FaHospital size={48} className="text-muted mb-3" />
              <h5>لا توجد منشآت مسجلة</h5>
              <p className="text-muted">ابدأ بإضافة منشأتك الأولى</p>
              <Button
                variant="primary"
                onClick={() => navigate('/health/establishments/create')}
              >
                <FaPlus className="me-1" />
                إضافة منشأة جديدة
              </Button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>اسم المنشأة</th>
                      <th>نوع المنشأة</th>
                      <th>الحجم</th>
                      <th>المدينة</th>
                      <th>عدد الموظفين</th>
                      <th>التأمين السابق</th>
                      <th className="text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEstablishments.map((establishment) => (
                      <tr key={establishment.id}>
                        <td>
                          <div>
                            <strong>{establishment.name}</strong>
                            <div className="text-muted small">
                              {establishment.cr_number}
                            </div>
                          </div>
                        </td>
                        <td>
                          {getEstablishmentTypeBadge(establishment.establishment_type)}
                        </td>
                        <td>
                          {getSizeBadge(establishment.size_category)}
                        </td>
                        <td>{establishment.city}</td>
                        <td>
                          <Badge bg="info" pill>
                            {establishment.total_employees}
                          </Badge>
                        </td>
                        <td>
                          {establishment.has_previous_insurance ? (
                            <Badge bg="success">نعم</Badge>
                          ) : (
                            <Badge bg="secondary">لا</Badge>
                          )}
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => navigate(`/health/establishments/${establishment.id}`)}
                              title="عرض التفاصيل"
                            >
                              <FaEye />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleCalculatePremium(establishment)}
                              title="احتساب قسط"
                            >
                              <FaCalculator />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => handleViewQuotes(establishment)}
                              title="عرض الاقتباسات"
                            >
                              <FaFileMedical />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => navigate(`/health/establishments/${establishment.id}/edit`)}
                              title="تعديل"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDeleteClick(establishment)}
                              title="حذف"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* الترقيم */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    />
                    {[...Array(totalPages)].map((_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={i + 1 === currentPage}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* نموذج حذف المنشأة */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>تأكيد الحذف</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <strong>تحذير!</strong> هل أنت متأكد من حذف المنشأة التالية؟
          </Alert>
          {establishmentToDelete && (
            <div className="p-3 bg-light rounded">
              <h6>{establishmentToDelete.name}</h6>
              <p className="text-muted mb-0">
                رقم السجل: {establishmentToDelete.cr_number}<br />
                المدينة: {establishmentToDelete.city}<br />
                عدد الموظفين: {establishmentToDelete.total_employees}
              </p>
            </div>
          )}
          <p className="mt-3 text-danger">
            <small>
              ⚠️ سيتم حذف جميع البيانات المرتبطة بهذه المنشأة ولا يمكن التراجع عن هذا الإجراء.
            </small>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            إلغاء
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            <FaTrash className="me-1" />
            حذف المنشأة
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HealthEstablishmentList;