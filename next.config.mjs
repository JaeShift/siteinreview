/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.squarespace-cdn.com",
      },
      {
        protocol: "http",
        hostname: "static1.squarespace.com",
      },
      {
        protocol: "https",
        hostname: "newmedia.taplist.io",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "cards.scryfall.io",
      },
      {
        protocol: "https",
        hostname: "api.scryfall.com",
      },
    ],
  },
};

export default nextConfig;
