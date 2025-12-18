<template>
  <node-view-wrapper class="question-block-wrapper">
    <div class="question-block">
      <div class="question-header">
        <div class="question-badge">❓ 題目</div>
        <button @click="handleSelectQuestion" class="btn-select">
          {{ node.attrs.questionId ? '更換題目' : '選擇題目' }}
        </button>
      </div>
      
      <div v-if="node.attrs.questionId" class="question-content">
        <QuestionBlock :question-id="node.attrs.questionId" />
      </div>
      
      <div v-else class="question-placeholder">
        點擊「選擇題目」從題目庫中選擇
      </div>
      
      <node-view-content class="content" />
    </div>
  </node-view-wrapper>
</template>

<script setup>
import { inject } from 'vue'
import { NodeViewWrapper, NodeViewContent, nodeViewProps } from '@tiptap/vue-3'
import QuestionBlock from '../../QuestionBlock.vue'

const props = defineProps(nodeViewProps)

// 從父組件注入可用的題目列表
const availableQuestions = inject('questions', [])

const handleSelectQuestion = () => {
  // 這裡可以打開一個題目選擇對話框
  // 暫時使用第一個題目作為範例
  if (availableQuestions.value && availableQuestions.value.length > 0) {
    props.updateAttributes({
      questionId: availableQuestions.value[0].question_id
    })
  } else {
    // 可以觸發事件讓父組件打開題目選擇器
    alert('請從側邊欄拖動題目到此處，或點擊側邊欄的題目庫')
  }
}
</script>

<style scoped>
.question-block-wrapper {
  margin: 1rem 0;
}

.question-block {
  position: relative;
  padding: 1rem;
  border: 2px solid rgb(34, 197, 94);
  border-radius: 0.5rem;
  background: rgb(240, 253, 244);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.question-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  background: rgb(34, 197, 94);
  color: white;
  border-radius: 9999px;
}

.btn-select {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  background: white;
  border: 1px solid rgb(226, 232, 240);
  color: rgb(51, 65, 85);
  transition: all 0.2s;
}

.btn-select:hover {
  background: rgb(241, 245, 249);
}

.question-content {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
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
</style>
