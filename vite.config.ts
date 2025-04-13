import type { PluginOption } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: [{ find: '~', replacement: fileURLToPath(new URL('./src', import.meta.url)) }],
  },
  plugins: [
    tailwindcss() as PluginOption,
    react(),
  ],
})
