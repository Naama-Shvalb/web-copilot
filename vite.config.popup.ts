import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: false,  // Add this line to prevent cleaning dist folder

    rollupOptions: {
      input: 'src/popup.tsx',
      output: {
        entryFileNames: 'popup.js',
        format: 'iife',
      },
    },
  },
}); 