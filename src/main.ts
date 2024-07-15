import { createApp } from 'vue'
// 引入element-plus插件与样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
//引入webr
import { WebR } from 'webr';

const app = createApp(App);
// 安装element-plus插件
app.use(ElementPlus)
app.config.globalProperties.webR = new WebR();
app.mount('#app');
