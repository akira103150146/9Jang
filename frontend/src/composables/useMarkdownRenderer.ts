import MarkdownIt from 'markdown-it'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import '../styles/markdown-preview.css'
import { getBackendBaseURL } from '../services/api'
import type Token from 'markdown-it/lib/token'
import type Renderer from 'markdown-it/lib/renderer'

// 初始化 Markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// ===== Source-map（點預覽跳回編輯） =====
// 在 block-level token 上加 data-source-line（1-based）
const addSourceLineAttr = (tokens: Token[], idx: number, attrName = 'data-source-line'): void => {
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
  'hr'
])

const originalRenderToken = md.renderer.renderToken.bind(md.renderer)
md.renderer.renderToken = (tokens: Token[], idx: number, options: unknown): string => {
  const t = tokens[idx]
  if (t && OPEN_TOKEN_TYPES.has(t.type)) {
    addSourceLineAttr(tokens, idx)
  }
  return originalRenderToken(tokens, idx, options)
}

// fenced code block：用 wrapper 包起來，確保整塊可點且帶行號
const originalFence = md.renderer.rules.fence?.bind(md.renderer.rules) || null
md.renderer.rules.fence = (
  tokens: Token[],
  idx: number,
  options: unknown,
  env: Record<string, unknown>,
  self: Renderer
): string => {
  const token = tokens[idx]
  const startLine = token?.map?.[0]
  const lineAttr = Number.isFinite(startLine) ? ` data-source-line="${startLine! + 1}"` : ''
  const embedPos = (env?.__embedPos as Record<number, number>)?.[idx]
  const posAttr = Number.isFinite(embedPos) ? ` data-source-pos="${embedPos}"` : ''
  const embedLen = (env?.__embedLen as Record<number, number>)?.[idx]
  const lenAttr = Number.isFinite(embedLen) ? ` data-source-len="${embedLen}"` : ''

  // 自訂 block：用特定 info string 代表「物件」
  const info = ((token.info || '') as string).trim().toLowerCase()
  if (['diagram2d', 'diagram3d', 'circuit'].includes(info)) {
    const label = info === 'diagram2d' ? '2D 圖形' : info === 'diagram3d' ? '3D 圖形' : '電路圖'
    // 把 fenced block 內容帶給前端預覽做互動渲染（用 encodeURIComponent 避免 attribute 壞掉）
    const raw = (token.content || '') as string
    const encoded = encodeURIComponent(raw)
    return `<div class="rt-embed"${lineAttr}${posAttr}${lenAttr} data-embed-type="${info}" data-embed="${encoded}">[${label}]</div>`
  }

  const html = originalFence ? originalFence(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options)
  return `<div${lineAttr}${posAttr}${lenAttr}>${html}</div>`
}

// 獲取後端伺服器 URL
const getBackendURL = (): string => {
  return getBackendBaseURL()
}

// 配置圖片 URL 處理，確保相對路徑轉換為絕對路徑
md.renderer.rules.image = (tokens: Token[], idx: number, options: unknown, env: unknown, self: Renderer): string => {
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
 */
export function useMarkdownRenderer() {
  /**
   * 渲染 Markdown + LaTeX 內容
   */
  const renderMarkdownWithLatex = (text: string | null | undefined): string => {
    if (!text) return ''

    // 一些輸入法/複製來源會把 $ 變成全形或混入智慧引號，先做正規化避免 regex 漏抓
    const normalizeText = (s: string | null | undefined): string => {
      if (!s) return ''
      return String(s)
        .replace(/[＄﹩]/g, '$')
        .replace(/[""]/g, '"')
    }

    text = normalizeText(text)

    // 常見誤貼：`$$∴$...$`（把「因此」行內公式前面多打一個 $$）
    // 為避免誤傷合法的 `$$...$$` 區塊公式，這裡只針對「行首 $$ + 緊接 ∴ + 緊接 $」的特定樣式修正
    const fixLeadingDoubledDollarBeforeThereforeInline = (s: string): string => {
      return String(s)
        .split('\n')
        .map((line) => {
          // 只修正：行首 $$∴$...$（允許空白）
          if (!/^\s*\$\$\s*∴\s*\$/.test(line)) return line
          // 若同行其實有 closing $$，表示是合法 block（不動）
          if (line.indexOf('$$', line.indexOf('$$') + 2) >= 0) return line
          // 移除行首第一個 $$
          return line.replace(/^\s*\$\$\s*/, (m) => m.replace('$$', ''))
        })
        .join('\n')
    }
    text = fixLeadingDoubledDollarBeforeThereforeInline(text)

    // 先做一份「元件級」來源行號對照（1-based）
    // - latex: 在 regex replace 時直接把 data-source-line 帶入 placeholder
    // - images: 先掃描 markdown 內的 ![]()，再在最後替換 <img> 時依序加上 data-source-line
    const computeLineNumberFromIndex = (source: string, idx: number | null | undefined): number => {
      if (!source || idx == null || idx < 0) return 1
      // 計算 idx 之前出現的換行數 + 1
      let line = 1
      for (let i = 0; i < idx && i < source.length; i++) {
        if (source[i] === '\n') line++
      }
      return line
    }

    const imageLineNumbers: number[] = []
    const imagePositions: number[] = []
    const imageRegex = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
    let imgMatch: RegExpExecArray | null
    while ((imgMatch = imageRegex.exec(text)) !== null) {
      imageLineNumbers.push(computeLineNumberFromIndex(text, imgMatch.index))
      imagePositions.push(imgMatch.index)
    }

    const latexData: string[] = []
    let index = 0

    // 先處理 LaTeX 區塊公式 $$...$$，用特殊標記替換
    let processed = text.replace(/\$\$([\s\S]*?)\$\$/g, (match: string, formula: string, offset: number): string => {
      const line = computeLineNumberFromIndex(text, offset)
      // 區塊公式內若混用行內 $...$，KaTeX 會失敗；這裡先把內層 $...$ 的外層 $ 去掉
      // 例：$$∴$\\sin x$$$$  =>  ∴\\sin x
      const sanitized = String(formula || '').replace(/\$([^\$\n]+?)\$/g, '$1')
      const encodedLatex = encodeURIComponent(sanitized.trim())
      const placeholder = `<span data-latex-block="${index}" data-source-line="${line}" data-source-pos="${offset}" data-source-len="${match.length}" data-math-delim="$$" data-math-raw="${encodedLatex}"></span>`
      try {
        const rendered = katex.renderToString(sanitized.trim(), {
          displayMode: true,
          throwOnError: false
        })
        latexData[index] = rendered
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e)
        latexData[index] = `<span class="text-red-500">LaTeX 錯誤: ${errorMessage}</span>`
      }
      index++
      return placeholder
    })

    // 再處理行內公式 $...$
    processed = processed.replace(/\$([^\$\n]+?)\$/g, (match: string, formula: string, offset: number): string => {
      // 跳過已經處理過的標記
      if (match.includes('data-latex')) {
        return match
      }
      const line = computeLineNumberFromIndex(text, offset)
      const encodedLatex = encodeURIComponent(formula.trim())
      const placeholder = `<span data-latex-inline="${index}" data-source-line="${line}" data-source-pos="${offset}" data-source-len="${match.length}" data-math-delim="$" data-math-raw="${encodedLatex}"></span>`
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false
        })
        latexData[index] = rendered
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e)
        latexData[index] = `<span class="text-red-500">LaTeX 錯誤: ${errorMessage}</span>`
      }
      index++
      return placeholder
    })

    // 重新掃描 processed 的 fenced block 位置（比對 md.render 用的文字）
    const embedList: number[] = []
    const embedLenList: number[] = []
    const fenceRegex = /```(diagram2d|diagram3d|circuit)[^\n]*\n[\s\S]*?\n```/gi
    let fm: RegExpExecArray | null
    while ((fm = fenceRegex.exec(processed)) !== null) {
      embedList.push(fm.index)
      embedLenList.push(fm[0]?.length || 0)
    }

    // 渲染 Markdown（帶 env 讓 fence rule 取到 pos）
    // 注意：markdown-it 的 fence rule idx 是 token index；我們在 RichTextPreview 會以 data-embed-* 找到元素，所以 pos 只要落在 fenced 起始即可
    // 這裡用「遇到 fence token 就依序取 embedList」的方式塞進 env.__embedPos（以 token idx 當 key）
    const env: { __embedPos: Record<number, number>; __embedLen: Record<number, number> } = {
      __embedPos: {},
      __embedLen: {}
    }
    let embedCursor = 0
    const proxyFence = md.renderer.rules.fence
    // 暫時包一層讓我們能以 token idx 記錄 pos
    md.renderer.rules.fence = (
      tokens: Token[],
      idx: number,
      options: unknown,
      e: Record<string, unknown>,
      self: Renderer
    ): string => {
      if (embedCursor < embedList.length) {
        env.__embedPos[idx] = embedList[embedCursor]
        env.__embedLen[idx] = embedLenList[embedCursor]
      }
      // 只有 diagram2d/diagram3d/circuit 才前進游標
      const info = ((tokens[idx]?.info || '') as string).trim().toLowerCase()
      if (['diagram2d', 'diagram3d', 'circuit'].includes(info)) {
        embedCursor++
      }
      return proxyFence!(tokens, idx, options, env, self)
    }

    let html = md.render(processed, env)
    md.renderer.rules.fence = proxyFence

    // 替換所有 LaTeX 佔位符（保留 data-source-line，包一層讓點擊命中）
    for (let i = 0; i < index; i++) {
      const blockRegex = new RegExp(`<span data-latex-block="${i}"></span>`, 'g')
      const inlineRegex = new RegExp(`<span data-latex-inline="${i}"></span>`, 'g')
      // 舊 placeholder（無 source line）的後備替換
      html = html.replace(blockRegex, `<div>${latexData[i]}</div>`)
      html = html.replace(inlineRegex, `<span>${latexData[i]}</span>`)
    }

    // 新 placeholder（有 data-source-line / data-source-pos）
    html = html.replace(
      /<span data-latex-block="(\d+)" data-source-line="(\d+)" data-source-pos="(\d+)" data-source-len="(\d+)" data-math-delim="(\$\$)" data-math-raw="([^"]*)"><\/span>/g,
      (m: string, idxStr: string, lineStr: string, posStr: string, lenStr: string, delim: string, raw: string): string => {
        const i = Number(idxStr)
        const line = Number(lineStr)
        const pos = Number(posStr)
        const len = Number(lenStr)
        const inner = latexData[i] || ''
        return `<div data-source-line="${line}" data-source-pos="${pos}" data-source-len="${len}" data-math-delim="${delim}" data-math-raw="${raw}">${inner}</div>`
      }
    )
    html = html.replace(
      /<span data-latex-inline="(\d+)" data-source-line="(\d+)" data-source-pos="(\d+)" data-source-len="(\d+)" data-math-delim="(\$)" data-math-raw="([^"]*)"><\/span>/g,
      (m: string, idxStr: string, lineStr: string, posStr: string, lenStr: string, delim: string, raw: string): string => {
        const i = Number(idxStr)
        const line = Number(lineStr)
        const pos = Number(posStr)
        const len = Number(lenStr)
        const inner = latexData[i] || ''
        return `<span data-source-line="${line}" data-source-pos="${pos}" data-source-len="${len}" data-math-delim="${delim}" data-math-raw="${raw}">${inner}</span>`
      }
    )

    // 若 placeholder 被 markdown-it 轉義成純文字（&lt;span ...&gt;），用「先整段抓起來再抽 attrs」的方式穩定還原
    const parseAttr = (s: string, name: string): string | null => {
      // 允許：name="v" / name=&quot;v&quot; / name="v" / name=v（少見）
      const m = s.match(new RegExp(`${name}=(?:"|&quot;|"|")?([^"”\\s&>]+)`, 'i'))
      return m ? m[1] : null
    }
    const replaceEscaped = (kind: 'block' | 'inline'): void => {
      const re =
        kind === 'block'
          ? /&lt;span[^&]*data-latex-block[\s\S]*?&gt;&lt;\/span&gt;/g
          : /&lt;span[^&]*data-latex-inline[\s\S]*?&gt;&lt;\/span&gt;/g
      html = html.replace(re, (segment: string): string => {
        const idxRaw = parseAttr(segment, kind === 'block' ? 'data-latex-block' : 'data-latex-inline')
        const lineRaw = parseAttr(segment, 'data-source-line')
        const posRaw = parseAttr(segment, 'data-source-pos')
        const lenRaw = parseAttr(segment, 'data-source-len')
        const delimRaw = parseAttr(segment, 'data-math-delim')
        const mathRaw = parseAttr(segment, 'data-math-raw')

        const i = Number(idxRaw)
        const line = Number(lineRaw)
        const pos = Number(posRaw)
        const len = Number(lenRaw)
        const inner = Number.isFinite(i) ? latexData[i] || '' : ''

        const delim = delimRaw != null ? String(delimRaw).replace(/&quot;|"|"/g, '"') : kind === 'block' ? '$$' : '$'
        const raw = mathRaw != null ? String(mathRaw) : ''

        // 如果 idx 抓不到，就原樣返回（避免誤傷）
        if (!Number.isFinite(i)) return segment

        const common = [
          Number.isFinite(line) ? `data-source-line="${line}"` : null,
          Number.isFinite(pos) ? `data-source-pos="${pos}"` : null,
          Number.isFinite(len) ? `data-source-len="${len}"` : null,
          delim ? `data-math-delim="${delim}"` : null,
          raw ? `data-math-raw="${raw}"` : null
        ]
          .filter((item): item is string => item !== null)
          .join(' ')

        return kind === 'block' ? `<div ${common}>${inner}</div>` : `<span ${common}>${inner}</span>`
      })
    }
    replaceEscaped('block')
    replaceEscaped('inline')

    // 再次處理圖片 URL（確保所有圖片都是絕對路徑，指向後端伺服器）
    const backendURL = getBackendURL()

    // 使用正則表達式替換所有圖片 URL
    let imageIdx = 0
    html = html.replace(/<img([^>]+)src="([^"]+)"/g, (match: string, attrs: string, src: string): string => {
      let absoluteSrc = src

      // 如果已經是絕對路徑
      if (src.startsWith('http://') || src.startsWith('https://')) {
        // 檢查是否錯誤地指向前端伺服器（端口 5173）
        if (src.includes(':5173')) {
          absoluteSrc = src.replace(/https?:\/\/[^:]+:\d+/, backendURL)
          console.log('修正圖片 URL（前端端口）:', src, '->', absoluteSrc)
        } else {
          // 已經是正確的 URL，不處理
          // 但仍要補上 data-source-line
          const line = imageLineNumbers[imageIdx++] || 1
          const pos = imagePositions[imageIdx - 1]
          const posAttr = Number.isFinite(pos) ? ` data-source-pos="${pos}"` : ''
          return `<img${attrs} data-source-line="${line}"${posAttr} src="${absoluteSrc}"`
        }
      } else {
        // 轉換相對路徑為絕對路徑
        absoluteSrc = src.startsWith('/') ? `${backendURL}${src}` : `${backendURL}/${src}`
        console.log('轉換圖片 URL（相對路徑）:', src, '->', absoluteSrc)
      }

      const line = imageLineNumbers[imageIdx++] || 1
      const pos = imagePositions[imageIdx - 1]
      const posAttr = Number.isFinite(pos) ? ` data-source-pos="${pos}"` : ''
      return `<img${attrs} data-source-line="${line}"${posAttr} src="${absoluteSrc}"`
    })

    return html
  }

  return {
    renderMarkdownWithLatex,
    // 帶 data-source-line 的版本（供預覽點擊跳回編輯）
    renderMarkdownWithLatexAndSourceMap: (text: string | null | undefined): string => renderMarkdownWithLatex(text)
  }
}
