import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig({
  // base: './', // Removido pois o singlefile cuida dos caminhos ao fazer inline
  plugins: [
    react(),
    viteSingleFile(), // Compacta tudo em um arquivo para o Streamlit/Iframe
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg'],
      manifest: {
        name: 'Moedinha',
        short_name: 'Moedinha',
        description: 'Gerenciador Financeiro Pessoal',
        theme_color: '#ffffff',
        background_color: '#f8fafc',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  }
});