/**
 * 資源模式註冊配置
 * 定義各模式的編輯器和運行器組件
 */

import type { Component } from 'vue'

/**
 * 資源模式類型
 */
export type ResourceMode = 'HANDOUT' | 'ONLINE_QUIZ' | 'LEETCODE' | 'LISTENING_TEST' | 'FLASHCARD'

/**
 * 資源模式設置
 */
export interface ResourceModeSettings {
  [key: string]: unknown
}

/**
 * 資源模式配置
 */
export interface ResourceModeConfig {
  name: string
  editor: () => Promise<{ default: Component }>
  runner: () => Promise<{ default: Component }>
  icon: string
  description: string
  defaultSettings: ResourceModeSettings
}

/**
 * 資源模式配置映射
 */
export const resourceModes: Partial<Record<ResourceMode, ResourceModeConfig>> = {
  HANDOUT: {
    name: '講義模式',
    editor: () => import('../components/resource-modes/HandoutEditor.vue'),
    runner: () => import('../components/resource-runners/HandoutRunner.vue'),
    icon: '📄',
    description: '列印輸出為主，支援多種輸出格式',
    defaultSettings: {
      handout: {
        paperSize: 'A4',
        orientation: 'portrait',
        outputFormats: ['question_only'],
        margins: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        },
        fontSize: 12,
        lineHeight: 1.5
      }
    }
  },
  ONLINE_QUIZ: {
    name: '線上測驗模式',
    editor: () => import('../components/resource-modes/OnlineQuizEditor.vue'),
    runner: () => import('../components/resource-runners/OnlineQuizRunner.vue'),
    icon: '📝',
    description: '自動評分，支援選擇題和多選題',
    defaultSettings: {
      onlineQuiz: {
        timeLimit: 3600, // 1小時
        autoGrade: true,
        showAnswerAfterSubmit: true,
        allowRetake: false,
        shuffleQuestions: false,
        shuffleOptions: false
      }
    }
  }
  // 以下模式尚未實現，暫時註釋
  // LEETCODE: {
  //   name: '程式題模式',
  //   editor: () => import('../components/resource-modes/LeetCodeEditor.vue'),
  //   runner: () => import('../components/resource-runners/LeetCodeRunner.vue'),
  //   icon: '💻',
  //   description: '程式碼執行、測試用例',
  //   defaultSettings: {
  //     leetcode: {
  //       language: 'python',
  //       timeLimit: 30,
  //       memoryLimit: 256,
  //       testCases: [],
  //       starterCode: '',
  //       solutionTemplate: ''
  //     }
  //   }
  // },
  // LISTENING_TEST: {
  //   name: '聽力測驗模式',
  //   editor: () => import('../components/resource-modes/ListeningTestEditor.vue'),
  //   runner: () => import('../components/resource-runners/ListeningTestRunner.vue'),
  //   icon: '🎧',
  //   description: '音訊播放、聽力題',
  //   defaultSettings: {
  //     listeningTest: {
  //       audioUrl: '',
  //       playCount: 2,
  //       showTranscript: false,
  //       questions: []
  //     }
  //   }
  // },
  // FLASHCARD: {
  //   name: '單字卡模式',
  //   editor: () => import('../components/resource-modes/FlashcardEditor.vue'),
  //   runner: () => import('../components/resource-runners/FlashcardRunner.vue'),
  //   icon: '🃏',
  //   description: '記憶卡片、間隔重複',
  //   defaultSettings: {
  //     flashcard: {
  //       studyMode: 'review',
  //       spacedRepetition: true,
  //       showHint: true,
  //       autoFlip: false,
  //       flipDelay: 3
  //     }
  //   }
  // }
}

/**
 * 獲取模式配置
 */
export function getModeConfig(mode: ResourceMode): ResourceModeConfig | null {
  return resourceModes[mode] || null
}

/**
 * 獲取所有模式列表
 */
export function getAllModes(): Array<{ value: ResourceMode } & ResourceModeConfig> {
  return Object.keys(resourceModes).map((mode) => ({
    value: mode as ResourceMode,
    ...resourceModes[mode as ResourceMode]!
  }))
}

/**
 * 獲取模式名稱
 */
export function getModeName(mode: ResourceMode | string): string {
  return resourceModes[mode as ResourceMode]?.name || mode
}

/**
 * 獲取模式圖標
 */
export function getModeIcon(mode: ResourceMode | string): string {
  return resourceModes[mode as ResourceMode]?.icon || '📄'
}
