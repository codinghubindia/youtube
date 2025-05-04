import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      // Make env variables explicitly available
      'process.env': env
    },
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        plugins: [
          {
            name: 'node-modules-polyfill',
            setup(build) {
              // Handle node modules that are imported in browser context
              build.onResolve({ filter: /^(path|fs|os|crypto|stream|util|events|module|url|assert|tty|v8|process|perf_hooks)$/ }, () => {
                return { external: true };
              });
            },
          },
        ],
      },
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['lucide-react'],
          },
          experimentalMinChunkSize: 10000,
        },
        external: ['tailwindcss', 'fs', 'path', 'os', 'crypto', 'stream', 'util', 'events', 'module', 'url', 'assert', 'tty', 'v8', 'process', 'perf_hooks'],
      },
      sourcemap: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.debug', 'console.info'],
          passes: 2,
        },
        mangle: {
          toplevel: true,
        },
      },
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1600,
      reportCompressedSize: false,
    },
    server: {
      port: 5173,
      strictPort: false,
      open: true,
    },
  };
});
