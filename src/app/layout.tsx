import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import ConsentBanner from "@/components/ConsentBanner";
import GoogleTagManager from "@/components/GoogleTagManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Stranger Mingle — Discover Events & Experiences Near You",
    template: "%s | Stranger Mingle"
  },
  description: "Join India's most active community for weekend stranger meetups and local events. Stranger Mingle is a brand of Salty Media Product (opc) Pvt Ltd.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://host.strangermingle.com'),
  keywords: "weekend events, standup comedy showsstranger meetups, weekend events, make friends, offline meetups, india events, Pune events, Bangalore events, Mumbai events",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Stranger Mingle',
    title: 'Stranger Mingle - Stranger Meetups & Local Events for Making New Friends',
    description: "Join India's most active community for weekend stranger meetups and local events. Make new friends instantly through safe, curated offline experiences.",
    images: [
      {
        url: "/images/og-images/og-image-default.webp",
        width: 1200,
        height: 630,
        alt: "Stranger Mingle - Weekend Social Meetups & Events",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stranger Mingle - Stranger Meetups & Local Events for Making New Friends',
    description: "Join India's most active community for weekend Stranger Meetups to make new friends instantly.",
    images: ["/images/og-images/og-image-default.webp"],
    creator: '@strangermingleindia',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col overflow-x-hidden`}
      >
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        <GoogleTagManager />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Stranger Mingle",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://host.strangermingle.com",
              "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://host.strangermingle.com"}/logo.png`,
              "sameAs": [
                "https://www.instagram.com/strangermingleindia/",
                "https://www.youtube.com/@strangermingleindia",
                "https://www.reddit.com/user/StrangerMingleIndia/",
                "https://www.facebook.com/strangermingleevents"
              ]
            }),
          }}
        />
        <ConsentBanner />
      </body>
    </html>
  );
}
