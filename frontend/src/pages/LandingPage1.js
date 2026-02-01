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
                    <h1 className="hero-title">Embrace Tomorrow with Confidence.</h1>
                    <p className="hero-subtitle">
                        Discover the peace of mind that comes with tailored protection. Our intuitive tool helps you
                        understand your needs, so you can live fully, today and beyond.
                    </p>
                    {!isAuthenticated && (
                        <button className="btn-primary hero-cta" onClick={openRegister}>
                            <span>Start Your Journey to Clarity</span>
                        </button>
                    )}
                </div>
            </section>

                        {/* Registration Types Section */}
            {!isAuthenticated && (
                <section className="registration-types">
                    <div className="container">
                        <h2 className="section-title">Choose Your Account Type</h2>
                        <p className="section-subtitle">
                            Get started with the right insurance solution for your needs
                        </p>
                        
                        <div className="type-cards">
                            <div className="type-card" onClick={() => {
                                // Pass individual as user_type
                                const url = new URL(window.location);
                                url.searchParams.set('user_type', 'individual');
                                window.history.pushState({}, '', url);
                                openRegister();
                            }}>
                                <div className="type-icon">👤</div>
                                <h3>Individual Account</h3>                                
                                <p>Perfect for personal insurance needs</p>
                                <ul>
                                    <li>Car & Vehicle Insurance</li>
                                </ul>
                                <button className="type-select-btn">SignUp as Individual</button>
                            </div>
                            
                            <div className="type-card" onClick={() => {
                                // Pass organization as user_type
                                const url = new URL(window.location);
                                url.searchParams.set('user_type', 'organization');
                                window.history.pushState({}, '', url);
                                openRegister();
                            }}>
                                <div className="type-icon">🏢</div>
                                <h3>Organization Account</h3>
                                <p>Ideal for businesses and companies</p>
                                <ul>
                                    <li>Employee Health Plans</li>
                                </ul>
                                <button className="type-select-btn">SignUp as Organization</button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Features Section */}
            <section className="features-section">
                <h2 className="section-title">A Foundation for Your Future</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <span className="material-symbols-outlined">insights</span>
                        </div>
                        <h3 className="feature-title">Precision You Can Trust</h3>
                        <p className="feature-description">
                            Our advanced algorithms consider every nuance of your life, providing an estimate that truly reflects your unique circumstances. No more guesswork, just clear, actionable insights for your financial well-being.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <span className="material-symbols-outlined">📑</span>
                        </div>
                        <h3 className="feature-title">Craft Your Ideal Scenario</h3>
                        <p className="feature-description">
                            Life is dynamic, and your plans should be too. Save and compare different coverage options, adapting as your dreams and responsibilities evolve. Empowering you to make choices that resonate with your aspirations.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <span className="material-symbols-outlined">⬇️</span>
                        </div>
                        <h3 className="feature-title">Your Personalized Blueprint</h3>
                        <p className="feature-description">
                            Receive a beautifully designed, comprehensive report detailing your insurance needs. This personal blueprint is yours to keep, share, and review, ensuring you're always informed and confident in your decisions.
                        </p>
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="process-section">
                <h2 className="section-title">Your Journey, Simplified</h2>
                <div className="process-container">
                    <div className="process-line"></div>
                    <div className="process-steps">
                        <div className="process-step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3 className="step-title">Share Your Story</h3>
                                <p className="step-description">
                                    Begin by securely providing a few details about your life and financial goals. Our platform is designed to understand your unique aspirations, making the calculation truly personal.
                                </p>
                            </div>
                        </div>
                        <div className="process-step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3 className="step-title">Uncover Your Potential</h3>
                                <p className="step-description">
                                    Instantly see a clear, comprehensive overview of your insurance needs. Explore various options and scenarios, empowering you to visualize a secure future.
                                </p>
                            </div>
                        </div>
                        <div className="process-step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3 className="step-title">Secure Your Legacy</h3>
                                <p className="step-description">
                                    Download a personalized report that encapsulates your tailored recommendations. This valuable document helps you take confident next steps towards lasting peace of mind.
                                </p>
                            </div>
                        </div>
                        <div className="process-step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <h3 className="step-title">Expert Guidance (Optional)</h3>
                                <p className="step-description">
                                    Should you desire, seamlessly connect with trusted advisors who can further illuminate your path and help implement your personalized insurance strategy.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <h2 className="section-title">Voices of Confidence</h2>
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <p className="testimonial-text">
                            "InsureCalc made understanding my family's future so much clearer. The process was surprisingly enjoyable, and I feel truly prepared. A weight has been lifted."
                        </p>
                        <div className="testimonial-author">
                            <div className="author-avatar"></div>
                            <div className="author-info">
                                <p className="author-name">Sarah L.</p>
                                <p className="author-role">Marketing Executive</p>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-card">
                        <p className="testimonial-text">
                            "As a small business owner, planning for the unexpected is crucial. InsureCalc offered insights I hadn't considered, all presented with such clarity and elegance."
                        </p>
                        <div className="testimonial-author">
                            <div className="author-avatar"></div>
                            <div className="author-info">
                                <p className="author-name">David R.</p>
                                <p className="author-role">Entrepreneur</p>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-card">
                        <p className="testimonial-text">
                            "I used to find insurance daunting, but InsureCalc's approach felt so empowering. It's more than a tool; it's a partner in securing my peace of mind."
                        </p>
                        <div className="testimonial-author">
                            <div className="author-avatar"></div>
                            <div className="author-info">
                                <p className="author-name">Maria G.</p>
                                <p className="author-role">Healthcare Professional</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <h2 className="section-title">Questions & Reflections</h2>
                <div className="faq-container">
                    <details className="faq-item" open>
                        <summary className="faq-question">
                            How deeply can I trust the accuracy of my calculation?
                            <span className="material-symbols-outlined">expand_more</span>
                        </summary>
                        <p className="faq-answer">
                            Our calculation model is built upon rigorously tested, industry-leading actuarial science and constantly updated data, ensuring an exceptionally precise reflection of your insurance landscape. We aim to offer you not just an estimate, but a foundation for confident decision-making.
                        </p>
                    </details>
                    <details className="faq-item">
                        <summary className="faq-question">
                            Is it possible to explore different life scenarios and save them?
                            <span className="material-symbols-outlined">expand_more</span>
                        </summary>
                        <p className="faq-answer">
                            Absolutely. We encourage you to create a personalized account where you can effortlessly save and revisit multiple calculation scenarios. This feature is designed to empower you to compare various life stages and financial pathways, making truly informed choices at your own pace.
                        </p>
                    </details>
                    <details className="faq-item">
                        <summary className="faq-question">
                            How is my personal and sensitive information protected?
                            <span className="material-symbols-outlined">expand_more</span>
                        </summary>
                        <p className="faq-answer">
                            Your privacy and security are paramount. We employ state-of-the-art encryption technologies and adhere to stringent data protection protocols. All your personal data is handled with the utmost confidentiality and is never shared with third parties without your explicit consent. Your peace of mind extends to your data's safety with us.
                        </p>
                    </details>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-links">
                        <a className="footer-link" href="#">Privacy Policy</a>
                        <a className="footer-link" href="#">Terms of Service</a>
                        <a className="footer-link" href="#">Contact Us</a>
                    </div>
                    <p className="footer-copyright">
                        © 2024 InsureCalc. All rights reserved. Crafting peace of mind, elegantly.
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