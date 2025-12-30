import { ref } from 'vue'

/**
 * Modal 管理 Composable
 * 提供統一的 Modal 開關狀態管理
 */
export function useModalManager() {
  const modals = ref({})

  /**
   * 打開 Modal
   */
  const openModal = (modalName, options = {}) => {
    modals.value[modalName] = {
      isOpen: true,
      ...options
    }
  }

  /**
   * 關閉 Modal
   */
  const closeModal = (modalName) => {
    if (modals.value[modalName]) {
      modals.value[modalName].isOpen = false
    }
  }

  /**
   * 切換 Modal 狀態
   */
  const toggleModal = (modalName, options = {}) => {
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
  const isModalOpen = (modalName) => {
    return modals.value[modalName]?.isOpen || false
  }

  /**
   * 獲取 Modal 的選項
   */
  const getModalOptions = (modalName) => {
    return modals.value[modalName] || {}
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
