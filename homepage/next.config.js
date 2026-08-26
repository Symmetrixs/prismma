/** type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aechplmlllfzqqfpnodx.supabase.co';

const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://api.fontshare.com https://fonts.googleapis.com",
              "font-src 'self' https://api.fontshare.com https://fonts.gstatic.com data:",
              `img-src 'self' data: ${supabaseUrl}`,
              `media-src 'self' ${supabaseUrl}`,
              "frame-src https://maps.google.com https://www.google.com",
              `connect-src 'self' ${apiUrl}`,
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
