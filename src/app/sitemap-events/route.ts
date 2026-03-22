import { NextResponse } from 'next/server';
import { getAllLiveEvents } from '@/lib/events';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://host.strangermingle.com';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
    try {
        // Fetch all live events
        const events = await getAllLiveEvents();

        // Build XML sitemap
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${events.map((event) => {
            const eventSlug = event.slug || event.id;
            const url = `${BASE_URL}/events/${eventSlug}`;

            // Use updated_at if available, otherwise use created_at
            const lastmod = (event as any).updated_at
                ? new Date((event as any).updated_at).toISOString().split('T')[0]
                : new Date((event as any).created_at).toISOString().split('T')[0];

            return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
        }).join('\n')}
</urlset>`;

        // Return XML with proper headers
        return new NextResponse(sitemap, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
            },
        });
    } catch (error) {
        console.error('Error generating events sitemap:', error);

        // Return empty sitemap on error to avoid breaking search engines
        const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

        return new NextResponse(emptySitemap, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
            },
        });
    }
}

// Helper function to escape special XML characters
function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}
