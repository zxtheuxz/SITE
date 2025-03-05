import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Configurações para o servidor de desenvolvimento
    port: 5175,
    strictPort: false, // Permitir que o Vite tente outras portas se 5175 estiver em uso
  },
  build: {
    // Configurações para a build
    outDir: 'dist',
    assetsInlineLimit: 0, // Não inline nenhum asset
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
});
