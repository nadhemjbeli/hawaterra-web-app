import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server serve HMR/static chunks when opened from a phone on
  // the LAN instead of localhost. Update this if the computer's LAN IP
  // changes (check with `ip -4 addr` or the URL Next.js prints on startup).
  allowedDevOrigins: ["192.168.1.21"],
};

export default nextConfig;
