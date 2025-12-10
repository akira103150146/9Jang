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
  }
}

