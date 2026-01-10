
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Permette all'SDK Gemini di accedere alla chiave API tramite process.env
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
});
