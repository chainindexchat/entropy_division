import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";
import { createRequire } from "module";
import mdxMermaid from "mdx-mermaid";

const require = createRequire(import.meta.url);

const BUILD_OUTPUT = process.env.NEXT_STANDALONE_OUTPUT
  ? "standalone"
  : undefined;

export default () => {
  const nextConfig: NextConfig = {
    output: BUILD_OUTPUT,
    cleanDistDir: true,
    // Configure pageExtensions to include markdown and MDX files
    pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
    // Disable SWC minifier for Alpine ARM64 stability (prevents SIGSEGV)
    swcMinify: process.env.DOCKER_BUILD === "1" ? false : true,
    devIndicators: {
      position: "bottom-right",
    },
    env: {
      NO_HTTPS: process.env.NO_HTTPS,
    },
    experimental: {
      taint: true,
      authInterrupts: true,
      esmExternals: "loose",
      // Disable worker threads during Docker build to prevent SIGSEGV
      workerThreads: process.env.DOCKER_BUILD === "1" ? false : undefined,
      cpus: process.env.DOCKER_BUILD === "1" ? 1 : undefined,
    },
    transpilePackages: [
      "@midnight-setup/midnight-setup-contract",
      "@midnight-ntwrk/compact-runtime",
      "@midnight-ntwrk/onchain-runtime",
    ],
    webpack: (config, { isServer }) => {
      // Set webpack target to support modern async features including WASM
      if (!isServer) {
        config.target = "web";

        // Fix isomorphic-ws to provide named WebSocket export
        config.resolve.alias = {
          ...config.resolve.alias,
          "isomorphic-ws": require.resolve(
            "../../packages/midnight-ui/src/shims/isomorphic-ws.js",
          ),
        };

        // Add fallbacks for Node.js modules in browser
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
        };
      }

      // Ensure proper ESM/CJS interop for @midnight-ntwrk packages
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      config.module.rules.push({
        test: /\.m?js$/,
        include: /@midnight-ntwrk/,
        resolve: {
          fullySpecified: false,
        },
      });

      // Configure webpack experiments for WASM
      // Using syncWebAssembly since midnight packages have top-level WASM access
      config.experiments = {
        ...config.experiments,
        syncWebAssembly: true,
        topLevelAwait: true,
        layers: true,
      };

      // Configure output for WASM modules
      config.output = {
        ...config.output,
        webassemblyModuleFilename: "static/wasm/[modulehash].wasm",
      };

      // Handle .wasm files as sync WebAssembly modules
      config.module.rules.push({
        test: /\.wasm$/,
        type: "webassembly/sync",
      });

      return config;
    },
  };
  const withNextIntl = createNextIntlPlugin();
  const withMDX = createMDX({
    extension: /\.(md|mdx)$/,
    options: {
      remarkPlugins: [mdxMermaid],
      rehypePlugins: [],
    },
  });
  return withMDX(withNextIntl(nextConfig));
};
