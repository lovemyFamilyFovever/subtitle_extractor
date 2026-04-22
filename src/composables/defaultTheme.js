/**
 * 获取默认主题配置函数
 * @param {Object} options - 配置选项对象
 * @param {HTMLElement} options.el - 思维导图挂载的DOM元素
 * @param {Object} options.initData - 初始思维导图数据
 * @param {string} options.currentTheme - 当前主题名称
 * @param {string} options.currentLayout - 当前布局模式
 * @param {Function} options.insertChildNode - 插入子节点的自定义方法
 * @returns {Object} 返回完整的主题配置对象
 */
function getDefaultTheme({ el, initData, currentTheme, currentLayout, insertChildNode }) {
    return {
        // 挂载元素
        el,

        // 初始数据（深拷贝避免污染原数据）
        data: JSON.parse(JSON.stringify(initData)),

        // 当前主题名称
        theme: currentTheme,

        // 当前布局模式
        layout: currentLayout,

        // 自定义快速创建子节点按钮点击事件
        customQuickCreateChildBtnClick: function () {
            // 调用外部传入的插入子节点方法
            insertChildNode()
        },
        //初始根节点的位置，可传一个数组，默认为['center', 'center']
        initRootNodePosition: ['20%', 'center'],


        // 主题详细配置
        themeConfig: {
            // ========== 通用节点样式 ==========
            // 节点内图片最大宽度
            imgMaxWidth: 300,
            // 节点内图片最大高度
            imgMaxHeight: 100,
            // 图标尺寸
            iconSize: 20,

            // ========== 连线样式 ==========
            // 连线粗细
            lineWidth: 1,
            // 连线颜色（橙色）
            lineColor: '#f96628',
            // 连线样式（none=实线，虚线用 '5,5' 格式）
            lineDasharray: 'none',
            // 连线风格（straight=直线，curve=曲线）
            lineStyle: 'straight',
            // 直线连接时连线的圆角大小
            lineRadius: 5,
            // 是否显示连线标记（箭头等）
            showLineMarker: false,

            // ========== 概要节点连线样式 ==========
            // 概要连线粗细
            generalizationLineWidth: 1,
            // 概要连线颜色
            generalizationLineColor: '#f96628',
            // 概要曲线距节点的距离
            generalizationLineMargin: 0,
            // 概要节点距节点的距离
            generalizationNodeMargin: 20,

            // ========== 关联线样式 ==========
            // 关联线默认状态粗细
            associativeLineWidth: 2,
            // 关联线默认状态颜色
            associativeLineColor: 'rgb(51, 51, 51)',
            // 关联线激活状态粗细
            associativeLineActiveWidth: 8,
            // 关联线激活状态颜色（蓝色）
            associativeLineActiveColor: 'rgba(2, 167, 240, 1)',
            // 关联线样式（虚线）
            associativeLineDasharray: '6,4',
            // 关联线文字颜色
            associativeLineTextColor: 'rgb(51, 51, 51)',
            // 关联线文字大小
            associativeLineTextFontSize: 14,
            // 关联线文字行高
            associativeLineTextLineHeight: 1.2,
            // 关联线文字字体
            associativeLineTextFontFamily: '微软雅黑, Microsoft YaHei',

            // ========== 背景样式 ==========
            // 背景颜色
            backgroundColor: '#f0f2f5',
            // 背景图片（none表示无背景图）
            backgroundImage: 'none',
            // 背景重复方式
            backgroundRepeat: 'no-repeat',
            // 背景图像起始位置
            backgroundPosition: 'center center',
            // 背景图片大小
            backgroundSize: 'cover',

            // ========== 节点特殊样式 ==========
            // 节点使用只有底边横线的样式（简化风格）
            nodeUseLineStyle: false,

            // ========== 根节点样式 ==========
            root: {
                // 形状：矩形
                shape: 'rectangle',
                // 水平内边距（更大）
                paddingX: 35,
                // 垂直内边距（更大）
                paddingY: 15,
                // 填充色（橙色）
                fillColor: '#f96628',
                // 字体
                fontFamily: '微软雅黑, Microsoft YaHei',
                // 文字颜色（白色）
                color: '#FFFFFF',
                // 字号
                fontSize: 18,
                // 字重（粗体）
                fontWeight: 'bold',
                // 字体样式
                fontStyle: 'normal',
                // 边框颜色（透明）
                borderColor: 'transparent',
                // 边框宽度（无边框）
                borderWidth: 0,
                // 边框虚线样式
                borderDasharray: 'none',
                // 圆角
                borderRadius: 5,
                // 文字装饰
                textDecoration: 'none',
                // 渐变样式（false表示无渐变）
                gradientStyle: false,
                // 渐变起始颜色
                startColor: '#f96628',
                // 渐变结束颜色
                endColor: '#fff',
                // 渐变起始方向
                startDir: [0, 0],
                // 渐变结束方向
                endDir: [1, 0],
                // 连线标记方向
                lineMarkerDir: 'end',
                // 悬停框颜色（空表示默认）
                hoverRectColor: '',
                // 悬停框圆角
                hoverRectRadius: 5,
                // 文字对齐方式
                textAlign: 'left',
                // 图片位置
                imgPlacement: 'top',
                // 标签位置
                tagPlacement: 'right',
            
            },

            // ========== 二级节点样式 ==========
            second: {
                // 形状：矩形
                shape: 'rectangle',
                // 水平间距
                marginX: 130,
                // 垂直间距
                marginY: 20,
                // 水平内边距
                paddingX: 35,
                // 垂直内边距
                paddingY: 15,
                // 填充色（白色）
                fillColor: '#FFFFFF',
                // 字体
                fontFamily: '微软雅黑, Microsoft YaHei',
                // 文字颜色（深色）
                color: '#090701',
                // 字号
                fontSize: 14,
                // 字重
                fontWeight: 'normal',
                // 字体样式
                fontStyle: 'normal',
                // 边框颜色（橙色）
                borderColor: '#f96628',
                // 边框宽度
                borderWidth: 1,
                // 边框虚线样式
                borderDasharray: 'none',
                // 圆角
                borderRadius: 5,
                // 文字装饰
                textDecoration: 'none',
                // 渐变样式
                gradientStyle: false,
                // 渐变起始颜色
                startColor: '#f96628',
                // 渐变结束颜色
                endColor: '#fff',
                // 渐变起始方向
                startDir: [0, 0],
                // 渐变结束方向
                endDir: [1, 0],
                // 连线标记方向
                lineMarkerDir: 'end',
                // 悬停框颜色
                hoverRectColor: '',
                // 悬停框圆角
                hoverRectRadius: 5,
                // 文字对齐方式
                textAlign: 'left',
                // 图片位置
                imgPlacement: 'top',
                // 标签位置
                tagPlacement: 'right',
            },

            // ========== 三级及以下节点样式 ==========
            node: {
                // 形状：矩形
                shape: 'rectangle',
                // 水平间距
                marginX: 100,
                // 垂直间距
                marginY: 80,
                // 水平内边距
                paddingX: 35,
                // 垂直内边距
                paddingY: 15,
                // 填充色（白色）
                fillColor: '#FFFFFF',
                // 字体
                fontFamily: '微软雅黑, Microsoft YaHei',
                // 文字颜色（深色）
                color: '#090701',
                // 字号
                fontSize: 14,
                // 字重
                fontWeight: 'normal',
                // 字体样式
                fontStyle: 'normal',
                // 边框颜色（浅灰）
                borderColor: '#DEE0E3',
                // 边框宽度
                borderWidth: 1,
                // 边框虚线样式
                borderDasharray: 'none',
                // 圆角
                borderRadius: 5,
                // 文字装饰
                textDecoration: 'none',
                // 渐变样式
                gradientStyle: false,
                // 渐变起始颜色
                startColor: '#f96628',
                // 渐变结束颜色
                endColor: '#fff',
                // 渐变起始方向
                startDir: [0, 0],
                // 渐变结束方向
                endDir: [1, 0],
                // 连线标记方向
                lineMarkerDir: 'end',
                // 悬停框颜色
                hoverRectColor: '',
                // 悬停框圆角
                hoverRectRadius: 5,
                // 文字对齐方式
                textAlign: 'left',
                // 图片位置
                imgPlacement: 'top',
                // 标签位置
                tagPlacement: 'right'
            },

            // ========== 概要节点样式 ==========
            generalization: {
                // 形状：矩形
                shape: 'rectangle',
                // 水平间距
                marginX: 100,
                // 垂直间距
                marginY: 40,
                // 填充色（浅灰）
                fillColor: '#E8E8E8',
                // 字体
                fontFamily: '微软雅黑, Microsoft YaHei',
                // 文字颜色（深灰）
                color: '#333333',
                // 字号
                fontSize: 14,
                // 字重
                fontWeight: 'normal',
                // 字体样式
                fontStyle: 'normal',
                // 边框颜色
                borderColor: '#999999',
                // 边框宽度
                borderWidth: 1,
                // 边框虚线样式
                borderDasharray: 'none',
                // 圆角
                borderRadius: 5,
                // 文字装饰
                textDecoration: 'none',
                // 渐变样式
                gradientStyle: false,
                // 渐变起始颜色
                startColor: '#f96628',
                // 渐变结束颜色
                endColor: '#fff',
                // 渐变起始方向
                startDir: [0, 0],
                // 渐变结束方向
                endDir: [1, 0],
                // 悬停框颜色
                hoverRectColor: '',
                // 悬停框圆角
                hoverRectRadius: 5,
                // 文字对齐方式
                textAlign: 'left',
                // 图片位置
                imgPlacement: 'top',
                // 标签位置
                tagPlacement: 'right'
            }
        },

        // ========== 编辑行为配置 ==========
        // 节点编辑时实时渲染
        openRealtimeRenderOnNodeTextEdit: true,
        // 二级节点默认文本
        defaultInsertSecondLevelNodeText: '分支主题',
        // 三级以下节点默认文本
        defaultInsertBelowSecondLevelNodeText: '子主题',

        // ========== 水印配置 ==========
        // 是否显示水印
        isShowWatermark: false,

        // ========== 节点拖拽配置 ==========
        // 允许拖拽修改节点宽度
        enableDragModifyNodeWidth: true,
        // 节点最小宽度（文本编辑时）
        minNodeTextModifyWidth: 100,
        // 节点最大宽度（-1表示无限制）
        maxNodeTextModifyWidth: -1,

        // ========== 图片调整配置 ==========
        // 图片调整按钮尺寸
        imgResizeBtnSize: 24,
        // 图片最小宽度
        minImgResizeWidth: 40,
        // 图片最小高度
        minImgResizeHeight: 40,
        // 是否继承主题的最大宽度限制
        maxImgResizeWidthInheritTheme: false,
        // 图片最大宽度
        maxImgResizeWidth: 2000,
        // 图片最大高度
        maxImgResizeHeight: 2000,

        // ========== 画布交互配置 ==========
        // 鼠标滚轮行为（zoom=缩放，scroll=平移）
        mousewheelAction: 'zoom',
        // 是否显示节点编号
        showNumber: false
    }
}

// 导出默认主题配置函数
export default getDefaultTheme
