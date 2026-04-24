export function useColorConverter() {
    // 命名颜色和复杂格式的兜底解析
    const namedColorToHex = (color) => {
        const temp = document.createElement('div');
        temp.style.color = color;
        temp.style.display = 'none';
        document.body.appendChild(temp);

        const computed = getComputedStyle(temp).color;
        document.body.removeChild(temp);

        // computed 格式为 rgb(r, g, b) 或 rgba(r, g, b, a)
        const match = computed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            const r = parseInt(match[1], 10);
            const g = parseInt(match[2], 10);
            const b = parseInt(match[3], 10);
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
        return '';
    };

    const toHexFormat = (color) => {
        if (!color || typeof color !== 'string') {
            console.warn('Invalid color parameter: expected a non-empty string');
            return '';
        }

        const trimmedColor = color.trim().toLowerCase();

        // 处理 transparent
        if (trimmedColor === 'transparent') {
            return 'transparent';
        }

        // HEX 格式
        if (trimmedColor.startsWith('#')) {
            let hex = trimmedColor.slice(1);
            if (hex.length === 3) {
                hex = hex.split('').map(c => c + c).join('');
            }
            if (/^[0-9a-f]{6}$/.test(hex)) {
                return `#${hex}`;
            }
            // 8位 HEX（带透明度），截取前6位
            if (/^[0-9a-f]{8}$/.test(hex)) {
                return `#${hex.slice(0, 6)}`;
            }
            console.warn('Invalid HEX color format');
            return '';
        }

        // RGB / RGBA 格式
        const rgbMatch = trimmedColor.match(/^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})/);
        if (rgbMatch) {
            const r = parseInt(rgbMatch[1], 10);
            const g = parseInt(rgbMatch[2], 10);
            const b = parseInt(rgbMatch[3], 10);
            if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
                const toHex = (num) => num.toString(16).padStart(2, '0');
                return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
            }
            console.warn('RGB values must be between 0 and 255');
            return '';
        }

        // 命名颜色及其他格式（red, blue, hsl(...) 等）交给浏览器解析
        return namedColorToHex(trimmedColor);
    };

    return toHexFormat;
}
