/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  webpack(config) {
    config.resolve.alias["vscode"] = require.resolve(
      "@codingame/monaco-languageclient/lib/vscode-compatibility"
    );
    return config;
  },
};
