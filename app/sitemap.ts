import { MetadataRoute } from 'next';
import { SUPPORTED_FORMATS } from '@/lib/reader-formats';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://luminareader.com';

  const staticPages = [
    '',
    '/tools',
    '/about',
    '/privacy',
    '/terms',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const formatPages = Object.keys(SUPPORTED_FORMATS).map((slug) => ({
    url: `${baseUrl}/read/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...formatPages];
}
