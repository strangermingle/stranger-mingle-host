import { createClient } from '@/lib/supabase/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://host.strangermingle.com';

export async function GET() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from('events')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${(events || [])
      .map((event) => `
        <url>
          <loc>${SITE_URL}/events/${event.slug}</loc>
          <lastmod>${event.updated_at ? new Date(event.updated_at).toISOString() : new Date().toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>0.8</priority>
        </url>
      `).join('')}
    </urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
