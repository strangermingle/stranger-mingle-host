import type { Metadata } from "next";
import {
    Shield,
    Lock,
    Eye,
    Users,
    Globe,
    Cookie,
    Camera,
    Scale,
    Mail,
    Bell,
    Database,
    RefreshCw,
    ExternalLink,
    AlertTriangle,
    Baby,
    Ticket,
    IndianRupee
} from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy | Stranger Mingle — India's Event Ticketing Platform",
    description: "Read Stranger Mingle's Privacy Policy to understand how we collect, use, and protect your personal information as an event organiser or attendee on our platform.",
    alternates: {
        canonical: "/privacy-policy",
    },
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-4xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
                {/* Hero Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-6">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        Legal &amp; Compliance
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-600 pb-2">
                        Privacy Policy
                    </h1>
                    <p className="text-gray-500 max-w-xl mx-auto text-lg">
                        How Stranger Mingle collects, uses, and protects your personal information — whether you are an event organiser or an attendee.
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-pink-600 mx-auto rounded-full mt-6"></div>
                </div>

                <div className="space-y-8">
                    {/* Last Updated & Intro */}
                    <div className="bg-orange-500 p-8 rounded-3xl shadow-lg text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <p className="font-semibold text-lg mb-2 text-orange-100">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                            <p className="leading-relaxed text-lg text-orange-50">
                                <strong>Stranger Mingle</strong> is a brand owned and operated by <strong>Salty Media Production (opc) Pvt Ltd</strong>.
                                This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our event ticketing platform — whether you are browsing events as an attendee, purchasing tickets, or creating and selling event tickets as an organiser.
                            </p>
                        </div>
                    </div>

                    {/* Our Commitment */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 shrink-0">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Your Privacy</h2>
                                <p className="leading-relaxed mb-4 text-gray-600">
                                    We believe in full transparency about how your data is used. <strong>Salty Media Production (opc) Pvt Ltd</strong> collects only the information necessary to operate Stranger Mingle as a safe, reliable event ticketing and discovery platform. We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
                                </p>
                                <p className="leading-relaxed text-gray-600">
                                    This policy applies to all users of Stranger Mingle — attendees who browse and book event tickets, and organisers who create events and sell tickets through our platform. By using Stranger Mingle, you agree to the collection and use of information as described in this policy.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Information We Collect */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shrink-0">
                                <Database className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Information We Collect</h2>

                                <div className="space-y-8">
                                    <div className="bg-gray-50 p-6 rounded-2xl">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">From Attendees — When You Register or Book a Ticket</h3>
                                        <p className="mb-3 leading-relaxed text-gray-600">When you create an account or purchase a ticket on Stranger Mingle, we collect:</p>
                                        <ul className="space-y-2 text-gray-600">
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2.5 shrink-0"></div>
                                                <span><strong>Basic Details:</strong> Full name, email address, phone number, city of residence</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2.5 shrink-0"></div>
                                                <span><strong>Profile Information:</strong> Age, gender, interests, brief bio (optional)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2.5 shrink-0"></div>
                                                <span><strong>Ticket &amp; Booking Data:</strong> Events booked, ticket types selected, booking history</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2.5 shrink-0"></div>
                                                <span><strong>Profile Photo:</strong> Optional, to help event organisers identify participants</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-2xl">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">From Organisers — When You Create Events and Sell Tickets</h3>
                                        <p className="mb-3 leading-relaxed text-gray-600">When you register as an event organiser on Stranger Mingle, we additionally collect:</p>
                                        <ul className="space-y-2 text-gray-600">
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2.5 shrink-0"></div>
                                                <span><strong>KYC &amp; Verification Data:</strong> Government-issued ID details for organiser verification (stored securely, not shared publicly)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2.5 shrink-0"></div>
                                                <span><strong>Bank &amp; Payment Details:</strong> Bank account or UPI information for disbursing ticket sale earnings to you</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2.5 shrink-0"></div>
                                                <span><strong>Event Information:</strong> Events created, ticket tiers, pricing, venue details, attendee data for your events</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2.5 shrink-0"></div>
                                                <span><strong>Business Details:</strong> Organisation name, GST number (if applicable), social media handles</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Payment Information</h3>
                                        <ul className="space-y-2 text-gray-600 pl-4 border-l-2 border-gray-100">
                                            <li>Transaction details and payment history for ticket purchases</li>
                                            <li>Payment method information (UPI ID, card type) — processed through secure third-party payment gateways</li>
                                            <li>We do not store complete debit/credit card numbers on our servers</li>
                                            <li>Payout records for organiser earnings from ticket sales</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Communication Data</h3>
                                        <ul className="space-y-2 text-gray-600 pl-4 border-l-2 border-gray-100">
                                            <li>Messages sent to our support team or event organisers</li>
                                            <li>Email and WhatsApp correspondence related to ticket bookings and events</li>
                                            <li>Responses to surveys or post-event feedback forms</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Technical and Usage Information</h3>
                                        <ul className="space-y-2 text-gray-600 pl-4 border-l-2 border-gray-100">
                                            <li>IP address, browser type, and device information</li>
                                            <li>Pages visited on our website, events browsed, and time spent</li>
                                            <li>Referring website or source that directed you to us</li>
                                            <li>Technical logs for maintaining platform security and preventing abuse</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Location Information</h3>
                                        <ul className="space-y-2 text-gray-600 pl-4 border-l-2 border-gray-100">
                                            <li>City and general location so we can show you relevant events in your area</li>
                                            <li>We do not track your real-time GPS location</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Information */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 shrink-0">
                                <Eye className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">2. How We Use Your Information</h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-orange-50 p-5 rounded-2xl">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">To Operate the Ticketing Platform</h3>
                                        <ul className="space-y-2 text-gray-600 text-sm">
                                            <li>• Process ticket purchases and issue QR-coded digital tickets</li>
                                            <li>• Send booking confirmations, reminders, and event updates</li>
                                            <li>• Enable organisers to manage attendee lists and scan tickets at entry</li>
                                            <li>• Disburse ticket sale earnings to verified organisers</li>
                                        </ul>
                                    </div>

                                    <div className="bg-orange-50 p-5 rounded-2xl">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Safety &amp; Organiser Verification</h3>
                                        <ul className="space-y-2 text-gray-600 text-sm">
                                            <li>• Verify organiser identity via KYC before events go live</li>
                                            <li>• Prevent ticket fraud, duplicate bookings, and platform abuse</li>
                                            <li>• Enforce our community guidelines and organiser policies</li>
                                            <li>• Protect attendees from fraudulent or unverified events</li>
                                        </ul>
                                    </div>

                                    <div className="bg-orange-50 p-5 rounded-2xl">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Communication</h3>
                                        <ul className="space-y-2 text-gray-600 text-sm">
                                            <li>• Send notifications about upcoming events in your city</li>
                                            <li>• Respond to attendee and organiser support requests</li>
                                            <li>• Share important policy or platform updates</li>
                                            <li>• Request post-event feedback to improve quality</li>
                                        </ul>
                                    </div>

                                    <div className="bg-orange-50 p-5 rounded-2xl">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Platform Promotion</h3>
                                        <ul className="space-y-2 text-gray-600 text-sm">
                                            <li>• Send newsletters about featured events (opt-out available)</li>
                                            <li>• Promote verified organiser events on our discovery pages</li>
                                            <li>• Display event photos and highlights (with consent)</li>
                                        </ul>
                                    </div>

                                    <div className="bg-orange-50 p-5 rounded-2xl">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics &amp; Improvement</h3>
                                        <ul className="space-y-2 text-gray-600 text-sm">
                                            <li>• Analyse platform usage to improve features</li>
                                            <li>• Understand which event categories are popular city-wise</li>
                                            <li>• Identify and fix technical issues on the platform</li>
                                        </ul>
                                    </div>

                                    <div className="bg-orange-50 p-5 rounded-2xl">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Legal &amp; Financial Compliance</h3>
                                        <ul className="space-y-2 text-gray-600 text-sm">
                                            <li>• Comply with Indian tax and GST regulations</li>
                                            <li>• Maintain financial records of ticket transactions</li>
                                            <li>• Protect platform rights and respond to legal obligations</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How We Share Information */}
                    <section className="bg-gradient-to-br from-orange-50 to-pink-50 p-8 rounded-3xl border border-orange-100 relative overflow-hidden">
                        <div className="relative z-10 flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-orange-600 shrink-0 shadow-sm">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Share Your Information</h2>
                                <p className="mb-6 leading-relaxed font-semibold text-orange-900 bg-orange-100/60 p-4 rounded-xl border border-orange-200">
                                    We do not sell, rent, or trade your personal information to third parties for their marketing purposes — ever.
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Between Attendees and Organisers</h3>
                                        <p className="leading-relaxed text-gray-700">
                                            When you book a ticket, your name and contact details are shared with the event organiser for the purpose of attendee check-in, communication about the event, and entry verification using our QR scanning system. Organisers are bound by our platform policies and cannot use your data for any other purpose.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">With Payment and Payout Service Providers</h3>
                                        <p className="leading-relaxed text-gray-700">
                                            We share necessary information with trusted payment gateways (such as Razorpay, Cashfree, or similar Indian payment processors) to process ticket purchases and disburse organiser earnings via UPI or bank transfer. These providers are governed by their own privacy policies and comply with Indian payment regulations.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">With Infrastructure and Platform Service Providers</h3>
                                        <p className="leading-relaxed text-gray-700">
                                            We work with cloud hosting, SMS, email, and analytics service providers to operate the platform. These providers are bound by confidentiality agreements and can only use your data to provide services to Stranger Mingle — not for any independent purpose.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">For Legal Reasons</h3>
                                        <p className="leading-relaxed text-gray-700">
                                            We may disclose your information if required by law, court order, or a government authority in India, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of other users.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">In Case of Business Transfer</h3>
                                        <p className="leading-relaxed text-gray-700">
                                            If Stranger Mingle is acquired, merged, or transfers assets, your data may be transferred to the new entity. We will notify you and give you options regarding your personal information in such an event.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">With Your Explicit Consent</h3>
                                        <p className="leading-relaxed text-gray-700">
                                            We may share your information with third parties only when you have explicitly authorised us to do so.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Data Storage and Security */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 shrink-0">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Storage and Security</h2>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">How We Protect Your Data</h3>
                                        <p className="mb-3 leading-relaxed text-gray-600">
                                            We implement appropriate technical and organisational measures to protect your personal information on our ticketing platform:
                                        </p>
                                        <ul className="space-y-2 text-gray-600 pl-4 border-l-2 border-teal-100">
                                            <li>Encryption of sensitive data — including payment details and KYC documents — in transit and at rest</li>
                                            <li>Secure servers with restricted, role-based access controls</li>
                                            <li>Encrypted QR tickets to prevent ticket duplication or fraud</li>
                                            <li>Regular security audits and vulnerability updates</li>
                                            <li>Limited access to personal information on a strict need-to-know basis</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Retention</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            We retain your personal information only as long as necessary to fulfil the purposes outlined in this policy or as required by Indian law. Ticket transaction records and organiser payout data are typically retained for up to 7 years for financial compliance purposes. You may request deletion of your account and profile data at any time, subject to applicable legal retention requirements.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Storage Location</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            Your data is stored on secure servers located in India. Where we use international service providers, we ensure appropriate data transfer safeguards are in place and that Indian data protection laws are respected.
                                        </p>
                                    </div>

                                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 flex gap-3">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                        <p className="leading-relaxed font-semibold text-gray-800 text-sm">
                                            <strong>Important:</strong> While we implement strong security measures, no method of internet transmission or electronic storage is 100% secure. We cannot guarantee the absolute security of your information, and you use our platform at your own discretion.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Ticket Data & Organiser Responsibilities */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 shrink-0">
                                <Ticket className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Ticket Data and Organiser Responsibilities</h2>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    When attendees book tickets for your event, you as the organiser will have access to attendee names and contact information through your Stranger Mingle dashboard. This data is provided solely for the purpose of managing check-in, communicating essential event updates, and delivering the experience promised in your event listing.
                                </p>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    Organisers must not use attendee data obtained through Stranger Mingle for any external marketing, third-party sharing, or purposes beyond the specific event. Misuse of attendee data is a violation of our organiser agreement and may result in immediate account suspension.
                                </p>
                                <p className="leading-relaxed text-gray-600">
                                    Stranger Mingle is not responsible for how individual organisers manage attendee interactions outside of our official platform. Attendees are encouraged to report any misuse of their data to us directly.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Your Rights */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-50 rounded-2xl text-red-600 shrink-0">
                                <Scale className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Your Rights and Choices</h2>

                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                        <h3 className="font-bold text-gray-900 mb-2">Access &amp; Update</h3>
                                        <p className="text-sm text-gray-600">View and update your profile or organiser information at any time via your account settings.</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                        <h3 className="font-bold text-gray-900 mb-2">Delete Account</h3>
                                        <p className="text-sm text-gray-600">Request full account deletion at any time. Some transaction records may be retained for legal compliance.</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                        <h3 className="font-bold text-gray-900 mb-2">Opt Out of Marketing</h3>
                                        <p className="text-sm text-gray-600">Unsubscribe from promotional emails and notifications at any time. Transactional ticket communications will continue.</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                        <h3 className="font-bold text-gray-900 mb-2">Data Portability</h3>
                                        <p className="text-sm text-gray-600">Request a copy of your personal data, including your ticket booking history, in a machine-readable format.</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                        <h3 className="font-bold text-gray-900 mb-2">Object or Withdraw Consent</h3>
                                        <p className="text-sm text-gray-600">Object to specific data processing activities or withdraw previously given consent where applicable.</p>
                                    </div>
                                </div>

                                <div className="bg-orange-50 p-4 rounded-xl text-orange-900 text-sm border border-orange-100">
                                    <p className="leading-relaxed">
                                        <strong>To exercise any of these rights,</strong> contact us at <strong>strangermingleteam@gmail.com</strong> or through our official support form. We will respond to your request within 30 days.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Cookies and Tracking */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 shrink-0">
                                <Cookie className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>

                                <div className="space-y-4">
                                    <p className="leading-relaxed text-gray-600">
                                        We use cookies and similar tracking technologies to improve your browsing and booking experience on Stranger Mingle. Cookies help us remember your city preference, maintain your login session, and show you events relevant to your interests.
                                    </p>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Types of Cookies We Use</h3>
                                        <ul className="space-y-2 text-gray-600 pl-4 border-l-2 border-orange-100">
                                            <li><strong>Essential Cookies:</strong> Required for login sessions, ticket checkout flow, and platform security</li>
                                            <li><strong>Functional Cookies:</strong> Remember your city, language, and event category preferences</li>
                                            <li><strong>Analytics Cookies:</strong> Help us understand how visitors discover and browse events (via Google Analytics or similar)</li>
                                            <li><strong>Marketing Cookies:</strong> Used to show relevant event promotions to you on other platforms (where applicable)</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Managing Cookies</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            You can control and delete cookies through your browser settings. Note that disabling essential cookies may affect your ability to browse events or complete ticket purchases on Stranger Mingle.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Third-Party Services */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-50 rounded-2xl text-gray-600 shrink-0">
                                <ExternalLink className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Services and Links</h2>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    Our platform integrates with third-party services including Indian payment gateways, map services, WhatsApp for ticket delivery, and social media platforms for event promotion. We are not responsible for the privacy practices of these external services.
                                </p>
                                <p className="leading-relaxed text-gray-600">
                                    We encourage you to review the privacy policies of any third-party services you access through or in connection with Stranger Mingle. This Privacy Policy applies only to information collected directly by Stranger Mingle and Salty Media Production (opc) Pvt Ltd.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Children's Privacy */}
                    <section className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-blue-600 shrink-0 shadow-sm">
                                <Baby className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
                                <p className="leading-relaxed text-gray-700">
                                    Stranger Mingle is intended for users aged 18 and above. We do not knowingly collect personal information from anyone under 18 years of age. Minors may attend family-friendly events only when accompanied by a verified adult attendee. If we discover that we have inadvertently collected data from a minor, we will delete it immediately. Please contact us if you believe a minor&apos;s data has been collected.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Photography and Media Consent */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-pink-50 rounded-2xl text-pink-600 shrink-0">
                                <Camera className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Photography and Media at Events</h2>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    Events listed on Stranger Mingle may be photographed or recorded by the event organiser for promotional purposes — both for the organiser&apos;s own channels and for Stranger Mingle&apos;s platform marketing. By booking a ticket and attending an event, you consent to being photographed and to the reasonable use of such images on Stranger Mingle&apos;s website, social media, and promotional materials.
                                </p>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    If you do not wish to be photographed, please inform the event organiser at the start of the event. We and our organisers will make reasonable efforts to accommodate such requests.
                                </p>
                                <p className="leading-relaxed text-gray-600">
                                    You can request removal of specific photos featuring you by contacting us at strangermingleteam@gmail.com. We will remove them from our official platforms. Please note we cannot control images shared independently by other attendees on their personal social media.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* International Users */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shrink-0">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Users</h2>
                                <p className="leading-relaxed text-gray-600">
                                    Stranger Mingle is a platform built for and operating primarily within India. If you are accessing our services from outside India, please be aware that your information will be transferred to, stored, and processed in India in accordance with Indian law. By using Stranger Mingle, you consent to the transfer and processing of your information under Indian jurisdiction.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Changes to Privacy Policy */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-50 rounded-2xl text-gray-600 shrink-0">
                                <RefreshCw className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    We may update this Privacy Policy from time to time to reflect changes in our platform features, legal requirements, or data practices. We will notify you of material changes by:
                                </p>
                                <ul className="space-y-2 text-gray-600 pl-4 border-l-2 border-gray-100">
                                    <li>Posting the updated policy on this page with a revised &quot;Last Updated&quot; date</li>
                                    <li>Sending an email notification to registered members for significant changes</li>
                                    <li>Displaying a prominent notice on our platform homepage</li>
                                </ul>
                                <p className="leading-relaxed text-gray-600 mt-4">
                                    Your continued use of Stranger Mingle after any such update indicates your acceptance of the revised Privacy Policy. We encourage you to review this page periodically.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Data Breach Notification */}
                    <section className="bg-yellow-50 p-8 rounded-3xl border border-yellow-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-yellow-600 shrink-0 shadow-sm">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Data Breach Notification</h2>
                                <p className="leading-relaxed text-gray-700">
                                    In the unlikely event of a data breach affecting your personal information, we will notify you promptly and in accordance with applicable Indian data protection laws. Our notification will cover the nature of the breach, the categories of data affected, and the steps we are taking to remediate the situation and prevent future occurrences.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Contact Us */}
                    <section className="bg-orange-500 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="p-3 bg-white/10 rounded-2xl text-white shrink-0">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-4">14. Contact Us About Privacy</h2>
                                <p className="mb-4 leading-relaxed text-orange-50">
                                    If you have questions, concerns, or requests about this Privacy Policy or how Stranger Mingle handles your personal information — whether as an organiser or as an attendee — please reach out to us:
                                </p>
                                <div className="space-y-2 ml-4">
                                    <p className="text-orange-50"><strong>Company:</strong> Salty Media Production (opc) Pvt Ltd</p>
                                    <p className="text-orange-50"><strong>Brand:</strong> Stranger Mingle</p>
                                    <p className="text-orange-50"><strong>Email:</strong> strangermingleteam@gmail.com</p>
                                    <p className="text-orange-50"><strong>Support:</strong> Through the contact form on our official website</p>
                                    <p className="text-orange-50"><strong>Response Time:</strong> We aim to respond within 48–72 business hours</p>
                                </div>
                                <p className="mt-4 leading-relaxed text-orange-50">
                                    We take all privacy concerns seriously and are committed to resolving them promptly and transparently.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Final Note */}
                    <section className="bg-amber-50 p-8 rounded-3xl border border-amber-200">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-100 rounded-2xl text-amber-700 shrink-0">
                                <Bell className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Privacy Is Our Responsibility</h3>
                                <p className="leading-relaxed text-gray-800">
                                    At Stranger Mingle, trust is the foundation of everything we do — for attendees who book tickets and for organisers who build their events on our platform. We are committed to protecting your personal information, being transparent about how it is used, and giving you control over your own data. This policy reflects our dedication to running a safe, fair, and responsible event ticketing platform for India.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}