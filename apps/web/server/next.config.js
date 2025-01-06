/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });

    return config;
  },
  env: {
    NEXT_FORCE_SERVER_SIDE: "true"
  }
};

module.exports = nextConfig;
