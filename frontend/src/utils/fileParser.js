// utils/fileParser.js
import * as XLSX from 'xlsx';

// دالة لتحليل ملف CSV
export const parseCSV = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvText = event.target.result;
        const employees = parseCSVText(csvText);
        resolve(employees);
      } catch (error) {
        reject(new Error(`خطأ في تحليل ملف CSV: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('فشل قراءة ملف CSV'));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
};

// دالة لتحليل نص CSV
export const parseCSVText = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('الملف يجب أن يحتوي على عنوان وأقل من سجل واحد');
  }
  
  // اكتشاف الفاصل (comma أو semicolon)
  const delimiter = detectDelimiter(lines[0]);
  
  // قراءة العناوين
  const headers = lines[0]
    .split(delimiter)
    .map(header => header.trim().toLowerCase());
  
  // التحقق من العناوين الأساسية
  validateHeaders(headers);
  
  // تحليل البيانات
  const employees = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = parseCSVLine(lines[i], delimiter);
    const employee = {};
    
    headers.forEach((header, index) => {
      if (index < values.length) {
        employee[header] = cleanValue(values[index]);
      }
    });
    
    // تطبيع البيانات
    const normalizedEmployee = normalizeEmployeeData(employee);
    employees.push(normalizedEmployee);
  }
  
  return employees;
};

// دالة لتحليل ملف Excel
export const parseExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // الحصول على أول ورقة
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // تحويل لـ JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: ''
        });
        
        if (jsonData.length < 2) {
          throw new Error('الملف يجب أن يحتوي على عنوان وأقل من سجل واحد');
        }
        
        // تحويل للشكل المطلوب
        const headers = jsonData[0].map(h => h.toString().trim().toLowerCase());
        validateHeaders(headers);
        
        const employees = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const employee = {};
          
          headers.forEach((header, index) => {
            if (index < row.length) {
              employee[header] = cleanValue(row[index]);
            }
          });
          
          const normalizedEmployee = normalizeEmployeeData(employee);
          employees.push(normalizedEmployee);
        }
        
        resolve(employees);
      } catch (error) {
        reject(new Error(`خطأ في تحليل ملف Excel: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('فشل قراءة ملف Excel'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// دالة لاكتشاف الفاصل
const detectDelimiter = (line) => {
  const commaCount = (line.match(/,/g) || []).length;
  const semicolonCount = (line.match(/;/g) || []).length;
  const tabCount = (line.match(/\t/g) || []).length;
  
  if (semicolonCount > commaCount && semicolonCount > tabCount) return ';';
  if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
  return ',';
};

// دالة لتحليل سطر CSV مع التعامل مع الفواصل داخل النصوص
const parseCSVLine = (line, delimiter) => {
  const values = [];
  let currentValue = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentValue += '"';
        i++; // تخطي الاقتباس التالي
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  values.push(currentValue);
  return values;
};

// تنظيف القيم
const cleanValue = (value) => {
  if (value === null || value === undefined) return '';
  
  let strValue = value.toString().trim();
  
  // إزالة الاقتباسات
  if (strValue.startsWith('"') && strValue.endsWith('"')) {
    strValue = strValue.slice(1, -1);
  }
  
  // تحويل القيم الفارغة
  if (strValue === '' || strValue === '-' || strValue === 'null') {
    return '';
  }
  
  return strValue;
};

// التحقق من العناوين
const validateHeaders = (headers) => {
  const requiredHeaders = ['name', 'age', 'gender', 'position', 'department', 'base_salary'];
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
  
  if (missingHeaders.length > 0) {
    throw new Error(`الأعمدة المطلوبة مفقودة: ${missingHeaders.join(', ')}`);
  }
};

// تطبيع بيانات الموظف
const normalizeEmployeeData = (employee) => {
  const normalized = { ...employee };
  
  // تحويل الأرقام
  if (normalized.age) {
    const ageNum = parseInt(normalized.age);
    normalized.age = isNaN(ageNum) || ageNum <= 0 ? 25 : ageNum;
  }
  
  if (normalized.base_salary) {
    const salaryNum = parseFloat(normalized.base_salary);
    normalized.base_salary = isNaN(salaryNum) || salaryNum < 0 ? 0 : salaryNum;
  }
  
  if (normalized.monthly_allowances) {
    const allowancesNum = parseFloat(normalized.monthly_allowances);
    normalized.monthly_allowances = isNaN(allowancesNum) || allowancesNum < 0 ? 0 : allowancesNum;
  }
  
  // حساب الراتب الإجمالي
  normalized.total_monthly_salary = (normalized.base_salary || 0) + (normalized.monthly_allowances || 0);
  normalized.annual_salary = normalized.total_monthly_salary * 12;
  
  // تحويل الجنس
  if (normalized.gender) {
    const genderLower = normalized.gender.toLowerCase();
    if (genderLower.includes('ذ') || genderLower.includes('ر') || genderLower.includes('male')) {
      normalized.gender = 'male';
    } else if (genderLower.includes('ؤ') || genderLower.includes('ن') || genderLower.includes('female')) {
      normalized.gender = 'female';
    }
  }
  
  // تحويل الحالة الاجتماعية
  if (normalized.marital_status) {
    const statusLower = normalized.marital_status.toLowerCase();
    if (statusLower.includes('متزوج') || statusLower.includes('married')) {
      normalized.marital_status = 'married';
      normalized.has_children = normalized.has_children === 'true' || 
                               normalized.has_children === true || 
                               (normalized.number_of_children && parseInt(normalized.number_of_children) > 0);
    } else {
      normalized.marital_status = 'single';
      normalized.has_children = false;
      normalized.number_of_children = 0;
    }
  }
  
  // تحويل عدد الأبناء
  if (normalized.number_of_children) {
    const childrenNum = parseInt(normalized.number_of_children);
    normalized.number_of_children = isNaN(childrenNum) || childrenNum < 0 ? 0 : childrenNum;
  }
  
  return normalized;
};

// التحقق من صحة بيانات الموظفين
export const validateEmployeeData = (employees) => {
  if (!Array.isArray(employees)) {
    throw new Error('البيانات يجب أن تكون مصفوفة');
  }
  
  if (employees.length === 0) {
    throw new Error('لا توجد بيانات للموظفين');
  }
  
  const validatedEmployees = [];
  const errors = [];
  
  employees.forEach((emp, index) => {
    const rowNumber = index + 2; // +2 لأن الصف الأول عنوان
    
    try {
      // التحقق من البيانات الأساسية
      if (!emp.name || emp.name.trim() === '') {
        throw new Error('اسم الموظف مطلوب');
      }
      
      if (!emp.age || isNaN(emp.age) || emp.age < 18 || emp.age > 65) {
        throw new Error('العمر يجب أن يكون بين 18 و 65 سنة');
      }
      
      if (!emp.gender || !['male', 'female'].includes(emp.gender)) {
        throw new Error('الجنس يجب أن يكون male أو female');
      }
      
      if (!emp.position || emp.position.trim() === '') {
        throw new Error('المسمى الوظيفي مطلوب');
      }
      
      if (!emp.department || emp.department.trim() === '') {
        throw new Error('القسم مطلوب');
      }
      
      if (!emp.base_salary || isNaN(emp.base_salary) || emp.base_salary <= 0) {
        throw new Error('الراتب الأساسي يجب أن يكون رقماً أكبر من الصفر');
      }
      
      validatedEmployees.push(emp);
      
    } catch (error) {
      errors.push({
        row: rowNumber,
        employee: emp.name || 'غير معروف',
        error: error.message
      });
    }
  });
  
  if (errors.length > 0) {
    console.warn('تحذيرات في بيانات الموظفين:', errors);
    
    // يمكنك عرض التحذيرات للمستخدم
    const errorMessage = `تم العثور على ${errors.length} خطأ:\n` +
      errors.map(e => `صف ${e.row}: ${e.employee} - ${e.error}`).join('\n');
    
    if (errors.length > validatedEmployees.length * 0.5) {
      // إذا كانت نسبة الأخطاء أكثر من 50%
      throw new Error(errorMessage);
    }
  }
  
  return validatedEmployees;
};

// دالة لتحويل البيانات لـ CSV
export const convertToCSV = (employees) => {
  if (employees.length === 0) return '';
  
  const headers = Object.keys(employees[0]);
  const rows = employees.map(emp => 
    headers.map(header => {
      const value = emp[header];
      // إضافة اقتباسات إذا كانت القيمة تحتوي على فاصلة أو اقتباس
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
};