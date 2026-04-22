import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: { domains: ['lh3.googleusercontent.com'] },
  transpilePackages: ['react-markdown'],
}

export default nextConfig
