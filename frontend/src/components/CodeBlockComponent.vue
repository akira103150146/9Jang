<template>
  <NodeViewWrapper as="div" class="code-block-wrapper" :class="{ 'is-focused': isFocused }">
    <div class="code-block-header">
      <select
        v-model="selectedLanguage"
        @change="handleLanguageChange"
        class="language-selector"
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="cpp">C++</option>
        <option value="json">JSON</option>
        <option value="latex">LaTeX</option>
        <option value="markdown">Markdown</option>
        <option value="text">Plain Text</option>
      </select>
    </div>
    <div ref="editorContainer" class="code-block-editor"></div>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, type Ref } from 'vue'
import { NodeViewWrapper, nodeViewProps, type NodeViewProps } from '@tiptap/vue-3'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState, Compartment, type Extension } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { python } from '@codemirror/lang-python'
import { json } from '@codemirror/lang-json'
import { cpp } from '@codemirror/lang-cpp'
import { markdown } from '@codemirror/lang-markdown'
import { javascript } from '@codemirror/lang-javascript'
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
import type { Editor } from '@tiptap/core'

type Language = 'javascript' | 'python' | 'cpp' | 'json' | 'latex' | 'markdown' | 'text'

const props = defineProps<NodeViewProps>()

const editorContainer: Ref<HTMLElement | null> = ref(null)
const selectedLanguage: Ref<Language> = ref((props.node.attrs.language as Language) || 'javascript')
const isFocused: Ref<boolean> = ref(false)
let view: EditorView | null = null
const languageConf = new Compartment()

const languageMap: Record<Language, (() => Extension) | (() => null)> = {
  javascript: () => javascript(),
  python: () => python(),
  cpp: () => cpp(),
  json: () => json(),
  markdown: () => markdown(),
  latex: () => latex(),
  text: () => null as unknown as Extension
}

const handleLanguageChange = (): void => {
  props.updateAttributes({ language: selectedLanguage.value })
  if (view) {
    const langFn = languageMap[selectedLanguage.value] || (() => null)
    const lang = langFn ? langFn() : null
    view.dispatch({
      effects: languageConf.reconfigure((lang || []) as Extension[])
    })
  }
}

const updateContent = (content: string): void => {
  if (!view) return

  const currentContent = view.state.doc.toString()
  if (currentContent !== content) {
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: content
      }
    })
  }
}

onMounted(() => {
  if (!editorContainer.value) return

  const langFn = languageMap[selectedLanguage.value] || (() => null)
  const lang = langFn ? langFn() : null

  const startState = EditorState.create({
    doc: props.node.textContent || '',
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
      languageConf.of((lang || []) as Extension[]),
      oneDark,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const content = update.state.doc.toString()
          // 使用 Tiptap 的 transaction 來更新節點內容
          const pos = props.getPos()
          if (pos !== undefined && pos !== null && pos >= 0 && props.editor && props.editor.view) {
            const { state, dispatch } = props.editor.view
            if (state && dispatch) {
              const node = props.node.type.create(props.node.attrs, state.schema.text(content))
              const transaction = state.tr.replaceWith(pos, pos + props.node.nodeSize, node)
              dispatch(transaction)
            }
          }
        }
        if (update.focusChanged) {
          isFocused.value = update.view.hasFocus
        }
      }),
      EditorView.domEventHandlers({
        focus: () => {
          isFocused.value = true
        },
        blur: () => {
          isFocused.value = false
        }
      }),
      // 防止 Tiptap 鍵盤快捷鍵觸發
      EditorView.domEventHandlers({
        keydown: (_view, event) => {
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
})

watch(
  () => props.node.textContent,
  (newContent) => {
    if (view && newContent) {
      updateContent(newContent)
    }
  }
)

watch(
  () => props.node.attrs.language as Language | undefined,
  (newLang) => {
    if (newLang && newLang !== selectedLanguage.value) {
      selectedLanguage.value = newLang
    }
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
.code-block-wrapper {
  margin: 1rem 0;
  border-radius: 0.5rem;
  overflow: hidden;
  background: rgb(30, 41, 59);
}

.code-block-header {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem;
  background: rgb(15, 23, 42);
  border-bottom: 1px solid rgb(51, 65, 85);
}

.language-selector {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid rgb(51, 65, 85);
  background: rgb(30, 41, 59);
  color: rgb(226, 232, 240);
  font-size: 12px;
  cursor: pointer;
}

.language-selector:hover {
  background: rgb(51, 65, 85);
}

.code-block-editor {
  width: 100%;
}

.is-focused {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
}
</style>
