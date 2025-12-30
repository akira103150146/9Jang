import { logger } from '../utils/logger'

/**
 * 列印樣式提取 Composable
 * 負責從編輯器 DOM 中提取計算樣式，確保列印預覽與編輯器顯示一致
 */
export function usePrintStyleExtraction() {
  /**
   * 移除元素的所有 scoped 樣式屬性（data-v-xxx）
   */
  const removeScopedAttributes = (element) => {
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('data-v-')) {
        element.removeAttribute(attr.name)
      }
    })
  }

  /**
   * 從編輯器實際 DOM 提取計算後的樣式
   * 這確保列印預覽與編輯器的實際渲染完全一致
   */
  const extractComputedStylesFromEditor = (editorContainer) => {
    try {
      const styleRules = []
      
      // 提取 KaTeX 基本樣式
      const katexElements = editorContainer.querySelectorAll('.katex')
      if (katexElements.length === 0) {
        return null
      }
      
      // 從第一個 KaTeX 元素提取樣式作為基準
      const sampleElement = katexElements[0]
      const computedStyle = window.getComputedStyle(sampleElement)
      
      // 提取根號元素的計算樣式
      const sqrtElements = editorContainer.querySelectorAll('.katex .sqrt')
      if (sqrtElements.length > 0) {
        const sqrtSample = sqrtElements[0]
        const sqrtComputed = window.getComputedStyle(sqrtSample)
        
        // 提取根號內部的 vlist-t 樣式
        const vlistT = sqrtSample.querySelector('.vlist-t')
        if (vlistT) {
          const vlistTComputed = window.getComputedStyle(vlistT)
          
          // 提取根號符號容器樣式
          const sqrtSign = sqrtSample.querySelector('.sqrt-sign')
          const sqrtSignComputed = sqrtSign ? window.getComputedStyle(sqrtSign) : null
          
          styleRules.push(`
/* 根號主容器 */
.katex .sqrt {
  display: ${sqrtComputed.display} !important;
  position: ${sqrtComputed.position} !important;
  overflow: ${sqrtComputed.overflow} !important;
  font-size: ${sqrtComputed.fontSize} !important;
  line-height: ${sqrtComputed.lineHeight} !important;
  width: ${sqrtComputed.width} !important;
  min-width: ${sqrtComputed.minWidth || 'auto'} !important;
  max-width: ${sqrtComputed.maxWidth || 'none'} !important;
  box-sizing: ${sqrtComputed.boxSizing} !important;
}

/* 根號的 vlist-t */
.katex .sqrt > .vlist-t {
  display: ${vlistTComputed.display} !important;
  position: ${vlistTComputed.position} !important;
  overflow: ${vlistTComputed.overflow} !important;
  border-left-width: ${vlistTComputed.borderLeftWidth} !important;
  border-left-style: ${vlistTComputed.borderLeftStyle} !important;
  border-left-color: ${vlistTComputed.borderLeftColor} !important;
  table-layout: ${vlistTComputed.tableLayout || 'auto'} !important;
  width: ${vlistTComputed.width} !important;
  min-width: ${vlistTComputed.minWidth || '0'} !important;
  max-width: ${vlistTComputed.maxWidth || 'none'} !important;
  box-sizing: ${vlistTComputed.boxSizing || 'border-box'} !important;
}

/* 根號符號容器 */
.katex .sqrt .sqrt-sign {
  position: ${sqrtSignComputed?.position || 'relative'} !important;
  display: ${sqrtSignComputed?.display || 'inline-block'} !important;
  width: ${sqrtSignComputed?.width || 'auto'} !important;
  max-width: ${sqrtSignComputed?.maxWidth || 'none'} !important;
  overflow: ${sqrtSignComputed?.overflow || 'visible'} !important;
}

/* 根號水平線 */
.katex .sqrt .sqrt-sign > span {
  max-width: 100% !important;
  overflow: hidden !important;
}`)
        }
      }
      
      // 提取次方（上標）樣式
      const msupsubElements = editorContainer.querySelectorAll('.katex .msupsub')
      if (msupsubElements.length > 0) {
        const msupsubSample = msupsubElements[0]
        const msupsubComputed = window.getComputedStyle(msupsubSample)
        
        const vlistT = msupsubSample.querySelector('.vlist-t')
        if (vlistT) {
          const vlistTComputed = window.getComputedStyle(vlistT)
          
          styleRules.push(`
/* 次方（上標）樣式 */
.katex .msupsub {
  vertical-align: ${msupsubComputed.verticalAlign} !important;
  display: ${msupsubComputed.display} !important;
  line-height: ${msupsubComputed.lineHeight} !important;
  position: ${msupsubComputed.position} !important;
}

.katex .msupsub .vlist-t {
  display: ${vlistTComputed.display} !important;
  line-height: ${vlistTComputed.lineHeight} !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
}`)
        }
      }
      
      if (styleRules.length === 0) {
        return null
      }
      
      return styleRules.join('\n')
    } catch (error) {
      logger.errorWithContext('usePrintStyleExtraction.extractComputedStylesFromEditor', error)
      return null
    }
  }

  /**
   * 應用列印樣式到答案/詳解區域
   */
  const applyPrintStylesToSection = (section) => {
    removeScopedAttributes(section)
    section.style.setProperty('background', 'white', 'important')
    section.style.setProperty('border', 'none', 'important')
    section.style.setProperty('border-left', 'none', 'important')
    section.style.setProperty('padding', '0.75rem 0', 'important')
    section.style.setProperty('margin-top', '0.75rem', 'important')
    section.style.setProperty('margin-bottom', '0.5rem', 'important')
    section.style.setProperty('break-inside', 'avoid', 'important')
    section.style.setProperty('page-break-inside', 'avoid', 'important')
  }

  /**
   * 應用列印樣式到標籤
   */
  const applyPrintStylesToLabel = (label) => {
    removeScopedAttributes(label)
    label.style.setProperty('font-size', '0.875rem', 'important')
    label.style.setProperty('font-weight', '700', 'important')
    label.style.setProperty('color', 'black', 'important')
    label.style.setProperty('margin-bottom', '0.5rem', 'important')
    label.style.setProperty('display', 'block', 'important')
  }

  /**
   * 應用列印樣式到內容
   */
  const applyPrintStylesToContent = (content) => {
    removeScopedAttributes(content)
    content.style.setProperty('font-size', '0.875rem', 'important')
    content.style.setProperty('color', 'black', 'important')
    content.style.setProperty('line-height', '1.6', 'important')
    content.style.setProperty('margin-top', '0.25rem', 'important')
  }

  return {
    removeScopedAttributes,
    extractComputedStylesFromEditor,
    applyPrintStylesToSection,
    applyPrintStylesToLabel,
    applyPrintStylesToContent
  }
}
