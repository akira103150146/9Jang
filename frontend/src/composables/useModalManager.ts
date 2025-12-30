import { ref, type Ref } from 'vue'

/**
 * Modal 狀態介面
 */
export interface ModalState {
  isOpen: boolean
  [key: string]: unknown
}

/**
 * Modal 選項
 */
export type ModalOptions = Omit<ModalState, 'isOpen'> & Partial<Pick<ModalState, 'isOpen'>>

/**
 * Modal 管理 Composable
 * 提供統一的 Modal 開關狀態管理
 */
export function useModalManager() {
  const modals: Ref<Record<string, ModalState>> = ref({})

  /**
   * 打開 Modal
   */
  const openModal = (modalName: string, options: ModalOptions = {}): void => {
    modals.value[modalName] = {
      isOpen: true,
      ...options
    }
  }

  /**
   * 關閉 Modal
   */
  const closeModal = (modalName: string): void => {
    if (modals.value[modalName]) {
      modals.value[modalName].isOpen = false
    }
  }

  /**
   * 切換 Modal 狀態
   */
  const toggleModal = (modalName: string, options: ModalOptions = {}): void => {
    const current = modals.value[modalName]?.isOpen || false
    if (current) {
      closeModal(modalName)
    } else {
      openModal(modalName, options)
    }
  }

  /**
   * 檢查 Modal 是否打開
   */
  const isModalOpen = (modalName: string): boolean => {
    return modals.value[modalName]?.isOpen || false
  }

  /**
   * 獲取 Modal 的選項
   */
  const getModalOptions = (modalName: string): ModalState | undefined => {
    return modals.value[modalName]
  }

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    isModalOpen,
    getModalOptions
  }
}
