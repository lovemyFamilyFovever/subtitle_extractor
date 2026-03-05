# 导入系统相关的库，用于处理命令行参数和退出程序
import sys
# 导入操作系统接口库，用于处理文件路径等操作
import os
# 从 PyQt5 导入各种 GUI 组件类
# QApplication: 应用程序核心管理类
# QMainWindow: 主窗口类
# QVBoxLayout, QHBoxLayout: 垂直和水平布局管理器
# QPushButton: 按钮控件
# QLabel: 标签控件，用于显示文本或图片
# QFileDialog: 文件选择对话框
# QLineEdit: 单行文本输入框
# QWidget: 所有用户界面对象的基类
# QSlider: 滑动条控件
# QTextEdit: 多行文本编辑框
# QMessageBox: 消息提示框
# QGroupBox: 带标题的分组框
# QSpinBox: 数字输入框（可上下调节）
# QSplitter: 可拖动调整大小的分割器
# QSizePolicy: 控件尺寸策略
# QTabWidget: 标签页切换控件
# QScrollArea: 可滚动区域
from PyQt5.QtWidgets import (QApplication, QMainWindow, QVBoxLayout, QHBoxLayout,
                             QPushButton, QLabel, QFileDialog, QLineEdit,
                             QWidget, QSlider, QTextEdit, QMessageBox, QGroupBox,
                             QSpinBox, QSplitter, QSizePolicy, QTabWidget, QScrollArea, QStackedWidget, QComboBox)
# 从 PyQt5 导入核心功能类
# Qt: 包含各种枚举值（如对齐方式、按键码等）
# QTimer: 定时器类，用于周期性执行任务
# QEvent: 事件基类
# pyqtSignal: 用于定义自定义信号
# QPropertyAnimation: 属性动画类，用于实现平滑动画效果
# QEasingCurve: 动画缓动曲线
from PyQt5.QtCore import Qt, QTimer, QEvent, pyqtSignal, QPropertyAnimation, QEasingCurve
# 从 PyQt5 导入图形相关类
# QImage: 图像数据类
# QPixmap: 用于在屏幕上显示图像的类
# QPainter: 绘图工具类，用于在控件上绘制图形
# QPen: 画笔类，定义线条颜色、宽度等
# QColor: 颜色类
from PyQt5.QtGui import QImage, QPixmap, QPainter, QPen, QColor

# 导入 OpenCV 库，用于视频处理和图像操作
import cv2
# 导入 NumPy 库，用于高效的数值计算和数组操作
import numpy as np
# 导入正则表达式库，用于解析时间戳字符串
import re

# ==========================================
# 自定义视频预览控件类
# ==========================================
class VideoPreviewLabel(QLabel):
    """
    支持鼠标框选的视频预览控件
    继承自 QLabel，增加了鼠标拖拽绘制矩形框的功能
    """
    def __init__(self):
        # 调用父类 QLabel 的构造函数
        super().__init__()
        # 设置文本和图像居中对齐
        self.setAlignment(Qt.AlignCenter)
        # 设置控件的最小尺寸为 640x360
        self.setMinimumSize(640, 360)
        # 设置尺寸策略为“可扩展”，允许控件随窗口大小变化而拉伸
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        # 设置样式表：灰色边框，黑色背景，白色文字
        self.setStyleSheet("border: 2px solid #ccc; background: #000; color: #fff;")
        # 设置初始提示文本
        self.setText('请上传视频')
        # 标记是否正在选择（鼠标按下拖拽中）
        self.selecting = False
        # 记录鼠标按下的起始点坐标
        self.start_point = None
        # 记录鼠标移动到的结束点坐标
        self.end_point = None
        # 存储最终确认的选择矩形区域 (x1, y1, x2, y2)
        # 改名避免与 QLabel 自带的 rect() 方法冲突
        self.selection_rect = None
        # 控制是否显示选择框的开关
        self.show_selection_box = True
        # 保存原始 pixmap（不带框的版本），用于重绘时恢复
        self.original_pixmap = None

    def mousePressEvent(self, event):
        """
        鼠标按下事件处理
        当左键按下且当前有图像显示时，开始框选
        """
        # 判断是否是左键点击 且 当前标签上有图像(pixmap)
        if event.button() == Qt.LeftButton and self.pixmap():
            # 标记开始选择状态
            self.selecting = True
            # 记录起始点为当前鼠标位置
            self.start_point = event.pos()
            # 初始化结束点也为当前位置
            self.end_point = event.pos()
            # 清空之前确认的选择矩形
            self.selection_rect = None
            # 触发重绘，显示起始点
            self.update()

    def mouseMoveEvent(self, event):
        """
        鼠标移动事件处理
        如果正在选择，更新结束点坐标并重绘以显示动态矩形
        """
        # 如果正在选择 且 起始点存在
        if self.selecting and self.start_point:
            # 更新结束点为当前鼠标位置
            self.end_point = event.pos()
            # 触发重绘，显示从起点到终点的矩形
            self.update()

    def mouseReleaseEvent(self, event):
        """
        鼠标释放事件处理
        完成框选，计算并保存最终的矩形区域
        """
        # 如果是左键释放 且 处于选择状态
        if event.button() == Qt.LeftButton and self.selecting:
            # 结束选择状态
            self.selecting = False
            # 如果起始点和结束点都存在
            if self.start_point and self.end_point:
                # 确保坐标顺序正确（左上角到右下角）
                # 取 x 坐标的最小值作为左边界
                x1 = min(self.start_point.x(), self.end_point.x())
                # 取 y 坐标的最小值作为上边界
                y1 = min(self.start_point.y(), self.end_point.y())
                # 取 x 坐标的最大值作为右边界
                x2 = max(self.start_point.x(), self.end_point.x())
                # 取 y 坐标的最大值作为下边界
                y2 = max(self.start_point.y(), self.end_point.y())
                
                # 获取当前控件的矩形范围
                widget_rect = self.rect()
                # 限制坐标在控件范围内，防止越界
                x1 = max(0, min(x1, widget_rect.width()))
                y1 = max(0, min(y1, widget_rect.height()))
                x2 = max(0, min(x2, widget_rect.width()))
                y2 = max(0, min(y2, widget_rect.height()))
                
                # 检查选择区域是否足够大（最小 5x5 像素），防止误触
                if x2 - x1 > 5 and y2 - y1 > 5:
                    # 保存最终的选择矩形
                    self.selection_rect = (x1, y1, x2, y2)
                    # 触发重绘，显示最终确定的矩形
                    self.update()
                    # 新增：如果定义了回调函数，框选完成后自动调用
                    # 用于自动填充坐标输入框
                    if hasattr(self, 'callback_on_selection'):
                        self.callback_on_selection()

    def paintEvent(self, event):
        """
        绘制事件处理
        负责在视频图像上绘制选择框（拖拽中或已确认的）
        """
        # 先调用父类的绘制方法，显示原始图像
        super().paintEvent(event)
        
        # 如果没有图像 或 不显示选择框，直接返回
        if not self.pixmap() or not self.show_selection_box:
            return
            
        # 创建 QPainter 对象，用于在当前控件上绘图
        painter = QPainter(self)
        # 创建绿色画笔
        pen = QPen(QColor(0, 255, 0))
        # 设置画笔宽度为 1 像素（变细）
        pen.setWidth(1)
        # 应用画笔设置
        painter.setPen(pen)
        
        # 如果正在拖拽选择中（鼠标未释放）
        if self.selecting and self.start_point and self.end_point:
            # 计算临时矩形的坐标（同 mouseReleaseEvent 逻辑）
            x1 = min(self.start_point.x(), self.end_point.x())
            y1 = min(self.start_point.y(), self.end_point.y())
            x2 = max(self.start_point.x(), self.end_point.x())
            y2 = max(self.start_point.y(), self.end_point.y())
            # 绘制临时矩形 (x, y, width, height)
            painter.drawRect(x1, y1, x2 - x1, y2 - y1)
        
        # 如果已经确认了选择区域（鼠标已释放）
        elif self.selection_rect:
            # 解包保存的矩形坐标
            x1, y1, x2, y2 = self.selection_rect
            # 绘制最终确定的矩形
            painter.drawRect(x1, y1, x2 - x1, y2 - y1)

    def get_video_coordinates(self, video_width, video_height):
        """
        将鼠标在界面上选择的坐标转换为视频实际分辨率的坐标
        因为视频在 Label 中可能是缩放显示的，需要反向计算
        """
        # 如果没有选择矩形 或 没有图像，返回 None
        if not self.selection_rect or not self.pixmap():
            return None

        # 获取当前 Label 控件的尺寸
        widget_rect = self.rect()
        # 获取当前显示的图片 (pixmap) 的尺寸
        pixmap_rect = self.pixmap().rect()
        
        # 计算缩放比例
        # PyQt 的 KeepAspectRatio 模式会取宽高中较小的缩放比，保证图像不变形且完全显示
        scale = min(widget_rect.width() / pixmap_rect.width(), 
                   widget_rect.height() / pixmap_rect.height())
        
        # 计算图像在控件中实际显示的宽度和高度
        display_width = pixmap_rect.width() * scale
        display_height = pixmap_rect.height() * scale
        
        # 计算图像在控件中的偏移量（因为通常居中显示）
        offset_x = (widget_rect.width() - display_width) / 2
        offset_y = (widget_rect.height() - display_height) / 2
        
        # 获取鼠标选择的坐标
        x1, y1, x2, y2 = self.selection_rect
        # 将屏幕坐标转换回 pixmap 坐标系
        # 减去偏移量，再除以缩放比例
        x1 = max(0, (x1 - offset_x) / scale)
        y1 = max(0, (y1 - offset_y) / scale)
        x2 = min(pixmap_rect.width(), (x2 - offset_x) / scale)
        y2 = min(pixmap_rect.height(), (y2 - offset_y) / scale)
        
        # 计算 pixmap 到原始视频分辨率的缩放比例
        # pixmap 可能也被缩放过（例如为了适应窗口），需要还原到视频原始大小
        scale_x = video_width / pixmap_rect.width()
        scale_y = video_height / pixmap_rect.height()
        
        # 将坐标转换到视频原始分辨率
        video_x1 = int(x1 * scale_x)
        video_y1 = int(y1 * scale_y)
        video_x2 = int(x2 * scale_x)
        video_y2 = int(y2 * scale_y)
        
        # 再次确保坐标在视频实际范围内，防止计算误差导致越界
        video_x1 = max(0, min(video_x1, video_width))
        video_y1 = max(0, min(video_y1, video_height))
        video_x2 = max(0, min(video_x2, video_width))
        video_y2 = max(0, min(video_y2, video_height))
        
        # 返回转换后的视频坐标 (x1, y1, x2, y2)
        return (video_x1, video_y1, video_x2, video_y2)

class VideoPreviewWidget(QWidget):
    """
    视频预览控件的主容器控件
    包含视频预览控件和控制面板
    """
    def __init__(self):
        super().__init__()
        # 初始化界面
        self.init_ui()

        # 安装事件过滤器以支持本组件内的快捷键
        self.installEventFilter(self)

    def init_ui(self):
        """
        初始化视频字幕提取功能的界面
        """
        # self.video_widget = QWidget()
        # 创建主垂直布局
        main_layout = QVBoxLayout(self)
      

        # --- 变量初始化 ---
        self.video_path = None # 视频文件路径
        self.cap = None # OpenCV 视频捕获对象
        self.current_frame = 0 # 当前帧索引
        self.fps = 0 # 视频帧率
        self.total_frames = 0 # 总帧数
        self.time_points = [] # 存储标记的时间点列表 [(time_sec, frame_idx), ...]
        self.crop_rect = None # 字幕裁剪区域 (x1, y1, x2, y2)
        
        # 1. 文件上传区域
        file_group = QGroupBox('1. 上传视频')
        file_group.setMinimumHeight(60)
        file_group.setMaximumHeight(60)
        file_group.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)


        self.btn_upload = QPushButton('📁 选择视频文件')
        self.btn_upload.clicked.connect(self.upload_video)
        self.btn_upload.setMinimumWidth(150)
        self.file_label = QLabel('未选择文件')
        self.file_label.setStyleSheet("color: #666; padding-left: 10px;")
        file_layout = QHBoxLayout(file_group)
        file_layout.addWidget(self.btn_upload)
        file_layout.addWidget(self.file_label, 1) # 拉伸填充剩余空间

        main_layout.addWidget(file_group)

        # 2. 视频预览和操作区域 (使用分割器，左右可拖拽调整宽度)
        split = QSplitter(Qt.Horizontal)

        # --- 左侧：视频预览 ---
        left_widget = QWidget()
        left_layout = QVBoxLayout(left_widget)

        # 自定义视频预览标签
        self.video_label = VideoPreviewLabel()
        self.video_label.setMinimumSize(900, 500)
        left_layout.addWidget(self.video_label, 1) # 拉伸因子 1，占满剩余空间

        # 播放控制栏
        control_layout = QHBoxLayout()
        self.btn_play_toggle = QPushButton('▶ 播放')
        self.btn_play_toggle.setMinimumWidth(100)
        self.btn_play_toggle.clicked.connect(self.toggle_play)
        
        self.btn_mark = QPushButton('🔖 标记时间 (Enter)')
        self.btn_mark.clicked.connect(self.mark_time)
        
        self.time_label = QLabel('00:00:00')
        self.time_label.setStyleSheet("font-weight: bold; color: #007ACC; font-size: 14px;")

        control_layout.addWidget(self.btn_play_toggle)
        control_layout.addWidget(self.btn_mark)
        control_layout.addStretch() # 弹性空间，把时间标签推到最右
        control_layout.addWidget(self.time_label)
        left_layout.addLayout(control_layout)

        # 进度条
        self.slider = QSlider(Qt.Horizontal)
        self.slider.sliderMoved.connect(self.set_position)
        left_layout.addWidget(self.slider)

        split.addWidget(left_widget)

        # --- 右侧：设置和日志 ---
        right_widget = QWidget()
        right_layout = QVBoxLayout(right_widget)

        # 字幕区域设置
        area_group = QGroupBox('2. 设置字幕区域')
        area_layout = QVBoxLayout(area_group)

        # 坐标输入框
        coord_layout = QHBoxLayout()
        self.x1_input = QLineEdit()
        self.y1_input = QLineEdit()
        self.x2_input = QLineEdit()
        self.y2_input = QLineEdit()

        coord_layout.addWidget(QLabel('坐标:'))
        coord_layout.addWidget(QLabel('x1:'))
        coord_layout.addWidget(self.x1_input, 1)
        coord_layout.addWidget(QLabel('y1:'))
        coord_layout.addWidget(self.y1_input, 1)
        coord_layout.addWidget(QLabel('x2:'))
        coord_layout.addWidget(self.x2_input, 1)
        coord_layout.addWidget(QLabel('y2:'))
        coord_layout.addWidget(self.y2_input, 1)

        # 操作按钮
        btn_layout = QHBoxLayout()
        self.btn_pick_area = QPushButton('🖱️ 鼠标框选')
        self.btn_pick_area.clicked.connect(self.pick_area_from_video)
        self.btn_set_area = QPushButton('⌨️ 手动设置')
        self.btn_set_area.clicked.connect(self.set_subtitle_area)

        btn_layout.addWidget(self.btn_pick_area)
        btn_layout.addWidget(self.btn_set_area)

        area_layout.addLayout(coord_layout)
        area_layout.addLayout(btn_layout)
        right_layout.addWidget(area_group)

        # 时间点标记
        time_group = QGroupBox('3. 标记的时间点')
        time_layout = QVBoxLayout(time_group)
        
        # 提示标签
        tip_label = QLabel('格式：序号。HH:MM:SS.mmm (帧：数字)\n可直接编辑、复制、粘贴时间点')
        tip_label.setStyleSheet("color: #666; font-size: 11px; padding: 5px;")
        time_layout.addWidget(tip_label)
        
        # 文本编辑框，显示和编辑时间点
        self.time_points_display = QTextEdit()
        self.time_points_display.setReadOnly(False)  # 允许用户手动编辑
        self.time_points_display.setFixedHeight(380)
        self.time_points_display.setMaximumHeight(380)
        self.time_points_display.setPlaceholderText('点击"标记时间"或按 Enter 键添加当前帧...\n可直接编辑此区域内容\n\n如不标记，默认每秒截取一次')
        time_layout.addWidget(self.time_points_display)

        # 标记操作按钮
        mark_btn_layout = QHBoxLayout()
        self.btn_apply_edit = QPushButton('✅ 应用编辑')
        self.btn_apply_edit.clicked.connect(self.apply_time_points_edit)
        self.btn_apply_edit.setToolTip('解析文本框中的时间点并应用')
        self.btn_clear = QPushButton('🗑️ 清空所有')
        self.btn_clear.clicked.connect(self.clear_marks)
        self.btn_delete_last = QPushButton('⬅️ 删除最后一个')
        self.btn_delete_last.clicked.connect(self.delete_last_mark)
        mark_btn_layout.addWidget(self.btn_apply_edit)
        mark_btn_layout.addWidget(self.btn_delete_last)
        mark_btn_layout.addWidget(self.btn_clear)
        time_layout.addLayout(mark_btn_layout)

        right_layout.addWidget(time_group)

        # 导出设置
        export_group = QGroupBox('4. 导出设置')
        export_layout = QVBoxLayout(export_group)

        # 背景填充颜色设置
        fill_layout = QHBoxLayout()
        fill_layout.addWidget(QLabel('背景填充:'))
        self.fill_color = QLineEdit('white')
        self.fill_color.setPlaceholderText('white/black/颜色名或#RGB')
        fill_layout.addWidget(self.fill_color)

        # 图片间距设置
        spacing_layout = QHBoxLayout()
        spacing_layout.addWidget(QLabel('图片间距:'))
        self.spacing_input = QSpinBox()
        self.spacing_input.setRange(0, 100)
        self.spacing_input.setValue(1)
        spacing_layout.addWidget(self.spacing_input)
        spacing_layout.addWidget(QLabel('像素'))

        # 图片质量设置
        quality_layout = QHBoxLayout()
        quality_layout.addWidget(QLabel('图片质量:'))
        self.quality_combo = QComboBox()
        self.quality_combo.addItem('高（不压缩）', 100)
        self.quality_combo.addItem('中（压缩）', 80)
        self.quality_combo.addItem('低（高压缩）', 60)
        self.quality_combo.setCurrentIndex(0)  # 默认选择高
        quality_layout.addWidget(self.quality_combo)

        export_layout.addLayout(fill_layout)
        export_layout.addLayout(spacing_layout)
        export_layout.addLayout(quality_layout)

        # 开始提取按钮
        self.btn_extract = QPushButton('🎯 提取并拼接字幕')
        self.btn_extract.setStyleSheet("background: #007ACC; color: white; font-weight: bold; padding: 10px; font-size: 13px;")
        self.btn_extract.clicked.connect(self.extract_subtitles)
        export_layout.addWidget(self.btn_extract)

        right_layout.addWidget(export_group)
        right_layout.addStretch() # 底部弹性空间

        split.addWidget(right_widget)
        # 设置左右拉伸比例，左侧视频区占大部分
        split.setStretchFactor(0, 10)
        split.setStretchFactor(1, 1)
        
        main_layout.addWidget(split)

        # 状态栏
        self.status_label = QLabel('就绪')
        self.status_label.setStyleSheet("padding: 8px; background: #f0f0f0; font-size: 12px;")
        main_layout.addWidget(self.status_label)
        # 【关键修改】设置最小高度和最大高度一致，强制固定高度
        self.status_label.setMinimumHeight(40) 
        self.status_label.setMaximumHeight(40)
        # 【关键修改】设置尺寸策略，水平可扩张，垂直禁止压缩或扩张
        self.status_label.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        main_layout.addWidget(self.status_label)

        # 定时器，用于视频播放
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_frame)

    def upload_video(self):
        """
        上传并加载视频文件
        """
        # 打开文件选择对话框
        file_path, _ = QFileDialog.getOpenFileName(self, '选择视频文件', '', '视频文件 (*.mp4 *.avi *.mov *.mkv *.wmv *.flv)')
        if file_path:
            self.video_path = file_path
            # 显示文件名
            self.file_label.setText(os.path.basename(file_path))
            # 绑定框选完成的回调函数，实现自动填充坐标
            self.video_label.callback_on_selection = self.auto_fill_selection

            # 如果之前有打开的视频，先释放资源
            if self.cap:
                self.cap.release()
            
            # 使用 OpenCV 打开视频
            self.cap = cv2.VideoCapture(file_path)
            if not self.cap.isOpened():
                QMessageBox.warning(self, '错误', '无法打开视频文件')
                return

            # 获取视频属性
            self.fps = self.cap.get(cv2.CAP_PROP_FPS)
            self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
            # 设置进度条最大值
            self.slider.setMaximum(self.total_frames - 1)

            # --- 优化部分：强制撑开显示区域 ---
            # 读取第一帧
            ret, frame = self.cap.read()
            if ret:
                self.current_frame = 0
                # BGR 转 RGB
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # 关闭自动缩放，由我们手动控制 scaled pixmap
                self.video_label.setScaledContents(False) 
                
                # 更新显示
                self.show_frame(frame_rgb)
                
                # 关键：通知布局管理器，内容已更改，需要重新分配空间
                self.video_label.updateGeometry()
                self.video_label.parentWidget().layout().activate()
                
                # 计算时长并显示状态
                duration = self.total_frames / self.fps if self.fps > 0 else 0
                self.status_label.setText(f'视频加载成功 - {self.total_frames}帧，{self.fps:.1f}fps, 时长：{self.format_time(duration)}')
            
            # 强制 UI 线程立即处理布局变化，防止界面卡顿
            QApplication.processEvents()

    def auto_fill_selection(self):
        """
        鼠标框选完成后自动填充坐标输入框
        """
        if not self.cap or not self.video_label.selection_rect:
            return

        # 获取视频原始分辨率
        width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        # 调用转换函数获取视频坐标
        coords = self.video_label.get_video_coordinates(width, height)
        if coords:
            x1, y1, x2, y2 = coords
            # 填充输入框
            self.x1_input.setText(str(x1))
            self.y1_input.setText(str(y1))
            self.x2_input.setText(str(x2))
            self.y2_input.setText(str(y2))
            # 保存裁剪区域
            self.crop_rect = (x1, y1, x2, y2)
            self.status_label.setText(f'已自动更新区域：({x1},{y1})-({x2},{y2})')


    def show_frame(self, frame):
        """
        将 OpenCV 帧数据显示到 QLabel 上
        包含自适应缩放逻辑
        """
        height, width, channel = frame.shape
        bytes_per_line = 3 * width
        # 创建 QImage
        q_img = QImage(frame.data, width, height, bytes_per_line, QImage.Format_RGB888)
        pixmap = QPixmap.fromImage(q_img)
        
        # 获取当前 Label 的可用宽度，动态计算缩放
        target_size = self.video_label.size()
        # 兜底：如果 Label 还没被完全撑开，用父容器宽度参考
        if target_size.width() < 100: 
             target_size = self.video_label.parentWidget().size()

        # 按比例缩放 pixmap，保持纵横比，平滑算法
        scaled_pixmap = pixmap.scaled(
            target_size, 
            Qt.KeepAspectRatio, 
            Qt.SmoothTransformation
        )
        # 保存缩放后的 pixmap，用于绘制选择框时的参考
        self.video_label.original_pixmap = scaled_pixmap
        # 显示图像
        self.video_label.setPixmap(scaled_pixmap)

    def toggle_play(self):
        """
        切换播放/暂停状态
        """
        if not self.cap:
            QMessageBox.warning(self, '警告', '请先上传视频')
            return

        if self.timer.isActive():
            # 如果正在播放，则停止
            self.timer.stop()
            self.btn_play_toggle.setText('▶ 播放')
            self.status_label.setText('已暂停')
        else:
            # 如果暂停，则开始
            # 根据 FPS 计算每帧间隔毫秒数
            self.timer.start(int(1000/self.fps) if self.fps > 0 else 33)
            self.btn_play_toggle.setText('⏸ 暂停')
            self.status_label.setText('播放中...')

    def update_frame(self):
        """
        定时器回调：读取下一帧并显示
        """
        if self.cap and self.cap.isOpened():
            ret, frame = self.cap.read()
            if ret:
                # 帧数 +1
                self.current_frame += 1
                # 更新进度条
                self.slider.setValue(self.current_frame)
                # 颜色转换并显示
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                self.show_frame(frame_rgb)

                # 计算并显示时间
                time_sec = self.current_frame / self.fps if self.fps > 0 else 0
                time_str = self.format_time(time_sec)
                self.time_label.setText(time_str)
            else:
                # 播放结束，重置
                self.timer.stop()
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                self.current_frame = 0
                # 注意：原代码此处变量名写错了，应该是 self.btn_play_toggle
                self.btn_play_toggle.setText('▶ 播放')

    def set_position(self, position):
        """
        拖动进度条跳转帧
        """
        if self.cap:
            # 设置 OpenCV 读取位置
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, position)
            self.current_frame = position
            # 读取该帧
            ret, frame = self.cap.read()
            if ret:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                self.show_frame(frame_rgb)
                # 更新时间显示
                time_sec = position / self.fps if self.fps > 0 else 0
                time_str = self.format_time(time_sec)
                self.time_label.setText(time_str)

    def mark_time(self):
        """
        标记当前时间点
        """
        if not self.cap:
            QMessageBox.warning(self, '警告', '请先上传视频')
            return

        # 计算当前时间（秒）
        time_sec = self.current_frame / self.fps if self.fps > 0 else 0
        time_str = self.format_time(time_sec)
        # 存入列表：(时间秒，帧索引)
        self.time_points.append((time_sec, self.current_frame))
        # 刷新显示
        self.refresh_time_points_display()
        self.status_label.setText(f'已标记 {len(self.time_points)} 个时间点')

    def delete_last_mark(self):
        """
        删除最后一个标记
        """
        if not self.time_points:
            self.status_label.setText('没有可删除的标记')
            return
        
        # 弹出列表最后一个元素
        self.time_points.pop()
        self.refresh_time_points_display()
        self.status_label.setText(f'已删除最后一个标记，剩余 {len(self.time_points)} 个时间点')

    def refresh_time_points_display(self):
        """
        刷新时间点文本框显示
        """
        self.time_points_display.clear()
        # 遍历列表，格式化输出
        for idx, (time_sec, frame_num) in enumerate(self.time_points, 1):
            time_str = self.format_time(time_sec)
            self.time_points_display.append(f"{idx}. {time_str} (帧：{frame_num})")

    def apply_time_points_edit(self):
        """
        应用用户在文本框中手动编辑的时间点
        支持解析特定格式的文本并替换内存中的时间点列表
        """
        text = self.time_points_display.toPlainText().strip()
        if not text:
            self.time_points.clear()
            self.status_label.setText('时间点已清空')
            return
        
        new_time_points = []
        errors = []
        
        lines = text.split('\n')
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            if not line:
                continue
            
            # 正则解析格式：序号。HH:MM:SS.mmm (帧：数字)
            # 支持省略序号和毫秒
            pattern = r'(?:\d+\.\s*)?(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?\s*\(帧:\s*(\d+)\)'
            match = re.search(pattern, line)
            
            if match:
                h, m, s, ms, frame = match.groups()
                ms = ms if ms else '000'
                
                # 计算总秒数
                time_sec = int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000.0
                frame_num = int(frame)
                
                # 验证帧数是否合法
                if self.total_frames > 0 and frame_num >= self.total_frames:
                    errors.append(f"第{line_num}行：帧数{frame_num}超出视频范围 (最大{self.total_frames-1})")
                    continue
                
                new_time_points.append((time_sec, frame_num))
            else:
                errors.append(f"第{line_num}行：格式错误 - {line}")
        
        # 如果有错误，弹窗提示
        if errors:
            error_msg = '\n'.join(errors)
            QMessageBox.warning(self, '解析错误', 
                f'以下行解析失败:\n\n{error_msg}\n\n'
                f'正确格式示例:\n'
                f'1. 00:00:05.000 (帧：150)\n'
                f'00:00:10.500 (帧：315)')
            return
        
        if not new_time_points:
            QMessageBox.warning(self, '警告', '没有解析到有效的时间点')
            return
        
        # 应用新的时间点
        self.time_points = new_time_points
        self.refresh_time_points_display()
        self.status_label.setText(f'已应用编辑，共 {len(self.time_points)} 个时间点')
        QMessageBox.information(self, '成功', f'成功解析 {len(new_time_points)} 个时间点')

    def pick_area_from_video(self):
        """
        提示用户如何框选区域
        """
        if not self.video_label.pixmap():
            QMessageBox.warning(self, '警告', '请先上传并预览视频')
            return

        QMessageBox.information(self, '操作提示',
            '请在视频预览区域按住鼠标左键拖拽，框选字幕区域。\n'
            '框选完成后，点击"应用框选"按钮来应用坐标。')

    def use_last_selection(self):
        """
        此方法似乎未被调用，逻辑与 auto_fill_selection 重复
        用于手动应用最后一次框选
        """
        if not self.video_label.selection_rect:
            QMessageBox.warning(self, '警告', '没有可用的框选区域，请先用鼠标框选')
            return

        if not self.cap:
            QMessageBox.warning(self, '警告', '请先上传视频')
            return

        width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        coords = self.video_label.get_video_coordinates(width, height)
        if coords:
            x1, y1, x2, y2 = coords
            if x2 - x1 < 10 or y2 - y1 < 10:
                QMessageBox.warning(self, '警告', '选择区域太小，请重新框选')
                return
                
            self.x1_input.setText(str(x1))
            self.y1_input.setText(str(y1))
            self.x2_input.setText(str(x2))
            self.y2_input.setText(str(y2))
            self.crop_rect = (x1, y1, x2, y2)
            self.status_label.setText(f'已应用框选区域：({x1},{y1})-({x2},{y2})')
            QMessageBox.information(self, '成功', f'字幕区域已设置:\n({x1},{y1})-({x2},{y2})')

    def set_subtitle_area(self):
        """
        手动设置字幕区域坐标
        """
        try:
            # 读取输入框文本并转为整数
            x1 = int(self.x1_input.text())
            y1 = int(self.y1_input.text())
            x2 = int(self.x2_input.text())
            y2 = int(self.y2_input.text())

            # 校验坐标逻辑
            if x1 >= x2 or y1 >= y2:
                QMessageBox.warning(self, '错误', '坐标设置错误:X2 必须大于 X1,Y2 必须大于 Y1')
                return

            if self.cap:
                width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                
                # 校验是否越界
                if x2 > width or y2 > height or x1 < 0 or y1 < 0:
                    QMessageBox.warning(self, '警告', f'坐标超出视频范围\n视频尺寸：{width}x{height}')
                    return

            self.crop_rect = (x1, y1, x2, y2)
            self.status_label.setText(f'字幕区域已设置：({x1},{y1})-({x2},{y2})')
            QMessageBox.information(self, '成功', '字幕区域设置完成')
        except ValueError:
            QMessageBox.warning(self, '错误', '请输入有效的整数坐标')

    def extract_subtitles(self):
        """
        核心功能：提取并拼接字幕区域图像
        包含完整第一帧作为头部，下方拼接提取的字幕片段
        """
        if not self.video_path:
            QMessageBox.warning(self, "警告", "请先选择视频文件！")
            return

        if not self.crop_rect:
            QMessageBox.warning(self, "警告", "请先通过‘鼠标框选’或‘手动设置’来确定字幕区域坐标！")
            return

        try:
            self.status_label.setText('正在处理...')
            QApplication.processEvents()

            # 1. 打开视频并获取第一帧
            cap = cv2.VideoCapture(self.video_path)
            if not cap.isOpened():
                raise ValueError("无法打开视频文件")

            ret, first_frame = cap.read()
            if not ret:
                cap.release()
                raise ValueError("无法读取视频第一帧")

            # 2. 确定时间点（若没标记，则按每秒截取）
            if self.time_points:
                use_points = self.time_points
                mode_info = "手动标记模式"
            else:
                # 自动生成每秒一帧的时间点
                total_seconds = int(self.total_frames / self.fps) if self.fps > 0 else 0
                use_points = []
                for sec in range(total_seconds + 1):
                    frame_idx = int(sec * self.fps)
                    if frame_idx < self.total_frames:
                        use_points.append((sec, frame_idx))
                mode_info = f"自动模式 (每秒截取，共{len(use_points)}帧)"

            # 3. 提取字幕区域
            subtitle_images = []
            x1, y1, x2, y2 = self.crop_rect
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            
            for idx, (time_sec, frame_idx) in enumerate(use_points):
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame = cap.read()
                if ret:
                    # 确保坐标在图像范围内
                    height, width = frame.shape[:2]

                    # 【修复 Bug #1】先确保坐标顺序正确，再剪裁到图像边界内
                    x1_norm, x2_norm = min(x1, x2), max(x1, x2)
                    y1_norm, y2_norm = min(y1, y2), max(y1, y2)
                    
                    # 然后剪裁到图像实际范围
                    rx1, rx2 = max(0, x1_norm), min(x2_norm, width)
                    ry1, ry2 = max(0, y1_norm), min(y2_norm, height)

                    # 现在可以安全地使用数组切片
                    if rx2 > rx1 and ry2 > ry1:
                        # 裁剪字幕区域
                        subtitle_img = frame[int(ry1):int(ry2), int(rx1):int(rx2)]
                        subtitle_images.append(subtitle_img)
                
                # 更新状态栏
                self.status_label.setText(f'正在提取... ({idx+1}/{len(use_points)})')
                QApplication.processEvents()

            cap.release()

            if not subtitle_images:
                QMessageBox.warning(self, '错误', '未能提取到有效的字幕图像，请检查坐标设置')
                return

            # 4. 调用拼接方法
            self.status_label.setText('正在拼接图像...')
            QApplication.processEvents()
            # 注意：这里调用的是类下方定义的那个同名方法（覆盖版）
            combined = self.concatenate_images_with_first_frame(first_frame, subtitle_images)

            # 5. 保存结果
            default_name = f"subtitle_{os.path.splitext(os.path.basename(self.video_path))[0]}.png"
            save_path, _ = QFileDialog.getSaveFileName(self, '保存字幕拼接图', default_name,
                                                    'PNG 图像 (*.png);;JPG 图像 (*.jpg)')
            if save_path:
                # 获取选择的图片质量
                quality = self.quality_combo.currentData()
                
                # 根据文件格式和质量设置保存
                if save_path.lower().endswith('.jpg') or save_path.lower().endswith('.jpeg'):
                    # JPG 格式使用质量参数
                    cv2.imwrite(save_path, combined, [cv2.IMWRITE_JPEG_QUALITY, quality])
                else:
                    # PNG 格式使用压缩级别 (0-9，9最高压缩)
                    # 将质量值 (60-100) 转换为压缩级别 (9-0)
                    if quality >= 100:
                        compress_level = 0  # 最低压缩（不压缩）
                    elif quality >= 80:
                        compress_level = 3
                    else:
                        compress_level = 9  # 最高压缩
                    cv2.imwrite(save_path, combined, [cv2.IMWRITE_PNG_COMPRESSION, compress_level])
                
                self.status_label.setText('✅ 处理完成!')
                QMessageBox.information(self, '成功',
                    f'字幕拼接图已保存到:\n{save_path}\n\n'
                    f'模式：{mode_info}\n'
                    f'共提取 {len(subtitle_images)} 个字幕片段\n'
                    f'图像尺寸：{combined.shape[1]}x{combined.shape[0]} 像素')
            else:
                self.status_label.setText('已取消保存')

        except Exception as e:
            self.status_label.setText('❌ 处理失败')
            QMessageBox.critical(self, '错误', f'处理过程中发生错误:\n{str(e)}')

    def concatenate_images_with_first_frame(self, first_frame, subtitle_images):
        """
        拼接图像：第一帧完整图像在顶部，其他字幕片段在下方
        这是实际被调用的版本（覆盖了上面的同名方法）
        """
        if first_frame is None:
            return None
        
        if self.crop_rect:
            _, _, _, y2 = self.crop_rect
            # 确保 y2 不超过视频实际高度
            y2 = min(y2, first_frame.shape[0])
            # 裁剪第一帧：从顶部到字幕区域底部
            first_frame_cropped = first_frame[0:y2, :]
        else:
            # 如果没有设置区域，则回退到使用完整第一帧
            first_frame_cropped = first_frame
            
        # 计算参数
        all_widths = [first_frame_cropped.shape[1]]
        if subtitle_images:
            all_widths.extend([img.shape[1] for img in subtitle_images])
        max_width = max(all_widths)
        spacing = self.spacing_input.value()
        
        # 计算总高度
        total_height = first_frame_cropped.shape[0]  # 第一帧高度
        if subtitle_images:
            total_height += spacing  # 第一帧和后续字幕之间的间距
            total_height += sum(img.shape[0] for img in subtitle_images)  # 其他字幕高度
            total_height += spacing * (len(subtitle_images) - 1)  # 字幕之间的间距

        # 背景颜色解析
        bg_color = self.fill_color.text().strip().lower()
        if bg_color == 'white':
            bg = (255, 255, 255)
        elif bg_color == 'black':
            bg = (0, 0, 0)
        elif bg_color.startswith('#') and len(bg_color) == 7:
            try:
                # 解析十六进制颜色 #RRGGBB -> (B, G, R) OpenCV 格式
                r = int(bg_color[1:3], 16)
                g = int(bg_color[3:5], 16)
                b = int(bg_color[5:7], 16)
                bg = (b, g, r)
            except:
                bg = (255, 255, 255)
        else:
            bg = (255, 255, 255)

        # 创建画布 (NumPy 数组)
        result = np.full((total_height, max_width, 3), bg, dtype=np.uint8)

        # 放置第一帧 (居中)
        y_offset = 0
        h, w = first_frame_cropped.shape[:2]
        x_offset = (max_width - w) // 2
        result[y_offset:y_offset+h, x_offset:x_offset+w] = first_frame_cropped
        y_offset += h
        
        # 如果有其他字幕图像，添加间距后继续拼接
        if subtitle_images:
            y_offset += spacing

            # 垂直拼接其他字幕片段
            for img in subtitle_images:
                h, w = img.shape[:2]
                # 居中放置
                x_offset = (max_width - w) // 2
                result[y_offset:y_offset+h, x_offset:x_offset+w] = img
                y_offset += h + spacing

        return result

    def clear_marks(self):
        """
        清空所有时间标记
        """
        if not self.time_points:
            self.status_label.setText('没有需要清空的标记')
            return
            
        # 二次确认
        reply = QMessageBox.question(self, '确认', 
                                     f'确定要清空所有 {len(self.time_points)} 个标记吗？',
                                     QMessageBox.Yes | QMessageBox.No)
        if reply == QMessageBox.Yes:
            self.time_points.clear()
            self.time_points_display.clear()
            self.status_label.setText('已清空所有标记')

    def format_time(self, seconds):
        """
        将秒数格式化为 HH:MM:SS.mmm 字符串
        """
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        ms = int((seconds % 1) * 1000)
        return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"

    def eventFilter(self, obj, event):
        """
        事件过滤器 - 处理全局键盘快捷键
        拦截空格、回车、删除键
        """
        if event.type() == QEvent.KeyPress:
            if event.key() == Qt.Key_Space:
                # 空格键控制播放/暂停
                self.toggle_play()
                return True
            elif event.key() == Qt.Key_Return or event.key() == Qt.Key_Enter:
                # Enter 键标记时间
                self.mark_time()
                return True
            elif event.key() == Qt.Key_Delete or event.key() == Qt.Key_Backspace:
                # Delete 或 Backspace 键删除最后一个标记
                self.delete_last_mark()
                return True
        # 其他事件交给父类处理
        return super().eventFilter(obj, event)


# ==========================================
# 图片拼接组件 (新增功能)
# ==========================================
class DraggableLineImage(QLabel):
    """
    支持同步拖动两条参考线的图片控件
    用于在图片上可视化地选择字幕裁剪区域
    """
    # 定义一个自定义信号，当线条位置改变时发出，携带两条线的相对位置比例 (0.0-1.0)
    lines_changed = pyqtSignal(float, float)

    def __init__(self, img_path):
        # 调用父类构造函数
        super().__init__()
        # 保存图片路径
        self.img_path = img_path
        # 【新增】存储文件路径，用于获取元数据
        self.image_path = img_path
        # 使用 OpenCV 读取图片
        # np.fromfile: 将文件读入 numpy 数组
        # cv2.imdecode: 解码数组为图像
        # cv2.IMREAD_COLOR: 以彩色模式读取
        self.cv_img = cv2.imdecode(np.fromfile(img_path, dtype=np.uint8), cv2.IMREAD_COLOR)
        # 将颜色空间从 BGR (OpenCV 默认) 转换为 RGB (Qt 需要)
        self.cv_img = cv2.cvtColor(self.cv_img, cv2.COLOR_BGR2RGB)
        
        # 初始线位置比例：y1_ratio=0.8 (底部 20% 处), y2_ratio=0.95 (底部 5% 处)
        # 这里假设字幕通常在底部
        self.y1_ratio = 0.8 
        self.y2_ratio = 0.95
        
        # 记录当前正在被拖动的线条编号 (1 或 2)，None 表示未拖动
        self.active_line = None
        # 设置最小宽度
        self.setMinimumWidth(600)
        
        # 【新增】获取文件信息
        self._update_file_info()
        
        # 更新界面显示
        self.update_display()

    def update_display(self):
        """
        更新控件显示的图像
        将 OpenCV 图像转换为 Qt 的 QPixmap 并显示，确保图片完整显示（contain模式）
        """
        # 获取图像的高度和宽度
        h, w = self.cv_img.shape[:2]
        # 从 numpy 数据创建 QImage 对象
        pixmap = QPixmap.fromImage(QImage(self.cv_img.data, w, h, w*3, QImage.Format_RGB888))
        
        # 【优化】使用 contain 方式缩放图片
        # 在保持纵横比的前提下，让图片完整显示在容器内
        # 容器大小：700 x 400
        max_width = 700
        max_height = 400
        
        # 计算缩放比例，确保图片在两个方向都不超出容器
        scale = max(max_width / w, max_height / h)
        
        # 计算缩放后的尺寸
        scaled_width = int(w * scale)
        scaled_height = int(h * scale)
        
        # 执行缩放
        scaled_pixmap = pixmap.scaledToWidth(scaled_width, Qt.SmoothTransformation)
        
        # 设置图片并居中显示
        self.setPixmap(scaled_pixmap)
        self.setAlignment(Qt.AlignCenter)  # 【新增】图片在容器中居中

    def _update_file_info(self):
        """
        【新增】获取文件的元数据
        """
        try:
            import os
            from datetime import datetime
            
            # 获取文件大小（字节）
            self.file_size = os.path.getsize(self.image_path)
            
            # 获取创建时间（或修改时间）
            timestamp = os.path.getmtime(self.image_path)
            self.create_time = datetime.fromtimestamp(timestamp)
            
            # 获取图片尺寸
            h, w = self.cv_img.shape[:2]
            self.image_width = w
            self.image_height = h
        except Exception as e:
            print(f"Error getting file info: {e}")
            self.file_size = 0
            self.create_time = None
            self.image_width = 0
            self.image_height = 0

    def set_line_ratios(self, y1, y2):
        """
        外部调用此方法来同步设置线条位置
        """
        self.y1_ratio = y1
        self.y2_ratio = y2
        # 触发重绘
        self.update()

    def paintEvent(self, event):
        """
        绘制事件：在图片上绘制两条虚线
        """
        # 调用父类绘制（显示背景图片）
        super().paintEvent(event)
        # 如果没有图片，直接返回
        if not self.pixmap(): return
        # 创建绘图工具
        painter = QPainter(self)
        # 获取当前控件的宽高
        w, h = self.width(), self.height()
        
        # --- 绘制第一条线 (红色) ---
        # 设置画笔：红色，宽度 2，虚线样式
        painter.setPen(QPen(QColor(255, 0, 0), 2, Qt.DashLine))
        # 根据比例计算实际的 Y 坐标
        y1 = int(h * self.y1_ratio)
        # 画横线：从 (0, y1) 到 (w, y1)
        painter.drawLine(0, y1, w, y1)
        
        # --- 绘制第二条线 (蓝色) ---
        # 设置画笔：蓝色，宽度 2，虚线样式
        painter.setPen(QPen(QColor(0, 0, 255), 2, Qt.DashLine))
        # 根据比例计算实际的 Y 坐标
        y2 = int(h * self.y2_ratio)
        # 画横线
        painter.drawLine(0, y2, w, y2)

    def mousePressEvent(self, event):
        """
        鼠标按下：检测是否点击在某条线上
        """
        # 获取鼠标点击的 Y 坐标
        y = event.pos().y()
        # 获取控件高度
        h = self.height()
        # 检测点击位置是否在线 1 附近 (10 像素容差)
        if abs(y - h * self.y1_ratio) < 15:
            # 标记正在拖动线 1
            self.active_line = 1
        # 检测点击位置是否在线 2 附近
        elif abs(y - h * self.y2_ratio) < 15:
            # 标记正在拖动线 2
            self.active_line = 2

    def mouseMoveEvent(self, event):
        """
        鼠标移动：如果在拖动线条，更新线条位置
        """
        # 如果有正在拖动的线条
        if self.active_line:
            # 计算新的相对位置比例 (0.0 到 1.0)
            new_ratio = max(0.0, min(1.0, event.pos().y() / self.height()))
            # 根据拖动的线条编号更新对应的比例
            if self.active_line == 1:
                self.y1_ratio = new_ratio
            else:
                self.y2_ratio = new_ratio
            # 发出信号，通知其他控件同步更新
            self.lines_changed.emit(self.y1_ratio, self.y2_ratio)

    def mouseReleaseEvent(self, event):
        """
        鼠标释放：结束拖动状态
        """
        self.active_line = None

class ImageStatusBar(QWidget):
    """
    图片状态栏
    显示图片数量、总内存大小、创建时间等信息
    """
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setStyleSheet("background: #f9f9f9; border-top: 1px solid #ddd;")
        self.setMaximumHeight(50)
        self.setMinimumHeight(50)
        
        layout = QHBoxLayout(self)
        layout.setContentsMargins(15, 5, 15, 5)
        layout.setSpacing(30)
        
        # 图片数量
        self.count_label = QLabel("📊 图片数量: 0")
        self.count_label.setStyleSheet("font-size: 12px; color: #333;")
        layout.addWidget(self.count_label)
        
        # 内存大小
        self.memory_label = QLabel("💾 总内存: 0 B")
        self.memory_label.setStyleSheet("font-size: 12px; color: #333;")
        layout.addWidget(self.memory_label)
        
        # 创建时间
        self.time_label = QLabel("⏰ 首张时间: -")
        self.time_label.setStyleSheet("font-size: 12px; color: #333;")
        layout.addWidget(self.time_label)
        
        # 弹性空间
        layout.addStretch()
        
        # 图片尺寸信息
        self.size_label = QLabel("📐 尺寸: -")
        self.size_label.setStyleSheet("font-size: 12px; color: #333;")
        layout.addWidget(self.size_label)
    
    def update_info(self, image_widgets):
        """
        更新状态栏信息
        """
        if not image_widgets:
            self.count_label.setText("📊 图片数量: 0")
            self.memory_label.setText("💾 总内存: 0 B")
            self.time_label.setText("⏰ 首张时间: -")
            self.size_label.setText("📐 尺寸: -")
            return
        
        # 计算统计信息
        count = len(image_widgets)
        total_size = sum(w.file_size for w in image_widgets if hasattr(w, 'file_size'))
        
        # 格式化内存大小
        if total_size < 1024:
            size_str = f"{total_size} B"
        elif total_size < 1024 * 1024:
            size_str = f"{total_size / 1024:.2f} KB"
        else:
            size_str = f"{total_size / (1024 * 1024):.2f} MB"
        
        # 获取第一张图的创建时间
        time_str = "-"
        if hasattr(image_widgets[0], 'create_time') and image_widgets[0].create_time:
            time_str = image_widgets[0].create_time.strftime("%Y-%m-%d %H:%M:%S")
        
        # 获取图片尺寸
        first_widget = image_widgets[0]
        if hasattr(first_widget, 'image_width') and hasattr(first_widget, 'image_height'):
            size_str_img = f"{first_widget.image_width}×{first_widget.image_height}"
        else:
            size_str_img = "-"
        
        # 更新标签
        self.count_label.setText(f"📊 图片数量: {count}")
        self.memory_label.setText(f"💾 总内存: {size_str}")
        self.time_label.setText(f"⏰ 首张时间: {time_str}")
        self.size_label.setText(f"📐 尺寸: {size_str_img}")

class ImageCarouselViewer(QWidget):
    """
    图片轮播查看器 - 改进版
    使用 QStackedWidget 实现单张图片显示和切换
    """
    def __init__(self, parent=None):
        super().__init__(parent)
        self.current_index = 0
        self.image_widgets = []
        
        # 创建主布局
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(5)
        
        # 【改进】使用 QStackedWidget 实现单张显示
        # QStackedWidget 比 QScrollArea 更简单可靠
        
        self.stacked_widget = QStackedWidget()
        self.stacked_widget.setStyleSheet("background: #f0f0f0; border: 2px solid #ccc;")
        # 【优化】设置明确的最小高度，确保图片容器有足够空间
        self.stacked_widget.setMinimumHeight(700)
        self.stacked_widget.setMaximumHeight(700)
        layout.addWidget(self.stacked_widget)
        
        # 底部导航按钮和页码
        nav_layout = QHBoxLayout()
        
        self.btn_prev = QPushButton("◀ 上一张")
        self.btn_prev.clicked.connect(self.show_previous)
        self.btn_prev.setMinimumHeight(35)
        
        self.btn_next = QPushButton("下一张 ▶")
        self.btn_next.clicked.connect(self.show_next)
        self.btn_next.setMinimumHeight(35)
        
        self.index_label = QLabel("0/0")
        self.index_label.setAlignment(Qt.AlignCenter)
        self.index_label.setStyleSheet("font-weight: bold; color: #007ACC; font-size: 14px;")
        self.index_label.setMinimumWidth(80)
        
        nav_layout.addWidget(self.btn_prev, 1)
        nav_layout.addStretch()
        nav_layout.addWidget(self.index_label)
        nav_layout.addStretch()
        nav_layout.addWidget(self.btn_next, 1)
        
        layout.addLayout(nav_layout)
    
    def set_images(self, image_widgets):
        """
        设置要显示的图片列表
        """
        self.image_widgets = image_widgets
        self.current_index = 0
        
        # 【改进】清空 QStackedWidget 中的所有widget
        while self.stacked_widget.count() > 0:
            widget = self.stacked_widget.widget(0)
            self.stacked_widget.removeWidget(widget)
        
        # 【改进】直接添加图片widget到 QStackedWidget
        # QStackedWidget 会自动处理大小和显示
        for widget in image_widgets:
            # 【优化】设置与容器相匹配的大小
            # 容器高度 450-500，保留空间给导航按钮
            widget.setMinimumSize(500, 500)
            widget.setMaximumSize(700, 700)
            self.stacked_widget.addWidget(widget)
        
        # 显示第一张图片
        if len(image_widgets) > 0:
            self.stacked_widget.setCurrentIndex(0)
        
        self.update_display()
    
    def show_next(self):
        """显示下一张"""
        if not self.image_widgets:
            return
        self.current_index = (self.current_index + 1) % len(self.image_widgets)
        self.stacked_widget.setCurrentIndex(self.current_index)
        self.update_display()
    
    def show_previous(self):
        """显示上一张"""
        if not self.image_widgets:
            return
        self.current_index = (self.current_index - 1) % len(self.image_widgets)
        self.stacked_widget.setCurrentIndex(self.current_index)
        self.update_display()
    
    def update_display(self):
        """更新显示信息"""
        if self.image_widgets:
            self.index_label.setText(f"{self.current_index + 1}/{len(self.image_widgets)}")
        else:
            self.index_label.setText("0/0")
    
    def get_current_image_widget(self):
        """获取当前显示的图片 widget"""
        if 0 <= self.current_index < len(self.image_widgets):
            return self.image_widgets[self.current_index]
        return None
    
    def wheelEvent(self, event):
        """支持鼠标滚轮切换图片"""
        if event.angleDelta().y() > 0:
            self.show_previous()
        else:
            self.show_next()

class ImageJoinerWidget(QWidget):
    """
    图片拼接功能的主容器控件
    包含：
    - 上方：添加/清空按钮和设置面板
    - 中央：轮播图预览器（一次显示一张）
    - 下方：状态栏（显示元数据）
    """
    def __init__(self):
        super().__init__()
        # 存储所有 DraggableLineImage 控件的列表
        self.image_widgets = []
        # 初始化界面
        self.init_ui()

    def init_ui(self):
        """
        构建界面布局
        """
        # 创建主垂直布局
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(10, 10, 10, 10)
        main_layout.setSpacing(10)
        
        # ========== 顶部：控制栏 ==========
        top_bar = QWidget()
        top_bar.setStyleSheet("background: #f5f5f5; border-radius: 5px; padding: 10px;")
        top_layout = QHBoxLayout(top_bar)
        top_layout.setContentsMargins(10, 5, 10, 5)
        top_layout.setSpacing(10)
        
        # 添加图片按钮
        self.btn_add = QPushButton("➕ 添加字幕图片 (可多选)")
        self.btn_add.setMinimumHeight(35)
        self.btn_add.clicked.connect(self.add_images)
        
        # 清空列表按钮
        self.btn_clear = QPushButton("🗑️ 清空列表")
        self.btn_clear.setMinimumHeight(35)
        self.btn_clear.clicked.connect(self.clear_list)
        
        top_layout.addWidget(self.btn_add, 2)
        top_layout.addWidget(self.btn_clear, 1)
        main_layout.addWidget(top_bar)
        
        # ========== 中间：水平布局（左侧轮播图 + 右侧设置）==========
        center_layout = QHBoxLayout()
        center_layout.setSpacing(15)
        
        # --- 左侧：轮播图预览器 ---
        left_widget = QWidget()
        left_layout = QVBoxLayout(left_widget)
        left_layout.setContentsMargins(0, 0, 0, 0)
        
        # 轮播图组件
        self.carousel = ImageCarouselViewer()
        self.carousel.setMinimumHeight(400)
        left_layout.addWidget(self.carousel)
        
        center_layout.addWidget(left_widget, 3)
        
        # --- 右侧：操作与设置 ---
        right_part = QGroupBox("操作与设置")
        right_part.setFixedWidth(250)
        right_layout = QVBoxLayout(right_part)
        
        # 提示标签
        tip_label = QLabel("提示：\n拖动图片上的虚线\n调整字幕裁剪区域，\n所有图片将自动同步。")
        tip_label.setStyleSheet("color: #666; font-size: 11px;")
        right_layout.addWidget(tip_label)
        
        # 间距设置
        right_layout.addWidget(QLabel("图片间距 (px):"))
        self.spacing_spin = QSpinBox()
        self.spacing_spin.setRange(0, 50)
        self.spacing_spin.setValue(2)
        right_layout.addWidget(self.spacing_spin)
        
        # 图片质量设置
        right_layout.addWidget(QLabel("图片质量:"))
        self.quality_combo = QComboBox()
        self.quality_combo.addItem('高（不压缩）', 100)
        self.quality_combo.addItem('中（压缩）', 80)
        self.quality_combo.addItem('低（高压缩）', 60)
        self.quality_combo.setCurrentIndex(0)  # 默认选择高
        right_layout.addWidget(self.quality_combo)
        
        # 生成按钮
        self.btn_generate = QPushButton("🎯 生成拼接图")
        self.btn_generate.setFixedHeight(50)
        self.btn_generate.setStyleSheet(
            "background: #28a745; color: white; font-weight: bold; "
            "border-radius: 5px; font-size: 13px;"
        )
        self.btn_generate.clicked.connect(self.generate_result)
        
        right_layout.addStretch()
        right_layout.addWidget(self.btn_generate)
        
        center_layout.addWidget(right_part)
        main_layout.addLayout(center_layout, 1)
        
        # ========== 底部：状态栏 ==========
        self.status_bar = ImageStatusBar()
        main_layout.addWidget(self.status_bar)

    def add_images(self):
        """
        打开文件对话框选择多张图片并添加到列表
        """
        # 打开文件选择对话框，支持多选
        files, _ = QFileDialog.getOpenFileNames(
            self, "选择图片", "", "Images (*.png *.jpg *.jpeg *.bmp)"
        )
        if files:
            for f in files:
                # 为每个图片创建 DraggableLineImage 控件
                widget = DraggableLineImage(f)
                # 连接信号：当某张图的线被拖动时，调用 sync_lines 同步所有图
                widget.lines_changed.connect(self.sync_lines)
                # 如果列表中已有图片，新加入的图片立即同步当前的线位置
                if self.image_widgets:
                    widget.set_line_ratios(
                        self.image_widgets[0].y1_ratio, 
                        self.image_widgets[0].y2_ratio
                    )
                
                # 加入内部列表管理
                self.image_widgets.append(widget)
            
            # 【新增】更新轮播图
            self.carousel.set_images(self.image_widgets)
            # 【新增】更新状态栏
            self.status_bar.update_info(self.image_widgets)

    def clear_list(self):
        """
        清空所有图片
        """
        # 清空轮播图
        self.carousel.set_images([])
        # 清空内部列表
        self.image_widgets.clear()
        # 【新增】更新状态栏
        self.status_bar.update_info([])

    def sync_lines(self, y1, y2):
        """
        同步所有图片的线条位置
        当任意一张图的线被拖动时，调用此方法更新其他所有图
        """
        for w in self.image_widgets:
            w.set_line_ratios(y1, y2)

    def generate_result(self):
        """
        执行图片裁剪和拼接逻辑
        """
        # 检查是否有图片
        if not self.image_widgets:
            return QMessageBox.warning(self, "错误", "请先添加图片")
        
        try:
            # 获取用户设置的间距
            spacing = self.spacing_spin.value()
            # 获取第一张图的线条比例（所有图已同步，所以取哪张都一样）
            y1_ratio = self.image_widgets[0].y1_ratio
            y2_ratio = self.image_widgets[0].y2_ratio
            
            # 确保 y1 < y2，防止用户拖反了
            ry1, ry2 = min(y1_ratio, y2_ratio), max(y1_ratio, y2_ratio)
            
            parts = []  # 存储裁剪后的图片片段
            max_w = 0   # 记录最大宽度，用于后续居中对齐
            
            for i, w in enumerate(self.image_widgets):
                # 将 RGB 转回 BGR (OpenCV 保存需要)
                img = cv2.cvtColor(w.cv_img, cv2.COLOR_RGB2BGR)
                h, width = img.shape[:2]
                max_w = max(max_w, width)
                
                if i == 0:
                    # 第一张图特殊处理：保留从顶部 (0) 到 下方线 (y2) 的部分
                    parts.append(img[0:int(h*ry2), :])
                else:
                    # 后续图片：只保留两条线之间的部分 (y1 到 y2)
                    parts.append(img[int(h*ry1):int(h*ry2), :])
            
            # 计算总高度：所有片段高度之和 + 间距
            total_h = sum(p.shape[0] for p in parts) + spacing * (len(parts) - 1)
            # 创建白色背景的大画布
            result = np.full((total_h, max_w, 3), 255, dtype=np.uint8)
            
            curr_y = 0  # 当前写入位置的 Y 坐标
            for p in parts:
                ph, pw = p.shape[:2]
                # 计算水平居中偏移量
                offset_x = (max_w - pw) // 2
                # 将片段复制到结果图的对应位置
                result[curr_y:curr_y+ph, offset_x:offset_x+pw] = p
                # 更新 Y 坐标：当前高度 + 间距
                curr_y += ph + spacing
                
            # 弹出保存对话框
            save_path, _ = QFileDialog.getSaveFileName(
                self, "保存结果", "joined_subtitle.png", "PNG (*.png);;JPG 图像 (*.jpg)"
            )
            if save_path:
                # 获取选择的图片质量
                quality = self.quality_combo.currentData()
                
                # 根据文件格式和质量设置保存
                if save_path.lower().endswith('.jpg') or save_path.lower().endswith('.jpeg'):
                    # JPG 格式使用质量参数
                    cv2.imwrite(save_path, result, [cv2.IMWRITE_JPEG_QUALITY, quality])
                else:
                    # PNG 格式使用压缩级别 (0-9，9最高压缩)
                    # 将质量值 (60-100) 转换为压缩级别 (9-0)
                    if quality >= 100:
                        compress_level = 0  # 最低压缩（不压缩）
                    elif quality >= 80:
                        compress_level = 3
                    else:
                        compress_level = 9  # 最高压缩
                    cv2.imwrite(save_path, result, [cv2.IMWRITE_PNG_COMPRESSION, compress_level])
                
                QMessageBox.information(self, "成功", "图片拼接已完成！")
        except Exception as e:
            # 异常处理
            QMessageBox.critical(self, "错误", f"拼接失败：{str(e)}")


# ==========================================
# 主窗口 (结构重构)
# ==========================================
class SubtitleExtractor(QMainWindow):
    """
    主窗口类
    整合了视频提取和图片拼接两个功能模块，通过 Tab 切换
    """
    def __init__(self):
        super().__init__()
        # 设置窗口标题
        self.setWindowTitle('视频/图片字幕提取拼接器 - 小米 MiMo 助手开发')
        # 设置窗口初始位置和大小 (x, y, width, height)
        self.setGeometry(100, 100, 1300, 850)
        
        # 核心：使用 QTabWidget 实现功能分页
        self.tabs = QTabWidget()
        # 将 Tab 组件设为中心部件
        self.setCentralWidget(self.tabs)
        
        # 初始化视频功能页
        self.video_widget = VideoPreviewWidget()
        # 初始化图片拼接功能页
        self.image_tab = ImageJoinerWidget()
        
        # 添加两个标签页
        self.tabs.addTab(self.video_widget, "🎞️ 拼接视频字幕")
        self.tabs.addTab(self.image_tab, "🖼️ 拼接图片字幕")

    def closeEvent(self, event):
        # 调用子组件的清理逻辑（如果有的话，或者在这里直接访问子组件的资源）
        if hasattr(self.video_widget, 'cap') and self.video_widget.cap:
            self.video_widget.cap.release()
        if hasattr(self.video_widget, 'timer') and self.video_widget.timer:
            self.video_widget.timer.stop()
        event.accept()
   

if __name__ == '__main__':
    # 创建 QApplication 实例，传入命令行参数
    app = QApplication(sys.argv)
    # 创建主窗口实例
    window = SubtitleExtractor()
    # 显示窗口
    window.show()
    # 进入应用程序主循环，直到退出
    sys.exit(app.exec_())