/**
 * 代碼片段管理服務
 * 處理用戶自定義代碼片段和內建片段
 */

const STORAGE_KEY = 'richtext_user_snippets_v1'

/**
 * 片段類型
 */
export type SnippetType = 'snippet' | 'latex' | 'diagram2d' | 'diagram3d' | 'circuit'

/**
 * 代碼片段介面
 */
export interface Snippet {
  label: string
  type: SnippetType
  info: string
  insert: string
  cursorOffset: number
}

/**
 * 原始片段數據（可能不完整）
 */
export interface RawSnippet {
  label?: string
  type?: string
  info?: string
  insert?: string
  cursorOffset?: number | string
}

/**
 * 規範化片段數據
 * @param s - 原始片段數據
 * @returns 規範化後的片段或 null
 */
const normalizeSnippet = (s: unknown): Snippet | null => {
  if (!s || typeof s !== 'object') return null
  const raw = s as RawSnippet
  
  const label = typeof raw.label === 'string' ? raw.label.trim() : ''
  if (!label) return null

  const type = typeof raw.type === 'string' ? (raw.type as SnippetType) : 'snippet'
  const info = typeof raw.info === 'string' ? raw.info : ''
  const insert = typeof raw.insert === 'string' ? raw.insert : ''
  const cursorOffset = Number.isFinite(Number(raw.cursorOffset))
    ? Number(raw.cursorOffset)
    : 0

  return {
    label,
    type,
    info,
    insert,
    cursorOffset
  }
}

/**
 * 獲取內建片段
 * @returns 內建片段列表
 */
export const getBuiltinSnippets = (): Snippet[] => {
  /**
   * label: 觸發字串（通常是 /command 或 \command）
   * insert: 實際插入內容
   * cursorOffset: 插入後游標相對於 insert 結尾的偏移（負數往左）
   */
  const rawSnippets: RawSnippet[] = [
    // --- Math (templates) ---
    {
      label: '\\frac',
      type: 'latex',
      info: '分數模板 \\frac{a}{b}',
      insert: '\\frac{}{}',
      cursorOffset: -3
    },
    {
      label: '\\sqrt',
      type: 'latex',
      info: '平方根模板 \\sqrt{x}',
      insert: '\\sqrt{}',
      cursorOffset: -1
    },
    {
      label: '\\sum',
      type: 'latex',
      info: '求和模板 \\sum_{i=1}^{n}',
      insert: '\\sum_{}^{}',
      cursorOffset: -3
    },
    {
      label: '\\int',
      type: 'latex',
      info: '積分模板 \\int_{a}^{b}',
      insert: '\\int_{}^{}',
      cursorOffset: -3
    },
    {
      label: '\\lim',
      type: 'latex',
      info: '極限模板 \\lim_{x\\to\\infty}',
      insert: '\\lim_{}',
      cursorOffset: -1
    },
    {
      label: '\\begin{aligned}',
      type: 'latex',
      info: '對齊環境 aligned',
      insert: '\\begin{aligned}\n\n\\end{aligned}',
      cursorOffset: -13
    },
    {
      label: '\\begin{cases}',
      type: 'latex',
      info: '分段函數 cases',
      insert: '\\begin{cases}\n\n\\end{cases}',
      cursorOffset: -11
    },

    // --- Embeds (fenced JSON) ---
    {
      label: '/diagram2d',
      type: 'diagram2d',
      info: '插入 2D 圖形 JSON 區塊',
      insert:
        '```diagram2d\n{\n  "shapes": [\n    { "type": "point", "x": 0, "y": 0 }\n  ]\n}\n```',
      cursorOffset: -67
    },
    {
      label: '/diagram3d',
      type: 'diagram3d',
      info: '插入 3D 圖形 JSON 區塊',
      insert:
        '```diagram3d\n{\n  "objects": [\n    { "type": "cube", "size": 1 }\n  ]\n}\n```',
      cursorOffset: -60
    },
    {
      label: '/circuit',
      type: 'circuit',
      info: '插入電路 JSON 區塊（elements）',
      insert:
        '```circuit\n{\n  "elements": [\n    { "type": "resistor", "data": { "value": "1k", "position": [120, 120] } },\n    { "type": "capacitor", "data": { "value": "10uF", "position": [260, 120] } }\n  ]\n}\n```',
      cursorOffset: -146
    },

    // --- Slash commands (text helpers) ---
    {
      label: '/latex-block',
      type: 'latex',
      info: '插入區塊公式 $$...$$',
      insert: '$$\n\n$$',
      cursorOffset: -3
    },
    {
      label: '/latex-inline',
      type: 'latex',
      info: '插入行內公式 $...$',
      insert: '$$',
      cursorOffset: -1
    }
  ]

  return rawSnippets.map(normalizeSnippet).filter((s): s is Snippet => s !== null)
}

/**
 * 從 localStorage 載入用戶片段
 * @returns 用戶片段列表
 */
export const loadUserSnippets = (): Snippet[] => {
  try {
    const raw = window?.localStorage?.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeSnippet).filter((s): s is Snippet => s !== null)
  } catch (e) {
    return []
  }
}

/**
 * 保存用戶片段到 localStorage
 * @param snippets - 要保存的片段列表
 * @returns 保存後的片段列表
 */
export const saveUserSnippets = (snippets: unknown[]): Snippet[] => {
  const list = Array.isArray(snippets)
    ? snippets.map(normalizeSnippet).filter((s): s is Snippet => s !== null)
    : []
  window?.localStorage?.setItem(STORAGE_KEY, JSON.stringify(list))
  return list
}

/**
 * 獲取所有片段（內建 + 用戶，用戶片段優先）
 * @returns 所有片段列表
 */
export const getAllSnippets = (): Snippet[] => {
  const builtins = getBuiltinSnippets().map(normalizeSnippet).filter((s): s is Snippet => s !== null)
  const user = loadUserSnippets().map(normalizeSnippet).filter((s): s is Snippet => s !== null)

  // 同 label 時讓使用者覆蓋內建
  const map = new Map<string, Snippet>()
  builtins.forEach((s) => map.set(s.label, s))
  user.forEach((s) => map.set(s.label, s))
  return Array.from(map.values())
}

export const SNIPPET_STORAGE_KEY = STORAGE_KEY
