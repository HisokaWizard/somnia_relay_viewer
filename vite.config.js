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
    },
  },
  assetsInclude: ['**/*.jpg', '**/*.png', '**/*.glb'],
  server: {
    port: 12021,
    open: true,
    host: true,
    strictPort: true,
    historyApiFallback: true,
    setupMiddlewares: (middlewares, { app }) => {
      app.use((req, res, next) => {
        if (req.url !== '/' && !req.url.includes('.')) {
          res.sendFile(path.resolve(__dirname, 'index.html'));
        } else {
          next();
        }
      });
      return middlewares;
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
