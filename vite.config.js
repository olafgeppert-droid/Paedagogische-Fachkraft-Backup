import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Paedagogische-Fachkraft/',
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})
