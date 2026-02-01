// components/FileUploader.js
import React, { useState, useCallback } from 'react';
import './FileUploader.css';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { validateEmployeeData } from '../utils/validation';
import { employeeTemplate } from '../utils/templates';

const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        }
      });
  });
};

const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('فشل قراءة الملف'));
    reader.readAsArrayBuffer(file);
  });
};

const FileUploader = ({ onFileUpload, allowedTypes = ['.csv', '.xlsx', '.xls'], maxSizeMB = 5 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateFile = (file) => {
    // التحقق من نوع الملف
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      throw new Error(`نوع الملف غير مدعوم. الأنواع المسموحة: ${allowedTypes.join(', ')}`);
    }

    // التحقق من حجم الملف
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`حجم الملف كبير جداً. الحد الأقصى: ${maxSizeMB}MB`);
    }

    // التحقق من أن الملف ليس فارغاً
    if (file.size === 0) {
      throw new Error('الملف فارغ');
    }

    return true;
  };

  const processFile = async (file) => {
    setIsLoading(true);
    setError('');

    try {
      validateFile(file);
      
      let parsedData;
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

      if (fileExtension === '.csv') {
        parsedData = await parseCSV(file);
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        parsedData = await parseExcel(file);
      }

      // التحقق من بنية البيانات
      const validatedData = validateEmployeeData(parsedData);
      
      // إرسال البيانات للمكون الأب
      onFileUpload({
        file,
        data: validatedData,
        metadata: {
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          employeesCount: validatedData.length,
          uploadDate: new Date().toISOString()
        }
      });

    } catch (err) {
      setError(err.message || 'حدث خطأ في معالجة الملف');
      console.error('Error processing file:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, []);

  return (
    <div className="file-uploader">
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${isLoading ? 'loading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>جاري معالجة الملف...</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">
              📄
            </div>
            <h3>رفع ملف الموظفين</h3>
            <p className="upload-text">
              اسحب وأفلت ملف Excel أو CSV هنا
              <br />
              <span className="file-types">(.csv, .xlsx, .xls)</span>
            </p>
            
            <div className="upload-actions">
              <label className="browse-btn">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                تصفح الملفات
              </label>
              <p className="file-limit">
                الحد الأقصى: {maxSizeMB}MB
              </p>
            </div>

            <div className="requirements">
              <h4>📋 متطلبات ملف الموظفين:</h4>
              <ul>
                <li>يجب أن يحتوي على الأعمدة التالية: <code>name, age, gender, marital_status, position, department, base_salary</code></li>
                <li>يمكن أن يحتوي على أعمدة إضافية: <code>monthly_allowances, has_children, number_of_children, spouse_age</code></li>
                <li>يجب أن يكون الترميز UTF-8</li>
                <li>يجب أن يكون العنوان الأول (Header) في الصف الأول</li>
              </ul>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="template-section">
        <h4>📥 تحميل قالب فارغ</h4>
        <button 
          className="download-template-btn"
          onClick={() => downloadTemplate()}
        >
          ⬇️ تحميل قالب Excel
        </button>
        <button 
          className="download-template-btn"
          onClick={() => downloadCSVTemplate()}
        >
          ⬇️ تحميل قالب CSV
        </button>
      </div>
    </div>
  );
};

// دالة تنسيق حجم الملف
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// دالة تحميل القالب
const downloadTemplate = (insuranceType = 'A') => {
  // بيانات نموذجية حسب نوع التأمين
  const templateData = insuranceType === 'B' ? [
    {
      'الاسم_الكامل': 'أحمد محمد',
      'الرقم_الوظيفي': 'EMP001',
      'الجنس': 'ذكر',
      'تاريخ_الميلاد': '1985-05-15',
      'الراتب': '5000',
      'الحالة_الاجتماعية': 'متزوج',
      'يشمل_الوالدين': 'نعم',
      'عدد_الأبناء': '0',
      'عدد_الوالدان': '0',
      'عدد_الزوجات': '1',
      'الأمراض_المزمنة': 'لا',
      'الحمل': 'لا'
    }
  ] : [
    {
      'الاسم_الكامل': 'محمد علي',
      'الرقم_الوظيفي': 'EMP001',
      'الجنس': 'ذكر',
      'تاريخ_الميلاد': '1985-05-15',
      'الراتب': '5000',
      'الحالة_الاجتماعية': 'متزوج',
      'يشمل_الوالدين': 'نعم',
      'عدد_الأبناء': '3',
      'عدد_الوالدان': '2',
      'عدد_الزوجات': '1',
      'الأمراض_المزمنة': 'لا',
      'الحمل': 'لا'
    },
    {
      'الاسم_الكامل': 'فاطمة علي',
      'الرقم_الوظيفي': 'EMP002',
      'الجنس': 'أنثى',
      'تاريخ_الميلاد': '1990-08-22',
      'الراتب': '4500',
      'الحالة_الاجتماعية': 'متزوج',
      'يشمل_الوالدين': 'نعم',
      'عدد_الأبناء': '2',
      'عدد_الوالدان': '2',
      'عدد_الزوجات': '0',
      'الأمراض_المزمنة': 'لا',
      'الحمل': 'نعم'
    }
  ];
  
  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "الموظفين");
  
  // تنظيم عرض الأعمدة
  const columnWidths = [
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
    { wch: 10 }  // الحمل
  ];
  
  ws['!cols'] = columnWidths;
  
  // إضافة تعليقات توضيحية
  const fileName = insuranceType === 'B' 
    ? 'قالب_الموظفين_نوع_B.xlsx' 
    : 'قالب_الموظفين_أنواع_A_C.xlsx';
  
  XLSX.writeFile(wb, fileName);
};

const downloadCSVTemplate = () => {
  const csvContent = "name,age,gender,marital_status,position,department,base_salary,monthly_allowances,has_children,number_of_children\nأحمد محمد,30,male,married,مدير,الإدارة,5000,1000,true,2\nسارة خالد,28,female,single,مبرمجة,التقنية,4000,500,false,0";
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'قالب_الموظفين.csv';
  link.click();
};

export default FileUploader;