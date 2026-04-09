<template>
  <div>
    <!-- 背景渐变层（装饰用） -->
    <div class="page-bg"></div>

    <!-- 页面主内容 -->
    <main class="page-content">
      <!-- 标题区 -->
      <h1 class="page-title">工具箱</h1>
      <p class="page-desc">视频字幕提取 · 动图剪辑 · 图片处理 · 思维导图</p>

      <!-- GitHub Star 按钮 -->
      <a href="https://github.com/lovemyFamilyFovever/subtitle_extractor" target="_blank" rel="noopener noreferrer"
        class="github-star-btn" title="在 GitHub 上查看项目">
        <i class="fa-brands fa-github"></i>
        <span>Star on GitHub</span>
      </a>

      <!-- ===== 功能入口按钮（三栏布局）===== -->
      <div class="entry-container">

        <!-- 分组一：字幕处理 -->
        <div class="feature-group">
          <h2 class="group-title">
            <i class="fa-solid fa-closed-captioning"></i>
            字幕处理
          </h2>
          <div class="entry-grid">

            <!-- 功能一：视频截取字幕 -->
            <button class="entry-card" @click="showVideo = true">
              <div class="entry-icon"><i class="fa-solid fa-film"></i></div>
              <div class="entry-info">
                <span class="entry-title">视频字幕提取</span>
                <span class="entry-desc">上传视频，框选字幕区域，自动逐帧提取拼接</span>
              </div>
              <i class="fa-solid fa-arrow-right entry-arrow"></i>
            </button>

            <!-- 功能二：图片截取字幕 -->
            <button class="entry-card" @click="showImageSub = true">
              <div class="entry-icon"><i class="fa-solid fa-scissors"></i></div>
              <div class="entry-info">
                <span class="entry-title">图片截取字幕</span>
                <span class="entry-desc">拖动红/蓝裁剪线，精准裁切字幕区域并拼接</span>
              </div>
              <i class="fa-solid fa-arrow-right entry-arrow"></i>
            </button>

          </div>
        </div>

        <!-- 分组二：图片处理 -->
        <div class="feature-group">
          <h2 class="group-title">
            <i class="fa-solid fa-image"></i>
            图片处理
          </h2>
          <div class="entry-grid">

            <!-- 功能三：图片拼接 -->
            <button class="entry-card" @click="showStitch = true">
              <div class="entry-icon"><i class="fa-solid fa-table-cells"></i></div>
              <div class="entry-info">
                <span class="entry-title">图片拼接</span>
                <span class="entry-desc">水平 / 垂直 / 网格布局，自由组合多张图片</span>
              </div>
              <i class="fa-solid fa-arrow-right entry-arrow"></i>
            </button>

            <!-- 功能四：智能切片（九宫格） -->
            <button class="entry-card" @click="showSeg = true">
              <div class="entry-icon"><i class="fa-solid fa-grip"></i></div>
              <div class="entry-info">
                <span class="entry-title">智能切片（九宫格）</span>
                <span class="entry-desc">把一张大图智能切成多张，用于 Instagram / 小红书 九宫格</span>
              </div>
              <i class="fa-solid fa-arrow-right entry-arrow"></i>
            </button>

          </div>
        </div>

        <!-- 分组三：动图剪辑 -->
        <div class="feature-group">
          <h2 class="group-title">
            <i class="fa-solid fa-clapperboard"></i>
            动图剪辑
          </h2>
          <div class="entry-grid">

            <!-- 功能五：视频转GIF -->
            <button class="entry-card" @click="showGif = true">
              <div class="entry-icon"><i class="fa-solid fa-film"></i></div>
              <div class="entry-info">
                <span class="entry-title">视频剪辑转GIF</span>
                <span class="entry-desc">选择视频片段，自定义参数，生成高质量GIF动图</span>
              </div>
              <i class="fa-solid fa-arrow-right entry-arrow"></i>
            </button>

          </div>
        </div>

        <!-- 分组四：思维导图 -->
        <div class="feature-group">
          <h2 class="group-title">
            <i class="fa-solid fa-diagram-project"></i>
            思维导图
          </h2>
          <div class="entry-grid">

            <!-- 功能六：思维导图 -->
            <button class="entry-card" @click="showMindMap = true">
              <div class="entry-icon"><i class="fa-solid fa-brain"></i></div>
              <div class="entry-info">
                <span class="entry-title">思维导图</span>
                <span class="entry-desc">创建和编辑思维导图，支持插入图片、导出 PNG/SVG</span>
              </div>
              <i class="fa-solid fa-arrow-right entry-arrow"></i>
            </button>

          </div>
        </div>
      </div>

      <!-- ===== 主题切换按钮 ===== -->
      <button class="theme-toggle" @click="toggleTheme" :title="isLight() ? '切换到暗色主题' : '切换到亮色主题'" aria-label="切换主题">
        <i :class="isLight() ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"></i>
      </button>

      <!-- ===== 访问github主页 ===== -->
      <button class="go-github" @click="goGithub" title="访问github主页">
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <title>GitHub</title>
          <path
            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12">
          </path>
        </svg>
      </button>

      <!-- ===== Toast 通知容器（全局） ===== -->
      <!--
      Teleport 是 Vue 3 的内置组件：
      把内部内容"传送"到 body 下，避免被弹窗的 overflow:hidden 裁掉
    -->
      <Teleport to="body">
        <div class="toast-container">
          <!--
          TransitionGroup：为列表项加入/离开动画
          tag="div" 表示用 div 作为包裹元素
        -->
          <TransitionGroup name="toast">
            <div v-for="toast in toasts" :key="toast.id" class="toast"
              :class="[toast.type, { leaving: toast.leaving }]">
              <!-- 根据类型显示不同图标 -->
              <i :class="toastIcon(toast.type)"></i>
              {{ toast.message }}
            </div>
          </TransitionGroup>
        </div>
      </Teleport>

      <!-- ===== 三个功能弹窗 ===== -->
      <!--
      v-model="showVideo" 等价于：
        :modelValue="showVideo"
        @update:modelValue="val => showVideo = val"
      当子组件 emit('update:modelValue', false) 时，showVideo 变为 false
    -->
      <AppModal v-model="showVideo" title="视频字幕提取" icon="fa-solid fa-film">
        <!-- 懒加载：只在弹窗打开时才渲染子组件，节省初始性能 -->
        <VideoSubtitle v-if="showVideo" />
      </AppModal>

      <AppModal v-model="showImageSub" title="图片截取字幕" icon="fa-solid fa-scissors">
        <ImageSubtitle v-if="showImageSub" />
      </AppModal>

      <AppModal v-model="showStitch" title="图片拼接" icon="fa-solid fa-table-cells">
        <ImageStitch v-if="showStitch" />
      </AppModal>
      <AppModal v-model="showSeg" title="智能切片" icon="fa-solid fa-grip">
        <ImageSegmentation v-if="showSeg" />
      </AppModal>

      <AppModal v-model="showGif" title="视频剪辑转GIF" icon="fa-solid fa-clapperboard">
        <VideoToGif v-if="showGif" />
      </AppModal>

      <AppModal v-model="showMindMap" title="思维导图" icon="fa-solid fa-brain" :full-screen="true">
        <MindMap v-if="showMindMap" />
      </AppModal>

    </main>
  </div>
</template>

<script setup>
// =============================================
// App.vue —— 根组件（首页）
// 职责：展示三个入口，控制弹窗显隐
// =============================================

import { ref, onMounted, onUnmounted } from 'vue'

// 导入通用弹窗组件
import AppModal from './components/AppModal.vue'

// 导入三个功能组件（现在先建空文件，后面填充内容）
import VideoSubtitle from './views/VideoSubtitle.vue'
import ImageSubtitle from './views/ImageSubtitle.vue'
import ImageStitch from './views/ImageStitch.vue'
import ImageSegmentation from './views/ImageSegmentation.vue'
import VideoToGif from './views/VideoToGif.vue'
import MindMap from './views/MindMap.vue'

// 导入 Toast composable
import { useToast } from './composables/useToast.js'

// 导入主题切换 composable
import { useTheme } from './composables/useTheme.js'

// ===== 弹窗显隐状态 =====
// ref(false) 创建一个响应式的布尔值，初始为 false（隐藏）
const showVideo = ref(false)
const showImageSub = ref(false)
const showStitch = ref(false)
const showSeg = ref(false)
const showGif = ref(false)
const showMindMap = ref(false)

// ===== Toast =====
const { toasts, showToast } = useToast()

// 根据 toast 类型返回对应的图标 class
const toastIcon = (type) => {
  if (type === 'success') return 'fa-solid fa-circle-check'
  if (type === 'error') return 'fa-solid fa-circle-exclamation'
  return 'fa-solid fa-circle-info'
}

// ===== 主题切换 =====
const { initTheme, toggleTheme, isLight } = useTheme()


const goGithub = () => {
  window.open('https://github.com/lovemyFamilyFovever/subtitle_extractor', '_blank')
}

// 组件挂载时初始化
onMounted(() => {
  initTheme()

  // 添加全局键盘快捷键
  document.addEventListener('keydown', handleGlobalKeydown)
})

// 组件卸载时清理
onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

// 全局键盘快捷键处理
const handleGlobalKeydown = (e) => {
  // Ctrl+S / Cmd+S 保存（如果在结果页面）
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    // 触发当前活动模态框的保存功能
    const saveBtn = document.querySelector('.modal .btn-primary')
    if (saveBtn && !saveBtn.disabled) {
      saveBtn.click()
    }
  }
}
</script>

<style scoped>
/* ===== 背景渐变 ===== */
.page-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    var(--gradient-1),
    var(--gradient-2),
    var(--bg);
}

/* ===== 页面内容居中 ===== */
.page-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  gap: 1rem;
}

/* ===== 标题 ===== */
.page-title {
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--fg) 40%, var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-desc {
  color: var(--muted);
  font-size: 1rem;
  margin-bottom: 1rem;
}

/* ===== GitHub Star 按钮 ===== */
.github-star-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 50px;
  color: var(--fg);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.github-star-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md), 0 0 20px var(--accent-dim);
}

.github-star-btn i {
  font-size: 1.1rem;
}

/* ===== 功能容器（四栏布局）===== */
.entry-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 1400px;
}

/* ===== 功能分组 ===== */
.feature-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ===== 移动端响应式：单栏布局 ===== */
@media (max-width: 1200px) {
  .entry-container {
    grid-template-columns: repeat(2, 1fr);
    max-width: 900px;
  }
}

@media (max-width: 768px) {
  .entry-container {
    grid-template-columns: 1fr;
    max-width: 520px;
  }
}

/* ===== 分组标题 ===== */
.group-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
  padding-left: 0.25rem;
}

.group-title i {
  font-size: 0.85rem;
}

/* ===== 功能卡片网格 ===== */
.entry-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

/* ===== 单个功能卡片 ===== */
.entry-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  text-align: left;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  font-family: inherit;
  color: var(--fg);
  width: 100%;
}

.entry-card:hover {
  border-color: var(--accent);
  background: var(--card-hover);
  transform: translateX(4px);
  box-shadow: 0 0 30px rgba(0, 224, 158, 0.08);
}

.entry-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  background: var(--accent-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.1rem;
  color: var(--accent);
}

.entry-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.entry-title {
  font-size: 0.95rem;
  font-weight: 700;
}

.entry-desc {
  font-size: 0.78rem;
  color: var(--muted);
  line-height: 1.4;
}

.entry-arrow {
  color: var(--muted);
  font-size: 0.85rem;
  transition: transform 0.2s, color 0.2s;
}

.entry-card:hover .entry-arrow {
  transform: translateX(3px);
  color: var(--accent);
}

/* ===== Toast 容器 ===== */
.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.1rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  color: var(--fg);
  white-space: nowrap;
}

.toast.success {
  border-color: var(--accent);
  color: var(--accent);
}

.toast.error {
  border-color: var(--danger);
  color: var(--danger);
}

/* ===== Toast 动画（TransitionGroup） ===== */
.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}
</style>
