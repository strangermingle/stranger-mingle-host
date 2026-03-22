import type { Metadata } from "next";
import {
    RefreshCcw,
    CalendarX,
    AlertCircle,
    CreditCard,
    Clock,
    CheckCircle2,
    XCircle,
    HelpCircle,
    ShieldAlert,
    Ticket,
    GraduationCap,
    Gift,
    ArrowRightLeft,
    IndianRupee,
    Users
} from "lucide-react";

export const metadata: Metadata = {
    title: "Refund and Cancellation Policy | Stranger Mingle — India's Event Ticketing Platform",
    description: "Understand Stranger Mingle's refund and cancellation policy for event tickets — including organiser-cancelled events, attendee cancellations, ticket transfers, and payout terms.",
    alternates: {
        canonical: "/refund-policy",
    },
};

export default function RefundPolicy() {
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
                        Refund and Cancellation Policy
                    </h1>
                    <p className="text-gray-500 max-w-xl mx-auto text-lg">
                        Clear, fair terms for ticket refunds, event cancellations, and organiser payouts — for both attendees and event organisers on Stranger Mingle.
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
                                This policy covers refund and cancellation terms for ticket purchases on our platform — applicable to attendees who buy tickets and to event organisers who sell tickets through Stranger Mingle. Please read this carefully before purchasing a ticket or listing an event.
                            </p>
                        </div>
                    </div>

                    {/* General Policy */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 shrink-0">
                                <RefreshCcw className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Fair Ticketing</h2>
                                <p className="leading-relaxed mb-4 text-gray-600">
                                    Stranger Mingle is a two-sided ticketing marketplace — attendees buy tickets, and organisers sell them. This means our refund policy must balance the interests of both. When an attendee purchases a ticket, the organiser begins incurring real costs — venue bookings, resource planning, material procurement, and capacity commitments. Last-minute cancellations affect not just the organiser but every other attendee who booked for that event.
                                </p>
                                <p className="leading-relaxed text-gray-600">
                                    This policy is designed to be fair to everyone. Attendees get reasonable flexibility, organisers get protection against last-minute attrition, and Stranger Mingle ensures the platform remains trustworthy for all parties.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Standard Cancellation Policy — Attendees */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shrink-0">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">1. Standard Ticket Cancellation Policy for Attendees</h2>
                                <p className="text-gray-500 text-sm mb-6">Applies to all standard events listed on Stranger Mingle unless the organiser specifies different terms on the event page.</p>

                                <div className="space-y-6">
                                    <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                                        <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Cancellation 48+ Hours Before the Event</h3>
                                        <p className="leading-relaxed mb-2 text-green-800">
                                            <strong>Full Refund or Event Credit:</strong> Cancel at least 48 hours before the event start time and you receive either:
                                        </p>
                                        <ul className="space-y-1 text-green-800 text-sm ml-6 list-disc">
                                            <li>100% refund to your original payment method (processed within 5–7 business days), OR</li>
                                            <li>100% credit usable for any future Stranger Mingle event ticket</li>
                                        </ul>
                                        <p className="mt-2 text-xs text-green-700 font-medium">Example: For a Sunday 10 AM event, cancel by Friday 10 AM to get a full refund.</p>
                                    </div>

                                    <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                                        <h3 className="text-lg font-bold text-yellow-900 mb-2 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Cancellation 24–48 Hours Before the Event</h3>
                                        <p className="leading-relaxed mb-2 text-yellow-800">
                                            <strong>50% Refund or 75% Credit:</strong> Cancel in this window and you receive:
                                        </p>
                                        <ul className="space-y-1 text-yellow-800 text-sm ml-6 list-disc">
                                            <li>50% refund to your original payment method, OR</li>
                                            <li>75% credit for future event tickets (bonus for choosing credit over refund)</li>
                                        </ul>
                                        <p className="mt-2 text-xs text-yellow-700 font-medium">Example: For a Sunday 10 AM event, this window is Saturday 10 AM – Friday 10 AM.</p>
                                    </div>

                                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                                        <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2"><XCircle className="w-5 h-5" /> Cancellation Less Than 24 Hours Before the Event</h3>
                                        <p className="leading-relaxed mb-2 text-red-800">
                                            <strong>No Refund:</strong> Cancellations within 24 hours of the event are not eligible for a refund. However:
                                        </p>
                                        <ul className="space-y-1 text-red-800 text-sm ml-6 list-disc">
                                            <li>You may transfer your ticket to another eligible person (contact us immediately)</li>
                                            <li>Genuine emergencies — medical or family — are reviewed case by case with documentation</li>
                                        </ul>
                                        <p className="mt-2 text-xs text-red-700 font-medium">Example: For a Sunday 10 AM event, cancellations after Saturday 10 AM are non-refundable.</p>
                                    </div>

                                    <div className="bg-gray-100 p-6 rounded-2xl border border-gray-200">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">No-Shows — Booked but Did Not Attend</h3>
                                        <p className="leading-relaxed mb-2 text-gray-700">
                                            <strong>No Refund + Account Warning:</strong> If you book a ticket and do not show up without notifying us:
                                        </p>
                                        <ul className="space-y-1 text-gray-700 text-sm ml-6 list-disc">
                                            <li>No refund will be issued under any circumstances</li>
                                            <li>First no-show: Warning issued to your account</li>
                                            <li>Second no-show: Account may be restricted from future bookings</li>
                                            <li>Third no-show: Account may be permanently suspended</li>
                                        </ul>
                                        <p className="mt-2 text-xs text-gray-500 ">
                                            No-shows disrespect the organiser's planning and block spots for genuine attendees. We take this seriously on our platform.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Special Event Categories */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shrink-0">
                                <Ticket className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">2. Cancellation Terms for Specific Event Types</h2>
                                <p className="text-gray-500 text-sm mb-6">Organisers listing these event types on Stranger Mingle are required to apply these stricter cancellation terms, which will be displayed clearly on the event page before purchase.</p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                            <Ticket className="w-4 h-4 text-indigo-500" /> Adventure and Outdoor Events (Treks, Camping, Multi-Day Trips)
                                        </h3>
                                        <p className="mb-2 leading-relaxed text-gray-600">These events require advance permits, transport bookings, and accommodation. Stricter terms apply:</p>
                                        <ul className="space-y-1 text-gray-600 text-sm ml-6 list-disc">
                                            <li><strong>7+ days before:</strong> Full refund or 100% credit</li>
                                            <li><strong>3–7 days before:</strong> 50% refund or 75% credit</li>
                                            <li><strong>Less than 3 days before:</strong> No refund (ticket transfer to another person allowed)</li>
                                        </ul>
                                        <p className="mt-2 text-xs text-gray-500 ">Exact terms will be stated on the event listing page before you purchase.</p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4 text-indigo-500" /> Paid Workshops, Classes, and Training Events
                                        </h3>
                                        <p className="mb-2 leading-relaxed text-gray-600">Events with external instructors, limited capacity, or pre-purchased materials:</p>
                                        <ul className="space-y-1 text-gray-600 text-sm ml-6 list-disc">
                                            <li><strong>5+ days before:</strong> Full refund or 100% credit</li>
                                            <li><strong>2–5 days before:</strong> 50% refund or 75% credit</li>
                                            <li><strong>Less than 2 days before:</strong> No refund</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                            <Gift className="w-4 h-4 text-indigo-500" /> Free Events or Heavily Discounted Promotional Tickets
                                        </h3>
                                        <p className="leading-relaxed text-gray-600">
                                            For free or heavily discounted trial events, standard refund terms may not apply. All applicable terms will be stated clearly on the event page during registration or ticket checkout.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Event Cancellation by Organiser */}
                    <section className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-blue-600 shrink-0 shadow-sm">
                                <CalendarX className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">3. Event Cancellations and Changes by the Organiser</h2>
                                <p className="text-gray-600 text-sm mb-6">When an organiser cancels or significantly changes an event listed on Stranger Mingle, the following terms protect attendees who have already purchased tickets.</p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Complete Event Cancellation by the Organiser</h3>
                                        <p className="mb-3 leading-relaxed text-gray-700">
                                            If an organiser cancels their event for any reason (insufficient ticket sales, venue issues, organiser unavailability, safety concerns), all ticket holders will receive:
                                        </p>
                                        <ul className="space-y-1 text-gray-700 text-sm ml-6 list-disc">
                                            <li><strong>Full 100% refund</strong> to the original payment method, processed within 5–7 business days, OR</li>
                                            <li><strong>110% Stranger Mingle credit</strong> (a 10% bonus as compensation for the inconvenience)</li>
                                            <li>Immediate notification via email and WhatsApp to all ticket holders</li>
                                        </ul>
                                        <p className="mt-3 text-xs text-gray-600 ">Organisers who repeatedly cancel events may have their listing privileges suspended on Stranger Mingle.</p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Event Rescheduled to a New Date</h3>
                                        <p className="mb-3 leading-relaxed text-gray-700">If an organiser reschedules the event to a new date or time:</p>
                                        <ul className="space-y-1 text-gray-700 text-sm ml-6 list-disc">
                                            <li>Existing tickets automatically become valid for the new date</li>
                                            <li>Attendees will be notified with at least 48 hours notice wherever possible</li>
                                            <li>Attendees who cannot make the new date may request a <strong>full refund within 48 hours</strong> of the rescheduling announcement</li>
                                            <li>After that 48-hour window, standard cancellation policy applies</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Minor Changes to Event Details (Venue, Time, Activity)</h3>
                                        <p className="mb-3 leading-relaxed text-gray-700">If an organiser makes minor changes — a nearby venue switch, slight timing adjustment — without a full rescheduling:</p>
                                        <ul className="space-y-1 text-gray-700 text-sm ml-6 list-disc">
                                            <li>Attendees will be notified as early as possible</li>
                                            <li>Existing tickets remain valid</li>
                                            <li>If the change materially affects your ability to attend, contact us within 24 hours for a full refund review</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Ticket Transfers */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 shrink-0">
                                <ArrowRightLeft className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Transferring Your Ticket to Another Person</h2>
                                <p className="leading-relaxed mb-4 text-gray-600">
                                    Can't make it to the event? If you know someone who can attend in your place, you may transfer your ticket to them — free of charge.
                                </p>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Transfer Requirements</h3>
                                        <ul className="space-y-1 text-gray-600 text-sm ml-6 list-disc">
                                            <li>Contact us at least 24 hours before the event</li>
                                            <li>Provide the new attendee's full name, email, and phone number</li>
                                            <li>The new attendee must be eligible per the event's age or other requirements</li>
                                            <li>They must agree to Stranger Mingle's Terms of Service and the organiser's event rules</li>
                                            <li>Ticket transfers are free — no additional platform charges</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">How to Request a Transfer</h3>
                                        <p className="leading-relaxed mb-2 text-gray-600">Contact our support team via:</p>
                                        <ul className="space-y-1 text-gray-600 text-sm ml-6 list-disc">
                                            <li>Email: strangermingleteam@gmail.com</li>
                                            <li>WhatsApp: 7411820025</li>
                                            <li>Contact form on strangermingle.com</li>
                                        </ul>
                                        <p className="mt-2 text-xs text-gray-500 ">
                                            Transfers requested less than 6 hours before the event may not be processed in time. Please plan ahead.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Organiser Payouts */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 shrink-0">
                                <IndianRupee className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">5. Organiser Payout Policy</h2>
                                <p className="text-gray-500 text-sm mb-6">This section applies to individuals and groups who create and sell event tickets on Stranger Mingle.</p>

                                <div className="space-y-6">
                                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">When Do Organisers Get Paid?</h3>
                                        <ul className="space-y-2 text-gray-700 text-sm ml-6 list-disc">
                                            <li>Organiser payouts are processed <strong>within 3–5 business days after the event concludes</strong> successfully</li>
                                            <li>This buffer period allows Stranger Mingle to process any valid attendee refund requests before releasing funds</li>
                                            <li>Payouts are made via UPI or direct bank transfer to the organiser's verified payout account</li>
                                            <li>Stranger Mingle's platform fee is deducted from the total ticket revenue before payout</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Payout Deductions</h3>
                                        <p className="leading-relaxed text-gray-600 mb-2">The organiser receives the ticket revenue minus:</p>
                                        <ul className="space-y-1 text-gray-600 text-sm ml-6 list-disc">
                                            <li>Stranger Mingle's platform fee (as agreed during organiser registration)</li>
                                            <li>Payment gateway processing charges</li>
                                            <li>Any refunds issued to attendees for valid cancellations before the event</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">If an Organiser Cancels Their Own Event</h3>
                                        <ul className="space-y-1 text-gray-600 text-sm ml-6 list-disc">
                                            <li>All collected ticket payments will be refunded to attendees in full</li>
                                            <li>The organiser will receive no payout for that event</li>
                                            <li>Repeated event cancellations by an organiser may result in their account being reviewed or suspended</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Refund Processing */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shrink-0">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Refund Processing and Timeline</h2>

                                <div className="space-y-6">
                                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 mb-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Legal Entity &amp; Billing</h3>
                                        <p className="leading-relaxed text-gray-700">
                                            All ticket payments, platform fees, and refunds are processed by <strong>Salty Media Production (opc) Pvt Ltd</strong>.
                                            On your bank statement or UPI notification, the transaction may appear under the name <strong>Salty Media Production</strong>.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Processing Timeline</h3>
                                        <ul className="space-y-1 text-gray-600 text-sm ml-6 list-disc">
                                            <li>Refund requests are reviewed and approved within <strong>2–3 business days</strong></li>
                                            <li>Once approved, refunds are processed within <strong>5–7 business days</strong></li>
                                            <li>Your bank or payment provider may take an additional 3–5 business days to reflect the amount</li>
                                            <li>Total expected timeline: 7–12 business days from request to money in your account</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Refund Method</h3>
                                        <p className="leading-relaxed text-gray-600">Refunds are always returned to the original payment method used at the time of ticket purchase:</p>
                                        <ul className="space-y-1 text-gray-600 text-sm ml-6 list-disc mt-2">
                                            <li>UPI: Refunded to the same UPI ID</li>
                                            <li>Debit / Credit Card: Credited to the same card</li>
                                            <li>Net Banking: Credited to the originating account</li>
                                            <li>Wallet: Credited to the same wallet balance</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Stranger Mingle Credits</h3>
                                        <p className="leading-relaxed text-gray-600">If you opt for event credits instead of a monetary refund:</p>
                                        <ul className="space-y-1 text-gray-600 text-sm ml-6 list-disc mt-2">
                                            <li>Credits are added to your Stranger Mingle account immediately upon approval</li>
                                            <li>Credits are valid for <strong>12 months</strong> from the date of issue</li>
                                            <li>Credits can be applied to any event ticket purchase across any city on our platform</li>
                                            <li>Credits are non-transferable and cannot be converted back to cash</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Special Circumstances */}
                    <section className="bg-amber-50 p-8 rounded-3xl border border-amber-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-amber-600 shrink-0 shadow-sm">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Exceptional Circumstances — Case-by-Case Review</h2>
                                <p className="leading-relaxed mb-6 text-amber-900 font-medium">
                                    We understand genuine emergencies happen. While our policy is clear, we review exceptional cases individually and with empathy.
                                </p>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Situations We May Consider for Out-of-Policy Refunds:</h3>
                                        <ul className="space-y-1 text-gray-700 text-sm ml-6 list-disc">
                                            <li><strong>Medical Emergencies:</strong> Your own or an immediate family member's hospitalisation (documentation required)</li>
                                            <li><strong>Bereavement:</strong> Death of an immediate family member</li>
                                            <li><strong>Natural Disasters:</strong> Circumstances beyond your control directly preventing attendance</li>
                                            <li><strong>Unavoidable Professional Obligation:</strong> Employer documentation may be requested</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">How to Request an Exception</h3>
                                        <p className="leading-relaxed mb-2 text-gray-700">Contact us as soon as possible with:</p>
                                        <ul className="space-y-1 text-gray-700 text-sm ml-6 list-disc">
                                            <li>Your booking reference number and event details</li>
                                            <li>A clear explanation of the situation</li>
                                            <li>Supporting documentation wherever available</li>
                                        </ul>
                                        <p className="mt-3 text-xs text-amber-800 ">
                                            We review every case fairly. However, approval is not guaranteed and all exception decisions are final.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Non-Refundable Situations */}
                    <section className="bg-red-50 p-8 rounded-3xl border border-red-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-red-600 shrink-0 shadow-sm">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Situations Where Refunds Will Not Be Issued</h2>

                                <p className="leading-relaxed mb-4 text-red-900 font-medium">
                                    Refunds will <strong>NOT</strong> be issued in the following circumstances:
                                </p>

                                <ul className="space-y-2 text-gray-700 text-sm ml-6 list-disc">
                                    <li><strong>Change of Mind:</strong> Deciding you no longer wish to attend after the cancellation window has passed</li>
                                    <li><strong>Personal Schedule Conflicts:</strong> Non-emergency plans that clash with the event</li>
                                    <li><strong>Weather Preferences:</strong> "It's too hot/cold/rainy" — unless the event is officially cancelled by the organiser</li>
                                    <li><strong>Post-Event Dissatisfaction:</strong> After attending the event, if the experience did not meet your personal expectations</li>
                                    <li><strong>Account Violations:</strong> If your account is suspended or banned for breaching platform policies</li>
                                    <li><strong>Late Arrival:</strong> If you arrive late and miss part of or all of the event</li>
                                    <li><strong>Personal Logistics:</strong> Transportation issues, traffic, or other logistical problems on your end</li>
                                    <li><strong>Forgot About the Event:</strong> Not remembering your booking is not grounds for a refund</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* How to Request */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-cyan-50 rounded-2xl text-cyan-600 shrink-0">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">9. How to Request a Cancellation or Refund</h2>

                                <div className="space-y-6">
                                    <div className="bg-cyan-50 p-6 rounded-2xl">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Step-by-Step Process</h3>
                                        <ol className="list-decimal ml-6 space-y-4 text-cyan-900">
                                            <li>
                                                <strong>Contact us as soon as you know you cannot attend</strong>
                                                <p className="text-sm mt-1 text-cyan-800">The earlier you inform us, the better refund terms you are eligible for.</p>
                                            </li>
                                            <li>
                                                <strong>Share your booking details</strong>
                                                <p className="text-sm mt-1 text-cyan-800">Full name, event name, event date, city, and your booking reference number.</p>
                                            </li>
                                            <li>
                                                <strong>Choose refund or credit</strong>
                                                <p className="text-sm mt-1 text-cyan-800">Tell us whether you prefer a monetary refund or Stranger Mingle credits for a future event ticket.</p>
                                            </li>
                                            <li>
                                                <strong>Receive confirmation</strong>
                                                <p className="text-sm mt-1 text-cyan-800">We will send you a cancellation confirmation and refund status update.</p>
                                            </li>
                                            <li>
                                                <strong>Wait for processing</strong>
                                                <p className="text-sm mt-1 text-cyan-800">Refunds: 5–7 business days. Credits: Added immediately upon approval.</p>
                                            </li>
                                        </ol>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Contact Channels</h3>
                                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                                            <p className="mb-2 text-gray-700"><strong>Email:</strong> strangermingleteam@gmail.com</p>
                                            <p className="mb-2 text-gray-700"><strong>WhatsApp:</strong> 7411820025</p>
                                            <p className="mb-2 text-gray-700"><strong>Website:</strong> Contact form on strangermingle.com</p>
                                            <p className="text-sm text-gray-500 mt-3">
                                                <strong>Response Time:</strong> We aim to respond within 24 hours on business days
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Disputes */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-50 rounded-2xl text-gray-600 shrink-0">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Refund Disputes and Resolution</h2>
                                <p className="leading-relaxed mb-4 text-gray-600">
                                    If you believe a refund decision was made in error or you are unsatisfied with the resolution provided:
                                </p>
                                <ol className="list-decimal ml-6 space-y-2 text-gray-600 text-sm">
                                    <li><strong>Contact us directly first</strong> — Email strangermingleteam@gmail.com with "Refund Dispute" in the subject line</li>
                                    <li><strong>Include all relevant details</strong> — Booking reference, original cancellation request, and reason for the dispute</li>
                                    <li><strong>We will review within 3–5 business days</strong> — A senior team member will personally review your case</li>
                                    <li><strong>Final decision will be communicated in writing</strong> — All refund dispute decisions are final once reviewed</li>
                                </ol>
                            </div>
                        </div>
                    </section>

                    {/* Payment Gateway */}
                    <section className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-blue-600 shrink-0 shadow-sm">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Payment Gateway Processing Charges</h2>
                                <p className="leading-relaxed mb-4 text-gray-700">
                                    All ticket payments on Stranger Mingle are processed through secure third-party Indian payment gateways (such as Razorpay or Cashfree). Please note:
                                </p>
                                <ul className="space-y-1 text-gray-700 text-sm ml-6 list-disc">
                                    <li>Payment gateway charges (typically 2–3%) are non-refundable, even when you receive a full ticket refund</li>
                                    <li>For example: For a ₹500 ticket with a full refund, you may receive approximately ₹485–490 back to your account</li>
                                    <li>These charges are levied by the payment provider — not by Stranger Mingle</li>
                                    <li>Choosing Stranger Mingle credits instead of a monetary refund gives you 100% of your payment value with no gateway deductions</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Policy Changes */}
                    <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gray-50 rounded-2xl text-gray-600 shrink-0">
                                <RefreshCcw className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Policy</h2>
                                <p className="leading-relaxed mb-4 text-gray-600">
                                    Stranger Mingle reserves the right to update this Refund and Cancellation Policy at any time. However:
                                </p>
                                <ul className="space-y-1 text-gray-600 text-sm ml-6 list-disc">
                                    <li>Policy changes will not affect tickets already purchased — the policy at the time of your purchase applies</li>
                                    <li>Organisers will be notified of any changes that affect their payout terms</li>
                                    <li>All members will be notified of significant policy changes via email</li>
                                    <li>The updated policy will always be available on this page with a revised "Last Updated" date</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Final Note */}
                    <section className="bg-gray-50 p-8 rounded-3xl border border-gray-200">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-gray-600 shrink-0 shadow-sm">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Our Philosophy on Refunds</h3>
                                <p className="leading-relaxed mb-4 text-gray-700">
                                    We want both attendees and organisers to feel confident using Stranger Mingle. Attendees should be able to purchase tickets knowing there is a fair, transparent process if plans change. Organisers should be able to list events knowing that no-shows and last-minute cancellations won't undermine their hard work.
                                </p>
                                <p className="leading-relaxed mb-4 text-gray-700">
                                    These policies exist to protect the platform's integrity — not to trap anyone's money unfairly. If you have a genuine concern or a situation that doesn't neatly fit the policy, reach out to us. We are a small, passionate team running a platform we care deeply about.
                                </p>
                                <p className="leading-relaxed font-medium text-gray-900">
                                    When in doubt, just contact us. We will sort it out together.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}