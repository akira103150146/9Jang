import { describe, it, expect } from 'vitest'
import { useModalManager } from './useModalManager'

describe('useModalManager', () => {
  it('should initialize with empty modals', () => {
    const { modals } = useModalManager()
    expect(modals.value).toEqual({})
  })

  it('should open a modal', () => {
    const { openModal, modals } = useModalManager()
    
    openModal('testModal')
    
    expect(modals.value.testModal).toBeDefined()
    expect(modals.value.testModal.isOpen).toBe(true)
  })

  it('should open a modal with options', () => {
    const { openModal, modals } = useModalManager()
    
    openModal('testModal', { title: 'Test Title', data: { id: 1 } })
    
    expect(modals.value.testModal.isOpen).toBe(true)
    expect(modals.value.testModal.title).toBe('Test Title')
    expect((modals.value.testModal.data as { id: number }).id).toBe(1)
  })

  it('should close a modal', () => {
    const { openModal, closeModal, modals } = useModalManager()
    
    openModal('testModal')
    expect(modals.value.testModal.isOpen).toBe(true)
    
    closeModal('testModal')
    expect(modals.value.testModal.isOpen).toBe(false)
  })

  it('should toggle a modal', () => {
    const { toggleModal, modals } = useModalManager()
    
    toggleModal('testModal')
    expect(modals.value.testModal.isOpen).toBe(true)
    
    toggleModal('testModal')
    expect(modals.value.testModal.isOpen).toBe(false)
  })

  it('should toggle modal with options', () => {
    const { toggleModal, modals } = useModalManager()
    
    toggleModal('testModal', { title: 'Test' })
    expect(modals.value.testModal.isOpen).toBe(true)
    expect(modals.value.testModal.title).toBe('Test')
  })

  it('should check if modal is open', () => {
    const { openModal, isModalOpen } = useModalManager()
    
    expect(isModalOpen('testModal')).toBe(false)
    
    openModal('testModal')
    expect(isModalOpen('testModal')).toBe(true)
  })

  it('should get modal options', () => {
    const { openModal, getModalOptions } = useModalManager()
    
    openModal('testModal', { title: 'Test Title' })
    const options = getModalOptions('testModal')
    
    expect(options).toBeDefined()
    expect(options?.isOpen).toBe(true)
    expect(options?.title).toBe('Test Title')
  })

  it('should return undefined for non-existent modal', () => {
    const { getModalOptions } = useModalManager()
    
    const options = getModalOptions('nonExistent')
    expect(options).toBeUndefined()
  })

  it('should handle multiple modals independently', () => {
    const { openModal, closeModal, modals } = useModalManager()
    
    openModal('modal1')
    openModal('modal2')
    
    expect(modals.value.modal1.isOpen).toBe(true)
    expect(modals.value.modal2.isOpen).toBe(true)
    
    closeModal('modal1')
    
    expect(modals.value.modal1.isOpen).toBe(false)
    expect(modals.value.modal2.isOpen).toBe(true)
  })
})
