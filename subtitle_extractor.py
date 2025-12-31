import sys
import os
from PyQt5.QtWidgets import (QApplication, QMainWindow, QVBoxLayout, QHBoxLayout,
                             QPushButton, QLabel, QFileDialog, QLineEdit,
                             QWidget, QSlider, QTextEdit, QMessageBox, QGroupBox,
                             QSpinBox, QSplitter, QSizePolicy,QTabWidget, QScrollArea)
from PyQt5.QtCore import Qt, QTimer, QEvent,pyqtSignal
from PyQt5.QtGui import QImage, QPixmap, QPainter, QPen, QColor

import cv2
import numpy as np
import re

class VideoPreviewLabel(QLabel):
    """支持鼠标框选的视频预览控件"""
    def __init__(self):
        super().__init__()
        self.setAlignment(Qt.AlignCenter)
        self.setMinimumSize(640, 360)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)  # 设置尺寸策略
        self.setStyleSheet("border: 2px solid #ccc; background: #000; color: #fff;")
        self.setText('请上传视频')
        self.selecting = False
        self.start_point = None
        self.end_point = None
        self.selection_rect = None  # 改名避免与QLabel.rect()冲突
        self.show_selection_box = True  # 控制是否显示选择框
        self.original_pixmap = None  # 保存原始pixmap(不带框)

    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton and self.pixmap():
            self.selecting = True
            self.start_point = event.pos()
            self.end_point = event.pos()
            self.selection_rect = None
            self.update()

    def mouseMoveEvent(self, event):
        if self.selecting and self.start_point:
            self.end_point = event.pos()
            self.update()

    def mouseReleaseEvent(self, event):
        if event.button() == Qt.LeftButton and self.selecting:
            self.selecting = False
            if self.start_point and self.end_point:
                # 确保坐标正确(左上到右下)
                x1 = min(self.start_point.x(), self.end_point.x())
                y1 = min(self.start_point.y(), self.end_point.y())
                x2 = max(self.start_point.x(), self.end_point.x())
                y2 = max(self.start_point.y(), self.end_point.y())
                
                # 限制在widget范围内
                widget_rect = self.rect()
                x1 = max(0, min(x1, widget_rect.width()))
                y1 = max(0, min(y1, widget_rect.height()))
                x2 = max(0, min(x2, widget_rect.width()))
                y2 = max(0, min(y2, widget_rect.height()))
                
                if x2 - x1 > 5 and y2 - y1 > 5:  # 最小选择区域
                    self.selection_rect = (x1, y1, x2, y2)
                    self.update()
                    # 新增：框选完成后自动调用主窗口的更新函数
                    if hasattr(self, 'callback_on_selection'):
                        self.callback_on_selection()

    def paintEvent(self, event):
        super().paintEvent(event)
        
        if not self.pixmap() or not self.show_selection_box:
            return
            
        painter = QPainter(self)
        pen = QPen(QColor(0, 255, 0))
        pen.setWidth(1)  # 边框变细
        painter.setPen(pen)
        
        # 绘制当前选择框
        if self.selecting and self.start_point and self.end_point:
            x1 = min(self.start_point.x(), self.end_point.x())
            y1 = min(self.start_point.y(), self.end_point.y())
            x2 = max(self.start_point.x(), self.end_point.x())
            y2 = max(self.start_point.y(), self.end_point.y())
            painter.drawRect(x1, y1, x2 - x1, y2 - y1)
        
        # 绘制已确认的选择框
        elif self.selection_rect:
            x1, y1, x2, y2 = self.selection_rect
            painter.drawRect(x1, y1, x2 - x1, y2 - y1)

    def get_video_coordinates(self, video_width, video_height):
        """将鼠标选择的坐标转换为视频实际坐标"""
        if not self.selection_rect or not self.pixmap():
            return None

        # 获取显示区域尺寸
        widget_rect = self.rect()
        pixmap_rect = self.pixmap().rect()
        
        # 计算pixmap在widget中的实际显示位置和大小(考虑KeepAspectRatio)
        scale = min(widget_rect.width() / pixmap_rect.width(), 
                   widget_rect.height() / pixmap_rect.height())
        
        display_width = pixmap_rect.width() * scale
        display_height = pixmap_rect.height() * scale
        
        # pixmap在widget中的偏移(居中显示)
        offset_x = (widget_rect.width() - display_width) / 2
        offset_y = (widget_rect.height() - display_height) / 2
        
        # 转换选择框坐标到pixmap坐标系
        x1, y1, x2, y2 = self.selection_rect
        x1 = max(0, (x1 - offset_x) / scale)
        y1 = max(0, (y1 - offset_y) / scale)
        x2 = min(pixmap_rect.width(), (x2 - offset_x) / scale)
        y2 = min(pixmap_rect.height(), (y2 - offset_y) / scale)
        
        # 转换到视频原始分辨率
        scale_x = video_width / pixmap_rect.width()
        scale_y = video_height / pixmap_rect.height()
        
        video_x1 = int(x1 * scale_x)
        video_y1 = int(y1 * scale_y)
        video_x2 = int(x2 * scale_x)
        video_y2 = int(y2 * scale_y)
        
        # 确保坐标在视频范围内
        video_x1 = max(0, min(video_x1, video_width))
        video_y1 = max(0, min(video_y1, video_height))
        video_x2 = max(0, min(video_x2, video_width))
        video_y2 = max(0, min(video_y2, video_height))
        
        return (video_x1, video_y1, video_x2, video_y2)

# ==========================================
# 图片拼接组件 (新增功能)
# ==========================================
class DraggableLineImage(QLabel):
    """支持同步拖动两条参考线的图片控件"""
    lines_changed = pyqtSignal(float, float) # 发送 y1_ratio, y2_ratio

    def __init__(self, img_path):
        super().__init__()
        self.img_path = img_path
        self.cv_img = cv2.imdecode(np.fromfile(img_path, dtype=np.uint8), cv2.IMREAD_COLOR)
        self.cv_img = cv2.cvtColor(self.cv_img, cv2.COLOR_BGR2RGB)
        
        # 初始线位置：底部 20% 和 10%
        self.y1_ratio = 0.8 
        self.y2_ratio = 0.95
        
        self.active_line = None # 1 或 2
        self.setMinimumWidth(600)
        self.update_display()

    def update_display(self):
        h, w = self.cv_img.shape[:2]
        pixmap = QPixmap.fromImage(QImage(self.cv_img.data, w, h, w*3, QImage.Format_RGB888))
        self.setPixmap(pixmap.scaledToWidth(800, Qt.SmoothTransformation))

    def set_line_ratios(self, y1, y2):
        self.y1_ratio = y1
        self.y2_ratio = y2
        self.update()

    def paintEvent(self, event):
        super().paintEvent(event)
        if not self.pixmap(): return
        painter = QPainter(self)
        w, h = self.width(), self.height()
        
        # 绘制线1 (红色)
        painter.setPen(QPen(QColor(255, 0, 0), 2, Qt.DashLine))
        y1 = int(h * self.y1_ratio)
        painter.drawLine(0, y1, w, y1)
        
        # 绘制线2 (蓝色)
        painter.setPen(QPen(QColor(0, 0, 255), 2, Qt.DashLine))
        y2 = int(h * self.y2_ratio)
        painter.drawLine(0, y2, w, y2)

    def mousePressEvent(self, event):
        y = event.pos().y()
        h = self.height()
        # 检测点击在哪条线附近 (10像素容错)
        if abs(y - h * self.y1_ratio) < 15:
            self.active_line = 1
        elif abs(y - h * self.y2_ratio) < 15:
            self.active_line = 2

    def mouseMoveEvent(self, event):
        if self.active_line:
            new_ratio = max(0.0, min(1.0, event.pos().y() / self.height()))
            if self.active_line == 1:
                self.y1_ratio = new_ratio
            else:
                self.y2_ratio = new_ratio
            self.lines_changed.emit(self.y1_ratio, self.y2_ratio)

    def mouseReleaseEvent(self, event):
        self.active_line = None

class ImageJoinerWidget(QWidget):
    def __init__(self):
        super().__init__()
        self.image_widgets = []
        self.init_ui()

    def init_ui(self):
        layout = QHBoxLayout(self)
        
        # 左侧列表
        left_part = QWidget()
        left_layout = QVBoxLayout(left_part)
        
        self.btn_add = QPushButton("➕ 添加字幕图片 (可多选)")
        self.btn_add.clicked.connect(self.add_images)
        self.btn_clear = QPushButton("🗑️ 清空列表")
        self.btn_clear.clicked.connect(self.clear_list)
        
        self.scroll = QScrollArea()
        self.scroll.setWidgetResizable(True)
        self.scroll_content = QWidget()
        self.imgs_vbox = QVBoxLayout(self.scroll_content)
        self.imgs_vbox.setAlignment(Qt.AlignTop)
        self.scroll.setWidget(self.scroll_content)
        
        left_layout.addWidget(self.btn_add)
        left_layout.addWidget(self.btn_clear)
        left_layout.addWidget(self.scroll)
        
        # 右侧控制
        right_part = QGroupBox("操作与设置")
        right_part.setFixedWidth(250)
        right_layout = QVBoxLayout(right_part)
        
        right_layout.addWidget(QLabel("提示：拖动图片上的虚线\n调整字幕裁剪区域，\n所有图片将自动同步。"))
        
        self.spacing_spin = QSpinBox()
        self.spacing_spin.setRange(0, 50)
        self.spacing_spin.setValue(2)
        right_layout.addWidget(QLabel("图片间距 (px):"))
        right_layout.addWidget(self.spacing_spin)
        
        self.btn_generate = QPushButton("🎯 生成拼接图")
        self.btn_generate.setFixedHeight(50)
        self.btn_generate.setStyleSheet("background: #28a745; color: white; font-weight: bold;")
        self.btn_generate.clicked.connect(self.generate_result)
        
        right_layout.addStretch()
        right_layout.addWidget(self.btn_generate)
        
        layout.addWidget(left_part, 1)
        layout.addWidget(right_part)

    def add_images(self):
        files, _ = QFileDialog.getOpenFileNames(self, "选择图片", "", "Images (*.png *.jpg *.jpeg *.bmp)")
        if files:
            for f in files:
                widget = DraggableLineImage(f)
                widget.lines_changed.connect(self.sync_lines)
                # 如果已有图片，同步当前的线位置
                if self.image_widgets:
                    widget.set_line_ratios(self.image_widgets[0].y1_ratio, self.image_widgets[0].y2_ratio)
                
                self.imgs_vbox.addWidget(widget)
                self.image_widgets.append(widget)

    def clear_list(self):
        for i in reversed(range(self.imgs_vbox.count())): 
            self.imgs_vbox.itemAt(i).widget().setParent(None)
        self.image_widgets.clear()

    def sync_lines(self, y1, y2):
        for w in self.image_widgets:
            w.set_line_ratios(y1, y2)

    def generate_result(self):
        if not self.image_widgets:
            return QMessageBox.warning(self, "错误", "请先添加图片")
        
        try:
            spacing = self.spacing_spin.value()
            y1_ratio = self.image_widgets[0].y1_ratio
            y2_ratio = self.image_widgets[0].y2_ratio
            
            # 确保 y1 < y2
            ry1, ry2 = min(y1_ratio, y2_ratio), max(y1_ratio, y2_ratio)
            
            parts = []
            max_w = 0
            
            for i, w in enumerate(self.image_widgets):
                img = cv2.cvtColor(w.cv_img, cv2.COLOR_RGB2BGR)
                h, width = img.shape[:2]
                max_w = max(max_w, width)
                
                if i == 0:
                    # 第一张图：保留 0 到 y2
                    parts.append(img[0:int(h*ry2), :])
                else:
                    # 后续图：保留 y1 到 y2
                    parts.append(img[int(h*ry1):int(h*ry2), :])
            
            # 计算总高度
            total_h = sum(p.shape[0] for p in parts) + spacing * (len(parts) - 1)
            result = np.full((total_h, max_w, 3), 255, dtype=np.uint8)
            
            curr_y = 0
            for p in parts:
                ph, pw = p.shape[:2]
                offset_x = (max_w - pw) // 2
                result[curr_y:curr_y+ph, offset_x:offset_x+pw] = p
                curr_y += ph + spacing
                
            save_path, _ = QFileDialog.getSaveFileName(self, "保存结果", "joined_subtitle.png", "PNG (*.png)")
            if save_path:
                cv2.imwrite(save_path, result)
                QMessageBox.information(self, "成功", "图片拼接已完成！")
        except Exception as e:
            QMessageBox.critical(self, "错误", f"拼接失败: {str(e)}")


# ==========================================
# 主窗口 (结构重构)
# ==========================================
class SubtitleExtractor(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle('视频/图片字幕提取拼接器 - 小米MiMo助手开发')
        self.setGeometry(100, 100, 1300, 850)
        
        # 核心：使用 TabWidget
        self.tabs = QTabWidget()
        self.setCentralWidget(self.tabs)
        
        # 初始化两个功能页
        self.init_video_tab()
        self.image_tab = ImageJoinerWidget()
        
        self.tabs.addTab(self.video_widget, "🎞️ 拼接视频字幕")
        self.tabs.addTab(self.image_tab, "🖼️ 拼接图片字幕")


    def init_video_tab(self):
        self.video_widget = QWidget()
        main_layout = QVBoxLayout(self.video_widget)

        self.video_path = None
        self.cap = None
        self.current_frame = 0
        self.fps = 0
        self.total_frames = 0
        self.time_points = []
        self.crop_rect = None
        
        # 1. 文件上传区域
        file_group = QGroupBox('1. 上传视频')
        file_layout = QHBoxLayout(file_group)
        self.btn_upload = QPushButton('📁 选择视频文件')
        self.btn_upload.clicked.connect(self.upload_video)
        self.btn_upload.setMinimumWidth(150)
        self.file_label = QLabel('未选择文件')
        self.file_label.setStyleSheet("color: #666; padding-left: 10px;")
        file_layout.addWidget(self.btn_upload)
        file_layout.addWidget(self.file_label, 1)
        main_layout.addWidget(file_group)

        # 2. 视频预览和操作区域
        split = QSplitter(Qt.Horizontal)

        # 左侧:视频预览
        left_widget = QWidget()
        left_layout = QVBoxLayout(left_widget)

        self.video_label = VideoPreviewLabel()
        self.video_label.setMinimumSize(800, 450)  # 设置更大的初始尺寸
        left_layout.addWidget(self.video_label, 1)  # 添加拉伸因子

        # 播放控制
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
        control_layout.addStretch()
        control_layout.addWidget(self.time_label)
        left_layout.addLayout(control_layout)

        # 进度条
        self.slider = QSlider(Qt.Horizontal)
        self.slider.sliderMoved.connect(self.set_position)
        left_layout.addWidget(self.slider)

        split.addWidget(left_widget)

        # 右侧:设置和日志
        right_widget = QWidget()
        right_layout = QVBoxLayout(right_widget)

        # 字幕区域设置
        area_group = QGroupBox('2. 设置字幕区域')
        area_layout = QVBoxLayout(area_group)

        # 坐标输入
        coord_layout = QHBoxLayout()
        self.x1_input = QLineEdit()
        self.x1_input.setPlaceholderText('X1')
        self.y1_input = QLineEdit()
        self.y1_input.setPlaceholderText('Y1')
        self.x2_input = QLineEdit()
        self.x2_input.setPlaceholderText('X2')
        self.y2_input = QLineEdit()
        self.y2_input.setPlaceholderText('Y2')

        coord_layout.addWidget(QLabel('坐标:'))
        coord_layout.addWidget(self.x1_input, 1)
        coord_layout.addWidget(self.y1_input, 1)
        coord_layout.addWidget(self.x2_input, 1)
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
        tip_label = QLabel('格式: 序号. HH:MM:SS.mmm (帧: 数字)\n可直接编辑、复制、粘贴时间点')
        tip_label.setStyleSheet("color: #666; font-size: 11px; padding: 5px;")
        time_layout.addWidget(tip_label)
        
        self.time_points_display = QTextEdit()
        self.time_points_display.setReadOnly(False)  # 改为可编辑
        self.time_points_display.setFixedHeight(320)
        self.time_points_display.setMaximumHeight(320)
        self.time_points_display.setPlaceholderText('点击"标记时间"或按Enter键添加当前帧...\n可直接编辑此区域内容\n\n如不标记,默认每秒截取一次')
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

        # 填充设置
        fill_layout = QHBoxLayout()
        fill_layout.addWidget(QLabel('背景填充:'))
        self.fill_color = QLineEdit('white')
        self.fill_color.setPlaceholderText('white/black/颜色名或#RGB')
        fill_layout.addWidget(self.fill_color)

        # 间距设置
        spacing_layout = QHBoxLayout()
        spacing_layout.addWidget(QLabel('图片间距:'))
        self.spacing_input = QSpinBox()
        self.spacing_input.setRange(0, 100)
        self.spacing_input.setValue(1)
        spacing_layout.addWidget(self.spacing_input)
        spacing_layout.addWidget(QLabel('像素'))

        export_layout.addLayout(fill_layout)
        export_layout.addLayout(spacing_layout)

        self.btn_extract = QPushButton('🎯 提取并拼接字幕')
        self.btn_extract.setStyleSheet("background: #007ACC; color: white; font-weight: bold; padding: 10px; font-size: 13px;")
        self.btn_extract.clicked.connect(self.extract_subtitles)
        export_layout.addWidget(self.btn_extract)

        right_layout.addWidget(export_group)
        right_layout.addStretch()

        split.addWidget(right_widget)
        split.setStretchFactor(0, 10)
        split.setStretchFactor(1, 1)
        
        main_layout.addWidget(split)

        # 状态栏
        self.status_label = QLabel('就绪')
        self.status_label.setStyleSheet("padding: 8px; background: #f0f0f0; font-size: 12px;")
        main_layout.addWidget(self.status_label)

        # 定时器
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_frame)

    def eventFilter(self, obj, event):
        """事件过滤器 - 处理键盘快捷键"""
        if event.type() == QEvent.KeyPress:
            if event.key() == Qt.Key_Space:
                # 空格键控制播放/暂停
                self.toggle_play()
                return True
            elif event.key() == Qt.Key_Return or event.key() == Qt.Key_Enter:
                # Enter键标记时间
                self.mark_time()
                return True
            elif event.key() == Qt.Key_Delete or event.key() == Qt.Key_Backspace:
                # Delete或Backspace键删除最后一个标记
                self.delete_last_mark()
                return True
        return super().eventFilter(obj, event)

    def upload_video(self):
        file_path, _ = QFileDialog.getOpenFileName(self, '选择视频文件', '', '视频文件 (*.mp4 *.avi *.mov *.mkv *.wmv *.flv)')
        if file_path:
            self.video_path = file_path
            self.file_label.setText(os.path.basename(file_path))
            self.video_label.callback_on_selection = self.auto_fill_selection

            # 打开视频
            if self.cap:
                self.cap.release()
            
            self.cap = cv2.VideoCapture(file_path)
            if not self.cap.isOpened():
                QMessageBox.warning(self, '错误', '无法打开视频文件')
                return

            self.fps = self.cap.get(cv2.CAP_PROP_FPS)
            self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
            self.slider.setMaximum(self.total_frames - 1)

            # --- 优化部分：强制撑开显示区域 ---
            ret, frame = self.cap.read()
            if ret:
                self.current_frame = 0
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # 允许内容缩放以填满可用空间
                self.video_label.setScaledContents(False) 
                
                # 更新显示
                self.show_frame(frame_rgb)
                
                # 关键：通知布局管理器，内容已更改，需要重新分配空间
                self.video_label.updateGeometry()
                self.video_label.parentWidget().layout().activate()
                
                duration = self.total_frames / self.fps if self.fps > 0 else 0
                self.status_label.setText(f'视频加载成功 - {self.total_frames}帧, {self.fps:.1f}fps, 时长: {self.format_time(duration)}')
            
            # 强制 UI 线程立即处理布局变化
            QApplication.processEvents()

    def auto_fill_selection(self):
        """鼠标框选完成后自动填充坐标"""
        if not self.cap or not self.video_label.selection_rect:
            return

        width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        coords = self.video_label.get_video_coordinates(width, height)
        if coords:
            x1, y1, x2, y2 = coords
            self.x1_input.setText(str(x1))
            self.y1_input.setText(str(y1))
            self.x2_input.setText(str(x2))
            self.y2_input.setText(str(y2))
            self.crop_rect = (x1, y1, x2, y2)
            self.status_label.setText(f'已自动更新区域: ({x1},{y1})-({x2},{y2})')

    def concatenate_images_with_first_frame(self, first_frame, subtitle_images):
        """拼接图像: 第一帧裁剪(0-y2)在顶部, 字幕片段在下方"""
        if first_frame is None:
            return None
            
        # 根据 y2 裁剪第一帧
        if self.crop_rect:
            _, _, _, y2 = self.crop_rect
            y2 = min(y2, first_frame.shape[0])
            first_frame_cropped = first_frame[0:y2, :] # 裁剪 0 到 y2 范围
        else:
            first_frame_cropped = first_frame

        spacing = self.spacing_input.value()
        all_widths = [first_frame_cropped.shape[1]] + [img.shape[1] for img in subtitle_images]
        max_width = max(all_widths)
        
        # 计算总高度
        total_height = first_frame_cropped.shape[0]
        if subtitle_images:
            total_height += spacing + sum(img.shape[0] for img in subtitle_images) + spacing * (len(subtitle_images) - 1)

        # 背景颜色 (默认白色)
        result = np.full((total_height, max_width, 3), (255, 255, 255), dtype=np.uint8)

        # 放置裁剪后的第一帧
        h, w = first_frame_cropped.shape[:2]
        result[0:h, (max_width-w)//2 : (max_width-w)//2 + w] = first_frame_cropped
        
        y_offset = h + spacing
        for img in subtitle_images:
            h, w = img.shape[:2]
            result[y_offset:y_offset+h, (max_width-w)//2 : (max_width-w)//2 + w] = img
            y_offset += h + spacing

        return result

    def show_frame(self, frame):
        height, width, channel = frame.shape
        bytes_per_line = 3 * width
        q_img = QImage(frame.data, width, height, bytes_per_line, QImage.Format_RGB888)
        pixmap = QPixmap.fromImage(q_img)
        
        # 获取当前 Label 的可用宽度，动态计算缩放
        # 如果 Label 还没被完全撑开，可以用父容器的宽度作为参考
        target_size = self.video_label.size()
        if target_size.width() < 100: # 初始值太小时的兜底
             target_size = self.video_label.parentWidget().size()

        scaled_pixmap = pixmap.scaled(
            target_size, 
            Qt.KeepAspectRatio, 
            Qt.SmoothTransformation
        )
        self.video_label.original_pixmap = scaled_pixmap
        self.video_label.setPixmap(scaled_pixmap)

    def toggle_play(self):
        if not self.cap:
            QMessageBox.warning(self, '警告', '请先上传视频')
            return

        if self.timer.isActive():
            self.timer.stop()
            self.btn_play_toggle.setText('▶ 播放')
            self.status_label.setText('已暂停')
        else:
            self.timer.start(int(1000/self.fps) if self.fps > 0 else 33)
            self.btn_play_toggle.setText('⏸ 暂停')
            self.status_label.setText('播放中...')

    def update_frame(self):
        if self.cap and self.cap.isOpened():
            ret, frame = self.cap.read()
            if ret:
                self.current_frame += 1
                self.slider.setValue(self.current_frame)
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                self.show_frame(frame_rgb)

                time_sec = self.current_frame / self.fps if self.fps > 0 else 0
                time_str = self.format_time(time_sec)
                self.time_label.setText(time_str)
            else:
                self.timer.stop()
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                self.current_frame = 0
                self.btn_play.setText('▶ 播放')

    def set_position(self, position):
        if self.cap:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, position)
            self.current_frame = position
            ret, frame = self.cap.read()
            if ret:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                self.show_frame(frame_rgb)
                time_sec = position / self.fps if self.fps > 0 else 0
                time_str = self.format_time(time_sec)
                self.time_label.setText(time_str)

    def mark_time(self):
        if not self.cap:
            QMessageBox.warning(self, '警告', '请先上传视频')
            return

        time_sec = self.current_frame / self.fps if self.fps > 0 else 0
        time_str = self.format_time(time_sec)
        self.time_points.append((time_sec, self.current_frame))
        self.refresh_time_points_display()
        self.status_label.setText(f'已标记 {len(self.time_points)} 个时间点')

    def delete_last_mark(self):
        """删除最后一个标记"""
        if not self.time_points:
            self.status_label.setText('没有可删除的标记')
            return
        
        self.time_points.pop()
        self.refresh_time_points_display()
        self.status_label.setText(f'已删除最后一个标记,剩余 {len(self.time_points)} 个时间点')

    def refresh_time_points_display(self):
        """刷新时间点显示"""
        self.time_points_display.clear()
        for idx, (time_sec, frame_num) in enumerate(self.time_points, 1):
            time_str = self.format_time(time_sec)
            self.time_points_display.append(f"{idx}. {time_str} (帧: {frame_num})")

    def apply_time_points_edit(self):
        """应用用户编辑的时间点"""
        text = self.time_points_display.toPlainText().strip()
        if not text:
            self.time_points.clear()
            self.status_label.setText('时间点已清空')
            return
        
        # 解析文本
        new_time_points = []
        errors = []
        
        lines = text.split('\n')
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            if not line:
                continue
            
            # 解析格式: 序号. HH:MM:SS.mmm (帧: 数字)
            # 也支持: HH:MM:SS.mmm (帧: 数字) 或 HH:MM:SS (帧: 数字)
            pattern = r'(?:\d+\.\s*)?(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?\s*\(帧:\s*(\d+)\)'
            match = re.search(pattern, line)
            
            if match:
                h, m, s, ms, frame = match.groups()
                ms = ms if ms else '000'
                
                # 计算时间(秒)
                time_sec = int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000.0
                frame_num = int(frame)
                
                # 验证帧数是否在范围内
                if self.total_frames > 0 and frame_num >= self.total_frames:
                    errors.append(f"第{line_num}行: 帧数{frame_num}超出视频范围(最大{self.total_frames-1})")
                    continue
                
                new_time_points.append((time_sec, frame_num))
            else:
                errors.append(f"第{line_num}行: 格式错误 - {line}")
        
        if errors:
            error_msg = '\n'.join(errors)
            QMessageBox.warning(self, '解析错误', 
                f'以下行解析失败:\n\n{error_msg}\n\n'
                f'正确格式示例:\n'
                f'1. 00:00:05.000 (帧: 150)\n'
                f'00:00:10.500 (帧: 315)')
            return
        
        if not new_time_points:
            QMessageBox.warning(self, '警告', '没有解析到有效的时间点')
            return
        
        # 应用新的时间点
        self.time_points = new_time_points
        self.refresh_time_points_display()
        self.status_label.setText(f'已应用编辑, 共 {len(self.time_points)} 个时间点')
        QMessageBox.information(self, '成功', f'成功解析 {len(new_time_points)} 个时间点')

    def pick_area_from_video(self):
        if not self.video_label.pixmap():
            QMessageBox.warning(self, '警告', '请先上传并预览视频')
            return

        QMessageBox.information(self, '操作提示',
            '请在视频预览区域按住鼠标左键拖拽,框选字幕区域。\n'
            '框选完成后,点击"应用框选"按钮来应用坐标。')

    def use_last_selection(self):
        if not self.video_label.selection_rect:
            QMessageBox.warning(self, '警告', '没有可用的框选区域,请先用鼠标框选')
            return

        if not self.cap:
            QMessageBox.warning(self, '警告', '请先上传视频')
            return

        # 获取视频实际尺寸
        width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        # 转换坐标
        coords = self.video_label.get_video_coordinates(width, height)
        if coords:
            x1, y1, x2, y2 = coords
            if x2 - x1 < 10 or y2 - y1 < 10:
                QMessageBox.warning(self, '警告', '选择区域太小,请重新框选')
                return
                
            self.x1_input.setText(str(x1))
            self.y1_input.setText(str(y1))
            self.x2_input.setText(str(x2))
            self.y2_input.setText(str(y2))
            self.crop_rect = (x1, y1, x2, y2)
            self.status_label.setText(f'已应用框选区域: ({x1},{y1})-({x2},{y2})')
            QMessageBox.information(self, '成功', f'字幕区域已设置:\n({x1},{y1})-({x2},{y2})')

    def set_subtitle_area(self):
        try:
            x1 = int(self.x1_input.text())
            y1 = int(self.y1_input.text())
            x2 = int(self.x2_input.text())
            y2 = int(self.y2_input.text())

            if x1 >= x2 or y1 >= y2:
                QMessageBox.warning(self, '错误', '坐标设置错误:X2必须大于X1,Y2必须大于Y1')
                return

            if self.cap:
                width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                
                if x2 > width or y2 > height or x1 < 0 or y1 < 0:
                    QMessageBox.warning(self, '警告', f'坐标超出视频范围\n视频尺寸: {width}x{height}')
                    return

            self.crop_rect = (x1, y1, x2, y2)
            self.status_label.setText(f'字幕区域已设置: ({x1},{y1})-({x2},{y2})')
            QMessageBox.information(self, '成功', '字幕区域设置完成')
        except ValueError:
            QMessageBox.warning(self, '错误', '请输入有效的整数坐标')

    def extract_subtitles(self):
        """提取并拼接字幕区域图像（包含完整第一帧）"""
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
                total_seconds = int(self.total_frames / self.fps) if self.fps > 0 else 0
                use_points = []
                for sec in range(total_seconds + 1):
                    frame_idx = int(sec * self.fps)
                    if frame_idx < self.total_frames:
                        use_points.append((sec, frame_idx))
                mode_info = f"自动模式(每秒截取, 共{len(use_points)}帧)"

            # 3. 提取字幕区域
            subtitle_images = []
            x1, y1, x2, y2 = self.crop_rect
            
            for idx, (time_sec, frame_idx) in enumerate(use_points):
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame = cap.read()
                if ret:
                    # 确保坐标在图像范围内
                    height, width = frame.shape[:2]
                    rx1, rx2 = max(0, min(x1, width)), max(0, min(x2, width))
                    ry1, ry2 = max(0, min(y1, height)), max(0, min(y2, height))

                    if rx2 > rx1 and ry2 > ry1:
                        subtitle_img = frame[ry1:ry2, rx1:rx2]
                        subtitle_images.append(subtitle_img)
                
                self.status_label.setText(f'正在提取... ({idx+1}/{len(use_points)})')
                QApplication.processEvents()

            cap.release()

            if not subtitle_images:
                QMessageBox.warning(self, '错误', '未能提取到有效的字幕图像，请检查坐标设置')
                return

            # 4. 调用拼接方法（修正了函数名调用错误）
            self.status_label.setText('正在拼接图像...')
            QApplication.processEvents()
            combined = self.concatenate_images_with_first_frame(first_frame, subtitle_images)

            # 5. 保存结果
            default_name = f"subtitle_{os.path.splitext(os.path.basename(self.video_path))[0]}.png"
            save_path, _ = QFileDialog.getSaveFileName(self, '保存字幕拼接图', default_name,
                                                    'PNG图像 (*.png);;JPG图像 (*.jpg)')
            if save_path:
                cv2.imwrite(save_path, combined)
                self.status_label.setText('✅ 处理完成!')
                QMessageBox.information(self, '成功',
                    f'字幕拼接图已保存到:\n{save_path}\n\n'
                    f'模式: {mode_info}\n'
                    f'共提取 {len(subtitle_images)} 个字幕片段\n'
                    f'图像尺寸: {combined.shape[1]}x{combined.shape[0]} 像素')
            else:
                self.status_label.setText('已取消保存')

        except Exception as e:
            self.status_label.setText('❌ 处理失败')
            QMessageBox.critical(self, '错误', f'处理过程中发生错误:\n{str(e)}')

    def concatenate_images_with_first_frame(self, first_frame, subtitle_images):
        """拼接图像:第一帧完整图像在顶部,其他字幕片段在下方"""
        if first_frame is None:
            return None
        
        if self.crop_rect:
            _, _, _, y2 = self.crop_rect
            # 确保 y2 不超过视频实际高度
            y2 = min(y2, first_frame.shape[0])
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

        # 背景颜色
        bg_color = self.fill_color.text().strip().lower()
        if bg_color == 'white':
            bg = (255, 255, 255)
        elif bg_color == 'black':
            bg = (0, 0, 0)
        elif bg_color.startswith('#') and len(bg_color) == 7:
            try:
                r = int(bg_color[1:3], 16)
                g = int(bg_color[3:5], 16)
                b = int(bg_color[5:7], 16)
                bg = (b, g, r)
            except:
                bg = (255, 255, 255)
        else:
            bg = (255, 255, 255)

        # 创建画布
        result = np.full((total_height, max_width, 3), bg, dtype=np.uint8)

        # 放置第一帧(居中)
        y_offset = 0
        h, w = first_frame_cropped.shape[:2]
        x_offset = (max_width - w) // 2
        result[y_offset:y_offset+h, x_offset:x_offset+w] = first_frame_cropped
        y_offset += h
        
        # 如果有其他字幕图像,添加间距后继续拼接
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
        if not self.time_points:
            self.status_label.setText('没有需要清空的标记')
            return
            
        reply = QMessageBox.question(self, '确认', 
                                     f'确定要清空所有 {len(self.time_points)} 个标记吗?',
                                     QMessageBox.Yes | QMessageBox.No)
        if reply == QMessageBox.Yes:
            self.time_points.clear()
            self.time_points_display.clear()
            self.status_label.setText('已清空所有标记')

    def format_time(self, seconds):
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        ms = int((seconds % 1) * 1000)
        return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"

    def closeEvent(self, event):
        if self.timer.isActive():
            self.timer.stop()
        if self.cap:
            self.cap.release()
        event.accept()

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = SubtitleExtractor()
    window.show()
    sys.exit(app.exec_())