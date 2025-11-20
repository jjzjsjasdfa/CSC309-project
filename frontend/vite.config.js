import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  // server: {
  //   proxy: {
  //     "/users": {
  //       target: "http://localhost:3000",
  //       changeOrigin: true,
  //     },
  //     "/auth": {
  //       target: "http://localhost:3000",
  //       changeOrigin: true,
  //     },
  //     "/transactions": {
  //       target: "http://localhost:3000",
  //       changeOrigin: true,
  //     },
  //     "/events": {
  //       target: "http://localhost:3000",
  //       changeOrigin: true,
  //     },
  //     "/promotions": {
  //       target: "http://localhost:3000",
  //       changeOrigin: true,
  //     },
  //   },
  // },
  plugins: [react()],
});
