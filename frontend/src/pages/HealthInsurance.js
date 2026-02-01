// src/pages/HealthInsurance.js
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import HealthEstablishmentForm from "../components/HealthEstablishmentForm";
import HealthPremiumCalculator from "../components/HealthPremiumCalculator";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./HealthInsurance.css";
import { useNavigate } from "react-router-dom";
import HealthInsuranceTypeSelector from "../components/HealthInsuranceTypeSelector";
import AdvancedPremiumCalculator from "../components/AdvancedPremiumCalculator";
import ManualEmployeesEntryModal from "../components/ManualEmployeesEntryModal";
import HealthInsuranceQuotes from '../components/HealthInsuranceQuotes';
import HealthInsurancePolicies from '../components/HealthInsurancePolicies';

// تعريف القطاعات (نفس الموجود في HealthEstablishmentForm)
const ALL_SECTORS = [
  { value: "health_hospital", label: "مستشفى", icon: "🏥" },
  { value: "health_clinic", label: "عيادة", icon: "🏩" },
  { value: "health_pharmacy", label: "صيدلية", icon: "💊" },
  { value: "health_lab", label: "مختبر طبي", icon: "🔬" },
  { value: "health_center", label: "مركز طبي", icon: "🏢" },
  { value: "health_dental", label: "عيادة أسنان", icon: "🦷" },
  { value: "health_optical", label: "مركز بصريات", icon: "👓" },
  { value: "health_other", label: "خدمات صحية أخرى", icon: "🏥" },
  { value: "tech_software", label: "شركة برمجيات", icon: "💻" },
  { value: "tech_web", label: "تطوير مواقع وتطبيقات", icon: "🌐" },
  { value: "tech_ai", label: "ذكاء اصطناعي", icon: "🤖" },
  { value: "tech_cyber", label: "أمن سيبراني", icon: "🔒" },
  { value: "tech_cloud", label: "حوسبة سحابية", icon: "☁️" },
  { value: "tech_gaming", label: "ألعاب إلكترونية", icon: "🎮" },
  { value: "tech_other", label: "تكنولوجيا أخرى", icon: "💻" },
  { value: "construction_civil", label: "مقاولات إنشائية", icon: "🏗️" },
  { value: "construction_electrical", label: "مقاولات كهرباء", icon: "⚡" },
  { value: "construction_mechanical", label: "مقاولات ميكانيكا", icon: "🔧" },
  { value: "construction_roads", label: "مقاولات طرق وجسور", icon: "🛣️" },
  { value: "construction_decoration", label: "تشطيب وديكور", icon: "🎨" },
  { value: "construction_other", label: "مقاولات أخرى", icon: "🏗️" },
  { value: "retail_store", label: "متجر تجزئة", icon: "🏪" },
  { value: "wholesale", label: "توزيع وتجارة جملة", icon: "📦" },
  { value: "ecommerce", label: "متجر إلكتروني", icon: "🛒" },
  { value: "retail_other", label: "تجارة أخرى", icon: "🏪" },
  { value: "services_logistics", label: "شركة شحن ولوجستيات", icon: "🚚" },
  { value: "services_cleaning", label: "خدمات نظافة", icon: "🧹" },
  { value: "services_maintenance", label: "صيانة وخدمات فنية", icon: "🔨" },
  { value: "services_transport", label: "نقل ومواصلات", icon: "🚌" },
  { value: "services_other", label: "خدمات أخرى", icon: "🛠️" },
  { value: "other", label: "أخرى", icon: "🏢" },
];

function HealthInsurance() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("companies");
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [error, setError] = useState("");
  const [acceptingQuoteId, setAcceptingQuoteId] = useState(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [availableSectors, setAvailableSectors] = useState([]);
  const [selectedInsuranceType, setSelectedInsuranceType] = useState("B");
  const [showAdvancedCalculator, setShowAdvancedCalculator] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [policyDetail, setPolicyDetail] = useState(null);
  const [showPolicyDetail, setShowPolicyDetail] = useState(false);
  const [loadingPolicyDetail, setLoadingPolicyDetail] = useState(false);
  const [coveragePlans, setCoveragePlans] = useState([]);
  const [employeesData, setEmployeesData] = useState([]);
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchCoveragePlans();
  }, []);

  useEffect(() => {
  const handleTabChange = (event) => {
    const { tab } = event.detail;
    if (tab === 'quotes') {
      setActiveTab('quotes');
      setShowPolicyDetail(false);
    }
  };

  window.addEventListener('change-tab', handleTabChange);
  
  return () => {
    window.removeEventListener('change-tab', handleTabChange);
  };
}, []);

  useEffect(() => {
    const handleQuoteAccepted = (event) => {
      const { policy, quoteId } = event.detail;
      
      console.log('📥 حدث قبول الاقتباس استلم:', policy, quoteId);
      
      // تحديث قائمة الوثائق
      setPolicies(prev => [policy, ...prev]);
      
      // إظهار رسالة نجاح
      setSuccessMessage(`✅ تم إنشاء وثيقة جديدة: ${policy.policy_number}`);
      
      // تحديث الاقتباسات
      fetchUserData();
      
      // الانتقال إلى تبويب الوثائق بعد تأخير
      setTimeout(() => {
        setActiveTab('policies');
        setShowPolicyDetail(false);
      }, 2000);
    };

    window.addEventListener('quote-accepted', handleQuoteAccepted);
    
    return () => {
      window.removeEventListener('quote-accepted', handleQuoteAccepted);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔍 جاري تحميل بيانات الشركات...");

      // Fetch companies
      const companiesResponse = await api.get("api/health/companies/");

      // تأكد أن البيانات موجودة ومصفوفة
      const allCompanies = Array.isArray(companiesResponse.data)
        ? companiesResponse.data
        : [];

      console.log(`✅ عدد الشركات المستلمة: ${allCompanies.length}`);

      if (allCompanies.length > 0) {
        console.log(
          "📋 أسماء الشركات:",
          allCompanies.map((c) => `${c.id}: ${c.name}`),
        );
      } else {
        console.warn("⚠️ لا توجد شركات للمستخدم!");
      }

      setCompanies(allCompanies);
      setFilteredCompanies(allCompanies);

      // استخراج القطاعات المتاحة للمستخدم
      const userSectors = [
        ...new Set(allCompanies.map((c) => c.sector).filter(Boolean)),
      ];

      console.log("🏭 القطاعات المتاحة:", userSectors);

      setAvailableSectors(userSectors);

      if (userSectors.length > 0 && !selectedSector) {
        setSelectedSector(userSectors[0]);
        filterCompaniesBySector(userSectors[0]);
      }

      // Fetch quotes
      const quotesResponse = await api.get(
        "api/health/health-insurance-quotes/",
      );
      setQuotes(quotesResponse.data);

      // Fetch policies
      const policiesResponse = await api.get(
        "api/health/health-insurance-policies/",
      );
      setPolicies(policiesResponse.data);
    } catch (error) {
      console.error("❌ Error fetching health insurance data:", error);

      if (error.response?.status === 401) {
        setError("انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.");
      } else {
        setError("فشل تحميل البيانات. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCoveragePlans = async () => {
    try {
      const response = await api.get("api/health/health-coverage-plans/");
      setCoveragePlans(response.data);
    } catch (error) {
      console.error("Error fetching coverage plans:", error);
    }
  };

  // فلترة الشركات حسب القطاع
  const filterCompaniesBySector = (sector) => {
    setSelectedSector(sector);

    if (sector === "") {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter((company) => company.sector === sector);
      setFilteredCompanies(filtered);
    }
  };

  // الحصول على اسم القطاع
  const getSectorName = (sectorValue) => {
    const sector = ALL_SECTORS.find((s) => s.value === sectorValue);
    return sector ? sector.label : sectorValue;
  };

  // الحصول على أيقونة القطاع
  const getSectorIcon = (sectorValue) => {
    const sector = ALL_SECTORS.find((s) => s.value === sectorValue);
    return sector ? sector.icon : "🏢";
  };

  const fetchAndShowPolicyDetail = async (policyId) => {
    try {
      setLoadingPolicyDetail(true);
      const response = await api.get(
        `api/health/health-insurance-policies/${policyId}/`,
      );
      setPolicyDetail(response.data);
      setSelectedPolicyId(policyId);
      setShowPolicyDetail(true);
      setActiveTab("policies");
    } catch (error) {
      console.error("❌ Error fetching health policy:", error);
      alert("❌ فشل تحميل تفاصيل الوثيقة");
      setShowPolicyDetail(false);
      setPolicyDetail(null);
    } finally {
      setLoadingPolicyDetail(false);
    }
  };

  

  const handleCompanyAdded = (newCompany) => {
    setCompanies([newCompany, ...companies]);
    setAvailableSectors([...new Set([...availableSectors, newCompany.sector])]);
    filterCompaniesBySector(newCompany.sector);
    setShowCompanyForm(false);
    setSelectedCompany(newCompany);
    setActiveTab("calculator");
    setShowCalculator(true);
  };

  const handleGetQuote = (company) => {
    console.log("🔍 اختيار شركة للاقتباس:", company);

    setSelectedCompany({
      ...company,
      sector: company.sector || "",
      size_category: company.size_category || "small",
      total_employees: company.total_employees || 1,
      city: company.city || "صنعاء",
      work_environment: company.work_environment || "office",
      risk_level: company.risk_level || "medium",
      establishment_age: company.establishment_age || 1,
      has_previous_insurance: company.has_previous_insurance || false,
      previous_insurance_years: company.previous_insurance_years || 0,
      claims_history: company.claims_history || 0,
    });

    setActiveTab("calculator");
    setShowCalculator(true);

    console.log("✅ تم تعيين الشركة المختارة:", company.name);
  };

  const handleQuoteCreated = () => {
    fetchUserData();
    setShowCalculator(false);
    setActiveTab("quotes");
  };

  const handleViewDetails = async (quoteId) => {
    try {
      setSelectedQuoteId(quoteId);
      const response = await api.get(
        `api/health/health-insurance-quotes/${quoteId}/`,
      );
      setQuoteDetails(response.data);
      setShowQuoteModal(true);
    } catch (error) {
      console.error("❌ Error fetching health quote details:", error);
      alert("❌ فشل تحميل تفاصيل الاقتباس");
    }
  };

  const uploadEmployeesFile = async (companyId, file) => {
    try {
      console.log(`📤 رفع ملف موظفين للشركة ${companyId}...`);

      const formData = new FormData();
      formData.append("employees_file", file);

      const response = await api.post(
        `/api/health/companies/${companyId}/upload-employees/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("✅ تم رفع ملف الموظفين:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ خطأ في رفع ملف الموظفين:", error);
      throw error;
    }
  };

  const handleDeleteCompany = async (companyId, companyName) => {
    // تأكيد الحذف
    if (
      !window.confirm(
        `هل أنت متأكد من حذف الشركة "${companyName}"؟\n\n⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع بيانات الشركة والاقتباسات المرتبطة بها.`,
      )
    ) {
      return;
    }

    // تأكيد إضافي للحماية
    const confirmName = prompt(
      `للتأكيد، اكتب اسم الشركة "${companyName}" لحذفها:`,
    );
    if (confirmName !== companyName) {
      alert("❌ اسم الشركة غير متطابق. تم إلغاء الحذف.");
      return;
    }

    setLoading(true);

    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      console.log(`🗑️ محاولة حذف الشركة ${companyId}: ${companyName}`);

      // خيار 1: استخدام API المخصص
      const response = await api.delete(
        `/api/health/companies/${companyId}/delete-with-confirmation/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // خيار 2: أو استخدام الـ API العادي
      // const response = await api.delete(`/api/health/companies/${companyId}/`, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });

      if (response.data.success || response.status === 204) {
        console.log("✅ تم حذف الشركة بنجاح:", response.data);

        // تحديث قائمة الشركات
        const updatedCompanies = companies.filter((c) => c.id !== companyId);
        setCompanies(updatedCompanies);
        setFilteredCompanies(updatedCompanies);

        // إذا كانت الشركة المحذوفة هي المختارة حالياً
        if (selectedCompany && selectedCompany.id === companyId) {
          setSelectedCompany(null);
          setEmployeesData([]);
          setShowCalculator(false);
        }

        // إظهار رسالة نجاح
        setSuccessMessage(`✅ تم حذف الشركة "${companyName}" بنجاح`);

        // تحديث الاقتباسات أيضاً إذا كانت مرتبطة
        fetchUserData();
      }
    } catch (error) {
      console.error("❌ خطأ في حذف الشركة:", error);

      let errorMessage = "فشل حذف الشركة";

      if (error.response) {
        console.log("📋 تفاصيل الخطأ:", error.response.data);

        if (error.response.status === 403) {
          errorMessage = "❌ ليس لديك صلاحية لحذف هذه الشركة";
        } else if (error.response.status === 404) {
          errorMessage = "❌ الشركة غير موجودة";
        } else if (error.response.status === 400) {
          errorMessage = `❌ ${error.response.data.error || error.response.data.detail || "لا يمكن حذف الشركة"}`;
        } else if (
          error.response.data &&
          typeof error.response.data === "object"
        ) {
          const errors = Object.entries(error.response.data)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(", ") : value}`,
            )
            .join(" | ");
          errorMessage = `❌ ${errors}`;
        }
      } else if (error.request) {
        errorMessage = "❌ لا يمكن الاتصال بالخادم";
      }

      setError(errorMessage);

      // محاولة بديلة: إخفاء الشركة من الواجهة فقط
      if (error.response?.status === 500 || error.response?.status === 405) {
        const userConfirmed = window.confirm(
          "الخادم رفض الحذف. هل تريد إخفاء الشركة من القائمة فقط؟",
        );
        if (userConfirmed) {
          const updatedCompanies = companies.filter((c) => c.id !== companyId);
          setCompanies(updatedCompanies);
          setFilteredCompanies(updatedCompanies);
          setSuccessMessage(
            `⚠️ تم إخفاء الشركة "${companyName}" من القائمة (لم تحذف من قاعدة البيانات)`,
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // استخدمه في اختيار الشركة
  const handleSelectCompany = async (companyId) => {
    // ... اختيار الشركة

    // بعد اختيار الشركة، تحقق من وجود ملف موظفين
    const company = companies.find((c) => c.id === companyId);
    if (company && !company.employees_file) {
      // عرض رسالة للمستخدم لرفع ملف موظفين
      alert("الرجاء رفع ملف الموظفين لهذه الشركة أولاً");
      // أو عرض زر لرفع الملف
    }
  };

  const handleAcceptQuote = async (quoteId) => {
    if (!window.confirm("هل أنت متأكد من قبول هذا الاقتباس؟")) {
      return;
    }

    setAcceptingQuoteId(quoteId);

    try {
      const response = await api.post(
        `api/health/health-insurance-quotes/${quoteId}/accept/`,
      );

      if (response.data.success) {
        setSuccessMessage(response.data.message || "تم قبول الاقتباس بنجاح!");

        const updatedQuotes = quotes.map((quote) => {
          if (quote.id === quoteId) {
            return {
              ...quote,
              status: "accepted",
              policy_info: response.data.policy || {},
            };
          }
          return quote;
        });

        setQuotes(updatedQuotes);

        setTimeout(() => {
          fetchUserData();
        }, 1000);
      } else {
        throw new Error(response.data.message || "Unknown error");
      }
    } catch (error) {
      console.error("❌ Error accepting health quote:", error);
      alert(`❌ Error: ${error.message || "فشل قبول الاقتباس"}`);
    } finally {
      setAcceptingQuoteId(null);
    }
  };

  const handleGenerateCertificate = async (policyId) => {
    try {
      const response = await api.get(
        `api/health/health-insurance-policies/${policyId}/generate-certificate/`,
      );

      if (response.data.certificate_html) {
        const certificateWindow = window.open();
        certificateWindow.document.write(response.data.certificate_html);
        certificateWindow.document.close();
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("❌ لا يمكن إنشاء الشهادة. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleDownloadInsuranceGuide = async () => {
    try {
      const response = await api.get("api/health/download-insurance-guide/");

      if (response.data) {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "دليل_أنواع_التأمين_الصحي.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("❌ Error downloading guide:", error);
      alert("❌ فشل تحميل الدليل. يرجى المحاولة مرة أخرى.");
    }
  };

  const fetchEmployeesData = async (companyId) => {
    console.log("🔄 fetchEmployeesData called with companyId:", companyId);
    
    try {
      console.log("📊 جلب بيانات الموظفين للشركة", companyId);
      
      // ✅ المحاولة الأولى: استخدام الـ endpoint الصحيح /employees/
      try {
        console.log("🔍 محاولة جلب الموظفين من /api/health/companies/{id}/employees/ ...");
        
        const response = await api.get(
          `/api/health/companies/${companyId}/employees/`
        );
        
        console.log("✅ استجابة /employees/:", response.data);
        
        if (response.data.success && response.data.employees) {
          const employees = response.data.employees;
          console.log(`✅ تم جلب ${employees.length} موظف من قاعدة البيانات`);
          
          // تنسيق البيانات
          const formattedEmployees = formatExtractedEmployees(employees);
          
          return {
            success: true,
            employees: formattedEmployees,
            total: employees.length,
            source: 'database',
            company_name: response.data.company_name
          };
        } else if (response.data.success && response.data.employees && response.data.employees.length === 0) {
          // لا توجد بيانات
          return {
            success: true,
            employees: [],
            total: 0,
            message: response.data.message || 'لا توجد بيانات موظفين'
          };
        }
      } catch (apiError) {
        console.log("⚠️ فشل جلب البيانات من /employees/:", apiError.message);
      }
      
      // ✅ المحاولة الثانية: جلب بيانات الشركة مباشرة
      try {
        console.log("🔍 محاولة جلب بيانات الشركة...");
        
        const companyResponse = await api.get(
          `/api/health/companies/${companyId}/`
        );
        
        console.log("✅ بيانات الشركة:", companyResponse.data);
        
        // تحقق من وجود employees_data
        if (companyResponse.data.employees_data && 
            companyResponse.data.employees_data.employees) {
          
          const employees = companyResponse.data.employees_data.employees;
          console.log(`✅ تم جلب ${employees.length} موظف من employees_data`);
          
          const formattedEmployees = formatExtractedEmployees(employees);
          
          return {
            success: true,
            employees: formattedEmployees,
            total: employees.length,
            source: 'employees_data'
          };
        }
        
        // إذا كان هناك total_employees > 0
        if (companyResponse.data.total_employees > 0) {
          return {
            success: false,
            error: `الشركة لديها ${companyResponse.data.total_employees} موظف مسجلين في قاعدة البيانات. 
                    لكن لا يمكن جلب تفاصيلهم. جاري العمل على إصلاح هذه المشكلة.`,
            employees: [],
            total: 0
          };
        }
        
      } catch (companyError) {
        console.log("⚠️ فشل جلب بيانات الشركة:", companyError.message);
      }
      
      // ❌ لا توجد بيانات
      return {
        success: false,
        error: 'لم يتم العثور على بيانات الموظفين. يرجى رفع ملف الموظفين أولاً.',
        employees: [],
        total: 0
      };
      
    } catch (error) {
      console.error("💥 خطأ غير متوقع في fetchEmployeesData:", error);
      return {
        success: false,
        error: 'حدث خطأ غير متوقع في جلب بيانات الموظفين',
        employees: [],
        total: 0
      };
    }
  };

  const formatExtractedEmployees = (rawEmployees) => {
    return rawEmployees.map((emp, index) => {
      // استخراج البيانات من الأعمدة المختلفة
      const name = emp['الاسم_الكامل'] || emp['اسم الموظف'] || emp['الاسم'] || emp['Name'] || `موظف ${index + 1}`;
      const employeeNumber = emp['الرقم_الوظيفي'] || emp['رقم الموظف'] || emp['Employee Number'] || `EMP-${index + 1}`;
      const gender = emp['الجنس'] || emp['النوع'] || emp['Gender'] || 'ذكر';
      const birthDate = emp['تاريخ_الميلاد'] || emp['تاريخ الميلاد'] || emp['Date of Birth'] || '1990-01-01';
      const salary = emp['الراتب'] || emp['المرتب'] || emp['Salary'] || 3000;
      const maritalStatus = emp['الحالة_الاجتماعية'] || emp['الحالة'] || emp['Marital Status'] || 'أعزب';
      const childrenCount = emp['عدد_الأبناء'] || emp['عدد الأبناء'] || emp['Children Count'] || 0;
      const jobTitle = emp['المسمى_الوظيفي'] || emp['الوظيفة'] || emp['Job Title'] || 'موظف';
      const department = emp['القسم'] || emp['الإدارة'] || emp['Department'] || 'عام';
      
      return {
        id: emp.id || index + 1,
        full_name: name,
        employee_number: employeeNumber,
        gender: normalizeGender(gender),
        date_of_birth: normalizeDate(birthDate),
        salary: parseFloat(salary) || 3000,
        marital_status: normalizeMaritalStatus(maritalStatus),
        children_count: parseInt(childrenCount) || 0,
        parents_count: emp['عدد_الوالدان'] || emp['عدد الوالدين'] || 0,
        wives_count: emp['عدد_الزوجات'] || emp['عدد الزوجات'] || 0,
        age: calculateAge(normalizeDate(birthDate)) || 30,
        job_title: jobTitle,
        department: department,
        email: emp['البريد_الإلكتروني'] || emp['Email'] || '',
        phone: emp['رقم_الهاتف'] || emp['Phone'] || '',
        notes: emp['ملاحظات'] || emp['Notes'] || '',
        raw_data: emp  // حفظ البيانات الخام للرجوع إليها
      };
    });
  };

  const normalizeGender = (gender) => {
    if (!gender) return 'ذكر';
    const g = gender.toString().trim().toLowerCase();
    
    if (g.includes('ذ') || g.includes('رجل') || g.includes('male') || g.includes('m') || g === '1') {
      return 'ذكر';
    } else if (g.includes('ؤ') || g.includes('انثى') || g.includes('female') || g.includes('f') || g === '2') {
      return 'أنثى';
    }
    return 'ذكر';
  };

  const normalizeMaritalStatus = (status) => {
    if (!status) return 'أعزب';
    const s = status.toString().trim().toLowerCase();
    
    if (s.includes('متزوج') || s.includes('married')) return 'متزوج';
    if (s.includes('أعزب') || s.includes('single')) return 'أعزب';
    if (s.includes('مطلق') || s.includes('divorced')) return 'مطلق';
    if (s.includes('أرمل') || s.includes('widowed')) return 'أرمل';
    
    return 'أعزب';
  };

  const normalizeDate = (dateStr) => {
    if (!dateStr) return '1990-01-01';
    
    try {
      // محاولة تحويل التنسيقات المختلفة
      const str = dateStr.toString().trim();
      
      // إذا كان تاريخ Excel (رقم)
      if (!isNaN(str) && str > 0) {
        const excelDate = parseInt(str);
        const date = new Date((excelDate - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
      }
      
      // محاولة تحليل تنسيقات التاريخ المختلفة
      const formats = [
        /(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/, // YYYY-MM-DD
        /(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/, // DD-MM-YYYY
      ];
      
      for (const format of formats) {
        const match = str.match(format);
        if (match) {
          let year, month, day;
          
          if (match[1].length === 4) {
            // YYYY-MM-DD
            year = match[1];
            month = match[2].padStart(2, '0');
            day = match[3].padStart(2, '0');
          } else {
            // DD-MM-YYYY
            day = match[1].padStart(2, '0');
            month = match[2].padStart(2, '0');
            year = match[3];
          }
          
          return `${year}-${month}-${day}`;
        }
      }
      
      // إذا فشل كل شيء، حاول استخدام Date
      const date = new Date(str);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
    } catch (error) {
      console.warn(`⚠️ خطأ في تحويل التاريخ: ${dateStr}`, error);
    }
    
    return '1990-01-01';
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 30;
    try {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
      ) {
        age--;
      }
      return age;
    } catch {
      return 30;
    }
  };

  const generateDummyEmployees = (count) => {
    const employees = [];

    for (let i = 1; i <= count; i++) {
      const isMale = Math.random() > 0.3;
      const isMarried = Math.random() > 0.4;

      employees.push({
        id: i,
        full_name: isMale ? `موظف ${i}` : `موظفة ${i}`,
        employee_number: `EMP${1000 + i}`,
        gender: isMale ? "ذكر" : "أنثى",
        date_of_birth: `19${80 + Math.floor(Math.random() * 20)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
        salary: 3000 + Math.floor(Math.random() * 5000),
        marital_status: isMarried ? "متزوج" : "أعزب",
        children_count: isMarried ? Math.floor(Math.random() * 4) : 0,
        parents_count: isMarried ? 2 : 0,
        wives_count:
          isMarried && isMale ? Math.floor(Math.random() * 2) + 1 : 0,
        age: 25 + Math.floor(Math.random() * 20),
        job_title: "موظف",
        department: "عام",
        email: `employee${i}@company.com`,
        phone: `77${Math.floor(Math.random() * 10000000)
          .toString()
          .padStart(7, "0")}`,
        notes: "",
      });
    }

    console.log(`✅ تم إنشاء ${employees.length} موظف افتراضي`);
    return employees;
  };

  const generateMockEmployees = (companyId) => {
    const employees = [];
    const company = companies.find((c) => c.id === companyId);
    const employeeCount = company?.total_employees || 5;

    for (let i = 1; i <= employeeCount; i++) {
      const isMale = Math.random() > 0.3;

      const employee = {
        id: i,
        full_name: isMale ? `موظف ${i}` : `موظفة ${i}`,
        date_of_birth: `198${Math.floor(Math.random() * 10)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
        gender: isMale ? "ذكر" : "أنثى",
        salary: 3000 + Math.floor(Math.random() * 5000),
        marital_status: Math.random() > 0.4 ? "متزوج" : "أعزب",
        number_of_spouses:
          isMale && Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 1,
        children_count: Math.floor(Math.random() * 5),
        include_parents: Math.random() > 0.5 ? "نعم" : "لا",
        position: ["مدير", "مطور", "محاسب", "مندوب", "سكرتير"][i % 5],
        email: `employee${i}@company.com`,
        phone: `77${Math.floor(Math.random() * 10000000)
          .toString()
          .padStart(7, "0")}`,
        address: `عنوان ${i}`,
        is_pregnant: !isMale && Math.random() > 0.8 ? "نعم" : "لا",
        chronic_diseases:
          Math.random() > 0.8
            ? ["ضغط", "سكري"][Math.floor(Math.random() * 2)]
            : "لا",
      };

      employees.push(employee);
    }

    return employees;
  };

  const closeSuccessMessage = () => {
    setSuccessMessage("");
  };

  

  if (loading) {
    return (
      <div className="page-container">
        <Header />
        <div className="loading">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        {/* رسالة النجاح */}
        {successMessage && (
          <div className="success-message">
            <span>✅ {successMessage}</span>
            <button className="close-btn" onClick={closeSuccessMessage}>
              ✕
            </button>
          </div>
        )}

        {/* رسالة الخطأ */}
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
            <button className="close-btn" onClick={() => setError("")}>
              ✕
            </button>
          </div>
        )}

        {/* Header */}
        <div className="page-header">
          <h1>🏥 التأمين الصحي للمنشآت</h1>
          <p className="welcome-message">
            مرحباً، {user?.first_name || user?.username}!
            <span className="account-badge">حساب منشأة</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "companies" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("companies");
              setShowPolicyDetail(false);
              setShowCalculator(false);
              setShowAdvancedCalculator(false);
            }}
          >
            🏥 شركاتي ({companies.length})
          </button>

          <button
            className={`tab ${activeTab === "quotes" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("quotes");
              setShowPolicyDetail(false);
              setShowCalculator(false);
              setShowAdvancedCalculator(false);
            }}
          >
            💰 اقتباسات التأمين ({quotes.length})
          </button>

          <button
            className={`tab ${activeTab === "policies" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("policies");
              setShowCalculator(false);
              setShowAdvancedCalculator(false);
            }}
          >
            📄{" "}
            {showPolicyDetail
              ? "تفاصيل الوثيقة"
              : `الوثائق (${policies.length})`}
          </button>

          <button
            className={`tab ${activeTab === "insurance-types" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("insurance-types");
              setShowPolicyDetail(false);
              setShowCalculator(false);
              setShowAdvancedCalculator(false);
            }}
          >
            📋 أنواع التأمين
          </button>

          <button
            className={`tab ${activeTab === "calculator" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("calculator");
              setShowCalculator(true);
              setShowPolicyDetail(false);
              setShowAdvancedCalculator(false);

              if (selectedCompany && !employeesData.length) {
                fetchEmployeesData(selectedCompany.id);
              }
            }}
          >
            🧮 حاسبة الأقساط
          </button>
        </div>

        {/* Companies Tab */}
        {activeTab === "companies" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>شركاتي ({companies.length})</h2>
              <button
                className="btn-primary"
                onClick={() => setShowCompanyForm(true)}
              >
                + إضافة شركة جديدة
              </button>
            </div>

            {/* إحصائيات الشركات */}
            <div className="companies-stats">
              <div>
                <h3>📊 إحصائيات الشركات</h3>
                <p>لديك {companies.length} شركة مسجلة</p>
              </div>
              <div className="total-employees">
                {companies.reduce(
                  (sum, c) => sum + (c.total_employees || 0),
                  0,
                )}{" "}
                👥 إجمالي الموظفين
              </div>
            </div>

            {/* عرض جميع الشركات */}
            <div className="companies-container">
              {companies.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏢</div>
                  <h3>لا توجد شركات مسجلة</h3>
                  <p>
                    أضف شركتك الأولى للبدء في تأمين موظفيك والحصول على عروض
                    مخصصة
                  </p>
                  <button
                    className="btn-primary"
                    onClick={() => setShowCompanyForm(true)}
                  >
                    + إضافة شركتك الأولى
                  </button>
                </div>
              ) : (
                <>
                  <div className="companies-grid">
                    {companies.map((company) => (
                      <div key={company.id} className="company-card">
                        <div className="company-card-header">
                          <div className="company-icon">
                            {getSectorIcon(company.sector)}
                          </div>
                          <div className="company-info">
                            <h3>{company.name}</h3>
                            <div className="company-tags">
                              <span>📍 {company.city || "غير محدد"}</span>
                              <span>🏷️ {getSectorName(company.sector)}</span>
                            </div>
                          </div>
                          <div className="employee-count">
                            {company.total_employees || 0} 👥
                          </div>
                        </div>

                        <div className="company-details-grid">
                          <div>
                            <div className="detail-label">رقم السجل</div>
                            <div className="detail-value">
                              {company.cr_number || "غير محدد"}
                            </div>
                          </div>
                          <div>
                            <div className="detail-label">عمر الشركة</div>
                            <div className="detail-value">
                              {company.establishment_age || 1} سنة
                            </div>
                          </div>
                          <div>
                            <div className="detail-label">
                              البريد الإلكتروني
                            </div>
                            <div className="detail-value email">
                              {company.email || "غير محدد"}
                            </div>
                          </div>
                          <div>
                            <div className="detail-label">رقم الهاتف</div>
                            <div className="detail-value phone">
                              {company.phone || "غير محدد"}
                            </div>
                          </div>
                        </div>

                        <div className="company-actions">
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setActiveTab("calculator");
                              setShowAdvancedCalculator(true);
                            }}
                            className="btn-calculate"
                          >
                            <span>🧮</span> احتساب قسط
                          </button>
                          <button
                            onClick={() => handleGetQuote(company)}
                            className="btn-details"
                          >
                            <span>📋</span> عرض التفاصيل
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteCompany(company.id, company.name)
                            }
                            className="btn-delete"
                            title="حذف هذه الشركة"
                          >
                            <span>🗑️</span> حذف
                          </button>
                        </div>

                        <div className="company-created">
                          🗓️ تم الإنشاء في{" "}
                          {new Date(company.created_at).toLocaleDateString(
                            "ar-SA",
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ملخص الشركات */}
                  <div className="companies-summary">
                    <h4>📈 ملخص الشركات</h4>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <div>إجمالي الشركات</div>
                        <div className="summary-value">{companies.length}</div>
                      </div>

                      <div className="summary-item">
                        <div>إجمالي الموظفين</div>
                        <div className="summary-value">
                          {companies.reduce(
                            (sum, c) => sum + (c.total_employees || 0),
                            0,
                          )}
                        </div>
                      </div>

                      <div className="summary-item sectors-summary">
                        <div>توزيع القطاعات</div>
                        <div className="sectors-tags">
                          {Array.from(new Set(companies.map((c) => c.sector)))
                            .slice(0, 4)
                            .map((sector) => (
                              <div key={sector} className="sector-tag">
                                <span>{getSectorIcon(sector)}</span>
                                <span>
                                  {
                                    companies.filter((c) => c.sector === sector)
                                      .length
                                  }
                                </span>
                              </div>
                            ))}
                          {Array.from(new Set(companies.map((c) => c.sector)))
                            .length > 4 && (
                            <div className="more-tag">
                              +
                              {Array.from(
                                new Set(companies.map((c) => c.sector)),
                              ).length - 4}{" "}
                              أكثر
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Quotes Tab */}
        {activeTab === "quotes" && (
  <div className="tab-content quotes-tab">
    <HealthInsuranceQuotes />
  </div>
)}

        {/* Policies Tab */}
        {activeTab === "policies" && (
  <div className="tab-content policies-tab">
    <HealthInsurancePolicies 
      policies={policies}
      loading={loading}
      onRefresh={fetchUserData}
      onViewPolicy={(policy) => {
        // يمكنك هنا التعامل مع عرض الوثيقة التفصيلي
        console.log('Viewing policy:', policy);
        // أو يمكنك فتح صفحة جديدة أو عرض modal
      }}
    />
  </div>
)}

        {/* Insurance Types Tab */}
        {activeTab === "insurance-types" && (
          <div className="tab-content">
            <HealthInsuranceTypeSelector
              onSelect={(typeId) => {
                setSelectedInsuranceType(typeId);
                setSuccessMessage(`تم اختيار نوع التأمين ${typeId}`);
              }}
              selectedType={selectedInsuranceType}
              onDownloadPDF={handleDownloadInsuranceGuide}
            />

            {/* دعوة للانتقال للحاسبة */}
            <div className="insurance-cta">
              <h3>🚀 جاهز لاحتساب الأقساط؟</h3>
              <p>
                بعد اختيار نوع التأمين المناسب، يمكنك الانتقال للحاسبة المتقدمة
              </p>

              <div className="cta-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (companies.length === 0) {
                      setActiveTab("companies");
                      setShowCompanyForm(true);
                      setSuccessMessage("الرجاء إضافة شركة جديدة أولاً");
                      return;
                    }
                    setActiveTab("calculator");
                    setShowAdvancedCalculator(true);
                  }}
                >
                  🧮 فتح الحاسبة المتقدمة
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === "calculator" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>🧮 حاسبة أقساط التأمين</h2>
              <div className="calculator-mode-switcher">
                {/* <button
                  className={`mode-btn ${!showAdvancedCalculator ? "active" : ""}`}
                  onClick={() => setShowAdvancedCalculator(false)}
                >
                  <span>📊</span> الحاسبة البسيطة
                </button> */}
                <button
                  className={`mode-btn ${showAdvancedCalculator ? "active" : ""}`}
                  onClick={() => {
                    if (!selectedCompany) {
                      alert("الرجاء اختيار شركة أولاً");
                      return;
                    }
                    setShowAdvancedCalculator(true);
                  }}
                >
                  <span>🚀</span> الحاسبة المتقدمة
                </button>
              </div>
            </div>

            {/* إذا لم يكن هناك شركة مختارة */}
            {!selectedCompany ? (
              <div className="calculator-empty-state">
                <div className="empty-icon">🏢</div>
                <h3>اختر شركة للبدء</h3>
                <p>لديك {companies.length} شركة. اختر واحدة لاحتساب القسط</p>

                {companies.length > 0 ? (
                  <div className="company-selector">
                    <select
                      className="company-dropdown"
                      onChange={(e) => {
                        const companyId = e.target.value;
                        if (companyId) {
                          const company = companies.find(
                            (c) => c.id === parseInt(companyId),
                          );
                          setSelectedCompany(company);
                          fetchEmployeesData(company.id);
                        }
                      }}
                      value=""
                    >
                      <option value="">-- اختر شركة --</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name} ({company.total_employees || 0} موظف)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setActiveTab("companies");
                      setShowCompanyForm(true);
                    }}
                  >
                    + إضافة شركة جديدة
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* معلومات الشركة المختارة */}
                {selectedCompany && (
                  <div className="selected-company-card">
                    <div className="company-info-header">
                      <div className="company-icon">
                        {getSectorIcon(selectedCompany.sector)}
                      </div>
                      <div className="company-info">
                        <h3>{selectedCompany.name}</h3>
                        <p>
                          <span>📍 {selectedCompany.city}</span>
                          <span> | </span>
                          <span>
                            👥 {selectedCompany.total_employees || 0} موظف
                          </span>
                          <span> | </span>
                          <span>
                            🏷️ {getSectorName(selectedCompany.sector)}
                          </span>
                        </p>
                      </div>
                      <div className="company-actions-row">
                        <button
                          className="btn-change-company"
                          onClick={() => setSelectedCompany(null)}
                        >
                          تغيير الشركة
                        </button>

                        {/* زر تحميل بيانات الموظفين */}
                        <button
                          className="btn-refresh-employees"
                          onClick={async () => {
                            if (!selectedCompany) {
                              alert("❌ لم يتم اختيار شركة");
                              return;
                            }

                            console.log(
                              "🔄 تحميل بيانات الموظفين للشركة:",
                              selectedCompany,
                            );

                            setLoading(true);
                            setError("");

                            try {
                              // استخراج ID الشركة بطرق مختلفة
                              const companyId =
                                selectedCompany.id ||
                                selectedCompany.pk ||
                                selectedCompany.company_id;

                              if (!companyId) {
                                throw new Error(
                                  "❌ لم يتم العثور على معرف الشركة",
                                );
                              }

                              console.log(
                                "🔍 معرف الشركة المستخدم:",
                                companyId,
                              );

                              // جلب بيانات الموظفين
                              await fetchEmployeesData(companyId);

                              setSuccessMessage(
                                `✅ تم تحميل بيانات الموظفين للشركة ${selectedCompany.name}`,
                              );
                            } catch (error) {
                              console.error(
                                "❌ خطأ في تحميل بيانات الموظفين:",
                                error,
                              );

                              // محاولة بديلة: استخدام localStorage
                              const storedKey = `employees_${selectedCompany.id}`;
                              const storedData =
                                localStorage.getItem(storedKey);

                              if (storedData) {
                                const parsedData = JSON.parse(storedData);
                                const employees = parsedData.data || [];

                                if (employees.length > 0) {
                                  setEmployeesData(employees);
                                  setSuccessMessage(
                                    `✅ تم تحميل ${employees.length} موظف من التخزين المحلي`,
                                  );
                                } else {
                                  setError("❌ لا توجد بيانات موظفين متاحة");
                                }
                              } else {
                                setError(
                                  "❌ " +
                                    (error.message ||
                                      "فشل تحميل بيانات الموظفين"),
                                );
                              }
                            } finally {
                              setLoading(false);
                            }
                          }}
                          title="تحميل بيانات الموظفين من ملف Excel المرفوع"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-small"></span>
                              جاري التحميل...
                            </>
                          ) : (
                            "🔄 تحميل بيانات الموظفين"
                          )}
                        </button>
                      </div>
                    </div>

                    {/* عرض حالة بيانات الموظفين */}
                    <div className="employees-status-card">
                      {/* عرض حالة بيانات الموظفين */}
                      <div className="data-status-card">
                        <h4>📊 حالة البيانات</h4>

                        <div className="status-grid">
                          <div className="status-item">
                            <span className="status-label">الشركة:</span>
                            <span className="status-value">
                              {selectedCompany.name}
                            </span>
                          </div>

                          <div className="status-item">
                            <span className="status-label">الـ ID:</span>
                            <span className="status-value">
                              {selectedCompany.id || "غير متوفر"}
                            </span>
                          </div>

                          <div className="status-item">
                            <span className="status-label">
                              الموظفون المحملون:
                            </span>
                            <span className="status-value">
                              {employeesData.length > 0
                                ? `${employeesData.length} موظف`
                                : "لم يتم التحميل"}
                            </span>
                          </div>

                          <div className="status-item">
                            <span className="status-label">المصدر:</span>
                            <span className="status-value">
                              {localStorage.getItem(
                                `employees_${selectedCompany.id}`,
                              )
                                ? "التخزين المحلي"
                                : selectedCompany.employees_file
                                  ? "ملف مرفوع"
                                  : "بيانات افتراضية"}
                            </span>
                          </div>
                        </div>

                        {/* زر لتفريغ البيانات المحلية */}
                        {localStorage.getItem(
                          `employees_${selectedCompany.id}`,
                        ) && (
                          <button
                            className="btn-clear-cache"
                            onClick={() => {
                              localStorage.removeItem(
                                `employees_${selectedCompany.id}`,
                              );
                              setSuccessMessage("🗑️ تم مسح البيانات المحلية");
                              setEmployeesData([]);
                            }}
                          >
                            🗑️ مسح البيانات المحلية
                          </button>
                        )}

                        {selectedCompany.employees_file && (
                          <div className="status-item">
                            <span className="status-label">
                              المعتمد للحساب:
                            </span>
                            <span className="status-value">
                              {employeesData.length > 0
                                ? `${employeesData.length} موظف (بيانات حقيقية)`
                                : "بيانات افتراضية"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* عرض إحصائيات الموظفين */}
                    {employeesData.length > 0 && (
                      <div className="employees-stats-card">
                        <h4>📈 إحصائيات الموظفين المحملين</h4>
                        <div className="stats-grid">
                          <div className="stat-box">
                            <span className="stat-label">العدد الكلي</span>
                            <span className="stat-value">
                              {employeesData.length}
                            </span>
                          </div>
                          <div className="stat-box">
                            <span className="stat-label">الذكور</span>
                            <span className="stat-value">
                              {
                                employeesData.filter((e) => e.gender === "ذكر")
                                  .length
                              }
                            </span>
                          </div>
                          <div className="stat-box">
                            <span className="stat-label">الإناث</span>
                            <span className="stat-value">
                              {
                                employeesData.filter((e) => e.gender === "أنثى")
                                  .length
                              }
                            </span>
                          </div>
                          <div className="stat-box">
                            <span className="stat-label">المتزوجون</span>
                            <span className="stat-value">
                              {
                                employeesData.filter(
                                  (e) =>
                                    e.marital_status === "متزوج" ||
                                    e.marital_status === "متزوجة",
                                ).length
                              }
                            </span>
                          </div>
                          <div className="stat-box">
                            <span className="stat-label">إجمالي الرواتب</span>
                            <span className="stat-value">
                              $
                              {employeesData
                                .reduce(
                                  (sum, emp) => sum + (emp.salary || 0),
                                  0,
                                )
                                .toLocaleString()}
                            </span>
                          </div>
                          <div className="stat-box">
                            <span className="stat-label">متوسط الراتب</span>
                            <span className="stat-value">
                              $
                              {Math.round(
                                employeesData.reduce(
                                  (sum, emp) => sum + (emp.salary || 0),
                                  0,
                                ) / employeesData.length,
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="stats-source">
                          {selectedCompany.employees_file ? (
                            <span className="source-badge success">
                              💾 مصدر البيانات: ملف Excel المرفوع (
                              {employeesData.length} سجل)
                            </span>
                          ) : (
                            <span className="source-badge warning">
                              ⚠️ مصدر البيانات: بيانات افتراضية (للاستمرار في
                              التطوير)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  )}
                  

    {/* عرض عينة من البيانات */}
    {employeesData.length > 0 && (
      <div className="employees-sample">
        <h5>📋 عينة من بيانات الموظفين ({employeesData.length} موظف):</h5>
        <div className="sample-table">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>الاسم</th>
                <th>الجنس</th>
                <th>العمر</th>
                <th>الراتب</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {employeesData.slice(0, 3).map((emp, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{emp.full_name}</td>
                  <td>
                    <span className={`gender-badge ${emp.gender === 'ذكر' ? 'male' : 'female'}`}>
                      {emp.gender}
                    </span>
                  </td>
                  <td>{emp.age} سنة</td>
                  <td>${emp.salary.toLocaleString()}</td>
                  <td>{emp.marital_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {employeesData.length > 3 && (
            <div className="sample-note">
              + {employeesData.length - 3} موظف إضافي
            </div>
          )}
        </div>
      </div>
    )}

                {/* اختيار نوع الحاسبة */}
                {showAdvancedCalculator ? (
                  // الحاسبة المتقدمة
                  <AdvancedPremiumCalculator
                    company={selectedCompany}
                    employeesData={employeesData}
                    insuranceType={selectedInsuranceType}
                    onCalculate={(result) => {
                      console.log("📊 نتيجة الحساب المتقدم:", result);
                      setSuccessMessage("تم احتساب الأقساط بنجاح!");
                      fetchUserData();
                    }}
                    onCancel={() => setShowAdvancedCalculator(false)}
                  />
                ) 
                : (
                  // الحاسبة البسيطة
                  <HealthPremiumCalculator
                    company={selectedCompany}
                    coveragePlans={coveragePlans}
                    onCancel={() => setShowCalculator(false)}
                    onQuoteCreated={handleQuoteCreated}
                  />
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Company Form Modal */}
      {showCompanyForm && (
        <div className="modal-overlay">
          <HealthEstablishmentForm
            onSuccess={handleCompanyAdded}
            onCancel={() => setShowCompanyForm(false)}
          />
        </div>
      )}

      {/* Quote Details Modal */}
      {showQuoteModal && quoteDetails && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>تفاصيل الاقتباس: {quoteDetails.quote_number}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowQuoteModal(false);
                  setQuoteDetails(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="details-section">
                <h3>معلومات الشركة</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>الاسم:</strong>{" "}
                    {quoteDetails.company?.name || "غير معروف"}
                  </div>
                  <div className="detail-item">
                    <strong>القطاع:</strong>{" "}
                    {getSectorName(quoteDetails.company?.sector)}
                  </div>
                  <div className="detail-item">
                    <strong>المدينة:</strong>{" "}
                    {quoteDetails.company?.city || "غير معروف"}
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>معلومات الاقتباس</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>خطة التغطية:</strong>
                    {quoteDetails.coverage_plan?.name}
                  </div>
                  <div className="detail-item">
                    <strong>القسط السنوي:</strong>
                    <span className="highlight">
                      {quoteDetails.total_premium?.toLocaleString()} دولار
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>القسط الشهري:</strong>{" "}
                    {quoteDetails.monthly_premium?.toLocaleString()} دولار
                  </div>
                  <div className="detail-item">
                    <strong>الحالة:</strong>
                    <span className={`status ${quoteDetails.status}`}>
                      {quoteDetails.status_display || quoteDetails.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                {quoteDetails.status === "quoted" && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowQuoteModal(false);
                      handleAcceptQuote(quoteDetails.id);
                    }}
                  >
                    ✅ قبول الاقتباس
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowQuoteModal(false)}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Employees Entry Modal */}
      {showManualEntry && selectedCompany && (
        <ManualEmployeesEntryModal
          company={selectedCompany}
          onSave={(data) => {
            setEmployeesData(data);
            setShowManualEntry(false);
            setSuccessMessage("✅ تم حفظ بيانات الموظفين بنجاح!");
          }}
          onCancel={() => setShowManualEntry(false)}
        />
      )}
    </div>
  );
}

export default HealthInsurance;
