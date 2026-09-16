/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    /* 16 narrowed this to [75]; the book's full-screen photographs ask for 90 */
    qualities: [75, 90],
  },
};
export default nextConfig;
