import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    // Improve chunking strategy for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'tailwindcss'],
        },
      },
    },
    // Generate source maps for production
    sourcemap: true,
    // Minify output
    minify: 'terser',
    // Configure Terser options
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true,
      },
    },
    // Optimize CSS
    cssCodeSplit: true,
    // Reduce chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Configure server
  server: {
    port: 5173,
    strictPort: false,
    open: true,
  },
});
