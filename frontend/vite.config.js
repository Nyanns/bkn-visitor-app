import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core libraries
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }

          // Chakra UI and emotion packages
          if (id.includes('@chakra-ui') || id.includes('@emotion')) {
            return 'chakra-ui';
          }

          // Animation library (large package)
          if (id.includes('framer-motion')) {
            return 'framer-motion';
          }

          // Icon library
          if (id.includes('react-icons')) {
            return 'react-icons';
          }
        }
      }
    },
    // Increase chunk size warning limit since we're intentionally creating larger vendor chunks
    chunkSizeWarningLimit: 600
  }
})
