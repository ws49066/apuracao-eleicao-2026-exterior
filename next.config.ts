import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "resultados.tse.jus.br" },
      { protocol: "https", hostname: "resultados-sim.tse.jus.br" },
    ],
  },
};

export default nextConfig;
