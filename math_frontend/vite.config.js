import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: false, // This ensures all CSS is in one file
    sourcemap: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  }
})
