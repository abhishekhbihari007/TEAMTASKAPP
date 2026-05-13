import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    root: path.resolve(__dirname, '.'),
    envDir: path.resolve(__dirname, '..'),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@/src': path.resolve(__dirname, 'src'),
        '@/components': path.resolve(__dirname, 'components'),
        '@/lib': path.resolve(__dirname, 'lib'),
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
