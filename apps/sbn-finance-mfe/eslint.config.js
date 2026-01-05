import { config } from '@repo/eslint-config/react-internal'

/** @type {import("eslint").Linter.Config[]} */
export default [
  { ignores: ['postcss.config.cjs', 'tailwind.config.ts'] },
  ...config,
]
