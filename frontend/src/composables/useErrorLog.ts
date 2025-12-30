import { ref, type Ref } from 'vue'
import { errorLogAPI, errorLogImageAPI, questionBankAPI } from '../services/api'
import { compressImageFile } from '../utils/imageCompress'

/**
 * 錯題記錄類型
 */
export interface ErrorLog {
  error_log_id: number
  student: number
  question: number
  error_count: number
  review_status: 'New' | 'Reviewing' | 'Mastered'
  question_chapter?: string
  question_subject?: string
  question_level?: string
  question_content?: string
  images?: Array<{
    image_id: number
    image_path: string
    caption?: string
  }>
  [key: string]: unknown
}

/**
 * 錯題表單數據類型
 */
export interface ErrorFormData {
  useExistingQuestion: boolean
  selectedQuestionId: string
  subject: string
  level: string
  chapter: string
  content: unknown // Tiptap JSON
  correct_answer: unknown // Tiptap JSON
  difficulty: number
  tag_ids: number[]
  error_count: number
  review_status: 'New' | 'Reviewing' | 'Mastered'
}

/**
 * 本地圖片類型
 */
export interface LocalImage {
  file: File
  url: string
}

/**
 * 章節建議類型
 */
export interface ChapterSuggestion {
  chapter: string
  count: number
  relevance?: number
  [key: string]: unknown
}

/**
 * 錯題管理 Composable
 */
export function useErrorLog(
  studentId: number,
  questions: Ref<Array<{ question_id: number; [key: string]: unknown }>>,
  hashtags: Ref<Array<{ tag_id: number; tag_name: string; [key: string]: unknown }>>,
  onErrorLogsUpdated?: () => void
) {
  const errorLogs = ref<ErrorLog[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const uploadingImages = ref(false)
  const showAddErrorModal = ref(false)
  const showDetailModal = ref(false)
  const selectedError = ref<ErrorLog | null>(null)
  const questionDetail = ref<unknown>(null)
  const localImages = ref<LocalImage[]>([])
  const chapterSuggestions = ref<ChapterSuggestion[]>([])
  const showChapterSuggestions = ref(false)
  const searchChapterTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
  const errorFormData = ref<ErrorFormData>({
    useExistingQuestion: true,
    selectedQuestionId: '',
    subject: '',
    level: '',
    chapter: '',
    content: '',
    correct_answer: '',
    difficulty: 1,
    tag_ids: [],
    error_count: 1,
    review_status: 'New'
  })

  /**
   * 獲取錯題列表
   */
  const fetchErrorLogs = async (): Promise<void> => {
    loading.value = true
    try {
      const response = await errorLogAPI.getAll(studentId)
      const data = response.data.results || response.data
      errorLogs.value = Array.isArray(data) ? data : []
    } catch (error) {
      console.error('獲取錯題記錄失敗：', error)
      errorLogs.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 打開新增錯題模態框
   */
  const openAddErrorModal = (): void => {
    errorFormData.value = {
      useExistingQuestion: true,
      selectedQuestionId: '',
      subject: '',
      level: '',
      chapter: '',
      content: '',
      correct_answer: '',
      difficulty: 1,
      tag_ids: [],
      error_count: 1,
      review_status: 'New'
    }
    // 清理本地圖片
    localImages.value.forEach((x) => x?.url && URL.revokeObjectURL(x.url))
    localImages.value = []
    showAddErrorModal.value = true
  }

  /**
   * 關閉新增錯題模態框
   */
  const closeAddErrorModal = (): void => {
    showAddErrorModal.value = false
    // 清理本地圖片
    localImages.value.forEach((x) => x?.url && URL.revokeObjectURL(x.url))
    localImages.value = []
  }

  /**
   * 添加錯題相關標籤
   */
  const addErrorTags = (): void => {
    const errorTagNames = ['錯題', '需複習', '易錯題']
    errorTagNames.forEach(tagName => {
      const tag = hashtags.value.find(t => 
        t.tag_name.toLowerCase() === tagName.toLowerCase()
      )
      if (tag && !errorFormData.value.tag_ids.includes(tag.tag_id)) {
        errorFormData.value.tag_ids.push(tag.tag_id)
      }
    })
  }

  /**
   * 保存錯題記錄
   */
  const saveErrorLog = async (): Promise<void> => {
    saving.value = true
    try {
      let questionId: number | null = null
      
      // 如果選擇了題庫中的題目，直接使用
      if (errorFormData.value.useExistingQuestion && errorFormData.value.selectedQuestionId) {
        questionId = parseInt(errorFormData.value.selectedQuestionId)
        
        // 更新題目的標籤（添加錯題相關標籤）
        if (errorFormData.value.tag_ids.length > 0) {
          try {
            const question = questions.value.find(q => q.question_id === questionId)
            if (question) {
              const existingTagIds = (question.tag_ids as number[]) || []
              const allTagIds = [...new Set([...existingTagIds, ...errorFormData.value.tag_ids])]
              
              await questionBankAPI.update(questionId, {
                ...question,
                tag_ids_input: allTagIds
              } as never)
            }
          } catch (error) {
            console.warn('更新題目標籤失敗：', error)
          }
        }
      } else {
        // 如果沒有選擇題目，先創建新題目
        // 自動添加錯題相關標籤
        addErrorTags()
        
        const questionData = {
          subject: errorFormData.value.subject,
          level: errorFormData.value.level,
          chapter: errorFormData.value.chapter,
          content: errorFormData.value.content,
          correct_answer: errorFormData.value.correct_answer,
          difficulty: errorFormData.value.difficulty,
          tag_ids_input: errorFormData.value.tag_ids
        }
        
        const questionResponse = await questionBankAPI.create(questionData as never)
        questionId = questionResponse.data.question_id
        
        // 更新題目列表
        questions.value.push(questionResponse.data)
      }
      
      // 創建錯題記錄
      const createdError = await errorLogAPI.create({
        student: studentId,
        question: questionId,
        error_count: errorFormData.value.error_count,
        review_status: errorFormData.value.review_status
      } as never)

      // 上傳錯題圖片（多張）
      const errorLogId = createdError?.data?.error_log_id
      if (errorLogId && localImages.value.length > 0) {
        uploadingImages.value = true
        const formData = new FormData()
        for (const item of localImages.value) {
          const compressed = await compressImageFile(item.file)
          formData.append('images', compressed)
        }
        await errorLogAPI.uploadImages(errorLogId, formData)
        uploadingImages.value = false
        localImages.value.forEach((x) => x?.url && URL.revokeObjectURL(x.url))
        localImages.value = []
      }
      
      closeAddErrorModal()
      await fetchErrorLogs()
      if (onErrorLogsUpdated) {
        onErrorLogsUpdated()
      }
    } catch (error) {
      console.error('儲存錯題記錄失敗：', error)
      if ((error as { response?: { data?: unknown } }).response?.data) {
        const errorData = (error as { response: { data: unknown } }).response.data
        const errorMsg = typeof errorData === 'string' 
          ? errorData 
          : JSON.stringify(errorData)
        alert(`儲存失敗：${errorMsg}`)
      } else {
        alert('儲存失敗，請稍後再試')
      }
    } finally {
      saving.value = false
      uploadingImages.value = false
    }
  }

  /**
   * 查看錯題詳情
   */
  const viewErrorDetail = async (errorLog: ErrorLog): Promise<void> => {
    selectedError.value = errorLog
    try {
      const response = await questionBankAPI.getById(errorLog.question)
      questionDetail.value = response.data
      showDetailModal.value = true
    } catch (error) {
      console.error('獲取題目詳情失敗：', error)
      alert('無法載入題目詳情')
    }
  }

  /**
   * 關閉錯題詳情模態框
   */
  const closeErrorDetail = (): void => {
    showDetailModal.value = false
    selectedError.value = null
    questionDetail.value = null
  }

  /**
   * 更新錯題狀態
   */
  const updateErrorStatus = async (errorLog: ErrorLog): Promise<void> => {
    const statuses: Array<'New' | 'Reviewing' | 'Mastered'> = ['New', 'Reviewing', 'Mastered']
    const currentIndex = statuses.indexOf(errorLog.review_status)
    const nextStatus = statuses[(currentIndex + 1) % statuses.length]
    
    try {
      await errorLogAPI.update(errorLog.error_log_id, {
        ...errorLog,
        review_status: nextStatus
      } as never)
      await fetchErrorLogs()
      if (selectedError.value && selectedError.value.error_log_id === errorLog.error_log_id) {
        selectedError.value.review_status = nextStatus
      }
    } catch (error) {
      console.error('更新狀態失敗:', error)
      alert('更新狀態失敗，請稍後再試')
    }
  }

  /**
   * 增加錯誤次數
   */
  const incrementErrorCount = async (errorLog: ErrorLog): Promise<void> => {
    try {
      await errorLogAPI.update(errorLog.error_log_id, {
        ...errorLog,
        error_count: errorLog.error_count + 1,
        review_status: errorLog.review_status === 'Mastered' ? 'Reviewing' : errorLog.review_status
      } as never)
      await fetchErrorLogs()
    } catch (error) {
      console.error('增加錯誤次數失敗:', error)
      alert('操作失敗，請稍後再試')
    }
  }

  /**
   * 刪除錯題記錄
   */
  const deleteErrorLog = async (id: number, chapter: string): Promise<void> => {
    if (!confirm(`確定要刪除錯題記錄「${chapter}」嗎？`)) {
      return
    }

    try {
      await errorLogAPI.delete(id)
      await fetchErrorLogs()
      if (showDetailModal.value) {
        closeErrorDetail()
      }
    } catch (error) {
      console.error('刪除失敗:', error)
      alert('刪除失敗，請稍後再試')
    }
  }

  /**
   * 刪除錯題圖片
   */
  const deleteErrorImage = async (img: { image_id: number; [key: string]: unknown }): Promise<void> => {
    if (!confirm('確定要刪除這張錯題照片嗎？')) return
    try {
      await errorLogImageAPI.delete(img.image_id)
      if (selectedError.value?.images) {
        selectedError.value.images = (selectedError.value.images as Array<{ image_id: number; [key: string]: unknown }>).filter((x) => x.image_id !== img.image_id)
      }
      await fetchErrorLogs()
    } catch (e) {
      console.error('刪除錯題照片失敗:', e)
      alert('刪除錯題照片失敗，請稍後再試')
    }
  }

  /**
   * 匯入錯題到題庫
   */
  const importSelectedErrorToQuestionBank = async (): Promise<void> => {
    if (!selectedError.value?.error_log_id) return
    try {
      await errorLogAPI.importToQuestionBank(selectedError.value.error_log_id)
      alert('已匯入題庫（或已存在）')
    } catch (e) {
      console.error('匯入題庫失敗:', e)
      alert('匯入題庫失敗，請稍後再試')
    }
  }

  /**
   * 處理圖片選擇
   */
  const onPickImages = (evt: Event): void => {
    const target = evt.target as HTMLInputElement
    const files = Array.from(target.files || [])
    target.value = ''
    if (files.length === 0) return
    for (const f of files) {
      localImages.value.push({ file: f, url: URL.createObjectURL(f) })
    }
  }

  /**
   * 移除本地圖片
   */
  const removeLocalImage = (idx: number): void => {
    const item = localImages.value[idx]
    if (item?.url) URL.revokeObjectURL(item.url)
    localImages.value.splice(idx, 1)
  }

  /**
   * 搜尋章節
   */
  const searchChapters = async (): Promise<void> => {
    if (searchChapterTimeout.value) {
      clearTimeout(searchChapterTimeout.value)
    }
    
    const query = errorFormData.value.chapter?.trim() || ''
    
    if (query.length < 1) {
      chapterSuggestions.value = []
      showChapterSuggestions.value = false
      return
    }
    
    searchChapterTimeout.value = setTimeout(async () => {
      try {
        const response = await questionBankAPI.searchChapters(
          query,
          errorFormData.value.subject || null,
          errorFormData.value.level || null
        )
        chapterSuggestions.value = (response.data || []) as ChapterSuggestion[]
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
  const selectChapter = (chapter: string): void => {
    errorFormData.value.chapter = chapter
    showChapterSuggestions.value = false
    chapterSuggestions.value = []
  }

  /**
   * 處理章節輸入框失焦
   */
  const handleChapterBlur = (): void => {
    setTimeout(() => {
      showChapterSuggestions.value = false
    }, 200)
  }

  /**
   * 切換標籤選擇
   */
  const toggleTag = (tagId: number): void => {
    const index = errorFormData.value.tag_ids.indexOf(tagId)
    if (index > -1) {
      errorFormData.value.tag_ids.splice(index, 1)
    } else {
      errorFormData.value.tag_ids.push(tagId)
    }
  }

  /**
   * 從題庫載入題目
   */
  const loadQuestionFromBank = async (): Promise<void> => {
    if (!errorFormData.value.selectedQuestionId) return
    
    try {
      const response = await questionBankAPI.getById(parseInt(errorFormData.value.selectedQuestionId))
      const question = response.data as { subject?: { subject_id?: number } | number; level?: string; chapter?: string; content?: unknown; correct_answer?: unknown; difficulty?: number; tag_ids?: number[]; [key: string]: unknown }
      
      // 自動填充表單
      errorFormData.value.subject = (typeof question.subject === 'object' ? question.subject?.subject_id : question.subject)?.toString() || ''
      errorFormData.value.level = question.level || ''
      errorFormData.value.chapter = question.chapter || ''
      errorFormData.value.content = question.content
      errorFormData.value.correct_answer = question.correct_answer
      errorFormData.value.difficulty = question.difficulty || 1
      
      // 自動帶入題目的標籤
      if (question.tag_ids && Array.isArray(question.tag_ids)) {
        errorFormData.value.tag_ids = [...question.tag_ids]
      }
      
      // 自動添加錯題相關標籤
      addErrorTags()
    } catch (error) {
      console.error('載入題目失敗：', error)
      alert('載入題目失敗')
    }
  }

  /**
   * 切換題目來源
   */
  const toggleQuestionSource = (): void => {
    errorFormData.value.useExistingQuestion = !errorFormData.value.useExistingQuestion
  }

  return {
    // 狀態
    errorLogs,
    loading,
    saving,
    uploadingImages,
    showAddErrorModal,
    showDetailModal,
    selectedError,
    questionDetail,
    localImages,
    errorFormData,
    chapterSuggestions,
    showChapterSuggestions,
    
    // 方法
    fetchErrorLogs,
    openAddErrorModal,
    closeAddErrorModal,
    saveErrorLog,
    viewErrorDetail,
    closeErrorDetail,
    updateErrorStatus,
    incrementErrorCount,
    deleteErrorLog,
    deleteErrorImage,
    importSelectedErrorToQuestionBank,
    onPickImages,
    removeLocalImage,
    addErrorTags,
    searchChapters,
    selectChapter,
    handleChapterBlur,
    toggleTag,
    loadQuestionFromBank,
    toggleQuestionSource
  }
}

