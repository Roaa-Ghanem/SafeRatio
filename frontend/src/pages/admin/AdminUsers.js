// src/pages/admin/AdminUsers.js - النسخة الكاملة
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminUsers = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        user_type: '',
        status: '',
        sort_by: '-date_joined'
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchUsers();
    }, [page, filters]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('accessToken');
            
            const params = {
                page,
                page_size: 20,
                ...(filters.search && { search: filters.search }),
                ...(filters.user_type && { user_type: filters.user_type }),
                ...(filters.status && { status: filters.status }),
                ...(filters.sort_by && { sort_by: filters.sort_by })
            };

            console.log('Fetching users with params:', params);

            const response = await axios.get(`${API_BASE_URL}/api/admin/users/`, {
                params,
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Users API response:', response.data);

            if (response.data && response.data.users) {
                setUsers(response.data.users);
                setTotalPages(response.data.pagination?.total_pages || 1);
                setTotalCount(response.data.pagination?.total_count || 0);
            } else {
                throw new Error('بيانات غير صالحة');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('فشل في تحميل المستخدمين: ' + (error.response?.data?.error || error.message));
            
            // بيانات تجريبية للاختبار
            const mockUsers = [
                { id: 1, username: 'ahmed', email: 'ahmed@example.com', first_name: 'أحمد', last_name: 'محمد', user_type: 'individual', date_joined: '2024-01-15T10:30:00Z', last_login: '2024-03-20T09:15:00Z', is_active: true, phone: '777123456', country: 'Yemen' },
                { id: 2, username: 'sara', email: 'sara@example.com', first_name: 'سارة', last_name: 'علي', user_type: 'individual', date_joined: '2024-02-01T14:20:00Z', last_login: '2024-03-19T16:45:00Z', is_active: true, phone: '777654321', country: 'Yemen' },
                { id: 3, username: 'tech_co', email: 'info@tech.com', first_name: 'شركة', last_name: 'التقنية', user_type: 'organization', date_joined: '2024-01-20T11:10:00Z', last_login: '2024-03-18T10:30:00Z', is_active: true, phone: '777987654', country: 'Yemen' },
                { id: 4, username: 'admin', email: 'admin@saferatio.com', first_name: 'المسؤول', last_name: 'النظام', user_type: 'admin', date_joined: '2024-01-01T08:00:00Z', last_login: '2024-03-20T17:20:00Z', is_active: true, phone: '777555555', country: 'Yemen' },
                { id: 5, username: 'inactive_user', email: 'inactive@example.com', first_name: 'مستخدم', last_name: 'غير نشط', user_type: 'individual', date_joined: '2024-02-15T12:00:00Z', last_login: null, is_active: false, phone: '777111111', country: 'Yemen' },
            ];
            
            // تطبيق الفلاتر على البيانات التجريبية
            let filteredUsers = mockUsers.filter(u => {
                if (filters.search) {
                    const searchLower = filters.search.toLowerCase();
                    return u.username.toLowerCase().includes(searchLower) ||
                           u.email.toLowerCase().includes(searchLower) ||
                           (u.first_name + ' ' + u.last_name).toLowerCase().includes(searchLower);
                }
                return true;
            }).filter(u => {
                if (filters.user_type) return u.user_type === filters.user_type;
                return true;
            }).filter(u => {
                if (filters.status === 'active') return u.is_active === true;
                if (filters.status === 'inactive') return u.is_active === false;
                return true;
            });
            
            // تطبيق الترتيب
            if (filters.sort_by === '-date_joined') {
                filteredUsers.sort((a, b) => new Date(b.date_joined) - new Date(a.date_joined));
            } else if (filters.sort_by === 'username') {
                filteredUsers.sort((a, b) => a.username.localeCompare(b.username));
            }
            
            setUsers(filteredUsers);
            setTotalPages(1);
            setTotalCount(filteredUsers.length);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPage(1);
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`هل أنت متأكد من حذف المستخدم "${username}"؟`)) {
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}/delete/`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.success) {
                alert(response.data.message || 'تم حذف المستخدم بنجاح');
                fetchUsers(); // إعادة تحميل القائمة
            } else {
                alert(response.data.error || 'فشل في حذف المستخدم');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('فشل في حذف المستخدم: ' + (error.response?.data?.error || error.message));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'لم يدخل';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getUserTypeLabel = (type) => {
        const types = {
            individual: 'فرد',
            organization: 'مؤسسة',
            admin: 'مسؤول'
        };
        return types[type] || type;
    };

    const getUserTypeColor = (type) => {
        const colors = {
            individual: '#3498db',
            organization: '#2ecc71',
            admin: '#e74c3c'
        };
        return colors[type] || '#95a5a6';
    };

    if (loading && page === 1) {
        return (
            <div className="admin-page-loading" dir="rtl">
                <div className="loading-spinner"></div>
                <p>جاري تحميل بيانات المستخدمين...</p>
            </div>
        );
    }

    return (
        <div className="admin-users-page" dir="rtl">
            <header className="admin-header">
                <div className="header-left">
                    <h1>إدارة المستخدمين</h1>
                    <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
                        العودة للوحة التحكم
                    </button>
                </div>
                <div className="header-right">
                    <button onClick={handleLogout} className="logout-btn">
                        تسجيل خروج
                    </button>
                </div>
            </header>

            <main className="admin-main">
                <div className="filters-section">
                    <div className="filter-group">
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو البريد أو الهاتف..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="filter-input"
                        />
                    </div>
                    
                    <div className="filter-group">
                        <select
                            value={filters.user_type}
                            onChange={(e) => handleFilterChange('user_type', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">جميع الأنواع</option>
                            <option value="individual">أفراد</option>
                            <option value="organization">مؤسسات</option>
                            <option value="admin">مسؤولين</option>
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">جميع الحالات</option>
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <select
                            value={filters.sort_by}
                            onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                            className="filter-select"
                        >
                            <option value="-date_joined">الأحدث أولاً</option>
                            <option value="date_joined">الأقدم أولاً</option>
                            <option value="username">اسم المستخدم (أ-ي)</option>
                            <option value="-username">اسم المستخدم (ي-أ)</option>
                        </select>
                    </div>
                    
                    <button onClick={fetchUsers} className="btn-primary">
                        تطبيق الفلاتر
                    </button>
                </div>

                <div className="page-controls">
                    <div className="total-count">
                        إجمالي المستخدمين: <strong>{totalCount}</strong>
                    </div>
                    <button 
                        className="btn-primary" 
                        onClick={() => navigate('/admin/users/create')}
                    >
                        {/* <span className="material-symbols-outlined">add</span> */}
                        إضافة مستخدم جديد
                    </button>
                </div>

                {error && (
                    <div className="error-alert">
                        ⚠️ {error}
                    </div>
                )}

                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>المعرف</th>
                                <th>اسم المستخدم</th>
                                <th>البريد الإلكتروني</th>
                                <th>الاسم</th>
                                <th>نوع المستخدم</th>
                                <th>الهاتف</th>
                                <th>تاريخ التسجيل</th>
                                <th>آخر دخول</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
    {users.map((user, index) => (
        <tr key={user.id || index}>
            <td>{user.id || 'N/A'}</td>
            <td>
                <strong>{user.username || 'غير معروف'}</strong>
            </td>
            <td>{user.email || '-'}</td>
            <td>
                {(user.first_name || '') + ' ' + (user.last_name || '') || '-'}
            </td>
            <td>
                <span 
                    className="user-type-badge"
                    style={{ 
                        backgroundColor: getUserTypeColor(user.user_type),
                        color: 'white'
                    }}
                >
                    {getUserTypeLabel(user.user_type || 'individual')}
                </span>
            </td>
            <td>{user.phone || '-'}</td>
            <td>{formatDate(user.date_joined)}</td>
            <td>{formatDate(user.last_login)}</td>
            <td>
                <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'نشط' : 'غير نشط'}
                </span>
            </td>
            <td>
                <div className="action-buttons">
                    <button 
                        className="btn-view" 
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        title="عرض التفاصيل"
                        disabled={!user.id}
                    >
                        <span className="material-symbols-outlined">visibility</span>
                    </button>
                    <button 
                        className="btn-edit" 
                        onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                        title="تعديل"
                        disabled={!user.id}
                    >
                        <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button 
                        className="btn-delete" 
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        title="حذف"
                        disabled={!user.id || user.id === 1}
                    >
                        <span className="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    ))}
</tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="empty-state">
                        <span className="material-symbols-outlined empty-icon">people</span>
                        <h3>لا توجد مستخدمين</h3>
                        <p>لم يتم العثور على مستخدمين مطابقين لبحثك</p>
                        <button 
                            className="btn-primary" 
                            onClick={() => {
                                setFilters({
                                    search: '',
                                    user_type: '',
                                    status: '',
                                    sort_by: '-date_joined'
                                });
                                setPage(1);
                            }}
                        >
                            عرض جميع المستخدمين
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="pagination-btn"
                        >
                            السابق
                        </button>
                        
                        <div className="page-numbers">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`page-number ${page === pageNum ? 'active' : ''}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="pagination-btn"
                        >
                            التالي
                        </button>
                        
                        <span className="page-info">
                            الصفحة {page} من {totalPages}
                        </span>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminUsers;