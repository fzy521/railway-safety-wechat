/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'element-plus/dist/locale/zh-cn.mjs'

interface ImportMetaEnv {
  readonly VITE_CLOUD_ENV_ID: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_ID: string
  readonly VITE_APP_SECRET: string
  readonly VITE_API_BASE_URL: string
}