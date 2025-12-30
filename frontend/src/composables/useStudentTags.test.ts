import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useStudentTags } from './useStudentTags'
import { studentGroupAPI, studentAPI } from '../services/api'
import { normalizeStudent, type NormalizedStudent } from '../utils/studentUtils'

// Mock APIs
vi.mock('../services/api', () => ({
  studentGroupAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addStudents: vi.fn(),
    removeStudents: vi.fn()
  },
  studentAPI: {
    getById: vi.fn()
  }
}))

// Mock router
const mockRoute = {
  query: {},
  params: {},
  path: '/students',
  name: 'students',
  meta: {}
}

describe('useStudentTags', () => {
  let students: ReturnType<typeof ref<NormalizedStudent[]>>
  let updateStudent: (id: number, data: Partial<NormalizedStudent>) => void
  let fetchStudents: (queryString?: string) => Promise<void>

  beforeEach(() => {
    vi.clearAllMocks()
    global.alert = vi.fn()
    global.confirm = vi.fn(() => true)

    students = ref<NormalizedStudent[]>([
      {
        id: 1,
        name: '測試學生',
        school: '測試學校',
        grade: '一年級',
        phone: '0912345678',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        notes: '',
        total_fees: 0,
        unpaid_fees: 0,
        enrollments_count: 0,
        enrollments: [],
        student_groups: [],
        has_tuition_needed: false,
        username: '',
        password: '',
        is_account_active: null,
        must_change_password: null,
        is_deleted: false,
        deleted_at: null
      }
    ])

    updateStudent = vi.fn()
    fetchStudents = vi.fn().mockResolvedValue(undefined)
  })

  it('should initialize with default state', () => {
    const { 
      availableTags, 
      showTagManager, 
      tagForm,
      showAddTagModal,
      selectedStudentForTag
    } = useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    expect(availableTags.value).toEqual([])
    expect(showTagManager.value).toBe(false)
    expect(tagForm.value.name).toBe('')
    expect(tagForm.value.description).toBe('')
    expect(showAddTagModal.value).toBe(false)
    expect(selectedStudentForTag.value).toBe(null)
  })

  it('should fetch tags successfully', async () => {
    const mockTags = {
      data: {
        results: [
          { group_id: 1, name: 'VIP', description: 'VIP 學生' },
          { group_id: 2, name: '普通', description: '普通學生' }
        ]
      }
    }

    vi.mocked(studentGroupAPI.getAll).mockResolvedValueOnce(mockTags as any)

    const { fetchTags, availableTags } = useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    await fetchTags()

    expect(availableTags.value.length).toBe(2)
    expect(availableTags.value[0].name).toBe('VIP')
  })

  it('should handle fetch tags error', async () => {
    vi.mocked(studentGroupAPI.getAll).mockRejectedValueOnce(new Error('API Error'))

    const { fetchTags, availableTags } = useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    await fetchTags()

    expect(availableTags.value).toEqual([])
  })

  it('should open tag manager', () => {
    const { openTagManager, showTagManager, tagForm, editingTag, isCreatingTag } = 
      useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    openTagManager()

    expect(showTagManager.value).toBe(true)
    expect(editingTag.value).toBe(null)
    expect(isCreatingTag.value).toBe(false)
    expect(tagForm.value.name).toBe('')
  })

  it('should close tag manager', () => {
    const { openTagManager, closeTagManager, showTagManager } = 
      useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    openTagManager()
    closeTagManager()

    expect(showTagManager.value).toBe(false)
  })

  it('should start creating tag', () => {
    const { startCreateTag, isCreatingTag, editingTag, tagForm } = 
      useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    startCreateTag()

    expect(isCreatingTag.value).toBe(true)
    expect(editingTag.value).toBe(null)
    expect(tagForm.value.name).toBe('')
  })

  it('should create tag successfully', async () => {
    const mockTags = {
      data: { results: [] }
    }

    vi.mocked(studentGroupAPI.create).mockResolvedValueOnce({ data: {} } as any)
    vi.mocked(studentGroupAPI.getAll).mockResolvedValueOnce(mockTags as any)

    const { createTag, tagForm } = useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    tagForm.value = {
      name: '新標籤',
      description: '標籤描述'
    }

    await createTag()

    expect(studentGroupAPI.create).toHaveBeenCalledWith({
      name: '新標籤',
      description: '標籤描述'
    })
    expect(global.alert).toHaveBeenCalledWith('標籤創建成功')
  })

  it('should not create tag without name', async () => {
    const { createTag, tagForm } = useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    tagForm.value = {
      name: '   ',
      description: ''
    }

    await createTag()

    expect(studentGroupAPI.create).not.toHaveBeenCalled()
    expect(global.alert).toHaveBeenCalledWith('請輸入標籤名稱')
  })

  it('should handle create tag error', async () => {
    vi.mocked(studentGroupAPI.create).mockRejectedValueOnce({
      response: {
        data: {
          detail: '創建失敗'
        }
      }
    })

    const { createTag, tagForm } = useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    tagForm.value = {
      name: '新標籤',
      description: ''
    }

    await createTag()

    expect(global.alert).toHaveBeenCalledWith('創建標籤失敗：創建失敗')
  })

  it('should edit tag', () => {
    const tag = {
      group_id: 1,
      name: 'VIP',
      description: 'VIP 學生'
    }

    const { editTag, tagForm, editingTag } = useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    editTag(tag)

    expect(editingTag.value).toEqual(tag)
    expect(tagForm.value.name).toBe('VIP')
    expect(tagForm.value.description).toBe('VIP 學生')
  })

  it('should update tag successfully', async () => {
    const tag = {
      group_id: 1,
      name: 'VIP',
      description: 'VIP 學生'
    }

    const mockTags = {
      data: { results: [] }
    }

    vi.mocked(studentGroupAPI.update).mockResolvedValueOnce({ data: {} } as any)
    vi.mocked(studentGroupAPI.getAll).mockResolvedValueOnce(mockTags as any)

    const { editTag, updateTag, tagForm } = useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    editTag(tag)
    tagForm.value.name = '更新後的 VIP'
    tagForm.value.description = '更新後的描述'

    await updateTag()

    expect(studentGroupAPI.update).toHaveBeenCalledWith(1, {
      name: '更新後的 VIP',
      description: '更新後的描述'
    })
    expect(global.alert).toHaveBeenCalledWith('標籤更新成功')
  })

  it('should not update tag without name', async () => {
    const tag = {
      group_id: 1,
      name: 'VIP',
      description: 'VIP 學生'
    }

    const { editTag, updateTag, tagForm } = useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    editTag(tag)
    tagForm.value.name = '   '

    await updateTag()

    expect(studentGroupAPI.update).not.toHaveBeenCalled()
    expect(global.alert).toHaveBeenCalledWith('請輸入標籤名稱')
  })

  it('should delete tag successfully', async () => {
    const tag = {
      group_id: 1,
      name: 'VIP',
      description: 'VIP 學生'
    }

    const mockTags = {
      data: { results: [] }
    }

    vi.mocked(studentGroupAPI.delete).mockResolvedValueOnce({ data: {} } as any)
    vi.mocked(studentGroupAPI.getAll).mockResolvedValueOnce(mockTags as any)

    const { deleteTag } = useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    await deleteTag(tag)

    expect(studentGroupAPI.delete).toHaveBeenCalledWith(1)
    expect(global.alert).toHaveBeenCalledWith('標籤刪除成功')
  })

  it('should not delete tag if user cancels', async () => {
    global.confirm = vi.fn(() => false)

    const tag = {
      group_id: 1,
      name: 'VIP',
      description: 'VIP 學生'
    }

    const { deleteTag } = useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    await deleteTag(tag)

    expect(studentGroupAPI.delete).not.toHaveBeenCalled()
  })

  it('should save tag (create or update)', async () => {
    const mockTags = {
      data: { results: [] }
    }

    vi.mocked(studentGroupAPI.create).mockResolvedValueOnce({ data: {} } as any)
    vi.mocked(studentGroupAPI.getAll).mockResolvedValueOnce(mockTags as any)

    const { saveTag, tagForm, startCreateTag } = useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    startCreateTag()
    tagForm.value = {
      name: '新標籤',
      description: ''
    }

    await saveTag()

    expect(studentGroupAPI.create).toHaveBeenCalled()
  })

  it('should open add tag modal', () => {
    const student = students.value[0]
    const { openAddTagModal, showAddTagModal, selectedStudentForTag } = 
      useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    openAddTagModal(student)

    expect(showAddTagModal.value).toBe(true)
    expect(selectedStudentForTag.value).toEqual(student)
  })

  it('should close add tag modal', () => {
    const { openAddTagModal, closeAddTagModal, showAddTagModal, selectedStudentForTag } = 
      useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    openAddTagModal(students.value[0])
    closeAddTagModal()

    expect(showAddTagModal.value).toBe(false)
    expect(selectedStudentForTag.value).toBe(null)
  })

  it('should add tag to student successfully', async () => {
    const student = students.value[0]
    const tag = {
      group_id: 1,
      name: 'VIP',
      description: 'VIP 學生'
    }

    const mockStudentResponse = {
      data: {
        student_id: 1,
        name: '測試學生',
        school: '測試學校',
        grade: '一年級',
        student_groups: [{ group_id: 1, name: 'VIP' }]
      }
    }

    vi.mocked(studentGroupAPI.addStudents).mockResolvedValueOnce({ data: {} } as any)
    vi.mocked(studentAPI.getById).mockResolvedValueOnce(mockStudentResponse as any)

    const { openAddTagModal, addTagToStudent } = 
      useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    openAddTagModal(student)
    await addTagToStudent(tag)

    expect(studentGroupAPI.addStudents).toHaveBeenCalledWith(1, [1])
    expect(global.alert).toHaveBeenCalledWith('標籤添加成功')
  })

  it('should not add tag without selected student', async () => {
    const tag = {
      group_id: 1,
      name: 'VIP',
      description: 'VIP 學生'
    }

    const { addTagToStudent } = useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    await addTagToStudent(tag)

    expect(studentGroupAPI.addStudents).not.toHaveBeenCalled()
  })

  it('should remove student from tag successfully', async () => {
    const student = students.value[0]
    const tag = {
      group_id: 1,
      name: 'VIP',
      description: 'VIP 學生'
    }

    const mockStudentResponse = {
      data: {
        student_id: 1,
        name: '測試學生',
        school: '測試學校',
        grade: '一年級',
        student_groups: []
      }
    }

    vi.mocked(studentGroupAPI.removeStudents).mockResolvedValueOnce({ data: {} } as any)
    vi.mocked(studentAPI.getById).mockResolvedValueOnce(mockStudentResponse as any)

    const { removeStudentFromTag } = useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    await removeStudentFromTag(student, tag)

    expect(studentGroupAPI.removeStudents).toHaveBeenCalledWith(1, [1])
    expect(global.alert).toHaveBeenCalledWith('標籤移除成功')
  })

  it('should not remove student from tag if user cancels', async () => {
    global.confirm = vi.fn(() => false)

    const student = students.value[0]
    const tag = {
      group_id: 1,
      name: 'VIP',
      description: 'VIP 學生'
    }

    const { removeStudentFromTag } = useStudentTags(students, updateStudent, fetchStudents, mockRoute as any)

    await removeStudentFromTag(student, tag)

    expect(studentGroupAPI.removeStudents).not.toHaveBeenCalled()
  })
})
