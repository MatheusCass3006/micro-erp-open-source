import type { NextConfig } from "next";

// Config exclusivo para o build offline (app desktop)
// Gera HTML estático em .next-offline/
const nextConfig: NextConfig = {
  output: "export",
  distDir: ".next-offline",
  images: { unoptimized: true },
  trailingSlash: false,
};

export default nextConfig;


