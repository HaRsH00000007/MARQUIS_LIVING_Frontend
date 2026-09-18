/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /*
   * Lets a phone on the same network open the dev server by its LAN address
   * (e.g. http://192.168.x.x:3000). Without this Next blocks its dev scripts
   * for any host but localhost, so the page never hydrates on the phone: the
   * menu button does nothing and the scroll-revealed text never appears.
   * Development only — it has no effect on `next build` / `next start`.
   */
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  images: {
    formats: ["image/avif", "image/webp"],
    /* 16 narrowed this to [75]; the book's full-screen photographs ask for 90 */
    qualities: [75, 90],
  },
};
export default nextConfig;
