/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  // Headers de seguridad HTTP en todas las rutas
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',            value: 'DENY' },
          { key: 'X-XSS-Protection',           value: '1; mode=block' },
          { key: 'Referrer-Policy',             value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',          value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",   // Next.js necesita esto
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              `connect-src 'self' https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}`,
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Redirigir /login al flujo de Auth0
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/api/auth/login',
        permanent: false,
      },
    ];
  },

  // Variables de entorno públicas (visibles en el cliente)
  env: {
    NEXT_PUBLIC_AUTH0_DOMAIN: process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '') || '',
  },
};

module.exports = nextConfig;
