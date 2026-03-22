import type { Metadata } from "next";
import {
    ScrollText,
    CheckCircle,
    UserCheck,
    ShieldAlert,
    Users,
    Ticket,
    AlertTriangle,
    MessageSquare,
    CreditCard,
    UserX,
    Scale,
    Gavel,
    FileText,
    Mail,
    IndianRupee,
    Store
} from "lucide-react";

export const metadata: Metadata = {
    title: "Terms of Service | Stranger Mingle — India's Event Ticketing Platform",
    description: "Terms of Service for Stranger Mingle — India's event ticketing and discovery platform. Understand your rights and responsibilities as an attendee or event organiser on our platform.",
    alternates: {
        canonical: "/terms",
    },
};

export default function Terms() {
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
                        Terms of Service
                    </h1>
                    <p className="text-gray-500 max-w-xl mx-auto text-lg">
                        The rules, rights, and responsibilities for using Stranger Mingle — whether you are purchasing event tickets as an attendee or creating and selling tickets as an organiser.
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
                                These Terms of Service govern your use of our event ticketing and discovery platform, website (strangermingle.com), and all associated services. This agreement applies to all users — attendees who browse and purchase event tickets, and event organisers who create, list, and sell tickets through Stranger Mingle. Please read these terms carefully before using the platform.
                            </p>
                        </div>
                    </div>

                    {/* Acceptance of Terms */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shrink-0">
                                <ScrollText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    By accessing strangermingle.com, purchasing event tickets, listing events, or using any Stranger Mingle service, you accept and agree to be bound by these Terms of Service along with our Privacy Policy, Refund Policy, and Safety Guidelines. If you do not agree, you must not use our platform.
                                </p>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    These terms constitute a legally binding agreement between you and <strong>Salty Media Production (opc) Pvt Ltd</strong> (operating as &quot;Stranger Mingle&quot;). For event organisers, additional organiser-specific terms also apply and are agreed upon during the organiser registration process.
                                </p>
                                <p className="leading-relaxed text-gray-600">
                                    We reserve the right to modify these terms at any time. Material changes will be communicated via email or prominent notice on our website. Your continued use of the platform after such changes constitutes acceptance of the updated terms.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Eligibility */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shrink-0">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Eligibility and Account Registration</h2>

                                <div className="space-y-6">
                                    <div className="bg-emerald-50 p-6 rounded-2xl">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Age Requirement</h3>
                                        <p className="leading-relaxed text-emerald-900">
                                            You must be at least 18 years old to use Stranger Mingle — whether as an attendee purchasing tickets or as an organiser listing events. By registering, you confirm you meet this requirement. We reserve the right to verify age and deny service to anyone who does not meet it or provides false information.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Attendee Account Registration</h3>
                                        <p className="mb-3 leading-relaxed text-gray-600">
                                            To browse events and purchase tickets, you must create an account with accurate, complete information. You agree to:
                                        </p>
                                        <ul className="grid md:grid-cols-2 gap-3 text-gray-600">
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>Provide truthful personal information</li>
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>Complete any required identity verification</li>
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>Keep your account information up to date</li>
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>Maintain the confidentiality of your login credentials</li>
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>Not share your account or tickets with others</li>
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>Notify us immediately of any unauthorised account access</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Organiser Account Registration</h3>
                                        <p className="mb-3 leading-relaxed text-gray-600">
                                            To create events and sell tickets through Stranger Mingle, you must register as an organiser and additionally:
                                        </p>
                                        <ul className="grid md:grid-cols-2 gap-3 text-gray-600">
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>Complete KYC and identity verification</li>
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>Provide valid bank account or UPI details for payouts</li>
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>Agree to organiser-specific policies and payout terms</li>
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>Create honest, accurate event listings at all times</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">One Account Per Person</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            Each individual may maintain only one active account, whether as an attendee or as an organiser. Creating multiple accounts or using fake identities to circumvent bans or platform policies is strictly prohibited and will result in permanent removal from Stranger Mingle.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Use License */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Permitted Use and Restrictions</h2>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Permitted Use — Attendees</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            Attendees are permitted to browse the event discovery pages, purchase tickets for events listed on Stranger Mingle, manage their bookings, and use QR tickets for event entry — solely for personal, non-commercial purposes.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Permitted Use — Organisers</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            Verified organisers are permitted to create event listings, set ticket pricing and tiers, manage attendee check-ins via the QR scanning system, access their sales dashboard, and receive earnings payouts — solely for the events they have legitimately created and listed on Stranger Mingle.
                                        </p>
                                    </div>

                                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                                        <h3 className="text-lg font-bold text-red-900 mb-3">Prohibited Uses — You May Not:</h3>
                                        <ul className="space-y-2 text-red-800 text-sm">
                                            <li className="flex items-start gap-2">• Create fraudulent, misleading, or fictitious event listings to collect ticket payments</li>
                                            <li className="flex items-start gap-2">• Collect ticket payments outside the Stranger Mingle platform — all transactions must go through our official checkout</li>
                                            <li className="flex items-start gap-2">• Resell or transfer tickets purchased on Stranger Mingle for profit on any third-party platform</li>
                                            <li className="flex items-start gap-2">• Use attendee data obtained via Stranger Mingle for marketing, outreach, or any purpose beyond the specific event</li>
                                            <li className="flex items-start gap-2">• Scrape, copy, or reproduce platform content, event listings, or user data for external use</li>
                                            <li className="flex items-start gap-2">• Use automated systems (bots, scripts) to purchase tickets or manipulate listings</li>
                                            <li className="flex items-start gap-2">• Impersonate other users, organisers, or Stranger Mingle staff</li>
                                            <li className="flex items-start gap-2">• Use Stranger Mingle to promote products, services, or MLM / business opportunities to attendees</li>
                                            <li className="flex items-start gap-2">• Distribute spam, unsolicited advertisements, or promotional content through the platform</li>
                                            <li className="flex items-start gap-2">• Reverse engineer, decompile, or attempt to extract source code from Stranger Mingle</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Intellectual Property</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            All content on Stranger Mingle — including the platform design, text, graphics, logos, event listing templates, and software — is the property of Salty Media Production (opc) Pvt Ltd and is protected under applicable Indian intellectual property laws. You may not reproduce, distribute, or create derivative works without our explicit written permission.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Platform Rules */}
                    <section className="bg-gradient-to-br from-orange-50 to-pink-50 p-8 rounded-3xl border border-orange-100 relative overflow-hidden">
                        <div className="relative z-10 flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-orange-600 shrink-0 shadow-sm">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Platform Standards and User Conduct</h2>
                                <p className="leading-relaxed mb-6 text-gray-700 font-medium">
                                    Stranger Mingle is built on trust — between attendees and organisers. All users must uphold these standards in every interaction on and through our platform.
                                </p>

                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-white/70 p-5 rounded-2xl backdrop-blur-sm border border-orange-100">
                                        <h3 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> You Agree To:</h3>
                                        <ul className="space-y-2 text-gray-700 text-sm">
                                            <li>• Treat all attendees and organisers with respect and dignity</li>
                                            <li>• Attend events you have purchased tickets for — or cancel within the allowed window</li>
                                            <li>• Follow all event-specific rules set by the organiser</li>
                                            <li>• Respect personal boundaries and obtain consent before interacting</li>
                                            <li>• Report safety concerns to the on-ground organiser immediately</li>
                                            <li>• As an organiser: deliver the event as described in the listing</li>
                                            <li>• As an organiser: provide accurate, honest event information at all times</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white/70 p-5 rounded-2xl backdrop-blur-sm border border-red-100">
                                        <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2"><UserX className="w-5 h-5" /> You Agree NOT To:</h3>
                                        <ul className="space-y-2 text-gray-700 text-sm">
                                            <li>• Harass, threaten, intimidate, or abuse any attendee or organiser</li>
                                            <li>• Engage in any form of discrimination</li>
                                            <li>• Make unwelcome sexual advances or comments</li>
                                            <li>• Attend events under the influence of alcohol or illegal substances</li>
                                            <li>• Book tickets with no intention of attending (repeated no-shows)</li>
                                            <li>• As an organiser: list events with false or misleading information</li>
                                            <li>• As an organiser: collect attendee payments outside the Stranger Mingle platform</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-red-100/60 p-4 rounded-xl border border-red-200">
                                    <h4 className="font-bold text-red-900 mb-1">Zero Tolerance Policy</h4>
                                    <p className="leading-relaxed text-red-800 text-sm">
                                        We maintain absolute zero tolerance for harassment, discrimination, and fraud — whether directed at attendees, organisers, or Stranger Mingle itself. Violations will result in immediate account suspension without refund, cancellation of all active tickets, withholding of organiser payouts, and potential legal action where applicable.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Ticket Purchase & Organiser Listing Terms */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 shrink-0">
                                <Ticket className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Ticket Purchases and Event Listings</h2>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">For Attendees — Purchasing Tickets</h3>
                                        <p className="mb-3 leading-relaxed text-gray-600">
                                            Your ticket booking is confirmed only upon successful payment through Stranger Mingle's official checkout. By purchasing a ticket, you agree to:
                                        </p>
                                        <ul className="space-y-2 text-gray-600 pl-4 border-l-2 border-amber-100">
                                            <li>Pay the full ticket price as stated on the event listing at the time of purchase</li>
                                            <li>Attend the event on time or cancel within the refund window specified in our Refund Policy</li>
                                            <li>Present your QR ticket for scanning at the event entry point</li>
                                            <li>Not share, duplicate, or resell your ticket on any third-party platform</li>
                                            <li>Accept that tickets are issued on a first-come, first-served basis and event capacity is limited</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">For Organisers — Listing Events and Selling Tickets</h3>
                                        <p className="mb-3 leading-relaxed text-gray-600">
                                            By creating an event listing on Stranger Mingle, you agree to:
                                        </p>
                                        <ul className="space-y-2 text-gray-600 pl-4 border-l-2 border-orange-200">
                                            <li>Provide accurate event details — name, description, date, time, venue, and ticket pricing</li>
                                            <li>Deliver the event as described in your listing to the best of your ability</li>
                                            <li>Use Stranger Mingle's QR scanning system for attendee entry verification</li>
                                            <li>Not collect ticket payments through any channel other than the Stranger Mingle platform</li>
                                            <li>Notify Stranger Mingle and registered attendees promptly if an event must be cancelled or rescheduled</li>
                                            <li>Accept that Stranger Mingle's platform fee will be deducted from ticket revenue before your payout is processed</li>
                                        </ul>
                                    </div>

                                    <div className="bg-amber-50 p-6 rounded-2xl">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Cancellation and Refund Summary</h3>
                                        <p className="mb-2 text-gray-700 text-sm">Standard ticket cancellation terms (full terms in our Refund Policy):</p>
                                        <ul className="space-y-2 text-gray-700 text-sm">
                                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div><strong>48+ hours before event:</strong> Full refund or 100% credit</li>
                                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div><strong>24–48 hours before event:</strong> 50% refund or 75% credit</li>
                                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div><strong>Less than 24 hours before:</strong> No refund</li>
                                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div><strong>No-shows:</strong> No refund + account warning or restriction</li>
                                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2"></div><strong>Organiser-cancelled events:</strong> 100% refund or 110% credit to attendees</li>
                                        </ul>
                                        <p className="mt-3 text-xs text-amber-800">
                                            Specific event types (treks, workshops, multi-day events) may have stricter terms — these will be stated clearly on the event listing page before purchase.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Event Modifications</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            Stranger Mingle reserves the right to delist or remove any event listing that violates our platform policies, contains false information, or poses safety concerns — with or without prior notice to the organiser. Organisers who repeatedly cancel events or receive significant negative feedback may have their listing privileges suspended or permanently revoked.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Payment Terms */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 shrink-0">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Payment Terms, Pricing, and Payouts</h2>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Ticket Payment — Attendees</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            All ticket prices are clearly displayed on the event listing page. Payment must be completed in full through Stranger Mingle's official checkout to confirm a booking. We accept UPI, all major Indian debit and credit cards, net banking, and other methods as made available. All payments are processed by Salty Media Production (opc) Pvt Ltd and may appear under that name on your bank statement.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Organiser Payouts</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            Organiser earnings are paid out via UPI or bank transfer within 3–5 business days of the event concluding successfully. Stranger Mingle's platform fee and applicable payment gateway charges are deducted from total ticket revenue before payout. Payouts are held if an event is cancelled by the organiser or if legitimate refund claims are in process.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Pricing Changes</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            Organisers may update ticket pricing on future events. Pricing changes do not affect tickets already purchased. Stranger Mingle's platform fee structure may be updated with reasonable advance notice to organisers.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Disputes</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            If you have a concern about a charge, contact us at strangermingleteam@gmail.com within 7 days of the transaction. We will investigate and work to resolve the matter promptly and fairly.
                                        </p>
                                    </div>

                                    <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                                        <h3 className="text-lg font-bold text-teal-900 mb-2">No Off-Platform Financial Transactions</h3>
                                        <p className="leading-relaxed text-teal-800 text-sm">
                                            All ticket sales and related payments must occur exclusively through Stranger Mingle's official platform. Organisers may not collect event fees directly from attendees. Stranger Mingle is not responsible for any financial transactions that occur outside our official checkout — including personal loans, direct UPI transfers, or off-platform deals between users.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Safety and Liability */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-50 rounded-2xl text-red-600 shrink-0">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Safety, Risk, and Liability</h2>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Assumption of Risk</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            You acknowledge that participation in events — particularly physical or outdoor activities such as treks, cycling tours, or camping — involves inherent risks. By purchasing a ticket and attending an event, you voluntarily assume all risks associated with participation, including personal injury, property damage, or other losses.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Organiser Liability</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            Event organisers on Stranger Mingle are independent individuals or entities — they are not employees or agents of Stranger Mingle or Salty Media Production (opc) Pvt Ltd. Stranger Mingle acts as a ticketing intermediary. While we verify organiser identity and enforce platform policies, we are not responsible for the quality, safety, or delivery of events created by third-party organisers. Disputes arising from an organiser's event delivery are primarily between the attendee and the organiser.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Attendee Personal Responsibility</h3>
                                        <p className="mb-2 leading-relaxed text-gray-600">As an attendee, you are responsible for:</p>
                                        <ul className="grid md:grid-cols-2 gap-2 text-gray-600 text-sm pl-4 border-l-2 border-gray-100">
                                            <li>• Your own safety and wellbeing at events</li>
                                            <li>• Ensuring physical fitness for activity-based events</li>
                                            <li>• Disclosing relevant health conditions to the organiser</li>
                                            <li>• Bringing necessary medications or medical equipment</li>
                                            <li>• Following all safety instructions from the organiser</li>
                                            <li>• Your conduct and interactions with other attendees</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Limitation of Liability</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            To the maximum extent permitted by Indian law, Stranger Mingle, Salty Media Production (opc) Pvt Ltd, its founders, employees, and affiliates shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the platform, ticket purchases, event attendance, or interactions with other users. This includes injuries, accidents, property damage, financial loss, or emotional distress resulting from events or interactions with organisers or other attendees.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Insurance</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            Stranger Mingle does not provide insurance coverage for attendees or organisers. Attendees are strongly encouraged to maintain personal health and accident insurance. For adventure or overnight events, organisers may require proof of travel insurance as a condition of entry.
                                        </p>
                                    </div>

                                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                                        <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-600" /> Interactions Outside the Platform</h4>
                                        <p className="leading-relaxed text-gray-700 text-sm">
                                            Stranger Mingle is not responsible for any interactions, relationships, or incidents that occur between users outside of organised events or outside the Stranger Mingle platform. All such interactions are at the sole risk and discretion of the individuals involved.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Content and Communication */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-pink-50 rounded-2xl text-pink-600 shrink-0">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">8. User Content and Communications</h2>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">User-Generated Content</h3>
                                        <p className="mb-3 leading-relaxed text-gray-600">
                                            You may submit reviews, feedback, event descriptions, or other content through our platform. By doing so, you grant Stranger Mingle a non-exclusive, royalty-free, perpetual, worldwide licence to use, reproduce, modify, and display such content for operational and promotional purposes.
                                        </p>
                                        <p className="leading-relaxed text-gray-600">
                                            You confirm that any content you submit is original, does not infringe on third-party rights, and complies with these terms. Stranger Mingle reserves the right to remove any content that violates our platform standards.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Organiser Event Listing Content</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            Event descriptions, images, pricing, and other listing content submitted by organisers must be accurate and non-misleading. Stranger Mingle reserves the right to edit, remove, or delist any event listing that contains false information, violates platform standards, or compromises user trust.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Communication Standards</h3>
                                        <p className="mb-2 leading-relaxed text-gray-600">All communications through Stranger Mingle must be:</p>
                                        <ul className="grid md:grid-cols-2 gap-2 text-gray-600 text-sm pl-4 border-l-2 border-pink-100">
                                            <li>• Respectful and appropriate in tone</li>
                                            <li>• Free from harassment, threats, or hate speech</li>
                                            <li>• Non-commercial (no spam or unsolicited promotion)</li>
                                            <li>• Truthful and not deliberately misleading</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Photography and Media at Events</h3>
                                        <p className="leading-relaxed text-gray-600">
                                            Events may be photographed or recorded by the organiser or Stranger Mingle for promotional use. By purchasing a ticket and attending, you consent to being photographed and to Stranger Mingle using such media on our website, social media, and marketing materials. If you do not wish to be photographed, please inform the organiser at the start of the event.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Account Termination */}
                    <section className="bg-red-50 p-8 rounded-3xl border border-red-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-red-600 shrink-0 shadow-sm">
                                <UserX className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Account Suspension and Termination</h2>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Grounds for Suspension or Termination</h3>
                                        <p className="mb-3 leading-relaxed text-gray-700">
                                            We reserve the right to suspend or permanently terminate any account — attendee or organiser — immediately and without prior notice, if you:
                                        </p>
                                        <ul className="space-y-2 text-gray-700 ml-4 list-disc text-sm">
                                            <li>Violate these Terms of Service or any associated platform policies</li>
                                            <li>Engage in harassment, discrimination, or abuse toward any user</li>
                                            <li>Provide false information or misrepresent your identity during registration or in event listings</li>
                                            <li>Collect payments outside the Stranger Mingle platform as an organiser</li>
                                            <li>Create fraudulent, misleading, or fictitious event listings</li>
                                            <li>Repeatedly fail to attend events without cancellation (no-shows)</li>
                                            <li>Misuse attendee data obtained through Stranger Mingle</li>
                                            <li>Engage in illegal activities in connection with your use of the platform</li>
                                            <li>Compromise the safety, trust, or experience of other platform users</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Effects of Termination</h3>
                                        <p className="leading-relaxed text-gray-700">
                                            Upon termination, your access to the platform is immediately revoked. Active ticket bookings will be cancelled. Organisers will forfeit any pending payouts if termination is due to policy violations. You may not create a new account after a permanent ban.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Voluntary Account Closure</h3>
                                        <p className="leading-relaxed text-gray-700">
                                            You may close your account at any time by contacting us at strangermingleteam@gmail.com. Account closure is subject to settlement of any pending events, ticket refunds, or organiser payout transactions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Indemnification */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 shrink-0">
                                <Scale className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
                                <p className="leading-relaxed text-gray-600 mb-4">
                                    You agree to indemnify, defend, and hold harmless Stranger Mingle, Salty Media Production (opc) Pvt Ltd, its founders, employees, and affiliates from any claims, damages, losses, liabilities, costs, or expenses (including legal fees) arising from:
                                </p>
                                <ul className="space-y-2 text-gray-600 pl-4 border-l-2 border-orange-100 text-sm">
                                    <li>• Your violation of these Terms of Service or any platform policy</li>
                                    <li>• Your violation of any applicable Indian law or third-party rights</li>
                                    <li>• Your event listing content (for organisers) or any misrepresentation therein</li>
                                    <li>• Your use of the platform, ticket purchases, or event attendance</li>
                                    <li>• Your conduct or interactions with other users on or through the platform</li>
                                    <li>• Your collection, use, or misuse of attendee data (for organisers)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Dispute Resolution */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-slate-50 rounded-2xl text-slate-600 shrink-0">
                                <Gavel className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Dispute Resolution and Governing Law</h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-slate-50 p-5 rounded-2xl">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Informal Resolution First</h3>
                                        <p className="text-sm text-gray-600">
                                            For any dispute — whether between an attendee and Stranger Mingle, or between an attendee and an organiser — please contact us first at strangermingleteam@gmail.com. We are committed to resolving concerns fairly and promptly before escalation.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-2xl">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Governing Law</h3>
                                        <p className="text-sm text-gray-600">
                                            These Terms of Service are governed by and construed in accordance with the laws of India. Relevant laws include the Information Technology Act, 2000, the Consumer Protection Act, 2019, and applicable Indian contract law.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-2xl">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Jurisdiction</h3>
                                        <p className="text-sm text-gray-600">
                                            Any legal action or proceeding arising from these terms shall be brought exclusively in the courts of Pune, Maharashtra, India. By using Stranger Mingle, you consent to the personal jurisdiction of these courts.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-2xl">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Arbitration</h3>
                                        <p className="text-sm text-gray-600">
                                            For disputes that cannot be resolved informally, both parties agree to binding arbitration in Pune, Maharashtra, in accordance with the Arbitration and Conciliation Act, 1996 (as amended).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* General Provisions */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-50 rounded-2xl text-gray-600 shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">12. General Provisions</h2>
                                <div className="space-y-4 text-gray-600">
                                    <p><strong>Entire Agreement:</strong> These Terms of Service, together with our Privacy Policy, Refund Policy, Safety Guidelines, and Disclaimer, constitute the entire agreement between you and Stranger Mingle regarding use of our platform and services.</p>
                                    <p><strong>Severability:</strong> If any provision of these terms is found to be unenforceable or invalid under Indian law, that provision shall be limited to the minimum extent necessary, and the remaining provisions shall continue in full force and effect.</p>
                                    <p><strong>Waiver:</strong> Our failure to enforce any right or provision of these terms on any occasion shall not constitute a permanent waiver of that right or provision.</p>
                                    <p><strong>Assignment:</strong> You may not assign or transfer your account or rights under these terms without our prior written consent. Stranger Mingle may assign its rights and obligations without restriction.</p>
                                    <p><strong>Force Majeure:</strong> Stranger Mingle shall not be liable for any failure to perform obligations due to circumstances beyond our reasonable control — including natural disasters, pandemics, internet outages, government restrictions, or actions by payment gateway providers.</p>
                                    <p><strong>Relationship of Parties:</strong> Event organisers on Stranger Mingle are independent third parties, not employees, agents, or partners of Salty Media Production (opc) Pvt Ltd. Stranger Mingle operates as a ticketing intermediary and marketplace platform.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="bg-orange-500 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="p-3 bg-white/10 rounded-2xl text-white shrink-0">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-4">13. Contact Us</h2>
                                <p className="mb-4 leading-relaxed text-orange-50">
                                    If you have questions about these Terms of Service — as an attendee or as an organiser — please reach out to us:
                                </p>
                                <div className="space-y-2 ml-4 text-orange-50">
                                    <p><strong>Company:</strong> Salty Media Production (opc) Pvt Ltd</p>
                                    <p><strong>Brand:</strong> Stranger Mingle</p>
                                    <p><strong>Email:</strong> strangermingleteam@gmail.com</p>
                                    <p><strong>Website:</strong> Through the official contact form on strangermingle.com</p>
                                    <p><strong>Response Time:</strong> We aim to respond within 48–72 business hours</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Acknowledgment */}
                    <section className="bg-gray-50 p-8 rounded-3xl border border-gray-200">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-gray-600 shrink-0 shadow-sm">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Acknowledgment and Acceptance</h3>
                                <p className="leading-relaxed mb-4 text-gray-700">
                                    By purchasing tickets or listing events on Stranger Mingle, you confirm that you have read, understood, and agree to be bound by these Terms of Service — along with our Privacy Policy, Refund Policy, Safety Guidelines, and Disclaimer.
                                </p>
                                <p className="leading-relaxed text-gray-700">
                                    These terms exist to protect both sides of our platform — the attendees who trust Stranger Mingle to connect them with quality events, and the organisers who depend on Stranger Mingle to sell their tickets fairly and securely. Together, we are building India's most trusted city-level event ticketing platform.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}