<template>
  <NodeViewWrapper as="span" class="math-field-inline" :class="{ 'is-editing': isEditing }">
    <math-field
      v-if="isEditing"
      :value="localLatex"
      @input="handleInput"
      @blur="handleBlur"
      @keydown.enter.prevent="handleBlur"
      class="math-field-editor"
      ref="mathFieldRef"
      @change="handleChange"
    ></math-field>
    <span
      v-else
      @click="startEditing"
      class="math-field-display"
      v-html="renderedLatex"
    ></span>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, type Ref } from 'vue'
import { NodeViewWrapper, nodeViewProps, type NodeViewProps } from '@tiptap/vue-3'
import katex from 'katex'
import 'katex/dist/katex.css'
import 'mathlive'

interface MathFieldElement extends HTMLElement {
  value?: string
  focus?: () => void
}

const props = defineProps<NodeViewProps>()

const isEditing: Ref<boolean> = ref(false)
const localLatex: Ref<string> = ref((props.node.attrs.latex as string) || '')
const renderedLatex: Ref<string> = ref('')
const mathFieldRef: Ref<MathFieldElement | null> = ref(null)

const renderLatex = (latexStr: string): string => {
  if (!latexStr) return ''
  try {
    return katex.renderToString(latexStr, {
      throwOnError: false,
      displayMode: false // 行內模式
    })
  } catch (error) {
    console.error('LaTeX 渲染錯誤：', error)
    return `<span class="latex-error">${latexStr}</span>`
  }
}

const startEditing = async (): Promise<void> => {
  isEditing.value = true
  localLatex.value = (props.node.attrs.latex as string) || ''
  // 等待 DOM 更新後聚焦
  await nextTick()
  if (mathFieldRef.value) {
    mathFieldRef.value.focus?.()
  }
}

const handleInput = (_event: Event): void => {
  // MathLive 的 input 事件
  if (mathFieldRef.value) {
    localLatex.value = mathFieldRef.value.value || ''
  }
}

const handleChange = (_event: Event): void => {
  // MathLive 的 change 事件
  if (mathFieldRef.value) {
    localLatex.value = mathFieldRef.value.value || ''
  }
}

const handleBlur = (): void => {
  isEditing.value = false
  if (localLatex.value !== (props.node.attrs.latex as string)) {
    props.updateAttributes({ latex: localLatex.value })
  }
}

watch(
  () => props.node.attrs.latex as string | undefined,
  (newLatex) => {
    localLatex.value = newLatex || ''
    renderedLatex.value = renderLatex(localLatex.value)
  },
  { immediate: true }
)

onMounted(() => {
  renderedLatex.value = renderLatex((props.node.attrs.latex as string) || '')
})
</script>

<style scoped>
.math-field-inline {
  display: inline-block;
  margin: 0 2px;
}

.math-field-display {
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.math-field-display:hover {
  background-color: rgba(99, 102, 241, 0.1);
}

.math-field-editor {
  display: inline-block;
  min-width: 100px;
  padding: 2px 4px;
  border: 1px solid rgb(99, 102, 241);
  border-radius: 3px;
  background: white;
}

:deep(.math-field-editor math-field) {
  font-size: 14px;
}

.latex-error {
  color: red;
  font-style: italic;
}
</style>
