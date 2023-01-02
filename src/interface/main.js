import { createApp } from 'vue';
import { NeutralinoManager } from './js/NeutralinoManager.js';
import './styles/style.css';
import App from './vue/App.vue';

const loadVue = () => { createApp(App).mount('#app'); }

const loadAuthInfo = async () => {
  let authInfo = null, config = null; 
  // comment out below import lines to package
  authInfo = (await import('../../.tmp/auth_info.json'))?.default;
  config = (await import('../../neutralino.config.json'))?.default;
  return authInfo && config
    ? { ...authInfo, ...config }
    : null;
};

(async() => {
  loadAuthInfo().then(response => {
    NeutralinoManager.initNeutralino(response);
  }).catch(() => {
    NeutralinoManager.initNeutralino();
  }).finally(() => {
    loadVue();
  });
  
})();

