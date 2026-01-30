/**
 * useChapterSearch
 * 處理章節搜尋和自動完成邏輯
 */

import { ref } from 'vue'
import type { Ref } from 'vue'
import { questionBankAPI } from '@/services/api'
import type { QuestionFormData } from './useQuestionForm'

export interface ChapterSuggestion {
  chapter: string
  count: number
}

export function useChapterSearch(formData: Ref<QuestionFormData>) {
  const chapterSuggestions = ref<ChapterSuggestion[]>([])
  const showChapterSuggestions = ref(false)
  let searchChapterTimeout: ReturnType<typeof setTimeout> | null = null

  // 搜尋章節
  const searchChapters = async () => {
    if (searchChapterTimeout) {
      clearTimeout(searchChapterTimeout)
    }
    
    const query = formData.value.chapter?.trim() || ''
    if (query.length < 1) {
      chapterSuggestions.value = []
      showChapterSuggestions.value = false
      return
    }
    
    searchChapterTimeout = setTimeout(async () => {
      try {
        const response = await questionBankAPI.searchChapters(
          query,
          formData.value.subject || null,
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

  // 選擇章節
  const selectChapter = (chapter: string) => {
    formData.value.chapter = chapter
    showChapterSuggestions.value = false
    chapterSuggestions.value = []
  }

  // 處理章節輸入框失焦
  const handleChapterBlur = () => {
    // 延遲關閉，讓點擊事件有時間觸發
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
