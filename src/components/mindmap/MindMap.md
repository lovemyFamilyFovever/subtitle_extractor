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