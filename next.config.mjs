/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  serverExternalPackages: ['@react-pdf/renderer', '@react-pdf/layout', '@react-pdf/textkit', '@react-pdf/font', '@react-pdf/pdfkit', 'pdfkit', 'fontkit'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
