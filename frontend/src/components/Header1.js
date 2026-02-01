import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ onLoginClick }) => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogoClick = () => {
        navigate('/');
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setDropdownOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setDropdownOpen(false);
    };

    // في Header.js - تحديث handleDashboardClick
const handleDashboardClick = () => {
    console.log('🎯 Dashboard clicked. User:', user);
    
    // ⭐⭐ **التحقق من أن user موجود وبه بيانات**
    if (!user) {
        console.error('❌ User is null!');
        navigate('/');
        setDropdownOpen(false);
        return;
    }
    
    // ⭐⭐ **التحقق من user_type في عدة أماكن**
    const userType = user.user_type || 
                    (user.user && user.user.user_type) || 
                    localStorage.getItem('user_type');
    
    console.log('🎯 Detected user_type:', userType);
    
    if (userType === 'organization') {
        navigate('/health-insurance');
    } else if (userType === 'individual') {
        navigate('/vehicles-insurance');
    } else {
        // ⭐ إذا لم نعرف النوع، اذهب للصفحة الرئيسية
        navigate('/');
    }
    
    setDropdownOpen(false);
};

    const handleAvatarClick = (event) => {
        event.stopPropagation();
        event.preventDefault();
        setDropdownOpen(!dropdownOpen);
    };

    const getInitials = () => {
        if (user?.first_name && user?.last_name) {
            return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        }
        return user?.username?.[0]?.toUpperCase() || 'U';
    };

    const getUserTypeBadge = () => {
        const types = {
            'individual': '🚗 Personal',
            'organization': '👥 Business',
            'admin': '👑 Admin'
        };
        return types[user?.user_type] || 'User';
    };

    // Inline styles
    const styles = {
        header: {
            background: 'white',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            width: '100%'
        },
        headerContainer: {
            maxWidth: '1490px',
            margin: '0 auto',
            padding: '0.75rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        headerLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        logoContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '8px',
            transition: 'background 0.2s ease'
        },
        logoContainerHover: {
            background: '#f8fafc'
        },
        logoImage: {
            width: '40px',
            height: '40px',
            objectFit: 'contain'
        },
        brandInfo: {
            display: 'flex',
            flexDirection: 'column'
        },
        brandName: {
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1e293b',
            margin: 0,
            lineHeight: 1.2
        },
        brandTagline: {
            fontSize: '0.75rem',
            color: '#64748b',
            margin: 0,
            fontWeight: '500'
        },
        headerRight: {
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
        },
        languageSelector: {
            position: 'relative'
        },
        langSelect: {
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '0.4rem 0.75rem',
            fontSize: '0.875rem',
            color: '#475569',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: '80px'
        },
        authButtons: {
            display: 'flex',
            gap: '0.75rem'
        },
        btnLogin: {
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1.25rem',
            borderRadius: '6px',
            fontWeight: '500',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        },
        userMenu: {
            position: 'relative'
        },
        userAvatarBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.4rem 0.75rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: '140px'
        },
        userAvatar: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #e2e8f0'
        },
        avatarInitials: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '0.875rem'
        },
        userName: {
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#1e293b',
            flex: 1,
            textAlign: 'left'
        },
        dropdownArrow: {
            color: '#64748b',
            fontSize: '0.75rem'
        },
        dropdownMenu: {
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e2e8f0',
            minWidth: '240px',
            zIndex: 1001,
            animation: 'slideDown 0.2s ease'
        },
        dropdownHeader: {
            padding: '1rem',
            borderBottom: '1px solid #f1f5f9'
        },
        dropdownUserInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        dropdownAvatar: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '1rem'
        },
        dropdownUsername: {
            fontWeight: '600',
            color: '#1e293b',
            fontSize: '0.9rem'
        },
        dropdownUsertype: {
            fontSize: '0.75rem',
            color: '#64748b',
            marginTop: '0.1rem'
        },
        dropdownDivider: {
            height: '1px',
            background: '#f1f5f9',
            margin: '0.25rem 0'
        },
        dropdownItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
            color: '#475569',
            fontSize: '0.875rem'
        },
        dropdownIcon: {
            fontSize: '1rem',
            width: '20px',
            textAlign: 'center'
        },
        logoutBtn: {
            color: '#dc2626'
        }
    };

    // Add keyframes for animation
    const keyframesStyle = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;

    return (
        <>
            <style>{keyframesStyle}</style>
            <header style={styles.header}>
                <div style={styles.headerContainer}>
                    {/* Left: Logo & Brand */}
                    <div style={styles.headerLeft}>
                        <div 
                            style={styles.logoContainer}
                            onClick={handleLogoClick}
                            onMouseEnter={(e) => e.currentTarget.style.background = styles.logoContainerHover.background}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <div>
                                <img src="/logo.png" alt="SafeRatio Logo" style={styles.logoImage} />
                            </div>
                            <div style={styles.brandInfo}>
                                <h1 style={styles.brandName}>SafeRatio</h1>
                                <p style={styles.brandTagline}>RIGHT COVERAGE, RIGHT CHOICE</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Language & User Actions */}
                    <div style={styles.headerRight}>
                        {/* Language Selector */}
                        <div style={styles.languageSelector}>
                            <select style={styles.langSelect}>
                                <option value="ar">العربية</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        {/* User Actions */}
                        {isAuthenticated ? (
                            <div style={styles.userMenu} ref={dropdownRef}>
                                <button 
                                    style={styles.userAvatarBtn}
                                    onClick={handleAvatarClick}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                        e.currentTarget.style.background = '#f8fafc';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                        e.currentTarget.style.background = 'white';
                                    }}
                                >
                                    {user?.avatar_url ? (
                                        <img 
                                            src={user.avatar_url} 
                                            alt={user.username} 
                                            style={styles.userAvatar}
                                        />
                                    ) : (
                                        <div style={styles.avatarInitials}>
                                            {getInitials()}
                                        </div>
                                    )}
                                    <span style={styles.userName}>
                                        {user?.first_name || user?.username}
                                    </span>
                                    <span style={styles.dropdownArrow}>
                                        {dropdownOpen ? '▲' : '▼'}
                                    </span>
                                </button>

                                {dropdownOpen && (
                                    <div style={styles.dropdownMenu}>
                                        <div style={styles.dropdownHeader}>
                                            <div style={styles.dropdownUserInfo}>
                                                <div style={styles.dropdownAvatar}>
                                                    {getInitials()}
                                                </div>
                                                <div>
                                                    <div style={styles.dropdownUsername}>
                                                        {user?.first_name} {user?.last_name}
                                                    </div>
                                                    <div style={styles.dropdownUsertype}>
                                                        {getUserTypeBadge()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div style={styles.dropdownDivider}></div>
                                        
                                        <button 
                                            style={styles.dropdownItem}
                                            onClick={handleDashboardClick}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <span style={styles.dropdownIcon}>📊</span>
                                            Dashboard
                                        </button>
                                        
                                        <button 
                                            style={styles.dropdownItem}
                                            onClick={handleProfileClick}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <span style={styles.dropdownIcon}>👤</span>
                                            My Profile
                                        </button>

                                        {user?.user_type === 'admin' && (
                                            <button 
                                                style={styles.dropdownItem}
                                                onClick={() => {
                                                    navigate('/admin');
                                                    setDropdownOpen(false);
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <span style={styles.dropdownIcon}>👑</span>
                                                Admin Panel
                                            </button>
                                        )}

                                        <div style={styles.dropdownDivider}></div>
                                        
                                        <button 
                                            style={{...styles.dropdownItem, ...styles.logoutBtn}}
                                            onClick={handleLogout}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#fee2e2';
                                                e.currentTarget.style.color = '#b91c1c';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = styles.logoutBtn.color;
                                            }}
                                        >
                                            <span style={styles.dropdownIcon}>🚪</span>
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={styles.authButtons}>
                                <button 
                                    style={styles.btnLogin}
                                    onClick={onLoginClick}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #4338ca, #6d28d9)';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #4f46e5, #7c3aed)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    Sign In
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;