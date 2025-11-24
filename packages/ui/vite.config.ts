import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:9000' }
  },
  build: {
    outDir: path.resolve(__dirname, '../core/public'),
    emptyOutDir: true,
  }
})