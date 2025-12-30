<template>
  <node-view-wrapper class="question-block-wrapper">
    <div 
      class="question-block"
      :class="{ 'is-hovered': isHovered && !isReadonly }"
      @mouseenter="!isReadonly && (isHovered = true)"
      @mouseleave="isHovered = false"
    >
      <!-- 懸停時顯示的操作選單 (僅在編輯模式) -->
      <div v-if="!isReadonly && isHovered" class="question-toolbar">
        <div class="question-badge">❓ 題目</div>
        <button @click="handleSelectQuestion" class="btn-select">
          {{ node.attrs.questionId ? '更換題目' : '選擇題目' }}
        </button>
        <button @click="handleDelete" class="btn-delete">
          🗑️ 刪除
        </button>
      </div>
      
      <!-- 題目內容（純白背景） -->
      <div v-if="node.attrs.questionId" class="question-content">
        <QuestionBlock 
          :question-id="node.attrs.questionId" 
          :show-metadata="false"
          :question-number="questionNumber"
        />
      </div>
      
      <div v-else class="question-placeholder">
        點擊「選擇題目」從題目庫中選擇
      </div>
      
      <node-view-content class="content" />
    </div>

    <!-- 題目選擇器 -->
    <QuestionSelectorModal
      v-model="showSelector"
      :questions="availableQuestions"
      @select="onQuestionSelected"
    />
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref, inject, computed, type Ref, type InjectionKey } from 'vue'
import { NodeViewWrapper, NodeViewContent, nodeViewProps, type NodeViewProps } from '@tiptap/vue-3'
import QuestionBlock from '../../QuestionBlock.vue'
import QuestionSelectorModal from './QuestionSelectorModal.vue'

interface Question {
  id: number
  [key: string]: unknown
}

const props = defineProps<NodeViewProps>()

// 從父組件注入可用的題目列表
const QuestionsInjectionKey: InjectionKey<Question[]> = Symbol('questions')
const availableQuestions: Question[] = inject(QuestionsInjectionKey, [])

// 注入 readonly 狀態
const isReadonly = computed<boolean>(() => !props.editor.isEditable)

const showSelector: Ref<boolean> = ref(false)
const isHovered: Ref<boolean> = ref(false)

// 計算題號：根據最近的 SectionBlock（大題標題）來編號
const questionNumber = computed<number | null>(() => {
  try {
    const editor = props.editor
    if (!editor || !(props.node.attrs.questionId as number | undefined)) return null

    const currentPos = props.getPos()
    if (currentPos === undefined || currentPos === null) return null

    let count = 0
    let lastSectionPos = -1

    // 遍歷文檔，找到當前題目之前最近的 SectionBlock
    editor.state.doc.descendants((node, pos) => {
      // 如果遇到 SectionBlock 且在當前節點之前，記錄其位置
      if (node.type.name === 'sectionBlock' && pos < currentPos) {
        lastSectionPos = pos
        count = 0 // 重置計數
      }

      // 如果是題目區塊且有 questionId
      if (node.type.name === 'questionBlock' && (node.attrs.questionId as number | undefined)) {
        // 只計算在最近的 SectionBlock 之後的題目
        if (pos > lastSectionPos && pos <= currentPos) {
          count++
        }
      }
    })

    return count > 0 ? count : null
  } catch (error) {
    console.error('計算題號時出錯:', error)
    return null
  }
})

const handleSelectQuestion = (): void => {
  // 打開題目選擇器
  showSelector.value = true
}

const handleDelete = (): void => {
  const pos = props.getPos()
  if (pos === null || pos === undefined) return
  props.editor.chain().focus().deleteRange({
    from: pos,
    to: pos + props.node.nodeSize
  }).run()
}

const onQuestionSelected = async (questionIds: number | number[]): Promise<void> => {
  // 如果是陣列(多選),處理批次插入
  if (Array.isArray(questionIds)) {
    // 取得編輯器實例
    const editor = props.editor
    if (!editor) return
    
    // 如果當前節點還沒有 questionId,設定第一個
    if (!(props.node.attrs.questionId as number | undefined) && questionIds.length > 0) {
      props.updateAttributes({
        questionId: questionIds[0]
      })

      // 插入剩餘的題目 - 在當前節點後面插入
      if (questionIds.length > 1) {
        // 重要：使用當前編輯器的選區位置，而不是節點的文檔位置
        const currentNodePos = props.getPos()
        if (currentNodePos === null || currentNodePos === undefined) return
        const pos = currentNodePos + props.node.nodeSize
        
        // 批次插入其他題目 - 逐個插入以確保所有題目都被添加，並檢查是否需要分頁
        // 使用 for...of 循環以支持異步操作
        for (let index = 0; index < questionIds.slice(1).length; index++) {
          const qId = questionIds.slice(1)[index]
          
          // 在每次插入前，從編輯器狀態中獲取最新的位置
          // 這樣可以確保即使之前插入了分頁符號，位置也是正確的
          const currentPos = editor.state.doc.content.size
          
          const questionBlock = {
            type: 'questionBlock',
            attrs: {
              id: `block-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 11)}`,
              questionId: qId
            }
          }
          
          const result = editor.chain()
            .focus()
            .insertContentAt(currentPos, questionBlock)
            .run()
          
          // 等待編輯器狀態穩定（確保插入操作完成）
          await new Promise(resolve => setTimeout(resolve, 10))
          
          // 檢查是否需要插入分頁符號（模擬 AutoPageBreak 邏輯）
          if (result) {
            const insertedPos = currentPos
            
            // 等待 DOM 更新後再檢查
            const pageBreakInserted = await new Promise((resolve) => {
              setTimeout(() => {
                try {
                  // 獲取剛插入的題目節點的 DOM 元素
                  const questionWrappers = document.querySelectorAll('.question-block-wrapper')
                  const insertedWrapper = Array.from(questionWrappers).find(wrapper => {
                    const questionIdAttr = wrapper.querySelector('.question-block')?.getAttribute('data-question-id')
                    return questionIdAttr === String(qId)
                  })
                  
                  if (insertedWrapper) {
                    const editorDOM = editor.view.dom
                    const editorRect = editorDOM.getBoundingClientRect()
                    const nodeRect = insertedWrapper.getBoundingClientRect()
                    
                    // 取得游標提示方塊的高度
                    const cursorIndicator = document.querySelector('.cursor-indicator')
                    let cursorIndicatorHeight = 0
                    if (cursorIndicator) {
                      cursorIndicatorHeight = cursorIndicator.offsetHeight
                      const marginBottom = parseFloat(window.getComputedStyle(cursorIndicator).marginBottom) || 0
                      cursorIndicatorHeight += marginBottom
                    }
                    
                    // 當前節點的底部位置（相對於編輯器頂部）
                    const nodeBottomRelative = nodeRect.bottom - editorRect.top
                    const adjustedBottom = nodeBottomRelative - cursorIndicatorHeight
                    
                    // 獲取頁面高度（A4: 971px, B4: 1183px）
                    const paperSize = document.querySelector('.block-editor-container')?.classList.contains('paper-size-a4') ? 'A4' : 'B4'
                    const pageHeightPx = paperSize === 'A4' ? 971 : 1183
                    
                    // 計算當前在第幾頁
                    const currentPage = Math.floor(adjustedBottom / pageHeightPx)
                    const nextPageBoundary = (currentPage + 1) * pageHeightPx
                    const remainingSpace = nextPageBoundary - adjustedBottom
                    
                    // 如果剩餘空間小於 300px（一個題目區塊的平均高度），插入分頁符號
                    if (remainingSpace < 300) {
                      // 從編輯器狀態中獲取當前文檔大小，確保位置準確
                      const currentDocSize = editor.state.doc.content.size
                      const pageBreakPos = insertedPos + 2
                      
                      // 驗證位置是否有效
                      if (pageBreakPos <= currentDocSize) {
                        editor.chain()
                          .focus()
                          .insertContentAt(pageBreakPos, { type: 'pageBreak' })
                          .run()
                        
                        resolve(true) // 返回 true 表示插入了分頁符號
                        return
                      }
                    }
                  }
                } catch (error) {
                  console.error('檢查分頁失敗:', error)
                }
                resolve(false) // 返回 false 表示沒有插入分頁符號
              }, 50)
            })
            
            // 等待編輯器狀態更新（無論是否插入分頁符號）
            await new Promise(resolve => setTimeout(resolve, 10))
          }
        }
        
        // 滾動到第一個新插入的題目
        setTimeout(() => {
          const questionBlockWrappers = document.querySelectorAll('.question-block-wrapper')
          const paperSheet = document.querySelector('.paper-sheet')
          
          if (questionBlockWrappers.length > 0 && paperSheet) {
            const firstBlock = questionBlockWrappers[0]
            setTimeout(() => {
              const firstBlockRect = firstBlock.getBoundingClientRect()
              const paperRect = paperSheet.getBoundingClientRect()
              const firstBlockTop = firstBlockRect.top
              const paperTop = paperRect.top
              
              // 如果第一個題目在視窗外，滾動到它
              if (firstBlockTop < paperTop || firstBlockTop > paperTop + paperSheet.clientHeight) {
                const offsetTop = firstBlock.offsetTop
                paperSheet.scrollTo({ top: Math.max(0, offsetTop - 20), behavior: 'smooth' })
              }
            }, 150)
          }
        }, 150)
      }
    } else {
      // 如果當前節點已有題目,在後面插入所有選中的題目
      const currentNodePos = props.getPos()
      if (currentNodePos === null || currentNodePos === undefined) return
      const pos = currentNodePos + props.node.nodeSize

      // 逐個插入所有題目
      let currentPos = pos
      questionIds.forEach((qId: number, index: number) => {
        const questionBlock = {
          type: 'questionBlock',
          attrs: {
            id: `block-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 11)}`,
            questionId: qId
          }
        }

        const result = editor.chain().focus().insertContentAt(currentPos, questionBlock).run()

        // 更新下一個插入位置
        if (result) {
          currentPos += 2
        }
      })
    }
  } else {
    // 單選模式(向後兼容)
    props.updateAttributes({
      questionId: questionIds as number
    })
  }
}
</script>

<style scoped>
.question-block-wrapper {
  margin: 1rem 0;
  position: relative;
}

.question-block {
  position: relative;
  padding: 1rem;
  background: white;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

/* 懸停時顯示綠色邊框 */
.question-block.is-hovered {
  border-color: rgb(34, 197, 94);
  background: rgb(240, 253, 244);
}

/* 操作工具列 - 只在懸停時顯示 */
.question-toolbar {
  position: absolute;
  top: -12px;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  z-index: 10;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.question-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  background: rgb(34, 197, 94);
  color: white;
  border-radius: 9999px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-select,
.btn-delete {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  background: white;
  border: 1px solid rgb(226, 232, 240);
  color: rgb(51, 65, 85);
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-select:hover {
  background: rgb(241, 245, 249);
  border-color: rgb(99, 102, 241);
}

.btn-delete:hover {
  background: rgb(254, 242, 242);
  border-color: rgb(239, 68, 68);
  color: rgb(220, 38, 38);
}

.question-content {
  background: white;
  border-radius: 0.5rem;
}

.question-placeholder {
  padding: 2rem;
  text-align: center;
  color: rgb(148, 163, 184);
  font-size: 0.875rem;
  background: white;
  border-radius: 0.5rem;
  border: 2px dashed rgb(203, 213, 225);
}

.content {
  margin-top: 1rem;
  padding-left: 1.5rem;
  border-left: 3px solid rgb(187, 247, 208);
}

/* 列印時隱藏工具列和邊框 */
@media print {
  .question-toolbar {
    display: none !important;
  }
  
  .question-block {
    border: none !important;
    background: white !important;
    padding: 0.5rem 0 !important;
  }
  
  .content {
    display: none !important;
  }
}
</style>
