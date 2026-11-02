/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  serverExternalPackages: ['@react-pdf/renderer', '@react-pdf/layout', '@react-pdf/textkit', '@react-pdf/font', '@react-pdf/pdfkit', 'pdfkit', 'fontkit'],
  outputFileTracingIncludes: {
    '/api/quotes/[id]/pdf': ['./node_modules/pdfkit/js/standard-fonts/**/*'],
    '/api/warranties/[id]/pdf': ['./node_modules/pdfkit/js/standard-fonts/**/*'],
  },
  turbopack: {},
};

export default nextConfig;
