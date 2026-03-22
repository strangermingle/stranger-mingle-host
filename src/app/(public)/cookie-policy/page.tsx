import type { Metadata } from 'next';
import CookieConsentManager from '@/components/CookieConsentManager';

export const metadata: Metadata = {
    title: "Cookie Policy | Stranger Mingle — India's Event Ticketing Platform",
    description: "Learn how Stranger Mingle uses cookies to improve your event browsing and ticket booking experience, and how you can manage your cookie preferences.",
    alternates: {
        canonical: "/cookie-policy",
    },
};

export default function CookiePolicy() {
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
                        Cookie Policy
                    </h1>
                    <p className="text-gray-500 max-w-xl mx-auto text-lg">
                        How Stranger Mingle uses cookies to personalise your event discovery and ticket booking experience — and how you can manage them.
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-pink-600 mx-auto rounded-full mt-6"></div>
                </div>

                <CookieConsentManager />
            </div>
        </div>
    );
}