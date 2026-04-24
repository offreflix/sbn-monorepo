import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";
import { dependencies } from "./package.json";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    define: {
      "import.meta.env.VITE_API_BASE": JSON.stringify(
        process.env.VITE_API_BASE ?? "http://localhost:56080",
      ),
    },
  },
  html: {
    tags: [
      {
        tag: "link",
        attrs: { rel: "preconnect", href: "https://fonts.googleapis.com" },
      },
      {
        tag: "link",
        attrs: {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: true,
        },
      },
      {
        tag: "link",
        attrs: {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
        },
      },
    ],
    title: "SBN Health",
  },
  server: {
    port: 9002,
    open: false,
  },
  output: {
    assetPrefix: process.env.MFE_ASSET_PREFIX || "http://localhost:9002",
  },
  dev: {
    assetPrefix: "http://localhost:9002",
    hmr: true,
    liveReload: true,
    writeToDisk: true,
  },
  tools: {
    rspack: {
      output: {
        uniqueName: "sbn_health_mfe",
      },
      watchOptions: {
        ignored: [
          "**/node_modules/**",
          "**/@mf-types/**",
          "**/dist/**",
          "**/.turbo/**",
          "**/.rsbuild/**",
          "**/*.log",
        ],
        aggregateTimeout: 100,
        poll: 300,
      },
      plugins: [
        new ModuleFederationPlugin({
          name: "sbn_health_mfe",
          exposes: {
            "./App": "./src/app.tsx",
          },
          shared: {
            react: {
              version: dependencies.react,
              singleton: true,
              eager: true,
            },
            "react-dom": {
              version: dependencies["react-dom"],
              singleton: true,
              eager: true,
            },
            "react-router-dom": {
              version: dependencies["react-router-dom"],
              singleton: true,
              eager: true,
            },
          },
          dts: false,
        }),
      ],
    },
  },
});
