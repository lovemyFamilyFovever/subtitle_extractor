# Subtitle Extractor - 多媒体字幕处理工具

## 📖 项目概述

**Subtitle Extractor** 是一个基于浏览器的轻量级多媒体处理工具，专注于视频字幕提取、图片字幕截取及图片拼接功能。项目采用纯前端技术栈，所有文件处理均在用户本地浏览器中完成，无需上传至服务器，充分保护用户隐私和数据安全。

### 🎯 项目定位

- **类型**：单页应用（SPA）多媒体处理工具
- **平台**：Web 浏览器（支持现代浏览器）
- **核心理念**：本地化处理、零依赖后端、隐私优先
- **目标用户**：内容创作者、视频编辑者、社交媒体运营人员、需要批量处理字幕截图的用户

### ✨ 核心价值

1. **隐私保护**：所有文件处理在客户端完成，不上传任何数据
2. **高效便捷**：可视化操作界面，实时预览，一键导出
3. **精确控制**：像素级坐标换算，确保输出质量
4. **灵活配置**：丰富的参数调节，满足不同场景需求

---

## 🚀 功能特性

### 1️⃣ 视频字幕提取（VideoSubtitle）

#### 功能描述
从视频中精确提取指定区域的字幕帧，并自动拼接成垂直长图。

#### 核心能力
- **智能框选**：鼠标拖拽框选字幕区域，自动换算显示坐标与原始分辨率
- **时间点标记**：
  - 手动标记：空格键/Enter 键快速记录当前播放位置
  - 自动提取：可设置按固定时间间隔（如每秒）自动截图
- **逐帧精准截图**：基于 `seeked` 事件机制，确保帧准确性
- **封面设置**：支持从视频中截取特定帧或上传本地图片作为封面
- **智能拼接**：将所有提取的字幕帧垂直拼接为高清长图
- **格式导出**：支持 PNG/JPEG 格式，可调节输出质量

#### 技术亮点
```javascript
// 坐标换算示例（显示尺寸 → 原始分辨率）
const scaleX = video.videoWidth / video.clientWidth;
const scaleY = video.videoHeight / video.clientHeight;
const originalX = displayX * scaleX;
const originalY = displayY * scaleY;
```

#### 使用流程
1. 上传/拖拽视频文件（支持 MP4/WebM/MOV 等格式）
2. 在视频播放器上拖拽鼠标，框选字幕区域（绿色虚线框）
3. 播放视频，在需要提取字幕的时间点按空格键标记
4. 点击「智能提取并拼接」按钮
5. 等待处理完成后，预览并导出结果

---

### 2️⃣ 图片截取字幕（ImageSubtitle）

#### 功能描述
批量处理多张图片，通过统一的裁剪比例截取字幕区域，并拼接成长图。

#### 核心能力
- **多图上传**：支持批量上传、拖拽、粘贴图片
- **可视化裁剪**：
  - Canvas 上叠加红线（上边界）和蓝线（下边界）
  - 直接拖拽线条调整裁剪位置
  - 滑块精确控制裁剪比例（0~1）
- **比例同步**：所有图片共用同一套裁剪比例，确保一致性
- **智能裁剪规则**：
  - 第一张图：从顶部 → 蓝线位置
  - 后续图片：从红线位置 → 蓝线位置
- **实时预览**：切换图片时即时查看裁剪效果
- **拼接导出**：垂直拼接所有裁剪后的图片

#### 技术亮点
```javascript
// 裁剪逻辑
if (index === 0) {
  // 第一张：从顶部到蓝线
  cropHeight = img.height * bottomCutRatio;
} else {
  // 后续：从红线到蓝线
  const topY = img.height * topCutRatio;
  const bottomY = img.height * bottomCutRatio;
  cropHeight = bottomY - topY;
}
```

#### 使用流程
1. 上传多张包含字幕的图片
2. 在 Canvas 上拖拽红蓝线确定裁剪范围
3. 使用左右箭头切换图片，确认裁剪效果
4. 点击「生成长拼接图」
5. 导出最终结果

---

### 3️⃣ 图片拼接（ImageStitch）

#### 功能描述
强大的通用图片拼接工具，支持多种布局方式和丰富的自定义参数。

#### 核心能力
- **多样化布局**：
  - **横向排列**（Horizontal）：图片水平依次排列
  - **纵向排列**（Vertical）：图片垂直堆叠
  - **网格布局**（Grid）：2~5 列自适应网格
- **缩略图管理**：
  - 拖拽排序：直观调整图片顺序
  - 旋转功能：90° 倍数旋转
  - 删除操作：单张移除或清空全部
- **精细参数调节**：
  - 间距（Gap）：0~100px 可调
  - 圆角（Radius）：0~80px 圆角效果
  - 背景色：预设色板 + 自定义颜色选择器 + 透明背景
  - 对齐方式：左对齐/居中/右对齐（横向）、顶对齐/居中/底对齐（纵向）
  - 缩放比例：50%~200% 输出尺寸控制
- **实时预览**：所有参数变化即时反映在预览 Canvas 上
- **高清导出**：根据缩放比例生成高分辨率拼接图

#### 技术亮点
```javascript
// 网格布局算法
const cols = gridCols;
const rows = Math.ceil(images.length / cols);
for (let i = 0; i < images.length; i++) {
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = col * (imgWidth + gap) + offsetX;
  const y = row * (imgHeight + gap) + offsetY;
  ctx.drawImage(img, x, y, imgWidth, imgHeight);
}
```

#### 使用流程
1. 上传图片（支持点击/拖拽/粘贴三种方式）
2. 在缩略图列表中调整顺序、旋转或删除
3. 选择布局方式（横向/纵向/网格）
4. 调节间距、圆角、背景色等参数
5. 实时预览满意后，点击「导出拼接图」

---

## 🏗️ 技术架构

### 技术栈选型

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **前端框架** | Vue 3 | ^3.5.30 | Composition API + `<script setup>` |
| **构建工具** | Vite | ^8.0.1 | 极速开发体验，ESM 原生支持 |
| **Vue 插件** | @vitejs/plugin-vue | ^6.0.5 | Vue 单文件组件编译 |
| **工具库** | JSZip | ^3.10.1 | 压缩文件处理（预留扩展） |
| **语言特性** | ES Modules | - | `"type": "module"` |
| **样式方案** | 原生 CSS | - | CSS Variables + Flex/Grid 布局 |
| **图形渲染** | Canvas API | 原生 | 高性能 2D 绘图 |

### 项目结构

```
subtitle_extractor/
├── src/                          # 源代码目录
│   ├── components/               # 通用组件
│   │   ├── AppModal.vue          # 模态对话框组件
│   │   └── SliderInput.vue       # 滑块输入组件（带数值显示）
│   ├── composables/              # 组合式函数
│   │   └── useToast.js           # Toast 提示逻辑复用
│   ├── styles/                   # 样式文件
│   │   └── global.css            # 全局样式（CSS Variables、重置样式）
│   ├── views/                    # 页面视图
│   │   ├── VideoSubtitle.vue     # 视频字幕提取（~1310 行）
│   │   ├── ImageSubtitle.vue     # 图片截取字幕
│   │   └── ImageStitch.vue       # 图片拼接（~1004 行）
│   ├── App.vue                   # 根组件（路由导航）
│   └── main.js                   # 应用入口
├── statics/                      # 静态资源
│   ├── index.html                # 备用 HTML 文件
│   └── README.md                 # 静态资源说明
├── index.html                    # 主 HTML 模板
├── package.json                  # 项目配置与依赖
├── vite.config.js                # Vite 构建配置
└── PROJECT_DOCUMENTATION.md      # 本文档
```

### 核心设计模式

#### 1. Composition API 模式
利用 Vue 3 的组合式 API 实现逻辑复用和状态管理：
```javascript
// useToast.js - 可复用的 Toast 逻辑
export function useToast() {
  const showToast = (message, type = 'info') => {
    // Toast 显示逻辑
  };
  return { showToast };
}
```

#### 2. 响应式数据驱动
通过 `ref` 和 `reactive` 实现数据与视图的双向绑定：
```javascript
const layout = ref('horizontal');
const gap = ref(10);
// 视图自动响应数据变化
```

#### 3. 策略模式（图片拼接布局）
针对不同布局采用不同的渲染策略：
```javascript
switch (layout.value) {
  case 'horizontal': renderHorizontal(); break;
  case 'vertical': renderVertical(); break;
  case 'grid': renderGrid(); break;
}
```

#### 4. 观察者模式
Canvas 事件监听与状态更新：
```javascript
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseup', onMouseUp);
```

---

## 🔧 核心技术实现

### 1. Canvas 渲染机制

#### 显示尺寸 vs 像素分辨率
Canvas 有两个独立的尺寸概念：
- **CSS 显示尺寸**：通过 `width: 100%` 控制视觉大小
- **像素分辨率**：通过 `canvas.width/height` 控制实际渲染精度

```javascript
// 关键：两者独立设置，避免模糊
canvas.style.width = '100%';        // 显示尺寸
canvas.width = img.naturalWidth;    // 像素分辨率
canvas.height = img.naturalHeight;
```

#### 高清渲染优化
```javascript
// 考虑设备像素比（DPR）
const dpr = window.devicePixelRatio || 1;
canvas.width = displayWidth * dpr;
canvas.height = displayHeight * dpr;
ctx.scale(dpr, dpr);
```

---

### 2. 坐标换算算法

#### 视频坐标系转换
视频显示尺寸与原始分辨率不一致时，需进行精确换算：

```javascript
// 获取换算比例
const rect = videoEl.value.getBoundingClientRect();
const scaleX = videoEl.value.videoWidth / rect.width;
const scaleY = videoEl.value.videoHeight / rect.height;

// 鼠标坐标 → 视频原始坐标
const originalX = (mouseX - rect.left) * scaleX;
const originalY = (mouseY - rect.top) * scaleY;
```

#### 覆盖层偏移修正
当视频容器存在 UI 控件（如控制条）导致覆盖层高度小于视频渲染高度时：

```javascript
// 错误做法：直接应用比例
// cropY = ratio * video.videoHeight; ❌

// 正确做法：先转屏幕坐标，再映射回视频坐标
const screenY = ratio * overlayHeight;  // 覆盖层上的像素值
const videoY = screenY * (videoHeight / overlayHeight);  // 映射到视频
```

---

### 3. 异步帧处理机制

#### Seek 事件驱动
视频逐帧截图必须等待 `seeked` 事件，不能使用 `setTimeout`：

```javascript
async function extractFrame(timePoint) {
  return new Promise((resolve) => {
    video.currentTime = timePoint;
    
    // 关键：等待 seeked 事件，确保帧已加载
    video.addEventListener('seeked', function onSeeked() {
      video.removeEventListener('seeked', onSeeked);
      
      // 此时绘制才是准确的帧
      ctx.drawImage(video, 0, 0);
      resolve(canvas.toDataURL());
    });
  });
}
```

#### 批量处理优化
```javascript
// 串行处理，避免并发 seek 冲突
for (const time of timePoints) {
  const frame = await extractFrame(time);
  frames.push(frame);
  updateProgress();  // 更新进度条
}
```

---

### 4. 拖拽交互逻辑

#### 阈值判断
鼠标点击位置与目标元素的距离判断：

```javascript
function getDraggingTarget(mouseY) {
  const topLineY = canvas.height * topCutRatio;
  const bottomLineY = canvas.height * bottomCutRatio;
  const threshold = 10;  // 10px 容差
  
  if (Math.abs(mouseY - topLineY) < threshold) return 'top';
  if (Math.abs(mouseY - bottomLineY) < threshold) return 'bottom';
  return null;
}
```

#### 拖拽状态管理
```javascript
let dragging = null;  // 'top' | 'bottom' | null

function onMouseDown(e) {
  dragging = getDraggingTarget(e.offsetY);
}

function onMouseMove(e) {
  if (!dragging) return;
  
  const ratio = e.offsetY / canvas.height;
  if (dragging === 'top') topCutRatio.value = ratio;
  if (dragging === 'bottom') bottomCutRatio.value = ratio;
  
  redrawCanvas();  // 实时重绘
}

function onMouseUp() {
  dragging = null;
}
```

---

### 5. 图片拼接算法

#### 动态画布尺寸计算
```javascript
function calculateCanvasSize() {
  let totalWidth = 0;
  let totalHeight = 0;
  
  if (layout === 'horizontal') {
    totalWidth = images.reduce((sum, img) => sum + img.width + gap, 0) - gap;
    totalHeight = Math.max(...images.map(img => img.height));
  } else if (layout === 'vertical') {
    totalWidth = Math.max(...images.map(img => img.width));
    totalHeight = images.reduce((sum, img) => sum + img.height + gap, 0) - gap;
  } else if (layout === 'grid') {
    const cols = gridCols;
    const rows = Math.ceil(images.length / cols);
    const maxImgWidth = Math.max(...images.map(img => img.width));
    const maxImgHeight = Math.max(...images.map(img => img.height));
    totalWidth = cols * maxImgWidth + (cols - 1) * gap;
    totalHeight = rows * maxImgHeight + (rows - 1) * gap;
  }
  
  return { 
    width: totalWidth * scale, 
    height: totalHeight * scale 
  };
}
```

#### 对齐方式实现
```javascript
function getOffset(imgSize, containerSize, align) {
  switch (align) {
    case 'start': return 0;
    case 'center': return (containerSize - imgSize) / 2;
    case 'end': return containerSize - imgSize;
    default: return 0;
  }
}
```

---

## 💻 开发指南

### 环境要求

- **Node.js**: v18+（推荐 v20 LTS）
- **包管理器**: npm / yarn / pnpm
- **浏览器**: Chrome 90+ / Firefox 88+ / Safari 14+ / Edge 90+

### 安装步骤

```bash
# 克隆项目
git clone <repository-url>
cd subtitle_extractor

# 安装依赖
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

### 开发命令

```bash
# 启动开发服务器（热重载）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 开发服务器

运行 `npm run dev` 后，Vite 将启动本地开发服务器：
- 默认地址：`http://localhost:5173`
- 支持热模块替换（HMR）
- 自动打开浏览器

### 代码规范

- 使用 Vue 3 `<script setup>` 语法糖
- 遵循 ESLint + Prettier 规范（如配置）
- 组件命名：PascalCase（如 `AppModal.vue`）
- 变量命名：camelCase
- 常量命名：UPPER_SNAKE_CASE

---

## 📝 使用场景

### 场景 1：视频课程字幕提取

**背景**：在线教育平台需要将视频课程中的关键知识点字幕提取为图片，方便学员复习。

**操作流程**：
1. 上传课程视频
2. 框选底部字幕区域
3. 播放视频，在每个知识点出现时按空格键标记
4. 一键提取并拼接
5. 导出为 PNG 分享到学习群

**优势**：相比手动截图，效率提升 10 倍以上，且保证字幕完整性。

---

### 场景 2：影视剧台词整理

**背景**：影视博主需要整理经典台词制作图文内容。

**操作流程**：
1. 上传影视剧片段
2. 框选字幕区域
3. 设置自动每秒提取（或手动标记精彩台词）
4. 生成长图后裁剪出需要的部分
5. 添加水印后发布到社交媒体

---

### 场景 3：多语言字幕对比

**背景**：翻译团队需要对比不同语言版本的字幕位置和样式。

**操作流程**：
1. 分别提取中文、英文字幕
2. 使用图片拼接功能横向排列
3. 调整间距和对齐方式
4. 导出对比图供审校使用

---

### 场景 4：聊天记录长图制作

**背景**：将微信/QQ 聊天截图拼接为完整的对话长图。

**操作流程**：
1. 上传多张聊天截图
2. 切换到「图片拼接」模块
3. 选择纵向布局
4. 调整间距为 0，去除多余空白
5. 设置白色背景
6. 导出高清长图

---

### 场景 5：电商商品详情图

**背景**：将多张商品细节图拼接为淘宝/京东详情页图片。

**操作流程**：
1. 上传商品实拍图
2. 拖拽调整展示顺序
3. 选择网格布局（2 列）
4. 设置间距 10px，圆角 8px
5. 添加浅灰色背景
6. 导出用于上架

---

### 场景 6：漫画/条漫拼接

**背景**：将分格漫画拼接为适合手机阅读的竖版条漫。

**操作流程**：
1. 上传漫画分镜图
2. 选择纵向布局
3. 调整每格间距
4. 添加黑色背景模拟漫画边框
5. 导出长图发布到漫画平台

---

## ⚡ 性能优化

### 1. 内存管理

#### ObjectURL 释放
```javascript
// 创建 URL
const url = URL.createObjectURL(file);

// 组件卸载或文件更换时释放
onBeforeUnmount(() => {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value);
  }
});
```

#### 大图像处理
- 限制同时处理的图片数量（建议 < 50 张）
- 导出前提示用户大图可能耗时较长
- 使用 Web Worker 处理复杂计算（未来优化方向）

---

### 2. Canvas 优化

#### 避免频繁重绘
```javascript
// 使用 requestAnimationFrame 节流
let rafId = null;
function scheduleRedraw() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    redrawCanvas();
    rafId = null;
  });
}
```

#### 离屏 Canvas
对于复杂渲染，使用离屏 Canvas 预渲染：
```javascript
const offscreen = document.createElement('canvas');
offscreen.width = width;
offscreen.height = height;
const offCtx = offscreen.getContext('2d');
// 在离屏 Canvas 上绘制
// ...
// 最后一次性绘制到主 Canvas
ctx.drawImage(offscreen, 0, 0);
```

---

### 3. 视频处理优化

#### 进度反馈
```javascript
// 实时显示处理进度
const progress = ref(0);
for (let i = 0; i < timePoints.length; i++) {
  await extractFrame(timePoints[i]);
  progress.value = ((i + 1) / timePoints.length) * 100;
}
```

#### 错误处理
```javascript
try {
  await extractFrames();
} catch (error) {
  showToast('提取失败：' + error.message, 'error');
  console.error('Frame extraction error:', error);
}
```

---

## 🚢 部署方案

### 静态部署

#### 1. 构建生产版本
```bash
npm run build
```
生成的 `dist/` 目录包含所有静态文件。

#### 2. 部署到 Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/subtitle_extractor/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 启用 Gzip 压缩
    gzip on;
    gzip_types text/css application/javascript image/png;
}
```

#### 3. 部署到 Vercel
创建 `vercel.json`：
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
然后推送代码到 GitHub，Vercel 自动部署。

#### 4. 部署到 Netlify
创建 `netlify.toml`：
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 5. GitHub Pages
```bash
# 安装 gh-pages
npm install -D gh-pages

# 在 package.json 添加脚本
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

# 部署
npm run deploy
```

---

### CDN 加速

对于大型资源文件，可配置 CDN：
```javascript
// vite.config.js
export default defineConfig({
  base: 'https://cdn.example.com/subtitle-extractor/',
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});
```

---

## ❓ 常见问题

### Q1: 视频截图不准确，帧有偏差？

**原因**：使用了 `setTimeout` 而非等待 `seeked` 事件。

**解决方案**：
```javascript
// ❌ 错误做法
video.currentTime = time;
setTimeout(() => {
  ctx.drawImage(video, 0, 0);
}, 100);

// ✅ 正确做法
video.currentTime = time;
await new Promise(resolve => {
  video.addEventListener('seeked', resolve, { once: true });
});
ctx.drawImage(video, 0, 0);
```

---

### Q2: Canvas 绘制的图片模糊？

**原因**：CSS 显示尺寸与 Canvas 像素分辨率不匹配。

**解决方案**：
```javascript
// 明确设置像素分辨率
canvas.width = naturalWidth;
canvas.height = naturalHeight;

// CSS 只控制显示大小
canvas.style.width = '100%';
canvas.style.height = 'auto';
```

---

### Q3: 视频框选区域与实际裁剪不一致？

**原因**：未正确处理覆盖层与视频的尺寸差异。

**解决方案**：参考「坐标换算算法」章节，先将比例转换为屏幕坐标，再映射到视频原始坐标。

---

### Q4: 大图拼接时浏览器卡顿？

**原因**：Canvas 尺寸过大或图片数量过多。

**解决方案**：
- 限制单次处理图片数量（< 50 张）
- 降低输出缩放比例（scale < 1.5）
- 使用 Web Worker 后台处理（未来优化）

---

### Q5: 移动端触摸操作不流畅？

**原因**：未针对触摸事件优化。

**解决方案**：
```javascript
// 同时监听鼠标和触摸事件
canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('touchstart', handleStart, { passive: false });

canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('touchmove', handleMove, { passive: false });

canvas.addEventListener('mouseup', handleEnd);
canvas.addEventListener('touchend', handleEnd);
```

---

### Q6: 导出的图片文件大小过大？

**原因**：PNG 格式无损压缩，JPEG 质量设置过高。

**解决方案**：
```javascript
// PNG：无法压缩，建议用于需要透明度的场景
canvas.toDataURL('image/png');

// JPEG：可调节质量（0.0 ~ 1.0）
canvas.toDataURL('image/jpeg', 0.85);  // 85% 质量，平衡清晰度和体积

// WebP：更好的压缩率（现代浏览器支持）
canvas.toDataURL('image/webp', 0.85);
```

---

## 🛠️ 技术难点解析

### 难点 1：视频坐标系精确换算

**问题**：视频在页面上的显示尺寸通常不等于原始分辨率，导致鼠标框选的坐标无法直接用于裁剪。

**解决思路**：
1. 获取视频元素的 `getBoundingClientRect()` 得到显示尺寸
2. 获取视频的 `videoWidth/videoHeight` 得到原始分辨率
3. 计算缩放比例：`scaleX = videoWidth / displayWidth`
4. 将鼠标坐标乘以缩放比例得到原始坐标

**边界情况**：
- 视频容器有 padding/margin
- 视频保持宽高比时可能有黑边
- 覆盖层 Canvas 高度因 UI 控件而小于视频高度

---

### 难点 2：异步帧提取的时序控制

**问题**：`video.currentTime` 赋值是异步的，立即绘制会得到旧帧。

**解决思路**：
- 使用 Promise 包装 `seeked` 事件
- 串行处理时间点，避免并发 seek 冲突
- 添加超时机制防止无限等待

**代码示例**：
```javascript
function seekToTime(time, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Seek timeout'));
    }, timeout);
    
    video.addEventListener('seeked', function handler() {
      clearTimeout(timer);
      video.removeEventListener('seeked', handler);
      resolve();
    }, { once: true });
    
    video.currentTime = time;
  });
}
```

---

### 难点 3：Canvas 拖拽交互的平滑性

**问题**：高频触发 `mousemove` 导致性能问题和视觉抖动。

**解决思路**：
- 使用 `requestAnimationFrame` 节流重绘
- 只在拖拽状态下响应移动事件
- 添加最小移动距离阈值（如 1px）

---

### 难点 4：多图拼接的内存管理

**问题**：大量图片同时加载可能导致内存溢出。

**解决思路**：
- 使用 `URL.createObjectURL` 而非 Base64
- 处理完成后及时 `revokeObjectURL`
- 分批处理超大图片集
- 提供「清空全部」功能释放资源

---

## 📊 项目统计

- **总代码行数**：约 3500+ 行
- **核心模块**：3 个主要视图组件
- **通用组件**：2 个可复用组件
- **组合式函数**：1 个（useToast）
- **依赖数量**：2 个生产依赖 + 2 个开发依赖
- **构建产物大小**：约 150-200 KB（Gzip 后）

---

## 🔮 未来规划

### 短期计划（v1.x）
- [ ] 添加批量视频处理能力
- [ ] 支持字幕识别（OCR）
- [ ] 增加更多导出格式（PDF、ZIP）
- [ ] 优化移动端触摸体验
- [ ] 添加快捷键帮助文档

### 中期计划（v2.x）
- [ ] 引入 Web Worker 提升大文件处理性能
- [ ] 支持视频剪辑功能（裁剪、合并）
- [ ] 添加字幕编辑功能（修改文字、样式）
- [ ] 实现云端同步（可选，需用户授权）
- [ ] 插件系统支持自定义功能

### 长期愿景
- 成为最易用的浏览器端多媒体处理工具
- 支持更多媒体格式（GIF、SVG、WebP 动画）
- AI 辅助功能（自动检测字幕区域、智能裁剪）
- 跨平台桌面应用（Electron/Tauri）

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交 Bug
1. 描述问题现象
2. 提供复现步骤
3. 附上浏览器版本和操作系统信息
4. 如有可能，提供截图或录屏

### 功能建议
1. 说明使用场景
2. 描述期望的功能
3. 提供参考案例或竞品对比

### 代码贡献
1. Fork 本项目
2. 创建特性分支（`git checkout -b feature/AmazingFeature`）
3. 提交更改（`git commit -m 'Add some AmazingFeature'`）
4. 推送到分支（`git push origin feature/AmazingFeature`）
5. 开启 Pull Request

---

## 📄 开源协议

本项目采用 MIT 协议开源，详见 [LICENSE](LICENSE) 文件。

---


## 🙏 致谢

感谢以下开源项目的支持：
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [JSZip](https://stuk.github.io/jszip/) - JavaScript 压缩/解压缩库

---

## 📞 联系方式

- **项目主页**：[GitHub Repository](https://github.com/lovemyFamilyFovever/subtitle_extractor.git)
- **邮箱**：liuxiang75@live.com

---

**⭐ 如果这个项目对您有帮助，请给一个 Star！**

---

*最后更新时间：2026-04-06*
