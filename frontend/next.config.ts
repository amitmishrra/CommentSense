import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Calls to /api/* will be proxied
        destination: 'http://localhost:6969/rag/ask', // Replace with your API URL
      },
    ];
  },
};

export default nextConfig;
