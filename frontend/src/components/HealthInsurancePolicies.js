// src/components/HealthInsurancePolicies.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Badge,
  Alert,
  Spinner,
  InputGroup,
  Form,
  ProgressBar,
  Dropdown,
  Modal,
  Row,
  Col,
  Pagination,
  Tabs,
  Tab,
  Container
} from 'react-bootstrap';
import {
  FaFileContract,
  FaEye,
  FaDownload,
  FaPrint,
  FaFilePdf,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaSearch,
  FaFilter,
  FaSync,
  FaClock,
  FaCheckCircle,
  FaArrowLeft,
  FaEnvelope,
  FaUsers,
  FaBuilding,
  FaDollarSign,
  FaClipboardCheck,
  FaEllipsisH,
  FaInfoCircle,
  FaCopy,
  FaShieldAlt,
  FaUser,
  FaChild,
  FaDatabase,
  FaTimes
} from 'react-icons/fa';
import PolicyPdfWithSave from './PolicyPdfWithSave';
import api from '../services/api';
import './HealthInsurancePolicies.css';

const HealthInsurancePolicies = ({ 
  onViewPolicy, 
  policies: externalPolicies, 
  loading: externalLoading,
  onRefresh,
  isStandalone = false,
  companyId = null 
}) => {
  const [policies, setPolicies] = useState(externalPolicies || []);
  const [filteredPolicies, setFilteredPolicies] = useState(externalPolicies || []);
  const [loading, setLoading] = useState(externalLoading || true);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateHtml, setCertificateHtml] = useState('');
  const [showPolicyDetail, setShowPolicyDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [policyDetail, setPolicyDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPolicyForPdf, setSelectedPolicyForPdf] = useState(null);
  const itemsPerPage = 10;

  // ========== التأثيرات ==========
  useEffect(() => {
    console.log('🚀 HealthInsurancePolicies component loaded');
    
    if (isStandalone || (!externalPolicies && !externalLoading)) {
      fetchPolicies();
    } else {
      setPolicies(externalPolicies || []);
      setFilteredPolicies(externalPolicies || []);
      setLoading(externalLoading || false);
    }
  }, [externalPolicies, externalLoading, isStandalone]);

  // تصفية البيانات عند تغيير البحث أو الحالة
  useEffect(() => {
    filterPolicies();
  }, [searchTerm, filterStatus, policies]);

  const viewMode = 'grid';
  
  // ========== دوال البيانات ==========
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      console.log('🚀 HealthInsurancePolicies - جلب البيانات من API...');
      
      let url = '/api/health/health-insurance-policies/';
      if (companyId) {
        url = `/api/health/companies/${companyId}/policies/`;
      }
      
      url += '?expand=quote,company';
      
      console.log('🌐 طلب URL:', url);
      
      const response = await api.get(url);
      console.log('✅ استجابة API كاملة:', response);
      console.log('📊 بيانات الاستجابة:', response.data);
      
      if (!response.data) {
        console.error('❌ الاستجابة لا تحتوي على data');
        setPolicies([]);
        setFilteredPolicies([]);
        return;
      }
      
      console.log('🔢 عدد الوثائق المستلمة:', response.data.length);
      
      if (response.data.length > 0) {
        const firstPolicy = response.data[0];
        console.log('🔍 تفاصيل الوثيقة الأولى:', {
          id: firstPolicy.id,
          policy_number: firstPolicy.policy_number,
          company_name: firstPolicy.company_name,
          status: firstPolicy.status,
          total_premium: firstPolicy.total_premium,
          has_quote: !!firstPolicy.quote,
          has_company: !!firstPolicy.company,
          all_keys: Object.keys(firstPolicy) // Show all available keys
        });
        
        // ✅ ADD THIS: Log the exact structure
        console.log('📋 هيكل الوثيقة الكامل:', JSON.stringify(firstPolicy, null, 2));
      } else {
        console.log('ℹ️ لا توجد وثائق متاحة في الاستجابة');
      }
      
      setPolicies(response.data);
      setFilteredPolicies(response.data);
      
    } catch (error) {
      console.error('❌ خطأ في جلب البيانات:', error);
      // ... rest of error handling
    } finally {
      setLoading(false);
    }
  };

  const filterPolicies = () => {
    let results = policies;
    
    // تصفية حسب البحث
    if (searchTerm) {
      results = results.filter(policy =>
        policy.policy_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (policy.company?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (policy.quote_number?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }
    
    // تصفية حسب الحالة
    if (filterStatus !== 'all') {
      results = results.filter(policy => policy.status === filterStatus);
    }
    
    setFilteredPolicies(results);
    setCurrentPage(1); // العودة للصفحة الأولى بعد التصفية
  };

  // Add this function to test the API endpoint
const testApiEndpoint = async () => {
  try {
    console.log('🧪 اختبار نهاية API...');
    const testUrl = '/api/health/health-insurance-policies/';
    const response = await api.get(testUrl);
    console.log('✅ اختبار API ناجح:', {
      url: testUrl,
      status: response.status,
      dataCount: response.data?.length || 0,
      data: response.data
    });
    return response.data;
  } catch (error) {
    console.error('❌ اختبار API فاشل:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return null;
  }
};

  const fetchPolicyDetail = async (policyId) => {
    try {
      setLoadingDetail(true);
      const response = await api.get(`/api/health/health-insurance-policies/${policyId}/`);
      setPolicyDetail(response.data);
      setActiveTab('detail');
      setShowPolicyDetail(true);
      
      if (onViewPolicy) {
        onViewPolicy(response.data);
      }
    } catch (error) {
      console.error('❌ خطأ في جلب تفاصيل الوثيقة:', error);
      alert('حدث خطأ أثناء تحميل تفاصيل الوثيقة');
    } finally {
      setLoadingDetail(false);
    }
  };

  // ========== دوال PDF ==========
  const handleGenerateCertificate = async (policy) => {
    try {
      console.log('📄 إنشاء وحفظ PDF:', policy.policy_number);
      console.log('🔍 بيانات الوثيقة الأصلية:', policy);
      
      if (!policy || !policy.id) {
        console.error('❌ خطأ: الوثيقة غير صالحة');
        alert('خطأ: بيانات الوثيقة غير صالحة');
        return;
      }
      
      // FIRST: Get the complete policy data with all relationships
      console.log('🔄 جلب البيانات الكاملة للوثيقة...');
      let completePolicyData = policy;
      
      try {
        // Get the full policy with all data
        const policyResponse = await api.get(`/api/health/health-insurance-policies/${policy.id}/?expand=quote,company`);
        completePolicyData = policyResponse.data;
        console.log('✅ بيانات الوثيقة الكاملة:', completePolicyData);
      } catch (policyError) {
        console.warn('⚠️ لا يمكن الحصول على بيانات الوثيقة الكاملة:', policyError);
      }
      
      // SECOND: If still missing data, try to fetch from quote
      if (!completePolicyData.calculation_data && !completePolicyData.coverage_details) {
        console.log('🔄 جلب بيانات من الاقتباس...');
        
        // Get quote ID from different sources
        let quoteId = completePolicyData.quote;
        
        // If quote is an object, extract the ID
        if (quoteId && typeof quoteId === 'object') {
          quoteId = quoteId.id;
        }
        
        if (quoteId) {
          try {
            const quoteResponse = await api.get(`/api/health/health-insurance-quotes/${quoteId}/`);
            console.log('✅ بيانات الاقتباس:', quoteResponse.data);
            
            // Merge quote data with policy data
            completePolicyData = {
              ...completePolicyData,
              quote_data: quoteResponse.data,
              coverage_details: completePolicyData.coverage_details || quoteResponse.data.coverage_details,
              calculation_data: completePolicyData.calculation_data || quoteResponse.data.calculation_data,
              family_members: completePolicyData.family_members || quoteResponse.data.family_members,
              total_employees: completePolicyData.total_employees || quoteResponse.data.total_employees || 
                              (quoteResponse.data.calculation_data?.total_employees || 0),
              insurance_type: completePolicyData.insurance_type || quoteResponse.data.insurance_type,
              payment_method: completePolicyData.payment_method || quoteResponse.data.payment_method
            };
          } catch (quoteError) {
            console.warn('⚠️ لا يمكن الحصول على بيانات الاقتباس:', quoteError);
          }
        }
      }
      
      // THIRD: Prepare the data for PDF
      const policyData = preparePolicyData(completePolicyData);
      console.log('📋 البيانات المجهزة للPDF:', policyData);
      
      // FOURTH: Show debug info
      console.log('🔍 تفاصيل الاستخراج:', {
        hasCalculationData: !!policyData.calculation_data,
        hasCoverageDetails: !!policyData.coverage_details,
        familyMembers: policyData.family_members,
        totalEmployees: policyData.total_employees,
        insuranceType: policyData.insurance_type
      });
      
      // Check if we have real data
      if (policyData.total_employees === 0 && !policyData.calculation_data && !policyData.coverage_details) {
        console.warn('⚠️ البيانات غير مكتملة، ربما تحتاج لإصلاح قاعدة البيانات');
        
        // Ask user if they want to see raw data
        if (window.confirm('البيانات غير مكتملة. هل تريد رؤية البيانات الخام للتصحيح؟')) {
          console.log('📊 البيانات الخام:', completePolicyData);
        }
      }
      
      setShowPdfModal(true);
      setSelectedPolicyForPdf(policyData);
      
    } catch (error) {
      console.error('❌ خطأ في handleGenerateCertificate:', error);
      console.error('📋 تفاصيل الخطأ:', error.response?.data || error.message);
      
      const fallbackData = createFallbackPolicyData(policy);
      console.log('🔄 استخدام البيانات الاحتياطية:', fallbackData);
      setShowPdfModal(true);
      setSelectedPolicyForPdf(fallbackData);
    }
  };

  // تحضير بيانات الوثيقة بشكل كامل
  const preparePolicyData = (policy) => {
    console.log('🔍 تحضير بيانات الوثيقة:', policy);
    
    // استخراج أفراد العائلة من مصادر متعددة
    let familyMembers = extractFamilyMembers(policy);
    
    // استخراج إجمالي الموظفين
    const totalEmployees = extractTotalEmployees(policy);
    
    // الحصول على اسم خطة التغطية
    const coveragePlanName = extractCoveragePlanName(policy);
    
    // الحصول على اسم نوع التأمين
    const insuranceTypeName = extractInsuranceTypeName(policy);
    
    // تحويل التواريخ
    const { inceptionDateFormatted, expiryDateFormatted, generatedDateFormatted } = formatDates(policy);
    
    // حساب الأيام المتبقية
    const daysRemaining = calculateDaysRemaining(policy.expiry_date);
    
    // Get premium details - try multiple sources
    let totalPremium = parseFloat(policy.total_premium || 0);
    let annualPremium = parseFloat(policy.annual_premium || 0);
    let monthlyPremium = parseFloat(policy.monthly_premium || 0);
    
    // If premiums are zero, try to get from calculation_data
    if (totalPremium === 0 && policy.calculation_data) {
      let calcData = policy.calculation_data;
      if (typeof calcData === 'string') {
        try {
          calcData = JSON.parse(calcData);
        } catch (e) {
          console.warn('⚠️ خطأ في تحليل calculation_data:', e);
        }
      }
      
      if (calcData.total_premium) {
        totalPremium = parseFloat(calcData.total_premium);
      }
      if (calcData.annual_premium) {
        annualPremium = parseFloat(calcData.annual_premium);
      }
      if (calcData.monthly_premium) {
        monthlyPremium = parseFloat(calcData.monthly_premium);
      }
    }
    
    // If still zero, calculate from payment method
    if (totalPremium === 0 && annualPremium === 0) {
      // Default calculation based on insurance type
      const baseRates = {
        'A': 1500,
        'B': 1200,
        'C': 800,
        'comprehensive': 1500,
        'medium': 1200,
        'basic': 800
      };
      
      const insuranceType = policy.insurance_type || 'B';
      const baseRate = baseRates[insuranceType] || 1200;
      totalEmployees = totalEmployees || 1;
      totalPremium = baseRate * totalEmployees;
      annualPremium = totalPremium;
      monthlyPremium = Math.round(totalPremium / 12);
    }
    
    // تجميع البيانات النهائية
    const policyData = {
      // المعلومات الأساسية
      id: policy.id,
      policy_number: policy.policy_number || 'غير معروف',
      company_name: policy.company_name || policy.company?.name || 'غير محدد',
      quote_number: policy.quote_number || policy.quote?.quote_number || 'غير معروف',
      
      // معلومات التغطية
      coverage_plan_name: coveragePlanName,
      insurance_type: policy.insurance_type || 'B',
      insurance_type_name: insuranceTypeName,
      
      // معلومات التواريخ
      inception_date: policy.inception_date,
      inception_date_arabic: inceptionDateFormatted,
      expiry_date: policy.expiry_date,
      expiry_date_arabic: expiryDateFormatted,
      generated_date_arabic: generatedDateFormatted,
      
      // المعلومات المالية
      total_premium: totalPremium,
      annual_premium: annualPremium,
      monthly_premium: monthlyPremium,
      paid_amount: parseFloat(policy.paid_amount || 0),
      due_amount: parseFloat(policy.due_amount || 0),
      
      // الحالة
      status: policy.status || 'pending',
      status_display: policy.status_display || getStatusDisplay(policy.status),
      payment_status: policy.payment_status || 'pending',
      payment_status_display: policy.payment_status_display || getPaymentStatusDisplay(policy.payment_status),
      days_remaining: daysRemaining,
      
      // البيانات التفصيلية
      family_members: familyMembers,
      total_family_members: Object.values(familyMembers).reduce((sum, val) => sum + (Number(val) || 0), 0),
      total_employees: totalEmployees,
      
      // البيانات الأصلية (للرجوع إليها)
      coverage_details: policy.coverage_details || {},
      calculation_data: policy.calculation_data || {},
      policy_details: policy.policy_details || {},
      quote_data: policy.quote_data || {}, // Store the full quote data
      
      // معلومات إضافية
      generated_date: new Date().toISOString(),
      company: policy.company || {},
      payment_method: policy.payment_method || 'annual'
    };
    
    console.log('✅ البيانات النهائية المحضرة:', {
      policy_number: policyData.policy_number,
      company_name: policyData.company_name,
      coverage_plan_name: policyData.coverage_plan_name,
      total_employees: policyData.total_employees,
      family_members: policyData.family_members,
      total_premium: policyData.total_premium,
      has_quote_data: !!policy.quote_data
    });
    
    return policyData;
  };

  // ========== دوال المساعدة لتحضير البيانات ==========
  
  const extractFamilyMembers = (policy) => {
    console.log('🔍 استخراج أفراد العائلة من:', {
      id: policy.id,
      hasFamilyMembers: !!policy.family_members,
      hasCalculationData: !!policy.calculation_data,
      hasCoverageDetails: !!policy.coverage_details,
      hasQuoteData: !!policy.quote_data
    });
    
    let familyMembers = { spouses: 0, children: 0, parents: 0 };
    
    // المحاولة 1: من حقل family_members المباشر
    if (policy.family_members) {
      console.log('📌 محاولة 1: من family_members المباشر');
      if (typeof policy.family_members === 'string') {
        try {
          familyMembers = JSON.parse(policy.family_members);
          console.log('✅ تم تحليل family_members بنجاح:', familyMembers);
        } catch (e) {
          console.warn('⚠️ خطأ في تحليل family_members:', e);
        }
      } else if (typeof policy.family_members === 'object') {
        familyMembers = policy.family_members;
        console.log('✅ تم استخدام family_members المباشر:', familyMembers);
      }
    }
    
    // المحاولة 2: من quote_data إذا كان متوفراً
    if (policy.quote_data) {
      console.log('📌 محاولة 2: من quote_data');
      const quote = policy.quote_data;
      
      if (quote.family_members) {
        if (typeof quote.family_members === 'string') {
          try {
            familyMembers = JSON.parse(quote.family_members);
            console.log('✅ تم تحليل family_members من quote:', familyMembers);
          } catch (e) {
            console.warn('⚠️ خطأ في تحليل family_members من quote:', e);
          }
        } else if (typeof quote.family_members === 'object') {
          familyMembers = quote.family_members;
          console.log('✅ تم استخدام family_members من quote:', familyMembers);
        }
      }
      
      // أيضاً من calculation_data في quote
      if (quote.calculation_data) {
        let calculationData = quote.calculation_data;
        if (typeof calculationData === 'string') {
          try {
            calculationData = JSON.parse(calculationData);
          } catch (e) {
            console.warn('⚠️ خطأ في تحليل calculation_data من quote:', e);
          }
        }
        
        if (calculationData.family_data) {
          familyMembers = {
            spouses: calculationData.family_data.spouses || familyMembers.spouses,
            children: calculationData.family_data.children || familyMembers.children,
            parents: calculationData.family_data.parents || familyMembers.parents
          };
          console.log('✅ تم استخراج family_members من calculation_data في quote:', familyMembers);
        }
      }
    }
    
    // المحاولة 3: من calculation_data في policy
    if (policy.calculation_data) {
      console.log('📌 محاولة 3: من calculation_data في policy');
      let calculationData = policy.calculation_data;
      if (typeof calculationData === 'string') {
        try {
          calculationData = JSON.parse(calculationData);
        } catch (e) {
          console.warn('⚠️ خطأ في تحليل calculation_data في policy:', e);
        }
      }
      
      if (calculationData.family_data) {
        familyMembers = {
          spouses: calculationData.family_data.spouses || familyMembers.spouses,
          children: calculationData.family_data.children || familyMembers.children,
          parents: calculationData.family_data.parents || familyMembers.parents
        };
        console.log('✅ تم استخراج family_members من calculation_data في policy:', familyMembers);
      }
    }
    
    // المحاولة 4: من coverage_details
    if (policy.coverage_details) {
      console.log('📌 محاولة 4: من coverage_details');
      let coverageDetails = policy.coverage_details;
      if (typeof coverageDetails === 'string') {
        try {
          coverageDetails = JSON.parse(coverageDetails);
        } catch (e) {
          console.warn('⚠️ خطأ في تحليل coverage_details:', e);
        }
      }
      
      if (coverageDetails.family_members) {
        familyMembers = {
          spouses: coverageDetails.family_members.spouses || familyMembers.spouses,
          children: coverageDetails.family_members.children || familyMembers.children,
          parents: coverageDetails.family_members.parents || familyMembers.parents
        };
        console.log('✅ تم استخراج family_members من coverage_details:', familyMembers);
      }
    }
    
    // المحاولة 5: من policy_details
    if (policy.policy_details?.family_members) {
      console.log('📌 محاولة 5: من policy_details');
      familyMembers = {
        spouses: policy.policy_details.family_members.spouses || familyMembers.spouses,
        children: policy.policy_details.family_members.children || familyMembers.children,
        parents: policy.policy_details.family_members.parents || familyMembers.parents
      };
      console.log('✅ تم استخراج family_members من policy_details:', familyMembers);
    }
    
    console.log('👨‍👩‍👧‍👦 أفراد العائلة النهائية:', familyMembers);
    return familyMembers;
  };

  const extractTotalEmployees = (policy) => {
    console.log('🔍 استخراج عدد الموظفين من:', {
      id: policy.id,
      hasTotalEmployees: !!policy.total_employees,
      hasCalculationData: !!policy.calculation_data,
      hasQuoteData: !!policy.quote_data
    });
    
    // المحاولة 1: من الحقل المباشر
    if (policy.total_employees && Number(policy.total_employees) > 0) {
      console.log('✅ استخدام total_employees المباشر:', policy.total_employees);
      return Number(policy.total_employees);
    }
    
    // المحاولة 2: من quote_data
    if (policy.quote_data) {
      const quote = policy.quote_data;
      
      if (quote.total_employees && Number(quote.total_employees) > 0) {
        console.log('✅ استخدام total_employees من quote:', quote.total_employees);
        return Number(quote.total_employees);
      }
      
      // من calculation_data في quote
      if (quote.calculation_data) {
        let calculationData = quote.calculation_data;
        if (typeof calculationData === 'string') {
          try {
            calculationData = JSON.parse(calculationData);
          } catch (e) {
            console.warn('⚠️ خطأ في تحليل calculation_data في quote:', e);
          }
        }
        
        if (calculationData.total_employees && Number(calculationData.total_employees) > 0) {
          console.log('✅ استخدام total_employees من calculation_data في quote:', calculationData.total_employees);
          return Number(calculationData.total_employees);
        }
        
        // حساب من family_data إذا كان متوفراً
        if (calculationData.family_data) {
          const employees = calculationData.family_data.total_employees || 
                          calculationData.family_data.employees || 
                          calculationData.family_data.total || 0;
          if (Number(employees) > 0) {
            console.log('✅ استخدام الموظفين من family_data في quote:', employees);
            return Number(employees);
          }
        }
      }
    }
    
    // المحاولة 3: من calculation_data في policy
    if (policy.calculation_data) {
      let calculationData = policy.calculation_data;
      if (typeof calculationData === 'string') {
        try {
          calculationData = JSON.parse(calculationData);
        } catch (e) {
          console.warn('⚠️ خطأ في تحليل calculation_data في policy:', e);
        }
      }
      
      if (calculationData.total_employees && Number(calculationData.total_employees) > 0) {
        console.log('✅ استخدام total_employees من calculation_data في policy:', calculationData.total_employees);
        return Number(calculationData.total_employees);
      }
      
      if (calculationData.family_data) {
        const employees = calculationData.family_data.total_employees || 
                        calculationData.family_data.employees || 
                        calculationData.family_data.total || 0;
        if (Number(employees) > 0) {
          console.log('✅ استخدام الموظفين من family_data في policy:', employees);
          return Number(employees);
        }
      }
    }
    
    // المحاولة 4: من coverage_details
    if (policy.coverage_details) {
      let coverageDetails = policy.coverage_details;
      if (typeof coverageDetails === 'string') {
        try {
          coverageDetails = JSON.parse(coverageDetails);
        } catch (e) {
          console.warn('⚠️ خطأ في تحليل coverage_details:', e);
        }
      }
      
      if (coverageDetails.total_employees && Number(coverageDetails.total_employees) > 0) {
        console.log('✅ استخدام total_employees من coverage_details:', coverageDetails.total_employees);
        return Number(coverageDetails.total_employees);
      }
    }
    
    console.log('⚠️ لم يتم العثور على عدد الموظفين، استخدام القيمة الافتراضية 1');
    return 1; // Default value
  };

  const extractCoveragePlanName = (policy) => {
    // المحاولة 1: من الحقل المباشر
    if (policy.coverage_plan_name) {
      return policy.coverage_plan_name;
    }
    
    // المحاولة 2: من coverage_details
    if (policy.coverage_details) {
      let coverageDetails = policy.coverage_details;
      if (typeof coverageDetails === 'string') {
        try {
          coverageDetails = JSON.parse(coverageDetails);
        } catch (e) {
          console.warn('⚠️ خطأ في تحليل coverage_details:', e);
        }
      }
      
      if (coverageDetails.insurance_type_data?.name) {
        return coverageDetails.insurance_type_data.name;
      }
      
      if (coverageDetails.plan_name) {
        return coverageDetails.plan_name;
      }
    }
    
    // المحاولة 3: من policy_details
    if (policy.policy_details?.coverage_plan_name) {
      return policy.policy_details.coverage_plan_name;
    }
    
    // المحاولة 4: من insurance_type
    const planMap = {
      'A': 'التغطية الشاملة',
      'B': 'التغطية المتوسطة',
      'C': 'التغطية الأساسية',
      'comprehensive': 'التغطية الشاملة',
      'medium': 'التغطية المتوسطة',
      'basic': 'التغطية الأساسية'
    };
    
    const insuranceType = policy.insurance_type || 'B';
    return planMap[insuranceType] || `خطة ${insuranceType}`;
  };

  const extractInsuranceTypeName = (policy) => {
    const types = { 
      'A': 'ممتازة', 
      'B': 'متوسطة', 
      'C': 'أساسية',
      'comprehensive': 'شاملة',
      'medium': 'متوسطة',
      'basic': 'أساسية'
    };
    
    const insuranceType = policy.insurance_type || 'B';
    return types[insuranceType] || insuranceType;
  };

  const formatDates = (policy) => {
    const inceptionDate = policy.inception_date ? new Date(policy.inception_date) : new Date();
    const expiryDate = policy.expiry_date ? new Date(policy.expiry_date) : new Date();
    const generatedDate = new Date();
    
    const inceptionDateFormatted = convertToArabicDate(inceptionDate);
    const expiryDateFormatted = convertToArabicDate(expiryDate);
    const generatedDateFormatted = convertToArabicDate(generatedDate);
    
    return {
      inceptionDateFormatted,
      expiryDateFormatted,
      generatedDateFormatted
    };
  };

  const createFallbackPolicyData = (policy) => {
    console.log('🔄 إنشاء بيانات احتياطية للوثيقة:', policy);
    
    // Try to extract data from the policy itself
    const familyMembers = extractFamilyMembers(policy);
    const totalEmployees = extractTotalEmployees(policy);
    const coveragePlanName = extractCoveragePlanName(policy);
    
    return {
      id: policy?.id || 1,
      policy_number: policy?.policy_number || 'HP-TEST-001',
      company_name: policy?.company_name || policy?.company?.name || 'شركة تجريبية',
      coverage_plan_name: coveragePlanName,
      insurance_type: policy?.insurance_type || 'B',
      insurance_type_name: extractInsuranceTypeName(policy),
      inception_date: policy?.inception_date || '2024-01-01',
      expiry_date: policy?.expiry_date || '2024-12-31',
      total_premium: parseFloat(policy?.total_premium || 4800),
      annual_premium: parseFloat(policy?.annual_premium || 4800),
      monthly_premium: parseFloat(policy?.monthly_premium || 400),
      paid_amount: parseFloat(policy?.paid_amount || 0),
      due_amount: parseFloat(policy?.due_amount || 4800),
      status: policy?.status || 'active',
      status_display: getStatusDisplay(policy?.status || 'active'),
      payment_status: policy?.payment_status || 'pending',
      payment_status_display: getPaymentStatusDisplay(policy?.payment_status || 'pending'),
      days_remaining: calculateDaysRemaining(policy?.expiry_date),
      family_members: familyMembers,
      total_family_members: Object.values(familyMembers).reduce((sum, val) => sum + (Number(val) || 0), 0),
      total_employees: totalEmployees,
      generated_date_arabic: convertToArabicDate(new Date()),
      coverage_details: policy?.coverage_details || {},
      calculation_data: policy?.calculation_data || {},
      // Add sample data for testing
      sample_data: true,
      sample_note: 'هذه بيانات تجريبية لأن البيانات الأصلية غير متوفرة'
    };
  };

  const convertToArabicDate = (date) => {
    try {
      const arabicMonths = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      
      const day = date.getDate();
      const month = arabicMonths[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day} ${month} ${year}`;
    } catch (error) {
      return date.toLocaleDateString('ar-SA');
    }
  };

  const calculateDaysRemaining = (expiryDate) => {
    try {
      if (!expiryDate) return 365;
      
      const today = new Date();
      const expiry = new Date(expiryDate);
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch (error) {
      return 365;
    }
  };

  const getCoveragePlanName = (policy) => {
    return extractCoveragePlanName(policy);
  };

  const getInsuranceTypeName = (insuranceType) => {
    const types = {
      'A': 'التغطية الشاملة',
      'B': 'التغطية القياسية',
      'C': 'التغطية الأساسية'
    };
    return types[insuranceType] || insuranceType;
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'draft': 'مسودة',
      'active': 'نشطة',
      'expired': 'منتهية',
      'cancelled': 'ملغاة',
      'pending': 'معلقة',
      'accepted': 'مقبولة'
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusDisplay = (paymentStatus) => {
    const paymentMap = {
      'pending': 'قيد الدفع',
      'partial': 'مدفوعة جزئياً',
      'paid': 'مدفوعة',
      'overdue': 'متأخرة',
      'cancelled': 'ملغاة'
    };
    return paymentMap[paymentStatus] || paymentStatus;
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'secondary',
      'active': 'success',
      'expired': 'warning',
      'cancelled': 'danger',
      'pending': 'info'
    };
    return colors[status] || 'light';
  };

  const getPaymentStatusColor = (paymentStatus) => {
    const colors = {
      'pending': 'warning',
      'partial': 'info',
      'paid': 'success',
      'overdue': 'danger',
      'cancelled': 'secondary'
    };
    return colors[paymentStatus] || 'light';
  };

  // ========== دوال إضافية ==========
  const handleRenewClick = (policy) => {
    setSelectedPolicy(policy);
    setShowRenewModal(true);
  };

  const handleRenewConfirm = async () => {
    try {
      alert('سيتم تجديد الوثيقة قريباً. هذه الميزة قيد التطوير.');
      setShowRenewModal(false);
    } catch (error) {
      alert('حدث خطأ أثناء تجديد الوثيقة');
    }
  };

  const handleDownloadFullPolicy = async (policy) => {
    try {
      const response = await api.get(
        `/api/health/health-insurance-policies/${policy.id}/full_pdf/`,
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `وثيقة_تأمين_كاملة_${policy.policy_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('❌ خطأ في تحميل الوثيقة الكاملة:', error);
      alert('⚠️ الميزة قيد التطوير. استخدم زر "تحميل PDF" الأساسي.');
    }
  };

  // ========== دوال العرض ==========
  const renderPolicyDetail = () => {
    if (!policyDetail) return null;

    const policy = policyDetail;
    const policyData = preparePolicyData(policy);
    
    return (
      <div className="policy-detail-view">
        <Button 
          variant="outline-secondary" 
          onClick={() => {
            setActiveTab('list');
            setShowPolicyDetail(false);
            setPolicyDetail(null);
          }}
          className="mb-3"
        >
          <FaArrowLeft className="me-2" />
          العودة إلى القائمة
        </Button>

        <Card className="mb-4 shadow">
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaFileContract className="me-2" />
              وثيقة تأمين صحي جماعي
            </h5>
            <Badge bg="light" text="dark" className="fs-6">
              {policyDetail.policy_number}
            </Badge>
          </Card.Header>
          
          <Card.Body>
            <Row>
              <Col md={6}>
                <div className="info-item mb-3">
                  <FaBuilding className="me-2 text-primary" />
                  <strong>الشركة:</strong> {policyDetail.company_name}
                </div>
                <div className="info-item mb-3">
                  <FaUsers className="me-2 text-success" />
                  <strong>نوع الخطة:</strong> {policyData.coverage_plan_name}
                </div>
                <div className="info-item mb-3">
                  <FaDollarSign className="me-2 text-warning" />
                  <strong>القسط الإجمالي:</strong> {policyData.total_premium.toLocaleString()} دولار
                </div>
                <div className="info-item mb-3">
                  <FaUsers className="me-2 text-info" />
                  <strong>عدد الموظفين:</strong> {policyData.total_employees}
                </div>
              </Col>
              <Col md={6}>
                <div className="info-item mb-3">
                  <FaCalendarAlt className="me-2 text-info" />
                  <strong>تاريخ البدء:</strong> {policyData.inception_date_arabic}
                </div>
                <div className="info-item mb-3">
                  <FaCalendarAlt className="me-2 text-danger" />
                  <strong>تاريخ الانتهاء:</strong> {policyData.expiry_date_arabic}
                </div>
                <div className="info-item mb-3">
                  <strong>الحالة:</strong> {getStatusBadge(policyDetail.status)}
                </div>
              </Col>
            </Row>
            
            {/* عرض أفراد العائلة */}
            {policyData.total_family_members > 0 && (
              <Card className="mt-3">
                <Card.Header className="bg-light">
                  <h6 className="mb-0">👨‍👩‍👧‍👦 أفراد العائلة المشمولين</h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    {policyData.family_members.spouses > 0 && (
                      <Col md={4} className="text-center">
                        <div className="family-member-card">
                          <FaUser size={32} className="text-primary mb-2" />
                          <div className="fw-bold">{policyData.family_members.spouses}</div>
                          <div className="text-muted">زوجات</div>
                        </div>
                      </Col>
                    )}
                    {policyData.family_members.children > 0 && (
                      <Col md={4} className="text-center">
                        <div className="family-member-card">
                          <FaChild size={32} className="text-success mb-2" />
                          <div className="fw-bold">{policyData.family_members.children}</div>
                          <div className="text-muted">أبناء</div>
                        </div>
                      </Col>
                    )}
                    {policyData.family_members.parents > 0 && (
                      <Col md={4} className="text-center">
                        <div className="family-member-card">
                          <FaUsers size={32} className="text-warning mb-2" />
                          <div className="fw-bold">{policyData.family_members.parents}</div>
                          <div className="text-muted">والدين</div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            )}
          </Card.Body>
        </Card>
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { label: 'معلق', color: 'warning' },
      'active': { label: 'نشط', color: 'success' },
      'expired': { label: 'منتهي', color: 'secondary' },
      'cancelled': { label: 'ملغي', color: 'danger' },
      'suspended': { label: 'موقوف', color: 'dark' }
    };
    
    const config = statusConfig[status] || { label: status, color: 'secondary' };
    return <Badge bg={config.color}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      'pending': { label: 'بانتظار الدفع', color: 'warning' },
      'paid': { label: 'مدفوع', color: 'success' },
      'partial': { label: 'مدفوع جزئياً', color: 'info' },
      'overdue': { label: 'متأخر', color: 'danger' },
      'cancelled': { label: 'ملغي', color: 'secondary' }
    };
    
    const config = statusConfig[status] || { label: status, color: 'secondary' };
    return <Badge bg={config.color}>{config.label}</Badge>;
  };

  const renderPoliciesList = () => {
  console.log('📊 renderPoliciesList called:', {
    loading,
    policiesCount: policies.length,
    filteredCount: filteredPolicies.length,
    currentPage,
    itemsPerPage,
    searchTerm,
    filterStatus,
    viewMode,
  });

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">جاري تحميل الوثائق...</p>
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={() => fetchPolicies()}
          className="mt-2"
        >
          إعادة المحاولة
        </Button>
      </div>
    );
  }
  
  console.log('📊 عرض قائمة الوثائق:', {
    policiesCount: policies.length,
    filteredCount: filteredPolicies.length,
    searchTerm,
    filterStatus,
  });
  
  // ✅ FIX: Calculate paginated policies correctly
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPolicies = filteredPolicies.slice(startIndex, endIndex);
  
  console.log('🔢 Pagination:', {
    startIndex,
    endIndex,
    totalPages: Math.ceil(filteredPolicies.length / itemsPerPage),
    paginatedCount: paginatedPolicies.length
  });

  // ✅ FIX: Check filteredPolicies instead of paginatedQuotes
  if (filteredPolicies.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <div className="mb-4">
            <FaFileContract size={64} className="text-muted mb-3" />
          </div>
          <h5 className="mb-2">لا توجد وثائق متاحة</h5>
          
          {searchTerm || filterStatus !== 'all' ? (
            <div>
              <p className="text-muted mb-3">
                لم يتم العثور على وثائق تطابق معايير البحث
              </p>
              <Button 
                variant="outline-primary" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
              >
                إعادة تعيين البحث
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-muted mb-3">
                {policies.length === 0 
                  ? 'لم يتم إنشاء أي وثائق تأمين صحي بعد' 
                  : `يوجد ${policies.length} وثيقة ولكن التصفية تعيد 0`
                }
              </p>
              <div className="mt-4">
                <Button 
                  variant="primary" 
                  onClick={fetchPolicies}
                  className="me-2"
                >
                  <FaSync className="me-1" /> تحديث
                </Button>
                <Button 
                  variant="outline-secondary"
                  onClick={() => testApiEndpoint()}
                >
                  اختبار الاتصال
                </Button>
              </div>
              
              {/* Debug info */}
              <div className="mt-4 p-3 bg-light rounded text-start">
                <small className="text-muted d-block mb-1">معلومات التصحيح:</small>
                <small className="d-block">الوثائق الأصلية: {policies.length}</small>
                <small className="d-block">الوثائق المصفاة: {filteredPolicies.length}</small>
                <small className="d-block">حالة التحميل: {loading ? 'نعم' : 'لا'}</small>
                <small className="d-block">وضع standalone: {isStandalone ? 'نعم' : 'لا'}</small>
                <small className="d-block">companyId: {companyId || 'غير محدد'}</small>
                <small className="d-block">API URL: /api/health/health-insurance-policies/</small>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  }
  
  // ✅ ADD THIS: Debug log for each policy
  console.log('🔍 عرض الوثائق المفصلة:', filteredPolicies.map(p => ({
    id: p.id,
    policy_number: p.policy_number,
    company_name: p.company_name || p.company?.name,
    status: p.status,
    total_premium: p.total_premium,
    annual_premium: p.annual_premium,
    monthly_premium: p.monthly_premium,
    has_quote: !!p.quote,
    has_company: !!p.company,
    insurance_type: p.insurance_type,
    payment_method: p.payment_method
  })));

  const handleViewPolicyDetail = (policy) => {
    setPolicyDetail(policy);
    setActiveTab('detail');
    setShowPolicyDetail(true);
    console.log('👁️ عرض تفاصيل الوثيقة:', policy.id);
  };

  

  return (
    <>
      {/* Debug button - remove later */}
      <Card className="mb-3 bg-light">
        <Card.Body className="py-2">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              <FaInfoCircle className="me-1" />
              {filteredPolicies.length} وثيقة متاحة
            </small>
            <Button 
              variant="outline-info" 
              size="sm" 
              onClick={() => {
                console.log('🔍 بيانات الوثائق الخام:', policies);
                console.log('🔍 بيانات الوثائق المصفاة:', filteredPolicies);
                console.log('🔍 بيانات الصفحة الحالية:', paginatedPolicies);
                alert(`البيانات:\n${JSON.stringify(paginatedPolicies[0] || {}, null, 2)}`);
              }}
            >
              <FaDatabase className="me-1" /> فحص البيانات
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <>
          <Row>
            {paginatedPolicies.map((policy) => {
              // Use a simple card for testing first
              console.log('🔄 عرض الوثيقة:', policy.id, policy.policy_number);
              
              return (
                <Col key={policy.id} lg={6} xl={4} className="mb-4">
                  <Card className="policy-card h-100 shadow-sm">
                    <Card.Header className="bg-primary text-white py-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">
                          <FaFileContract className="me-2" />
                          وثيقة تأمين
                        </h6>
                        <Badge bg="light" text="dark" className="fw-bold">
                          #{policy.policy_number}
                        </Badge>
                      </div>
                    </Card.Header>
                    
                    <Card.Body>
                      {/* Company info */}
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">
                          <FaBuilding className="me-2" />
                          الشركة
                        </h6>
                        <p className="mb-1 fw-bold">
                          {policy.company_name || policy.company?.name || 'غير معروف'}
                        </p>
                      </div>
                      
                      {/* Premium info */}
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">
                          <FaDollarSign className="me-2" />
                          التكلفة
                        </h6>
                        <div className="d-flex justify-content-between">
                          <div>
                            <small className="text-muted d-block">سنوي</small>
                            <h5 className="text-success mb-0">
                              ${parseFloat(policy.total_premium || 0).toLocaleString()}
                            </h5>
                          </div>
                          <div>
                            <small className="text-muted d-block">شهري</small>
                            <h5 className="text-primary mb-0">
                              ${parseFloat(policy.monthly_premium || 0).toLocaleString()}
                            </h5>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">
                          <FaClipboardCheck className="me-2" />
                          الحالة
                        </h6>
                        <div className="d-flex justify-content-between">
                          <Badge bg={getStatusColor(policy.status)} className="p-2">
                            {getStatusDisplay(policy.status)}
                          </Badge>
                          <Badge bg={getPaymentStatusColor(policy.payment_status)} className="p-2">
                            {getPaymentStatusDisplay(policy.payment_status)}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Dates */}
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">
                          <FaCalendarAlt className="me-2" />
                          الفترة
                        </h6>
                        <div className="d-flex justify-content-between">
                          <div>
                            <small className="text-muted d-block">البداية</small>
                            <small>{policy.inception_date ? new Date(policy.inception_date).toLocaleDateString('ar-SA') : 'غير محدد'}</small>
                          </div>
                          <div>
                            <small className="text-muted d-block">النهاية</small>
                            <small>{policy.expiry_date ? new Date(policy.expiry_date).toLocaleDateString('ar-SA') : 'غير محدد'}</small>
                          </div>
                        </div>
                      </div>
                      
                      {/* Insurance Type */}
                      {policy.insurance_type && (
                        <div className="mb-3">
                          <h6 className="text-muted mb-2">
                            <FaShieldAlt className="me-2" />
                            نوع التغطية
                          </h6>
                          <Badge bg="info" className="p-2">
                            {getInsuranceTypeName(policy.insurance_type)}
                          </Badge>
                        </div>
                      )}
                    </Card.Body>
                    
                    <Card.Footer className="bg-light">
                      <div className="d-flex justify-content-between">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewPolicyDetail(policy)}
                        >
                          <FaEye className="me-1" /> عرض
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleGenerateCertificate(policy)}
                        >
                          <FaFilePdf className="me-1" /> PDF
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              );
            })}
          </Row>
          
          {/* Pagination */}
          {Math.ceil(filteredPolicies.length / itemsPerPage) > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                />
                {[...Array(Math.min(Math.ceil(filteredPolicies.length / itemsPerPage), 5))].map((_, i) => {
                  let pageNum;
                  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
                  
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
                  disabled={currentPage === Math.ceil(filteredPolicies.length / itemsPerPage)}
                  onClick={() => setCurrentPage(currentPage + 1)}
                />
              </Pagination>
            </div>
          )}
        </>
      ) : (
        /* Table View */
        <Card>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>رقم الوثيقة</th>
                    <th>الشركة</th>
                    <th>القسط السنوي</th>
                    <th>الحالة</th>
                    <th className="text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPolicies.map((policy) => (
                    <tr key={policy.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <Badge bg="primary" className="me-2">
                            #{policy.policy_number}
                          </Badge>
                          <div>
                            <small className="text-muted">
                              {policy.insurance_type && `نوع ${policy.insurance_type}`}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{policy.company_name || policy.company?.name || 'غير معروف'}</strong>
                          <br/>
                          <small className="text-muted">
                            {policy.total_employees || 0} موظف
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="text-success">
                          <strong>${parseFloat(policy.total_premium || 0).toLocaleString()}</strong>
                        </div>
                        <small className="text-primary">
                          ${parseFloat(policy.monthly_premium || 0).toLocaleString()}/شهر
                        </small>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {getStatusBadge(policy.status)}
                          {policy.expiry_date && (
                            <small className="ms-2">
                              <FaCalendarAlt className="me-1" />
                              {new Date(policy.expiry_date).toLocaleDateString('ar-SA')}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleViewPolicyDetail(policy)}
                            title="عرض التفاصيل"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => handleGenerateCertificate(policy)}
                            title="إنشاء PDF"
                          >
                            <FaFilePdf />
                          </Button>
                          <Dropdown>
                            <Dropdown.Toggle
                              size="sm"
                              variant="outline-secondary"
                              id="dropdown-actions"
                            >
                              ...
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleDownloadFullPolicy(policy)}>
                                <FaDownload className="me-2" />
                                تحميل كامل
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleRenewClick(policy)}>
                                <FaSync className="me-2" />
                                تجديد
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            
            {/* Pagination for table */}
            {Math.ceil(filteredPolicies.length / itemsPerPage) > 1 && (
              <div className="d-flex justify-content-center mt-3">
                <Pagination>
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  />
                  {[...Array(Math.ceil(filteredPolicies.length / itemsPerPage))].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={currentPage === Math.ceil(filteredPolicies.length / itemsPerPage)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  />
                </Pagination>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </>
  );
};


  // ========== واجهة المستخدم الرئيسية ==========
  return (
    <Container fluid className="py-4 health-insurance-policies">
      {/* إذا كانت standalone، أضف header */}
      {isStandalone && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-0">
              <FaFileContract className="me-2" />
              إدارة وثائق التأمين الصحي
            </h4>
            <p className="text-muted mb-0">
              عرض وإدارة جميع وثائق التأمين الصحي النشطة والمنتهية
            </p>
          </div>
          <Button variant="primary" onClick={onRefresh || fetchPolicies}>
            <FaSync className="me-1" />
            تحديث
          </Button>
        </div>
      )}

      {/* أدوات البحث والتصفية */}
      {!showPolicyDetail && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row>
              <Col md={8}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="ابحث برقم الوثيقة أو اسم الشركة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={4}>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">جميع الحالات</option>
                  <option value="draft">مسودة</option>
                  <option value="active">نشطة</option>
                  <option value="expired">منتهية</option>
                  <option value="cancelled">ملغاة</option>
                  <option value="pending">معلقة</option>
                </Form.Select>
              </Col>
            </Row>
            
            {/* إحصائيات سريعة */}
            {/* <Row className="mt-3">
              <Col md={3}>
                <div className="stat-card text-center p-2 border rounded">
                  <h5 className="text-primary mb-1">{policies.length}</h5>
                  <small className="text-muted">إجمالي الوثائق</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="stat-card text-center p-2 border rounded">
                  <h5 className="text-success mb-1">
                    {policies.filter(p => p.status === 'active').length}
                  </h5>
                  <small className="text-muted">نشطة</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="stat-card text-center p-2 border rounded">
                  <h5 className="text-warning mb-1">
                    {policies.filter(p => p.payment_status === 'pending').length}
                  </h5>
                  <small className="text-muted">قيد الدفع</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="stat-card text-center p-2 border rounded">
                  <h5 className="text-info mb-1">
                    {policies.filter(p => p.pdf_document).length}
                  </h5>
                  <small className="text-muted">PDF محفوظة</small>
                </div>
              </Col>
            </Row> */}
          </Card.Body>
        </Card>
      )}

      {/* عرض المحتوى */}
      {showPolicyDetail ? renderPolicyDetail() : renderPoliciesList()}

      {/* نافذة PDF */}
      <Modal
        show={showPdfModal}
        onHide={() => {
          setShowPdfModal(false);
          setSelectedPolicyForPdf(null);
        }}
        size="xl"
        fullscreen="lg-down"
        centered
        scrollable
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="d-flex align-items-center">
            <FaFilePdf className="me-2 text-danger" />
            <span>إنشاء PDF للوثيقة</span>
            {selectedPolicyForPdf && (
              <Badge bg="info" className="ms-2">
                {selectedPolicyForPdf.policy_number}
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '0' }}>
          {selectedPolicyForPdf && (
            <PolicyPdfWithSave 
              policyData={selectedPolicyForPdf}
              onClose={() => {
                setShowPdfModal(false);
                setSelectedPolicyForPdf(null);
              }}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* نموذج تجديد الوثيقة */}
      <Modal show={showRenewModal} onHide={() => setShowRenewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>تجديد وثيقة التأمين</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPolicy && (
            <>
              <Alert variant="info">
                <h6>تأكيد تجديد الوثيقة</h6>
                <p className="mb-0">
                  هل تريد تجديد وثيقة التأمين الصحي؟
                </p>
              </Alert>
              
              <div className="p-3 bg-light rounded mb-3">
                <h6>تفاصيل الوثيقة الحالية:</h6>
                <Row>
                  <Col md={6}>
                    <small className="text-muted">رقم الوثيقة:</small>
                    <p><strong>{selectedPolicy.policy_number}</strong></p>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted">الشركة:</small>
                    <p><strong>{selectedPolicy.company_name || selectedPolicy.company?.name}</strong></p>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted">تاريخ الانتهاء:</small>
                    <p className="text-danger">
                      <strong>{new Date(selectedPolicy.expiry_date).toLocaleDateString('ar-SA')}</strong>
                    </p>
                  </Col>
                  <Col md={6}>
                    <small className="text-muted">القسط الحالي:</small>
                    <p className="text-success">
                      <strong>{parseFloat(selectedPolicy.total_premium || 0).toLocaleString()} دولار</strong>
                    </p>
                  </Col>
                </Row>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRenewModal(false)}>
            إلغاء
          </Button>
          <Button variant="success" onClick={handleRenewConfirm}>
            <FaSync className="me-1" />
            نعم، بدء التجديد
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HealthInsurancePolicies;