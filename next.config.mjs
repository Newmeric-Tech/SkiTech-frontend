/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint runs separately in CI; skip it during `next build` to avoid
    // circular-structure serialisation bugs in some eslint-plugin-react versions.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Uncomment if you want to skip TS errors during build too (not recommended).
    // ignoreBuildErrors: true,
  },
};

export default nextConfig;
