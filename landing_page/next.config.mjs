/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Enable ESLint checking during builds for production
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Ensure TypeScript errors are treated as build failures
    ignoreBuildErrors: false,
  },
  images: {
    // Enable Next.js built-in image optimization
    unoptimized: false,
  },
}

export default nextConfig