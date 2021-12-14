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
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
};
