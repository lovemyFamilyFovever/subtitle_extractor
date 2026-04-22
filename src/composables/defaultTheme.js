function getDefaultTheme({ el, initData, currentTheme, currentLayout }) {
    return {
        el,
        data: JSON.parse(JSON.stringify(initData)),
        theme: currentTheme,
        layout: currentLayout,
        themeConfig: {
            // 节点内边距
            paddingX: 15,
            paddingY: 5,
            // 图片显示的最大宽度
            imgMaxWidth: 300,
            // 图片显示的最大高度
            imgMaxHeight: 100,
            // icon的大小
            iconSize: 20,
            // 连线的粗细
            lineWidth: 1,
            // 连线的颜色
            lineColor: '#f96628',
            // 连线样式
            lineDasharray: 'none',
            // 连线风格
            lineStyle: 'straight',
            // 直线连接时连线的圆角大小
            lineRadius: 5,
            // 连线是否显示标记
            showLineMarker: false,
            // 概要连线的粗细
            generalizationLineWidth: 1,
            // 概要连线的颜色
            generalizationLineColor: '#f96628',
            // 概要曲线距节点的距离
            generalizationLineMargin: 0,
            // 概要节点距节点的距离
            generalizationNodeMargin: 20,
            // 关联线默认状态的粗细
            associativeLineWidth: 2,
            // 关联线默认状态的颜色
            associativeLineColor: 'rgb(51, 51, 51)',
            // 关联线激活状态的粗细
            associativeLineActiveWidth: 8,
            // 关联线激活状态的颜色
            associativeLineActiveColor: 'rgba(2, 167, 240, 1)',
            // 关联线样式
            associativeLineDasharray: '6,4',
            // 关联线文字颜色
            associativeLineTextColor: 'rgb(51, 51, 51)',
            // 关联线文字大小
            associativeLineTextFontSize: 14,
            // 关联线文字行高
            associativeLineTextLineHeight: 1.2,
            // 关联线文字字体
            associativeLineTextFontFamily: '微软雅黑, Microsoft YaHei',
            // 背景颜色
            backgroundColor: '#f0f2f5',
            // 背景图片
            backgroundImage: 'none',
            // 背景重复
            backgroundRepeat: 'no-repeat',
            // 设置背景图像的起始位置
            backgroundPosition: 'center center',
            // 设置背景图片大小
            backgroundSize: 'cover',
            // 节点使用只有底边横线的样式
            nodeUseLineStyle: false,

            // 根节点样式
            root: {
                shape: 'rectangle',
                paddingX: 25,
                paddingY: 15,
                fillColor: '#f96628',
                fontFamily: '微软雅黑, Microsoft YaHei',
                color: '#FFFFFF',
                fontSize: 18,
                fontWeight: 'bold',
                fontStyle: 'normal',
                borderColor: 'transparent',
                borderWidth: 0,
                borderDasharray: 'none',
                borderRadius: 5,
                textDecoration: 'none',
                gradientStyle: false,
                startColor: '#f96628',
                endColor: '#fff',
                startDir: [0, 0],
                endDir: [1, 0],
                lineMarkerDir: 'end',
                hoverRectColor: '',
                hoverRectRadius: 5,
                textAlign: 'left',
                imgPlacement: 'top',
                tagPlacement: 'right'
            },

            // 二级节点样式
            second: {
                shape: 'rectangle',
                marginX: 130,
                marginY: 20,
                paddingX: 15,
                paddingY: 15,
                fillColor: '#FFFFFF',
                fontFamily: '微软雅黑, Microsoft YaHei',
                color: '#090701',
                fontSize: 14,
                fontWeight: 'normal',
                fontStyle: 'normal',
                borderColor: '#f96628',
                borderWidth: 1,
                borderDasharray: 'none',
                borderRadius: 5,
                textDecoration: 'none',
                gradientStyle: false,
                startColor: '#f96628',
                endColor: '#fff',
                startDir: [0, 0],
                endDir: [1, 0],
                lineMarkerDir: 'end',
                hoverRectColor: '',
                hoverRectRadius: 5,
                textAlign: 'left',
                imgPlacement: 'top',
                tagPlacement: 'right'
            },

            // 三级及以下节点样式
            node: {
                shape: 'rectangle',
                marginX: 100,
                marginY: 80,
                paddingX: 15,
                paddingY: 15,
                fillColor: '#FFFFFF',
                fontFamily: '微软雅黑, Microsoft YaHei',
                color: '#090701',
                fontSize: 14,
                fontWeight: 'normal',
                fontStyle: 'normal',
                borderColor: '#DEE0E3',
                borderWidth: 1,
                borderDasharray: 'none',
                borderRadius: 5,
                textDecoration: 'none',
                gradientStyle: false,
                startColor: '#f96628',
                endColor: '#fff',
                startDir: [0, 0],
                endDir: [1, 0],
                lineMarkerDir: 'end',
                hoverRectColor: '',
                hoverRectRadius: 5,
                textAlign: 'left',
                imgPlacement: 'top',
                tagPlacement: 'right'
            },

            // 概要节点样式
            generalization: {
                shape: 'rectangle',
                marginX: 100,
                marginY: 40,
                fillColor: '#E8E8E8',
                fontFamily: '微软雅黑, Microsoft YaHei',
                color: '#333333',
                fontSize: 14,
                fontWeight: 'normal',
                fontStyle: 'normal',
                borderColor: '#999999',
                borderWidth: 1,
                borderDasharray: 'none',
                borderRadius: 5,
                textDecoration: 'none',
                gradientStyle: false,
                startColor: '#f96628',
                endColor: '#fff',
                startDir: [0, 0],
                endDir: [1, 0],
                hoverRectColor: '',
                hoverRectRadius: 5,
                textAlign: 'left',
                imgPlacement: 'top',
                tagPlacement: 'right'
            }
        },
        openRealtimeRenderOnNodeTextEdit: true,
        defaultInsertSecondLevelNodeText: '分支主题',
        defaultInsertBelowSecondLevelNodeText: '子主题',
        isShowWatermark: false,
        enableDragModifyNodeWidth: true,
        minNodeTextModifyWidth: 100,
        maxNodeTextModifyWidth: -1,
        imgResizeBtnSize: 24,
        minImgResizeWidth: 40,
        minImgResizeHeight: 40,
        maxImgResizeWidthInheritTheme: false,
        maxImgResizeWidth: 2000,
        maxImgResizeHeight: 2000,
        mousewheelAction: 'zoom',
        showNumber: false
    }
}

export default getDefaultTheme
