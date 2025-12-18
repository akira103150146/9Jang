// extensions/TemplateMention.js
/**
 * CodeMirror 擴展：模板快速引用（@符號觸發）
 */

import { autocompletion, completionKeymap } from '@codemirror/autocomplete'

/**
 * 創建模板快速引用擴展
 * @param {Function} getTemplates - 獲取模板列表的函數
 * @returns {Extension} CodeMirror 擴展
 */
export function templateMention(getTemplates) {
  return autocompletion({
    override: [
      (context) => {
        const word = context.matchBefore(/@\w*/)
        if (!word) return null

        // 檢查是否以 @ 開頭
        if (word.text[0] !== '@') return null

        const query = word.text.slice(1).toLowerCase() // 移除 @ 符號

        // 獲取模板列表
        const templates = getTemplates() || []

        // 模糊搜尋模板
        const matches = templates
          .filter(template => {
            const title = (template.title || '').toLowerCase()
            return title.includes(query)
          })
          .slice(0, 10) // 限制最多顯示 10 個

        if (matches.length === 0) return null

        return {
          from: word.from,
          options: matches.map(template => ({
            label: template.title,
            type: 'template',
            template_id: template.template_id,
            apply: `@${template.title}`, // 插入的文本
            info: `模板 ID: ${template.template_id}` // 提示資訊
          }))
        }
      }
    ]
  })
}
