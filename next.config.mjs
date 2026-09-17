/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['172.20.10.9', '172.20.10.*', '192.168.*', '10.0.*', 'localhost:3000'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/branches/kadavanthra',
        destination: '/kadavanthra',
        permanent: true,
      },
      {
        source: '/branches/edappally',
        destination: '/edappally',
        permanent: true,
      },
      {
        source: '/branches/kakkanad',
        destination: '/kakkanad',
        permanent: true,
      },
      {
        source: '/branches/fourth-centre',
        destination: '/fourth-centre',
        permanent: true,
      },
      {
        source: '/branches/:slug',
        destination: '/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
