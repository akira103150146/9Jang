import { describe, it, expect } from 'vitest'
import { normalizeStudent, type RawStudentData, type NormalizedStudent } from './studentUtils'

describe('studentUtils', () => {
  describe('normalizeStudent', () => {
    it('should normalize student with student_id', () => {
      const raw: RawStudentData = {
        student_id: 123,
        name: '測試學生',
        school: '測試學校',
        grade: '一年級',
        phone: '0912345678'
      }

      const normalized = normalizeStudent(raw)

      expect(normalized.id).toBe(123)
      expect(normalized.name).toBe('測試學生')
      expect(normalized.school).toBe('測試學校')
      expect(normalized.grade).toBe('一年級')
      expect(normalized.phone).toBe('0912345678')
    })

    it('should normalize student with id', () => {
      const raw: RawStudentData = {
        id: 456,
        name: '測試學生2',
        school: '測試學校2',
        grade: '二年級'
      }

      const normalized = normalizeStudent(raw)

      expect(normalized.id).toBe(456)
    })

    it('should use default id when both student_id and id are missing', () => {
      const raw: RawStudentData = {
        name: '測試學生',
        school: '測試學校',
        grade: '三年級'
      }

      const normalized = normalizeStudent(raw)

      expect(normalized.id).toBe(0)
    })

    it('should handle phone from contact field', () => {
      const raw: RawStudentData = {
        name: '測試學生',
        school: '測試學校',
        grade: '一年級',
        contact: '0987654321'
      }

      const normalized = normalizeStudent(raw)

      expect(normalized.phone).toBe('0987654321')
    })

    it('should prioritize phone over contact', () => {
      const raw: RawStudentData = {
        name: '測試學生',
        school: '測試學校',
        grade: '一年級',
        phone: '0912345678',
        contact: '0987654321'
      }

      const normalized = normalizeStudent(raw)

      expect(normalized.phone).toBe('0912345678')
    })

    it('should handle emergency_contact_name from emergencyContactName', () => {
      const raw: RawStudentData = {
        name: '測試學生',
        school: '測試學校',
        grade: '一年級',
        emergencyContactName: '緊急聯絡人'
      }

      const normalized = normalizeStudent(raw)

      expect(normalized.emergency_contact_name).toBe('緊急聯絡人')
    })

    it('should prioritize emergency_contact_name over emergencyContactName', () => {
      const raw: RawStudentData = {
        name: '測試學生',
        school: '測試學校',
        grade: '一年級',
        emergency_contact_name: '聯絡人1',
        emergencyContactName: '聯絡人2'
      }

      const normalized = normalizeStudent(raw)

      expect(normalized.emergency_contact_name).toBe('聯絡人1')
    })

    it('should handle emergency_contact_phone from emergencyContactPhone', () => {
      const raw: RawStudentData = {
        name: '測試學生',
        school: '測試學校',
        grade: '一年級',
        emergencyContactPhone: '0911111111'
      }

      const normalized = normalizeStudent(raw)

      expect(normalized.emergency_contact_phone).toBe('0911111111')
    })

    it('should set default values for missing fields', () => {
      const raw: RawStudentData = {
        name: '測試學生',
        school: '測試學校',
        grade: '一年級'
      }

      const normalized = normalizeStudent(raw)

      expect(normalized.phone).toBe('')
      expect(normalized.emergency_contact_name).toBe('')
      expect(normalized.emergency_contact_phone).toBe('')
      expect(normalized.notes).toBe('')
      expect(normalized.total_fees).toBe(0)
      expect(normalized.unpaid_fees).toBe(0)
      expect(normalized.enrollments_count).toBe(0)
      expect(normalized.enrollments).toEqual([])
      expect(normalized.student_groups).toEqual([])
      expect(normalized.has_tuition_needed).toBe(false)
      expect(normalized.username).toBe('')
      expect(normalized.password).toBe('')
      expect(normalized.is_deleted).toBe(false)
      expect(normalized.deleted_at).toBe(null)
    })

    it('should preserve boolean values', () => {
      const raw: RawStudentData = {
        name: '測試學生',
        school: '測試學校',
        grade: '一年級',
        is_account_active: true,
        must_change_password: false,
        is_deleted: true
      }

      const normalized = normalizeStudent(raw)

      expect(normalized.is_account_active).toBe(true)
      expect(normalized.must_change_password).toBe(false)
      expect(normalized.is_deleted).toBe(true)
    })

    it('should handle null values', () => {
      const raw: RawStudentData = {
        name: '測試學生',
        school: '測試學校',
        grade: '一年級',
        is_account_active: null,
        must_change_password: null,
        deleted_at: '2024-01-01'
      }

      const normalized = normalizeStudent(raw)

      expect(normalized.is_account_active).toBe(null)
      expect(normalized.must_change_password).toBe(null)
      expect(normalized.deleted_at).toBe('2024-01-01')
    })

    it('should handle enrollments array', () => {
      const enrollments = [
        { enrollment_id: 1, course_name: '數學' },
        { enrollment_id: 2, course_name: '英文' }
      ]

      const raw: RawStudentData = {
        name: '測試學生',
        school: '測試學校',
        grade: '一年級',
        enrollments
      }

      const normalized = normalizeStudent(raw)

      expect(normalized.enrollments).toEqual(enrollments)
    })

    it('should handle student_groups array', () => {
      const student_groups = [
        { group_id: 1, name: 'VIP' },
        { group_id: 2, name: '普通' }
      ]

      const raw: RawStudentData = {
        name: '測試學生',
        school: '測試學校',
        grade: '一年級',
        student_groups
      }

      const normalized = normalizeStudent(raw)

      expect(normalized.student_groups).toEqual(student_groups)
    })
  })
})
