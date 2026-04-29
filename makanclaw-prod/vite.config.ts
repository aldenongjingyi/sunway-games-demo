import { defineConfig } from 'vite'

const base = process.env.VITE_BASE_PATH ?? './'

export default defineConfig({
  base,
  server: {
    proxy: {
      // CORS workaround for restaurant logos on the CMS CDN
      '/cdn': {
        target: 'https://sunwaymalls.indoorcms.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cdn/, ''),
      },
    },
  },
})
