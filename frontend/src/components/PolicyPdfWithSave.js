import React, { useState, useEffect } from 'react';
import { Button, Spinner, Alert, ProgressBar, Badge } from 'react-bootstrap';
import { FaFilePdf, FaDownload, FaTimes, FaPrint, FaUsers, FaUser, FaChild, FaInfoCircle, FaBuilding, FaDollarSign, FaCheckCircle } from 'react-icons/fa';
import api from '../services/api';

const PolicyPdfWithSave = ({ policyData, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [progress, setProgress] = useState(0);


    const getInsuranceType = () => {
        // Try multiple sources for insurance type
        return policyData.insurance_type || 
                policyData.insuranceType || 
                policyData.insurance_type_code || 
                (policyData.calculation_data?.rules?.code) || 
                'B';
    };

  // ========== دالة لاستخراج بيانات العائلة من مصادر مختلفة ==========
    const getFamilyMembersData = () => {
    let familyMembers = {};
    
    // First, try to get from policy data
    if (policyData.family_members && typeof policyData.family_members === 'object') {
        familyMembers = { ...policyData.family_members };
    }
    // Try from calculation_data
    else if (policyData.calculation_data?.family_data) {
        const familyData = policyData.calculation_data.family_data;
        familyMembers = {
        employees: policyData.total_employees || 0,
        spouses: familyData.spouses || 0,
        children: familyData.children || 0,
        parents: familyData.parents || 0
        };
    }
    // Try from calculation_preview
    else if (policyData.calculation_preview?.familyData) {
        const familyData = policyData.calculation_preview.familyData;
        familyMembers = {
        employees: policyData.total_employees || 0,
        spouses: familyData.spouses || 0,
        children: familyData.children || 0,
        parents: familyData.parents || 0
        };
    }
    // Try from employees_data
    else if (policyData.employees_data) {
        const employees = Array.isArray(policyData.employees_data) 
        ? policyData.employees_data 
        : policyData.employees_data.employees || [];
        
        // Calculate based on insurance type
        const insuranceType = policyData.insurance_type || 'B';
        const rules = {
        'A': { includesParents: true, requiresChronicForParents: true },
        'B': { includesParents: false },
        'C': { includesParents: true, requiresChronicForParents: false }
        };
        
        const currentRules = rules[insuranceType] || rules['B'];
        
        familyMembers = {
        employees: employees.length || 0,
        spouses: employees.reduce((sum, emp) => {
            const isMarried = emp.marital_status === 'متزوج' || emp.marital_status === 'married';
            return sum + (isMarried ? (emp.wives_count || 1) : 0);
        }, 0),
        children: employees.reduce((sum, emp) => sum + (emp.children_count || 0), 0),
        parents: currentRules.includesParents 
            ? employees.reduce((sum, emp) => {
                const wantsParents = emp.include_parents || emp.include_parents === true;
                const hasChronic = emp.chronic_diseases === true || emp.chronic_diseases === 'نعم';
                
                if (wantsParents) {
                if (currentRules.requiresChronicForParents) {
                    return sum + (hasChronic ? (emp.parents_count || 2) : 0);
                }
                return sum + (emp.parents_count || 2);
                }
                return sum;
            }, 0)
            : 0
        };
    }
    
    // Default values
    return {
        employees: parseInt(familyMembers.employees) || (policyData.total_employees || 0),
        spouses: parseInt(familyMembers.spouses) || 0,
        children: parseInt(familyMembers.children) || 0,
        parents: parseInt(familyMembers.parents) || 0
    };
    };

  // ========== دالة لتحديد وصف أفراد العائلة بناءً على نوع التغطية ==========
  const getFamilyDescriptionByType = (insuranceType) => {
    const type = insuranceType || 'B';
    
    const descriptions = {
      'A': {
        title: 'النوع A: تغطية أساسية للموظف فقط',
        details: [
          'يشمل هذا النوع الموظفين الأساسيين المسجلين لدى الشركة فقط',
          'لا يشمل أفراد العائلة (الزوجات، الأبناء، الوالدين)',
          'مناسب للشركات ذات الميزانيات المحدودة أو عندما لا تكون هناك حاجة لتغطية العائلة'
        ]
      },
      'B': {
        title: 'النوع B: تغطية للموظف والزوجة والأبناء',
        details: [
          'يشمل الموظفين الأساسيين المسجلين لدى الشركة',
          'يشمل الزوجات القانونيات للموظفين',
          'يشمل الأبناء حتى سن 18 سنة',
          'لا يشمل الوالدين في هذه التغطية'
        ]
      },
      'C': {
        title: 'النوع C: تغطية شاملة للموظف والعائلة الكاملة',
        details: [
          'يشمل الموظفين الأساسيين المسجلين لدى الشركة',
          'يشمل الزوجات القانونيات للموظفين',
          'يشمل الأبناء حتى سن 25 سنة للطلاب',
          'يشمل الوالدين في حالة الإعالة المثبتة',
          'أعلى مستوى من التغطية للعائلة'
        ]
      }
    };
    
    return descriptions[type] || descriptions['B'];
  };

  // ========== دالة لجمع البيانات الكاملة ==========
  const getCompletePolicyData = () => {
    const familyData = getFamilyMembersData();
    const totalFamily = familyData.spouses + familyData.children + familyData.parents;
    const insuranceType = getInsuranceType();
    
    // استخراج سنة التأسيس
    let foundedYear = 'غير متوفر';
    if (policyData.company?.founded_date) {
      foundedYear = new Date(policyData.company.founded_date).getFullYear();
    } else if (policyData.company?.establishment_age) {
      foundedYear = new Date().getFullYear() - policyData.company.establishment_age;
    }
    
    // استخراج بيانات التغطية من policy_details أو افتراضية
    const coverageDetails = policyData.policy_details?.coverage_options || {
      outpatient_coverage: 80,
      inpatient_coverage: 90,
      dental_coverage: 70,
      optical_coverage: 80,
      emergency_coverage: 100,
      maternity_coverage: 90,
      chronic_diseases: false,
      annual_limit: 100000,
      deductible: 500
    };
    
    // الحصول على وصف أفراد العائلة بناءً على نوع التغطية
    // const insuranceType = policyData.insurance_type || 'B';
    const familyDescription = getFamilyDescriptionByType(insuranceType);
    
    return {
      // بيانات الشركة
      company_data: {
        name: policyData.company_name || policyData.company?.name || 'غير محدد',
        cr_number: policyData.company?.cr_number || 'غير متوفر',
        address: policyData.company?.address || 'غير متوفر',
        phone: policyData.company?.phone || 'غير متوفر',
        email: policyData.company?.email || 'غير متوفر',
        sector: policyData.company?.sector_display || policyData.company?.get_sector_display || 'غير متوفر',
        total_employees: policyData.company?.total_employees || policyData.insured_employees_count || 0,
        founded_date: foundedYear,
        establishment_age: policyData.company?.establishment_age || 'غير متوفر',
        size_category: policyData.company?.size_category_display || 'غير متوفر'
      },
      
      // بيانات العائلة الكاملة
      family_members: {
        employees: {
          count: familyData.employees,
          coverage_percentage: '100%',
          details: 'الموظفون العاملون الرسميون لدى الشركة، وتشمل التغطية جميع الخدمات الطبية الأساسية والمتقدمة.'
        },
        spouses: {
          count: familyData.spouses,
          coverage_percentage: '50%',
          details: 'الزوجات القانونيات للموظفين، شريطة تقديم وثيقة الزواج الرسمية، وتشمل التغطية الخدمات الأساسية.'
        },
        children: {
          count: familyData.children,
          coverage_percentage: '50%',
          details: 'الأبناء حتى سن 18 عاماً، أو حتى 25 عاماً إذا كانوا طلاباً منتظمين في مؤسسة تعليمية معترف بها.'
        },
        parents: {
          count: familyData.parents,
          coverage_percentage: '30%',
          details: 'الوالدان في حالة الإعالة المثبتة رسمياً، وبحد أقصى والدين لكل موظف، وتشمل التغطية الخدمات الأساسية فقط.'
        },
        total_family: totalFamily,
        insurance_type: insuranceType,
        family_description: familyDescription
      },
      
      // تفاصيل التغطية
      coverage_details: {
        plan_type: policyData.insurance_type_name || policyData.coverage_plan_name || 'غير محدد',
        insurance_type_code: policyData.insurance_type || 'B',
        outpatient_coverage: `${coverageDetails.outpatient_coverage || 80}% حتى $${(coverageDetails.outpatient_limit || 5000).toLocaleString()} سنوياً`,
        inpatient_coverage: `${coverageDetails.inpatient_coverage || 90}% حتى $${(coverageDetails.inpatient_limit || 50000).toLocaleString()} سنوياً`,
        dental_coverage: `${coverageDetails.dental_coverage || 70}% حتى $${(coverageDetails.dental_limit || 2000).toLocaleString()} سنوياً`,
        optical_coverage: `${coverageDetails.optical_coverage || 80}% حتى $${(coverageDetails.optical_limit || 1500).toLocaleString()} كل سنتين`,
        emergency_coverage: '100% داخل الدولة، 70% خارج الدولة للحالات الطارئة فقط',
        maternity_coverage: `${coverageDetails.maternity_coverage || 90}% حتى $${(coverageDetails.maternity_limit || 10000).toLocaleString()}`,
        chronic_diseases: coverageDetails.chronic_diseases 
          ? 'مشمولة بنسبة 80% بعد فترة انتظار 6 أشهر'
          : 'غير مشمولة في هذه الخطة',
        annual_limit: `$${(coverageDetails.annual_limit || 100000).toLocaleString()} سنوياً للفرد`,
        deductible: `$${coverageDetails.deductible || 500} لكل حالة`,
        network_hospitals: 'جميع المستشفيات والمراكز الطبية المعتمدة في الشبكة الوطنية'
      },
      
      // الأسعار التفصيلية
      premium_details: {
        total_premium: parseFloat(policyData.total_premium || 0),
        annual_premium: parseFloat(policyData.annual_premium || 0),
        monthly_premium: parseFloat(policyData.monthly_premium || 0),
        calculation_breakdown: {
          employee_base_rate: 1000,
          spouse_rate: 500,
          child_rate: 300,
          parent_rate: 200,
          sector_factor: policyData.company?.sector === 'health_hospital' ? 1.3 : 1.2,
          company_size_factor: policyData.company?.total_employees > 100 ? 1.2 : 1.1,
          location_factor: 1.0
        }
      },
      
      // تفاصيل الوثيقة
      policy_info: {
        policy_number: policyData.policy_number || 'غير معروف',
        inception_date: policyData.inception_date_arabic || convertToArabicDate(new Date(policyData.inception_date || new Date())),
        expiry_date: policyData.expiry_date_arabic || convertToArabicDate(new Date(policyData.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))),
        days_remaining: policyData.days_remaining || calculateDaysRemaining(policyData.expiry_date),
        status: policyData.status_display || getStatusDisplay(policyData.status),
        payment_status: policyData.payment_status_display || getPaymentStatusDisplay(policyData.payment_status)
      }
    };
  };

  // ========== النصوص القانونية الكاملة (المعدلة حسب طلبك) ==========
  const getLegalTexts = () => {
    const completeData = getCompletePolicyData();
    const familyDescription = completeData.family_members.family_description;
    const familyData = getFamilyMembersData();
    
    // الحصول على تواريخ الصلاحية
    const inceptionDate = completeData.policy_info.inception_date;
    const expiryDate = completeData.policy_info.expiry_date;
    
    // حساب التواريخ للسنة المقبلة
    const startDate = new Date(policyData.inception_date || new Date());
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    const arabicStartDate = convertToArabicDate(startDate);
    const arabicEndDate = convertToArabicDate(endDate);
    
    return {
      article1: [
        'تم إعداد هذا البيان من خلال نظام SafeRatio، وهو نظام إلكتروني مخصص لحساب وتحليل نسب التغطية التأمينية الصحية، وذلك بهدف تقديم عرض استرشادي يساعد الجهات والأفراد على اتخاذ قرارات تأمينية مبنية على البيانات.',
        '',
        'ولا تُعد هذه الوثيقة عقد تأمين أو التزامًا قانونيًا من أي طرف.'
      ],
      
      article2: [
        'الجهة / الشركة: ' + (completeData.company_data.name || 'ee'),
        '',
        'وقد تم إعداد هذا البيان استنادًا إلى البيانات التي تم إدخالها في النظام من قبل الجهة المستفيدة.'
      ],
      
      article3: [
        'بناءً على البيانات المدخلة، يشمل هذا البيان الفئات التالية وفق الخطة المختارة:',
        '',
        '1. الموظفون المسجّلون لدى الجهة المستفيدة.',
        '',
        '2. الزوجات والأبناء وفق الشروط العمرية المعتمدة في الخطة.',
        '',
        '3. الوالدان في حال استيفاء الشروط الخاصة (مثل السن أو الإعاقة المزمنة)، وذلك لأغراض الاحتساب فقط.',
        '',
        `نوع التغطية المختار: ${familyDescription.title}`,
        ...familyDescription.details.map(detail => `   - ${detail}`)
      ],
      
      article4: [
        'يعرض هذا البيان نطاق التغطية التأمينية الصحية المقترحة، والتي قد تشمل:',
        '',
        '1. العلاج الداخلي والخارجي.',
        '',
        '2. خدمات الطوارئ داخل الدولة.',
        '',
        '3. خدمات الطوارئ خارج الدولة ضمن النسب المحددة.',
        '',
        '4. التغطيات الإضافية المختارة، إن وجدت.',
        '',
        'وتُعد جميع القيم والنسب الواردة تقديرية وقابلة للتغيير من قبل شركة التأمين الفعلية عند التعاقد.'
      ],
      
      article5: [
        'تم احتساب التغطية الخاصة بالأمراض المزمنة بناءً على اختيار الجهة المستفيدة للتغطية الإضافية، ووفق نسبة التغطية المحددة في الخطة المختارة.',
        '',
        'ولا يتطلب النظام تحديد نوع المرض، حيث يتم التعامل مع الأمراض المزمنة كتصنيف عام لأغراض الاحتساب فقط.'
      ],
      
      article6: [
        `مدة صلاحية هذا البيان من تاريخ ${arabicStartDate} وحتى ${arabicEndDate}، وذلك لأغراض العرض فقط.`,
        '',
        `القسط التأميني الإجمالي التقديري: ${completeData.premium_details.total_premium.toFixed(2)} دولار أمريكي.`,
        '',
        'ويُعد هذا القسط غير نهائي ويخضع للتقييم والموافقة من شركة التأمين المختارة لاحقًا.'
      ],
      
      article7: [
        '1. لا يتحمل نظام SafeRatio أي التزام قانوني أو مالي ناتج عن استخدام هذا البيان.',
        '',
        '2. لا تُعد هذه الوثيقة وثيقة تأمين رسمية.',
        '',
        '3. تعتمد التغطية الفعلية على الشروط والأحكام الصادرة عن شركة التأمين التي يتم التعاقد معها.'
      ],
      
      article8: [
        'تم إصدار هذا البيان لأغراض الدراسة والتحليل ودعم اتخاذ القرار فقط، ويخضع أي تعاقد تأميني لاحق للشروط والسياسات المعتمدة لدى شركات التأمين المرخصة.',
        '',
        'صادر عن',
        '',
        'نظام SafeRatio',
        'منصة احتساب وتحليل التغطية التأمينية الصحية'
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
      // إذا فشل التحويل، استخدم التنسيق العربي
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

  const getStatusDisplay = (status) => {
    const statusMap = {
      'draft': 'مسودة',
      'active': 'نشطة',
      'expired': 'منتهية',
      'cancelled': 'ملغاة',
      'pending': 'معلقة'
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

  // ========== دالة لإنشاء الجداول التفصيلية ==========
  const createDetailedTables = (doc, data, startY) => {
    let y = startY;
    
    // جدول 1: بيانات الشركة
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('بيانات الشركة المستفيدة', 20, y);
    y += 8;
    
    const companyTableData = [
      ['المعلومة', 'القيمة'],
      ['اسم الشركة', data.company_data.name],
      ['رقم السجل التجاري', data.company_data.cr_number],
      ['القطاع الرئيسي', data.company_data.sector],
      ['حجم الشركة', data.company_data.size_category],
      ['إجمالي الموظفين', data.company_data.total_employees],
      ['سنة التأسيس', data.company_data.founded_date],
      ['العمر التشغيلي', `${data.company_data.establishment_age} سنة`],
      ['العنوان', data.company_data.address],
      ['الهاتف', data.company_data.phone],
      ['البريد الإلكتروني', data.company_data.email]
    ];
    
    doc.autoTable({
      startY: y,
      head: [companyTableData[0]],
      body: companyTableData.slice(1),
      theme: 'grid',
      styles: { 
        fontSize: 9, 
        halign: 'right',
        cellPadding: 3
      },
      headStyles: { 
        fillColor: [0, 0, 0], 
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 65 }
      },
      margin: { left: 20, right: 20 }
    });
    
    y = doc.autoTable.previous.finalY + 15;
    
    // جدول 2: المؤمن عليهم حسب نوع التغطية
    doc.setFontSize(12);
    doc.text('تفاصيل المؤمن عليهم حسب نوع التغطية', 20, y);
    y += 8;
    
    const membersTableData = [
      ['الفئة', 'العدد', 'نوع التغطية', 'التفاصيل'],
      ['الموظفون', data.family_members.employees.count, data.family_members.insurance_type, data.family_members.family_description.title],
      ['الزوجات', data.family_members.spouses.count, data.family_members.insurance_type, data.family_members.spouses.details],
      ['الأبناء', data.family_members.children.count, data.family_members.insurance_type, data.family_members.children.details],
      ['الوالدان', data.family_members.parents.count, data.family_members.insurance_type, data.family_members.parents.details],
      ['الإجمالي', data.family_members.total_family, 'ـ', 'إجمالي أفراد العائلة المشمولين بالتغطية']
    ];
    
    doc.autoTable({
      startY: y,
      head: [membersTableData[0]],
      body: membersTableData.slice(1),
      theme: 'grid',
      styles: { 
        fontSize: 8, 
        halign: 'center',
        cellPadding: 2
      },
      headStyles: { 
        fillColor: [39, 174, 96], 
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 15 },
        2: { cellWidth: 20 },
        3: { cellWidth: 60 }
      },
      margin: { left: 20, right: 20 }
    });
    
    y = doc.autoTable.previous.finalY + 15;
    
    // جدول 3: نطاق التغطية
    doc.setFontSize(12);
    doc.text('نطاق التغطية التأمينية', 20, y);
    y += 8;
    
    const coverageTableData = [
      ['نوع التغطية', 'النسبة', 'التفاصيل'],
      ['العلاج الداخلي والخارجي', '80% - 90%', 'حسب الخطة المختارة والشروط'],
      ['خدمات الطوارئ داخل الدولة', '100%', 'في المستشفيات المعتمدة'],
      ['خدمات الطوارئ خارج الدولة', '70%', 'للحالات الطارئة أثناء السفر'],
      ['التغطيات الإضافية', 'متغيرة', 'حسب الاختيارات الإضافية']
    ];
    
    doc.autoTable({
      startY: y,
      head: [coverageTableData[0]],
      body: coverageTableData.slice(1),
      theme: 'grid',
      styles: { 
        fontSize: 8, 
        halign: 'center',
        cellPadding: 2
      },
      headStyles: { 
        fillColor: [142, 68, 173], 
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25 },
        2: { cellWidth: 55 }
      },
      margin: { left: 20, right: 20 }
    });
    
    y = doc.autoTable.previous.finalY + 15;
    
    // جدول 4: التفاصيل المالية
    doc.setFontSize(12);
    doc.text('التفاصيل المالية والقسط التأميني', 20, y);
    y += 8;
    
    const premiumTableData = [
      ['البند', 'القيمة', 'الشرح'],
      ['القسط السنوي التقديري', `$${data.premium_details.total_premium.toFixed(2)}`, 'تقديري وغير نهائي'],
      ['مدة صلاحية العرض', `من ${data.policy_info.inception_date} إلى ${data.policy_info.expiry_date}`, 'لسنة واحدة'],
      ['نوع التغطية', data.family_members.insurance_type, data.family_members.family_description.title],
      ['الحالة', data.policy_info.status, 'حالة الوثيقة الحالية']
    ];
    
    doc.autoTable({
      startY: y,
      head: [premiumTableData[0]],
      body: premiumTableData.slice(1),
      theme: 'grid',
      styles: { 
        fontSize: 8, 
        halign: 'center',
        cellPadding: 2
      },
      headStyles: { 
        fillColor: [230, 126, 34], 
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 45 },
        2: { cellWidth: 50 }
      },
      margin: { left: 20, right: 20 }
    });
    
    return doc.autoTable.previous.finalY + 15;
  };

  // ========== دالة لإضافة نص تفصيلي لكل مادة ==========
  const addArticleText = (doc, articleNumber, title, paragraphs, startY) => {
    let y = startY;
    
    // التحقق من المساحة في الصفحة
    if (y > 250) {
      doc.addPage();
      y = 30;
    }
    
    // عنوان المادة
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`المادة (${articleNumber}): ${title}`, 20, y);
    y += 8;
    
    // خط فاصل تحت العنوان
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 5;
    
    // نص المادة
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    paragraphs.forEach(paragraph => {
      if (paragraph === '') {
        y += 4; // سطر فارغ
      } else {
        // التحقق من المساحة قبل إضافة النص
        if (y > 270) {
          doc.addPage();
          y = 30;
        }
        
        // تقسيم النص الطويل
        const lines = doc.splitTextToSize(paragraph, 170);
        
        lines.forEach(line => {
          if (y > 270) {
            doc.addPage();
            y = 30;
          }
          
          // إضافة نقطة في بداية السطر الأول من الفقرة
          if (lines.indexOf(line) === 0 && line.trim().length > 0) {
            doc.text('• ', 20, y);
            doc.text(line, 24, y);
          } else {
            doc.text(line, 20, y);
          }
          
          y += 5;
        });
        
        y += 2; // مسافة بعد كل فقرة
      }
    });
    
    y += 10; // مسافة بعد كل مادة
    return y;
  };

  // ========== الدالة الرئيسية لإنشاء PDF ==========
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
        title: `بيان تغطية تأمينية صحية - ${completeData.policy_info.policy_number}`,
        subject: 'بيان تغطية تأمينية صحية',
        author: 'نظام SafeRatio',
        keywords: 'تأمين صحي, وثيقة تأمين, تغطية صحية, SafeRatio'
      });
      
      // ========== الصفحة الأولى: الغلاف والمعلومات الأساسية ==========
      let y = 30;
      
      // العنوان الرئيسي
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('بيان تغطية تأمينية صحية', 105, y, { align: 'center' });
      y += 12;
      
      // العنوان الثانوي
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('(وثيقة معلوماتية غير ملزمة قانونيًا)', 105, y, { align: 'center' });
      y += 20;
      
      // خط فاصل
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1);
      doc.line(20, y, 190, y);
      y += 15;
      
      // معلومات الوثيقة الأساسية
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('معلومات الوثيقة:', 20, y);
      y += 8;
      
      doc.setFont('helvetica', 'normal');
      const infoLines = [
        `رقم الوثيقة: ${completeData.policy_info.policy_number}`,
        `حالة الوثيقة: ${completeData.policy_info.status}`,
        `تاريخ الإصدار: ${completeData.policy_info.inception_date}`,
        `تاريخ الانتهاء: ${completeData.policy_info.expiry_date}`,
        `الأيام المتبقية: ${completeData.policy_info.days_remaining} يوم`,
        `نوع الخطة: ${completeData.coverage_details.plan_type}`
      ];
      
      infoLines.forEach(line => {
        doc.text(line, 25, y);
        y += 7;
      });
      
      y += 10;
      
      // معلومات الشركة الأساسية
      doc.setFont('helvetica', 'bold');
      doc.text('الشركة المستفيدة:', 20, y);
      y += 8;
      
      doc.setFont('helvetica', 'normal');
      const companyLines = [
        `الاسم: ${completeData.company_data.name}`,
        `القطاع: ${completeData.company_data.sector}`,
        `عدد الموظفين: ${completeData.company_data.total_employees}`,
        `السجل التجاري: ${completeData.company_data.cr_number}`
      ];
      
      companyLines.forEach(line => {
        doc.text(line, 25, y);
        y += 7;
      });
      
      y += 15;
      
      // الملخص المالي
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('الملخص المالي:', 20, y);
      y += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const financialLines = [
        `القسط السنوي التقديري: $${completeData.premium_details.total_premium.toFixed(2)}`,
        `نوع التغطية: ${completeData.family_members.insurance_type}`,
        `المشمولين: ${completeData.family_members.employees.count} موظف`
      ];
      
      // إضافة الزوجات والأبناء والوالدين حسب نوع التغطية
      if (completeData.family_members.spouses.count > 0) {
        financialLines.push(`+ ${completeData.family_members.spouses.count} زوجة`);
      }
      if (completeData.family_members.children.count > 0) {
        financialLines.push(`+ ${completeData.family_members.children.count} أبناء`);
      }
      if (completeData.family_members.parents.count > 0) {
        financialLines.push(`+ ${completeData.family_members.parents.count} والدين`);
      }
      
      financialLines.forEach(line => {
        doc.text(line, 25, y);
        y += 7;
      });
      
      y += 20;
      
      // ملاحظة هامة
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bolditalic');
      doc.text('ملاحظة هامة:', 20, y);
      y += 6;
      
      doc.setFont('helvetica', 'normal');
      const noteLines = doc.splitTextToSize(
        'هذا البيان وثيقة استرشادية وتقديرية فقط، ولا يشكل عقداً تأمينياً ملزماً. جميع الأرقام قابلة للتعديل حسب الشروط النهائية لشركة التأمين.',
        170
      );
      
      noteLines.forEach(line => {
        doc.text(line, 20, y);
        y += 5;
      });
      
      setProgress(50);
      
      // ========== الصفحة الثانية: الجداول التفصيلية ==========
      doc.addPage();
      y = 30;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('الجداول التفصيلية', 105, y, { align: 'center' });
      y += 15;
      
      // إنشاء جميع الجداول
      y = createDetailedTables(doc, completeData, y);
      
      setProgress(70);
      
      // ========== الصفحات التالية: المواد القانونية ==========
      
      // المادة 1
      doc.addPage();
      y = 30;
      y = addArticleText(doc, 1, 'الغرض من الوثيقة', legalTexts.article1, y);
      
      // المادة 2
      y = addArticleText(doc, 2, 'الجهة المستفيدة', legalTexts.article2, y);
      
      // المادة 3
      doc.addPage();
      y = 30;
      y = addArticleText(doc, 3, 'المؤمن عليهم (استرشاديًا)', legalTexts.article3, y);
      
      // المادة 4
      doc.addPage();
      y = 30;
      y = addArticleText(doc, 4, 'نطاق التغطية التأمينية (تقديري)', legalTexts.article4, y);
      
      // المادة 5
      doc.addPage();
      y = 30;
      y = addArticleText(doc, 5, 'الأمراض المزمنة', legalTexts.article5, y);
      
      // المادة 6
      doc.addPage();
      y = 30;
      y = addArticleText(doc, 6, 'القسط التأميني التقديري ومدة العرض', legalTexts.article6, y);
      
      // المادة 7
      doc.addPage();
      y = 30;
      y = addArticleText(doc, 7, 'إخلاء المسؤولية', legalTexts.article7, y);
      
      // المادة 8
      doc.addPage();
      y = 30;
      y = addArticleText(doc, 8, 'أحكام عامة', legalTexts.article8, y);
      
      setProgress(90);
      
      // ========== الصفحة الأخيرة: التوقيعات ==========
      doc.addPage();
      y = 50;
      
      // عنوان صفحة التوقيعات
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('صادر عن', 105, y, { align: 'center' });
      y += 25;
      
      // توقيع النظام
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('نظام SafeRatio', 105, y, { align: 'center' });
      y += 8;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('منصة احتساب وتحليل التغطية التأمينية الصحية', 105, y, { align: 'center' });
      y += 20;
      
      // معلومات الاتصال
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('www.saferatio.com | info@saferatio.com', 105, y, { align: 'center' });
      y += 6;
      doc.text('هاتف: +966112345678', 105, y, { align: 'center' });
      
      // خط التوقيع
      y += 30;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(60, y, 140, y);
      y += 10;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text('مدير النظام', 100, y, { align: 'center' });
      
      // تذييل الصفحة
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `رقم المرجع: ${completeData.policy_info.policy_number} | تم الإنشاء آلياً بتاريخ: ${new Date().toLocaleDateString('ar-SA')}`,
        105, 285, { align: 'center' }
      );
      doc.text(
        'هذه وثيقة إرشادية وتقديرية ولا تغني عن الوثائق الرسمية الموقعة مع شركات التأمين المرخصة',
        105, 290, { align: 'center' }
      );
      
      // ترقيم الصفحات
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(`صفحة ${i} من ${pageCount}`, 195, 290, { align: 'right' });
      }
      
      setProgress(95);
      
      // حفظ الملف
      const fileName = `بيان_تغطية_${completeData.policy_info.policy_number}_${new Date().getTime()}.pdf`;
      doc.save(fileName);
      
      setProgress(100);
      setLoading(false);
      setSuccess(`✅ تم إنشاء وتحميل PDF بنجاح: ${fileName}`);
      
      // حفظ PDF في قاعدة البيانات (اختياري)
      try {
        const pdfOutput = doc.output('datauristring');
        await api.post(`/api/health/health-insurance-policies/${policyData.id}/generate_and_save_pdf/`, {
          pdf_data: pdfOutput,
          filename: fileName
        });
      } catch (saveError) {
        console.log('⚠️ تم حفظ الملف محلياً فقط:', saveError.message);
      }
      
    } catch (err) {
      console.error('❌ خطأ في إنشاء PDF:', err);
      setError(`فشل إنشاء PDF: ${err.message || 'حدث خطأ غير معروف'}`);
      setLoading(false);
    }
  };

  // ========== معاينة للطباعة ==========
  const previewForPrint = () => {
    const completeData = getCompletePolicyData();
    const familyData = getFamilyMembersData();
    const familyDescription = completeData.family_members.family_description;
    
    // حساب تواريخ الصلاحية
    const startDate = new Date(policyData.inception_date || new Date());
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    const arabicStartDate = convertToArabicDate(startDate);
    const arabicEndDate = convertToArabicDate(endDate);
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>بيان تغطية تأمينية - ${completeData.policy_info.policy_number}</title>
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
            color: #000;
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
          
          .article {
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
          
          .article-content p {
            margin-bottom: 12px;
          }
          
          .article-content ul {
            padding-right: 20px;
            margin-bottom: 15px;
          }
          
          .article-content li {
            margin-bottom: 8px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
          }
          
          th {
            background: #000;
            color: white;
            padding: 12px;
            text-align: center;
            font-weight: bold;
          }
          
          td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: center;
            vertical-align: middle;
          }
          
          tr:nth-child(even) {
            background: #f8f9fa;
          }
          
          .total-row {
            background: #d4edda !important;
            font-weight: bold;
          }
          
          .highlight {
            background: #fff3cd;
            padding: 10px;
            border-right: 4px solid #000;
            margin: 15px 0;
          }
          
          .signature-section {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #7f8c8d;
          }
          
          .signature-box {
            display: inline-block;
            width: 45%;
            margin: 0 2%;
            text-align: center;
            vertical-align: top;
          }
          
          .signature-line {
            width: 200px;
            height: 1px;
            background: #000;
            margin: 40px auto 10px;
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
          
          .badge-primary { background: #fff; color: white; }
          .badge-success { background: #fff; color: white; }
          .badge-warning { background: #fff; color: white; }
          .badge-info { background: #fff; color: white; }
          
          .print-only {
            display: none;
          }
          
          @media print {
            .print-only { display: block; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <!-- صفحة العنوان -->
        <div class="header">
          <h1>بيان تغطية تأمينية صحية</h1>
          <div class="subtitle">(وثيقة معلوماتية غير ملزمة قانونيًا)</div>
          <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px;">
            <span class="badge badge-primary">رقم الوثيقة: ${completeData.policy_info.policy_number}</span>
            <span class="badge badge-success">${completeData.policy_info.status}</span>
            <span class="badge badge-info">${completeData.coverage_details.plan_type}</span>
          </div>
          <div style="margin-top: 15px; color: #7f8c8d;">
            تاريخ الإصدار: ${completeData.policy_info.inception_date} | تاريخ الانتهاء: ${completeData.policy_info.expiry_date}
          </div>
        </div>
        
        <!-- معلومات الوثيقة -->
        <div class="policy-info">
          <h3 style="color: #000; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <FaBuilding style="margin-left: 10px;"></FaBuilding>
            معلومات الوثيقة الأساسية
          </h3>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">الشركة المستفيدة:</span>
              <span class="info-value">${completeData.company_data.name}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">عدد الموظفين:</span>
              <span class="info-value">${completeData.company_data.total_employees}</span>
            </div>
            <div class="info-item">
              <span class="info-label">القسط السنوي:</span>
              <span class="info-value" style="color: #000; font-weight: bold;">
                $${completeData.premium_details.total_premium.toFixed(2)}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">نوع التغطية:</span>
              <span class="info-value">${completeData.family_members.insurance_type} - ${familyDescription.title}</span>
            </div>
          </div>
          
          <div class="highlight">
            <strong> ملخص المؤمن عليهم:</strong><br>
            • ${familyData.employees} موظف<br>
            ${familyData.spouses > 0 ? `• ${familyData.spouses} زوجة<br>` : ''}
            ${familyData.children > 0 ? `• ${familyData.children} أبناء<br>` : ''}
            ${familyData.parents > 0 ? `• ${familyData.parents} والدين<br>` : ''}
            <small>وفق نوع التغطية ${completeData.family_members.insurance_type}</small>
          </div>
        </div>
        
        <div class="page-break"></div>
        
        <!-- المادة 1 -->
        <div class="section-title">المادة (1): الغرف من الوثيقة</div>
        <div class="article">
          <div class="article-content">
            <p>تم إعداد هذا البيان من خلال نظام SafeRatio، وهو نظام إلكتروني مخصص لحساب وتحليل نسب التغطية التأمينية الصحية، وذلك بهدف تقديم عرض استرشادي يساعد الجهات والأفراد على اتخاذ قرارات تأمينية مبنية على البيانات.</p>
            
            <p>ولا تُعد هذه الوثيقة عقد تأمين أو التزامًا قانونيًا من أي طرف.</p>
          </div>
        </div>
        
        <!-- المادة 2 -->
        <div class="section-title">المادة (2): الجهة المستفيدة</div>
        <div class="article">
          <div class="article-content">
            <p>الجهة / الشركة: ${completeData.company_data.name || 'ee'}</p>
            
            <p>وقد تم إعداد هذا البيان استنادًا إلى البيانات التي تم إدخالها في النظام من قبل الجهة المستفيدة.</p>
          </div>
        </div>
        
        <!-- المادة 3 -->
        <div class="section-title">المادة (3): المؤمن عليهم (استرشاديًا)</div>
        <div class="article">
          <div class="article-content">
            <p>بناءً على البيانات المدخلة، يشمل هذا البيان الفئات التالية وفق الخطة المختارة:</p>
            
            <ul>
              <li>الموظفون المسجّلون لدى الجهة المستفيدة.</li>
              <li>الزوجات والأبناء وفق الشروط العمرية المعتمدة في الخطة.</li>
              <li>الوالدان في حال استيفاء الشروط الخاصة (مثل السن أو الإعاقة المزمنة)، وذلك لأغراض الاحتساب فقط.</li>
            </ul>
            
            <div class="highlight">
              <strong>نوع التغطية المختار:</strong> ${familyDescription.title}<br>
              ${familyDescription.details.map(detail => `• ${detail}<br>`).join('')}
            </div>
          </div>
        </div>
        
        <div class="page-break"></div>
        
        <!-- المادة 4 -->
        <div class="section-title">المادة (4): نطاق التغطية التأمينية (تقديري)</div>
        <div class="article">
          <div class="article-content">
            <p>يعرض هذا البيان نطاق التغطية التأمينية الصحية المقترحة، والتي قد تشمل:</p>
            
            <ul>
              <li>العلاج الداخلي والخارجي.</li>
              <li>خدمات الطوارئ داخل الدولة.</li>
              <li>خدمات الطوارئ خارج الدولة ضمن النسب المحددة.</li>
              <li>التغطيات الإضافية المختارة، إن وجدت.</li>
            </ul>
            
            <p>وتُعد جميع القيم والنسب الواردة تقديرية وقابلة للتغيير من قبل شركة التأمين الفعلية عند التعاقد.</p>
          </div>
        </div>
        
        <!-- المادة 5 -->
        <div class="section-title">المادة (5): الأمراض المزمنة</div>
        <div class="article">
          <div class="article-content">
            <p>تم احتساب التغطية الخاصة بالأمراض المزمنة بناءً على اختيار الجهة المستفيدة للتغطية الإضافية، ووفق نسبة التغطية المحددة في الخطة المختارة.</p>
            
            <p>ولا يتطلب النظام تحديد نوع المرض، حيث يتم التعامل مع الأمراض المزمنة كتصنيف عام لأغراض الاحتساب فقط.</p>
          </div>
        </div>
        
        <!-- المادة 6 -->
        <div class="section-title">المادة (6): القسط التأميني التقديري ومدة العرض</div>
        <div class="article">
          <div class="article-content">
            <p>مدة صلاحية هذا البيان من تاريخ ${arabicStartDate} وحتى ${arabicEndDate}، وذلك لأغراض العرض فقط.</p>
            
            <div class="highlight">
              <strong>القسط التأميني الإجمالي التقديري:</strong> ${completeData.premium_details.total_premium.toFixed(2)} دولار أمريكي.
            </div>
            
            <p>ويُعد هذا القسط غير نهائي ويخضع للتقييم والموافقة من شركة التأمين المختارة لاحقًا.</p>
          </div>
        </div>
        
        <!-- المادة 7 -->
        <div class="section-title">المادة (7): إخلاء المسؤولية</div>
        <div class="article">
          <div class="article-content">
            <ul>
              <li>لا يتحمل نظام SafeRatio أي التزام قانوني أو مالي ناتج عن استخدام هذا البيان.</li>
              <li>لا تُعد هذه الوثيقة وثيقة تأمين رسمية.</li>
              <li>تعتمد التغطية الفعلية على الشروط والأحكام الصادرة عن شركة التأمين التي يتم التعاقد معها.</li>
            </ul>
          </div>
        </div>
        
        <!-- المادة 8 -->
        <div class="section-title">المادة (8): أحكام عامة</div>
        <div class="article">
          <div class="article-content">
            <p>تم إصدار هذا البيان لأغراض الدراسة والتحليل ودعم اتخاذ القرار فقط، ويخضع أي تعاقد تأميني لاحق للشروط والسياسات المعتمدة لدى شركات التأمين المرخصة.</p>
          </div>
        </div>
        
        <!-- توقيعات -->
        <div class="signature-section">
          <div class="signature-box">
            <h4>صادر عن</h4>
            <p>نظام SafeRatio</p>
            <p>منصة احتساب وتحليل التغطية التأمينية الصحية</p>
            <div class="signature-line"></div>
            <p>مدير النظام</p>
          </div>
        </div>
        
        <!-- تذييل الصفحة -->
        <div class="footer">
          <p>تم إنشاء هذا البيان آلياً بواسطة نظام SafeRatio للتأمين الصحي</p>
          <p>رقم المرجع: ${completeData.policy_info.policy_number} | تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}</p>
          <p class="print-only">صفحة 1 من 4</p>
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
          إنشاء بيان تغطية تأمينية صحية
        </h4>
        <p style={{ color: '#7f8c8d' }}>
          إنشاء وتحميل بيان تغطية تأمينية صحية كامل مع النصوص القانونية المحددة
        </p>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '15px', 
          marginTop: '15px',
          flexWrap: 'wrap'
        }}>
          <Badge bg="primary" style={{ fontSize: '14px', padding: '8px 15px' }}>
            <FaBuilding style={{ marginLeft: '5px' }} />
            {policyData.company_name || 'غير محدد'}
          </Badge>
          <Badge bg="success" style={{ fontSize: '14px', padding: '8px 15px' }}>
            <FaDollarSign style={{ marginLeft: '5px' }} />
            القسط: ${parseFloat(policyData.total_premium || 0).toFixed(2)}
          </Badge>
          <Badge bg="info" style={{ fontSize: '14px', padding: '8px 15px' }}>
            نوع: {policyData.insurance_type || 'B'}
          </Badge>
        </div>
      </div>
      
      {/* بيانات العائلة السريعة */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '25px',
        border: '1px solid #dee2e6'
      }}>
        <h6 style={{ color: '#000', marginBottom: '15px' }}>
          <FaUsers style={{ marginLeft: '10px', color: '#000' }} />
          ملخص المؤمن عليهم حسب نوع التغطية
        </h6>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '15px',
          textAlign: 'center'
        }}>
          <div style={{ padding: '15px', backgroundColor: '#e8f4fc', borderRadius: '6px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>
              {getFamilyMembersData().employees}
            </div>
            <div style={{ color: '#2c3e50', marginTop: '5px' }}>الموظفون</div>
            <small style={{ color: '#7f8c8d' }}>تغطية 100%</small>
          </div>
          
          <div style={{ padding: '15px', backgroundColor: '#e8f6e8', borderRadius: '6px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>
              {getFamilyMembersData().spouses}
            </div>
            <div style={{ color: '#2c3e50', marginTop: '5px' }}>الزوجات</div>
            <small style={{ color: '#7f8c8d' }}>حسب النوع {policyData.insurance_type || 'B'}</small>
          </div>
          
          <div style={{ padding: '15px', backgroundColor: '#fff9e6', borderRadius: '6px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>
              {getFamilyMembersData().children}
            </div>
            <div style={{ color: '#2c3e50', marginTop: '5px' }}>الأبناء</div>
            <small style={{ color: '#7f8c8d' }}>حسب النوع {policyData.insurance_type || 'B'}</small>
          </div>
          
          <div style={{ padding: '15px', backgroundColor: '#f4ecf7', borderRadius: '6px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>
              {getFamilyMembersData().parents}
            </div>
            <div style={{ color: '#2c3e50', marginTop: '5px' }}>الوالدان</div>
            <small style={{ color: '#7f8c8d' }}>حسب النوع {policyData.insurance_type || 'B'}</small>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#f0f8ff',
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          <strong>نوع التغطية المختار:</strong> {getFamilyDescriptionByType(policyData.insurance_type || 'B').title}
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
          <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>ماذا سيحتوي البيان؟</span>
          <div style={{ marginTop: '10px', textAlign: 'right' }}>
            <p style={{ marginBottom: '5px' }}>✓ 8 مواد قانونية كاملة حسب النص المطلوب</p>
            <p style={{ marginBottom: '5px' }}>✓ تفاصيل المؤمن عليهم حسب نوع التغطية (A, B, C)</p>
            <p style={{ marginBottom: '5px' }}>✓ بيانات الشركة الأساسية</p>
            <p style={{ marginBottom: '5px' }}>✓ نطاق التغطية والتكاليف التقديرية</p>
            <p style={{ marginBottom: '5px' }}>✓ مدة صلاحية العرض</p>
            <p>✓ إخلاء المسؤولية والأحكام العامة</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPdfWithSave;