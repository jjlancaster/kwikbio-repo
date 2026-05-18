import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // Ensure Secret Manager client runs only server-side
  serverRuntimeConfig: {
    GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
  },
}

export default nextConfig
