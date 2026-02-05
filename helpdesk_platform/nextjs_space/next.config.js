/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removemos distDir, output e experimental.outputFileTracingRoot
  // Deixe a Vercel gerenciar isso automaticamente.

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Se quiser garantir que não falhe por TS, pode mudar para true, 
    // mas false é o padrão seguro para qualidade de código.
    ignoreBuildErrors: false, 
  },
  images: { 
    unoptimized: true 
  },
};

module.exports = nextConfig;