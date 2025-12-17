import MarkdownIt from 'markdown-it'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import '../styles/markdown-preview.css'
import { getBackendBaseURL } from '../services/api'

// 初始化 Markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// ===== Source-map（點預覽跳回編輯） =====
// 在 block-level token 上加 data-source-line（1-based）
const addSourceLineAttr = (tokens, idx, attrName = 'data-source-line') => {
  const token = tokens[idx]
  if (!token || !token.map || !Array.isArray(token.map)) return
  const startLine = token.map[0]
  if (!Number.isFinite(startLine)) return
  token.attrSet(attrName, String(startLine + 1))
}

// paragraph / heading / list / blockquote / table 等 block token 的 *_open
const OPEN_TOKEN_TYPES = new Set([
  'paragraph_open',
  'heading_open',
  'blockquote_open',
  'bullet_list_open',
  'ordered_list_open',
  'list_item_open',
  'table_open',
  'thead_open',
  'tbody_open',
  'tr_open',
  'th_open',
  'td_open',
  'hr',
])

const originalRenderToken = md.renderer.renderToken.bind(md.renderer)
md.renderer.renderToken = (tokens, idx, options) => {
  const t = tokens[idx]
  if (t && OPEN_TOKEN_TYPES.has(t.type)) {
    addSourceLineAttr(tokens, idx)
  }
  return originalRenderToken(tokens, idx, options)
}

// fenced code block：用 wrapper 包起來，確保整塊可點且帶行號
const originalFence = md.renderer.rules.fence?.bind(md.renderer.rules) || null
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const startLine = token?.map?.[0]
  const lineAttr = Number.isFinite(startLine) ? ` data-source-line="${startLine + 1}"` : ''

  // 自訂 block：用特定 info string 代表「物件」
  const info = (token.info || '').trim().toLowerCase()
  if (['diagram2d', 'diagram3d', 'circuit'].includes(info)) {
    const label = info === 'diagram2d' ? '2D 圖形' : info === 'diagram3d' ? '3D 圖形' : '電路圖'
    return `<div class="diagram-placeholder"${lineAttr}>[${label}]（點我回到原文編輯）</div>`
  }

  const html = originalFence ? originalFence(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options)
  return `<div${lineAttr}>${html}</div>`
}

// 獲取後端伺服器 URL
const getBackendURL = () => {
  return getBackendBaseURL()
}

// 配置圖片 URL 處理，確保相對路徑轉換為絕對路徑
md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const src = token.attrGet('src')

  // 處理所有圖片 URL，確保是完整的絕對路徑
  if (src) {
    let absoluteSrc = src

    // 如果是相對路徑，轉換為絕對路徑
    if (!src.startsWith('http://') && !src.startsWith('https://')) {
      const backendURL = getBackendURL()

      if (src.startsWith('/media/') || src.startsWith('media/')) {
        absoluteSrc = src.startsWith('/') ? `${backendURL}${src}` : `${backendURL}/${src}`
      } else if (src.startsWith('/')) {
        absoluteSrc = `${backendURL}${src}`
      } else {
        absoluteSrc = `${backendURL}/${src}`
      }

      token.attrSet('src', absoluteSrc)
    } else if (src.includes(':5173')) {
      // 如果 URL 錯誤地包含了前端端口（5173），替換為後端 URL（8000）
      const backendURL = getBackendURL()
      absoluteSrc = src.replace(/https?:\/\/[^:]+:\d+/, backendURL)
      token.attrSet('src', absoluteSrc)
    }
  }

  // 使用默認的圖片渲染邏輯
  return self.renderToken(tokens, idx, options)
}

/**
 * Markdown + LaTeX 渲染 composable
 * @returns {Object} 包含 renderMarkdownWithLatex 函數的對象
 */
export function useMarkdownRenderer() {
  /**
   * 渲染 Markdown + LaTeX 內容
   * @param {string} text - 要渲染的 Markdown 文本
   * @returns {string} 渲染後的 HTML
   */
  const renderMarkdownWithLatex = (text) => {
    if (!text) return ''

    const latexData = []
    let index = 0

    // 先處理 LaTeX 區塊公式 $$...$$，用特殊標記替換
    let processed = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
      const placeholder = `<span data-latex-block="${index}"></span>`
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false
        })
        latexData[index] = rendered
      } catch (e) {
        latexData[index] = `<span class="text-red-500">LaTeX 錯誤: ${e.message}</span>`
      }
      index++
      return placeholder
    })

    // 再處理行內公式 $...$
    processed = processed.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
      // 跳過已經處理過的標記
      if (match.includes('data-latex')) {
        return match
      }
      const placeholder = `<span data-latex-inline="${index}"></span>`
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false
        })
        latexData[index] = rendered
      } catch (e) {
        latexData[index] = `<span class="text-red-500">LaTeX 錯誤: ${e.message}</span>`
      }
      index++
      return placeholder
    })

    // 渲染 Markdown
    let html = md.render(processed)

    // 替換所有 LaTeX 佔位符
    for (let i = 0; i < index; i++) {
      const blockRegex = new RegExp(`<span data-latex-block="${i}"></span>`, 'g')
      const inlineRegex = new RegExp(`<span data-latex-inline="${i}"></span>`, 'g')
      html = html.replace(blockRegex, latexData[i])
      html = html.replace(inlineRegex, latexData[i])
    }

    // 再次處理圖片 URL（確保所有圖片都是絕對路徑，指向後端伺服器）
    const backendURL = getBackendURL()

    // 使用正則表達式替換所有圖片 URL
    html = html.replace(/<img([^>]+)src="([^"]+)"/g, (match, attrs, src) => {
      let absoluteSrc = src

      // 如果已經是絕對路徑
      if (src.startsWith('http://') || src.startsWith('https://')) {
        // 檢查是否錯誤地指向前端伺服器（端口 5173）
        if (src.includes(':5173')) {
          absoluteSrc = src.replace(/https?:\/\/[^:]+:\d+/, backendURL)
          console.log('修正圖片 URL（前端端口）:', src, '->', absoluteSrc)
        } else {
          // 已經是正確的 URL，不處理
          return match
        }
      } else {
        // 轉換相對路徑為絕對路徑
        absoluteSrc = src.startsWith('/') ? `${backendURL}${src}` : `${backendURL}/${src}`
        console.log('轉換圖片 URL（相對路徑）:', src, '->', absoluteSrc)
      }

      return `<img${attrs}src="${absoluteSrc}"`
    })

    return html
  }

  return {
    renderMarkdownWithLatex
    ,
    // 帶 data-source-line 的版本（供預覽點擊跳回編輯）
    renderMarkdownWithLatexAndSourceMap: (text) => renderMarkdownWithLatex(text)
  }
}

