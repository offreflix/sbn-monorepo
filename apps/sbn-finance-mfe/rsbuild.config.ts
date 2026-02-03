import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack'
import { dependencies } from './package.json'

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact()],
  html: {
    tags: [
      { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
      { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
      { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' } },
    ],
    title: 'SBN Finance',
  },
  server: {
    port: 9001,
  },
  dev: {
    assetPrefix: 'http://localhost:9001',
    hmr: true,
  },
  tools: {
    rspack: {
      output: {
        uniqueName: 'sbn_finance_mfe',
      },
      watchOptions: {
        ignored: [
          '**/node_modules/**',
          '**/@mf-types/**',
          '**/dist/**',
          '**/.turbo/**',
          '**/.rsbuild/**',
          '**/mf-manifest.json',
          '**/*.log',
        ],
        aggregateTimeout: 300,
        poll: false,
      },
      plugins: [
        new ModuleFederationPlugin({
          name: 'sbn_finance_mfe',
          exposes: {
            './App': './src/App.tsx',
          },
          shared: {
            react: {
              version: dependencies.react,
              singleton: true,
              eager: true,
            },
            'react-dom': {
              version: dependencies['react-dom'],
              singleton: true,
              eager: true,
            },
            'react-router-dom': {
              version: dependencies['react-router-dom'],
              singleton: true,
              eager: true,
            },
          },
          dts: false,
        }),
      ],
    },
  },
})
