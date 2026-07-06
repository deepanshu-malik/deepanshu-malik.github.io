import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        resume: resolve(__dirname, 'resume.html'),
        404: resolve(__dirname, '404.html'),
        about: resolve(__dirname, 'about.html'),
        projects: resolve(__dirname, 'projects.html'),
      },
    },
  },
})
