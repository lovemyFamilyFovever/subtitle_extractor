# Vue 3 + Vite

1. 视频字幕提取：

上传/拖拽视频 → 视频渲染出来
鼠标在视频上拖拽 → 绿色虚线选框出现，右侧坐标自动同步
空格/Enter 快速标记时间点，或留空自动按每秒提取
「智能提取并拼接」→ 逐帧 seek 截图 → 拼接结果显示在下方


视频字幕提取（VideoSubtitle.vue）。

状态：
  - videoUrl          视频的 ObjectURL
  - videoWidth/Height 视频原始分辨率
  - cropRect          框选的裁剪区域 { x1, y1, x2, y2 }（原始像素坐标）
  - selecting         是否正在框选中
  - selectionStart/End 框选起止点
  - timePoints[]      标记的时间点列表
  - fps               视频帧率

核心交互：
  - 鼠标在视频上拖拽 → 框选字幕区域（覆盖层 Canvas 绘制选框）
  - 空格/Enter 标记当前时间点
  - 「智能提取」→ 遍历时间点，逐帧截图裁剪 → 垂直拼接

难点：
  - 视频显示尺寸 ≠ 视频原始分辨率，坐标需要换算
  - 逐帧截图需要 seek + 等待 seeked 事件，不能用 setTimeout


2. 图片截取字幕：

上传多张图片 → Canvas 显示图片 + 红蓝裁剪线
直接在 Canvas 上拖拽线条，右侧滑块同步
「生成长拼接图」→ 按裁剪规则拼接所有图片


刷新页面，点击「图片截取字幕」，你应该能看到：

添加图片后，图片渲染在 Canvas 上，并叠加红线（上边界）和蓝线（下边界）
鼠标直接拖拽 Canvas 上的线条来调整位置，实时重绘
右侧滑块也可以精确控制两条线的位置
左右箭头切换图片，裁剪线位置同步保持（所有图片共用同一套比例）
点击「生成长拼接图」后，结果显示在下方，可保存 PNG / JPEG


关于 Canvas 的一个重要细节
你可能注意到模板里有这样的写法：
``` vue
<canvas
  ref="canvas"        ← JS 里通过 canvas.value 访问 DOM
  class="preview-canvas"
  @mousedown="onMouseDown"
  ...
></canvas>
```
CSS 里 width: 100% 只控制显示尺寸，而 canvas.width = img.naturalWidth 控制像素分辨率。这两者是独立的，这是 Canvas 和普通图片最大的区别，保证了不管图片多大，在弹窗里都能正常显示且不模糊。


图片截取字幕（ImageSubtitle.vue）。

状态：
  - images[]          图片列表
  - currentIndex      当前预览的图片索引
  - topCutRatio       红线位置（0~1 的比例值）
  - bottomCutRatio    蓝线位置（0~1 的比例值）
  - dragging          当前拖拽的是哪条线（'top' | 'bottom' | null）

核心交互：
  - 图片渲染到 Canvas 上
  - 红线/蓝线叠加绘制在 Canvas 上
  - 鼠标按下时判断点击的是哪条线（距离 < 阈值）
  - 鼠标移动时更新对应线的 ratio 并重绘
  - 鼠标释放时停止拖拽

生成逻辑：
  - 第一张：从顶部 → 蓝线（bottomCutRatio）
  - 后续张：从红线（topCutRatio）→ 蓝线
  - 垂直拼接所有裁剪后的图片


3. 图片拼接：

上传/拖拽/粘贴图片
实时预览所有参数变化
导出高清拼接图


现在刷新页面，点击「图片拼接」按钮，你应该能看到：

上传区可以点击选图、拖拽上传、粘贴图片
缩略图列表支持拖拽排序、旋转、删除
右侧设置区：布局/对齐/间距/圆角/背景色/缩放 全部联动实时预览
预览 Canvas 自动更新
「导出拼接图」按钮触发下载


图片拼接（ImageStitch.vue）

状态（ref/reactive）：
  - images[]        图片列表
  - layout          布局方式 (horizontal/vertical/grid)
  - gridCols        网格列数
  - gap             间距
  - radius          圆角
  - align           对齐方式
  - bgColor         背景色
  - scale           输出缩放
  - isDragOver      拖拽悬停状态

方法：
  - addFiles()      添加文件（处理 File 对象数组）
  - removeImage()   删除单张图
  - moveImage()     拖拽排序
  - stitchImages()  核心拼接算法
  - updatePreview() 更新预览 Canvas
  - exportImage()   导出图片
  - clearAll()      清空

