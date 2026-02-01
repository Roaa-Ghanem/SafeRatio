// utils/templates.js
export const employeeTemplate = {
  csv: `name,age,gender,marital_status,position,department,base_salary,monthly_allowances,has_children,number_of_children,spouse_age
أحمد محمد,30,male,married,مدير,الإدارة,5000,1000,true,2,32
سارة خالد,28,female,single,مبرمجة,التقنية,4000,500,false,0,
محمد علي,35,male,married,مهندس,الهندسة,6000,1200,true,3,33
فاطمة حسن,29,female,single,ممرضة,التمريض,3000,300,false,0,
خالد سعد,40,male,married,محاسب,المالية,4500,800,true,4,38
نورة عبدالله,32,female,married,مديرة مبيعات,المبيعات,5500,1500,true,2,35`,
  
  excel: () => {
    // كود توليد ملف Excel
    const XLSX = require('xlsx');
    const data = [
      ['name', 'age', 'gender', 'marital_status', 'position', 'department', 'base_salary', 'monthly_allowances', 'has_children', 'number_of_children', 'spouse_age'],
      ['أحمد محمد', 30, 'male', 'married', 'مدير', 'الإدارة', 5000, 1000, 'true', 2, 32],
      ['سارة خالد', 28, 'female', 'single', 'مبرمجة', 'التقنية', 4000, 500, 'false', 0, ''],
      ['محمد علي', 35, 'male', 'married', 'مهندس', 'الهندسة', 6000, 1200, 'true', 3, 33]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الموظفين');
    
    // تنسيق الخلايا
    const wscols = [
      {wch: 20}, {wch: 5}, {wch: 8}, {wch: 10}, 
      {wch: 15}, {wch: 12}, {wch: 10}, {wch: 10}, 
      {wch: 8}, {wch: 8}, {wch: 8}
    ];
    ws['!cols'] = wscols;
    
    return wb;
  }
};