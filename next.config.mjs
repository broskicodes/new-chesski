/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export"
}

export default {
  ...nextConfig,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  }
}
