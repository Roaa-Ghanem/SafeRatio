// AdvancedPremiumCalculator.js
import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import "./AdvancedPremiumCalculator.css";
import { useNavigate } from 'react-router-dom';

function AdvancedPremiumCalculator({
  company,
  insuranceType,
  onCalculate,
  onCancel,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailedResult, setDetailedResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showInsuranceDetails, setShowInsuranceDetails] = useState(false);
  const [selectedInsuranceDetails, setSelectedInsuranceDetails] = useState(null);
  const [employeeStats, setEmployeeStats] = useState({
    total: 0,
    married: 0,
    male: 0,
    female: 0,
    childrenTotal: 0,
    wivesTotal: 0,
    parentsTotal: 0,
    includeParentsCount: 0
  });
  const [employeesData, setEmployeesData] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [familyData, setFamilyData] = useState(null); // ✅ إضافة state جديد

  // ==================== HELPER FUNCTIONS ====================
  
  // دالة لحساب تاريخ الميلاد من العمر
  const calculateBirthDateFromAge = (age) => {
    if (!age || isNaN(age)) return "1990-01-01";
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    return `${birthYear}-01-01`;
  };

  // دالة لتحويل الجنس
  const normalizeGender = (gender) => {
    if (!gender) return "ذكر";
    const g = String(gender).toLowerCase().trim();
    if (g === "ذكر" || g === "male" || g === "m") return "ذكر";
    if (g === "أنثى" || g === "female" || g === "f") return "أنثى";
    return "ذكر";
  };

  // دالة لتحويل الحالة الاجتماعية
  const normalizeMaritalStatus = (status) => {
    if (!status) return "أعزب";
    const s = String(status).toLowerCase().trim();
    if (s === "متزوج" || s === "married" || s === "m") return "متزوج";
    return "أعزب";
  };

  // ==================== DATA LOADING ====================
  
  useEffect(() => {
    if (!company?.id) {
      console.log("❌ لا يوجد company.id");
      return;
    }

    console.log("🔄 جلب بيانات الموظفين لـ companyId:", company.id);
    setLoadingEmployees(true);

    const fetchEmployeesData = async () => {
      try {
        // 1. جلب بيانات الموظفين من الـ endpoint الصحيح
        const response = await api.get(
          `/api/health/companies/${company.id}/employees/`
        );
        
        console.log("✅ استجابة API كاملة:", response.data);
        
        if (response.data.success && response.data.employees) {
          const backendEmployees = response.data.employees;
          console.log(`📥 تم جلب ${backendEmployees.length} موظف من الخادم`);
          
          // 🔍 فحص البيانات الواردة
          if (backendEmployees.length > 0) {
            console.log("🔍 أول موظف من الخادم (كامل):", backendEmployees[0]);
            console.log("🔍 مفاتيح الموظف الأول:", Object.keys(backendEmployees[0]));
          }
          
          // **تحويل البيانات مع التصحيح**
          const formattedEmployees = backendEmployees.map((emp, index) => {
            // 🔍 الحصول على الاسم بشكل صحيح
            const employeeName = emp.name || emp.full_name || emp.اسم || `موظف ${index + 1}`;
            
            // 🔍 فحص دقيق للأمراض المزمنة
            const chronicDiseasesValue = emp.chronic_diseases;
            let hasChronicDiseases = false;
            
            console.log(`🔍 موظف ${index + 1}: ${employeeName}`, {
              chronic_diseases_raw: chronicDiseasesValue,
              type: typeof chronicDiseasesValue,
              parents_count: emp.parents_count,
              include_parents: emp.include_parents,
              all_keys: Object.keys(emp) // 🔍 عرض جميع المفاتيح
            });
            
            // تحويل الأمراض المزمنة إلى boolean
            if (chronicDiseasesValue !== undefined && chronicDiseasesValue !== null) {
              if (typeof chronicDiseasesValue === 'boolean') {
                hasChronicDiseases = chronicDiseasesValue;
              } else if (typeof chronicDiseasesValue === 'string') {
                const normalized = String(chronicDiseasesValue).toLowerCase().trim();
                hasChronicDiseases = normalized === 'نعم' || 
                                    normalized === 'yes' || 
                                    normalized === 'true' || 
                                    normalized === '1' ||
                                    normalized === '✓' ||
                                    normalized === 'يوجد';
              } else if (typeof chronicDiseasesValue === 'number') {
                hasChronicDiseases = chronicDiseasesValue === 1;
              }
            }
            
            console.log(`✅ ${employeeName}: الأمراض المزمنة = ${hasChronicDiseases} (من: ${chronicDiseasesValue})`);
            
            return {
              id: emp.id || index + 1,
              full_name: employeeName, // ✅ استخدام الاسم الصحيح
              employee_number: emp.employee_number || `EMP-${emp.id || index + 1}`,
              gender: normalizeGender(emp.gender),
              date_of_birth: emp.date_of_birth || calculateBirthDateFromAge(emp.age || 30),
              salary: emp.base_salary || emp.salary || 3000,
              marital_status: normalizeMaritalStatus(emp.marital_status),
              children_count: emp.number_of_children || emp.children_count || 0,
              parents_count: emp.parents_count || 0,
              wives_count: emp.wives_count || 0,
              include_parents: emp.include_parents || false,
              chronic_diseases: hasChronicDiseases,
              age: emp.age || 30,
              job_title: emp.position || "موظف",
              department: emp.department || "عام",
              raw_data: emp
            };
          });
          
          console.log("🔄 البيانات المنسقة (عينة):", formattedEmployees.slice(0, 2));
          setEmployeesData(formattedEmployees);
          
          // تحليل الإحصائيات فوراً
          const stats = analyzeEmployees(formattedEmployees);
          console.log("📊 الإحصائيات بعد التحليل:", stats);
          setEmployeeStats(stats);
          
          // **حساب بيانات العائلة فوراً**
          if (formattedEmployees.length > 0) {
            const rules = insuranceRules[advancedForm.insuranceType];
            const calculatedFamilyData = calculateDetailedFamilyData(
              formattedEmployees, 
              rules
            );
            console.log("👨‍👩‍👧‍👦 بيانات العائلة المحسوبة:", calculatedFamilyData);
            setFamilyData(calculatedFamilyData);
          }
          
          // حفظ معلومات للتصحيح
          setDebugInfo({
            backendCount: backendEmployees.length,
            formattedCount: formattedEmployees.length,
            sampleBackend: backendEmployees.slice(0, 2),
            sampleFormatted: formattedEmployees.slice(0, 2),
            timestamp: new Date().toISOString()
          });
          
        } else {
          console.warn("⚠️ لا توجد بيانات موظفين في الاستجابة");
          setEmployeesData([]);
          setEmployeeStats({
            total: 0,
            married: 0,
            male: 0,
            female: 0,
            childrenTotal: 0,
            wivesTotal: 0,
            parentsTotal: 0,
            includeParentsCount: 0
          });
        }
        
      } catch (error) {
        console.error("❌ خطأ في تحميل الموظفين:", error);
        setEmployeesData([]);
        setEmployeeStats({
          total: 0,
          married: 0,
          male: 0,
          female: 0,
          childrenTotal: 0,
          wivesTotal: 0,
          parentsTotal: 0,
          includeParentsCount: 0
        });
        setError(`فشل تحميل بيانات الموظفين: ${error.message}`);
      } finally {
        setLoadingEmployees(false);
      }
    };
    
    fetchEmployeesData();
  }, [company?.id]);

  // ==================== EMPLOYEE ANALYSIS ====================
  
  const analyzeEmployees = (employees) => {
    console.log("📊 تحليل الموظفين - البيانات الواردة:", 
      employees.map(emp => ({
        name: emp.full_name,
        marital_status: emp.marital_status,
        wives_count: emp.wives_count,
        parents_count: emp.parents_count,
        include_parents: emp.include_parents,
        children_count: emp.children_count
      }))
    );
    
    let total = employees.length;
    let married = 0;
    let male = 0;
    let female = 0;
    let childrenTotal = 0;
    let wivesTotal = 0;
    let parentsTotal = 0;
    let includeParentsCount = 0;
    
    employees.forEach(emp => {
      // الجنس
      if (emp.gender === 'ذكر' || emp.gender === 'male') {
        male++;
      } else if (emp.gender === 'أنثى' || emp.gender === 'female') {
        female++;
      }
      
      // الحالة الاجتماعية
      const isMarried = emp.marital_status === 'متزوج' || emp.marital_status === 'married';
      if (isMarried) {
        married++;
        
        // **عدد الزوجات**
        const wivesCount = parseInt(emp.wives_count) || 0;
        if (wivesCount > 0) {
          wivesTotal += wivesCount;
        } else {
          // إذا متزوج ولم يدخل عدد زوجات، نفترض واحدة
          wivesTotal += 1;
        }
      }
      
      // **الأبناء**
      const childrenCount = parseInt(emp.children_count) || 0;
      childrenTotal += childrenCount;
      
      // **الوالدين**
      const hasParents = emp.include_parents === true || 
                        emp.include_parents === 'نعم' ||
                        emp.include_parents === 'yes' ||
                        emp.include_parents === 'true' ||
                        emp.include_parents === '1';
      
      if (hasParents) {
        includeParentsCount++;
        
        const parentsCount = parseInt(emp.parents_count) || 0;
        if (parentsCount > 0) {
          parentsTotal += parentsCount;
        } else {
          // إذا يريد إدراج الوالدين ولم يدخل عدداً، نفترض أب + أم
          parentsTotal += 2;
        }
      }
    });
    
    const stats = {
      total,
      married,
      male,
      female,
      childrenTotal,
      wivesTotal,
      parentsTotal,
      includeParentsCount
    };
    
    console.log("📊 نتائج التحليل:", stats);
    return stats;
  };

  // ==================== CALCULATE DETAILED FAMILY DATA ====================
  
  const calculateDetailedFamilyData = useCallback((employees, rules) => {
    console.log("🔍 بدء حساب بيانات العائلة:", {
      employeesCount: employees.length,
      rulesCode: rules.code,
      rulesIncludesParents: rules.includesParents
    });

    if (!employees || employees.length === 0) {
      return {
        spouses: 0,
        children: 0,
        parents: 0,
        parentsIncluded: 0,
        parentsExcluded: 0,
        marriedCount: 0,
        maleCount: 0,
        femaleCount: 0,
        details: []
      };
    }

    const result = {
      spouses: 0,
      children: 0,
      parents: 0,
      parentsIncluded: 0,
      parentsExcluded: 0,
      marriedCount: 0,
      maleCount: 0,
      femaleCount: 0,
      details: []
    };

    // حساب عدد الذكور والإناث والمتزوجين
    employees.forEach(emp => {
      if (emp.gender === 'ذكر' || emp.gender === 'male') {
        result.maleCount++;
      } else if (emp.gender === 'أنثى' || emp.gender === 'female') {
        result.femaleCount++;
      }
      
      const isMarried = emp.marital_status === 'متزوج' || emp.marital_status === 'married';
      if (isMarried) {
        result.marriedCount++;
      }
    });

    // حساب تفاصيل كل موظف
    employees.forEach((emp, index) => {
      const empDetail = {
        id: emp.id || index + 1,
        name: emp.full_name || `موظف ${index + 1}`,
        isMarried: emp.marital_status === 'متزوج' || emp.marital_status === 'married',
        spouses: 0,
        children: 0,
        parents: 0,
        includeParents: false,
        eligibilityReason: '',
        hasChronicDiseases: emp.chronic_diseases || false, // ✅ حفظ حالة الأمراض المزمنة
        rawData: emp
      };

      console.log(`👤 معالجة الموظف ${empDetail.name}:`, {
        chronic_diseases: emp.chronic_diseases,
        parents_count: emp.parents_count,
        include_parents: emp.include_parents,
        marital_status: emp.marital_status
      });

      // 🔹 الزوجات
      if (empDetail.isMarried && rules.includesSpouse) {
        const wivesCount = parseInt(emp.wives_count) || 0;
        
        if (wivesCount > 0) {
          // الحد الأقصى 4 زوجات حسب الشرع
          empDetail.spouses = Math.min(wivesCount, 4);
        } else {
          // إذا كان متزوجاً ولم يُدخل عدد زوجات، نفترض زوجة واحدة
          empDetail.spouses = 1;
        }
        
        result.spouses += empDetail.spouses;
        console.log(`👰 ${empDetail.name}: ${empDetail.spouses} زوجة (من البيانات: ${wivesCount})`);
      }

      // 🔹 الأبناء
      const childrenCount = parseInt(emp.children_count) || 0;
      if (childrenCount > 0 && rules.includesChildren) {
        empDetail.children = childrenCount;
        result.children += empDetail.children;
        console.log(`👶 ${empDetail.name}: ${empDetail.children} ابن (من البيانات: ${childrenCount})`);
      }

      // 🔹 **الوالدان - التصحيح المهم هنا**
      // تحقق أولاً إذا كان الموظف يريد تضمين الوالدين
      const hasParentsInData = emp.include_parents === true || 
                              emp.include_parents === 'نعم' ||
                              emp.include_parents === 'yes' ||
                              emp.include_parents === 'true' ||
                              emp.include_parents === '1' ||
                              emp.include_parents === '✓';
      
      console.log(`📝 ${empDetail.name}: يريد تضمين الوالدين؟ ${hasParentsInData}`);
      
      if (hasParentsInData && rules.includesParents) {
        empDetail.includeParents = true;
        
        const parentsCountInData = parseInt(emp.parents_count) || 0;
        const hasChronicDisease = emp.chronic_diseases === true;
        
        console.log(`🏥 ${empDetail.name}: الأمراض المزمنة = ${hasChronicDisease} (القيمة الأصلية: ${emp.chronic_diseases})`);
        
        let eligibleParentsCount = 0;
        let eligibilityReason = '';
        
        // **الشروط الخاصة للتغطية A**
        if (rules.code === 'A') {
          // في التغطية A، الوالدين يحتاجون إلى شرط إضافي
          if (hasChronicDisease) {
            // إذا لديه إعاقة مزمنة
            if (parentsCountInData > 0) {
              eligibleParentsCount = Math.min(parentsCountInData, 2);
            } else {
              // إذا لم يُدخل عدداً، نفترض أب + أم (2)
              eligibleParentsCount = 2;
            }
            eligibilityReason = 'إعاقة مزمنة';
            console.log(`✅ ${empDetail.name}: الوالدين مؤهلين بسبب إعاقة مزمنة`);
          } else {
            // غير مؤهل للتغطية A بدون إعاقة
            eligibilityReason = 'غير مؤهل للتغطية A (يتطلب إعاقة مزمنة)';
            console.log(`❌ ${empDetail.name}: الوالدين غير مؤهلين للتغطية A بدون إعاقة مزمنة`);
          }
        } else {
          // للتغطيات الأخرى (C) - مشمولون مباشرة
          if (parentsCountInData > 0) {
            eligibleParentsCount = Math.min(parentsCountInData, 2);
          } else {
            eligibleParentsCount = 2; // أب + أم
          }
          eligibilityReason = 'مشمول بالتغطية';
          console.log(`✅ ${empDetail.name}: الوالدين مشمولين في التغطية ${rules.code}`);
        }
        
        // تحديد العدد النهائي
        if (eligibleParentsCount > 0) {
          empDetail.parents = eligibleParentsCount;
          result.parents += eligibleParentsCount;
          result.parentsIncluded += eligibleParentsCount;
          console.log(`🎯 ${empDetail.name}: ${eligibleParentsCount} والد مؤهل (${eligibilityReason})`);
        } else {
          empDetail.parents = 0;
          // حساب عدد الوالدين المستبعدين
          const excludedCount = Math.min(parentsCountInData || 2, 2);
          result.parentsExcluded += excludedCount;
          console.log(`🚫 ${empDetail.name}: الوالدين مستبعدين (${eligibilityReason})`);
        }
        
        empDetail.eligibilityReason = eligibilityReason;
        
      } else if (hasParentsInData && !rules.includesParents) {
        // إذا يريد تضمين الوالدين ولكن التغطية لا تشملهم
        empDetail.includeParents = true;
        empDetail.eligibilityReason = 'التغطية لا تشمل الوالدين';
        console.log(`ℹ️ ${empDetail.name}: التغطية لا تشمل الوالدين`);
        
      } else {
        console.log(`📝 ${empDetail.name}: لا يريد تضمين الوالدين`);
      }

      result.details.push(empDetail);
    });

    console.log("✅ نتائج حساب العائلة:", {
      totalSpouses: result.spouses,
      totalChildren: result.children,
      totalParents: result.parents,
      parentsIncluded: result.parentsIncluded,
      parentsExcluded: result.parentsExcluded,
      detailsCount: result.details.length
    });

    return result;
  }, []);

  // ==================== CALCULATION FUNCTIONS ====================
  
  const calculateInsuredBreakdown = (employees, familyData, rules) => {
    const totalEmployees = employees.length;
    
    // حساب عدد المشتركين
    const counts = {
      employees: totalEmployees,
      spouses: rules.includesFamily ? familyData.spouses : 0,
      children: rules.includesFamily ? familyData.children : 0,
      parents: (rules.includesParents && rules.includesFamily) ? familyData.parents : 0
    };

    console.log("🔢 أعداد المشتركين النهائية:", counts);

    // الأسعار الثابتة
    const prices = {
      employee: rules.baseRate,
      spouse: rules.baseRate * 0.5,  // 50% من سعر الموظف
      child: rules.baseRate * 0.5,   // 50% من سعر الموظف
      parent: rules.baseRate * 0.3   // 30% من سعر الموظف
    };

    // حساب التكاليف
    const costs = {
      employees: counts.employees * prices.employee,
      spouses: counts.spouses * prices.spouse,
      children: counts.children * prices.child,
      parents: counts.parents * prices.parent
    };

    const totalInsured = counts.employees + counts.spouses + counts.children + counts.parents;
    const totalCost = costs.employees + costs.spouses + costs.children + costs.parents;

    return {
      counts,
      prices,
      costs,
      totalInsured,
      totalCost,
      familyCount: counts.spouses + counts.children + counts.parents
    };
  };

  const calculateCoinsuranceDiscount = (basePremium, rules) => {
    const inpatientRate = rules.inpatientCoinsurance || 0;
    const outpatientRate = rules.outpatientCoinsurance || 0;
    const totalRate = inpatientRate + outpatientRate;
    
    const totalDiscount = basePremium * totalRate;
    const inpatientDiscount = basePremium * inpatientRate;
    const outpatientDiscount = basePremium * outpatientRate;

    const result = {
      inpatientRate: inpatientRate * 100,
      outpatientRate: outpatientRate * 100,
      totalRate: totalRate * 100,
      inpatientDiscount,
      outpatientDiscount,
      total: totalDiscount
    };

    console.log("💸 نسب التحمل المحسوبة:", result);
    return result;
  };

  const calculateMandatoryBenefits = (employees, rules) => {
    let total = 0;
    const details = [];

    // 1. الحمل (للمتزوجات 18-45 سنة)
    const eligibleFemales = employees.filter(emp => 
      (emp.gender === 'أنثى' || emp.gender === 'female') && 
      (emp.marital_status === 'متزوج' || emp.marital_status === 'married') &&
      emp.age >= 18 && emp.age <= 45
    ).length;

    let maternityCost = 0;
    if (rules.code === "A") {
      maternityCost = eligibleFemales * 300 * 0.3; // $300 × 30% احتمال
    } else if (rules.code === "B") {
      maternityCost = eligibleFemales * 250 * 0.3; // $250 × 30% احتمال
    } else if (rules.code === "C") {
      maternityCost = eligibleFemales * 200 * 0.3; // $200 × 30% احتمال
    }

    if (maternityCost > 0) {
      details.push({
        type: 'pregnancy',
        count: eligibleFemales,
        cost: maternityCost,
        description: `الحمل (${eligibleFemales} × ${rules.code === "A" ? "$300" : rules.code === "B" ? "$250" : "$200"} × 30%)`
      });
      total += maternityCost;
    }

    // 2. الأدوية المزمنة
    const chronicPatients = employees.filter(emp => 
      emp.chronic_diseases && 
      (emp.chronic_diseases === 'نعم' || 
      emp.chronic_diseases === true || 
      emp.chronic_diseases !== 'لا')
    ).length;

    let chronicCost = 0;
    if (rules.code === "A" || rules.code === "B") {
      chronicCost = chronicPatients * 50 * 12; // $50 شهرياً
    } else if (rules.code === "C") {
      chronicCost = chronicPatients * 30 * 12; // $30 شهرياً
    }

    if (chronicCost > 0) {
      details.push({
        type: 'chronic_medication',
        count: chronicPatients,
        cost: chronicCost,
        description: `الأدوية المزمنة (${chronicPatients} × ${rules.code === "C" ? "$30" : "$50"} × 12 شهر)`
      });
      total += chronicCost;
    }

    // 3. النظارات الطبية (للخطة A و B فقط)
    let opticalCost = 0;
    if (rules.code === "A") {
      opticalCost = employees.length * 50; // $50 لكل موظف
    } else if (rules.code === "B") {
      opticalCost = employees.length * 30; // $30 لكل موظف
    }

    if (opticalCost > 0) {
      details.push({
        type: 'optical',
        count: employees.length,
        cost: opticalCost,
        description: `النظارات الطبية (${employees.length} × ${rules.code === "A" ? "$50" : "$30"})`
      });
      total += opticalCost;
    }

    console.log("🏥 المنافع الإلزامية المحسوبة:", { total, details });
    return {
      total,
      details,
      eligibleFemales,
      chronicPatients
    };
  };

  const calculateAdministrativeCosts = (totalInsured) => {
    const cardCost = totalInsured * 3; // $3 لكل بطاقة
    const processingFee = totalInsured * 2; // $2 رسوم معالجة

    const result = {
      cardCost,
      processingFee,
      total: cardCost + processingFee,
      details: [
        { type: 'cards', cost: cardCost, description: `بطاقات (${totalInsured} × $3)` },
        { type: 'processing', cost: processingFee, description: `رسوم معالجة (${totalInsured} × $2)` }
      ]
    };

    console.log("📋 التكاليف الإدارية:", result);
    return result;
  };

  const calculateEmployeeStats = (employees, ageRange) => {
    let eligible = 0;
    let excluded = 0;

    employees.forEach((emp) => {
      const age = emp.age || calculateAge(emp.date_of_birth);
      if (age >= ageRange.min && age <= ageRange.max) {
        eligible++;
      } else {
        excluded++;
      }
    });

    return { eligibleEmployees: eligible, excludedEmployees: excluded };
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 25;
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return 25;
    }
  };

  const calculateAdditionalCoverageCost = (options, totalInsured) => {
    let cost = 0;
    const rates = {
      maternity: 200,
      dental: 100,
      optical: 50,
      chronicMedication: 30 * 12, // سنوي
      overseasTreatment: 500,
    };

    Object.keys(options).forEach((key) => {
      if (options[key]) {
        cost += rates[key] * totalInsured;
      }
    });

    return cost;
  };

  const applyPaymentMethodEffect = (totalPremium, paymentMethod) => {
    const multipliers = {
      annual: 1.0,
      semiAnnual: 1.05,   // زيادة 5%
      quarterly: 1.10,    // زيادة 10%
      monthly: 1.15       // زيادة 15%
    };
    
    const multiplier = multipliers[paymentMethod] || 1.0;
    const adjustedPremium = totalPremium * multiplier;
    
    console.log(`💳 تأثير الدفع: ${paymentMethod} ×${multiplier}`);
    console.log(`   قبل: ${totalPremium}, بعد: ${adjustedPremium}`);
    
    return {
      originalPremium: totalPremium,
      adjustedPremium: adjustedPremium,
      multiplier: multiplier,
      increaseAmount: adjustedPremium - totalPremium,
      increasePercentage: (multiplier - 1) * 100
    };
  };

  // ==================== INSURANCE RULES ====================
  
  const insuranceRules = {
    A: {
      name: "التغطية الشاملة",
      code: "A",
      icon: "🏥",
      description: "تغطية كاملة للموظفين وعائلاتهم",
      includesFamily: true,
      includesSpouse: true,
      includesChildren: true,
      includesParents: true,
      familyDescription: "يشمل الزوجات والأبناء ويمكن إضافة الوالدين بشروط خاصة",
      inpatientCoinsurance: 0.1,
      outpatientCoinsurance: 0.15,
      emergencyOverseas: 0.8,
      selectiveOverseas: 0.0,
      baseRate: 1500,
      spouseDiscount: 0.5,     // 50%
      childDiscount: 0.5,      // 50%
      parentDiscount: 0.3, 
      minChildrenRatio: 1.0,
      minParentsRatio: 0.5,
      ageRange: { min: 0, max: 65 },
      coverageIncludes: [
        "الموظف + الزوجة",
        "جميع الأبناء",
        "الوالدان",
        "العلاج الداخلي والخارجي",
      ],
    },
    B: {
      name: "تغطية الموظفين فقط",
      code: "B",
      icon: "👤",
      description: "تغطية للموظفين فقط بدون عائلاتهم",
      includesFamily: false,
      includesSpouse: false,
      includesChildren: false,
      includesParents: false,
      familyDescription: "لا يشمل العائلة - الموظفين فقط",
      inpatientCoinsurance: 0.1,
      outpatientCoinsurance: 0.2,
      emergencyOverseas: 0.7,
      selectiveOverseas: 0.5,
      baseRate: 1000,
      ageRange: { min: 18, max: 65 },
      coverageIncludes: [
        "الموظف فقط",
        "العلاج الداخلي والخارجي",
        "الطوارئ",
      ],
    },
    C: {
      name: "التغطية الأساسية",
      code: "C",
      icon: "🛡️",
      description: "تغطية متوازنة تشمل الموظفين وأساسيات العائلة",
      includesFamily: true,
      includesSpouse: true,
      includesChildren: true,
      includesParents: true,
      familyDescription: "يشمل الزوجة والأبناء والوالدين",
      inpatientCoinsurance: 0.15,
      outpatientCoinsurance: 0.25,
      emergencyOverseas: 0.5,
      selectiveOverseas: 0.0,
      baseRate: 1200,
      spouseDiscount: 0.5,     
      childDiscount: 0.5,      
      parentDiscount: 0.3,  
      minChildrenRatio: 1.0,
      minParentsRatio: 0.3,
      ageRange: { min: 0, max: 65 },
      coverageIncludes: [
        "الموظف + الزوجة",
        "الأبناء",
        "الوالدان (أب + أم)",
        "العلاج الداخلي الأساسي",
      ],
    },
  };

  // ==================== FORM STATE ====================
  
  const [advancedForm, setAdvancedForm] = useState({
    insuranceType: insuranceType || "B",
    coverageOptions: {
      maternity: false,
      dental: false,
      optical: false,
      chronicMedication: false,
      overseasTreatment: false,
    },
    paymentMethod: "annual",
  });

  // ==================== CALCULATE PREVIEW ====================

  const calculatePreview = useCallback(() => {
    const rules = insuranceRules[advancedForm.insuranceType];
    
    if (!rules || !company || employeesData.length === 0) {
      console.log("❌ لا يمكن حساب المعاينة - بيانات غير كافية");
      setPreview(null);
      return;
    }

    console.log("🧮 بدء الحساب مع البيانات:", {
      employeesCount: employeesData.length,
      insuranceType: rules.code
    });

    try {
      // ============== الخطوة 1: حساب العائلة بدقة ==============
      const familyData = calculateDetailedFamilyData(employeesData, rules);
      
      console.log("👨‍👩‍👧‍👦 بيانات العائلة المفصلة:", familyData);

      // ============== الخطوة 2: حساب المشتركين والأسعار ==============
      const insuredBreakdown = calculateInsuredBreakdown(employeesData, familyData, rules);
      
      console.log("📊 تفصيل المشتركين:", insuredBreakdown);

      // ============== الخطوة 3: حساب القسط الأساسي ==============
      const basePremium = insuredBreakdown.totalCost;
      
      console.log("💰 القسط الأساسي:", basePremium);

      // ============== الخطوة 4: تطبيق نسب التحمل ==============
      const coinsuranceDiscount = calculateCoinsuranceDiscount(basePremium, rules);
      
      console.log("💸 خصم نسب التحمل:", coinsuranceDiscount);

      // ============== الخطوة 5: المنافع الإلزامية ==============
      const mandatoryBenefits = calculateMandatoryBenefits(employeesData, rules);
      
      console.log("🏥 المنافع الإلزامية:", mandatoryBenefits);

      // ============== الخطوة 6: التكاليف الإدارية ==============
      const administrativeCosts = calculateAdministrativeCosts(insuredBreakdown.totalInsured);
      
      console.log("📋 التكاليف الإدارية:", administrativeCosts);

      // ============== الخطوة 7: التغطيات الإضافية ==============
      const additionalCoverageCost = calculateAdditionalCoverageCost(
        advancedForm.coverageOptions,
        insuredBreakdown.totalInsured
      );
      
      console.log("➕ التغطيات الإضافية:", additionalCoverageCost);

      // ============== الخطوة 8: الحساب قبل تأثير الدفع ==============
      const premiumBeforePayment = (
        basePremium
        - coinsuranceDiscount.total
        + mandatoryBenefits.total
        + administrativeCosts.total
        + additionalCoverageCost
      );

      console.log("💰 الإجمالي قبل تأثير الدفع:", premiumBeforePayment);

      // ============== الخطوة 9: تطبيق تأثير خيارات الدفع ==============
      const paymentEffect = applyPaymentMethodEffect(premiumBeforePayment, advancedForm.paymentMethod);
      
      console.log("💳 تأثير خيار الدفع:", paymentEffect);

      // ============== الخطوة 10: الحساب النهائي ==============
      const totalPremium = paymentEffect.adjustedPremium;

      console.log("🎯 الإجمالي النهائي بعد تأثير الدفع:", totalPremium);

      // ============== الخطوة 11: حساب إحصاءات الموظفين حسب العمر ==============
      const ageStats = calculateEmployeeStats(employeesData, rules.ageRange);

      // ============== الخطوة 12: إعداد النتيجة ==============
      const previewData = {
        // البيانات الأساسية
        basePremium,
        coInsuranceDiscount: coinsuranceDiscount.total,
        afterCoInsurance: basePremium - coinsuranceDiscount.total,
        mandatoryBenefits,
        administrativeCosts,
        additionalCoverageCost,
        premiumBeforePayment,
        paymentEffect,
        totalPremium,
        finalPremium: totalPremium,
        
        // تفاصيل المشتركين
        totalInsured: insuredBreakdown.totalInsured,
        insuredBreakdown,
        
        // تفاصيل العائلة
        familyData,
        familyMembersCount: insuredBreakdown.familyCount,
        
        // إحصائيات الموظفين
        eligibleEmployees: ageStats.eligibleEmployees,
        excludedEmployees: ageStats.excludedEmployees,
        
        // معلومات الخطة
        rules,
        
        // تفاصيل الحساب
        calculationDetails: {
          employeePrice: rules.baseRate,
          spousePrice: rules.baseRate * 0.5,
          childPrice: rules.baseRate * 0.5,
          parentPrice: rules.baseRate * 0.3,
          coinsuranceRate: coinsuranceDiscount.totalRate,
          paymentMultiplier: paymentEffect.multiplier
        }
      };

      console.log("✅ تم إعداد بيانات المعاينة:", previewData);
      setPreview(previewData);
      setFamilyData(familyData); // ✅ حفظ بيانات العائلة

    } catch (error) {
      console.error("❌ خطأ في حساب المعاينة:", error);
      setError(`خطأ في الحساب: ${error.message}`);
      setPreview(null);
    }
  }, [advancedForm, employeesData, company, calculateDetailedFamilyData]);

  // ==================== EFFECTS ====================
  
  useEffect(() => {
    console.log("🔍 employeesData تغير:", employeesData?.length);
  }, [employeesData]);

  useEffect(() => {
    console.log("🔄 تفعيل الحساب عند تغيير البيانات");
    
    if (company && employeesData && employeesData.length > 0) {
      console.log(`🎯 جاهز للاحتساب!`);
      calculatePreview();
    } else {
      console.log("⏳ لا يزال في الانتظار:", {
        hasCompany: !!company,
        hasEmployees: employeesData?.length > 0
      });
    }
  }, [advancedForm, employeesData, company, calculatePreview]);

  // ==================== FORM HANDLERS ====================
  
  const handleFormChange = (section, field, value) => {
    if (section === "coverageOptions") {
      setAdvancedForm((prev) => ({
        ...prev,
        coverageOptions: {
          ...prev.coverageOptions,
          [field]: value,
        },
      }));
    } else {
      setAdvancedForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // ==================== RENDER FUNCTIONS ====================
  
  const renderInsuranceDetails = (type) => {
    const rules = insuranceRules[type];
    if (!rules) return null;

    return (
      <div className="insurance-details-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>
              {rules.icon} {rules.name} (النوع {rules.code})
            </h3>
            <button
              className="close-btn"
              onClick={() => setShowInsuranceDetails(false)}
            >
              ✕
            </button>
          </div>

          <div className="modal-body">
            <div className="details-section">
              <h4>📝 الوصف</h4>
              <p>{rules.description}</p>
            </div>

            <div className="details-section">
              <h4>👨‍👩‍👧‍👦 تغطية العائلة</h4>
              <p>{rules.familyDescription}</p>
              {rules.includesFamily && (
                <ul className="family-list">
                  {rules.coverageIncludes.map((item, index) => (
                    <li key={index}>✓ {item}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="details-section">
              <h4>💰 التفاصيل المالية</h4>
              <div className="financial-grid">
                <div className="financial-item">
                  <span>القسط الأساسي:</span>
                  <strong>{rules.baseRate.toLocaleString()} دولار/مشترك</strong>
                </div>
                <div className="financial-item">
                  <span>نسبة التحمل (داخلي):</span>
                  <strong>{rules.inpatientCoinsurance * 100}%</strong>
                </div>
                <div className="financial-item">
                  <span>نسبة التحمل (خارجي):</span>
                  <strong>{rules.outpatientCoinsurance * 100}%</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-primary"
              onClick={() => {
                handleFormChange("", "insuranceType", type);
                setShowInsuranceDetails(false);
              }}
            >
              ✅ اختيار هذا النوع
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTypeButtons = () => (
    <div className="form-section type-section">
      <h3>📋 اختيار نوع التأمين</h3>
      <div className="type-buttons">
        {Object.keys(insuranceRules).map((type) => (
          <div key={type} className="type-button-group">
            <button
              type="button"
              className={`type-btn ${advancedForm.insuranceType === type ? "active" : ""}`}
              onClick={() => handleFormChange("", "insuranceType", type)}
            >
              {insuranceRules[type].icon} {insuranceRules[type].name} (النوع{" "}
              {type})
            </button>
            <button
              type="button"
              className="details-btn"
              onClick={() => {
                setSelectedInsuranceDetails(type);
                setShowInsuranceDetails(true);
              }}
              title="عرض التفاصيل الكاملة"
            >
              التفاصيل
            </button>
          </div>
        ))}
      </div>

      {advancedForm.insuranceType && (
        <div className="selected-type-info">
          <h4>
            ✅ النوع المختار: {insuranceRules[advancedForm.insuranceType].name}
          </h4>
          <p>{insuranceRules[advancedForm.insuranceType].description}</p>
          <div className="type-highlights">
            <span className="highlight">
              <strong>القسط الأساسي:</strong>{" "}
              {insuranceRules[
                advancedForm.insuranceType
              ].baseRate.toLocaleString()}{" "}
              دولار/مشترك
            </span>
            <span className="highlight">
              <strong>تغطية العائلة:</strong>{" "}
              {insuranceRules[advancedForm.insuranceType].includesFamily
                ? "نعم"
                : "لا"}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderFamilyInfo = () => {
  if (!familyData || familyData.details.length === 0) return null;

  const rules = insuranceRules[advancedForm.insuranceType];

  return (
    <div className="form-section family-info-section">
      <h3>👨‍👩‍👧‍👦 بيانات العائلة المحسوبة تلقائياً</h3>
      <div className="family-info-card">
        <div className="family-summary">
          <h4>📊 إحصائيات الموظفين:</h4>
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-label">المتزوجون</span>
              <span className="stat-value">{familyData.marriedCount}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">الذكور</span>
              <span className="stat-value">{familyData.maleCount}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">الإناث</span>
              <span className="stat-value">{familyData.femaleCount}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">الأبناء في البيانات</span>
              <span className="stat-value">{familyData.children}</span>
            </div>
          </div>
          
          {/* ✅ عرض إحصائيات الأمراض المزمنة */}
          <div className="chronic-diseases-stats">
            <h5>🏥 إحصائيات الأمراض المزمنة:</h5>
            <div className="chronic-grid">
              {familyData.details.map((emp, idx) => (
                <div key={idx} className="chronic-item">
                  <span className="chronic-name">{emp.name}:</span>
                  <span className={`chronic-status ${emp.hasChronicDiseases ? 'has-chronic' : 'no-chronic'}`}>
                    {emp.hasChronicDiseases ? '✅ لديه إعاقة مزمنة' : '❌ لا توجد إعاقة'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="employee-details-list">
          {familyData.details.map((emp, idx) => (
            <div key={emp.id || idx} className="employee-family-details">
              <div className="employee-header">
                <strong>{emp.name}</strong>
                {emp.hasChronicDiseases && (
                  <span className="chronic-badge">🏥 إعاقة مزمنة</span>
                )}
              </div>
              <div className="family-members">
                {emp.spouses > 0 && <span>👰 {emp.spouses} زوجة</span>}
                {emp.children > 0 && <span>👶 {emp.children} ابن</span>}
                {emp.parents > 0 && (
                  <span className="parents-included">
                    👴👵 {emp.parents} والد 
                    {emp.eligibilityReason && ` (${emp.eligibilityReason})`}
                  </span>
                )}
                {emp.includeParents && emp.parents === 0 && (
                  <span className="parents-excluded">
                    ⚠️ الوالدين غير مشمولين
                    {emp.eligibilityReason && ` - ${emp.eligibilityReason}`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="family-details">
          <h4>📋 تفاصيل التغطية العائلية:</h4>
          <div className="coverage-details">
            <div className="coverage-item">
              <span className="coverage-label">عدد الزوجات المشمولين:</span>
              <span className="coverage-value">
                {familyData.spouses}
                <small>
                  {" "}
                  (الحد الأقصى:{" "}
                  {familyData.maleCount * 4 + familyData.femaleCount})
                </small>
              </span>
            </div>

            <div className="coverage-item">
              <span className="coverage-label">عدد الأبناء المشمولين:</span>
              <span className="coverage-value">
                {familyData.children}
                <small>
                  {" "}
                  {rules.code === "A"
                    ? "(جميع الأبناء)"
                    : `(الحد الأدنى: ${employeesData.length})`}
                </small>
              </span>
            </div>

            {rules.code === "A" && (
              <div className="coverage-item">
                <span className="coverage-label">
                  عدد الوالدين المشمولين:
                </span>
                <span className="coverage-value">
                  {familyData.parents}
                  <small> 
                    {familyData.parents > 0 
                      ? `(يتطلب إعاقة مزمنة في التغطية A)`
                      : `(يتطلب إعاقة مزمنة في التغطية A)`
                    }
                  </small>
                </span>
              </div>
            )}
            {rules.code === "C" && (
              <div className="coverage-item">
                <span className="coverage-label">
                  عدد الوالدين المشمولين:
                </span>
                <span className="coverage-value">
                  {familyData.parents}
                  <small> (مشمولين تلقائياً)</small>
                </span>
              </div>
            )}            
          </div>
        </div>
      </div>
    </div>
  );
};

  const renderPreview = () => {
    if (!preview) return null;

    return (
      <div className="preview-section">
        <h3>👁️ معاينة الحساب التفصيلية</h3>
        <div className="preview-card detailed-preview">
          
          {/* تفاصيل المشتركين */}
          <div className="preview-breakdown">
            <h4>👥 تفصيل المشتركين والأسعار</h4>
            <div className="breakdown-details">
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th>الفئة</th>
                    <th>العدد</th>
                    <th>السعر/فرد</th>
                    <th>الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>الموظفون</td>
                    <td>{preview.insuredBreakdown?.counts?.employees || 0}</td>
                    <td>${preview.insuredBreakdown?.prices?.employee || 0}</td>
                    <td className="text-primary">
                      ${(preview.insuredBreakdown?.costs?.employees || 0).toLocaleString()}
                    </td>
                  </tr>
                  {preview.insuredBreakdown?.counts?.spouses > 0 && (
                    <tr>
                      <td>الزوجات (50%)</td>
                      <td>{preview.insuredBreakdown.counts.spouses}</td>
                      <td>${preview.insuredBreakdown.prices.spouse}</td>
                      <td className="text-primary">
                        ${preview.insuredBreakdown.costs.spouses.toLocaleString()}
                      </td>
                    </tr>
                  )}
                  {preview.insuredBreakdown?.counts?.children > 0 && (
                    <tr>
                      <td>الأبناء (50%)</td>
                      <td>{preview.insuredBreakdown.counts.children}</td>
                      <td>${preview.insuredBreakdown.prices.child}</td>
                      <td className="text-primary">
                        ${preview.insuredBreakdown.costs.children.toLocaleString()}
                      </td>
                    </tr>
                  )}
                  {preview.insuredBreakdown?.counts?.parents > 0 && (
                    <tr>
                      <td>الوالدين (30%)</td>
                      <td>{preview.insuredBreakdown.counts.parents}</td>
                      <td>${preview.insuredBreakdown.prices.parent}</td>
                      <td className="text-primary">
                        ${preview.insuredBreakdown.costs.parents.toLocaleString()}
                      </td>
                    </tr>
                  )}
                  <tr className="table-total">
                    <td><strong>الإجمالي</strong></td>
                    <td><strong>{preview.totalInsured}</strong></td>
                    <td></td>
                    <td className="text-success">
                      <strong>${(preview.insuredBreakdown?.totalCost || 0).toLocaleString()}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* تفاصيل التكاليف */}
          <div className="cost-breakdown">
            <h4>💰 تفصيل التكاليف</h4>
            <div className="cost-details">
              <div className="cost-item">
                <span>القسط الأساسي:</span>
                <span className="cost-value">${preview.basePremium.toLocaleString()}</span>
              </div>
              <div className="cost-item discount">
                <span>خصم نسب التحمل ({preview.calculationDetails?.coinsuranceRate || 0}%):</span>
                <span className="cost-value negative">-${preview.coInsuranceDiscount.toLocaleString()}</span>
              </div>
              <div className="cost-item">
                <span>القسط بعد التحمل:</span>
                <span className="cost-value">${preview.afterCoInsurance.toLocaleString()}</span>
              </div>
              {preview.mandatoryBenefits?.total > 0 && (
                <div className="cost-item">
                  <span>المنافع الإلزامية:</span>
                  <span className="cost-value positive">+${preview.mandatoryBenefits.total.toLocaleString()}</span>
                </div>
              )}
              {preview.administrativeCosts?.total > 0 && (
                <div className="cost-item">
                  <span>التكاليف الإدارية:</span>
                  <span className="cost-value">+${preview.administrativeCosts.total.toLocaleString()}</span>
                </div>
              )}
              {preview.additionalCoverageCost > 0 && (
                <div className="cost-item">
                  <span>التغطيات الإضافية:</span>
                  <span className="cost-value">+${preview.additionalCoverageCost.toLocaleString()}</span>
                </div>
              )}
              <div className="cost-item total">
                <span>الإجمالي النهائي:</span>
                <span className="cost-value total-amount">${preview.totalPremium.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmployeesTable = () => {
    if (employeesData.length === 0) return null;

    return (
      <div className="form-section employees-section">
        <h3>👥 بيانات الموظفين المحملة ({employeesData.length} موظف)</h3>
        <div className="employees-table-container">
          <table className="employees-table">
            <thead>
              <tr>
                <th>#</th>
                <th>الاسم</th>
                <th>العمر</th>
                <th>الجنس</th>
                <th>الحالة</th>
                <th>الأبناء</th>
                <th>الراتب</th>
                <th>الوالدين</th>
                <th>الزوجات</th>
              </tr>
            </thead>
            <tbody>
              {employeesData.slice(0, 5).map((emp, index) => (
                <tr key={emp.id || index}>
                  <td>{index + 1}</td>
                  <td>{emp.full_name}</td>
                  <td>{emp.age}</td>
                  <td>{emp.gender}</td>
                  <td>{emp.marital_status}</td>
                  <td>{emp.children_count}</td>
                  <td>{emp.salary?.toLocaleString()}$</td>
                  <td>{emp.parents_count}</td>
                  <td>{emp.wives_count}</td>
                </tr>
              ))}
              {employeesData.length > 5 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                    ... و {employeesData.length - 5} موظف إضافي
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ==================== SUBMIT HANDLER ====================
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. احتساب بيانات العائلة مع الزوجات والوالدين
      const rules = insuranceRules[advancedForm.insuranceType];
      const familyData = calculateDetailedFamilyData(employeesData, rules);
      
      // 2. تحضير بيانات الموظفين
      const formattedEmployees = employeesData.map((emp, index) => ({
          id: emp.id || index + 1,
          full_name: emp.name || emp.full_name || `موظف ${index + 1}`,
          employee_number: emp.employee_number || `EMP-${emp.id || index + 1}`,
          gender: normalizeGender(emp.gender),
          date_of_birth: emp.date_of_birth || calculateBirthDateFromAge(emp.age || 30),
          salary: emp.base_salary || emp.salary || 3000,
          marital_status: normalizeMaritalStatus(emp.marital_status),
          children_count: emp.number_of_children || emp.children_count || 0,
          parents_count: emp.parents_count || 0,
          wives_count: emp.wives_count || 0,
          include_parents: emp.include_parents || false,
          chronic_diseases: emp.chronic_diseases || false,
          age: emp.age || 30,
          job_title: emp.position || "موظف",
          department: emp.department || "عام",
          raw_data: emp
      }));

      // 3. تحضير الـ payload للخادم
       if (!company?.id || !advancedForm.insuranceType || !preview) {
        throw new Error('بيانات غير مكتملة');
      }
      
      const payload = {
        company_id: company.id,
        insurance_type: advancedForm.insuranceType,
        employees: formattedEmployees,
        family_members: {
          spouses: familyData.spouses,
          children: familyData.children,
          parents: familyData.parents
        },
        coverage_options: advancedForm.coverageOptions,
        payment_method: advancedForm.paymentMethod,
        calculation_data: {
          base_premium: preview.basePremium,
          total_premium: preview.totalPremium,
          insured_breakdown: preview.insuredBreakdown,
          family_data: familyData,
          mandatory_benefits: preview.mandatoryBenefits,
          administrative_costs: preview.administrativeCosts
        }
      };

      console.log("📤 إرسال بيانات الاقتباس للخادم:", payload);

      // 4. الاتصال بالخادم لإنشاء الاقتباس
      const response = await api.post(
        '/api/health/advanced-calculate/', 
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 30000,
        }
      );

      console.log("✅ استجابة الخادم:", response.data);

      if (response.data.success) {
        const quoteData = response.data;
        
        // 5. حفظ البيانات محلياً للانتقال للاقتباس
        const savedQuote = {
          ...quoteData,
          company: company,
          employees_data: employeesData,
          calculation_preview: preview,
          family_data: familyData,
          form_data: advancedForm,
          created_at: new Date().toISOString()
        };

        console.log("💾 حفظ الاقتباس محلياً:", savedQuote);
        
        // 6. تمرير الاقتباس للـ parent component للانتقال به
        if (onCalculate) {
          onCalculate(savedQuote);
        }

        // 7. عرض رسالة نجاح
        alert(`✅ تم إنشاء اقتباس رقم: ${quoteData.quote_number || 'غير معروف'}\n\nالرجاء الانتقال إلى صفحة الاقتباسات لقبول الاقتباس وإنشاء الوثيقة.`);
        
        // 8. إعادة تعيين الحالة
        setDetailedResult(savedQuote);
        
      } else {
        throw new Error(response.data.error || 'حدث خطأ غير معروف');
      }
      
    } catch (error) {
      console.error("❌ خطأ في إنشاء الاقتباس:", error);
      
      // الحساب المحلي كبديل
      const fallbackQuote = createLocalQuote();
      setDetailedResult(fallbackQuote);
      
      if (onCalculate) {
        onCalculate(fallbackQuote);
      }
      
      alert(`⚠️ تم إنشاء اقتباس محلي رقم: ${fallbackQuote.quote_number}\n\nسيتم استخدام الحساب المحلي بسبب مشكلة في الاتصال.`);
      
    } finally {
      setLoading(false);
    }
  };

  // دالة مساعدة لإنشاء اقتباس محلي
  const createLocalQuote = () => {
    const rules = insuranceRules[advancedForm.insuranceType];
    const familyData = calculateDetailedFamilyData(employeesData, rules);
    
    return {
      id: `LOCAL-${Date.now()}`,
      quote_number: `Q-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      company_id: company?.id,
      company_name: company?.name,
      insurance_type: advancedForm.insuranceType,
      insurance_type_name: insuranceRules[advancedForm.insuranceType]?.name,
      total_employees: employeesData.length,
      family_members: {
        spouses: familyData.spouses,
        children: familyData.children,
        parents: familyData.parents
      },
      coverage_options: advancedForm.coverageOptions,
      payment_method: advancedForm.paymentMethod,
      total_premium: preview?.totalPremium || 0,
      annual_premium: preview?.totalPremium || 0,
      monthly_premium: Math.round((preview?.totalPremium || 0) / 12),
      status: "pending",
      created_at: new Date().toISOString(),
      note: "تم الحساب محلياً",
      is_local: true
    };
  };

  // ==================== RENDER COMPONENT ====================
  
  return (
    <div className="advanced-calculator">
      <div className="calculator-header">
        <h2>🧮 الحاسبة المتقدمة للأقساط</h2>
        <p>حساب تفصيلي للأقساط بناءً على البيانات الدقيقة</p>
      </div>

      {/* حالة التحميل */}
      {loadingEmployees && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>جاري تحميل بيانات الموظفين...</p>
        </div>
      )}

      {/* معلومات الشركة */}
      {company && (
        <div className="company-summary">
          <h3>🏢 {company.name}</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">عدد الموظفين:</span>
              <span className="value">{employeesData.length}</span>
            </div>
            <div className="summary-item">
              <span className="label">الحالة:</span>
              <span className="value">
                {employeesData.length > 0 ? '✅ جاهز' : '⏳ جاري التحميل'}
              </span>
            </div>
          </div>
          
          {/* إظهار تحذير إذا لم تكن هناك بيانات */}
          {employeesData.length === 0 && !loadingEmployees && (
            <div className="alert alert-warning">
              <p>⚠️ لم يتم تحميل بيانات الموظفين بعد. قد يكون السبب:</p>
              <ul>
                <li>لا يوجد موظفين مسجلين للشركة</li>
                <li>لم يتم رفع ملف الموظفين بعد</li>
                <li>حدث خطأ في الاتصال بالخادم</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      )}

      {/* عرض جدول الموظفين */}
      {renderEmployeesTable()}

      <form onSubmit={handleSubmit} className="advanced-form">
        {/* قسم اختيار النوع */}
        {renderTypeButtons()}

        {/* عرض بيانات العائلة المحسوبة تلقائياً */}
        {renderFamilyInfo()}

        {/* قسم خيارات التغطية الإضافية */}
        <div className="form-section coverage-section">
          <h3>⚙️ خيارات تغطية إضافية</h3>
          <p className="section-description">
            اختر الخيارات الإضافية التي ترغب في إضافتها للتغطية الأساسية
          </p>

          <div className="coverage-grid">
            {[
              { key: 'maternity', title: 'الحمل والولادة', price: '+200 دولار/مشترك', desc: 'يشمل متابعة الحمل والولادة' },
              { key: 'dental', title: 'علاج الأسنان', price: '+100 دولار/مشترك', desc: 'يشمل التنظيف والحشو' },
              { key: 'optical', title: 'النظارات الطبية', price: '+50 دولار/مشترك', desc: 'يشمل فحص النظر والنظارات' },
              { key: 'chronicMedication', title: 'الأدوية المزمنة', price: '+360 دولار/مشترك', desc: 'يشمل أدوية السكري والضغط' },
              { key: 'overseasTreatment', title: 'العلاج خارج اليمن', price: '+500 دولار/مشترك', desc: 'يشمل تكاليف السفر والعلاج' },
            ].map((option) => (
              <label key={option.key} className="coverage-checkbox">
                <input
                  type="checkbox"
                  checked={advancedForm.coverageOptions[option.key]}
                  onChange={(e) =>
                    handleFormChange(
                      "coverageOptions",
                      option.key,
                      e.target.checked,
                    )
                  }
                />
                <div className="checkbox-content">
                  <span className="checkbox-title">{option.title}</span>
                  <span className="checkbox-price">{option.price}</span>
                  <small className="checkbox-desc">{option.desc}</small>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* قسم خيارات الدفع */}
        <div className="form-section payment-section">
          <h3>💳 خيارات الدفع</h3>
          <div className="payment-options">
            {[
              { value: "annual", label: "دفع سنوي", desc: "خصم 0% - الدفع مرة واحدة سنوياً", multiplier: 1.0 },
              { value: "semiAnnual", label: "دفع نصف سنوي", desc: "زيادة 5% - الدفع كل 6 أشهر", multiplier: 1.05 },
              { value: "quarterly", label: "دفع ربع سنوي", desc: "زيادة 10% - الدفع كل 3 أشهر", multiplier: 1.1 },
              { value: "monthly", label: "دفع شهري", desc: "زيادة 15% - الدفع كل شهر", multiplier: 1.15 },
            ].map((option) => (
              <label key={option.value} className="payment-radio">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={advancedForm.paymentMethod === option.value}
                  onChange={(e) =>
                    handleFormChange("", "paymentMethod", e.target.value)
                  }
                />
                <div className="radio-content">
                  <span className="radio-label">{option.label}</span>
                  <span className="radio-multiplier">×{option.multiplier}</span>
                  <small className="radio-desc">{option.desc}</small>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* معاينة الحساب */}
        {renderPreview()}

        {/* أزرار الإجراءات */}
        <div className="calculator-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !company || employeesData.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                جاري الحساب النهائي...
              </>
            ) : (
              "إنشاء عرض السعر النهائي"
            )}
          </button>
        </div>
      </form>

      {/* نافذة تفاصيل التأمين */}
      {showInsuranceDetails &&
        selectedInsuranceDetails &&
        renderInsuranceDetails(selectedInsuranceDetails)}

      {/* النتيجة التفصيلية */}
      {detailedResult && (
        <div className="detailed-result">
          <h3>📄 النتيجة التفصيلية</h3>
          <div className="result-card">
            <div className="result-header">
              <h4>
                عرض السعر رقم: {detailedResult.quote_number || detailedResult.id}
              </h4>
              <span className="result-date">
                تاريخ الإنشاء: {new Date().toLocaleDateString("ar-SA")}
              </span>
            </div>

            <div className="result-grid">
              <div className="result-column">
                <h5>البيانات الأساسية</h5>
                <div className="result-item">
                  <span>الشركة:</span>
                  <span>{company.name}</span>
                </div>
                <div className="result-item">
                  <span>نوع التأمين:</span>
                  <span>
                    {insuranceRules[detailedResult.insurance_type]?.name}
                  </span>
                </div>
                <div className="result-item">
                  <span>إجمالي الموظفين:</span>
                  <span>{detailedResult.total_employees}</span>
                </div>
              </div>

              <div className="result-column">
                <h5>التكلفة</h5>
                <div className="result-item">
                  <span>القسط السنوي:</span>
                  <span>
                    {detailedResult.annual_premium?.toLocaleString() || 
                     detailedResult.total_premium?.toLocaleString() || "0"} دولار
                  </span>
                </div>
                <div className="result-item">
                  <span>القسط الشهري:</span>
                  <span>
                    {detailedResult.monthly_premium?.toLocaleString() || 
                     Math.round((detailedResult.annual_premium || 0) / 12).toLocaleString()} دولار
                  </span>
                </div>
              </div>

              <div className="result-column">
                <h5>التغطيات المضمنة</h5>
                {detailedResult.coverage_options && 
                 Object.entries(detailedResult.coverage_options)
                  .filter(([_, value]) => value)
                  .map(([key, _]) => (
                    <div key={key} className="result-item">
                      <span>{key}:</span>
                      <span>✓</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedPremiumCalculator;