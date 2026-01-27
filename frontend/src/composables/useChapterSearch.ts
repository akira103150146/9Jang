/**
 * useChapterSearch Composable
 * 處理章節搜尋邏輯
 */

import { ref } from 'vue'
import { questionBankAPI } from '../services/question/question.api'

export function useChapterSearch(
  formData: { value: { subject: string | number; level: string; chapter: string } }
) {
  const chapterSuggestions = ref<Array<{ chapter: string; count: number }>>([])
  const showChapterSuggestions = ref(false)
  const searchChapterTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

  /**
   * 搜尋章節
   */
  const searchChapters = async () => {
    if (searchChapterTimeout.value) {
      clearTimeout(searchChapterTimeout.value)
    }
    const query = formData.value.chapter?.trim() || ''
    if (query.length < 1) {
      chapterSuggestions.value = []
      showChapterSuggestions.value = false
      return
    }
    searchChapterTimeout.value = setTimeout(async () => {
      try {
        const response = await questionBankAPI.searchChapters(
          query,
          formData.value.subject ? Number(formData.value.subject) : null,
          formData.value.level || null
        )
        chapterSuggestions.value = response.data || []
        showChapterSuggestions.value = chapterSuggestions.value.length > 0
      } catch (error) {
        console.warn('搜尋章節失敗：', error)
        chapterSuggestions.value = []
        showChapterSuggestions.value = false
      }
    }, 300)
  }

  /**
   * 選擇章節
   */
  const selectChapter = (chapter: string) => {
    formData.value.chapter = chapter
    showChapterSuggestions.value = false
    chapterSuggestions.value = []
  }

  /**
   * 處理章節輸入框失焦
   */
  const handleChapterBlur = () => {
    setTimeout(() => {
      showChapterSuggestions.value = false
    }, 200)
  }

  return {
    chapterSuggestions,
    showChapterSuggestions,
    searchChapters,
    selectChapter,
    handleChapterBlur,
  }
}
