// src/components/HealthInsuranceQuotes.js
import React, { useState, useEffect, useMemo } from 'react';
import './HealthInsuranceQuotes.css';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Badge,
  Modal,
  Alert,
  Spinner,
  InputGroup,
  Form,
  Dropdown,
  Pagination,
  Row,
  Col,
  Table
} from 'react-bootstrap';
import {
  FaPlus,
  FaEye,
  FaFileDownload,
  FaCheckCircle,
  FaTimesCircle,
  FaFileMedical,
  FaFilter,
  FaSearch,
  FaSort,
  FaPrint,
  FaUsers,
  FaUser,
  FaChild,
  FaUsersCog,
  FaFilePdf,
  FaCalendarAlt,
  FaDollarSign,
  FaBuilding,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaCreditCard
} from 'react-icons/fa';
import api from '../services/api';

const HealthInsuranceQuotes = ({
  quotes: externalQuotes, 
  loading: externalLoading,
  onQuoteAccepted,
  onQuoteRejected,
  onRefresh
}) => {
  const [quotes, setQuotes] = useState(externalQuotes || []);
  const [loading, setLoading] = useState(externalLoading || true);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [showQuoteDetail, setShowQuoteDetail] = useState(false);
  const [detailQuote, setDetailQuote] = useState(null);
  const itemsPerPage = 8;
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [acceptingQuoteId, setAcceptingQuoteId] = useState(null);
  const [rejectingQuoteId, setRejectingQuoteId] = useState(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  // In your fetchQuotes function
  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('api/health/health-insurance-quotes/');
      
      console.log('📦 بيانات الاقتباسات الواردة:', response.data);
      
      if (response.data.length > 0) {
        const firstQuote = response.data[0];
        console.log('🔍 هيكل الاقتباس الأول:', {
          id: firstQuote.id,
          status: firstQuote.status,
          quote_number: firstQuote.quote_number
        });
      }
      
      setQuotes(response.data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Updated handleAcceptClick function
  const handleAcceptClick = async (quote) => {
    try {
      setAcceptingQuoteId(quote.id);
      
      console.log('🎯 قبول الاقتباس:', {
        quoteId: quote.id,
        quoteNumber: quote.quote_number,
        currentStatus: quote.status,
        endpoint: `/api/health/health-insurance-quotes/${quote.id}/accept/`
      });
      
      // Check if quote is in acceptable state
      if (!['quoted', 'pending'].includes(quote.status)) {
        alert(`❌ لا يمكن قبول الاقتباس في حالة "${quote.status}". يجب أن يكون في حالة "مقتبس" أو "قيد المراجعة"`);
        setAcceptingQuoteId(null);
        return;
      }
      
      // تأكيد من المستخدم
      if (!window.confirm(`هل تريد قبول اقتباس ${quote.quote_number} وإنشاء وثيقة تأمين؟`)) {
        setAcceptingQuoteId(null);
        return;
      }
      
      // Add request data if needed (some endpoints require empty object)
      const requestData = {};
      
      console.log('📤 إرسال طلب القبول إلى السيرفر...');
      
      const response = await api.post(
        `/api/health/health-insurance-quotes/${quote.id}/accept/`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );
      
      console.log('✅ استجابة القبول:', response);
      
      if (response.data && (response.data.success || response.data.policy)) {
        const policyData = response.data.policy || response.data;
        
        alert(`✅ تم قبول الاقتباس بنجاح!\nرقم الوثيقة: ${policyData.policy_number || policyData.policy_number || 'تم الإنشاء'}`);
        
        // تحديث قائمة الاقتباسات
        await fetchQuotes();
        
        // إذا كان هناك دالة callback للقبول
        if (onQuoteAccepted) {
          onQuoteAccepted(policyData);
        }
        
        // إرسال حدث لتحديث الوثائق في HealthInsurance.js
        const event = new CustomEvent('quote-accepted', {
          detail: { 
            policy: policyData,
            quoteId: quote.id 
          }
        });
        window.dispatchEvent(event);
        
        // إرسال حدث لتغيير التبويب
        const tabEvent = new CustomEvent('change-tab', {
          detail: { tab: 'policies' }
        });
        window.dispatchEvent(tabEvent);
        
      } else {
        alert('❌ حدث خطأ أثناء قبول الاقتباس: ' + (response.data?.error || 'استجابة غير متوقعة من السيرفر'));
      }
    } catch (error) {
      console.error('❌ Error accepting quote:', error);
      
      // Enhanced error handling
      let errorMessage = 'حدث خطأ أثناء قبول الاقتباس';
      
      if (error.response) {
        console.error('📊 بيانات الخطأ من السيرفر:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
        if (error.response.status === 400) {
          // Check for common Django validation errors
          if (error.response.data) {
            if (typeof error.response.data === 'string') {
              errorMessage = error.response.data;
            } else if (error.response.data.error) {
              errorMessage = error.response.data.error;
            } else if (error.response.data.detail) {
              errorMessage = error.response.data.detail;
            } else if (error.response.data.non_field_errors) {
              errorMessage = error.response.data.non_field_errors.join(', ');
            } else if (typeof error.response.data === 'object') {
              // Try to extract validation errors
              const errors = Object.values(error.response.data).flat();
              errorMessage = errors.join(', ');
            }
          } else {
            errorMessage = 'بيانات غير صالحة أو مطلوبة';
          }
        } else if (error.response.status === 403) {
          errorMessage = 'ليس لديك صلاحية لقبول هذا الاقتباس';
        } else if (error.response.status === 404) {
          errorMessage = 'الاقتباس غير موجود';
        } else if (error.response.status === 409) {
          errorMessage = 'الاقتباس تم قبوله أو رفضه مسبقاً';
        }
      } else if (error.request) {
        console.error('🌐 تفاصيل الطلب:', error.request);
        errorMessage = 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت';
      } else {
        errorMessage = error.message;
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setAcceptingQuoteId(null);
      setShowAcceptModal(false);
    }
  };

  // دالة رفض الاقتباس المحسنة
  const handleRejectClick = async (quote) => {
    try {
      setRejectingQuoteId(quote.id);
      
      console.log('🚫 رفض الاقتباس:', quote.quote_number);
      
      // تأكيد من المستخدم
      if (!window.confirm(`هل تريد رفض اقتباس ${quote.quote_number}؟`)) {
        setRejectingQuoteId(null);
        return;
      }
      
      // إعداد بيانات الطلب
      const requestData = {};
      
      // فقط إذا كان هناك سبب مكتوب، أضفه
      if (rejectionReason && rejectionReason.trim() !== '') {
        requestData.rejection_reason = rejectionReason.trim();
      }
      
      console.log('📤 بيانات طلب الرفض:', requestData);
      
      const response = await api.post(`/api/health/health-insurance-quotes/${quote.id}/reject/`, requestData);
      
      console.log('✅ استجابة الرفض:', response.data);
      
      if (response.data.success) {
        alert('✅ تم رفض الاقتباس بنجاح!');
        
        // تحديث قائمة الاقتباسات
        await fetchQuotes();
        
        // إذا كان هناك دالة callback للرفض
        if (onQuoteRejected) {
          onQuoteRejected(quote.id);
        }
        
        // إعادة تعيين حقل سبب الرفض
        setRejectionReason('');
        
      } else {
        alert('❌ حدث خطأ أثناء رفض الاقتباس: ' + (response.data.error || ''));
      }
    } catch (error) {
      console.error('❌ Error rejecting quote:', error);
      
      // عرض تفاصيل الخطأ
      if (error.response) {
        console.error('📊 بيانات الخطأ:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
        let errorMessage = 'حدث خطأ أثناء رفض الاقتباس';
        
        if (error.response.status === 400) {
          errorMessage = 'خطأ في البيانات المرسلة. ';
          if (error.response.data) {
            if (typeof error.response.data === 'string') {
              errorMessage += error.response.data;
            } else if (error.response.data.error) {
              errorMessage += error.response.data.error;
            } else if (error.response.data.detail) {
              errorMessage += error.response.data.detail;
            } else if (typeof error.response.data === 'object') {
              errorMessage += JSON.stringify(error.response.data);
            }
          }
        } else if (error.response.status === 404) {
          errorMessage = 'الاقتباس غير موجود أو تم حذفه';
        } else if (error.response.status === 403) {
          errorMessage = 'ليس لديك صلاحية لرفض هذا الاقتباس';
        }
        
        alert(`❌ ${errorMessage}`);
      } else if (error.request) {
        alert('❌ لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت');
      } else {
        alert('❌ ' + error.message);
      }
    } finally {
      setRejectingQuoteId(null);
      setShowRejectModal(false);
    }
  };

  // دوال التأكيد
  const handleAcceptWithConfirmation = (quote) => {
    setSelectedQuote(quote);
    setShowAcceptModal(true);
  };

  const handleRejectWithConfirmation = (quote) => {
    setSelectedQuote(quote);
    setShowRejectModal(true);
  };

  // In your component where you handle quote acceptance
  const confirmAccept = async () => {
    if (!selectedQuote) return;
    
    try {
      setAcceptingQuoteId(selectedQuote.id);
      
      // Prepare the complete quote data for policy creation
      const completeQuoteData = {
        // Quote basic info
        id: selectedQuote.id,
        quote_number: selectedQuote.quote_number,
        insurance_type: selectedQuote.insurance_type,
        insurance_type_name: selectedQuote.insurance_type_name || getInsuranceTypeName(selectedQuote.insurance_type),
        
        // Company info (ensure it's included)
        company_id: selectedQuote.company_id,
        company: selectedQuote.company || {
          id: selectedQuote.company_id,
          name: selectedQuote.company_name || selectedQuote.company?.name || 'غير محدد',
          cr_number: selectedQuote.company?.cr_number,
          address: selectedQuote.company?.address,
          phone: selectedQuote.company?.phone,
          email: selectedQuote.company?.email,
          sector: selectedQuote.company?.sector,
          total_employees: selectedQuote.total_employees || selectedQuote.insured_employees_count || 0
        },
        
        // Premium info
        total_premium: parseFloat(selectedQuote.total_premium || 0),
        annual_premium: parseFloat(selectedQuote.annual_premium || selectedQuote.total_premium || 0),
        monthly_premium: parseFloat(selectedQuote.monthly_premium || (selectedQuote.total_premium / 12) || 0),
        
        // Employee and family data
        total_employees: selectedQuote.total_employees || selectedQuote.insured_employees_count || 0,
        insured_employees_count: selectedQuote.insured_employees_count || selectedQuote.total_employees || 0,
        
        // Family members data - extract from calculation_data or coverage_details
        family_members: selectedQuote.family_members || 
                      selectedQuote.calculation_data?.family_data || 
                      selectedQuote.coverage_details?.family_members || 
                      { spouses: 0, children: 0, parents: 0 },
        
        // Coverage details
        coverage_details: selectedQuote.coverage_details || {
          insurance_type: selectedQuote.insurance_type,
          coverage_options: selectedQuote.coverage_options || {},
          payment_method: selectedQuote.payment_method || 'annual',
          family_members: selectedQuote.family_members
        },
        
        // Calculation data
        calculation_data: selectedQuote.calculation_data || {},
        
        // Employees data
        employees_data: selectedQuote.employees_data || 
                      selectedQuote.calculation_data?.employees_data || 
                      [],
        
        // Other required fields
        status: 'accepted',
        created_at: selectedQuote.created_at || new Date().toISOString(),
        valid_until: selectedQuote.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: selectedQuote.notes || 'تم القبول من قبل المستخدم'
      };
      
      console.log("📤 إرسال بيانات الاقتباس الكاملة:", completeQuoteData);
      
      // Call API to accept quote and create policy
      const response = await api.post(
        `/api/health/health-insurance-quotes/${selectedQuote.id}/accept/`,
        completeQuoteData
      );
      
      if (response.data.success) {
        alert(`✅ تم قبول الاقتباس وإنشاء الوثيقة رقم: ${response.data.policy_number}`);
        
        // Refresh quotes list
        fetchQuotes();
        
        // Close modal
        setShowAcceptModal(false);
        
        // Navigate to policies page
        navigate('/api/health/health-insurance-policies');
      } else {
        throw new Error(response.data.error || 'فشل في قبول الاقتباس');
      }
      
    } catch (error) {
      console.error("❌ خطأ في قبول الاقتباس:", error);
      alert(`❌ فشل قبول الاقتباس: ${error.message}`);
    } finally {
      setAcceptingQuoteId(null);
    }
  };

  // Helper function to get insurance type name
  const getInsuranceTypeName = (type) => {
    const typeNames = {
      'A': 'التغطية الشاملة',
      'B': 'التغطية القياسية',
      'C': 'التغطية الأساسية'
    };
    return typeNames[type] || `النوع ${type}`;
  };

  const confirmReject = async () => {
    if (!selectedQuote) return;
    await handleRejectClick(selectedQuote);
  };

  const handleDownloadQuote = async (quote) => {
    try {
      const response = await api.get(`api/health/health-insurance-quotes/${quote.id}/pdf/`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quote-${quote.quote_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('⚠️ جاري تطوير ميزة تحميل PDF');
    }
  };

  const handlePrintQuote = (quote) => {
    window.open(`api/health/health-insurance-quotes/${quote.id}/print`, '_blank');
  };

  const handleViewQuoteDetail = (quote) => {
    setDetailQuote(quote);
    setShowQuoteDetail(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'draft': { label: 'مسودة', color: 'secondary', icon: '📝' },
      'pending': { label: 'قيد المراجعة', color: 'warning', icon: '⏳' },
      'quoted': { label: 'مقتبس', color: 'primary', icon: '💰' },
      'accepted': { label: 'مقبول', color: 'success', icon: '✅' },
      'rejected': { label: 'مرفوض', color: 'danger', icon: '❌' },
      'expired': { label: 'منتهي', color: 'dark', icon: '⌛' }
    };
    
    const config = statusConfig[status] || { label: status, color: 'secondary', icon: '❓' };
    return (
      <Badge bg={config.color} className="status-badge">
        <span className="me-1">{config.icon}</span>
        {config.label}
      </Badge>
    );
  };

  const getQuoteData = (quote) => {
    console.log('🔍 معالجة الاقتباس:', {
      id: quote.id,
      policy_number: quote.policy_number,
      all_keys: Object.keys(quote)
    });
    const paymentMethod = quote.coverage_details?.payment_method || 
                        quote.payment_method || 
                        'annual';
    
    const familyMembers = quote.coverage_details?.family_members || 
                          quote.calculation_data?.family_data || 
                          { spouses: 0, children: 0, parents: 0 };
    
    const insuranceTypeData = quote.coverage_details?.insurance_type_data || 
                            { base_rate: 1500, name: 'التغطية الشاملة' };
    
    const totalEmployees = quote.insured_employees_count || 
                          (quote.calculation_data?.family_data?.details || []).length || 
                          0;
    
    let notesData = {};
    try {
      if (quote.notes && typeof quote.notes === 'string') {
        if (quote.notes.trim().startsWith('{') || quote.notes.trim().startsWith('[')) {
          notesData = JSON.parse(quote.notes);
        } else {
          notesData = { text: quote.notes };
        }
      } else if (quote.notes && typeof quote.notes === 'object') {
        notesData = quote.notes;
      }
    } catch (error) {
      console.warn('⚠️ خطأ في تحليل notes:', error);
      notesData = { text: quote.notes || '', error: 'parse_failed' };
    }
    
    return {
      id: quote.id,
      quote_number: quote.quote_number || `QUOTE-${quote.id}`,
      company_name: quote.company_name || "غير محدد",
      company_id: quote.company,
      total_employees: totalEmployees,
      insurance_type: quote.insurance_type || 'A',
      insurance_type_name: quote.insurance_type_name || insuranceTypeData.name,
      payment_method: paymentMethod,
      total_premium: parseFloat(quote.total_premium || 0),
      annual_premium: parseFloat(quote.annual_premium || quote.total_premium || 0),
      monthly_premium: parseFloat(quote.monthly_premium || 0),
      base_premium: parseFloat(quote.base_premium || 0),
      family_members: {
        spouses: familyMembers.spouses || 0,
        children: familyMembers.children || 0,
        parents: familyMembers.parents || 0
      },
      calculation_data: quote.calculation_data || {},
      coverage_details: quote.coverage_details || {},
      status: quote.status || 'pending',
      valid_until: quote.valid_until,
      created_at: quote.created_at,
      notes: notesData,
      calculated_in_frontend: quote.calculated_in_frontend || false
    };
  };

  const getCoverageTypeName = (code) => {
    const coverageTypes = {
      'A': 'التغطية الشاملة',
      'B': 'تغطية الموظفين فقط',
      'C': 'التغطية الأساسية',
      'comprehensive': 'التغطية الشاملة',
      'basic': 'التغطية الأساسية',
      'employee_only': 'تغطية الموظفين فقط'
    };
    return coverageTypes[code] || `خطة ${code}`;
  };

  const getPaymentMethodName = (method) => {
    const paymentMethods = {
      'annual': 'دفع سنوي',
      'semiAnnual': 'دفع نصف سنوي',
      'quarterly': 'دفع ربع سنوي',
      'monthly': 'دفع شهري',
      'yearly': 'سنوي',
      'half_year': 'نصف سنوي',
      'quarter': 'ربع سنوي',
      'month': 'شهري'
    };
    return paymentMethods[method] || method;
  };

  const getPaymentInfo = (totalPremium, paymentMethod) => {
    const annual = parseFloat(totalPremium || 0);
    
    const multipliers = {
      'annual': 1.0,
      'semiAnnual': 1.05,
      'quarterly': 1.10,
      'monthly': 1.15,
      'yearly': 1.0,
      'half_year': 1.05,
      'quarter': 1.10,
      'month': 1.15
    };
    
    const multiplier = multipliers[paymentMethod] || 1.0;
    const adjustedPremium = annual * multiplier;
    
    return {
      annual: annual,
      adjusted: adjustedPremium,
      monthly: paymentMethod === 'monthly' || paymentMethod === 'month' 
        ? adjustedPremium 
        : Math.round(adjustedPremium / 12),
      quarterly: paymentMethod === 'quarterly' || paymentMethod === 'quarter'
        ? adjustedPremium
        : Math.round(adjustedPremium / 4),
      semiAnnual: paymentMethod === 'semiAnnual' || paymentMethod === 'half_year'
        ? adjustedPremium
        : Math.round(adjustedPremium / 2),
      multiplier: multiplier
    };
  };

  const QuoteCard = ({ quote }) => {
    const quoteData = getQuoteData(quote);
    const paymentInfo = getPaymentInfo(quoteData.total_premium, quoteData.payment_method);
    const coverageTypeName = quoteData.insurance_type_name;
    
    console.log('🔍 حالة الاقتباس في الكارد:', quoteData.status);
    console.log('🔍 رقم الاقتباس:', quoteData.quote_number);
    
    return (
      <Card className="quote-card">
        <Card.Header className="quote-card-header">
          <div className="quote-card-header1 d-flex justify-content-between align-items-start">
            <div>
              <Badge bg="primary" className="quote-number">
                #{quoteData.quote_number}
              </Badge>
            </div>
            <div className="text-end">
              {getStatusBadge(quoteData.status)}
              {quoteData.valid_until && (
                <div className="valid-until mt-1">
                  <small>
                    <FaCalendarAlt className="me-1" /> صالح لغاية
                    {new Date(quoteData.valid_until).toLocaleDateString('ar-SA')}
                  </small>
                </div>
              )}
            </div>
          </div>
        </Card.Header>
        
        <Card.Body>
          {/* معلومات الشركة */}
          <div className="company-section mb-3">
            <h6 className="section-title">
              <FaBuilding className="me-2" />
              معلومات الشركة
            </h6>
            <div className="company-details">
              <div className="detail-item1">
                <span className="detail-label">اسم الشركة:</span>
                <span className="detail-value">{quoteData.company_name}</span>
              </div>
              <div className="detail-item1">
                <span className="detail-label">رقم الشركة:</span>
                <span className="detail-value">{quoteData.company_id}</span>
              </div>
              <div className="detail-item1">
                <span className="detail-label">عدد الموظفين:</span>
                <span className="detail-value">{quoteData.total_employees}</span>
              </div>
              <div className="detail-item1">
                <span className="detail-label">نوع التغطية:</span>
                <span className="detail-value">{coverageTypeName}</span>
              </div>
            </div>
          </div>
          
          {/* نطاق التغطية */}
          <div className="coverage-section">
            <h6 className="section-title">
              <FaClipboardCheck className="me-2" />
              نطاق التغطية
            </h6>
            <div className="coverage-scope">
              <div className="coverage-item included">
                <FaUsers className="coverage-icon" />
                <div className="coverage-details1">
                  <div className="coverage-main">
                    <span className="coverage-text">الموظفون</span>
                    <Badge bg="success" pill>✓</Badge>
                  </div>
                  <div className="coverage-info">
                    <small className="count">العدد: {quoteData.total_employees}</small>
                    <small className="percentage">النسبة: 100%</small>
                  </div>
                </div>
              </div>
              
              <div className="coverage-item included">
                <FaUser className="coverage-icon" />
                <div className="coverage-details1">
                  <div className="coverage-main">
                    <span className="coverage-text">الزوجات</span>
                    <Badge bg="success" pill>✓</Badge>
                  </div>
                  <div className="coverage-info">
                    <small className="count">العدد: {quoteData.family_members.spouses}</small>
                    <small className="percentage">النسبة: 50%</small>
                  </div>
                </div>
              </div>
              
              <div className="coverage-item included">
                <FaChild className="coverage-icon" />
                <div className="coverage-details1">
                  <div className="coverage-main">
                    <span className="coverage-text">الأبناء</span>
                    <Badge bg="success" pill>✓</Badge>
                  </div>
                  <div className="coverage-info">
                    <small className="count">العدد: {quoteData.family_members.children}</small>
                    <small className="percentage">النسبة: 50%</small>
                  </div>
                </div>
              </div>
              
              <div className="coverage-item included">
                <FaUsersCog className="coverage-icon" />
                <div className="coverage-details1">
                  <div className="coverage-main">
                    <span className="coverage-text">الوالدان</span>
                    <Badge bg="success" pill>✓</Badge>
                  </div>
                  <div className="coverage-info">
                    <small className="count">العدد: {quoteData.family_members.parents}</small>
                    <small className="percentage">النسبة: 30%</small>
                    <small className="note">(بشروط خاصة)</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* خيار الدفع */}
          <div className="payment-section">
            <h6 className="section-title">
              <FaCreditCard className="me-2" />
              خيار الدفع
            </h6>
            <div className="payment-details">
              <div className="payment-item">
                <span className="payment-label">الطريقة:</span>
                <span className="payment-value">
                  {getPaymentMethodName(quoteData.payment_method)}
                </span>
              </div>
              <div className="payment-item">
                <span className="payment-label">القسط السنوي الأساسي:</span>
                <span className="payment-value text-primary">
                  {quoteData.base_premium.toLocaleString()} دولار
                </span>
              </div>
              <div className="payment-item">
                <span className="payment-label">القسط بعد الضريبة:</span>
                <span className="payment-value text-success">
                  {paymentInfo.adjusted.toLocaleString()} دولار
                </span>
              </div>
              {paymentInfo.multiplier > 1 && (
                <div className="payment-item">
                  <span className="payment-label">نسبة الزيادة:</span>
                  <span className="payment-value text-warning">
                    +{((paymentInfo.multiplier - 1) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* التكلفة */}
          <div className="financial-section">
            <h6 className="section-title">
              <FaDollarSign className="me-2" />
              التكلفة
            </h6>
            <div className="financial-details">
              <div className="financial-item">
                <div className="financial-label">القسط السنوي النهائي:</div>
                <div className="financial-value text-success">
                  <strong>{quoteData.total_premium.toLocaleString()} دولار</strong>
                </div>
              </div>
              
              {quoteData.payment_method === 'monthly' && (
                <div className="financial-item">
                  <div className="financial-label">قسط شهري:</div>
                  <div className="financial-value text-primary">
                    <strong>{paymentInfo.monthly.toLocaleString()} دولار</strong>
                  </div>
                </div>
              )}
              
              {quoteData.payment_method === 'quarterly' && (
                <div className="financial-item">
                  <div className="financial-label">قسط ربع سنوي:</div>
                  <div className="financial-value text-info">
                    <strong>{paymentInfo.quarterly.toLocaleString()} دولار</strong>
                  </div>
                </div>
              )}
              
              {quoteData.payment_method === 'semiAnnual' && (
                <div className="financial-item">
                  <div className="financial-label">قسط نصف سنوي:</div>
                  <div className="financial-value text-warning">
                    <strong>{paymentInfo.semiAnnual.toLocaleString()} دولار</strong>
                  </div>
                </div>
              )}
              
              {quoteData.payment_method === 'annual' && (
                <div className="financial-item">
                  <div className="financial-label">قسط سنوي:</div>
                  <div className="financial-value text-success">
                    <strong>{paymentInfo.adjusted.toLocaleString()} دولار</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card.Body>
        
        <Card.Footer className="quote-card-footer">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleViewQuoteDetail(quote)}
                title="عرض التفاصيل"
              >
                <FaEye className="me-1" /> عرض التفاصيل
              </Button>
            </div>
            
            <div className="d-flex align-items-center">
              {/* عرض زر القبول فقط إذا كان الاقتباس في حالة 'quoted' أو 'pending' */}
              {(quoteData.status === 'quoted' || quoteData.status === 'pending') && (
                <>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleAcceptWithConfirmation(quote)}
                    className="ms-2"
                    title="قبول الاقتباس"
                    disabled={acceptingQuoteId === quote.id || rejectingQuoteId === quote.id}
                  >
                    {acceptingQuoteId === quote.id ? (
                      <>
                        <Spinner size="sm" className="me-1" />
                        جاري القبول...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="me-1" /> قبول
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleRejectWithConfirmation(quote)}
                    className="ms-2"
                    title="رفض الاقتباس"
                    disabled={acceptingQuoteId === quote.id || rejectingQuoteId === quote.id}
                  >
                    {rejectingQuoteId === quote.id ? (
                      <>
                        <Spinner size="sm" className="me-1" />
                        جاري الرفض...
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="me-1" /> رفض
                      </>
                    )}
                  </Button>
                </>
              )}
              
              {/* إذا كان الاقتباس مقبولاً أو مرفوضاً، عرض البادج فقط */}
              {quoteData.status === 'accepted' && (
                <Badge bg="success" className="ms-2 p-2">
                  <FaCheckCircle className="me-1" /> تم القبول
                </Badge>
              )}
              
              {quoteData.status === 'rejected' && (
                <Badge bg="danger" className="ms-2 p-2">
                  <FaTimesCircle className="me-1" /> تم الرفض
                </Badge>
              )}
            </div>
          </div>
        </Card.Footer>
      </Card>
    );
  };

  const QuoteTableRow = ({ quote }) => {
    const quoteData = getQuoteData(quote);
    
    return (
      <tr>
        <td>
          <div className="d-flex align-items-center">
            <Badge bg="primary" className="me-2">
              #{quoteData.quote_number}
            </Badge>
            <div>
              <div><strong>{quoteData.company_name}</strong></div>
              <small className="text-muted">{quoteData.insurance_type_name}</small>
            </div>
          </div>
        </td>
        <td>{quoteData.total_employees}</td>
        <td>
          <div className="text-success">
            <strong>{quoteData.total_premium.toLocaleString()} دولار</strong>
          </div>
          <small className="text-primary">
            {quoteData.monthly_premium.toLocaleString()} دولار/شهر
          </small>
        </td>
        <td>
          <div className="d-flex align-items-center">
            {getStatusBadge(quoteData.status)}
            {quoteData.valid_until && (
              <small className="ms-2">
                <FaCalendarAlt className="me-1" />
                {new Date(quoteData.valid_until).toLocaleDateString('ar-SA')}
              </small>
            )}
          </div>
        </td>
        <td>
          <div className="d-flex gap-2">
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => handleViewQuoteDetail(quote)}
              title="عرض التفاصيل"
            >
              <FaEye />
            </Button>
            
            {(quoteData.status === 'quoted' || quoteData.status === 'pending') && (
              <>
                <Button
                  size="sm"
                  variant="outline-success"
                  onClick={() => handleAcceptWithConfirmation(quote)}
                  title="قبول الاقتباس"
                  disabled={acceptingQuoteId === quote.id || rejectingQuoteId === quote.id}
                >
                  {acceptingQuoteId === quote.id ? (
                    <Spinner size="sm" />
                  ) : (
                    <FaCheckCircle />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => handleRejectWithConfirmation(quote)}
                  title="رفض الاقتباس"
                  disabled={acceptingQuoteId === quote.id || rejectingQuoteId === quote.id}
                >
                  {rejectingQuoteId === quote.id ? (
                    <Spinner size="sm" />
                  ) : (
                    <FaTimesCircle />
                  )}
                </Button>
              </>
            )}
            
            {/* <Dropdown>
              <Dropdown.Toggle
                size="sm"
                variant="outline-secondary"
                id="dropdown-actions"
              >
                ...
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleDownloadQuote(quote)}>
                  <FaFileDownload className="me-2" />
                  تحميل PDF
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handlePrintQuote(quote)}>
                  <FaPrint className="me-2" />
                  طباعة
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown> */}
          </div>
        </td>
      </tr>
    );
  };

  const QuoteDetailModal = () => {
    if (!detailQuote) return null;
    const quoteData = getQuoteData(detailQuote);

    return (
      <Modal 
        show={showQuoteDetail} 
        onHide={() => setShowQuoteDetail(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaFileMedical className="me-2" />
            عرض سعر تأمين صحي - #{quoteData.quote_number}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Row className="mb-4">
            <Col md={6}>
              <Card className="h-100">
                <Card.Header>👥 معلومات الشركة</Card.Header>
                <Card.Body>
                  <p><strong>اسم الشركة:</strong> {quoteData.company_name}</p>
                  <p><strong>عدد الموظفين:</strong> {quoteData.total_employees}</p>
                  <p><strong>الخطة المختارة:</strong> {quoteData.insurance_type_name}</p>
                  <p><strong>تاريخ الإنشاء:</strong> {new Date(quoteData.created_at).toLocaleDateString('ar-SA')}</p>
                  <p><strong>الحالة:</strong> {getStatusBadge(quoteData.status)}</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="h-100">
                <Card.Header>💰 التكلفة</Card.Header>
                <Card.Body className="text-center">
                  <h1 className="text-success">
                    {quoteData.total_premium.toLocaleString()} دولار
                  </h1>
                  <p className="text-muted">القسط السنوي الإجمالي</p>
                  <h3 className="text-primary">
                    {quoteData.monthly_premium.toLocaleString()} دولار
                  </h3>
                  <p className="text-muted">قسط شهري</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* نطاق التغطية */}
          <Card className="mb-4">
            <Card.Header>📌 نطاق التغطية</Card.Header>
            <Card.Body>
              <div className="coverage-details">
                <div className="coverage-scope">
                  {quoteData.family_members.spouses > 0 && (
                    <div className="coverage-item included">
                      <FaUser className="coverage-icon" />
                      <div className="coverage-details1">
                        <div className="coverage-main">
                          <span className="coverage-text">الزوجات</span>
                          <Badge bg="success" pill>✓</Badge>
                        </div>
                        <div className="coverage-info">
                          <small className="count">العدد: {quoteData.family_members.spouses}</small>
                          <small className="percentage">النسبة: 50%</small>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {quoteData.family_members.children > 0 && (
                    <div className="coverage-item included">
                      <FaChild className="coverage-icon" />
                      <div className="coverage-details1">
                        <div className="coverage-main">
                          <span className="coverage-text">الأبناء</span>
                          <Badge bg="success" pill>✓</Badge>
                        </div>
                        <div className="coverage-info">
                          <small className="count">العدد: {quoteData.family_members.children}</small>
                          <small className="percentage">النسبة: 50%</small>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {quoteData.family_members.parents > 0 && (
                    <div className="coverage-item included">
                      <FaUsersCog className="coverage-icon" />
                      <div className="coverage-details1">
                        <div className="coverage-main">
                          <span className="coverage-text">الوالدان</span>
                          <Badge bg="success" pill>✓</Badge>
                        </div>
                        <div className="coverage-info">
                          <small className="count">العدد: {quoteData.family_members.parents}</small>
                          <small className="percentage">النسبة: 30%</small>
                          <small className="note">(بشروط خاصة)</small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="coverage-notes mt-3">
                  <Alert variant="info">
                    <FaExclamationTriangle className="me-2" />
                    <strong>ملاحظات:</strong>
                    <ul className="mb-0 mt-2">
                      <li>تخضع جميع التغطيات للشروط والأحكام العامة</li>
                      <li>نسب التحمل الداخلي والخارجي وفق خطة التغطية المختارة</li>
                      <li>الوالدان مشمولون في الخطة A فقط بشروط خاصة</li>
                      <li>جميع الأسعار بالدولار الأمريكي</li>
                    </ul>
                  </Alert>
                </div>
              </div>
            </Card.Body>
          </Card>
          
          {/* الملاحظات القانونية */}
          <Card className="mb-4">
            <Card.Header>⚖️ ملاحظات قانونية</Card.Header>
            <Card.Body>
              <Alert variant="warning">
                <h6>⚠️ يرجى الانتباه:</h6>
                <ul className="mb-0">
                  <li>هذا العرض تقديري وغير ملزم قانونيًا</li>
                  <li>يخضع للموافقة النهائية من شركة التأمين</li>
                  <li>يعتمد السعر على البيانات المقدّمة والتي قد تخضع للتحقق</li>
                  <li>جميع الأسعار بالدولار الأمريكي ولا تشمل الضرائب</li>
                  <li>هذا العرض صالح لمدة 15 يوم من تاريخ الإنشاء</li>
                </ul>
              </Alert>
            </Card.Body>
          </Card>
        </Modal.Body>
        
        <Modal.Footer className="d-flex justify-content-between">
          <div>
            <Button
              variant="outline-primary"
              onClick={() => handleDownloadQuote(detailQuote)}
            >
              <FaFileDownload className="me-2" /> تحميل PDF
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => handlePrintQuote(detailQuote)}
              className="ms-2"
            >
              <FaPrint className="me-2" /> طباعة
            </Button>
          </div>
          
          <div>
            {(quoteData.status === 'quoted' || quoteData.status === 'pending') && (
              <>
                <Button
                  variant="success"
                  onClick={() => {
                    setShowQuoteDetail(false);
                    handleAcceptWithConfirmation(detailQuote);
                  }}
                  className="ms-2"
                >
                  <FaCheckCircle className="me-2" /> قبول العرض
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => {
                    setShowQuoteDetail(false);
                    handleRejectWithConfirmation(detailQuote);
                  }}
                  className="ms-2"
                >
                  <FaTimesCircle className="me-2" /> رفض
                </Button>
              </>
            )}
            <Button
              variant="secondary"
              onClick={() => setShowQuoteDetail(false)}
              className="ms-2"
            >
              إغلاق
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  };

  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      const quoteData = getQuoteData(quote);
      const matchesSearch = 
        quoteData.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quoteData.company_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || quoteData.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [quotes, searchTerm, filterStatus]);

  const sortedQuotes = useMemo(() => {
    return [...filteredQuotes].sort((a, b) => {
      const aData = getQuoteData(a);
      const bData = getQuoteData(b);
      
      let aValue = aData[sortField];
      let bValue = bData[sortField];
      
      if (sortField.includes('premium')) {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredQuotes, sortField, sortDirection]);

  const paginatedQuotes = useMemo(() => {
    return sortedQuotes.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedQuotes, currentPage]);

  const totalPages = Math.ceil(sortedQuotes.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">جاري تحميل الاقتباسات...</p>
      </div>
    );
  }

  return (
    <div className="health-insurance-quotes">
      {/* شريط التحكم */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="ابحث برقم الاقتباس أو اسم الشركة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            
            <Col md={3}>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">جميع الحالات</option>
                <option value="draft">مسودة</option>
                <option value="pending">قيد المراجعة</option>
                <option value="quoted">مقتبس</option>
                <option value="accepted">مقبول</option>
                <option value="rejected">مرفوض</option>
                <option value="expired">منتهي</option>
              </Form.Select>
            </Col>
            
            <Col md={3}>
              <div className="d-flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('grid')}
                  size="sm"
                >
                  <FaEye className="me-1" /> بطاقات
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('table')}
                  size="sm"
                >
                  <FaSort className="me-1" /> جدول
                </Button>
              </div>
            </Col>
            
            {/* <Col md={2} className="text-end">
              <span className="text-muted">
                {filteredQuotes.length} اقتباس
              </span>
            </Col> */}
          </Row>
        </Card.Body>
      </Card>

      {/* عرض الاقتباسات */}
      {filteredQuotes.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <FaFileMedical size={48} className="text-muted mb-3" />
            <h5>لا توجد اقتباسات</h5>
            <p className="text-muted mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'لم يتم العثور على اقتباسات تطابق معايير البحث'
                : 'ابدأ بإنشاء اقتباسك الأول'
              }
            </p>
            {onRefresh && (
              <Button variant="primary" onClick={onRefresh}>
                🔄 تحديث
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : viewMode === 'grid' ? (
        <>
          <Row>
            {paginatedQuotes.map((quote) => (
              <Col key={quote.id} lg={6} xl={4} className="mb-4">
                <QuoteCard quote={quote} />
              </Col>
            ))}
          </Row>
          
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                />
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === currentPage}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                />
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <Card>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('quote_number')}>
                      الاقتباس {getSortIcon('quote_number')}
                    </th>
                    <th>الموظفين</th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('total_premium')}>
                      القسط {getSortIcon('total_premium')}
                    </th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
                      الحالة {getSortIcon('status')}
                    </th>
                    <th className="text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedQuotes.map((quote) => (
                    <QuoteTableRow key={quote.id} quote={quote} />
                  ))}
                </tbody>
              </Table>
            </div>
            
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
          </Card.Body>
        </Card>
      )}

      {/* Modal تأكيد قبول الاقتباس */}
      <Modal show={showAcceptModal} onHide={() => setShowAcceptModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>تأكيد قبول الاقتباس</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuote && (
            <>
              <Alert variant="info">
                <h6>هل تريد قبول هذا الاقتباس؟</h6>
                <p className="mb-0">
                  رقم الاقتباس: <strong>#{selectedQuote.quote_number}</strong>
                </p>
                <p className="mb-0">
                  نوع التأمين: <strong>{getInsuranceTypeName(selectedQuote.insurance_type)}</strong>
                </p>
              </Alert>
              
              <div className="p-3 bg-light rounded mb-3">
                <h6>تفاصيل الاقتباس:</h6>
                <div className="row">
                  <div className="col-md-6">
                    <small className="text-muted">الشركة:</small>
                    <p>
                      <strong>
                        {selectedQuote.company?.name || 
                        selectedQuote.company_name || 
                        selectedQuote.company_details?.name || 
                        "غير محدد"}
                      </strong>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">القسط السنوي:</small>
                    <p className="text-success">
                      <strong>
                        {parseFloat(selectedQuote.total_premium || selectedQuote.annual_premium || 0).toLocaleString()} دولار
                      </strong>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">عدد الموظفين:</small>
                    <p>
                      <strong>
                        {selectedQuote.total_employees || 
                        selectedQuote.insured_employees_count || 
                        selectedQuote.calculation_data?.total_employees || 
                        0}
                      </strong>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">أفراد العائلة:</small>
                    <p>
                      <strong>
                        {(() => {
                          const family = selectedQuote.family_members || 
                                        selectedQuote.calculation_data?.family_members ||
                                        selectedQuote.coverage_details?.family_members;
                          if (family) {
                            const total = (family.spouses || 0) + (family.children || 0) + (family.parents || 0);
                            return total > 0 ? `${total} فرد` : 'لا يوجد';
                          }
                          return 'لا يوجد';
                        })()}
                      </strong>
                    </p>
                  </div>
                </div>
                
                {/* Display family details */}
                {selectedQuote.family_members || selectedQuote.calculation_data?.family_data ? (
                  <div className="mt-3 p-2 bg-white rounded border">
                    <h6 className="mb-2">تفاصيل العائلة:</h6>
                    <div className="row small">
                      <div className="col-4">
                        <span className="text-muted">الزوجات:</span>
                        <span className="ms-1 fw-bold">
                          {selectedQuote.family_members?.spouses || 
                          selectedQuote.calculation_data?.family_data?.spouses || 0}
                        </span>
                      </div>
                      <div className="col-4">
                        <span className="text-muted">الأبناء:</span>
                        <span className="ms-1 fw-bold">
                          {selectedQuote.family_members?.children || 
                          selectedQuote.calculation_data?.family_data?.children || 0}
                        </span>
                      </div>
                      <div className="col-4">
                        <span className="text-muted">الوالدين:</span>
                        <span className="ms-1 fw-bold">
                          {selectedQuote.family_members?.parents || 
                          selectedQuote.calculation_data?.family_data?.parents || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              
              <Alert variant="warning">
                <h6>ملاحظة:</h6>
                <ul className="mb-0">
                  <li>سيتم إنشاء وثيقة تأمين جديدة تحتوي على جميع بيانات الموظفين والعائلة</li>
                  <li>ستحتوي الوثيقة على 8 مواد قانونية كاملة</li>
                  <li>سيتم إرسال إشعار بالبريد الإلكتروني</li>
                  <li>يمكنك الوصول إلى الوثيقة من تبويب "الوثائق"</li>
                </ul>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAcceptModal(false)}>
            إلغاء
          </Button>
          <Button 
            variant="success" 
            onClick={confirmAccept}
            disabled={acceptingQuoteId === selectedQuote?.id}
          >
            {acceptingQuoteId === selectedQuote?.id ? (
              <>
                <Spinner size="sm" className="me-1" />
                جاري إنشاء الوثيقة...
              </>
            ) : (
              <>
                <FaCheckCircle className="me-1" />
                نعم، قبول وإنشاء الوثيقة
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal تأكيد رفض الاقتباس */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>تأكيد رفض الاقتباس</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuote && (
            <>
              <Alert variant="warning">
                <h6>هل تريد رفض هذا الاقتباس؟</h6>
                <p className="mb-0">
                  رقم الاقتباس: <strong>#{selectedQuote.quote_number}</strong>
                </p>
              </Alert>
              
              <div className="mb-3">
                <label className="form-label">سبب الرفض (اختياري):</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  placeholder="أدخل سبب رفض الاقتباس..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                ></textarea>
              </div>
              
              <Alert variant="info">
                <h6>ملاحظة:</h6>
                <ul className="mb-0">
                  <li>لا يمكن التراجع عن رفض الاقتباس</li>
                  <li>يمكنك طلب اقتباس جديد إذا لزم الأمر</li>
                  <li>البيانات ستظل محفوظة للرجوع إليها</li>
                </ul>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            إلغاء
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmReject}
            disabled={rejectingQuoteId === selectedQuote?.id}
          >
            {rejectingQuoteId === selectedQuote?.id ? (
              <>
                <Spinner size="sm" className="me-1" />
                جاري الرفض...
              </>
            ) : (
              <>
                <FaTimesCircle className="me-1" />
                نعم، رفض الاقتباس
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* مودال عرض التفاصيل */}
      <QuoteDetailModal />
    </div>
  );
};

export default HealthInsuranceQuotes;