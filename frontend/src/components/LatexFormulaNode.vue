<template>
  <NodeViewWrapper as="div" class="latex-formula-node" :class="{ 'is-editing': isEditing, 'is-block': displayMode }">
    <div v-if="!isEditing" @click="startEditing" class="latex-formula-display" v-html="renderedLatex"></div>
    <div v-else class="latex-formula-editor">
      <div ref="editorContainer" class="latex-editor-container"></div>
      <div class="latex-formula-actions">
        <button @click="handleSave" class="btn-save">保存</button>
        <button @click="handleCancel" class="btn-cancel">取消</button>
      </div>
    </div>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, type Ref } from 'vue'
import { NodeViewWrapper, nodeViewProps, type NodeViewProps } from '@tiptap/vue-3'
import katex from 'katex'
import 'katex/dist/katex.css'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { latex } from 'codemirror-lang-latex'
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands'
import {
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine
} from '@codemirror/view'
import { bracketMatching, foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'

const props = defineProps<NodeViewProps>()

const editorContainer: Ref<HTMLElement | null> = ref(null)
const isEditing: Ref<boolean> = ref(false)
const localLatex: Ref<string> = ref((props.node.attrs.latex as string) || '')
const displayMode: Ref<boolean> = ref((props.node.attrs.displayMode as boolean | undefined) !== false)
const renderedLatex: Ref<string> = ref('')
let view: EditorView | null = null

const renderLatex = (latexStr: string): string => {
  if (!latexStr) return ''
  try {
    return katex.renderToString(latexStr, {
      throwOnError: false,
      displayMode: displayMode.value
    })
  } catch (error) {
    console.error('LaTeX 渲染錯誤：', error)
    return `<div class="latex-error">LaTeX 錯誤: ${latexStr}</div>`
  }
}

const startEditing = (): void => {
  isEditing.value = true
  localLatex.value = (props.node.attrs.latex as string) || ''

  // 等待 DOM 更新後初始化編輯器
  setTimeout(() => {
    if (editorContainer.value && !view) {
      initEditor()
    }
  }, 0)
}

const initEditor = (): void => {
  if (!editorContainer.value) return

  const startState = EditorState.create({
    doc: localLatex.value,
    extensions: [
      lineNumbers(),
      history(),
      foldGutter(),
      drawSelection(),
      indentOnInput(),
      bracketMatching(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      latex(),
      oneDark,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          localLatex.value = update.state.doc.toString()
        }
      }),
      EditorView.domEventHandlers({
        keydown: (_view, event) => {
          // Ctrl/Cmd + Enter 保存
          if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault()
            handleSave()
            return true
          }
          // Escape 取消
          if (event.key === 'Escape') {
            event.preventDefault()
            handleCancel()
            return true
          }
          // 阻止事件冒泡到 Tiptap
          event.stopPropagation()
        }
      }),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.theme({
        '&': {
          fontSize: '14px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'
        },
        '.cm-editor': {
          borderRadius: '0.5rem',
          border: '1px solid rgb(51, 65, 85)',
          backgroundColor: 'rgb(30, 41, 59)'
        },
        '.cm-focused': {
          outline: '2px solid rgb(99, 102, 241)',
          outlineOffset: '2px'
        },
        '.cm-scroller': {
          padding: '0.75rem'
        },
        '.cm-content': {
          minHeight: '100px',
          padding: '0.5rem 0'
        }
      })
    ]
  })

  view = new EditorView({
    state: startState,
    parent: editorContainer.value
  })
}

const handleSave = (): void => {
  isEditing.value = false
  if (localLatex.value !== (props.node.attrs.latex as string)) {
    props.updateAttributes({ latex: localLatex.value })
  }
  if (view) {
    view.destroy()
    view = null
  }
}

const handleCancel = (): void => {
  isEditing.value = false
  localLatex.value = (props.node.attrs.latex as string) || ''
  if (view) {
    view.destroy()
    view = null
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

watch(
  () => props.node.attrs.displayMode as boolean | undefined,
  (newMode) => {
    displayMode.value = newMode !== false
    renderedLatex.value = renderLatex(localLatex.value)
  }
)

onBeforeUnmount(() => {
  if (view) {
    view.destroy()
    view = null
  }
})
</script>

<style scoped>
.latex-formula-node {
  margin: 1rem 0;
}

.latex-formula-display {
  cursor: pointer;
  padding: 1rem;
  border: 2px dashed transparent;
  border-radius: 0.5rem;
  text-align: center;
  transition: all 0.2s;
  background: rgba(99, 102, 241, 0.05);
}

.latex-formula-display:hover {
  border-color: rgb(99, 102, 241);
  background: rgba(99, 102, 241, 0.1);
}

.latex-formula-display.is-block {
  display: block;
}

.latex-formula-editor {
  border: 2px solid rgb(99, 102, 241);
  border-radius: 0.5rem;
  padding: 1rem;
  background: white;
}

.latex-editor-container {
  margin-bottom: 0.5rem;
}

.latex-formula-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-save,
.btn-cancel {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-save {
  background: rgb(99, 102, 241);
  color: white;
}

.btn-save:hover {
  background: rgb(79, 70, 229);
}

.btn-cancel {
  background: rgb(226, 232, 240);
  color: rgb(51, 65, 85);
}

.btn-cancel:hover {
  background: rgb(203, 213, 225);
}

.latex-error {
  color: red;
  font-style: italic;
  padding: 1rem;
  background: rgba(255, 0, 0, 0.1);
  border-radius: 0.25rem;
}
</style>
