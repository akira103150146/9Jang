import { ref, type Ref } from 'vue'
import { studentMistakeNoteAPI } from '../services/api'

/**
 * 學生筆記類型
 */
export interface StudentNote {
  note_id: number
  student_id: number
  content: string
  images?: Array<{
    image_id: number
    image_path: string
    caption?: string
  }>
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

/**
 * 匯入表單數據類型
 */
export interface ImportFormData {
  subject_id: string
  level: string
  chapter: string
  content: unknown // Tiptap JSON
  correct_answer: unknown // Tiptap JSON
  difficulty: number
  image_path: string
  tag_ids: number[]
}

/**
 * 學生筆記管理 Composable
 */
export function useStudentNotes(studentId: number) {
  const studentNotes = ref<StudentNote[]>([])
  const loadingNotes = ref(false)
  const importing = ref(false)
  const showNoteDetailModal = ref(false)
  const showImportModal = ref(false)
  const selectedNote = ref<StudentNote | null>(null)
  const importFormData = ref<ImportFormData>({
    subject_id: '',
    level: '',
    chapter: '',
    content: '',
    correct_answer: '',
    difficulty: 3,
    image_path: '',
    tag_ids: []
  })

  /**
   * 獲取學生筆記列表
   */
  const fetchStudentNotes = async (): Promise<void> => {
    loadingNotes.value = true
    try {
      const res = await studentMistakeNoteAPI.getAll(`student_id=${studentId}`)
      studentNotes.value = res.data.results || res.data || []
    } catch (e) {
      console.error('載入學生筆記失敗：', e)
      studentNotes.value = []
    } finally {
      loadingNotes.value = false
    }
  }

  /**
   * 查看筆記詳情
   */
  const viewNoteDetail = (note: StudentNote): void => {
    selectedNote.value = note
    showNoteDetailModal.value = true
  }

  /**
   * 關閉筆記詳情模態框
   */
  const closeNoteDetail = (): void => {
    showNoteDetailModal.value = false
    selectedNote.value = null
  }

  /**
   * 打開匯入模態框
   */
  const openImportModal = (note: StudentNote): void => {
    selectedNote.value = note
    // 預填表單（從筆記中提取資訊）
    importFormData.value = {
      subject_id: '',
      level: '',
      chapter: '',
      content: note.content || '',
      correct_answer: '',
      difficulty: 3,
      image_path: note.images && note.images.length > 0 ? note.images[0].image_path : '',
      tag_ids: []
    }
    showNoteDetailModal.value = false
    showImportModal.value = true
  }

  /**
   * 關閉匯入模態框
   */
  const closeImportModal = (): void => {
    showImportModal.value = false
    selectedNote.value = null
    importFormData.value = {
      subject_id: '',
      level: '',
      chapter: '',
      content: '',
      correct_answer: '',
      difficulty: 3,
      image_path: '',
      tag_ids: []
    }
  }

  /**
   * 匯入筆記到題庫
   */
  const importNoteToQuestionBank = async (): Promise<void> => {
    if (!selectedNote.value) return
    
    importing.value = true
    try {
      const payload: {
        subject_id: number
        level: string
        chapter: string
        content: unknown
        correct_answer: unknown
        difficulty: number
        tag_ids: number[]
        image_path?: string
      } = {
        subject_id: parseInt(importFormData.value.subject_id),
        level: importFormData.value.level,
        chapter: importFormData.value.chapter,
        content: importFormData.value.content,
        correct_answer: importFormData.value.correct_answer,
        difficulty: importFormData.value.difficulty,
        tag_ids: importFormData.value.tag_ids,
      }
      
      if (importFormData.value.image_path) {
        payload.image_path = importFormData.value.image_path
      }
      
      await studentMistakeNoteAPI.importToQuestionBank(selectedNote.value.note_id, payload as never)
      alert('成功匯入題庫！')
      closeImportModal()
    } catch (e) {
      console.error('匯入題庫失敗：', e)
      const error = e as { response?: { data?: { detail?: string } }; message?: string }
      alert('匯入題庫失敗：' + (error.response?.data?.detail || error.message || '未知錯誤'))
    } finally {
      importing.value = false
    }
  }

  return {
    // 狀態
    studentNotes,
    loadingNotes,
    importing,
    showNoteDetailModal,
    showImportModal,
    selectedNote,
    importFormData,
    
    // 方法
    fetchStudentNotes,
    viewNoteDetail,
    closeNoteDetail,
    openImportModal,
    closeImportModal,
    importNoteToQuestionBank
  }
}

