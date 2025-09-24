import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Paedagogische-Fachkraft-Backup/',
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})
