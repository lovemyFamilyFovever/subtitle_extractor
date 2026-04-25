// =============================================
// src/main.js 是整个 Vue 应用的入口，Vite 从这里启动。
// main.js —— Vue 应用入口
// 职责：创建 Vue 实例，挂载到 index.html 的 #app 节点
// =============================================


import { createApp } from 'vue'     // 从 Vue 3 导入创建应用的函数
import App from './App.vue'          // 导入根组件
import './styles/global.css'         // 注入全局样式（所有组件都能用 CSS 变量）

const app = createApp(App)


// 创建应用并挂载
// index.html 里有 <div id="app"></div>，Vue 会接管这个节点
app.mount('#app')