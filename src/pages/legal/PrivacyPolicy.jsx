import React, { useEffect } from 'react';
import Footer from '../../components/common/Footer';
import Hero from '../../components/common/Hero';

const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white p-1 font-sans pb-0">
            <div className="max-w-[1440px] mx-auto">
                <Hero 
                    title="Privacy Policy"
                    description="Your privacy matters to us. Learn how we handle and protect your data."
                    showPhones={false}
                    showLogo={true}
                    showDownload={true}
                    showMenu={true}
                />

                {/* Page Content */}
                <div className="py-20 px-2 max-w-4xl mx-auto">
                    <div className="space-y-12 text-zinc-700 leading-relaxed">
                        <div className="text-center mb-16">
                            <h2 className="text-xl md:text-3xl font-bold text-zinc-900 mb-2 uppercase">PRIVACY POLICY</h2>
                            <p className="text-zinc-500 font-medium tracking-wide">Last updated March 18, 2026</p>
                        </div>

                        <section className="space-y-4">
                            <p>
                                This Privacy Policy for <strong>GETYOVO LIMITED</strong> describes how and why we might access, collect, store, use, and/or share ("process") your personal information when you use our services ("Services"), including when you:
                            </p>
                            <ul className="list-disc pl-6 space-y-4">
                                <li>Visit our website at <strong>Getyovonow.com</strong> or any website of ours that links to this Privacy Policy</li>
                                <li>Download and use our mobile application (<strong>Getyovo</strong>), or any other application of ours that links to this Privacy Notice</li>
                                <li>Use <strong>Getyovo</strong>. A platform designed to offer delivery services for food, groceries, products and other day to day needs/wants. The services we offer ensures our users obtain their daily life essentials within their comfort zones, thereby making lives easier for them. Our platform can be used from offices, schools and various organizations for ordering your day-to-day items!!!</li>
                                <li>Engage with us in other related ways, including any marketing or events</li>
                            </ul>
                            <p>
                                <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <strong>getyovo.app</strong>.
                            </p>
                        </section>

                        <div className="bg-[#EEF2EF] p-4 rounded-xl border border-[#225B28]/10 shadow-sm">
                            <h3 className="text-xl font-bold text-[#0C3D2A] mb-6 uppercase tracking-wider">Summary of Key Points</h3>
                            <div className="grid gap-6 text-sm">
                                <p><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services.</p>
                                <p><strong>Do we process any sensitive personal information?</strong> No, we do not process sensitive personal information.</p>
                                <p><strong>Do we collect any information from third parties?</strong> No, we do not collect any information from third parties.</p>
                                <p><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</p>
                            </div>
                        </div>

                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 shadow-sm">
                            <h3 className="font-bold text-zinc-900 mb-6 uppercase tracking-widest text-sm">Table of Contents</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-semibold text-[#1C5E20]">
                                <li>1. WHAT INFORMATION DO WE COLLECT?</li>
                                <li>2. HOW DO WE PROCESS YOUR INFORMATION?</li>
                                <li>3. WHEN AND WITH WHOM DO WE SHARE YOUR INFO?</li>
                                <li>4. COOKIES AND TRACKING TECHNOLOGIES</li>
                                <li>5. HOW LONG DO WE KEEP YOUR INFO?</li>
                                <li>6. HOW DO WE KEEP YOUR INFO SAFE?</li>
                                <li>7. DO WE COLLECT INFO FROM MINORS?</li>
                                <li>8. WHAT ARE YOUR PRIVACY RIGHTS?</li>
                                <li>9. CONTROLS FOR DO-NOT-TRACK FEATURES</li>
                                <li>10. DO WE MAKE UPDATES TO THIS NOTICE?</li>
                                <li>11. HOW CAN YOU CONTACT US?</li>
                                <li>12. REVIEW, UPDATE, OR DELETE YOUR DATA</li>
                            </ul>
                        </div>

                        <div className="space-y-16">
                            <section>
                                <h3 className="text-xl font-bold text-zinc-900 mb-6">1. WHAT INFORMATION DO WE COLLECT?</h3>
                                <div className="space-y-4">
                                    <p className="font-bold text-zinc-900">Personal information you disclose to us</p>
                                    <p>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us, or when you contact us.</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Names</li>
                                        <li>Phone Numbers</li>
                                        <li>Email Addresses</li>
                                        <li>Usernames</li>
                                        <li>Passwords</li>
                                    </ul>
                                    <p className="italic">We do not process sensitive information.</p>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-zinc-900 mb-6">2. HOW DO WE PROCESS YOUR INFORMATION?</h3>
                                <p className="mb-4 text-zinc-500 italic">In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</p>
                                <ul className="space-y-4">
                                    <li className="flex gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1C5E20] mt-2 shrink-0"></div>
                                        <span><strong>To facilitate account creation and authentication:</strong> We process your information so you can create and log in to your account.</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1C5E20] mt-2 shrink-0"></div>
                                        <span><strong>To deliver services:</strong> We process your information to provide you with the requested service.</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1C5E20] mt-2 shrink-0"></div>
                                        <span><strong>To fulfill and manage orders:</strong> We may process your information to fulfill and manage your orders, payments, and exchanges.</span>
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-zinc-900 mb-6">6. HOW DO WE KEEP YOUR INFORMATION SAFE?</h3>
                                <p>
                                    We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-zinc-900 mb-6">7. DO WE COLLECT INFORMATION FROM MINORS?</h3>
                                <p className="font-medium text-[#1C5E20]">
                                    The app is for Users from ages 18 years and above.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-zinc-900 mb-6">11. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h3>
                                <div className="space-y-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                    <p>If you have questions or comments about this notice, you may email us at <strong>getyovo.app</strong>.</p>
                                    <div>
                                        <p className="font-bold text-zinc-900">GETYOVO LIMITED</p>
                                        <p>Awka City, Anambra State</p>
                                        <p>Nigeria.</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
