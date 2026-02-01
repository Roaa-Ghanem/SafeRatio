// src/components/ManualEmployeesEntryModal.js
import React, { useState, useEffect } from "react";
import "./ManualEmployeesEntryModal.css";

function ManualEmployeesEntryModal({ company, onSave, onCancel }) {
  const [employees, setEmployees] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'ذكر',
    salary: '',
    marital_status: 'أعزب',
    number_of_spouses: 1,
    children_count: 0,
    include_parents: 'لا',
    position: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});

  // تهيئة الموظفين إذا كانت الشركة لديها عدد معين
  useEffect(() => {
    if (company?.total_employees > 0) {
      const initialEmployees = Array.from({ length: company.total_employees }, (_, i) => ({
        id: i + 1,
        full_name: '',
        date_of_birth: '',
        gender: 'ذكر',
        salary: '',
        marital_status: 'أعزب',
        number_of_spouses: 1,
        children_count: 0,
        include_parents: 'لا',
        position: '',
        email: '',
        phone: ''
      }));
      setEmployees(initialEmployees);
    }
  }, [company]);

  const validateEmployee = (emp) => {
    const newErrors = {};
    
    if (!emp.full_name.trim()) {
      newErrors.full_name = 'الاسم الكامل مطلوب';
    }
    
    if (!emp.date_of_birth) {
      newErrors.date_of_birth = 'تاريخ الميلاد مطلوب';
    } else {
      const birthDate = new Date(emp.date_of_birth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 18 || age > 65) {
        newErrors.date_of_birth = 'العمر يجب أن يكون بين 18 و 65 سنة';
      }
    }
    
    if (!emp.salary || emp.salary < 0) {
      newErrors.salary = 'الراتب يجب أن يكون عدد موجب';
    }
    
    if (emp.gender === 'ذكر' && emp.number_of_spouses < 1) {
      newErrors.number_of_spouses = 'عدد الزوجات يجب أن يكون 1 على الأقل';
    } else if (emp.gender === 'أنثى' && emp.number_of_spouses > 1) {
      newErrors.number_of_spouses = 'الأنثى لا يمكن أن يكون لها أكثر من زوج';
    }
    
    if (emp.children_count < 0) {
      newErrors.children_count = 'عدد الأبناء لا يمكن أن يكون سالباً';
    }
    
    return newErrors;
  };

  const handleInputChange = (index, field, value) => {
    const updatedEmployees = [...employees];
    
    // تحديث الحقل
    updatedEmployees[index][field] = value;
    
    // إذا تم تغيير الجنس، تحديث عدد الزوجات
    if (field === 'gender') {
      if (value === 'أنثى') {
        updatedEmployees[index].number_of_spouses = 1;
      }
    }
    
    setEmployees(updatedEmployees);
    setErrors({});
  };

  const handleAddEmployee = () => {
    const newErrors = validateEmployee(currentEmployee);
    
    if (Object.keys(newErrors).length === 0) {
      setEmployees([...employees, { ...currentEmployee, id: employees.length + 1 }]);
      setCurrentEmployee({
        full_name: '',
        date_of_birth: '',
        gender: 'ذكر',
        salary: '',
        marital_status: 'أعزب',
        number_of_spouses: 1,
        children_count: 0,
        include_parents: 'لا',
        position: '',
        email: '',
        phone: ''
      });
      setErrors({});
    } else {
      setErrors(newErrors);
    }
  };

  const handleSave = () => {
    // التحقق من صحة جميع الموظفين
    const allErrors = [];
    employees.forEach((emp, index) => {
      const empErrors = validateEmployee(emp);
      if (Object.keys(empErrors).length > 0) {
        allErrors.push({ index, errors: empErrors });
      }
    });
    
    if (allErrors.length === 0) {
      onSave(employees);
    } else {
      alert('يوجد أخطاء في بيانات بعض الموظفين. يرجى التصحيح أولاً.');
    }
  };

  const calculateAge = (dateString) => {
    if (!dateString) return null;
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateTotalDependents = () => {
    let total = 0;
    employees.forEach(emp => {
      // عدد الزوجات (مع مراعاة الجنس)
      const spouses = emp.gender === 'ذكر' ? emp.number_of_spouses : 1;
      total += spouses;
      
      // عدد الأبناء
      total += emp.children_count;
      
      // عدد الوالدين
      if (emp.include_parents === 'نعم') {
        total += 2; // الأب والأم
      }
    });
    return total;
  };

  return (
    <div className="manual-entry-modal-overlay">
      <div className="manual-entry-modal">
        <div className="modal-header">
          <h2>✍️ إدخال بيانات الموظفين يدوياً</h2>
          <div className="company-info">
            <h3>{company?.name}</h3>
            <p>👥 {company?.total_employees || 0} موظف</p>
          </div>
        </div>

        <div className="modal-body">
          {/* إحصائيات */}
          <div className="statistics-card">
            <div className="stat-item">
              <span className="stat-label">عدد الموظفين:</span>
              <span className="stat-value">{employees.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">إجمالي المعالين:</span>
              <span className="stat-value">{calculateTotalDependents()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">متوسط الراتب:</span>
              <span className="stat-value">
                {employees.length > 0 
                  ? Math.round(employees.reduce((sum, emp) => sum + (parseFloat(emp.salary) || 0), 0) / employees.length)
                  : 0
                } دولار
              </span>
            </div>
          </div>

          {/* إضافة موظف جديد */}
          <div className="add-employee-form">
            <h3>➕ إضافة موظف جديد</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>الاسم الكامل *</label>
                <input
                  type="text"
                  value={currentEmployee.full_name}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, full_name: e.target.value})}
                  placeholder="أدخل الاسم الكامل"
                />
                {errors.full_name && <span className="error-text">{errors.full_name}</span>}
              </div>

              <div className="form-group">
                <label>تاريخ الميلاد *</label>
                <input
                  type="date"
                  value={currentEmployee.date_of_birth}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, date_of_birth: e.target.value})}
                />
                {errors.date_of_birth && <span className="error-text">{errors.date_of_birth}</span>}
                {currentEmployee.date_of_birth && (
                  <small>العمر: {calculateAge(currentEmployee.date_of_birth)} سنة</small>
                )}
              </div>

              <div className="form-group">
                <label>الجنس *</label>
                <select
                  value={currentEmployee.gender}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, gender: e.target.value})}
                >
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>

              <div className="form-group">
                <label>الراتب الشهري (دولار) *</label>
                <input
                  type="number"
                  value={currentEmployee.salary}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, salary: e.target.value})}
                  placeholder="مثال: 5000"
                  min="0"
                />
                {errors.salary && <span className="error-text">{errors.salary}</span>}
              </div>

              <div className="form-group">
                <label>الحالة الاجتماعية *</label>
                <select
                  value={currentEmployee.marital_status}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, marital_status: e.target.value})}
                >
                  <option value="أعزب">أعزب</option>
                  <option value="متزوج">متزوج</option>
                  <option value="مطلق">مطلق</option>
                  <option value="أرمل">أرمل</option>
                </select>
              </div>

              <div className="form-group">
                <label>عدد الزوجات *</label>
                <input
                  type="number"
                  value={currentEmployee.number_of_spouses}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, number_of_spouses: parseInt(e.target.value) || 1})}
                  min="1"
                  max={currentEmployee.gender === 'ذكر' ? 4 : 1}
                  disabled={currentEmployee.gender === 'أنثى'}
                />
                {errors.number_of_spouses && <span className="error-text">{errors.number_of_spouses}</span>}
                <small>{currentEmployee.gender === 'ذكر' ? 'يمكن للذكر حتى 4 زوجات' : 'الأنثى زوج واحد فقط'}</small>
              </div>

              <div className="form-group">
                <label>عدد الأبناء</label>
                <input
                  type="number"
                  value={currentEmployee.children_count}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, children_count: parseInt(e.target.value) || 0})}
                  min="0"
                />
                {errors.children_count && <span className="error-text">{errors.children_count}</span>}
              </div>

              <div className="form-group">
                <label>يشمل الوالدين؟</label>
                <select
                  value={currentEmployee.include_parents}
                  onChange={(e) => setCurrentEmployee({...currentEmployee, include_parents: e.target.value})}
                >
                  <option value="نعم">نعم (الأب والأم)</option>
                  <option value="لا">لا</option>
                </select>
              </div>
            </div>

            <button className="btn-add-employee" onClick={handleAddEmployee}>
              ➕ إضافة الموظف
            </button>
          </div>

          {/* قائمة الموظفين المضافين */}
          {employees.length > 0 && (
            <div className="employees-list">
              <h3>📋 قائمة الموظفين ({employees.length})</h3>
              <div className="employees-table-container">
                <table className="employees-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>الاسم</th>
                      <th>الجنس</th>
                      <th>العمر</th>
                      <th>الراتب</th>
                      <th>الحالة</th>
                      <th>الزوجات</th>
                      <th>الأبناء</th>
                      <th>الوالدان</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{emp.full_name || 'غير مسمى'}</td>
                        <td>{emp.gender}</td>
                        <td>{calculateAge(emp.date_of_birth) || '-'}</td>
                        <td>{emp.salary ? `${parseInt(emp.salary).toLocaleString()} دولار` : '-'}</td>
                        <td>{emp.marital_status}</td>
                        <td>{emp.number_of_spouses}</td>
                        <td>{emp.children_count}</td>
                        <td>{emp.include_parents === 'نعم' ? '✓' : '✗'}</td>
                        <td>
                          <button
                            className="btn-edit"
                            onClick={() => handleInputChange(index, 'full_name', prompt('عدل الاسم:', emp.full_name))}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => {
                              const updated = [...employees];
                              updated.splice(index, 1);
                              setEmployees(updated);
                            }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div className="modal-actions">
            <button className="btn-cancel" onClick={onCancel}>
              ❌ إلغاء
            </button>
            <button className="btn-save" onClick={handleSave}>
              💾 حفظ البيانات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManualEmployeesEntryModal;