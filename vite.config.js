import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  // 路径别名配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@views': resolve(__dirname, 'src/views'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@composables': resolve(__dirname, 'src/composables')
    }
  },
  
  // 开发服务器配置
  server: {
    port: 5173,
    open: true, // 自动打开浏览器
    host: '0.0.0.0', // 允许局域网访问
    cors: true
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // 生产环境不生成 sourcemap
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console.log
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // 静态资源分类打包
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
        // 手动分包
        manualChunks: {
          vue: ['vue'],
          jszip: ['jszip']
        }
      }
    },
    // 限制块大小警告
    chunkSizeWarningLimit: 1000
  },
  
  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue', 'jszip']
  }
})
