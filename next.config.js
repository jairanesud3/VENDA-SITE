/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // CRITICAL FIX: Expose the API_KEY to the client-side bundle.
  env: {
    API_KEY: process.env.API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  images: {
    domains: [
      'images.unsplash.com', 
      'grainy-gradients.vercel.app', 
      'source.unsplash.com',
      'cdn.leonardo.ai'
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;