// src/components/HealthEstablishmentForm.js
import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./HealthEstablishmentForm.css";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";

// ============= CONSTANTS =============

// جميع القطاعات المتاحة
const ALL_SECTORS = [
  // ======== القطاع الصحي ========
  { value: "health_hospital", label: "مستشفى", icon: "🏥", risk: "high" },
  { value: "health_clinic", label: "عيادة", icon: "🏩", risk: "medium" },
  { value: "health_pharmacy", label: "صيدلية", icon: "💊", risk: "low" },
  { value: "health_lab", label: "مختبر طبي", icon: "🔬", risk: "medium" },
  { value: "health_center", label: "مركز طبي", icon: "🏢", risk: "medium" },
  { value: "health_dental", label: "عيادة أسنان", icon: "🦷", risk: "medium" },
  { value: "health_optical", label: "مركز بصريات", icon: "👓", risk: "low" },
  {
    value: "health_other",
    label: "خدمات صحية أخرى",
    icon: "🏥",
    risk: "medium",
  },

  // ======== قطاع التكنولوجيا ========
  { value: "tech_software", label: "شركة برمجيات", icon: "💻", risk: "low" },
  { value: "tech_web", label: "تطوير مواقع وتطبيقات", icon: "🌐", risk: "low" },
  { value: "tech_ai", label: "ذكاء اصطناعي", icon: "🤖", risk: "low" },
  { value: "tech_cyber", label: "أمن سيبراني", icon: "🔒", risk: "low" },
  { value: "tech_cloud", label: "حوسبة سحابية", icon: "☁️", risk: "low" },
  { value: "tech_gaming", label: "ألعاب إلكترونية", icon: "🎮", risk: "low" },
  { value: "tech_other", label: "تكنولوجيا أخرى", icon: "💻", risk: "low" },

  // ======== قطاع المقاولات ========
  {
    value: "construction_civil",
    label: "مقاولات إنشائية",
    icon: "🏗️",
    risk: "very_high",
  },
  {
    value: "construction_electrical",
    label: "مقاولات كهرباء",
    icon: "⚡",
    risk: "high",
  },
  {
    value: "construction_mechanical",
    label: "مقاولات ميكانيكا",
    icon: "🔧",
    risk: "high",
  },
  {
    value: "construction_roads",
    label: "مقاولات طرق وجسور",
    icon: "🛣️",
    risk: "very_high",
  },
  {
    value: "construction_decoration",
    label: "تشطيب وديكور",
    icon: "🎨",
    risk: "medium",
  },
  {
    value: "construction_other",
    label: "مقاولات أخرى",
    icon: "🏗️",
    risk: "high",
  },

  // ======== قطاع تجارة ========
  { value: "retail_store", label: "متجر تجزئة", icon: "🏪", risk: "low" },
  { value: "wholesale", label: "توزيع وتجارة جملة", icon: "📦", risk: "low" },
  { value: "ecommerce", label: "متجر إلكتروني", icon: "🛒", risk: "low" },
  { value: "retail_other", label: "تجارة أخرى", icon: "🏪", risk: "low" },

  // ======== قطاع خدمات ========
  {
    value: "services_logistics",
    label: "شركة شحن ولوجستيات",
    icon: "🚚",
    risk: "medium",
  },
  {
    value: "services_cleaning",
    label: "خدمات نظافة",
    icon: "🧹",
    risk: "medium",
  },
  {
    value: "services_maintenance",
    label: "صيانة وخدمات فنية",
    icon: "🔨",
    risk: "medium",
  },
  {
    value: "services_transport",
    label: "نقل ومواصلات",
    icon: "🚌",
    risk: "high",
  },
  { value: "services_other", label: "خدمات أخرى", icon: "🛠️", risk: "medium" },

  // ======== أخرى ========
  { value: "other", label: "أخرى", icon: "🏢", risk: "medium" },
];

// تصنيف المجموعات
const SECTOR_GROUPS = {
  health: "🏥 قطاع صحي",
  tech: "💻 قطاع تكنولوجيا",
  construction: "🏗️ قطاع مقاولات",
  retail: "🏪 قطاع تجارة",
  services: "🛠️ قطاع خدمات",
  other: "🏢 أخرى",
};

// ============= دوال تحليل الملفات =============

// دالة لتحليل Excel
const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
          raw: false,
        });

        if (jsonData.length < 2) {
          resolve([]);
          return;
        }

        const headers = jsonData[0].map((h) =>
          h.toString().trim().toLowerCase(),
        );
        const employees = [];

        // التحقق من الحقول الأساسية
        const requiredFields = [
          "الاسم",
          "الجنس",
          "تاريخ_الميلاد",
          "الراتب",
          "المعالين",
        ];
        const missingFields = requiredFields.filter(
          (field) => !headers.includes(field.toLowerCase()),
        );

        if (missingFields.length > 0) {
          reject(new Error(`الحقول المفقودة: ${missingFields.join(", ")}`));
          return;
        }

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const employee = {};

          headers.forEach((header, index) => {
            if (index < row.length) {
              employee[header] = cleanValue(row[index]);
            }
          });

          // تطبيع البيانات
          employees.push(normalizeEmployeeData(employee));
        }

        resolve(employees);
      } catch (error) {
        reject(new Error(`خطأ في تحليل ملف Excel: ${error.message}`));
      }
    };

    reader.onerror = () => reject(new Error("فشل قراءة ملف Excel"));
    reader.readAsArrayBuffer(file);
  });
};

// تنظيف القيم
const cleanValue = (value) => {
  if (value === null || value === undefined || value === "") return "";
  let strValue = value.toString().trim();
  return strValue;
};

// تطبيع بيانات الموظف
const normalizeEmployeeData = (employee) => {
  const normalized = { ...employee };

  // 1. العمر من تاريخ الميلاد
  if (normalized.تاريخ_الميلاد) {
    try {
      const birthDate = new Date(normalized.تاريخ_الميلاد);
      const ageDiff = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDiff);
      normalized.age = Math.abs(ageDate.getUTCFullYear() - 1970);

      // تصحيح إذا كان العمر غير منطقي
      if (normalized.age < 18 || normalized.age > 70) {
        normalized.age = 25; // قيمة افتراضية
      }
    } catch {
      normalized.age = 25;
    }
  } else {
    normalized.age = 25;
  }

  // 2. الرواتب
  if (normalized.الراتب) {
    const salaryNum = parseFloat(normalized.الراتب);
    normalized.base_salary =
      isNaN(salaryNum) || salaryNum < 0 ? 3000 : salaryNum;
  } else {
    normalized.base_salary = 3000;
  }

  // 3. الجنس
  if (normalized.الجنس) {
    const genderLower = normalized.الجنس.toLowerCase();
    if (
      genderLower.includes("ذ") ||
      genderLower.includes("ر") ||
      genderLower.includes("male") ||
      genderLower.includes("m")
    ) {
      normalized.gender = "male";
    } else if (
      genderLower.includes("ؤ") ||
      genderLower.includes("ن") ||
      genderLower.includes("female") ||
      genderLower.includes("f")
    ) {
      normalized.gender = "female";
    } else {
      normalized.gender = "male";
    }
  } else {
    normalized.gender = "male";
  }

  // 4. المعالين (هام جداً!)
  if (normalized.المعالين) {
    const dependentsNum = parseInt(normalized.المعالين);
    normalized.dependents_count =
      isNaN(dependentsNum) || dependentsNum < 0 ? 0 : dependentsNum;

    // تقسيم المعالين حسب العمر (تقدير)
    normalized.dependents_by_age = {
      children_under_18: Math.min(normalized.dependents_count, 2), // تقدير
      adults: Math.max(0, normalized.dependents_count - 2),
    };
  } else {
    normalized.dependents_count = 0;
    normalized.dependents_by_age = { children_under_18: 0, adults: 0 };
  }

  // 5. الحالة الاجتماعية (استنتاج من عدد المعالين)
  normalized.marital_status =
    normalized.dependents_count > 0 ? "married" : "single";

  // 6. المسمى الوظيفي
  if (!normalized.المسمى_الوظيفي) {
    normalized.المسمى_الوظيفي = "موظف";
  }

  // 7. القسم
  if (!normalized.القسم) {
    normalized.القسم = "عام";
  }

  // 8. تاريخ الالتحاق
  if (normalized.تاريخ_الالتحاق) {
    try {
      normalized.join_date = new Date(normalized.تاريخ_الالتحاق);
      const yearsDiff =
        (Date.now() - normalized.join_date.getTime()) /
        (1000 * 60 * 60 * 24 * 365);
      normalized.service_years = Math.floor(yearsDiff);
    } catch {
      normalized.service_years = 1;
    }
  } else {
    normalized.service_years = 1;
  }

  // 9. الموقع
  if (!normalized.الموقع) {
    normalized.الموقع = "المكتب الرئيسي";
  }

  return normalized;
};

// تحميل قالب Excel
const downloadTemplate = () => {
  // نسخة مبسطة تعمل مع الدوال المختلفة
  const templateData = [
    {
      الاسم_الكامل: "محمد أحمد",
      الرقم_الوظيفي: "EMP001",
      الجنس: "ذكر",
      تاريخ_الميلاد: "1985-05-15",
      الراتب: "5000",
      الحالة_الاجتماعية: "متزوج",
      يشمل_الوالدين: "نعم",
      عدد_الأبناء: "3",
      عدد_الوالدان: "2",
      عدد_الزوجات: "1",
      الأمراض_المزمنة: "لا",
      الحمل: "لا",
      تاريخ_الالتحاق: "2018-03-10",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "الموظفين");

  // تنظيم الأعمدة
  const wscols = [
    { wch: 25 }, // الاسم_الكامل
    { wch: 15 }, // الرقم_الوظيفي
    { wch: 10 }, // الجنس
    { wch: 15 }, // تاريخ_الميلاد
    { wch: 12 }, // الراتب
    { wch: 15 }, // الحالة_الاجتماعية
    { wch: 15 }, // يشمل_الوالدين
    { wch: 12 }, // عدد_الأبناء
    { wch: 12 }, // عدد_الوالدان
    { wch: 12 }, // عدد_الزوجات
    { wch: 15 }, // الأمراض_المزمنة
    { wch: 10 }, // الحمل
    { wch: 15 }, // تاريخ_الالتحاق
  ];
  ws["!cols"] = wscols;

  // تعليمات
  const instructions = [
    ["📋 تعليمات مهمة:"],
    ["1. املأ جميع الحقول بدقة"],
    [
      "2. الأعمدة الإلزامية: الاسم_الكامل، الرقم_الوظيفي، الجنس، تاريخ_الميلاد، الراتب",
    ],
    ["3. الجنس: ذكر / أنثى"],
    ["4. الحالة الاجتماعية: أعزب / متزوج / مطلق / أرمل"],
    ["5. يشمل الوالدين: نعم / لا"],
    ["6. الراتب يجب أن يكون رقمًا صحيحًا"],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(instructions.map((row) => [row]));
  const wscols2 = [{ wch: 80 }];
  ws2["!cols"] = wscols2;
  XLSX.utils.book_append_sheet(wb, ws2, "التعليمات");

  XLSX.writeFile(wb, "قالب_بيانات_الموظفين.xlsx");
};

// ============= المكون الرئيسي =============

function HealthEstablishmentForm({ onSuccess, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sectors, setSectors] = useState(ALL_SECTORS);
  const [insurancePlans, setInsurancePlans] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [parsedEmployees, setParsedEmployees] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    // الخطوة 1: المعلومات الأساسية
    name: "",
    sector_group: "",
    sector: "",
    size_category: "small",
    cr_number: "",
    tax_number: "",

    // الخطوة 2: معلومات الاتصال
    address: "",
    city: "صنعاء",
    country: "اليمن",
    phone: "",
    email: "",
    website: "",

    // الخطوة 3: المعلومات التشغيلية
    total_employees: 10,
    male_employees: 0,
    female_employees: 0,
    establishment_age: 3,
    work_environment: "office",
    risk_level: "medium",
    annual_revenue: "",
    has_previous_insurance: false,
    previous_insurance_years: 0,
    claims_history: 0,

    // الخطوة 5: رفع ملف الموظفين
    employees_file: null,
  });

  // بيئة العمل الافتراضية حسب القطاع
  const getDefaultWorkEnvironment = (sector) => {
    if (sector.startsWith("construction_")) return "field";
    if (sector.startsWith("tech_")) return "office";
    if (sector.startsWith("health_")) return "mixed";
    if (sector.startsWith("services_transport")) return "field";
    return "office";
  };

  useEffect(() => {
    if (formData.sector && currentStep >= 5) {
      fetchInsurancePlans();
    }
  }, [formData.sector, currentStep]);

  const fetchInsurancePlans = async () => {
    try {
      const response = await api.get("api/health/health-coverage-plans/", {
        params: { sector: formData.sector },
      });
      setInsurancePlans(response.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));

      // معالجة الملف المرفوع
      if (files[0]) {
        handleFileUpload(files[0]);
      }
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // إذا تم تغيير القطاع، تحديث المجموعة والمخاطر وبيئة العمل
      if (name === "sector") {
        const selectedSector = ALL_SECTORS.find((s) => s.value === value);
        if (selectedSector) {
          setFormData((prev) => ({
            ...prev,
            sector_group: value.split("_")[0],
            risk_level: selectedSector.risk || "medium",
            work_environment: getDefaultWorkEnvironment(value),
          }));
        }
      }
    }
  };

  const parseExcelFileInternal = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // تحويل الورقة إلى JSON مع دعم التواريخ
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          dateNF: 'yyyy-mm-dd',
          defval: ''
        });
        
        if (jsonData.length === 0) {
          reject(new Error('الملف فارغ أو لا يحتوي على بيانات'));
          return;
        }
        
        // ✅ قائمة الأعمدة المطلوبة الأساسية (لجميع الأنواع)
        const basicRequiredColumns = [
          'الاسم_الكامل',
          'الرقم_الوظيفي', 
          'الجنس',
          'تاريخ_الميلاد',
          'الراتب',
          'الحالة_الاجتماعية',
          'يشمل_الوالدين'
        ];
        
        // الحصول على أسماء الأعمدة الفعلية
        const firstRow = jsonData[0];
        const actualColumns = Object.keys(firstRow);
        
        // التحقق من وجود الأعمدة الأساسية
        const missingColumns = basicRequiredColumns.filter(
          col => !actualColumns.includes(col)
        );
        
        if (missingColumns.length > 0) {
          reject(new Error(`الحقول المفقودة: ${missingColumns.join(', ')}`));
          return;
        }
        
        // معالجة وتحويل البيانات
        const processedEmployees = jsonData.map((row, index) => {
          const rowNumber = index + 2;
          
          // التحقق من القيم الأساسية
          const validationErrors = [];
          
          // التحقق من البيانات الأساسية
          const requiredFields = [
            { key: 'الاسم_الكامل', name: 'اسم الموظف' },
            { key: 'الرقم_الوظيفي', name: 'الرقم الوظيفي' },
            { key: 'الجنس', name: 'الجنس' },
            { key: 'تاريخ_الميلاد', name: 'تاريخ الميلاد' },
            { key: 'الراتب', name: 'الراتب' },
            { key: 'الحالة_الاجتماعية', name: 'الحالة الاجتماعية' },
            { key: 'يشمل_الوالدين', name: 'يشمل الوالدين' }
          ];
          
          requiredFields.forEach(field => {
            if (!row[field.key]?.toString().trim()) {
              validationErrors.push(`${field.name} مطلوب`);
            }
          });
          
          // تحقق من الراتب باستخدام الدالة الجديدة
          const salary = parseSalary(row['الراتب']);
          
          if (validationErrors.length > 0) {
            throw new Error(`الصف ${rowNumber}: ${validationErrors.join('، ')}`);
          }
          
          // ✅ تحويل البيانات - حفظ جميع الحقول
          const employee = {
            // الحقول الأساسية (مطلوبة للجميع)
            full_name: row['الاسم_الكامل'].toString().trim(),
            employee_number: row['الرقم_الوظيفي'].toString().trim(),
            gender: normalizeGender(row['الجنس']),
            date_of_birth: normalizeDate(row['تاريخ_الميلاد']),
            salary: salary,
            marital_status: normalizeMaritalStatus(row['الحالة_الاجتماعية']),
            include_parents: normalizeYesNo(row['يشمل_الوالدين']),
            
            // الحقول الخاصة بأنواع A, C (يتم حفظها حتى لو كانت فارغة)
            children_count: parseInt(row['عدد_الأبناء'] || 0),
            parents_count: parseInt(row['عدد_الوالدان'] || 0),
            wives_count: parseInt(row['عدد_الزوجات'] || 0),
            
            // الحقول الاختيارية الأخرى
            chronic_diseases: row['الأمراض_المزمنة'] ? 
              normalizeYesNo(row['الأمراض_المزمنة']) : 'لا',
            pregnancy: row['الحمل'] ? 
              normalizeYesNo(row['الحمل']) : 'لا',
            
            // الحقول المحسوبة
            age: calculateAge(normalizeDate(row['تاريخ_الميلاد'])),
            
            // الحقول المحسوبة لاحقاً (سيتم ملؤها عند الاحتساب)
            calculated_children: 0,
            calculated_parents: 0,
            calculated_wives: 0,
            insurance_type: null,
            
            // بيانات إضافية (اختيارية)
            job_title: row['المسمى_الوظيفي']?.toString().trim() || 'موظف',
            department: row['القسم']?.toString().trim() || 'عام',
            join_date: row['تاريخ_الالتحاق'] ? 
              normalizeDate(row['تاريخ_الالتحاق']) : null,
            notes: row['ملاحظات']?.toString().trim() || ''
          };
          
          return employee;
        });
        
        // التحقق من عدم تكرار الأرقام الوظيفية
        const employeeNumbers = processedEmployees.map(emp => emp.employee_number);
        const duplicateNumbers = employeeNumbers.filter(
          (num, index) => employeeNumbers.indexOf(num) !== index
        );
        
        if (duplicateNumbers.length > 0) {
          reject(new Error(`أرقام وظيفية مكررة: ${duplicateNumbers.join(', ')}`));
          return;
        }
        
        // ✅ تحليل إحصائيات الجنس
        const genderStats = {
          male: 0,
          female: 0,
          unknown: 0
        };
        
        processedEmployees.forEach(emp => {
          if (emp.gender === 'ذكر') genderStats.male++;
          else if (emp.gender === 'أنثى') genderStats.female++;
          else genderStats.unknown++;
        });
        
        console.log('📊 إحصائيات الجنس بعد المعالجة:', genderStats);
        
        resolve(processedEmployees);
        
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('خطأ في قراءة الملف'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

  // دوال المساعدة
  // استبدل دالة normalizeGender القديمة بهذه الدالة:
const normalizeGender = (gender) => {
  if (!gender) return 'ذكر'; // القيمة الافتراضية
  
  const g = gender.toString().trim();
  
  // ✅ تحويل إلى حروف صغيرة للتحقق
  const lowerG = g.toLowerCase();
  
  // ✅ التحقق من الذكور أولاً
  const malePatterns = [
    /^ذكر$/, /^ذ$/, /^ر$/, /^رجل$/, /^male$/, /^m$/, /^1$/,
    /^رجال$/, /^ذكور$/, /^ولد$/, /^بنت\s*ذكر$/, /^ذكوري$/,
    /ذكر/, /رجل/
  ];
  
  // ✅ التحقق من الإناث
  const femalePatterns = [
    /^أنثى$/, /^أنث$/, /^انثى$/, /^انث$/, /^ؤ$/, /^ن$/, /^ث$/,
    /^female$/, /^f$/, /^2$/, /^نساء$/, /^نس$/, /^فتاة$/, /^بنت$/,
    /أنثى/, /انثى/, /بنت/
  ];
  
  // ✅ تحقق من الذكور
  for (const pattern of malePatterns) {
    if (pattern.test(g) || pattern.test(lowerG)) {
      return 'ذكر';
    }
  }
  
  // ✅ تحقق من الإناث
  for (const pattern of femalePatterns) {
    if (pattern.test(g) || pattern.test(lowerG)) {
      return 'أنثى';
    }
  }
  
  // ✅ إذا كان رقم
  if (g === '1' || g === '0') {
    return g === '1' ? 'ذكر' : 'أنثى';
  }
  
  // ✅ إذا كان حرف واحد
  if (g.length === 1) {
    if (g === 'ذ' || g === 'ر' || g === 'د') return 'ذكر';
    if (g === 'أ' || g === 'ن' || g === 'ث') return 'أنثى';
  }
  
  console.warn(`⚠️ لم يتم التعرف على الجنس: "${gender}"، استخدام القيمة الافتراضية: ذكر`);
  return 'ذكر';
};

// أضف دالة لتحليل الرواتب بشكل صحيح:
const parseSalary = (salaryValue) => {
  if (!salaryValue) return 3000; // القيمة الافتراضية
  
  const str = salaryValue.toString().trim();
  
  // إزالة أي رموز عملة أو فواصل
  let cleanStr = str
    .replace(/[$€£ريال,]/g, '')
    .replace(/\s+/g, '')
    .replace(/[^\d.-]/g, '');
  
  // إذا كانت السلسلة فارغة بعد التنظيف
  if (!cleanStr) {
    console.warn(`⚠️ راتب فارغ أو غير صالح: "${str}"، استخدام القيمة الافتراضية: 3000`);
    return 3000;
  }
  
  const num = parseFloat(cleanStr);
  
  if (isNaN(num) || num <= 0) {
    console.warn(`⚠️ راتب غير صالح: "${str}"، استخدام القيمة الافتراضية: 3000`);
    return 3000;
  }
  
  return num;
};

  const normalizeMaritalStatus = (status) => {
    const s = status.toString().trim().toLowerCase();
    const statusMap = {
      متزوج: "متزوج",
      married: "متزوج",
      m: "متزوج",
      أعزب: "أعزب",
      single: "أعزب",
      s: "أعزب",
      مطلق: "مطلق",
      divorced: "مطلق",
      d: "مطلق",
      أرمل: "أرمل",
      widowed: "أرمل",
      w: "أرمل",
    };

    return statusMap[s] || s;
  };

  const normalizeYesNo = (value) => {
    const v = value.toString().trim().toLowerCase();
    if (v === "نعم" || v === "yes" || v === "y" || v === "true" || v === "1") {
      return "نعم";
    }
    return "لا";
  };

  const normalizeDate = (dateStr) => {
    if (!dateStr) return null;

    // محاولة تحويل التواريخ المختلفة
    let date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      // محاولة تحليل التاريخ بصيغة نصية
      const str = dateStr.toString();
      const formats = [
        /(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/, // YYYY-MM-DD
        /(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/, // DD-MM-YYYY
      ];

      for (const format of formats) {
        const match = str.match(format);
        if (match) {
          const year = match[1].length === 4 ? match[1] : match[3];
          const month = match[2].padStart(2, "0");
          const day =
            match[1].length === 4 ? match[3] : match[1].padStart(2, "0");
          date = new Date(`${year}-${month}-${day}`);
          break;
        }
      }

      if (isNaN(date.getTime())) {
        throw new Error(`تاريخ غير صالح: ${dateStr}`);
      }
    }

    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsParsing(true);
    setUploadStatus("جاري تحليل الملف...");
    setError("");

    try {
      // التحقق من نوع الملف
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        throw new Error(
          "نوع الملف غير مدعوم. يرجى رفع ملف Excel (.xlsx أو .xls)",
        );
      }

      // التحقق من حجم الملف
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("حجم الملف كبير جداً. الحد الأقصى 10MB");
      }

      // قراءة الملف
      const employees = await parseExcelFileInternal(file);

      if (employees.length === 0) {
        throw new Error("لم يتم العثور على بيانات للموظفين في الملف");
      }

      setParsedEmployees(employees);
      setUploadedFile(file);
      setUploadStatus(`✅ تم تحليل الملف بنجاح (${employees.length} موظف)`);

      // تحديث عدد الموظفين في النموذج
      setFormData((prev) => ({
        ...prev,
        total_employees: employees.length,
      }));
    } catch (error) {
      console.error("Error parsing file:", error);
      setError(`❌ خطأ في تحليل الملف: ${error.message}`);
      setParsedEmployees([]);
      setUploadedFile(null);
      setUploadStatus("");

      setFormData((prev) => ({
        ...prev,
        employees_file: null,
      }));
    } finally {
      setIsParsing(false);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const validateStep = (step) => {
    setError("");

    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          setError("اسم الشركة مطلوب");
          return false;
        }
        if (!formData.sector) {
          setError("الرجاء اختيار قطاع الشركة");
          return false;
        }
        if (!formData.cr_number.trim()) {
          setError("رقم السجل التجاري مطلوب");
          return false;
        }
        return true;

      case 2:
        if (!formData.city) {
          setError("المدينة مطلوبة");
          return false;
        }
        if (!formData.phone.trim()) {
          setError("رقم الهاتف مطلوب");
          return false;
        }
        return true;

      case 3:
        if (!formData.total_employees || formData.total_employees < 1) {
          setError("عدد الموظفين يجب أن يكون أكبر من صفر");
          return false;
        }
        if (!formData.establishment_age || formData.establishment_age < 1) {
          setError("عمر الشركة يجب أن يكون سنة على الأقل");
          return false;
        }
        return true;

      case 4:
        return true;

      case 5:
        if (!formData.employees_file) {
          setError("الرجاء رفع ملف بيانات الموظفين");
          return false;
        }
        if (parsedEmployees.length === 0) {
          setError("لم يتم العثور على بيانات موظفين في الملف");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const uploadEmployeesToCompany = async (companyId) => {
    console.log("🔄 uploadEmployeesToCompany called with companyId:", companyId);
    
    if (!companyId) {
      console.error("❌ companyId is undefined!");
      setUploadStatus("❌ خطأ: معرف الشركة غير متوفر");
      return;
    }
    
    if (parsedEmployees.length === 0 || !uploadedFile) {
      console.log("⚠️ لا توجد بيانات موظفين للرفع");
      setUploadStatus("⚠️ لا توجد بيانات موظفين للرفع");
      return;
    }
    
    try {
      console.log("📤 رفع بيانات الموظفين للشركة", companyId);
      setUploadStatus("جاري رفع بيانات الموظفين...");

      // خيار 1: رفع الملف مباشرة
      const fileFormData = new FormData();
      fileFormData.append("employees_file", uploadedFile);

      const uploadResponse = await api.post(
        `/api/health/companies/${companyId}/upload-employees/`,
        fileFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ استجابة رفع الملف:", uploadResponse.data);
      setUploadStatus("✅ تم رفع ملف الموظفين بنجاح");
      
      return uploadResponse.data;
      
    } catch (uploadError) {
      console.error("❌ فشل رفع الملف:", uploadError);
      console.log("📋 تفاصيل الخطأ:", uploadError.response?.data);
      
      // خيار بديل: تخزين البيانات محلياً
      try {
        localStorage.setItem(
          `employees_${companyId}`,
          JSON.stringify({
            data: parsedEmployees,
            filename: uploadedFile.name,
            timestamp: new Date().toISOString(),
            company_id: companyId,
            company_name: formData.name
          })
        );
        
        console.log("💾 تم تخزين بيانات الموظفين محلياً");
        setUploadStatus("💾 تم تخزين بيانات الموظفين محلياً (فشل الاتصال بالخادم)");
        
      } catch (localError) {
        console.error("❌ فشل التخزين المحلي:", localError);
        setUploadStatus("❌ فشل كامل في حفظ بيانات الموظفين");
      }
      
      throw uploadError;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("📤 إرسال بيانات الشركة...");
      console.log("📋 بيانات النموذج:", formData);

      // ========== 1. إعداد البيانات الكاملة ==========
      const companyData = {
        // المعلومات الأساسية
        name: formData.name.trim(),
        sector: formData.sector,
        size_category: formData.size_category || "small",
        
        // المعلومات القانونية
        cr_number: formData.cr_number.trim(),
        tax_number: formData.tax_number?.trim() || "",
        
        // معلومات الاتصال
        address: formData.address?.trim() || "غير محدد",
        city: formData.city || "صنعاء",
        country: formData.country || "اليمن",
        phone: formData.phone.trim(),
        email: formData.email?.trim() || "",
        website: formData.website?.trim() || "",
        
        // معلومات الموظفين
        total_employees: formData.total_employees || 1,
        male_employees: formData.male_employees || Math.floor((formData.total_employees || 1) * 0.7),
        female_employees: formData.female_employees || Math.floor((formData.total_employees || 1) * 0.3),
        establishment_age: formData.establishment_age || 1,
        founded_date: new Date().toISOString().split('T')[0],
        
        // معلومات المخاطر
        work_environment: formData.work_environment || "office",
        risk_level: formData.risk_level || "medium",
        
        // معلومات مالية
        annual_revenue: formData.annual_revenue || 0,
        
        // تاريخ التأمين
        has_previous_insurance: formData.has_previous_insurance || false,
        previous_insurance_years: formData.previous_insurance_years || 0,
        claims_history: formData.claims_history || 0,
        
        // بيانات إضافية
        sub_sector: formData.sector.split('_')[1] || "عام",
        sector_data: {},
        employees_data: parsedEmployees.length > 0 ? { employees: parsedEmployees } : {}
      };

      console.log("📦 البيانات المعدلة للإرسال:", companyData);

      // ========== 2. إرسال البيانات ==========
      const companyResponse = await api.post("/api/health/companies/", companyData);

      console.log("✅ استجابة إنشاء الشركة:", companyResponse.data);
      const createdCompany = companyResponse.data;

      // الحصول على ID الشركة - البحث بعناية
      let companyId = null;
      
      // البحث في المستويات المختلفة
      if (createdCompany.id) {
        companyId = createdCompany.id;
      } else if (createdCompany.pk) {
        companyId = createdCompany.pk;
      } else if (createdCompany.company_id) {
        companyId = createdCompany.company_id;
      }
      
      // إذا لم نجد، نبحث في الكائن
      if (!companyId && createdCompany) {
        for (const key in createdCompany) {
          if (key.toLowerCase().includes('id') && createdCompany[key]) {
            companyId = createdCompany[key];
            console.log(`🔍 وجدت ID في حقل ${key}:`, companyId);
            break;
          }
        }
      }

      console.log("🔍 ID الشركة النهائي:", companyId);

      // ========== 3. رفع ملف الموظفين إذا كان موجوداً ==========
      if (parsedEmployees.length > 0 && uploadedFile && companyId) {
        try {
          console.log("📤 جاري رفع ملف الموظفين للشركة ID:", companyId);
          await uploadEmployeesToCompany(companyId);
        } catch (uploadError) {
          console.warn("⚠️ فشل رفع ملف الموظفين:", uploadError.message);
          // تخزين محلي
          localStorage.setItem(
            `employees_${companyId}`,
            JSON.stringify({
              data: parsedEmployees,
              filename: uploadedFile.name,
              timestamp: new Date().toISOString(),
              company_id: companyId,
              company_name: formData.name
            })
          );
        }
      }

      // ========== 4. إظهار رسالة النجاح ==========
      let successMsg = `✅ تم إنشاء شركة "${formData.name}" بنجاح!`;
      if (parsedEmployees.length > 0) {
        successMsg += ` وتم حفظ ${parsedEmployees.length} موظف`;
      }
      
      console.log("🎉", successMsg);
      setSuccessMessage(successMsg);

      // ========== 5. إرجاع الشركة المكتملة ==========
      if (onSuccess) {
        // انتظر قليلاً ثم أعد الشركة
        setTimeout(() => {
          onSuccess(createdCompany);
        }, 500);
      }

      // ========== 6. إغلاق النموذج ==========
      setTimeout(() => {
        onCancel();
      }, 2000);

    } catch (error) {
      console.error("❌ خطأ في إنشاء الشركة:", error);
      
      // عرض تفاصيل الخطأ بشكل أفضل
      let errorMessage = "فشل إنشاء الشركة";
      
      if (error.response) {
        console.log("📋 تفاصيل خطأ الخادم:", {
          status: error.response.status,
          data: error.response.data,
          url: error.config?.url
        });
        
        if (error.response.data) {
          // تحليل أخطاء التحقق من Django
          if (typeof error.response.data === 'object') {
            const errors = [];
            
            if (error.response.data.detail) {
              errors.push(error.response.data.detail);
            }
            
            // معالجة أخطاء الحقول
            for (const [field, fieldErrors] of Object.entries(error.response.data)) {
              if (Array.isArray(fieldErrors)) {
                errors.push(`${field}: ${fieldErrors.join(', ')}`);
              } else {
                errors.push(`${field}: ${fieldErrors}`);
              }
            }
            
            if (errors.length > 0) {
              errorMessage = errors.join(' | ');
            }
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          }
        }
      } else if (error.request) {
        errorMessage = "لا يمكن الاتصال بالخادم";
      } else {
        errorMessage = error.message;
      }
      
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // ============= عرض الخطوات =============

  const renderStep1 = () => {
    // تجميع القطاعات حسب المجموعة
    const groupedSectors = {};
    ALL_SECTORS.forEach((sector) => {
      const group = sector.value.split("_")[0];
      if (!groupedSectors[group]) {
        groupedSectors[group] = [];
      }
      groupedSectors[group].push(sector);
    });

    return (
      <div className="step-content">
        <div className="step-header">
          <h3>الخطوة 1: المعلومات الأساسية للشركة</h3>
          <p>اختر القطاع المناسب لشركتك</p>
        </div>

        <div className="form-group">
          <label htmlFor="name">اسم الشركة *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="أدخل الاسم الكامل للشركة"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sector">قطاع الشركة *</label>
            <select
              id="sector"
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              required
              className="sector-select"
            >
              <option value="">-- اختر قطاع الشركة --</option>

              {Object.entries(groupedSectors).map(
                ([groupKey, sectorsInGroup]) => (
                  <optgroup
                    key={groupKey}
                    label={SECTOR_GROUPS[groupKey] || groupKey}
                  >
                    {sectorsInGroup.map((sector) => (
                      <option key={sector.value} value={sector.value}>
                        {sector.icon} {sector.label}
                      </option>
                    ))}
                  </optgroup>
                ),
              )}
            </select>

            {formData.sector && (
              <div className="sector-info">
                <p>
                  <strong>القطاع المختار:</strong>{" "}
                  {ALL_SECTORS.find((s) => s.value === formData.sector)?.label}
                </p>
                <p>
                  <strong>المجموعة:</strong>{" "}
                  {SECTOR_GROUPS[formData.sector.split("_")[0]]}
                </p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="size_category">حجم الشركة *</label>
            <select
              id="size_category"
              name="size_category"
              value={formData.size_category}
              onChange={handleChange}
              required
            >
              <option value="micro">صغيرة جداً (1-5 موظفين)</option>
              <option value="small">صغيرة (6-50 موظفين)</option>
              <option value="medium">متوسطة (51-250 موظفين)</option>
              <option value="large">كبيرة (251-1000 موظفين)</option>
              <option value="enterprise">عملاقة (1000+ موظفين)</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cr_number">رقم السجل التجاري *</label>
            <input
              type="text"
              id="cr_number"
              name="cr_number"
              value={formData.cr_number}
              onChange={handleChange}
              required
              placeholder="مثال: 1012345678"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tax_number">الرقم الضريبي (إن وجد)</label>
            <input
              type="text"
              id="tax_number"
              name="tax_number"
              value={formData.tax_number}
              onChange={handleChange}
              placeholder="الرقم الضريبي للشركة"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="step-content">
      <div className="step-header">
        <h3>الخطوة 2: معلومات الاتصال</h3>
        <p>أدخل معلومات التواصل مع الشركة</p>
      </div>

      <div className="form-group">
        <label htmlFor="address">العنوان التفصيلي *</label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          rows="3"
          placeholder="الشارع، الحي، المنطقة"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">المدينة *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="country">البلد *</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="phone">رقم الهاتف *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="مثال: 771234567"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">البريد الإلكتروني *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="info@company.com"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="website">الموقع الإلكتروني (إن وجد)</label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://www.company.com"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <div className="step-header">
        <h3>الخطوة 3: المعلومات التشغيلية</h3>
        <p>أدخل التفاصيل التشغيلية للشركة</p>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="total_employees">عدد الموظفين الكلي *</label>
          <input
            type="number"
            id="total_employees"
            name="total_employees"
            value={formData.total_employees}
            onChange={handleChange}
            required
            min="1"
            max="10000"
          />
        </div>

        <div className="form-group">
          <label htmlFor="establishment_age">عمر الشركة (سنوات) *</label>
          <input
            type="number"
            id="establishment_age"
            name="establishment_age"
            value={formData.establishment_age}
            onChange={handleChange}
            required
            min="1"
            max="100"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="work_environment">بيئة العمل *</label>
          <select
            id="work_environment"
            name="work_environment"
            value={formData.work_environment}
            onChange={handleChange}
            required
          >
            <option value="office">عمل مكتبي</option>
            <option value="field">عمل ميداني</option>
            <option value="mixed">مختلط (مكتبي وميداني)</option>
            <option value="remote">عمل عن بعد</option>
            <option value="hazardous">بيئة خطرة</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="risk_level">مستوى المخاطر *</label>
          <select
            id="risk_level"
            name="risk_level"
            value={formData.risk_level}
            onChange={handleChange}
            required
          >
            <option value="low">مخاطر منخفضة</option>
            <option value="medium">مخاطر متوسطة</option>
            <option value="high">مخاطر عالية</option>
            <option value="very_high">مخاطر عالية جداً</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="annual_revenue">الإيرادات السنوية (اختياري)</label>
          <input
            type="number"
            id="annual_revenue"
            name="annual_revenue"
            value={formData.annual_revenue}
            onChange={handleChange}
            placeholder="$"
            min="0"
            step="1000"
          />
        </div>

        <div className="form-group">
          <label htmlFor="claims_history">عدد المطالبات السابقة</label>
          <input
            type="number"
            id="claims_history"
            name="claims_history"
            value={formData.claims_history}
            onChange={handleChange}
            min="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="has_previous_insurance"
              checked={formData.has_previous_insurance}
              onChange={handleChange}
            />
            <span className="checkmark"></span>
            الشركة لديها تأمين صحي سابق
          </label>
        </div>

        {formData.has_previous_insurance && (
          <div className="form-group">
            <label htmlFor="previous_insurance_years">
              سنوات التأمين السابقة
            </label>
            <input
              type="number"
              id="previous_insurance_years"
              name="previous_insurance_years"
              value={formData.previous_insurance_years}
              onChange={handleChange}
              min="0"
              max="50"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="step-content">
      <div className="step-header">
        <h3>الخطوة 4: تأكيد المعلومات</h3>
        <p>راجع المعلومات قبل المتابعة</p>
      </div>

      <div className="review-section">
        <div className="review-grid">
          <div className="review-item">
            <span className="review-label">اسم الشركة:</span>
            <span className="review-value">{formData.name}</span>
          </div>
          <div className="review-item">
            <span className="review-label">القطاع:</span>
            <span className="review-value">
              {ALL_SECTORS.find((s) => s.value === formData.sector)?.label}
            </span>
          </div>
          <div className="review-item">
            <span className="review-label">رقم السجل:</span>
            <span className="review-value">{formData.cr_number}</span>
          </div>
          <div className="review-item">
            <span className="review-label">عدد الموظفين:</span>
            <span className="review-value">{formData.total_employees}</span>
          </div>
          <div className="review-item">
            <span className="review-label">بيئة العمل:</span>
            <span className="review-value">{formData.work_environment}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => {
    return (
      <div className="step-content">
        <div className="step-header">
          <h3>الخطوة 5: رفع ملف الموظفين</h3>
          <p>لاحتساب القسط بدقة</p>
        </div>

        <div className="upload-section">
          <h4>رفع ملف بيانات الموظفين *</h4>
          <p className="section-description">
            يرجى رفع ملف Excel يحتوي على بيانات موظفيك. سيتم استخدام هذه
            البيانات لحساب قسط التأمين بشكل دقيق.
          </p>
          <div className="file-requirements">
            <h5>📋 متطلبات الملف:</h5>
            <ul>
              <li>يجب أن يكون الملف بصيغة Excel (.xlsx أو .xls)</li>
              <li>
                يجب أن يحتوي على الأعمدة التالية في الصف الأول:
                <code>
                  name, age, gender, position, department, base_salary
                </code>
              </li>
              <li>يمكنك استخدام القالب المرفق</li>
              <li>الحد الأقصى لحجم الملف: 10MB</li>
            </ul>
          </div>

          <div className="template-download">
            <button
              type="button"
              className="btn-template"
              onClick={downloadTemplate}
            >
              ⬇️ تحميل قالب Excel
            </button>
            <p className="template-info">
              قم بتحميل القالب وملئه ببيانات موظفيك ثم رفعه هنا
            </p>
          </div>

          <div className="file-upload-area">
            <div className="file-upload">
              <input
                type="file"
                id="employees_file"
                name="employees_file"
                accept=".xlsx,.xls"
                onChange={handleChange}
                required
                disabled={isParsing}
              />
              <label htmlFor="employees_file" className="upload-label">
                <span className="upload-text">
                  {formData.employees_file
                    ? formData.employees_file.name
                    : "انقر لاختيار ملف Excel"}
                </span>
              </label>
            </div>

            {isParsing && (
              <div className="parsing-status">
                <div className="spinner-small"></div>
                <span>جاري تحليل الملف...</span>
              </div>
            )}

            {uploadStatus && (
              <div
                className={`upload-status ${uploadStatus.includes("✅") ? "success" : "error"}`}
              >
                {uploadStatus}
              </div>
            )}
          </div>

          {parsedEmployees.length > 0 && (
            <div className="employees-preview">
              <h5>معاينة بيانات الموظفين ({parsedEmployees.length} موظف):</h5>
              <div className="preview-table">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>الاسم</th>
                      <th>العمر</th>
                      <th>الجنس</th>
                      <th>الراتب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedEmployees.slice(0, 5).map((emp, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{emp.name}</td>
                        <td>{emp.age}</td>
                        <td>
                            <span className={`gender-badge ${emp.gender === 'ذكر' ? 'male' : 'female'}`}>
                            {emp.gender === 'ذكر' ? 'ذكر' : 'أنثى'}
                            </span>
                        </td>
                        <td>${emp.salary?.toLocaleString('en-US', { minimumFractionDigits: 0 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {parsedEmployees.length > 5 && (
                  <div className="preview-note">
                    + {parsedEmployees.length - 5} موظف إضافي
                  </div>
                )}
              </div>

              <div className="employees-stats">
                <div className="stat-item">
                  <span className="stat-label">إجمالي الرواتب:</span>
                  <span className="stat-value">
                    $
                    {parsedEmployees
                      .reduce((sum, emp) => sum + (emp.salary || 0), 0)
                      .toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">متوسط الراتب:</span>
                  <span className="stat-value">
                    $
                    {Math.round(
                      parsedEmployees.reduce(
                        (sum, emp) => sum + (emp.salary || 0),
                        0,
                      ) / parsedEmployees.length,
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="wizard-modal">
      <div className="wizard-content">
        <div className="wizard-header">
          <h2>تسجيل شركة جديدة للتأمين الصحي</h2>
          <button className="close-btn" onClick={onCancel}>
            ✕
          </button>
        </div>

        {/* مؤشر الخطوات */}
        <div className="steps-indicator">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`step ${currentStep === step ? "active" : ""} ${currentStep > step ? "completed" : ""}`}
            >
              <span className="step-number">{step}</span>
              <span className="step-label">
                {step === 1 && "الأساسية"}
                {step === 2 && "الاتصال"}
                {step === 3 && "التشغيلية"}
                {step === 4 && "التأكيد"}
                {step === 5 && "الملف"}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button className="close-btn" onClick={() => setError("")}>
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            <span>{successMessage}</span>
            <button className="close-btn" onClick={() => setSuccessMessage("")}>
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="wizard-form">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          <div className="wizard-actions">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-back"
                onClick={handleBack}
                disabled={loading || isParsing}
              >
                ← السابق
              </button>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                className="btn btn-next"
                onClick={handleNext}
                disabled={loading || isParsing}
              >
                التالي →
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-submit"
                disabled={loading || isParsing || !formData.employees_file}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    جاري التسجيل...
                  </>
                ) : (
                  "تسجيل الشركة"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default HealthEstablishmentForm;
