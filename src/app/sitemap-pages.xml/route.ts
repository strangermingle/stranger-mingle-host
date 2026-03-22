const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://host.strangermingle.com';

export async function GET() {
  const staticPages = [
    '',
    '/events',
    '/about',
    '/contact',
    '/faqs',
    '/terms',
    '/privacy-policy',
  ];

  const pages = [...staticPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages
      .map((route) => `
        <url>
          <loc>${SITE_URL}${route}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>${route === '' ? 'daily' : 'weekly'}</changefreq>
          <priority>${route === '' ? '1.0' : '0.6'}</priority>
        </url>
      `).join('')}
    </urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
