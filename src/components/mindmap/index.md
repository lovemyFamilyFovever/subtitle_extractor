# 思维导图模块说明

本目录下的组件负责思维导图 UI 层的展示与交互。组件之间通过 `props` 和事件与核心逻辑解耦，核心业务逻辑由 `src/composables/useMindMap.js` 及其相关 composables 提供。

## 功能概览

- 思维导图渲染与生命周期管理
- 节点编辑与操作：撤销、重做、同级/子节点插入、删除节点
- 图片、超链接、备注插入与编辑
- 主题切换、结构布局切换、基础样式与节点样式配置
- 大纲视图、文件列表、关联线、画布背景与本地文件管理

## composables 目录概览

### `useMindMap.js`
- 思维导图核心组合式函数
- 初始化 `simple-mind-map` 实例并绑定主题、布局、事件、图片与自定义背景
- 管理当前激活节点、撤销/重做状态、缩放、关联线模式与保存状态
- 通过 `useMindMapPersistence`、`useMindMapTheme`、`useMindMapMedia` 等辅助模块拆分逻辑

### `useMindMapPersistence.js`
- 负责本地缓存、导入、导出、打开本地文件和保存到文件系统
- 使用 `localStorage` 自动缓存思维导图数据
- 支持 File System Access API 与传统 input 文件选择兼容模式

### `useMindMapTheme.js`
- 主题与样式辅助函数
- 提供节点颜色列表、主题配置读取/写入、画布自定义背景应用
- 基于当前主题和节点样式实现颜色分配与样式更新

### `useMindMapPanels.js`
- 面板显示控制逻辑
- 负责主题面板、结构面板、大纲面板、基础样式面板、节点样式面板与文件列表面板的显隐管理

### `useMindMapMedia.js`
- 图像相关数据处理
- 从思维导图节点中采集图片列表
- 支持将图片插入选中节点并按真实尺寸/压缩尺寸处理

### `useMindMapKeyboard.js`
- 全局键盘快捷键支持
- 监听 `Ctrl/Cmd+S` 保存、`Delete` 删除关联线等操作

### `useMindMapImages.js`
- 图片插入与预览交互状态管理
- 控制图片插入弹窗、图片浏览器显示和双击图片预览逻辑

### `useMindMapFileManager.js`
- 本地文件列表管理
- 处理文件加载、重复文件判定、移除文件、保存当前文件等行为

### `useMindMapAnnotations.js`
- 超链接/备注功能支持
- 管理节点超链接与备注弹窗状态、位置计算和节点数据更新

### `useNodeColorList.js`
- 节点主题色配置列表
- 提供多套颜色主题和颜色循环分配策略

### `useUndoRedo.js`
- 通用撤销/重做状态管理组合式函数
- 支持任意历史状态推入、撤销、重做与清空

### `useToast.js`
- 全局通知提示组合函数
- 支持显示多条 toast、自动淡出、消息类型区分

### `useTheme.js`
- 全局页面主题开关（暗色/亮色）
- 支持 `localStorage` 持久化和 DOM attribute 应用

### `NodeImgAdjust.js`
- 自定义思维导图节点图片拖拽调整插件
- 扩展 `simple-mind-map` 的图片调整与删除按钮功能

## components 目录概览

### 通用 UI 组件

- `AppModal.vue`
  - 通用弹窗容器
  - 提供遮罩、标题、关闭按钮和插槽内容区
- `Dropdown.vue`
  - 通用下拉选择组件
  - 支持自定义选项、颜色预览、外部点击关闭
- `ColorInput.vue`
  - 颜色选择器组件
  - 支持历史颜色、预设主题、自定义 RGB/HEX 调整
- `SliderInput.vue`
  - 滑动条 + 数值输入组件
  - 支持输入/滑块同步、键盘微调
- `ImageViewer.vue`
  - 图片预览组件（用于双击图像时放大显示）
- `common/IconBtn.vue`
  - 通用图标按钮组件
  - 用于统一按钮样式与图标展示

### 思维导图专用组件

- `MindMapCore.vue`
  - 核心画布容器组件
  - 初始化 `useMindMap`、绑定键盘事件并销毁实例
- `MindMapToolbar.vue`
  - 工具栏组件
  - 集中管理节点操作、主题切换、面板切换与文件操作入口
- `MindMapOverlay.vue`
  - 节点覆盖层组件
  - 显示超链接/备注提示并处理交互事件
- `ThemePanel.vue`
  - 主题选择面板
  - 控制浅色/深色主题与主题预览
- `NodeStylePanel.vue`
  - 当前节点样式调整面板
  - 提供字体、颜色、边框、背景、文本对齐、连线样式等细粒度配置
- `BaseStylePanel.vue`
  - 画布基础样式面板
  - 处理全局配色、背景类型、关联线与节点间距等设置
- `FileList.vue`
  - 本地文件管理面板
  - 显示打开的思维导图文件列表并支持加载/删除/添加
- `OutlinePanel.vue`
  - 大纲视图面板
  - 以树形结构展示当前导图并支持节点定位
- `OutlineNode.vue`
  - 递归大纲节点组件
  - 负责渲染子节点与聚焦节点事件
- `Structure.vue`
  - 布局选择面板
  - 提供多种结构图缩略图与布局切换
- `ImageDialog.vue`
  - 图片插入对话框
  - 支持本地图片拖拽、URL 加载与压缩选项
- `HyperlinkDialog.vue`
  - 超链接编辑对话框
  - 支持插入、编辑和删除节点链接
- `NoteDialog.vue`
  - 备注编辑对话框
  - 支持插入、编辑和删除节点备注

## 关系说明

- `src/components/mindmap` 目录以 UI 与交互为主，负责将用户操作转化为事件并传给上层逻辑。
- `src/composables` 目录以业务逻辑为主，负责思维导图实例管理、持久化、主题、媒体、快捷键、文件与注释等核心功能。
- 若要理解整体架构，建议先从 `useMindMap.js` 开始，随后阅读 `useMindMapPersistence.js`、`useMindMapTheme.js`、`useMindMapFileManager.js`、`useMindMapAnnotations.js`。