import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack'
import { dependencies } from './package.json'

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact()],
  server: {
    port: 9000,
  },
  tools: {
    rspack: {
      output: {
        uniqueName: 'host',
      },
      plugins: [
        new ModuleFederationPlugin({
          name: 'host',
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
