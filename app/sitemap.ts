import type { MetadataRoute } from 'next';
const base='https://areyourare.ai.studio';
export default function sitemap():MetadataRoute.Sitemap {
  return [
    {url:base,changeFrequency:'weekly',priority:1},
    {url:base+'/discover',changeFrequency:'monthly',priority:.8},
    {url:base+'/privacy',changeFrequency:'yearly',priority:.2},
    {url:base+'/terms',changeFrequency:'yearly',priority:.2},
    {url:base+'/refunds',changeFrequency:'yearly',priority:.2},
  ];
}
