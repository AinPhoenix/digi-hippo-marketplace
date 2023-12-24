/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        pathname: "/media/**",
        hostname: "localhost",
        port: "3000",
        protocol: "http",
      },
    ],
  },
};

module.exports = nextConfig;
