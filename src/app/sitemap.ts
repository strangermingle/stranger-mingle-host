import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://host.strangermingle.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Return the main sitemap segments
  return [
    {
      url: `${SITE_URL}/sitemap-pages.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/sitemap-events.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]
}
