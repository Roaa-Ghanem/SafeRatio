// services/employeeService.js
import api from './api';

export const employeeService = {
  // رفع ملف الموظفين
  uploadEmployeesFile: async (companyId, file) => {
    const formData = new FormData();
    formData.append('employees_file', file);
    
    return api.post(
      `/api/health/companies/${companyId}/upload-employees/`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
  },
  
  // إضافة موظفين بشكل جماعي
  bulkCreateEmployees: async (companyId, employees) => {
    return api.post(
      `/api/health/companies/${companyId}/employees/bulk-create/`,
      { employees }
    );
  },
  
  // الحصول على موظفي الشركة
  getCompanyEmployees: async (companyId) => {
    return api.get(`/api/health/companies/${companyId}/employees/`);
  },
  
  // تحديث موظف
  updateEmployee: async (companyId, employeeId, data) => {
    return api.put(
      `/api/health/companies/${companyId}/employees/${employeeId}/`,
      data
    );
  },
  
  // حذف موظف
  deleteEmployee: async (companyId, employeeId) => {
    return api.delete(
      `/api/health/companies/${companyId}/employees/${employeeId}/`
    );
  },
  
  // توليد تقرير الموظفين
  generateEmployeesReport: async (companyId, reportType) => {
    return api.get(
      `/api/health/companies/${companyId}/employees/report/`,
      { params: { type: reportType } }
    );
  }
};