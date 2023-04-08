import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const prod = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig({
  base: prod ? './' : undefined,
  build: {
    outDir: '../build/',
    emptyOutDir: true
  },
  plugins: [svelte()],
})
