import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import Header from '../components/Header';
import './LandingPage.css';

const LandingPage = () => {
    const { isAuthenticated } = useAuth();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState('login');
    
    const openLogin = () => {
        setAuthModalView('login');
        setAuthModalOpen(true);
    };

    const openRegister = () => {
        setAuthModalView('register');
        setAuthModalOpen(true);
    };

    return (
        <div className="landing-page">
            <Header onLoginClick={openLogin} onRegisterClick={openRegister} />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">استقبل الغد بثقة وطمأنينة</h1>
                    <p className="hero-subtitle">
                        اكتشف راحة البال التي تأتي مع الحماية المصممة خصيصاً لك. أداستنا الذكية تساعدك على فهم احتياجاتك التأمينية، لتتمكن من العيش بكل طاقتك، اليوم وغداً.
                    </p>
                    {!isAuthenticated && (
                        <button className="btn-primary hero-cta" onClick={openRegister}>
                            <span>ابدأ رحلتك نحو الوضوح المالي</span>
                            <svg className="cta-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    )}
                </div>
                <div className="hero-decoration">
                    <div className="decoration-circle circle-1"></div>
                    <div className="decoration-circle circle-2"></div>
                    <div className="decoration-circle circle-3"></div>
                </div>
            </section>

            {/* Registration Types Section */}
            {!isAuthenticated && (
                <section className="registration-types">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">اختر نوع حسابك</h2>
                            <p className="section-subtitle">
                                ابدأ بالحل التأميني المناسب لاحتياجاتك الخاصة
                            </p>
                        </div>
                        
                        <div className="type-cards">
                            <div className="type-card" onClick={() => {
                                const url = new URL(window.location);
                                url.searchParams.set('user_type', 'individual');
                                window.history.pushState({}, '', url);
                                openRegister();
                            }}>
                                <div className="type-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                    </svg>
                                </div>
                                <h3>حساب فردي</h3>
                                <p>مثالي للاحتياجات التأمينية الشخصية</p>
                                <ul className="type-features">
                                    <li>تأمين السيارات والمركبات</li>
                                    <li>تأمين صحي شخصي</li>
                                    <li>تأمين على الحياة</li>
                                    <li>تأمين المنازل والممتلكات</li>
                                </ul>
                                <button className="type-select-btn">
                                    <span>سجل كفرد</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="type-card" onClick={() => {
                                const url = new URL(window.location);
                                url.searchParams.set('user_type', 'organization');
                                window.history.pushState({}, '', url);
                                openRegister();
                            }}>
                                <div className="type-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-4v2h4v-2zm0 4h-4v2h4v-2z"/>
                                    </svg>
                                </div>
                                <h3>حساب مؤسسي</h3>
                                <p>مصمم للشركات والمنظمات</p>
                                <ul className="type-features">
                                    <li>خطط التأمين الصحي للموظفين</li>
                                    <li>تأمين المسؤولية المهنية</li>
                                    <li>تأمين الممتلكات التجارية</li>
                                    <li>تأمين السيارات التجارية</li>
                                </ul>
                                <button className="type-select-btn">
                                    <span>سجل كمؤسسة</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2 className="section-title">أساس متين لمستقبلك</h2>
                    <p className="section-subtitle">أدوات وتقنيات مصممة لتمنحك الوضوح والثقة</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                            </svg>
                        </div>
                        <h3 className="feature-title">دقة يمكنك الوثوق بها</h3>
                        <p className="feature-description">
                            خوارزمياتنا المتطورة تأخذ في الاعتبار كل تفاصيل حياتك، لتقدم تقديراً يعكس ظروفك الفريدة. وداعاً للتخمين، مرحباً بالرؤى الواضحة والقابلة للتطبيق لرفاهيتك المالية.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                            </svg>
                        </div>
                        <h3 className="feature-title">صمم سيناريوهاتك المثالية</h3>
                        <p className="feature-description">
                            الحياة ديناميكية، ويجب أن تكون خططك كذلك. احفظ وقارن خيارات التغطية المختلفة، وتكيف مع تطور أحلامك ومسؤولياتك. تمكينك لاتخاذ قرارات تتناغم مع تطلعاتك.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                            </svg>
                        </div>
                        <h3 className="feature-title">المخطط الشخصي الخاص بك</h3>
                        <p className="feature-description">
                            استلم تقريراً شاملاً ومصمماً بدقة يوضح احتياجاتك التأمينية. هذا المخطط الشخصي هو ملك لك تحتفظ به وتشاركه وتراجعه، لضمان إطلاعك وثقتك في قراراتك دائماً.
                        </p>
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="process-section">
                <div className="section-header">
                    <h2 className="section-title">رحلتك، مبسطة</h2>
                    <p className="section-subtitle">4 خطوات بسيطة نحو الوضوح المالي</p>
                </div>
                <div className="process-container">
                    {/* <div className="process-line"></div> */}
                    <div className="process-steps">
                        <div className="process-step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3 className="step-title">شارك قصتك</h3>
                                <p className="step-description">
                                    ابدأ بمشاركة بعض التفاصيل عن حياتك وأهدافك المالية بشكل آمن. منصتنا مصممة لفهم تطلعاتك الفريدة، مما يجعل الحساب شخصياً بحق.
                                </p>
                            </div>
                        </div>
                        <div className="process-step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3 className="step-title">اكتشف إمكانياتك</h3>
                                <p className="step-description">
                                    شاهد نظرة عامة واضحة وشاملة لاحتياجاتك التأمينية على الفور. استكشف خيارات وسيناريوهات متنوعة، لتمكنك من تصور مستقبل آمن.
                                </p>
                            </div>
                        </div>
                        <div className="process-step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3 className="step-title">احمِ إرثك</h3>
                                <p className="step-description">
                                    حمّل تقريراً شخصياً يجسد توصياتك المصممة خصيصاً لك. هذه الوثيقة القيمة تساعدك على اتخاذ الخطوات التالية بثقة نحو راحة البال الدائمة.
                                </p>
                            </div>
                        </div>
                        <div className="process-step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <h3 className="step-title">إرشاد الخبراء (اختياري)</h3>
                                <p className="step-description">
                                    إذا رغبت، تواصل بسلاسة مع مستشارين موثوقين يمكنهم إلقاء المزيد من الضوء على طريقك ومساعدتك في تنفيذ استراتيجيتك التأمينية الشخصية.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="section-header">
                    <h2 className="section-title">أصوات الثقة</h2>
                    <p className="section-subtitle">ما يقوله عملاؤنا عن تجربتهم</p>
                </div>
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <div className="quote-icon">"</div>
                        <p className="testimonial-text">
                            "جعل InsureCalc فهم مستقبل عائلتي أكثر وضوحاً. العملية كانت ممتعة بشكل مفاجئ، وأشعر بأنني مستعد حقاً. لقد زال عن كاهلي عبء كبير."
                        </p>
                        <div className="testimonial-author">
                            <div className="author-avatar avatar-1"></div>
                            <div className="author-info">
                                <p className="author-name">سارة ل.</p>
                                <p className="author-role">مديرة تسويق</p>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-card">
                        <div className="quote-icon">"</div>
                        <p className="testimonial-text">
                            "كصاحب عمل صغير، التخطيط لما هو غير متوقع أمر بالغ الأهمية. قدم InsureCalc رؤى لم أكن أعتبرها، كل ذلك مع وضوح وأناقة في العرض."
                        </p>
                        <div className="testimonial-author">
                            <div className="author-avatar avatar-2"></div>
                            <div className="author-info">
                                <p className="author-name">ديفيد ر.</p>
                                <p className="author-role">رائد أعمال</p>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-card">
                        <div className="quote-icon">"</div>
                        <p className="testimonial-text">
                            "كنت أجد التأمين أمراً مخيفاً، لكن نهج InsureCalc كان تمكينياً. إنه أكثر من مجرد أداة؛ إنه شريك في تأمين راحة بالي."
                        </p>
                        <div className="testimonial-author">
                            <div className="author-avatar avatar-3"></div>
                            <div className="author-info">
                                <p className="author-name">ماريا ج.</p>
                                <p className="author-role">مختصة رعاية صحية</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <div className="section-header">
                    <h2 className="section-title">أسئلة واستفسارات</h2>
                    <p className="section-subtitle">إجابات على أكثر الأسئلة شيوعاً</p>
                </div>
                <div className="faq-container">
                    <div className="faq-item">
                        <button className="faq-question">
                            <span>ما مدى دقة الحساب الذي أحصل عليه؟</span>
                            <svg className="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <div className="faq-answer">
                            <p>
                                نموذج الحساب لدينا مبني على علوم اكتوارية رائدة تم اختبارها بدقة، ويتم تحديث البيانات باستمرار، مما يضمن انعكاساً دقيقاً استثنائياً للمشهد التأميني الخاص بك. نحن نهدف إلى تقديم ليس مجرد تقدير، بل أساس لاتخاذ قرارات واثقة.
                            </p>
                        </div>
                    </div>
                    <div className="faq-item">
                        <button className="faq-question">
                            <span>هل يمكنني استكشاف سيناريوهات حياة مختلفة وحفظها؟</span>
                            <svg className="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <div className="faq-answer">
                            <p>
                                بالتأكيد. نشجعك على إنشاء حساب شخصي حيث يمكنك حفظ ومراجعة سيناريوهات حساب متعددة بسهولة. تم تصميم هذه الميزة لتمكينك من مقارنة مراحل حياة ومسارات مالية مختلفة، مما يتيح لك اتخاذ خيارات مستنيرة حقاً وفقاً لسرعتك الخاصة.
                            </p>
                        </div>
                    </div>
                    <div className="faq-item">
                        <button className="faq-question">
                            <span>كيف يتم حماية معلوماتي الشخصية والحساسة؟</span>
                            <svg className="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <div className="faq-answer">
                            <p>
                                خصوصيتك وأمانك هما أولويتنا القصوى. نستخدم تقنيات تشفير متطورة ونلتزم ببروتوكولات حماية بيانات صارمة. جميع بياناتك الشخصية يتم التعامل معها بسرية تامة ولا يتم مشاركتها مع أطراف ثالثة دون موافقتك الصريحة. راحة بالك تمتد إلى سلامة بياناتك معنا.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {!isAuthenticated && (
                <section className="cta-section">
                    <div className="cta-container">
                        <h2 className="cta-title">جاهز لبدء رحلتك نحو الوضوح المالي؟</h2>
                        <p className="cta-subtitle">انضم إلى آلاف الأشخاص الذين وجدوا الطمأنينة والثقة مع InsureCalc</p>
                        <button className="btn-primary cta-button" onClick={openRegister}>
                            <span>ابدأ مجاناً الآن</span>
                            <svg className="cta-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <h3>SafeRatio</h3>
                        <p>التغطية المناسبة القرار الصحيح</p>
                    </div>
                    <div className="footer-links">
                        <a className="footer-link" href="/about">حولنا</a>
                        <a className="footer-link" href="/contact">تواصل معنا</a>
                        <a className="footer-link" href="#">سياسة الخصوصية</a>
                        <a className="footer-link" href="#">شروط الخدمة</a>
                        <a className="footer-link" href="/faq">الأسئلة الشائعة</a>
                    </div>
                    <div className="footer-contact">
                        <p>contact@saferatio.com</p>
                        <p>+967 782 456 789</p>
                    </div>
                    <p className="footer-copyright">
                        © 2025 SafeRatio. جميع الحقوق محفوظة.
                    </p>
                </div>
            </footer>

            {/* Auth Modal */}
            <AuthModal 
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialView={authModalView}
            />
        </div>
    );
};

export default LandingPage;