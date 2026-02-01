import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="container">
                    <h1 className="about-title">حول SafeRatio</h1>
                    <p className="about-subtitle">
                        رؤيتنا، مهمتنا، وقيمنا في إعادة تعريف تجربة التأمين
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="mission-section">
                <div className="container">
                    <div className="mission-grid">
                        <div className="mission-content">
                            <h2>رؤيتنا</h2>
                            <p>
                                نرى عالماً حيث يكون التخطيط المالي والتأميني واضحاً، في متناول الجميع، 
                                ويمنح راحة البال الحقيقية. نطمح لأن نكون الشريك الموثوق لكل فرد وشركة 
                                في رحلتهم نحو الأمان المالي.
                            </p>
                        </div>
                        <div className="mission-image">
                            <div className="image-placeholder"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="values-section">
                <div className="container">
                    <h2 className="section-title">قيمنا الأساسية</h2>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon">👁️</div>
                            <h3>الشفافية</h3>
                            <p>
                                نؤمن بأن المعرفة هي القوة. نوفر معلومات واضحة ومفهومة 
                                لتمكينك من اتخاذ قرارات مستنيرة.
                            </p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">🎯</div>
                            <h3>الدقة</h3>
                            <p>
                                نلتزم بأعلى معايير الدقة في حساباتنا وتوصياتنا، باستخدام 
                                أحدث التقنيات والبيانات الموثوقة.
                            </p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">🤝</div>
                            <h3>الشراكة</h3>
                            <p>
                                نحن شركاء في رحلتك، نعمل جنباً إلى جنب معك لتحقيق أهدافك 
                                المالية والتأمينية.
                            </p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">💡</div>
                            <h3>الابتكار</h3>
                            <p>
                                نبحث دائماً عن طرق جديدة وأفضل لتبسيط وتعزيز تجربة 
                                التخطيط التأميني.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="team-section">
                <div className="container">
                    <h2 className="section-title">فريقنا الخبير</h2>
                    <p className="section-subtitle">
                        يجمع فريقنا بين الخبرة في مجالات التأمين، التكنولوجيا، والتمويل
                    </p>
                    <div className="team-grid">
                        <div className="team-member">
                            <div className="member-avatar"></div>
                            <h3>د. أحمد الخالد</h3>
                            <p className="member-role">خبير تأمين واستشاري مالي</p>
                            <p className="member-bio">
                                أكثر من 15 عاماً من الخبرة في صناعة التأمين والتخطيط المالي.
                            </p>
                        </div>
                        <div className="team-member">
                            <div className="member-avatar"></div>
                            <h3>سارة الفهد</h3>
                            <p className="member-role">مديرة التكنولوجيا والابتكار</p>
                            <p className="member-bio">
                                متخصصة في تطوير حلول تكنولوجية مبتكرة لقطاع الخدمات المالية.
                            </p>
                        </div>
                        <div className="team-member">
                            <div className="member-avatar"></div>
                            <h3>محمد الشمري</h3>
                            <p className="member-role">رئيس قسم تحليل البيانات</p>
                            <p className="member-bio">
                                خبير في تحليل البيانات الاكتوارية وتطوير نماذج التنبؤ.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <h3>50,000+</h3>
                            <p>عميل واثق من خدماتنا</p>
                        </div>
                        <div className="stat-item">
                            <h3>98%</h3>
                            <p>معدل رضا العملاء</p>
                        </div>
                        <div className="stat-item">
                            <h3>24/7</h3>
                            <p>دعم فني متاح</p>
                        </div>
                        <div className="stat-item">
                            <h3>15+</h3>
                            <p>شركة تأمين شريكة</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="about-cta">
                <div className="container">
                    <h2>انضم إلى رحلتنا</h2>
                    <p>
                        سواء كنت تبحث عن حماية مالية شخصية أو حلول تأمينية لمؤسستك، 
                        نحن هنا لمساعدتك في كل خطوة.
                    </p>
                    <div className="cta-buttons">
                        <a href="/contact" className="btn-primary">تواصل معنا</a>
                        <a href="/" className="btn-secondary">العودة للرئيسية</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;