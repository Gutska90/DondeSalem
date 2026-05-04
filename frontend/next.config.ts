import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "images.pokemontcg.io", pathname: "/**" },
      { protocol: "https", hostname: "cards.scryfall.io", pathname: "/**" },
      { protocol: "https", hostname: "images.ygoprodeck.com", pathname: "/**" },
      { protocol: "https", hostname: "cdnx.jumpseller.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
