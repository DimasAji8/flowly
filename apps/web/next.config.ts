import type { NextConfig } from "next";

const isExport = process.env.EXPORT_MOBILE === "true";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: isExport,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  ...(isExport ? { output: "export" } : {}),
  // SEO optimizations
  compress: true,
  poweredByHeader: false,
  // Generate static sitemap
  ...(isExport ? {} : {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on'
            },
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN'
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin'
            },
          ],
        },
      ]
    },
  }),
};

export default nextConfig;
