/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  crossOrigin: 'anonymous',
  basePath: "/api",
  "headers": {
    "Content-Security-Policy": "default-src 'self'; img-src 'self' https://cdn.sanity.io; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'",
    "Feature-Policy": "'none'",
    "Referrer-Policy": "same-origin",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1"
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }
        ]
      }
    ]
  }
};

module.exports = nextConfig;
