import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
    ],
    
    // Development server config
    server: {
      port: 3000,
      host: true,
      strictPort: false,
      cors: true,
    },
    
    // Preview server config (for production builds)
    preview: {
      port: 4173,
      host: true,
    },
    
    // Path resolution
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
    },
    
    // Build optimizations
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tabs',
              '@radix-ui/react-tooltip',
              '@radix-ui/react-select',
              '@radix-ui/react-collapsible',
            ],
            'vendor-motion': ['framer-motion'],
            'vendor-charts': ['recharts'],
          },
          // Asset naming for cache busting
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
              return 'assets/images/[name]-[hash][extname]'
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
              return 'assets/fonts/[name]-[hash][extname]'
            }
            if (ext === 'css') {
              return 'assets/css/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          },
        },
      },
      // Chunk size warning threshold
      chunkSizeWarningLimit: 1000,
      // CSS code splitting
      cssCodeSplit: true,
      // Asset inline limit (4kb)
      assetsInlineLimit: 4096,
    },
    
    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'lucide-react',
        'recharts',
      ],
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    
    // Environment variable prefix
    envPrefix: 'VITE_',
    
    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },
  }
})
