import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],

  server: {
    host: true,
    port: 5173,
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:  ['react', 'react-dom', 'react-router-dom'],
          ui:      ['react-toastify'],
          charts:  ['recharts'],
          socket:  ['socket.io-client'],
        }
      }
    }
  },

  define: {
    global: 'window',
  },

  resolve: {
    alias: {
      'simple-peer': 'simple-peer/simplepeer.min.js'
    }
  }
})
