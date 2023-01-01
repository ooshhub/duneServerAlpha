import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ command }) => {
  return ({
    root: './src/interface',
    build: {
      outDir: '../../build/interface',
      emptyOutDir: true,
    },
    plugins: [ vue() ],
    server: {
      https: command === 'build' ? true : false
    }
  });
});