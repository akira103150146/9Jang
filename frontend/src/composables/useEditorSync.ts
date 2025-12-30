import { watch, type Ref, type WatchSource } from 'vue'
import type { Editor } from '@tiptap/core'
import type { TiptapDocument } from '@9jang/shared'

/**
 * 編輯器同步選項
 */
export interface EditorSyncOptions {
  editor: Ref<Editor | null>
  onUpdate?: (json: TiptapDocument) => void
  ignoreExternalUpdates?: boolean
  convertToTiptapFormat?: (value: unknown) => TiptapDocument
  modelValue?: WatchSource<unknown>
}

/**
 * 編輯器同步機制 Composable
 * 使用序列號機制避免時序競爭問題
 */
export function useEditorSync(options: EditorSyncOptions) {
  const {
    editor,
    onUpdate,
    ignoreExternalUpdates = false,
    convertToTiptapFormat,
    modelValue
  } = options

  // 序列號機制：避免時序競爭
  let updateSequence = 0 // 每次編輯器內部更新時遞增
  let lastAppliedSequence = -1 // watch 中最後應用的序列號
  let lastContentJSON = '' // 緩存內容，避免不必要的 JSON.stringify

  /**
   * 處理編輯器內部更新
   */
  const handleEditorUpdate = ({ editor: editorInstance }: { editor: Editor }): void => {
    if (!editorInstance) return

    const json = editorInstance.getJSON() as TiptapDocument
    const newContentJSON = JSON.stringify(json)

    // 檢查內容是否真的改變了
    if (lastContentJSON === newContentJSON) {
      return
    }

    // 遞增序列號，標記這是來自編輯器的更新
    updateSequence++
    const currentSeq = updateSequence

    // 同步更新 lastContentJSON 和 lastAppliedSequence
    lastContentJSON = newContentJSON
    lastAppliedSequence = currentSeq

    // 調用外部更新回調
    if (onUpdate) {
      onUpdate(json)
    }
  }

  /**
   * 監聽外部變更並同步到編輯器
   */
  if (modelValue) {
    watch(
      modelValue,
      (newValue: unknown) => {
        if (!editor.value || ignoreExternalUpdates) {
          return
        }

        const newContent = convertToTiptapFormat
          ? convertToTiptapFormat(newValue)
          : (newValue as TiptapDocument)
        const newContentJSON = JSON.stringify(newContent)

        // 檢查內容是否與緩存相同 - 關鍵！這能防止回滾
        if (lastContentJSON === newContentJSON) {
          return
        }

        // 新增檢查：如果新內容的長度小於緩存，且時間很近，很可能是舊的延遲更新，忽略它
        if (newContentJSON.length < lastContentJSON.length && updateSequence > lastAppliedSequence) {
          return
        }

        // 內容確實不同且不是過期的更新，需要更新編輯器
        lastContentJSON = newContentJSON
        // 不更新 lastAppliedSequence，因為這是外部更新

        editor.value.commands.setContent(newContent, false)
      },
      { deep: true, flush: 'sync' }
    )
  }

  /**
   * 重置同步狀態
   */
  const resetSyncState = (): void => {
    updateSequence = 0
    lastAppliedSequence = -1
    lastContentJSON = ''
  }

  return {
    handleEditorUpdate,
    resetSyncState
  }
}
