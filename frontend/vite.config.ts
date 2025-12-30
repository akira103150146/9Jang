import { defineConfig, loadEnv, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  // 載入環境變數
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag: string) => tag === 'math-field'
          }
        }
      })
    ],
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.test.{js,ts}', 'src/**/*.spec.{js,ts}']
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@9jang/shared': fileURLToPath(new URL('../packages/shared/src', import.meta.url))
      }
    },
    server: {
      port: parseInt(env.VITE_FRONTEND_PORT || '5173', 10),
      host: env.VITE_FRONTEND_HOST || 'localhost',
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:8000',
          changeOrigin: true
        }
      }
    }
  }
})

