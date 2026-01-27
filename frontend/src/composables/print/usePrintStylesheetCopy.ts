/**
 * usePrintStylesheetCopy
 * 處理樣式表複製邏輯
 */

export interface StylesheetCopyResult {
  styleContent: string
  katexVscodeCSSContent: string
}

export function usePrintStylesheetCopy() {
  /**
   * 複製樣式表到 iframe
   */
  const copyStylesheets = (iframeDoc: Document): StylesheetCopyResult => {
    const stylesheets = Array.from(document.styleSheets)
    let styleContent = ''

    // 首先確保 KaTeX CSS 被載入（必須在最前面）
    const katexCSSLink = iframeDoc.createElement('link')
    katexCSSLink.rel = 'stylesheet'
    katexCSSLink.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
    katexCSSLink.crossOrigin = 'anonymous'
    iframeDoc.head.insertBefore(katexCSSLink, iframeDoc.head.firstChild)

    // 硬編碼 katex-vscode.css 內容
    let katexVscodeCSSContent = `
/* KaTeX 樣式 - 匹配 VSCode Markdown 預覽 */
.katex {
  font-size: 1em;
  color: inherit;
  font-family: KaTeX_Main, "Times New Roman", serif;
  line-height: normal !important;
  text-indent: 0;
  text-rendering: auto;
}

.katex:not(.katex-display) {
  display: inline-block;
  vertical-align: baseline;
  margin: 0 0.1em;
}

.katex-display {
  display: block;
  margin: 1em 0;
  text-align: center;
  overflow-x: auto;
  overflow-y: hidden;
}

.katex-display>.katex {
  display: inline-block;
  text-align: initial;
  margin: 0;
}

/* 分數線樣式 - VSCode 默認樣式 */
.katex .mfrac > .frac-line,
.katex-display .mfrac > .frac-line,
.katex:not(.katex-display) .mfrac > .frac-line,
.katex .frac-line,
.katex-display .frac-line,
.katex:not(.katex-display) .frac-line {
  border-bottom-width: 0.04em !important;
  min-height: 0.04em !important;
  margin-top: 0.188em !important;
  margin-bottom: 0.092em !important;
}

/* 分數容器 - 調整 padding 以平衡空間 */
.katex .mfrac,
.katex-display .mfrac,
.katex:not(.katex-display) .mfrac {
  padding-top: 0.158em !important;
  padding-bottom: 0.082em !important;
}

/* 根號樣式 */
.katex .sqrt {
  font-size: 1em;
}

.katex .sqrt > .vlist-t {
  border-left-width: 0.04em !important;
  border-left-style: solid !important;
  border-left-color: transparent !important;
  display: inline-table !important;
  table-layout: auto !important;
}

.katex .sqrt .vlist-t .vlist-r .vlist .pstrut,
.katex .sqrt .vlist-t .vlist-s {
  min-width: 0 !important;
}

.katex .sqrt .sqrt-sign {
  position: relative !important;
}

.katex .sqrt > .root {
  margin-left: 0.27777778em !important;
  margin-right: -0.55555556em !important;
}

/* 下標樣式 */
.katex .msub {
  position: relative !important;
  display: inline-block !important;
  margin-right: 0.05em !important;
}

.katex .msub .vlist {
  position: relative !important;
  top: 0.3em !important;
  margin-right: 0.05em !important;
  font-size: 0.75em !important;
  vertical-align: baseline !important;
  line-height: normal !important;
}

/* 上標下標組合樣式 */
.katex .msupsub {
  text-align: left !important;
}

.katex .msupsub .sup {
  font-size: 0.85em !important;
  vertical-align: baseline !important;
}

.katex .msupsub .sub {
  font-size: 0.75em !important;
  position: relative !important;
  top: 0.3em !important;
  vertical-align: baseline !important;
}

/* 確保 KaTeX 內部元素的 line-height 正確 */
.katex * {
  color: inherit;
  line-height: normal !important;
}

.katex .vlist-t {
  line-height: normal !important;
}

.katex .vlist-r {
  line-height: normal !important;
}

.katex table {
  border-collapse: separate !important;
  border-spacing: 0;
}

.katex {
  color: #000000;
}
`

    // 複製其他樣式表
    for (const sheet of stylesheets) {
      try {
        // 檢查是否可以訪問 cssRules（避免 SecurityError）
        let canAccessRules = false
        try {
          if (sheet.cssRules) {
            void sheet.cssRules.length
            canAccessRules = true
          }
        } catch (e) {
          canAccessRules = false
        }

        if (sheet.href) {
          // 檢查是否是 katex-vscode.css，嘗試提取其規則
          if (sheet.href.includes('katex-vscode.css') && canAccessRules) {
            try {
              const rules = Array.from(sheet.cssRules || [])
              for (const rule of rules) {
                katexVscodeCSSContent += rule.cssText + '\n'
              }
            } catch (e) {
              // 跳過，使用硬編碼的 katex-vscode.css
            }
          } else {
            // 對於其他外部樣式表，直接添加 link
            const link = iframeDoc.createElement('link')
            link.rel = 'stylesheet'
            link.href = sheet.href
            iframeDoc.head.appendChild(link)
          }
        } else if (canAccessRules) {
          // 內聯樣式表，且可以訪問規則
          try {
            const rules = Array.from(sheet.cssRules || [])
            for (const rule of rules) {
              styleContent += rule.cssText + '\n'
            }
          } catch (e) {
            // 無法訪問規則，跳過
          }
        }
      } catch (e) {
        console.warn('無法複製樣式表:', sheet.href || 'inline', e instanceof Error ? e.message : String(e))
      }
    }

    return { styleContent, katexVscodeCSSContent }
  }

  return {
    copyStylesheets,
  }
}
