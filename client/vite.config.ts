import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Send local API requests through Vite so the session cookie stays on one origin.
export default defineConfig({
  plugins: [vue()],
  server: { proxy: { '/api': 'http://127.0.0.1:8000' } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
