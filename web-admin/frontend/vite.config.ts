import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 类型定义
declare global {
  interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_CLOUD_ENV_ID: string
    readonly VITE_APP_ID: string
    readonly VITE_APP_SECRET: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'https://api.weixin.qq.com',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'echarts': ['echarts']
        }
      }
    }
  }
})