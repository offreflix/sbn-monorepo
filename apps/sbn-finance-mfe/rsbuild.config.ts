import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack'
import { dependencies } from './package.json'

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact()],
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
          },
          dts: {
            enabled: false,
          },
        }),
      ],
    },
  },
})
