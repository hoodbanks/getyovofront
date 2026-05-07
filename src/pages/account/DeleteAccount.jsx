import React, { useEffect } from 'react';
import Footer from '../../components/common/Footer';
import Hero from '../../components/common/Hero';

const DeleteAccount = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white p-1 font-sans pb-0">
            <div className="max-w-[1440px] mx-auto">
                <Hero 
                    title="Delete Your Account"
                    description="At Getyovo, we respect your right to control your personal data."
                    showPhones={false}
                    showLogo={true}
                    showDownload={true}
                    showMenu={true}
                />

                <div className="py-20 px-2 max-w-4xl mx-auto">
                    <div className="space-y-12 text-zinc-700 leading-relaxed">
                        <div className="text-center mb-16">
                            <h2 className="text-xl md:text-3xl font-bold text-zinc-900 mb-2 uppercase">DELETE YOUR ACCOUNT</h2>
                            <p className="text-zinc-500 font-medium tracking-wide">Take control of your personal data</p>
                        </div>

                        <section className="space-y-4">
                            <p>
                                At Getyovo, we respect your right to control your personal data. If you wish to delete your account and associated data, please follow the steps below.
                            </p>
                        </section>

                        <div className="space-y-16">
                            <section>
                                <h3 className="text-xl font-bold text-zinc-900 mb-6">How to Delete Your Account</h3>
                                <ol className="list-decimal pl-6 space-y-2">
                                    <li>Open the Getyovo app on your device</li>
                                    <li>Log in to your account</li>
                                    <li>Tap on Profile at the bottom of the screen</li>
                                    <li>Scroll down and tap Delete Account</li>
                                    <li>Confirm your decision when prompted</li>
                                </ol>
                                <p className="mt-4 italic text-zinc-500">Your account deletion request will be processed within 30 days.</p>
                                <div className="mt-6 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                    <p>Alternatively, you can request account deletion by contacting us at:</p>
                                    <p className="font-bold text-zinc-900 mt-2">📧 support@getyovo.app</p>
                                    <p>with the subject line: "Account Deletion Request"</p>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-zinc-900 mb-6">What Data Gets Deleted</h3>
                                <p className="mb-4">When you delete your account, the following data will be permanently removed:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Your name, phone number and profile information</li>
                                    <li>Your saved delivery addresses</li>
                                    <li>Your cart and wishlist items</li>
                                    <li>Your device tokens and notification preferences</li>
                                    <li>Your account login credentials</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-zinc-900 mb-6">What Data Is Retained</h3>
                                <p className="mb-4">For legal and business compliance purposes, the following data may be retained for up to 90 days after deletion:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Order history and transaction records</li>
                                    <li>Payment references (required for financial auditing)</li>
                                    <li>Any data required by Nigerian law or financial regulations</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-zinc-900 mb-6">Contact Us</h3>
                                <p>If you have any questions about your data or the deletion process, please contact us at:</p>
                                <div className="mt-4 space-y-2 font-medium">
                                    <p>📧 support@getyovo.app</p>
                                    <p>🌐 getyovo.app</p>
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

export default DeleteAccount;
