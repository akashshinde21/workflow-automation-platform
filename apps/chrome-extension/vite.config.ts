import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: { popup: 'popup.html', editor: 'editor.html' },
      output: { entryFileNames: '[name].js', dir: 'dist' }
    }
  },
  server: { port: 5174 }
});
