import type { NextConfig } from 'next';

// User's custom Next.js configuration
// NOTE: basePath is handled by Webflow Cloud builder
const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Expose the mount path to client code so fetch() and plain <img> can
  // prefix it (Next.js's basePath only auto-prefixes <Link>/<Image>/router).
  // Webflow Cloud sets basePath but not this variable: per its docs, set
  // NEXT_PUBLIC_BASE_PATH in the environment's variables to the mount path
  // (e.g. /savings) and update it whenever the mount path changes.
  env: {
    NEXT_PUBLIC_BASE_PATH:
      process.env.NEXT_PUBLIC_BASE_PATH || process.env.COSMIC_MOUNT_PATH || '',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
      },
    ],
  },
};

export default nextConfig;
