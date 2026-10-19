import type { MetadataRoute } from 'next';
export default function robots():MetadataRoute.Robots {
  return {
    rules:[{
      userAgent:'*',
      allow:['/','/discover'],
      disallow:[
        '/api/','/result','/searching','/capsule',
        '/my-capsules','/payment/','/recover',
      ],
    }],
    sitemap:'https://areyourare.ai.studio/sitemap.xml',
  };
}
