import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// './' makes the build portable — works on S3, GitHub Pages, any static host.
// Override with VITE_BASE_PATH env var if needed (e.g. a sub-directory deploy).
const base = process.env.VITE_BASE_PATH ?? './'

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    proxy: {
      '/cdn': {
        target: 'https://sunwaymalls.indoorcms.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cdn/, ''),
      },
    },
  },
})
