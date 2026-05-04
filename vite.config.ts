import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: process.env.PORT || 3000,
  },
  base: process.env.BASE_PATH || '/',
});