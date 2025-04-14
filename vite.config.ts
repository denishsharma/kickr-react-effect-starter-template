import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite as tanStackRouter } from '@tanstack/router-plugin/vite'
import unhead from '@unhead/addons/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: [{ find: '~', replacement: fileURLToPath(new URL('./src', import.meta.url)) }],
  },
  plugins: [
    tanStackRouter({
      quoteStyle: 'single',
      semicolons: false,
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/pages',
      generatedRouteTree: './.generated/routeTree.gen.ts',
    }),
    react(),
    tailwindcss(),
    unhead(),
  ],
})
