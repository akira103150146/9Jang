const STORAGE_KEY = 'richtext_user_snippets_v1'

const normalizeSnippet = (s) => {
  if (!s || typeof s !== 'object') return null
  const label = typeof s.label === 'string' ? s.label.trim() : ''
  if (!label) return null

  const type = typeof s.type === 'string' ? s.type : 'snippet'
  const info = typeof s.info === 'string' ? s.info : ''
  const insert = typeof s.insert === 'string' ? s.insert : ''
  const cursorOffset = Number.isFinite(Number(s.cursorOffset)) ? Number(s.cursorOffset) : 0

  return {
    label,
    type,
    info,
    insert,
    cursorOffset,
  }
}

export const getBuiltinSnippets = () => {
  /**
   * label: 觸發字串（通常是 /command 或 \command）
   * insert: 實際插入內容
   * cursorOffset: 插入後游標相對於 insert 結尾的偏移（負數往左）
   */
  return [
    // --- Math (templates) ---
    { label: '\\frac', type: 'latex', info: '分數模板 \\frac{a}{b}', insert: '\\frac{}{}', cursorOffset: -3 },
    { label: '\\sqrt', type: 'latex', info: '平方根模板 \\sqrt{x}', insert: '\\sqrt{}', cursorOffset: -1 },
    { label: '\\sum', type: 'latex', info: '求和模板 \\sum_{i=1}^{n}', insert: '\\sum_{}^{}', cursorOffset: -3 },
    { label: '\\int', type: 'latex', info: '積分模板 \\int_{a}^{b}', insert: '\\int_{}^{}', cursorOffset: -3 },
    { label: '\\lim', type: 'latex', info: '極限模板 \\lim_{x\\to\\infty}', insert: '\\lim_{}', cursorOffset: -1 },
    { label: '\\begin{aligned}', type: 'latex', info: '對齊環境 aligned', insert: '\\begin{aligned}\n\n\\end{aligned}', cursorOffset: -13 },
    { label: '\\begin{cases}', type: 'latex', info: '分段函數 cases', insert: '\\begin{cases}\n\n\\end{cases}', cursorOffset: -11 },

    // --- Embeds (fenced JSON) ---
    { label: '/diagram2d', type: 'diagram2d', info: '插入 2D 圖形 JSON 區塊', insert: '```diagram2d\n{\n  "shapes": [\n    { "type": "point", "x": 0, "y": 0 }\n  ]\n}\n```', cursorOffset: -67 },
    { label: '/diagram3d', type: 'diagram3d', info: '插入 3D 圖形 JSON 區塊', insert: '```diagram3d\n{\n  "objects": [\n    { "type": "cube", "size": 1 }\n  ]\n}\n```', cursorOffset: -60 },
    { label: '/circuit', type: 'circuit', info: '插入電路 JSON 區塊（elements）', insert: '```circuit\n{\n  "elements": [\n    { "type": "resistor", "data": { "value": "1k", "position": [120, 120] } },\n    { "type": "capacitor", "data": { "value": "10uF", "position": [260, 120] } }\n  ]\n}\n```', cursorOffset: -146 },

    // --- Slash commands (text helpers) ---
    { label: '/latex-block', type: 'latex', info: '插入區塊公式 $$...$$', insert: '$$\n\n$$', cursorOffset: -3 },
    { label: '/latex-inline', type: 'latex', info: '插入行內公式 $...$', insert: '$$', cursorOffset: -1 },
  ]
}

export const loadUserSnippets = () => {
  try {
    const raw = window?.localStorage?.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeSnippet).filter(Boolean)
  } catch (e) {
    return []
  }
}

export const saveUserSnippets = (snippets) => {
  const list = Array.isArray(snippets) ? snippets.map(normalizeSnippet).filter(Boolean) : []
  window?.localStorage?.setItem(STORAGE_KEY, JSON.stringify(list))
  return list
}

export const getAllSnippets = () => {
  const builtins = getBuiltinSnippets().map(normalizeSnippet).filter(Boolean)
  const user = loadUserSnippets().map(normalizeSnippet).filter(Boolean)

  // 同 label 時讓使用者覆蓋內建
  const map = new Map()
  builtins.forEach((s) => map.set(s.label, s))
  user.forEach((s) => map.set(s.label, s))
  return Array.from(map.values())
}

export const SNIPPET_STORAGE_KEY = STORAGE_KEY
