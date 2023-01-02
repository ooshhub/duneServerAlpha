import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const env = process.env.NODE_ENV;

export default defineConfig(({ command }) => {
  return ({
    root: './src/interface',
    build: {
      outDir: '../../build/interface',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          app: env === 'production'
            ? './src/interface/index.html'
            : './src/interface/indexDev.html'
        },
      },
    },
    plugins: [ vue() ],
    server: {
      https: command === 'build' ? true : false,
      port: 8888,
    }
  });
});