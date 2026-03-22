import {
    Shield,
    Info,
    Users,
    AlertTriangle,
    Activity,
    Car,
    Briefcase,
    CreditCard,
    Building2,
    Camera,
    FileText,
    ExternalLink,
    UserPlus,
    Scale,
    RefreshCw,
    Mail,
    Bell,
    HeartHandshake,
    Store,
    Ticket
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Disclaimer | Stranger Mingle — India's Event Ticketing Platform",
    description: "Legal disclaimer for Stranger Mingle — India's event ticketing and discovery platform. Covers liability limitations for attendees, event organisers, third-party venues, and off-platform interactions.",
    alternates: {
        canonical: "/disclaimer",
    }
};

export default function Disclaimer() {
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
                        Disclaimer
                    </h1>
                    <p className="text-gray-500 max-w-xl mx-auto text-lg">
                        Important legal information about Stranger Mingle's role as an event ticketing platform — and the limits of our liability for attendees, organisers, and third-party events.
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-pink-600 mx-auto rounded-full mt-6"></div>
                </div>

                <div className="space-y-8">
                    {/* General Information */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shrink-0">
                                <Info className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">General Information</h2>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    <strong>Stranger Mingle</strong> is a brand owned and operated by <strong>Salty Media Production (opc) Pvt Ltd</strong>.
                                    Stranger Mingle operates as an event ticketing and discovery platform — connecting event organisers who create and sell tickets with attendees who discover and book those events across Indian cities. The information provided on <strong>strangermingle.com</strong> is for general informational purposes related to event listings, ticketing, and platform operations.
                                </p>
                                <p className="leading-relaxed text-gray-600">
                                    While all platform content and event listing information is published in good faith, <strong>Salty Media Production (opc) Pvt Ltd</strong> makes no representation or warranty of any kind — express or implied — regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information published on the platform, including event details submitted by third-party organisers.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Platform Role Clarification */}
                    <section className="bg-orange-50 p-8 rounded-3xl border border-orange-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-orange-600 shrink-0 shadow-sm">
                                <Store className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Stranger Mingle's Role as a Ticketing Marketplace</h2>
                                <p className="mb-4 leading-relaxed text-gray-700">
                                    Stranger Mingle is a ticketing intermediary — a marketplace that enables independent event organisers to list events and sell tickets to attendees. Stranger Mingle is <strong>not</strong> the organiser of events listed by third parties on our platform. We verify organiser identity and enforce platform policies, but we are not responsible for the planning, execution, quality, or safety of events created by third-party organisers.
                                </p>
                                <p className="leading-relaxed font-semibold text-gray-900 mb-3">
                                    Specifically, Stranger Mingle does not take responsibility for:
                                </p>
                                <ul className="space-y-3 text-gray-700">
                                    <li className="flex items-start gap-3">
                                        <Shield className="w-4 h-4 text-orange-500 mt-1 shrink-0" />
                                        <span>The quality, delivery, or cancellation of events listed by independent organisers on our platform</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Shield className="w-4 h-4 text-orange-500 mt-1 shrink-0" />
                                        <span>Misrepresentation or false information in event listings submitted by organisers</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Shield className="w-4 h-4 text-orange-500 mt-1 shrink-0" />
                                        <span>Disputes between attendees and organisers regarding event quality, experience, or fulfilment</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Shield className="w-4 h-4 text-orange-500 mt-1 shrink-0" />
                                        <span>Any harm, loss, or disappointment resulting from an organiser's failure to deliver an event as described</span>
                                    </li>
                                </ul>
                                <p className="mt-4 leading-relaxed text-gray-700">
                                    Attendees are encouraged to review event listings carefully before purchasing tickets. Organisers are independently responsible for everything they promise in their event descriptions.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Event Participation */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 shrink-0">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Attendance and Personal Safety</h2>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    Purchasing a ticket and attending an event on Stranger Mingle is entirely voluntary and at your own risk. While we verify organisers, publish safety guidelines, and enforce platform conduct policies, we cannot guarantee the behaviour of all participants or control circumstances that arise during or after events.
                                </p>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    Every attendee is responsible for their own safety, wellbeing, and decisions at events. We strongly encourage all ticket holders to:
                                </p>
                                <ul className="space-y-3 mb-4 text-gray-600">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Read the full event listing and organiser details carefully before booking a ticket</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Exercise common sense and good personal judgment at all events</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Inform a trusted person of the event name, venue, and expected return time before attending</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Trust your instincts — leave any situation that makes you uncomfortable</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Never share sensitive personal information — home address, financial details, or daily routine — with people you have just met at an event</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Interactions Outside Events */}
                    <section className="bg-gradient-to-br from-orange-50 to-pink-50 p-8 rounded-3xl border border-orange-100 relative overflow-hidden">
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="p-3 bg-white rounded-2xl text-orange-600 shrink-0 shadow-sm">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Interactions Outside Official Events</h2>
                                <p className="mb-4 leading-relaxed text-gray-700">
                                    Stranger Mingle is a ticketing platform. Our responsibility extends to the organised events listed on our platform — not to personal interactions between users that occur outside of those events. Attendees may choose to stay in touch, meet, or develop relationships with other attendees or organisers they meet through events. Any such interactions are entirely personal and occur at their own discretion and risk.
                                </p>
                                <p className="mb-4 leading-relaxed font-semibold text-gray-900">
                                    Stranger Mingle takes no responsibility for:
                                </p>
                                <ul className="space-y-3 mb-4 text-gray-700">
                                    <li className="flex items-start gap-3">
                                        <Shield className="w-4 h-4 text-orange-500 mt-1 shrink-0" />
                                        <span>Personal relationships — platonic, professional, or romantic — that develop between users who met through the platform</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Shield className="w-4 h-4 text-orange-500 mt-1 shrink-0" />
                                        <span>Personal meetings arranged independently by users via WhatsApp, phone, text, email, or any other channel</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Shield className="w-4 h-4 text-orange-500 mt-1 shrink-0" />
                                        <span>Any incidents, disputes, harm, or misunderstandings that occur outside our official event premises or scheduled activities</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Shield className="w-4 h-4 text-orange-500 mt-1 shrink-0" />
                                        <span>Private arrangements or activities organised by users without Stranger Mingle's involvement</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Shield className="w-4 h-4 text-orange-500 mt-1 shrink-0" />
                                        <span>Exchange of money, goods, or services between users outside of official ticket transactions</span>
                                    </li>
                                </ul>
                                <p className="leading-relaxed text-gray-700">
                                    Stranger Mingle connects people through ticketed events. What happens beyond those events is the personal choice and sole responsibility of the individuals involved. We encourage safe, respectful, and consensual interactions at all times.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* No Liability for Member / Organiser Conduct */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-50 rounded-2xl text-red-600 shrink-0">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Liability for User or Organiser Conduct</h2>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    While Stranger Mingle maintains community guidelines, verifies organiser identity through KYC, and enforces platform policies, we cannot fully verify the background, intentions, or truthfulness of all users. We do not conduct comprehensive background checks or criminal record searches beyond our standard registration and verification process.
                                </p>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    A verified organiser badge on Stranger Mingle confirms identity verification only — it does not constitute an endorsement of an organiser's character, capabilities, or trustworthiness beyond the platform's own policies. Similarly, a registered attendee account does not serve as a character reference for any individual.
                                </p>
                                <p className="leading-relaxed text-gray-600">
                                    Users and organisers found violating our community guidelines or platform policies will be removed promptly. However, Stranger Mingle is not liable for any harm, loss, or damage caused by such individuals prior to their removal.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Health and Physical Activities */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-50 rounded-2xl text-green-600 shrink-0">
                                <HeartHandshake className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Health, Fitness, and Physical Activity Events</h2>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    Some events listed on Stranger Mingle by organisers involve physical activities — treks, cycling rides, adventure sports, camping, or outdoor experiences. Participation in such events requires adequate physical fitness and health awareness.
                                </p>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    By purchasing a ticket and participating in a physical or adventure event, you confirm that:
                                </p>
                                <ul className="space-y-3 mb-4 text-gray-600">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>You are physically fit and healthy enough to participate in the specific activity</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>You have no medical conditions that would make participation unsafe without disclosure</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>You will disclose any relevant health concerns to the event organiser before the event begins</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>You will carry any necessary medications, medical equipment, or first-aid supplies</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>You understand and voluntarily accept the inherent physical risks involved in adventure and outdoor activities</span>
                                    </li>
                                </ul>
                                <p className="leading-relaxed text-gray-600">
                                    Stranger Mingle and the event organiser are not responsible for injuries, health complications, accidents, or medical emergencies that occur during events. Attendees are solely responsible for their own health and safety decisions.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Travel and Transportation */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 shrink-0">
                                <Car className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Travel and Transportation to Events</h2>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    Attendees are responsible for their own transportation to and from event venues. Stranger Mingle does not provide, arrange, or manage transportation services unless explicitly stated and included as part of a specific event package. We are not responsible for:
                                </p>
                                <ul className="space-y-3 mb-4 text-gray-600">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Travel arrangements made independently by attendees to reach event venues</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Carpooling or ride-sharing arrangements made between attendees outside the platform</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Accidents, delays, or incidents that occur during travel to or from an event</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Loss or theft of personal belongings during travel</span>
                                    </li>
                                </ul>
                                <p className="leading-relaxed text-gray-600">
                                    Where an organiser includes transport as part of a ticketed event package, the organiser — not Stranger Mingle — is responsible for the safety and reliability of that transportation.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Personal Belongings */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 shrink-0">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Personal Belongings and Valuables at Events</h2>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    Neither Stranger Mingle nor the event organiser is responsible for the loss, theft, or damage of personal belongings at or during events. This includes but is not limited to:
                                </p>
                                <ul className="space-y-3 mb-4 text-gray-600">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Mobile phones, wallets, bags, and other personal items</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Jewellery, watches, and valuable accessories</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Cameras, laptops, and electronic devices</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Vehicles, bicycles, or any personal mode of transportation parked near the venue</span>
                                    </li>
                                </ul>
                                <p className="leading-relaxed text-gray-600">
                                    Attendees are advised to keep belongings secure and avoid bringing unnecessary valuables to events. Exercise common sense and stay vigilant about your personal items throughout the event.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Financial Transactions */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-yellow-50 rounded-2xl text-yellow-600 shrink-0">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Transactions and Ticket Payments</h2>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    All ticket purchases on Stranger Mingle are processed through our official checkout system. Ticket fees are subject to our Refund and Cancellation Policy. Stranger Mingle is not responsible for:
                                </p>
                                <ul className="space-y-3 mb-4 text-gray-600">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Any financial transactions between users that occur outside of the official Stranger Mingle checkout — including direct UPI transfers, cash payments, or off-platform deals with organisers</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Personal loans, gifts, or money exchanges between attendees or between attendees and organisers</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Shared expense arrangements or cost-splitting deals made independently between users</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Financial disputes arising from transactions that occurred outside our platform</span>
                                    </li>
                                </ul>
                                <p className="leading-relaxed text-gray-600 font-medium">
                                    Always pay for tickets exclusively through Stranger Mingle's official checkout. If an organiser asks you to pay directly via UPI or cash outside our platform, do not proceed — report it to us immediately.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Third-Party Venues and Services */}
                    <section className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-indigo-600 shrink-0 shadow-sm">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Venues and Event Services</h2>
                                <p className="mb-4 leading-relaxed text-gray-700">
                                    Events listed on Stranger Mingle are held at venues chosen by the event organiser — cafes, restaurants, trekking sites, community halls, or other third-party spaces. Stranger Mingle does not own, operate, or manage these venues. We are not responsible for:
                                </p>
                                <ul className="space-y-3 mb-4 text-gray-700">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>The quality, safety, accessibility, or condition of third-party venues selected by organisers</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Food quality, hygiene standards, or allergic reactions at restaurants or food venues</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Services provided by third-party vendors, instructors, or activity providers hired by organisers</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Accidents, incidents, or property damage occurring on third-party venue premises</span>
                                    </li>
                                </ul>
                                <p className="leading-relaxed text-gray-700">
                                    Complaints or concerns about a venue's facilities, food, or services should be addressed directly with the venue or the event organiser. Stranger Mingle can be contacted if you believe an organiser misrepresented the venue in their listing.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Photography and Media */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-pink-50 rounded-2xl text-pink-600 shrink-0">
                                <Camera className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Photography, Videos, and Social Media</h2>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    Events listed on Stranger Mingle may be photographed or recorded by the organiser and by Stranger Mingle for promotional purposes. By purchasing a ticket and attending an event, you consent to being photographed or recorded and to the reasonable use of such media by Stranger Mingle on our website, social media channels, and marketing materials.
                                </p>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    If you do not wish to be photographed, please inform the event organiser at the very start of the event. The organiser will make reasonable efforts to accommodate this request.
                                </p>
                                <p className="leading-relaxed text-gray-600">
                                    Stranger Mingle is not responsible for photographs or videos taken independently by other attendees and shared on their personal social media accounts. We cannot control or remove content shared by third parties on platforms outside our own.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Content Accuracy */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-cyan-50 rounded-2xl text-cyan-600 shrink-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Listing Accuracy and Platform Content</h2>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    While Stranger Mingle requires organisers to provide accurate event information and reserves the right to remove misleading listings, event details — including dates, venues, timings, activity descriptions, and included services — are primarily the organiser's responsibility. Details may occasionally change due to unforeseen circumstances.
                                </p>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    Stranger Mingle reserves the right to:
                                </p>
                                <ul className="space-y-3 mb-4 text-gray-600">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Remove or delist event listings that violate platform policies or contain false information</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Update platform features, pricing structures, or operational policies with reasonable notice</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Modify, suspend, or discontinue any aspect of the platform without prior notice</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Change platform fees or organiser payout terms with reasonable advance notice to affected organisers</span>
                                    </li>
                                </ul>
                                <p className="leading-relaxed text-gray-600">
                                    Stranger Mingle is not liable for inconvenience, costs, or losses incurred due to event changes, cancellations, or platform modifications beyond our reasonable control.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* External Links */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-violet-50 rounded-2xl text-violet-600 shrink-0">
                                <ExternalLink className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">External Links and Third-Party Services</h2>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    Our platform integrates with or links to third-party services — including payment gateways, map providers, WhatsApp, and social media platforms. We have no control over and assume no responsibility for the content, privacy policies, or practices of these third-party services.
                                </p>
                                <p className="leading-relaxed text-gray-600">
                                    You acknowledge that Stranger Mingle shall not be responsible or liable, directly or indirectly, for any damage or loss caused by or in connection with your use of any third-party service accessed through or in connection with our platform. We encourage you to review the privacy policies of all third-party services you interact with.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Age Restrictions */}
                    <section className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-blue-600 shrink-0 shadow-sm">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Age Restrictions</h2>
                                <p className="mb-4 leading-relaxed text-gray-700">
                                    Stranger Mingle — both as an attendee and as an event organiser — is intended for adults aged 18 years and above. By registering an account or purchasing a ticket, you confirm that you meet the minimum age requirement.
                                </p>
                                <p className="leading-relaxed text-gray-700">
                                    We reserve the right to verify age at any point and deny access or participation to anyone who does not meet the age requirement or who has provided false information during registration. Organisers must also ensure their events comply with any age restrictions applicable to the activity or venue.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Legal Jurisdiction */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-slate-50 rounded-2xl text-slate-600 shrink-0">
                                <Scale className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law and Jurisdiction</h2>
                                <p className="leading-relaxed text-gray-600">
                                    This disclaimer and any disputes arising from the use of Stranger Mingle's platform or attendance at events listed on our platform shall be governed by the laws of India — including the Information Technology Act, 2000, the Consumer Protection Act, 2019, and applicable Indian contract law. Any legal proceedings shall be subject to the exclusive jurisdiction of the courts of Pune, Maharashtra, India.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-50 rounded-2xl text-red-600 shrink-0">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    To the fullest extent permitted by applicable Indian law, Stranger Mingle, Salty Media Production (opc) Pvt Ltd, its founders, team members, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages — or any loss of profits, revenue, data, goodwill, or other intangible losses — resulting from:
                                </p>
                                <ul className="space-y-3 mb-4 text-gray-600">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Your purchase of tickets or participation in events listed on Stranger Mingle</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>The conduct, omissions, or misrepresentations of any event organiser or third-party user on the platform</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Unauthorised access to or alteration of your account or personal data</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Platform downtime, technical failures, or interruptions to payment processing</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2.5 shrink-0"></div>
                                        <span>Any other matter related to the use of our services, whether arising from contract, tort, or any other legal theory</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Changes to Disclaimer */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-50 rounded-2xl text-gray-600 shrink-0">
                                <RefreshCw className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Disclaimer</h2>
                                <p className="mb-4 leading-relaxed text-gray-600">
                                    We reserve the right to update or modify this disclaimer at any time to reflect changes in our platform operations, legal requirements, or business model. Changes will be effective immediately upon posting on this page. Your continued use of Stranger Mingle after any such changes constitutes acceptance of the updated disclaimer.
                                </p>
                                <p className="leading-relaxed font-semibold text-gray-600">
                                    Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                </p>
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
                                <h2 className="text-2xl font-bold mb-4">Questions About This Disclaimer</h2>
                                <p className="mb-4 leading-relaxed text-orange-50">
                                    If you have questions about this disclaimer, or if you believe an event listing on Stranger Mingle is fraudulent or misleading, please contact us:
                                </p>
                                <div className="space-y-2 ml-4 text-orange-50">
                                    <p><strong>Company:</strong> Salty Media Production (opc) Pvt Ltd</p>
                                    <p><strong>Brand:</strong> Stranger Mingle</p>
                                    <p><strong>Email:</strong> strangermingleteam@gmail.com</p>
                                    <p><strong>Website:</strong> Contact form on strangermingle.com</p>
                                    <p><strong>Response Time:</strong> We aim to respond within 48–72 business hours</p>
                                </div>
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
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Important Reminder</h3>
                                <p className="leading-relaxed text-gray-800">
                                    Stranger Mingle exists to connect people with great events across Indian cities — and to give independent organisers a trusted platform to build their events and their income. While we work hard to keep the platform safe, honest, and high quality, we are a ticketing marketplace, not the organiser of every event you see. Always read event listings carefully, pay only through our official checkout, and exercise good personal judgment as an attendee. If something doesn't look right, report it to us before booking.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}