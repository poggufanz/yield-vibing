import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: []
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@neo4j-nvl/base', 'ethers', 'viem']
  },
  worker: {
    format: 'es'
  }
})
