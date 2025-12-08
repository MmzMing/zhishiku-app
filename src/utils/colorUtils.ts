/**
 * 颜色工具函数
 * 用于处理颜色转换、生成色阶、对比度检查等
 */

/**
 * 十六进制颜色转HSL
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // 移除#号
  hex = hex.replace('#', '')
  
  // 解析RGB
  let r: number, g: number, b: number
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16)
    g = parseInt(hex[1] + hex[1], 16)
    b = parseInt(hex[2] + hex[2], 16)
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16)
    g = parseInt(hex.substring(2, 4), 16)
    b = parseInt(hex.substring(4, 6), 16)
  } else {
    throw new Error('Invalid hex color')
  }
  
  // 转为0-1范围
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

/**
 * HSL转十六进制颜色
 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  
  let r = 0, g = 0, b = 0
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x
  }
  
  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/**
 * 生成颜色色阶
 */
export function generateColorScale(
  baseColor: string,
  steps: number = 10,
  darkMode: boolean = false
): string[] {
  const { h, s } = hexToHsl(baseColor)
  const colors: string[] = []
  
  // 根据模式调整生成策略
  if (darkMode) {
    // 暗色模式：从深到浅
    for (let i = 0; i < steps; i++) {
      const lightness = 10 + (i * (90 / steps))
      const saturation = Math.max(20, s - (i * (s - 20) / steps))
      colors.push(hslToHex(h, saturation, lightness))
    }
  } else {
    // 亮色模式：从浅到深
    for (let i = 0; i < steps; i++) {
      const lightness = 95 - (i * (85 / steps))
      const saturation = s + (i * (100 - s) / steps)
      colors.push(hslToHex(h, saturation, lightness))
    }
  }
  
  return colors
}

/**
 * 计算相对亮度
 */
function getLuminance(color: string): number {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255
  
  const sRGB = [r, g, b].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
}

/**
 * 检查颜色对比度
 */
export function checkContrastRatio(
  foreground: string,
  background: string
): number {
  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 获取可访问的文本颜色
 */
export function getAccessibleTextColor(
  backgroundColor: string
): '#000000' | '#ffffff' {
  const whiteContrast = checkContrastRatio('#ffffff', backgroundColor)
  // WCAG AA标准要求4.5:1
  return whiteContrast >= 4.5 ? '#ffffff' : '#000000'
}

/**
 * 混合两种颜色
 */
export function mixColors(color1: string, color2: string, weight: number = 0.5): string {
  const hex1 = color1.replace('#', '')
  const hex2 = color2.replace('#', '')
  
  const r1 = parseInt(hex1.substring(0, 2), 16)
  const g1 = parseInt(hex1.substring(2, 4), 16)
  const b1 = parseInt(hex1.substring(4, 6), 16)
  
  const r2 = parseInt(hex2.substring(0, 2), 16)
  const g2 = parseInt(hex2.substring(2, 4), 16)
  const b2 = parseInt(hex2.substring(4, 6), 16)
  
  const r = Math.round(r1 * weight + r2 * (1 - weight))
  const g = Math.round(g1 * weight + g2 * (1 - weight))
  const b = Math.round(b1 * weight + b2 * (1 - weight))
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/**
 * 调整颜色亮度
 */
export function adjustBrightness(color: string, amount: number): string {
  const { h, s, l } = hexToHsl(color)
  const newL = Math.max(0, Math.min(100, l + amount))
  return hslToHex(h, s, newL)
}
