import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, '.'),
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          vendor_three: ['three'],
          vendor_react: ['react', 'react-dom', 'react-router', 'react-router-dom'],
          venodr_3d: ['@react-three/fiber', '@react-three/drei'],
          vendor_web3: ['axios', 'web3'],
        },
      },
    },
  },
  assetsInclude: [
    '**/*.jpg',
    '**/*.png',
    '**/*.glb',
    '**/*.jpeg',
    '**/*.webp',
    '**/*.svg',
    '**/*.gif',
  ],
  server: {
    port: 12021,
    open: true,
    host: true,
    strictPort: true,
    historyApiFallback: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
