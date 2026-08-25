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

const now = new Date()
const pad = (n) => String(n).padStart(2, '0')
const formattedDate = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`
const appVersion = `v1.0.${commitCount}`

export default defineConfig({
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
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})

