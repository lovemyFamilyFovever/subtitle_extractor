```js

console.log('mindMap 实例:', window.__mindMap)

// 2. 检查当前主题配置
const mc = window.__mindMap?.getThemeConfig?.()
console.log('当前主题配置:', mc)
console.log('imgMaxWidth:', mc?.imgMaxWidth)
console.log('imgMaxHeight:', mc?.imgMaxHeight)

// 3. 手动设置测试
window.__mindMap?.setThemeConfig?.({ imgMaxWidth: 50, imgMaxHeight: 30 })
console.log('设置后:', window.__mindMap?.getThemeConfig?.())

// 4. 检查 SVG 中的 image 元素
const images = document.querySelectorAll('image')
console.log('图片元素数量:', images.length)
images.forEach((img, i) => {
  console.log(`图片${i}:`, {
    href: img.getAttribute('href') || img.getAttribute('xlink:href'),
    width: img.getAttribute('width'),
    height: img.getAttribute('height'),
    transform: img.getAttribute('transform'),
  })
})

```


<div id="color_picker" class="po-menu color_picker po-dropdown-menu alpha_disabled"
    style="display: block; top: 257.821px; left: 686.401px; z-index: 12;">
    <div class="color_change">
        <div type="select" class="select">
            <span class="text-content">系统色</span>
            <ul id="color_menu" class="po-menu-small" style="display: none;">
                <li class="po-menu-item" ac="系统色">
                    <div class="po-menu-item-box"><span class="text">系统色</span></div>
                </li>
                <li class="po-menu-item" ac="莫兰迪">
                    <div class="po-menu-item-box"><span class="text">莫兰迪</span></div>
                </li>
                <li class="po-menu-item" ac="中国风">
                    <div class="po-menu-item-box"><span class="text">中国风</span></div>
                </li>
                <li class="po-menu-item" ac="潘通色">
                    <div class="po-menu-item-box"><span class="text">潘通色</span></div>
                </li>
            </ul>
        </div>
    </div>
    <div class="color_group">
        <div class="color_item" name="" style="color:rgba(239,236,235,1);background:#EFECEB;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(242,242,242,1);background:#F2F2F2;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(231,235,237,1);background:#E7EBED;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(250,220,219,1);background:#FADCDB;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(251,234,218,1);background:#FBEADA;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(252,249,234,1);background:#FCF9EA;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(229,246,218,1);background:#E5F6DA;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(219,245,245,1);background:#DBF5F5;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(210,214,249,1);background:#D2D6F9;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(250,221,237,1);background:#FADDED;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(222,217,215,1);background:#DED9D7;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(217,217,217,1);background:#D9D9D9;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(224,224,224,1);background:#E0E0E0;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(245,185,183,1);background:#F5B9B7;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(248,213,181,1);background:#F8D5B5;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(246,237,193,1);background:#F6EDC1;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(202,237,180,1);background:#CAEDB4;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(183,234,235,1);background:#B7EAEB;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(166,174,243,1);background:#A6AEF3;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(246,187,219,1);background:#F6BBDB;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(190,179,175,1);background:#BEB3AF;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(191,191,191,1);background:#BFBFBF;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(158,158,158,1);background:#9E9E9E;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(241,149,148,1);background:#F19594;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(244,193,143,1);background:#F4C18F;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(241,228,162,1);background:#F1E4A2;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(176,227,143,1);background:#B0E38F;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(148,224,225,1);background:#94E0E1;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(121,133,236,1);background:#7985EC;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(241,153,200,1);background:#F199C8;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(157,140,136,1);background:#9D8C88;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(166,166,166,1);background:#A6A6A6;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(97,97,97,1);background:#616161;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(236,114,112,1);background:#EC7270;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(241,172,106,1);background:#F1AC6A;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(233,214,111,1);background:#E9D66F;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(149,218,105,1);background:#95DA69;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(112,213,215,1);background:#70D5D7;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(91,121,232,1);background:#5B79E8;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(237,119,182,1);background:#ED77B6;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(92,64,56,1);background:#5C4038;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(127,127,127,1);background:#7F7F7F;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(38,38,38,1);background:#262626;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(162,55,53,1);background:#A23735;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(166,106,48,1);background:#A66A30;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(167,147,44,1);background:#A7932C;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(86,146,48,1);background:#569230;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(53,142,144,1);background:#358E90;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(49,74,164,1);background:#314AA4;">
            <span></span></div>
        <div class="color_item" name="" style="color:rgba(162,60,115,1);background:#A23C73;">
            <span></span></div>
    </div>
    <div class="color_base">
        <div class="color_item transparent" name="" original-title=""
            style="color: transparent;background: rgba(255,255,255,1);border-color: #E9EDF2;"><span></span></div>
        <div class="color_item" name="" original-title="#FFFFFF"
            style="color:rgba(255,255,255,1);background:#FFFFFF;border-color:#E9EDF2;"><span></span></div>
        <div class="color_item" name="" original-title="#7F8B98" style="color:rgba(127,139,152,1);background:#7F8B98;">
            <span></span></div>
        <div class="color_item" name="" original-title="#000000" style="color:rgba(0,0,0,1);background:#000000;">
            <span></span></div>
        <div class="color_item" name="" original-title="#E74F4C" style="color:rgba(231,79,76,1);background:#E74F4C;">
            <span></span></div>
        <div class="color_item" name="" original-title="#ED9745" style="color:rgba(237,151,69,1);background:#ED9745;">
            <span></span></div>
        <div class="color_item" name="" original-title="#E0C431" style="color:rgba(224,196,49,1);background:#E0C431;">
            <span></span></div>
        <div class="color_item" name="" original-title="#7BD144" style="color:rgba(123,209,68,1);background:#7BD144;">
            <span></span></div>
        <div class="color_item" name="" original-title="#4CCBCD" style="color:rgba(76,203,205,1);background:#4CCBCD;">
            <span></span></div>
        <div class="color_item" name="" original-title="#4669EA" style="color:rgba(70,105,234,1);background:#4669EA;">
            <span></span></div>
        <div class="color_item" name="" original-title="#E855A4" style="color:rgba(232,85,164,1);background:#E855A4;">
            <span></span></div>
    </div>
    <div class="color_change_title">
        <div class="history_title selected" tit="history">最近使用</div>
        <div class="current_color_title" tit="current_color">当前风格</div>
    </div>
    <div class="history" style="display: block;">
        <div class="history_color">
            <div class="color_item" name="" original-title="#DDD1C1"
                style="color:rgba(221,209,193,1);background:#DDD1C1;"><span></span></div>
            <div class="color_item" name="" original-title="#909C88"
                style="color:rgba(144,156,136,1);background:#909C88;"><span></span></div>
            <div class="color_item" name="" original-title="#5F6958"
                style="color:rgba(95,105,88,1);background:#5F6958;"><span></span></div>
            <div class="color_item" name="" original-title="#4E524B" style="color:rgba(78,82,75,1);background:#4E524B;">
                <span></span></div>
            <div class="color_item" name="" original-title="#4E524C" style="color:rgba(78,82,76,1);background:#4E524C;">
                <span></span></div>
            <div class="color_item" name="" original-title="#637855"
                style="color:rgba(99,120,85,1);background:#637855;"><span></span></div>
            <div class="color_item" name="" original-title="#809C6D"
                style="color:rgba(128,156,109,1);background:#809C6D;"><span></span></div>
            <div class="color_item" name="" original-title="#A7C791"
                style="color:rgba(167,199,145,1);background:#A7C791;"><span></span></div>
            <div class="color_item" name="" original-title="#B0C4A3"
                style="color:rgba(176,196,163,1);background:#B0C4A3;"><span></span></div>
            <div class="color_item" name="" original-title="#A3B398"
                style="color:rgba(163,179,152,1);background:#A3B398;"><span></span></div>
        </div>
    </div>
    <div class="current_color" style="display: none;">
        <div class="current_color_list">
            <div class="color_item" name="" original-title="#729B8D"
                style="color:rgba(114,155,141,1);background:#729B8D;"><span></span></div>
            <div class="color_item" name="" original-title="#EED484"
                style="color:rgba(238,212,132,1);background:#EED484;"><span></span></div>
            <div class="color_item" name="" original-title="#E19873"
                style="color:rgba(225,152,115,1);background:#E19873;"><span></span></div>
            <div class="color_item" name="" original-title="#DFE8D7"
                style="color:rgba(223,232,215,1);background:#DFE8D7;"><span></span></div>
            <div class="color_item" name="" original-title="#C7654E"
                style="color:rgba(199,101,78,1);background:#C7654E;"><span></span></div>
        </div>
    </div>
    <div class="color_options">
        <div class="color_draw po-diagraming-icons" title="吸色"></div>
        <div class="color_edit">
            <div class="hex" style="display: flex;">
                <div class="input_change">Hex<span class="po-diagraming-icons"></span></div>
                <div class="input_box"><input class="input_hex" type="text" maxlength="6"></div>
            </div>
            <div class="rgb" style="display: none;">
                <div class="input_change">RGB<span class="po-diagraming-icons"></span></div>
                <div class="input_box">
                    <input class="input_r" type="text" maxlength="3">
                    <input class="input_g" type="text" maxlength="3">
                    <input class="input_b" type="text" maxlength="3">
                </div>
            </div>
        </div>
        <div class="color_show">
            <span class="color_show_now" style="color: rgb(238, 211, 132);" original-title="当前颜色"></span>
            <span class="color_show_history" style="display: none;"></span>
        </div>
    </div>
    <div class="color_sep"></div>
    <div class="color_more">
        <img class="color_more_bg" src="/v6_editor/static/images/color_picker/more.png"
            data-extentions-extra-ocr-id="6a10518a8b94c65de52b20cfb608c434">
        <span>更多颜色</span>
        <span class="extend-icon po-diagraming-icons"></span>
        <div class="more_panel left">
            <div class="color_panel" style="background: rgb(255, 191, 0);">
                <div class="saturation_white">
                    <div class="saturation_black"></div>
                </div>
                <div class="picker_pin" style="color: rgb(238, 211, 132); left: 72px; top: 7px;"></div>
            </div>
            <div class="hue_horizontal">
                <div class="picker_pin" style="color: rgb(255, 191, 0); left: 20px;"></div>
            </div>
            <div class="alpha_horizontal alpha_bg" style="display:none;">
                <div class="picker_pin" style="color: rgb(0, 0, 0); left: 0px;"></div>
            </div>
        </div>
    </div>

</div>

```