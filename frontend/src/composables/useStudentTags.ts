import { ref, type Ref } from 'vue'
import { type RouteLocationNormalized } from 'vue-router'
import { studentGroupAPI, studentAPI } from '../services/api'
import { normalizeStudent, type NormalizedStudent } from '../utils/studentUtils'

/**
 * 標籤類型
 */
export interface Tag {
  group_id: number
  name: string
  description?: string
  students_count?: number
  [key: string]: unknown
}

/**
 * 標籤表單類型
 */
export interface TagForm {
  name: string
  description: string
}

/**
 * 學生標籤管理 Composable
 */
export function useStudentTags(
  students: Ref<NormalizedStudent[]>,
  updateStudent: (id: number, data: Partial<NormalizedStudent>) => void,
  fetchStudents: (queryString?: string) => Promise<void>,
  route: RouteLocationNormalized
) {
  const availableTags = ref<Tag[]>([])
  const showTagManager = ref(false)
  const tagForm = ref<TagForm>({
    name: '',
    description: '',
  })
  const editingTag = ref<Tag | null>(null)
  const isCreatingTag = ref(false)
  const savingTag = ref(false)

  const showAddTagModal = ref(false)
  const selectedStudentForTag = ref<NormalizedStudent | null>(null)
  const addingTagToStudent = ref(false)

  /**
   * 獲取標籤列表
   */
  const fetchTags = async (): Promise<void> => {
    try {
      const response = await studentGroupAPI.getAll()
      const data = response.data.results || response.data || []
      availableTags.value = data as Tag[]
    } catch (error) {
      console.error('獲取標籤失敗:', error)
      availableTags.value = []
    }
  }

  /**
   * 打開標籤管理模態框
   */
  const openTagManager = (): void => {
    showTagManager.value = true
    editingTag.value = null
    isCreatingTag.value = false
    tagForm.value = { name: '', description: '' }
  }

  /**
   * 關閉標籤管理模態框
   */
  const closeTagManager = (): void => {
    showTagManager.value = false
    editingTag.value = null
    isCreatingTag.value = false
    tagForm.value = { name: '', description: '' }
  }

  /**
   * 開始創建新標籤
   */
  const startCreateTag = (): void => {
    editingTag.value = null
    isCreatingTag.value = true
    tagForm.value = { name: '', description: '' }
  }

  /**
   * 創建新標籤
   */
  const createTag = async (): Promise<void> => {
    if (!tagForm.value.name.trim()) {
      alert('請輸入標籤名稱')
      return
    }

    savingTag.value = true
    try {
      await studentGroupAPI.create({
        name: tagForm.value.name.trim(),
        description: tagForm.value.description.trim() || '',
      })
      alert('標籤創建成功')
      await fetchTags()
      isCreatingTag.value = false
      tagForm.value = { name: '', description: '' }
    } catch (error: unknown) {
      console.error('創建標籤失敗:', error)
      const err = error as {
        response?: { data?: { detail?: string; name?: string[] } }
      }
      const errorMsg =
        err.response?.data?.detail || err.response?.data?.name?.[0] || '創建標籤失敗'
      alert(`創建標籤失敗：${errorMsg}`)
    } finally {
      savingTag.value = false
    }
  }

  /**
   * 編輯標籤
   */
  const editTag = (tag: Tag): void => {
    editingTag.value = tag
    tagForm.value = {
      name: tag.name,
      description: tag.description || '',
    }
  }

  /**
   * 更新標籤
   */
  const updateTag = async (): Promise<void> => {
    if (!tagForm.value.name.trim()) {
      alert('請輸入標籤名稱')
      return
    }

    if (!editingTag.value) return

    savingTag.value = true
    try {
      await studentGroupAPI.update(editingTag.value.group_id, {
        name: tagForm.value.name.trim(),
        description: tagForm.value.description.trim() || '',
      })
      alert('標籤更新成功')
      await fetchTags()
      editingTag.value = null
      tagForm.value = { name: '', description: '' }
    } catch (error: unknown) {
      console.error('更新標籤失敗:', error)
      const err = error as {
        response?: { data?: { detail?: string; name?: string[] } }
      }
      const errorMsg =
        err.response?.data?.detail || err.response?.data?.name?.[0] || '更新標籤失敗'
      alert(`更新標籤失敗：${errorMsg}`)
    } finally {
      savingTag.value = false
    }
  }

  /**
   * 刪除標籤
   */
  const deleteTag = async (tag: Tag): Promise<void> => {
    if (!confirm(`確定要刪除標籤「${tag.name}」嗎？`)) {
      return
    }

    try {
      await studentGroupAPI.delete(tag.group_id)
      alert('標籤刪除成功')
      await fetchTags()
    } catch (error) {
      console.error('刪除標籤失敗:', error)
      alert('刪除標籤失敗，請稍後再試')
    }
  }

  /**
   * 保存標籤（創建或更新）
   */
  const saveTag = (): void => {
    if (editingTag.value) {
      updateTag()
    } else {
      createTag()
    }
  }

  /**
   * 打開為學生添加標籤的模態框
   */
  const openAddTagModal = (student: NormalizedStudent): void => {
    selectedStudentForTag.value = student
    showAddTagModal.value = true
  }

  /**
   * 關閉添加標籤模態框
   */
  const closeAddTagModal = (): void => {
    showAddTagModal.value = false
    selectedStudentForTag.value = null
  }

  /**
   * 為學生添加標籤
   */
  const addTagToStudent = async (tag: Tag): Promise<void> => {
    if (!selectedStudentForTag.value) return

    addingTagToStudent.value = true
    try {
      await studentGroupAPI.addStudents(tag.group_id, [selectedStudentForTag.value.id])
      alert('標籤添加成功')

      // 獲取該學生的最新數據（部分更新）
      try {
        const response = await studentAPI.getById(selectedStudentForTag.value.id)
        const updatedStudentData = normalizeStudent(response.data)

        updateStudent(selectedStudentForTag.value.id, updatedStudentData)
        Object.assign(selectedStudentForTag.value, updatedStudentData)
      } catch (fetchError) {
        console.error('獲取學生最新數據失敗，嘗試刷新整個列表:', fetchError)
        const queryString = new URLSearchParams(route.query).toString()
        await fetchStudents(queryString)
        const updatedStudent = students.value.find(
          (s) => s.id === selectedStudentForTag.value!.id
        )
        if (updatedStudent) {
          selectedStudentForTag.value = updatedStudent
        }
      }

      closeAddTagModal()
    } catch (error: unknown) {
      console.error('添加標籤失敗:', error)
      const err = error as { response?: { data?: { detail?: string } } }
      const errorMsg = err.response?.data?.detail || '添加標籤失敗'
      alert(`添加標籤失敗：${errorMsg}`)
    } finally {
      addingTagToStudent.value = false
    }
  }

  /**
   * 從學生移除標籤
   */
  const removeStudentFromTag = async (
    student: NormalizedStudent,
    tag: Tag
  ): Promise<void> => {
    if (!confirm(`確定要從「${student.name}」移除標籤「${tag.name}」嗎？`)) {
      return
    }

    try {
      await studentGroupAPI.removeStudents(tag.group_id, [student.id])
      alert('標籤移除成功')

      // 獲取該學生的最新數據（部分更新）
      try {
        const response = await studentAPI.getById(student.id)
        const updatedStudentData = normalizeStudent(response.data)

        updateStudent(student.id, updatedStudentData)
        // 更新 selectedStudentForTag 引用（如果它正在顯示該學生）
        if (selectedStudentForTag.value && selectedStudentForTag.value.id === student.id) {
          Object.assign(selectedStudentForTag.value, updatedStudentData)
        }
      } catch (fetchError) {
        console.error('獲取學生最新數據失敗，嘗試刷新整個列表:', fetchError)
        const queryString = new URLSearchParams(route.query).toString()
        await fetchStudents(queryString)
      }
    } catch (error) {
      console.error('移除標籤失敗:', error)
      alert('移除標籤失敗，請稍後再試')
    }
  }

  return {
    // 狀態
    availableTags,
    showTagManager,
    tagForm,
    editingTag,
    isCreatingTag,
    savingTag,
    showAddTagModal,
    selectedStudentForTag,
    addingTagToStudent,
    // 函數
    fetchTags,
    openTagManager,
    closeTagManager,
    startCreateTag,
    createTag,
    editTag,
    updateTag,
    deleteTag,
    saveTag,
    openAddTagModal,
    closeAddTagModal,
    addTagToStudent,
    removeStudentFromTag,
  }
}

