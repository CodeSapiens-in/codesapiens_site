import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from "flowbite-react/plugin/vite"

export default defineConfig({
  plugins: [tailwindcss(), flowbiteReact()],
  server: {
    host: '0.0.0.0',               // allow external/custom domains
    port: 5173,
    allowedHosts: ['local.myapp.com'] // 👈 whitelist your fake local domain
  }
})
