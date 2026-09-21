import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

// Автоматический подсчёт версии на основе количества коммитов в Git
let commitCount = 1
let commitHash = ''
try {
  commitCount = parseInt(execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim(), 10) || 1
  commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
} catch (e) {
  commitCount = 1
}

// Дата сборки строго по Московскому времени (Europe/Moscow, UTC+3)
const formattedDate = new Intl.DateTimeFormat('ru-RU', {
  timeZone: 'Europe/Moscow',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
}).format(new Date())
const appVersion = `v1.0.${commitCount}`

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/plan/',
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __BUILD_DATE__: JSON.stringify(formattedDate),
    __COMMIT_HASH__: JSON.stringify(commitHash)
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/api/fetch_schedule': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/plan/api/fetch_schedule': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/plan/, ''),
      },
      '/plan/api': {
        target: 'https://boostandgo.ru',
        changeOrigin: true,
        secure: true,
      },
      '/api': {
        target: 'https://boostandgo.ru/plan',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})

