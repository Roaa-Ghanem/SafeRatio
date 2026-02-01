// components/DataEditor.js
import React, { useState, useEffect } from 'react';
import './DataEditor.css';

const DataEditor = ({ initialData, onSave, onCancel }) => {
  const [employees, setEmployees] = useState(initialData);
  const [editedRows, setEditedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [bulkEdit, setBulkEdit] = useState({ field: '', value: '' });
  
  // استخراج الأقسام الفريدة
  const departments = ['all', ...new Set(employees.map(emp => emp.department))];
  
  // البيانات المصفاة
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = 
      filterDepartment === 'all' || emp.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });
  
  const handleCellEdit = (index, field, value) => {
    const updatedEmployees = [...employees];
    updatedEmployees[index] = {
      ...updatedEmployees[index],
      [field]: field === 'base_salary' || field === 'age' || field === 'number_of_children' 
        ? Number(value) 
        : value
    };
    
    setEmployees(updatedEmployees);
    setEditedRows(prev => new Set([...prev, index]));
  };
  
  const handleBulkEdit = () => {
    if (!bulkEdit.field || bulkEdit.value === '') return;
    
    const updatedEmployees = employees.map(emp => {
      if (filterDepartment === 'all' || emp.department === filterDepartment) {
        return {
          ...emp,
          [bulkEdit.field]: bulkEdit.field.includes('salary') || bulkEdit.field.includes('age') || bulkEdit.field.includes('children')
            ? Number(bulkEdit.value)
            : bulkEdit.value
        };
      }
      return emp;
    });
    
    setEmployees(updatedEmployees);
    setBulkEdit({ field: '', value: '' });
    alert('تم تطبيق التعديل الجماعي');
  };
  
  const addNewEmployee = () => {
    const newEmployee = {
      name: '',
      age: 25,
      gender: 'male',
      marital_status: 'single',
      position: '',
      department: departments[1] || 'الإدارة',
      base_salary: 0,
      monthly_allowances: 0,
      has_children: false,
      number_of_children: 0
    };
    
    setEmployees([...employees, newEmployee]);
  };
  
  const deleteEmployee = (index) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      const updatedEmployees = employees.filter((_, i) => i !== index);
      setEmployees(updatedEmployees);
    }
  };
  
  const validateData = () => {
    const errors = [];
    
    employees.forEach((emp, index) => {
      if (!emp.name || emp.name.trim() === '') {
        errors.push(`الموظف #${index + 1}: الاسم مطلوب`);
      }
      
      if (!emp.age || emp.age < 18 || emp.age > 65) {
        errors.push(`الموظف #${index + 1}: العمر يجب أن يكون بين 18 و 65`);
      }
      
      if (!emp.base_salary || emp.base_salary <= 0) {
        errors.push(`الموظف #${index + 1}: الراتب الأساسي يجب أن يكون أكبر من صفر`);
      }
    });
    
    return errors;
  };
  
  const handleSave = () => {
    const errors = validateData();
    
    if (errors.length > 0) {
      alert('يوجد أخطاء في البيانات:\n' + errors.join('\n'));
      return;
    }
    
    onSave(employees);
  };
  
  const exportToCSV = () => {
    const csvContent = convertToCSV(employees);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `الموظفين_المعدلة_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };
  
  return (
    <div className="data-editor">
      <div className="editor-header">
        <h2>✏️ محرر بيانات الموظفين</h2>
        <div className="editor-info">
          <span className="total-count">إجمالي الموظفين: {employees.length}</span>
          <span className="edited-count">المعدلين: {editedRows.size}</span>
        </div>
      </div>
      
      {/* أدوات التحكم */}
      <div className="editor-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 البحث عن موظف أو وظيفة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="department-filter"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'جميع الأقسام' : dept}
              </option>
            ))}
          </select>
        </div>
        
        <div className="bulk-edit">
          <select
            value={bulkEdit.field}
            onChange={(e) => setBulkEdit({ ...bulkEdit, field: e.target.value })}
            className="bulk-field"
          >
            <option value="">تعديل جماعي لحقل...</option>
            <option value="department">القسم</option>
            <option value="base_salary">الراتب الأساسي</option>
            <option value="monthly_allowances">البدلات الشهرية</option>
            <option value="marital_status">الحالة الاجتماعية</option>
          </select>
          
          <input
            type={bulkEdit.field.includes('salary') ? 'number' : 'text'}
            placeholder="القيمة الجديدة"
            value={bulkEdit.value}
            onChange={(e) => setBulkEdit({ ...bulkEdit, value: e.target.value })}
            className="bulk-value"
          />
          
          <button
            onClick={handleBulkEdit}
            disabled={!bulkEdit.field || bulkEdit.value === ''}
            className="btn-bulk-apply"
          >
            تطبيق على المصفاة
          </button>
        </div>
      </div>
      
      {/* أزرار الإجراءات */}
      <div className="action-buttons">
        <button onClick={addNewEmployee} className="btn-add">
          ➕ إضافة موظف جديد
        </button>
        <button onClick={exportToCSV} className="btn-export">
          📥 تصدير كـ CSV
        </button>
      </div>
      
      {/* جدول التحرير */}
      <div className="editor-table-container">
        <table className="editor-table">
          <thead>
            <tr>
              <th>#</th>
              <th>الاسم</th>
              <th>العمر</th>
              <th>الجنس</th>
              <th>الحالة</th>
              <th>الوظيفة</th>
              <th>القسم</th>
              <th>الراتب الأساسي ($)</th>
              <th>البدلات ($)</th>
              <th>الأبناء</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp, index) => (
              <tr key={index} className={editedRows.has(index) ? 'edited' : ''}>
                <td>{index + 1}</td>
                <td>
                  <input
                    type="text"
                    value={emp.name}
                    onChange={(e) => handleCellEdit(index, 'name', e.target.value)}
                    className="editable-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    value={emp.age}
                    onChange={(e) => handleCellEdit(index, 'age', e.target.value)}
                    className="editable-input number"
                  />
                </td>
                <td>
                  <select
                    value={emp.gender}
                    onChange={(e) => handleCellEdit(index, 'gender', e.target.value)}
                    className="editable-select"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </td>
                <td>
                  <select
                    value={emp.marital_status}
                    onChange={(e) => handleCellEdit(index, 'marital_status', e.target.value)}
                    className="editable-select"
                  >
                    <option value="single">أعزب</option>
                    <option value="married">متزوج</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={emp.position}
                    onChange={(e) => handleCellEdit(index, 'position', e.target.value)}
                    className="editable-input"
                  />
                </td>
                <td>
                  <select
                    value={emp.department}
                    onChange={(e) => handleCellEdit(index, 'department', e.target.value)}
                    className="editable-select"
                  >
                    {departments.filter(d => d !== 'all').map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={emp.base_salary}
                    onChange={(e) => handleCellEdit(index, 'base_salary', e.target.value)}
                    className="editable-input number"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={emp.monthly_allowances || 0}
                    onChange={(e) => handleCellEdit(index, 'monthly_allowances', e.target.value)}
                    className="editable-input number"
                  />
                </td>
                <td>
                  <div className="children-controls">
                    <input
                      type="checkbox"
                      checked={emp.has_children}
                      onChange={(e) => handleCellEdit(index, 'has_children', e.target.checked)}
                      className="children-checkbox"
                    />
                    {emp.has_children && (
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={emp.number_of_children || 0}
                        onChange={(e) => handleCellEdit(index, 'number_of_children', e.target.value)}
                        className="children-input"
                        placeholder="عدد"
                      />
                    )}
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => deleteEmployee(index)}
                    className="btn-delete"
                    title="حذف"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* أزرار الحفظ */}
      <div className="editor-actions">
        <button onClick={onCancel} className="btn-cancel">
          إلغاء
        </button>
        <button onClick={handleSave} className="btn-save">
          💾 حفظ التعديلات
        </button>
      </div>
    </div>
  );
};

// دالة لتحويل البيانات لـ CSV
const convertToCSV = (employees) => {
  const headers = ['name', 'age', 'gender', 'marital_status', 'position', 'department', 'base_salary', 'monthly_allowances', 'has_children', 'number_of_children'];
  
  const rows = employees.map(emp => 
    headers.map(header => {
      const value = emp[header];
      return typeof value === 'string' && (value.includes(',') || value.includes('"'))
        ? `"${value.replace(/"/g, '""')}"`
        : value;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
};

export default DataEditor;