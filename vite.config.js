import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    host: '0.0.0.0',  // Allows external access (required for ngrok)
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'silkworm-nice-mosquito.ngrok-free.app',  // ← ADD THIS
      // Optional: allow all ngrok subdomains (less secure)
      // '.ngrok-free.app'
    ]
  }
})