export function useColorConverter() {
    /**
    * 将颜色值统一转换为HEX格式
    * @param {string} color - 颜色值，支持RGB格式(rgb(0,0,0)或rgb(0, 0, 0))或HEX格式(#000000或000000)
    * @returns {string} 返回标准的6位HEX颜色值(如#000000)，输入无效时返回空字符串
    */
    const toHexFormat = (color) => {
        // 参数有效性检查
        if (!color || typeof color !== 'string') {
            console.warn('Invalid color parameter: expected a non-empty string');
            return '';
        }

        // 去除首尾空格并转为小写
        const trimmedColor = color.trim().toLowerCase();

        // 检测并处理HEX格式
        if (trimmedColor.startsWith('#')) {
            let hex = trimmedColor.slice(1);
            // 处理3位HEX简写 (#RGB -> #RRGGBB)
            if (hex.length === 3) {
                hex = hex.split('').map(c => c + c).join('');
            }
            // 验证6位HEX格式
            if (/^[0-9a-f]{6}$/.test(hex)) {
                return `#${hex}`;
            }
            console.warn('Invalid HEX color format');
            return '';
        }

        // 检测并处理RGB格式
        const rgbMatch = trimmedColor.match(/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/);
        if (rgbMatch) {
            const r = parseInt(rgbMatch[1], 10);
            const g = parseInt(rgbMatch[2], 10);
            const b = parseInt(rgbMatch[3], 10);

            if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
                const toHex = (num) => {
                    const hex = num.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                };
                return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
            }
            console.warn('RGB values must be between 0 and 255');
            return '';
        }

        console.warn('Unsupported color format. Please use RGB(r,g,b) or HEX(#RRGGBB/#RGB)');
        return '';
    };

    return toHexFormat;
}