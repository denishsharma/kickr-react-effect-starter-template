import type { PluginOption } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite as tanStackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: [{ find: '~', replacement: fileURLToPath(new URL('./src', import.meta.url)) }],
  },
  plugins: [
    tailwindcss() as PluginOption,
    tanStackRouter({
      quoteStyle: 'single',
      semicolons: false,
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/pages',
      generatedRouteTree: './.generated/routeTree.gen.ts',
    }),
    react(),
  ],
})
