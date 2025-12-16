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
  tools: {
    rspack: {
      output: {
        uniqueName: 'remote1',
      },
      plugins: [
        new ModuleFederationPlugin({
          name: 'remote1',
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
        }),
      ],
    },
  },
})
