/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // CRITICAL FIX: Expose the API_KEY to the client-side bundle.
  // This allows the existing components (Dashboard, SupportWidget) to access process.env.API_KEY
  // directly in the browser, replicating the behavior of the previous Vite app.
  env: {
    API_KEY: process.env.API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  images: {
    domains: [
      'images.unsplash.com', 
      'grainy-gradients.vercel.app', 
      'source.unsplash.com'
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;