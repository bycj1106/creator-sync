import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, mode }) => ({
  plugins: [react(), tailwindcss()],
  base: command === 'build' && mode === 'production' ? './' : '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  },
}))
