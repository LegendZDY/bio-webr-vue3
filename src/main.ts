import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { WebR } from 'webr';

const app = createApp(App);
app.config.globalProperties.webR = new WebR();
app.mount('#app');
