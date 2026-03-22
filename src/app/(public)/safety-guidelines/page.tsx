import type { Metadata } from "next";
import {
    Shield,
    ClipboardCheck,
    UserCheck,
    MapPin,
    AlertTriangle,
    Eye,
    Lock,
    Users,
    Heart,
    ThumbsDown,
    Handshake,
    Siren,
    Megaphone,
    Briefcase,
    ShieldCheck,
    Beer,
    Smartphone,
    IndianRupee,
    HeartHandshake,
    Ticket,
    QrCode
} from "lucide-react";

export const metadata: Metadata = {
    title: "Safety Guidelines for Event Attendees and Organisers | Stranger Mingle",
    description: "Stranger Mingle's safety guidelines for attending ticketed events and organising events in India. Covers attendee safety, organiser responsibilities, prohibited conduct, and emergency procedures.",
    alternates: {
        canonical: "/safety-guidelines",
    },
};

export default function SafetyGuidelines() {
    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-4xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
                {/* Hero Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-6">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        Platform Safety
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-600 pb-2">
                        Safety Guidelines
                    </h1>
                    <p className="text-gray-500 max-w-xl mx-auto text-lg">
                        For attendees buying tickets and for organisers hosting events on Stranger Mingle — safety is non-negotiable on our platform.
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-pink-600 mx-auto rounded-full mt-6"></div>
                </div>

                <div className="space-y-8">
                    {/* Intro */}
                    <div className="bg-orange-500 p-8 rounded-3xl shadow-lg text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
                        <div className="relative z-10 flex items-start gap-4">
                            <div className="p-3 bg-white/10 rounded-2xl shrink-0 backdrop-blur-sm">
                                <ShieldCheck className="w-8 h-8 text-orange-100" />
                            </div>
                            <div>
                                <p className="font-bold text-xl mb-3 text-orange-50">Safety is the Foundation of Every Event on Stranger Mingle</p>
                                <p className="leading-relaxed text-lg text-orange-100">
                                    <strong>Stranger Mingle</strong> is a brand of <strong>Salty Media Production (opc) Pvt Ltd</strong>.
                                    As India's event ticketing platform, we connect attendees with event organisers across Indian cities. This creates a shared responsibility — organisers must deliver safe, honest events, and attendees must behave with respect and integrity. These guidelines apply to everyone on our platform.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Before Attending — Attendees */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shrink-0">
                                <ClipboardCheck className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Before Attending a Ticketed Event</h2>
                                <p className="text-gray-500 text-sm mb-6">Steps every attendee should take before showing up to an event booked through Stranger Mingle.</p>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-5 rounded-2xl">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2"><UserCheck className="w-4 h-4 text-blue-500" /> Register with Accurate Information</h3>
                                            <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                                <li>Use your real name and genuine contact details when booking tickets</li>
                                                <li>Complete any attendee verification required for the event</li>
                                                <li>Fake identities or false information compromise everyone's safety and will result in account suspension</li>
                                            </ul>
                                        </div>

                                        <div className="bg-gray-50 p-5 rounded-2xl">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /> Tell Someone Before You Go</h3>
                                            <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                                <li>Inform a trusted friend or family member of the event name, location, and expected return time</li>
                                                <li>Keep your phone charged throughout the event</li>
                                                <li>Share the event organiser's contact number with your emergency contact if attending alone</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-5 rounded-2xl">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" /> Verify the Event Before Attending</h3>
                                            <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                                <li>Read the full event description, requirements, and organiser details on the Stranger Mingle listing</li>
                                                <li>Confirm the venue is a public, accessible location</li>
                                                <li>If anything looks suspicious about an event listing, report it to us before attending</li>
                                                <li>Only book tickets through strangermingle.com — do not pay outside the platform</li>
                                            </ul>
                                        </div>

                                        <div className="bg-gray-50 p-5 rounded-2xl">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2"><Heart className="w-4 h-4 text-blue-500" /> Physical Preparedness</h3>
                                            <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                                <li>Ensure you are physically fit for activity-based events such as treks or cycling tours</li>
                                                <li>Disclose relevant health conditions to the organiser ahead of time</li>
                                                <li>Bring necessary medications or medical equipment</li>
                                                <li>Do not attend if you are feeling unwell — contact us for a reschedule or refund</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Ticket & Entry Safety */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 shrink-0">
                                <QrCode className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Safety and Entry Verification</h2>
                                <p className="text-gray-500 text-sm mb-6">Protecting the integrity of every event through secure ticketing.</p>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">For Attendees</h3>
                                        <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                            <li>Your QR ticket is unique and encrypted — do not share it with others</li>
                                            <li>Each QR code is valid for one-time scan only — duplicate tickets are automatically rejected</li>
                                            <li>Always book tickets only through the official Stranger Mingle platform or app</li>
                                            <li>If you receive a ticket through a third-party seller, it may be invalid — Stranger Mingle is not responsible for such purchases</li>
                                            <li>Carry a valid ID to events where the organiser requires identity verification at entry</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Spot Suspicious Listings</h3>
                                        <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                            <li>Legitimate events on Stranger Mingle are created by verified organisers — look for the verified badge</li>
                                            <li>Be cautious of events with no organiser details, vague descriptions, or unusually low prices</li>
                                            <li>Never pay for tickets via UPI directly to a person — all payments go through Stranger Mingle's secure checkout</li>
                                            <li>Report any suspicious listings to strangermingleteam@gmail.com before purchasing</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* During Events */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-50 rounded-2xl text-green-600 shrink-0">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">During Events — Personal Safety</h2>
                                <p className="text-gray-500 text-sm mb-6">Guidelines for staying safe at any Stranger Mingle ticketed event.</p>

                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">Stay in Designated Spaces</h3>
                                            <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                                <li>All events on Stranger Mingle are held at public, vetted venues</li>
                                                <li>Do not leave the event venue with someone you just met at the event</li>
                                                <li>If you need to step out, inform the event organiser</li>
                                                <li>Stay with the group during outdoor or adventure activities</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2"><Eye className="w-4 h-4 text-green-500" /> Trust Your Instincts</h3>
                                            <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                                <li>If something or someone makes you uncomfortable, trust that feeling</li>
                                                <li>You have the right to decline any conversation or interaction</li>
                                                <li>Inform the event organiser immediately if you feel unsafe</li>
                                                <li>Leave the event if you need to — your safety always comes first</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-100 w-full"></div>

                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2"><Lock className="w-4 h-4 text-green-500" /> Protect Your Information</h3>
                                            <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                                <li>You are not obligated to share personal details beyond your first name</li>
                                                <li>Do not share your home address, workplace, or daily routine</li>
                                                <li>Be cautious before sharing social media handles with strangers</li>
                                                <li>Never feel pressured to exchange contact details</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2"><Briefcase className="w-4 h-4 text-green-500" /> Manage Your Belongings</h3>
                                            <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                                <li>Keep valuables secure and do not bring unnecessary items</li>
                                                <li>Never leave bags, phones, or wallets unattended</li>
                                                <li>Be mindful of pickpockets in crowded event venues</li>
                                                <li>Keep your phone accessible for emergencies at all times</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2"><Beer className="w-4 h-4 text-green-500" /> Alcohol and Substances</h3>
                                            <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                                <li>Do not arrive at events intoxicated</li>
                                                <li>If an event includes alcohol, consume responsibly and know your limits</li>
                                                <li>Watch your drink at all times — do not accept drinks from strangers</li>
                                                <li>Illegal substances are strictly prohibited at all Stranger Mingle events</li>
                                                <li>Arrange safe transportation if you plan to drink</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Women's Safety */}
                    <section className="bg-pink-50 p-8 rounded-3xl border border-pink-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10 flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-pink-600 shrink-0 shadow-sm">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Specific Safety Guidelines for Women Attendees</h2>
                                <p className="leading-relaxed mb-6 text-gray-700 font-medium">
                                    Stranger Mingle is committed to creating event spaces where women feel safe, respected, and genuinely welcome. We have absolute zero tolerance for harassment — at events or directed at attendees from our platform.
                                </p>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">Your Rights at Every Event</h3>
                                            <ul className="space-y-2 text-gray-700 text-sm list-disc ml-5">
                                                <li>You have the right to participate freely without fear of harassment</li>
                                                <li>You have the right to decline any interaction or conversation</li>
                                                <li>You have the right to be treated with dignity and respect by other attendees and organisers</li>
                                                <li>You have the right to report anyone making you uncomfortable — without any consequences to yourself</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">Additional Precautions We Recommend</h3>
                                            <ul className="space-y-2 text-gray-700 text-sm list-disc ml-5">
                                                <li>For your first event on Stranger Mingle, choose a daytime event where possible</li>
                                                <li>Share your live location with a trusted person during the event</li>
                                                <li>Arrange your own transportation — do not rely on strangers for rides</li>
                                                <li>If meeting someone from an event one-on-one later, choose a busy public place</li>
                                                <li>Stranger Mingle organisers are briefed to keep a close eye on participant interactions — do not hesitate to approach them</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-pink-200 shadow-sm">
                                        <h4 className="font-bold text-pink-700 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Immediate Action Steps for Harassment</h4>
                                        <p className="leading-relaxed mb-4 text-gray-700 text-sm">If anyone makes unwanted advances, inappropriate comments, or touches you without consent at a Stranger Mingle event:</p>
                                        <ol className="list-decimal space-y-2 text-gray-700 text-sm ml-5 font-medium">
                                            <li>Clearly tell them to stop — you are not obligated to be polite</li>
                                            <li>Immediately alert the event organiser on-ground</li>
                                            <li>Move away from the person and stay near the organiser or a group</li>
                                            <li>Leave the event if you feel unsafe — contact us for a full refund</li>
                                            <li>Report the incident after the event with as much detail as possible</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Prohibited Behavior */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-red-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-50 rounded-2xl text-red-600 shrink-0">
                                <ThumbsDown className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Strictly Prohibited Behaviour on Stranger Mingle</h2>
                                <p className="leading-relaxed font-semibold mb-6 text-red-600">
                                    The following will result in immediate removal from the event, cancellation of all active ticket bookings, and a permanent ban from the platform:
                                </p>

                                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Harassment and Misconduct</h3>
                                        <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                            <li>Sexual harassment of any kind toward any attendee or organiser</li>
                                            <li>Unwanted physical contact or touching</li>
                                            <li>Inappropriate sexual comments, advances, or innuendo</li>
                                            <li>Following, stalking, or repeatedly approaching someone who has declined interaction</li>
                                            <li>Taking photos or videos of others without their explicit consent</li>
                                            <li>Sending unsolicited explicit messages or images after an event</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Discrimination</h3>
                                        <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                            <li>Discrimination based on caste, religion, gender, or skin colour</li>
                                            <li>Discrimination based on economic background, education, or profession</li>
                                            <li>Derogatory comments about someone's identity or background</li>
                                            <li>Exclusionary or elitist behaviour toward other attendees</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Threatening or Violent Behaviour</h3>
                                        <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                            <li>Physical violence or threats of violence</li>
                                            <li>Verbal abuse, bullying, or deliberate intimidation</li>
                                            <li>Aggressive body language or posturing intended to threaten</li>
                                            <li>Hate speech or inciting others against an individual or group</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Misuse of the Platform</h3>
                                        <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                            <li>Organising fraudulent events or misrepresenting what an event offers</li>
                                            <li>Selling tickets outside the Stranger Mingle platform and collecting payments directly</li>
                                            <li>Using attendee data collected via Stranger Mingle for marketing or unauthorised purposes</li>
                                            <li>Recruiting attendees for MLM schemes, business opportunities, or religious conversion</li>
                                            <li>Collecting attendee contact information without consent for outside use</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Illegal Activities</h3>
                                        <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                            <li>Drug use or distribution at or around events</li>
                                            <li>Theft or damage to venue property</li>
                                            <li>Any activity that violates Indian law</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* After Events */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 shrink-0">
                                <Handshake className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">After Events — Safe Interactions Outside the Platform</h2>
                                <p className="text-gray-500 text-sm mb-6">Stranger Mingle connects people at events. What happens after is your personal responsibility — but here's how to stay safe.</p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Meeting People You Connected With at Events</h3>
                                        <p className="leading-relaxed mb-3 text-gray-600">
                                            You may choose to stay in touch with or meet people you connected with at a Stranger Mingle event outside of organised activities. This is your personal choice and responsibility. We recommend the following:
                                        </p>
                                        <div className="bg-purple-50 p-5 rounded-2xl">
                                            <ul className="space-y-2 text-purple-900 text-sm list-disc ml-5">
                                                <li>Meet in busy, public places during daylight hours for initial meetups</li>
                                                <li>Tell someone where you are going and when you expect to return</li>
                                                <li>Arrange your own transportation — do not accept rides from people you have just met</li>
                                                <li>Consider meeting in groups rather than one-on-one initially</li>
                                                <li>Trust your instincts — if something feels wrong, leave without hesitation</li>
                                                <li>You are under no obligation to meet anyone outside of events</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2"><Smartphone className="w-4 h-4 text-purple-500" /> Digital Communication Safety</h3>
                                            <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                                <li>You are not obligated to stay in touch with anyone you met at an event</li>
                                                <li>Block anyone who makes you uncomfortable online — no explanation required</li>
                                                <li>Do not share intimate photos or highly sensitive personal information</li>
                                                <li>Be wary of people who immediately push to move communication to private channels</li>
                                                <li>Report persistent or threatening behaviour to us at strangermingleteam@gmail.com</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2"><IndianRupee className="w-4 h-4 text-purple-500" /> Financial Safety</h3>
                                            <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                                <li>Never lend money to people you have just met at events</li>
                                                <li>Be highly sceptical of urgent financial requests or investment opportunities from fellow attendees</li>
                                                <li>Do not share bank details, UPI credentials, card numbers, or OTPs</li>
                                                <li>Any money-related misconduct should be reported to us and local authorities</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-200">
                                        <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Important Disclaimer</h4>
                                        <p className="leading-relaxed text-yellow-800 text-sm">
                                            Stranger Mingle is an event ticketing platform. We facilitate safe, organised event experiences. What attendees choose to do outside our official events — including personal meetups, relationships, or business dealings — is entirely their own responsibility. Stranger Mingle cannot verify, monitor, or be held liable for interactions that occur outside of our organised events and official platform.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Emergency Situations */}
                    <section className="bg-red-50 p-8 rounded-3xl border border-red-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-red-600 shrink-0 shadow-sm">
                                <Siren className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Situations at Events</h2>

                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">If You Experience or Witness an Emergency</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="bg-white p-4 rounded-xl border border-red-100">
                                                <strong className="text-red-700 block mb-1">Immediate Physical Danger</strong>
                                                <span className="text-gray-600 text-sm">Call police (100) or national emergency services (112) first. Move to safety immediately.</span>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-red-100">
                                                <strong className="text-red-700 block mb-1">Medical Emergency</strong>
                                                <span className="text-gray-600 text-sm">Call ambulance (108) immediately and inform the event organiser on-ground.</span>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-red-100">
                                                <strong className="text-red-700 block mb-1">Harassment or Safety Threat</strong>
                                                <span className="text-gray-600 text-sm">Alert the event organiser immediately and move away from the person. Leave if necessary.</span>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-red-100">
                                                <strong className="text-red-700 block mb-1">Lost or Separated at Event</strong>
                                                <span className="text-gray-600 text-sm">Contact the event organiser via their listed number. Stay in a visible public area.</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-red-200 w-full"></div>

                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4">Important Emergency Numbers (India)</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 bg-white rounded-lg text-center border border-red-100">
                                                    <div className="text-xs text-gray-500 mb-1">Police</div>
                                                    <div className="text-xl font-bold text-red-600">100</div>
                                                </div>
                                                <div className="p-3 bg-white rounded-lg text-center border border-red-100">
                                                    <div className="text-xs text-gray-500 mb-1">Ambulance</div>
                                                    <div className="text-xl font-bold text-red-600">108</div>
                                                </div>
                                                <div className="p-3 bg-white rounded-lg text-center border border-red-100">
                                                    <div className="text-xs text-gray-500 mb-1">Women&apos;s Helpline</div>
                                                    <div className="text-xl font-bold text-red-600">1091</div>
                                                </div>
                                                <div className="p-3 bg-white rounded-lg text-center border border-red-100">
                                                    <div className="text-xs text-gray-500 mb-1">National Emergency</div>
                                                    <div className="text-xl font-bold text-red-600">112</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">Emergencies Involving Other Attendees After Events</h3>
                                            <p className="leading-relaxed text-gray-700 text-sm bg-white p-4 rounded-xl border border-red-100">
                                                If an incident involving another Stranger Mingle attendee occurs outside of our organised events, contact local authorities first. You may also report the matter to us — we will take appropriate action on the person's platform access, including permanent removal. However, Stranger Mingle cannot intervene in or be held responsible for matters that occur outside our events.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Reporting */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 shrink-0">
                                <Megaphone className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Reporting Violations and Safety Concerns</h2>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">What to Report</h3>
                                            <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                                <li>Harassment or inappropriate behaviour during or after events</li>
                                                <li>Violations of these safety guidelines</li>
                                                <li>Fraudulent or misleading event listings by organisers</li>
                                                <li>Attendees using fake identities or booking tickets under false names</li>
                                                <li>Suspicious behaviour that may endanger others</li>
                                                <li>Organisers misusing attendee data collected via Stranger Mingle</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">How to Report</h3>
                                            <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                                <li><strong>During Events:</strong> Inform the on-ground event organiser immediately</li>
                                                <li><strong>After Events:</strong> Email strangermingleteam@gmail.com with full details</li>
                                                <li><strong>Website:</strong> Use the "Report a Concern" form on strangermingle.com</li>
                                                <li><strong>WhatsApp:</strong> Message our safety team at 7411820025</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">What to Include in Your Report</h3>
                                            <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                                <li>Event name, date, and city</li>
                                                <li>Name or description of the person(s) involved</li>
                                                <li>Detailed account of what happened and when</li>
                                                <li>Names of any witnesses present</li>
                                                <li>Screenshots, photos, or other evidence if safely available</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">What Happens After You Report</h3>
                                            <ul className="space-y-2 text-gray-600 text-sm list-disc ml-5">
                                                <li>We acknowledge all reports within 24 hours</li>
                                                <li>We investigate thoroughly and confidentially</li>
                                                <li>Action is taken as appropriate — warning, suspension, or permanent ban</li>
                                                <li>For serious misconduct, we may escalate to relevant authorities</li>
                                                <li>Your identity is protected unless you choose to disclose it</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 bg-orange-50 p-5 rounded-2xl border border-orange-100 text-center">
                                    <p className="leading-relaxed font-semibold text-orange-900">
                                        All reports are confidential and taken seriously. We will never penalise anyone for raising a genuine safety concern. When in doubt, always report it.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Organiser Responsibilities */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 shrink-0">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Organiser Responsibilities on Stranger Mingle</h2>
                                <p className="text-gray-500 text-sm mb-6">All organisers who list events and sell tickets through Stranger Mingle are required to meet these standards. Failure to comply may result in delisting of events, withholding of payouts, and permanent account suspension.</p>

                                <div className="bg-teal-50 p-6 rounded-2xl mb-6">
                                    <ul className="grid md:grid-cols-2 gap-x-4 gap-y-3 text-teal-900 text-sm list-disc ml-5">
                                        <li>Create accurate, honest event listings — no misleading descriptions, prices, or venue details</li>
                                        <li>Verify attendee entry using Stranger Mingle's QR scanning system</li>
                                        <li>Brief all attendees on basic safety expectations at the start of the event</li>
                                        <li>Actively monitor interactions throughout the event</li>
                                        <li>Intervene immediately and decisively when inappropriate behaviour is observed</li>
                                        <li>Remain accessible to attendees throughout the event for safety concerns</li>
                                        <li>Maintain a list of attendee emergency contacts for outdoor or adventure events</li>
                                        <li>Know the location of the nearest hospital and police station from the venue</li>
                                        <li>Have basic first-aid supplies available for events with physical activity</li>
                                        <li>Use attendee data collected via Stranger Mingle only for managing the specific event</li>
                                    </ul>
                                </div>

                                <p className="leading-relaxed font-medium text-gray-800">
                                    Organisers have full authority to remove any attendee from their event for violating safety guidelines or creating an unsafe environment — without issuing a refund. Stranger Mingle backs this authority and will enforce platform-level consequences for the removed attendee.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Final Note */}
                    <section className="bg-orange-50 p-8 rounded-3xl border border-orange-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-orange-600 shrink-0 shadow-sm">
                                <HeartHandshake className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Safety is a Shared Responsibility on Our Platform</h3>
                                <p className="leading-relaxed mb-4 text-gray-700">
                                    Stranger Mingle provides the platform, the verified organisers, and the structured ticketing system — but safety ultimately depends on everyone doing their part. Attendees need to stay aware, trust their instincts, and speak up. Organisers need to maintain high standards at every event they run.
                                </p>
                                <p className="leading-relaxed mb-4 text-gray-700">
                                    We also count on our community to look out for one another. If you see something wrong at an event — someone being harassed, someone who looks uncomfortable, or something that simply doesn't feel right — speak up. Alert the organiser. Check if the person is okay. Help them reach safety if needed.
                                </p>
                                <p className="leading-relaxed font-medium text-orange-900">
                                    Stranger Mingle exists to connect people through great events across India. These guidelines ensure that every ticket purchased and every event hosted on our platform leads to a safe, positive experience for everyone involved.
                                </p>
                            </div>
                        </div>
                    </section>

                    <p className="text-sm text-gray-500 pt-8 border-t border-gray-200 text-center">
                        By purchasing tickets or listing events on Stranger Mingle, you agree to follow these safety guidelines and contribute to a safe, respectful platform for all users across India.
                    </p>
                </div>
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "headline": "Stranger Mingle Safety Guidelines for Event Attendees and Organisers",
                        "datePublished": new Date().toISOString(),
                        "author": {
                            "@type": "Organization",
                            "name": "Stranger Mingle",
                            "legalName": "Salty Media Production (opc) Pvt Ltd"
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Stranger Mingle",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://host.strangermingle.com/logo.png"
                            }
                        },
                        "description": "Comprehensive safety guidelines for attendees and event organisers on Stranger Mingle, India's event ticketing platform. Covers ticket safety, personal conduct, women's safety, prohibited behaviour, emergency procedures, and reporting mechanisms."
                    }),
                }}
            />
        </div>
    );
}