import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On désactive temporairement la PWA pour forcer le navigateur à oublier le cache
export default defineConfig({
  plugins: [
    react()
  ],
})