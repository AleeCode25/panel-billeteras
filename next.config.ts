import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Advertencia: Esto permitirá que se haga build con errores de ESLint.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
