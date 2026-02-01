// components/DataPreview.js
import React, { useState, useMemo } from "react";
import "./DataPreview.css";

const DataPreview = ({ employees, metadata, onConfirm, onCancel, onEdit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  // إحصائيات البيانات
  const stats = useMemo(() => calculateStatistics(employees), [employees]);

  // بيانات الصفحة الحالية
  const paginatedData = useMemo(() => {
    const sortedData = [...employees].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [employees, currentPage, itemsPerPage, sortConfig]);

  const totalPages = Math.ceil(employees.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕️";
    return sortConfig.direction === "asc" ? "⬆️" : "⬇️";
  };

  return (
    <div className="data-preview">
      <div className="preview-header">
        <h2>📊 معاينة بيانات الموظفين</h2>
        <div className="metadata">
          <div className="meta-item">
            <span className="meta-label">📁 اسم الملف:</span>
            <span className="meta-value">{metadata.fileName}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">📊 عدد السجلات:</span>
            <span className="meta-value">{employees.length} موظف</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">🗓️ تاريخ الرفع:</span>
            <span className="meta-value">
              {new Date(metadata.uploadDate).toLocaleDateString("ar-SA")}
            </span>
          </div>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>إجمالي الرواتب الشهرية</h3>
            <p className="stat-value">
              $
              {stats.totalMonthlySalary.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>متوسط الراتب</h3>
            <p className="stat-value">
              $
              {stats.averageSalary.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👨‍👩‍👧‍👦</div>
          <div className="stat-content">
            <h3>متزوجين</h3>
            <p className="stat-value">
              {stats.marriedCount} ({stats.marriedPercentage}%)
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👶</div>
          <div className="stat-content">
            <h3>متوسط عدد الأبناء</h3>
            <p className="stat-value">{stats.averageChildren.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* تحليل توزيع الرواتب */}
      <div className="salary-distribution">
        <h3>📈 توزيع الرواتب</h3>
        <div className="distribution-bars">
          {stats.salaryDistribution.map((range, index) => (
            <div key={index} className="distribution-item">
              <div className="range-label">{range.range}</div>
              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{ width: `${range.percentage}%` }}
                >
                  <span className="bar-count">{range.count}</span>
                </div>
              </div>
              <div className="percentage">{range.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* جدول البيانات */}
      <div className="table-container">
        <div className="table-header">
          <h3>📋 جدول الموظفين</h3>
          <div className="table-controls">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="page-select"
            >
              <option value="5">5 صفوف</option>
              <option value="10">10 صفوف</option>
              <option value="20">20 صفوف</option>
              <option value="50">50 صفوف</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("name")}>
                  الاسم {getSortIcon("name")}
                </th>
                <th onClick={() => handleSort("age")}>
                  العمر {getSortIcon("age")}
                </th>
                <th onClick={() => handleSort("gender")}>
                  الجنس {getSortIcon("gender")}
                </th>
                <th onClick={() => handleSort("marital_status")}>
                  الحالة {getSortIcon("marital_status")}
                </th>
                <th onClick={() => handleSort("position")}>
                  الوظيفة {getSortIcon("position")}
                </th>
                <th onClick={() => handleSort("department")}>
                  القسم {getSortIcon("department")}
                </th>
                <th onClick={() => handleSort("base_salary")}>
                  الراتب {getSortIcon("base_salary")}
                </th>
                <th>الأبناء</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((employee, index) => (
                <tr key={index}>
                  <td>{employee.name}</td>
                  <td>{employee.age}</td>
                  <td>
                    <span className={`gender-badge ${employee.gender}`}>
                      {employee.gender === "male" ? "👨 ذكر" : "👩 أنثى"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${employee.marital_status}`}>
                      {employee.marital_status === "married"
                        ? "💍 متزوج"
                        : "👤 أعزب"}
                    </span>
                  </td>
                  <td>{employee.position}</td>
                  <td>
                    <span className="department-tag">
                      {employee.department}
                    </span>
                  </td>
                  <td>
                    <span className="salary-cell">
                      ${employee.base_salary?.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    {employee.has_children ? (
                      <span className="children-count">
                        👶 {employee.number_of_children || 0}
                      </span>
                    ) : (
                      "لا يوجد"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* الترقيم */}
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            السابق
          </button>

          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`page-number ${currentPage === pageNum ? "active" : ""}`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="page-dots">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`page-number ${currentPage === totalPages ? "active" : ""}`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            التالي
          </button>
        </div>
      </div>

      {/* أزرار التحكم */}
      <div className="preview-actions">
        <button className="btn-secondary" onClick={onCancel}>
          رجوع
        </button>

        <button className="btn-edit" onClick={onEdit}>
          ✏️ تعديل البيانات
        </button>

        <button className="btn-primary" onClick={() => onConfirm(employees)}>
          ✅ تأكيد وحفظ البيانات
        </button>
      </div>
    </div>
  );
};

// دالة حساب الإحصائيات
const calculateStatistics = (employees) => {
  if (!employees || employees.length === 0) {
    return {
      totalMonthlySalary: 0,
      averageSalary: 0,
      marriedCount: 0,
      marriedPercentage: 0,
      averageChildren: 0,
      salaryDistribution: [],
    };
  }

  const totalMonthlySalary = employees.reduce(
    (sum, emp) => sum + (emp.total_monthly_salary || 0),
    0,
  );
  const averageSalary = totalMonthlySalary / employees.length;

  const marriedCount = employees.filter(
    (emp) => emp.marital_status === "married",
  ).length;
  const marriedPercentage = ((marriedCount / employees.length) * 100).toFixed(
    1,
  );

  const employeesWithChildren = employees.filter((emp) => emp.has_children);
  const totalChildren = employeesWithChildren.reduce(
    (sum, emp) => sum + (emp.number_of_children || 0),
    0,
  );
  const averageChildren =
    employeesWithChildren.length > 0
      ? totalChildren / employeesWithChildren.length
      : 0;

  // توزيع الرواتب
  const salaryRanges = [
    { min: 0, max: 1000, label: "أقل من 1,000" },
    { min: 1000, max: 3000, label: "1,000 - 3,000" },
    { min: 3000, max: 5000, label: "3,000 - 5,000" },
    { min: 5000, max: 10000, label: "5,000 - 10,000" },
    { min: 10000, max: Infinity, label: "أكثر من 10,000" },
  ];

  const salaryDistribution = salaryRanges.map((range) => {
    const count = employees.filter(
      (emp) => emp.base_salary >= range.min && emp.base_salary < range.max,
    ).length;

    return {
      range: range.label,
      count,
      percentage: ((count / employees.length) * 100).toFixed(1),
    };
  });

  return {
    totalMonthlySalary,
    averageSalary,
    marriedCount,
    marriedPercentage,
    averageChildren,
    salaryDistribution,
  };
};

export default DataPreview;
