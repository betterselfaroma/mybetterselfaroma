/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Images are pre-optimised WebP assets (113–225 KB). Serving them as-is
    // avoids the on-the-fly optimiser (which also needs `sharp` in prod) and
    // keeps dev + production behaviour identical.
    unoptimized: true,
  },
};

export default nextConfig;
