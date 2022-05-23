/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  webpack(config, { isServer }) {
    config.resolve.alias["vscode"] = require.resolve(
      "@codingame/monaco-languageclient/lib/vscode-compatibility"
    );
    config.experiments = {
      topLevelAwait: true,
      layers: true,
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
      };
    }
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });

    return config;
  },
};
