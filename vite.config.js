import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import history from 'connect-history-api-fallback';

export default defineConfig({
  root: path.resolve(__dirname, '.'),
  plugins: [
    react(),
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use(
          history({
            verbose: true,
            rewrites: [
              {
                from: /^\/@vite\/client/,
                to: (ctx) => ctx.parsedUrl.path,
              },
              {
                from: /^\/@react-refresh/,
                to: (ctx) => ctx.parsedUrl.path,
              },
              {
                from: /\.(js|ts|css|mjs|json|png|jpg|svg)$/,
                to: (ctx) => ctx.parsedUrl.path,
              },
            ],
          }),
        );
      },
    },
  ],
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
    hmr: { overlay: true },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
