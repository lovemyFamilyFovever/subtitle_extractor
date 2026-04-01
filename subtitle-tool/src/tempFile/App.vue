<!--
  【知识点】Vue 3 单文件组件 (SFC - Single File Component)

  一个 .vue 文件包含三个部分：
  <template> — HTML 模板（组件的结构）
  <script setup> — JavaScript 逻辑（使用 Composition API）
  <style scoped> — CSS 样式（scoped 表示只作用于当前组件）
-->
<template>
  <!--
    【知识点】条件渲染 v-if
    v-if="showVideoModal" — 当 showVideoModal 为 true 时，渲染该组件
    v-if 为 false 时，组件会从 DOM 中完全移除（不只是隐藏）
    这样可以确保弹窗关闭时，组件内部状态也被重置
  -->

  <!-- 整个页面容器 -->
  <div class="app-container">
    <!-- 背景装饰（浮动的半透明圆形） -->
    <div class="floating-shapes">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="page-bg"></div>

    <!-- 首页主体内容 -->
    <main class="page-content">
      <h1>字幕工具箱</h1>
      <p>视频字幕截取 · 图片字幕裁剪 · 图片自由拼接</p>

      <!-- 三个功能入口按钮 -->
      <div class="feature-buttons">
        <button class="feature-btn" @click="showVideoModal = true">
          <i class="fa-solid fa-video"></i>
          <span>截取视频字幕</span>
        </button>

        <button class="feature-btn" @click="showImageCropModal = true">
          <i class="fa-solid fa-crop-simple"></i>
          <span>截取图片字幕</span>
        </button>

        <button class="feature-btn" @click="showImageStitchModal = true">
          <i class="fa-solid fa-layer-group"></i>
          <span>拼接图片</span>
        </button>
      </div>
    </main>

    <!--
      【知识点】组件通信 — 事件监听
      @close="showVideoModal = false"
      监听子组件 VideoSubtitleModal 发出的 'close' 事件
      当子组件调用 emit('close') 时，父组件将 showVideoModal 设为 false
      从而隐藏弹窗
    -->

    <!-- 视频字幕提取弹窗 -->
    <VideoSubtitleModal
      v-if="showVideoModal"
      @close="showVideoModal = false"
    />

    <!-- 图片字幕截取弹窗 -->
    <ImageCropModal
      v-if="showImageCropModal"
      @close="showImageCropModal = false"
    />

    <!-- 图片自由拼接弹窗 -->
    <ImageStitchModal
      v-if="showImageStitchModal"
      @close="showImageStitchModal = false"
    />
  </div>
</template>

<script setup>
/**
 * 【知识点】<script setup> — Vue 3 Composition API 语法糖
 *
 * 这是 Vue 3 推荐的写法，比 Options API 更简洁：
 * - 不需要 export default { data(), methods, ... }
 * - 所有顶层变量/函数自动暴露给模板使用
 * - 使用 ref() 和 reactive() 创建响应式数据
 */

// 【知识点】ref — 创建响应式基本类型变量
// ref() 返回一个对象，模板中使用时自动解包（不需要 .value）
// 在 JS 中访问需要 .value，如 showVideoModal.value
import { ref } from 'vue'

// 【知识点】组件导入
// 导入子组件后，可以直接在 <template> 中作为标签使用
// 文件名 PascalCase → 模板中 <PascalCase /> 或 <kebab-case />
import VideoSubtitleModal from './components/VideoSubtitleModal.vue'
import ImageCropModal from './components/ImageCropModal.vue'
import ImageStitchModal from './components/ImageStitchModal.vue'

// 控制三个弹窗的显示/隐藏
const showVideoModal = ref(false)
const showImageCropModal = ref(false)
const showImageStitchModal = ref(false)
</script>

<style>
/**
 * 【知识点】全局样式（不加 scoped）
 *
 * 放在 App.vue 中不加 scoped 的 <style> 里
 * 会作用于整个应用的所有组件
 *
 * CSS 变量 (Custom Properties)：
 * 用 -- 前缀定义，用 var() 引用
 * 好处：统一管理颜色，改一处全局生效
 */

/* ===== 暗黑主题配色变量 ===== */
:root {
  --bg: #0f1117;              /* 页面背景 */
  --fg: #e8eaed;              /* 主文字颜色 */
  --muted: #6b7280;           /* 次要/提示文字 */
  --accent: #00e09e;          /* 强调色（绿色） */
  --accent-dim: rgba(0, 224, 158, 0.12);  /* 弱化强调色 */
  --card: #1a1d27;            /* 卡片/弹窗背景 */
  --card-hover: #22262f;      /* 卡片悬停背景 */
  --border: #2a2e3a;          /* 边框颜色 */
  --danger: #ff4d6a;          /* 危险/删除色 */
  --overlay: rgba(5, 6, 10, 0.82);  /* 遮罩层背景 */
  --radius: 14px;             /* 圆角大小 */
  --radius-sm: 8px;           /* 小圆角 */
}

/* ===== 基础重置 ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Noto Sans SC', system-ui, sans-serif;
  background: var(--bg);
  color: var(--fg);
  min-height: 100vh;
  overflow-x: hidden;
}

/* ===== 背景装饰 ===== */
.page-bg {
  position: fixed;
  inset: 0;   /* 等同于 top:0; right:0; bottom:0; left:0; */
  z-index: 0;
  background:
    radial-gradient(ellipse 60% 50% at 20% 20%, rgba(0,224,158,0.06) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 80% 70%, rgba(255,77,106,0.05) 0%, transparent 60%),
    var(--bg);
}

.floating-shapes {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.floating-shapes span {
  position: absolute;
  border-radius: 50%;
  opacity: 0.06;
  animation: float 6s ease-in-out infinite;
}

.floating-shapes span:nth-child(1) {
  width: 300px; height: 300px;
  background: var(--accent);
  top: 10%; left: 5%;
}

.floating-shapes span:nth-child(2) {
  width: 200px; height: 200px;
  background: var(--danger);
  bottom: 15%; right: 10%;
  animation-delay: -2s;
}

.floating-shapes span:nth-child(3) {
  width: 150px; height: 150px;
  background: #60a5fa;
  top: 50%; left: 60%;
  animation-delay: -4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* ===== 首页内容 ===== */
.app-container {
  position: relative;
  z-index: 1;
}

.page-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
  gap: 1.5rem;
}

.page-content h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--fg) 40%, var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-content p {
  color: var(--muted);
  font-size: 1.05rem;
  max-width: 460px;
  line-height: 1.7;
}

/* ===== 功能按钮组 ===== */
.feature-buttons {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
}

.feature-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 2rem;
  background: var(--accent);
  color: #0f1117;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 0 30px rgba(0,224,158,0.25);
  font-family: inherit;
}

.feature-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 0 50px rgba(0,224,158,0.4);
}

.feature-btn:active {
  transform: scale(0.97);
}

.feature-btn i {
  font-size: 1.1rem;
}

/* ===== 响应式：小屏幕适配 ===== */
@media (max-width: 600px) {
  .feature-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }

  .feature-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
