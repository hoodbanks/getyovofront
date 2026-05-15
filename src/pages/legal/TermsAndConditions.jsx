import React, { useEffect } from 'react';
import Footer from '../../components/common/Footer';
import Hero from '../../components/common/Hero';

const TermsAndConditions = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white p-1 font-sans pb-0">
            <div className="max-w-[1440px] mx-auto">
                <Hero 
                    title="Terms and Conditions"
                    description="Understand your rights and responsibilities on our platform."
                    showPhones={false}
                    showLogo={true}
                    showDownload={true}
                    showMenu={true}
                />

                {/* Page Content */}
                <div className="py-20 px-2 max-w-4xl mx-auto">
                    <div className="space-y-12 text-zinc-700 leading-relaxed">
                        <div className="text-center mb-16">
                            <h2 className="text-xl md:text-3xl font-bold text-zinc-900 mb-2 uppercase">TERMS AND CONDITIONS OF USE</h2>
                            <p className="text-zinc-500 font-medium tracking-wide">Last updated 18/03/2026</p>
                        </div>

                        <section className="space-y-4">
                            <h3 className="text-xl font-bold text-zinc-900 border-l-4 border-[#1C5E20] pl-4">AGREEMENT TO OUR LEGAL TERMS</h3>
                            <p>We are <strong>GETYOVO LIMITED</strong>.</p>
                            <p>We operate, as well as any other related products and services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services").</p>
                            <p>You can contact us by email at: <strong>support@getyovo.app</strong></p>
                            <p>
                                These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and <strong>GETYOVO LIMITED</strong>, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. <span className="font-bold">IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</span>
                            </p>
                            <p>
                                Supplemental terms and conditions or documents that may be posted on the Services from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of these Legal Terms, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Legal Terms to stay informed of updates. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Legal Terms by your continued use of the Services after the date such revised Legal Terms are posted.
                            </p>
                            <p>We recommend that you print a copy of these Legal Terms for your records.</p>
                        </section>

                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 shadow-sm">
                            <h3 className="font-bold text-zinc-900 mb-6 uppercase tracking-widest text-sm">Table of Contents</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-semibold text-[#1C5E20]">
                                <li>1. OUR SERVICES</li>
                                <li>2. INTELLECTUAL PROPERTY RIGHTS</li>
                                <li>3. USER REPRESENTATIONS</li>
                                <li>4. PROHIBITED ACTIVITIES</li>
                                <li>5. USER GENERATED CONTRIBUTIONS</li>
                                <li>6. CONTRIBUTION LICENSE</li>
                                <li>7. SERVICES MANAGEMENT</li>
                                <li>8. TERM AND TERMINATION</li>
                                <li>9. MODIFICATIONS AND INTERRUPTIONS</li>
                                <li>10. DISPUTE RESOLUTION</li>
                                <li>11. CORRECTIONS</li>
                                <li>12. DISCLAIMER</li>
                                <li>13. LIMITATIONS OF LIABILITY</li>
                                <li>14. INDEMNIFICATION</li>
                                <li>15. USER DATA</li>
                                <li>16. ELECTRONIC COMMUNICATIONS</li>
                                <li>17. MISCELLANEOUS</li>
                                <li>18. CONTACT US</li>
                            </ul>
                        </div>

                        <div className="space-y-16">
                            <section>
                                <h3 className="text-xl font-bold text-zinc-900 mb-6">1. OUR SERVICES</h3>
                                <p>
                                    The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-zinc-900 mb-6">2. INTELLECTUAL PROPERTY RIGHTS</h3>
                                <div className="space-y-6">
                                    <div>
                                        <p className="font-bold text-zinc-900 mb-2">Our intellectual property</p>
                                        <p>
                                            We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").
                                        </p>
                                        <p>
                                            Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties around the world.
                                        </p>
                                        <p>
                                            The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use or internal business purpose only.
                                        </p>
                                    </div>

                                    <div>
                                        <p className="font-bold text-zinc-900 mb-2">Your use of our Services</p>
                                        <p className="mb-4">
                                            Subject to your compliance with these Legal Terms, including the "PROHIBITED ACTIVITIES" section below, we grant you a non-exclusive, non-transferable, revocable license to:
                                        </p>
                                        <ul className="list-disc pl-6 space-y-2">
                                            <li>access the Services; and</li>
                                            <li>download or print a copy of any portion of the Content to which you have properly gained access, solely for your personal, non-commercial use or internal business purpose.</li>
                                        </ul>
                                        <p>
                                            Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
                                        </p>
                                    </div>

                                    <div>
                                        <p className="font-bold text-zinc-900 mb-2">Your submissions</p>
                                        <p>
                                            By directly sending us any question, comment, suggestion, idea, feedback, or other information about the Services ("Submissions"), you agree to assign to us all intellectual property rights in such Submission. You agree that we shall own this Submission and be entitled to its unrestricted use and dissemination for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-zinc-900 mb-6">3. USER REPRESENTATIONS</h3>
                                <p>
                                    By using the Services, you represent and warrant that: (1) you have the legal capacity and you agree to comply with these Legal Terms; (2) you are not a minor in the jurisdiction in which you reside; (3) you will not access the Services through automated or non-human means, whether through a bot, script or otherwise; (4) you will not use the Services for any illegal or unauthorized purpose; and (5) your use of the Services will not violate any applicable law or regulation.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-zinc-900 mb-6">4. PROHIBITED ACTIVITIES</h3>
                                <p className="mb-4">
                                    You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                                </p>
                                <p className="mb-4">As a user of the Services, you agree not to:</p>
                                <ul className="list-disc pl-6 space-y-3">
                                    <li>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                                    <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
                                    <li>Circumvent, disable, or otherwise interfere with security-related features of the Services.</li>
                                    <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</li>
                                    <li>Use any information obtained from the Services in order to harass, abuse, or harm another person.</li>
                                    <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
                                    <li>Use the Services in a manner inconsistent with any applicable laws or regulations.</li>
                                    <li>Engage in unauthorized framing of or linking to the Services.</li>
                                    <li>Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material.</li>
                                    <li>Delete the copyright or other proprietary rights notice from any Content.</li>
                                    <li>Attempt to impersonate another user or person.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-zinc-900 mb-6">10. DISPUTE RESOLUTION</h3>
                                <div className="space-y-6">
                                    <div>
                                        <p className="font-bold text-zinc-900 mb-2">Binding Arbitration</p>
                                        <p>
                                            Any dispute arising out of or in connection with these Legal Terms, including any question regarding its existence, validity, or termination, shall be referred to and finally resolved by the International Commercial Arbitration Court under the European Arbitration Chamber (Belgium, Brussels, Avenue Louise, 146) according to the Rules of this ICAC. The seat, or legal place, or arbitration shall be <strong>Awka City Anambra State, Nigeria</strong>. The language of the proceedings shall be English. The governing law of these Legal Terms shall be substantive law of NDPA (Nigeria Data Protection Regulation).
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-zinc-900 mb-6">12. DISCLAIMER</h3>
                                <p className="uppercase text-sm leading-relaxed">
                                    THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-zinc-900 mb-6">18. CONTACT US</h3>
                                <p>
                                    In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at: <strong>getyovo.app</strong>
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default TermsAndConditions;
