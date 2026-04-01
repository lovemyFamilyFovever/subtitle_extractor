/**
 * 【知识点】Vue 3 应用入口
 * 
 * createApp() — 创建一个 Vue 应用实例
 * .mount('#app') — 将应用挂载到 DOM 中 id="app" 的元素上
 * 
 * 执行流程：
 * 1. 浏览器加载 index.html
 * 2. index.html 加载 main.js
 * 3. main.js 创建 Vue 应用，渲染 App.vue 组件
 * 4. App.vue 的内容替换 <div id="app"></div>
 */
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
