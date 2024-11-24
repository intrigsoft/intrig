//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false
  },
  distDir: '../../dist/apps/intrig/web/.next',
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    })

    return config;
  },
  env: {
    NEXT_FORCE_SERVER_SIDE: "true"
  }
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx
];

module.exports = composePlugins(...plugins)(nextConfig);
