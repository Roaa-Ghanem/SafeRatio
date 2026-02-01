import React, { useState } from 'react';
import './ContactUs.css';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        contactMethod: 'email'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitStatus('success');
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: '',
                contactMethod: 'email'
            });
            
            // Reset status after 5 seconds
            setTimeout(() => {
                setSubmitStatus(null);
            }, 5000);
        }, 1500);
    };

    const contactMethods = [
        {
            icon: '📧',
            title: 'البريد الإلكتروني',
            details: 'support@insurecalc.com',
            description: 'رد خلال 24 ساعة'
        },
        {
            icon: '📞',
            title: 'الهاتف',
            details: '+966 123 456 789',
            description: 'من الأحد إلى الخميس، 9 صباحاً - 5 مساءً'
        },
        {
            icon: '📍',
            title: 'المكتب الرئيسي',
            details: 'الرياض، المملكة العربية السعودية',
            description: 'زيارة بموعد مسبق'
        }
    ];

    return (
        <div className="contact-page">
            {/* Hero Section */}
            <section className="contact-hero">
                <div className="container">
                    <h1 className="contact-title">تواصل معنا</h1>
                    <p className="contact-subtitle">
                        نحن هنا للإجابة على استفساراتك ومساعدتك في كل ما تحتاجه
                    </p>
                </div>
            </section>

            <div className="contact-container">
                {/* Contact Info */}
                <section className="contact-info-section">
                    <div className="container">
                        <h2 className="section-title">طرق التواصل</h2>
                        <div className="contact-methods">
                            {contactMethods.map((method, index) => (
                                <div key={index} className="contact-method">
                                    <div className="method-icon">{method.icon}</div>
                                    <div className="method-content">
                                        <h3>{method.title}</h3>
                                        <p className="method-details">{method.details}</p>
                                        <p className="method-description">{method.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Form */}
                <section className="contact-form-section">
                    <div className="container">
                        <div className="form-container">
                            <h2 className="form-title">أرسل رسالتك</h2>
                            <p className="form-subtitle">
                                سنكون سعداء بالتواصل معك والرد على استفساراتك
                            </p>

                            {submitStatus === 'success' && (
                                <div className="success-message">
                                    <span>✓</span>
                                    <p>تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="name">الاسم الكامل *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="أدخل اسمك الكامل"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">البريد الإلكتروني *</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="example@email.com"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="phone">رقم الهاتف</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+966 XXX XXX XXX"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="subject">الموضوع *</label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">اختر موضوع الرسالة</option>
                                            <option value="support">دعم فني</option>
                                            <option value="sales">استفسارات مبيعات</option>
                                            <option value="partnership">شراكة</option>
                                            <option value="feedback">ملاحظات ومقترحات</option>
                                            <option value="other">أخرى</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="message">الرسالة *</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="6"
                                        placeholder="اكتب رسالتك هنا..."
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label>طريقة التواصل المفضلة</label>
                                    <div className="contact-preferences">
                                        <label className="preference-option">
                                            <input
                                                type="radio"
                                                name="contactMethod"
                                                value="email"
                                                checked={formData.contactMethod === 'email'}
                                                onChange={handleChange}
                                            />
                                            <span>البريد الإلكتروني</span>
                                        </label>
                                        <label className="preference-option">
                                            <input
                                                type="radio"
                                                name="contactMethod"
                                                value="phone"
                                                checked={formData.contactMethod === 'phone'}
                                                onChange={handleChange}
                                            />
                                            <span>مكالمة هاتفية</span>
                                        </label>
                                        <label className="preference-option">
                                            <input
                                                type="radio"
                                                name="contactMethod"
                                                value="whatsapp"
                                                checked={formData.contactMethod === 'whatsapp'}
                                                onChange={handleChange}
                                            />
                                            <span>واتساب</span>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner"></span>
                                            جاري الإرسال...
                                        </>
                                    ) : (
                                        'إرسال الرسالة'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* FAQ Preview */}
                <section className="faq-preview">
                    <div className="container">
                        <h2>أسئلة شائعة</h2>
                        <div className="faq-list">
                            <div className="faq-item">
                                <h3>ما هي مدة الرد على الرسائل؟</h3>
                                <p>نرد على جميع الرسائل خلال 24 ساعة عمل.</p>
                            </div>
                            <div className="faq-item">
                                <h3>هل تتوفر خدمة العملاء على مدار الساعة؟</h3>
                                <p>نعم، الدعم الفني متاح 24/7 عبر البريد الإلكتروني والدردشة الحية.</p>
                            </div>
                            <div className="faq-item">
                                <h3>كيف يمكنني تحديث بيانات حسابي؟</h3>
                                <p>يمكنك تحديث بياناتك من خلال إعدادات الحساب في لوحة التحكم.</p>
                            </div>
                        </div>
                        <a href="/faq" className="view-all-faq">عرض جميع الأسئلة الشائعة →</a>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ContactUs;