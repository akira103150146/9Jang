<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="header">
        <div class="title">Snippets</div>
        <button class="icon-btn" type="button" @click="emit('close')" title="關閉">✕</button>
      </div>

      <div class="content">
        <div class="left">
          <div class="section-title">使用者自訂</div>

          <div v-if="snippets.length === 0" class="empty">尚未新增 snippet。</div>

          <div v-else class="list">
            <button
              v-for="(s, idx) in snippets"
              :key="`${s.label}-${idx}`"
              type="button"
              class="list-item"
              :class="{ active: selectedIndex === idx }"
              @click="select(idx)"
            >
              <div class="row">
                <span class="label">{{ s.label }}</span>
                <span class="type">{{ s.type }}</span>
              </div>
              <div class="info">{{ s.info || '（無描述）' }}</div>
            </button>
          </div>

          <div class="left-actions">
            <button class="btn btn-secondary" type="button" @click="addNew">新增</button>
            <button class="btn btn-secondary" type="button" :disabled="snippets.length === 0" @click="removeSelected">刪除</button>
            <button class="btn btn-ghost" type="button" title="點擊可插入到游標處" :disabled="!canInsert" @click="emitInsert">插入</button>
          </div>

          <div class="hint">
            - `label` 建議用 `/xxx`（slash 命令）或 `\\xxx`（LaTeX）。<br />
            - `cursorOffset` 是「插入後游標相對於內容結尾的偏移」。例如 `\\frac{}{} + cursorOffset=-3` 會把游標放在第一個 `{}` 內。
          </div>
        </div>

        <div class="right">
          <div class="section-title">編輯</div>

          <div class="form">
            <label class="field">
              <div class="field-label">label</div>
              <input v-model="draft.label" class="input" placeholder="/circuit-resistor 或 \\frac" />
            </label>

            <label class="field">
              <div class="field-label">type</div>
              <input v-model="draft.type" class="input" placeholder="latex / circuit / diagram2d / diagram3d / snippet" />
            </label>

            <label class="field">
              <div class="field-label">info</div>
              <input v-model="draft.info" class="input" placeholder="顯示在自動完成列表的說明" />
            </label>

            <label class="field">
              <div class="field-label">insert</div>
              <textarea v-model="draft.insert" class="textarea" spellcheck="false" placeholder="要插入的文字內容"></textarea>
            </label>

            <label class="field">
              <div class="field-label">cursorOffset</div>
              <input v-model.number="draft.cursorOffset" type="number" class="input" />
            </label>

            <div class="actions">
              <button class="btn btn-secondary" type="button" @click="emit('close')">關閉</button>
              <button class="btn btn-primary" type="button" :disabled="!isValid" @click="save">儲存</button>
            </div>

            <div v-if="validationError" class="error">{{ validationError }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { loadUserSnippets, saveUserSnippets } from '../services/snippets'

const emit = defineEmits(['close', 'changed', 'insert'])

const snippets = ref(loadUserSnippets())
const selectedIndex = ref(snippets.value.length > 0 ? 0 : -1)

const emptyDraft = () => ({
  label: '/example',
  type: 'snippet',
  info: '我的 snippet',
  insert: '',
  cursorOffset: 0,
})

const draft = ref(emptyDraft())

const select = (idx) => {
  selectedIndex.value = idx
  const s = snippets.value[idx]
  if (s) draft.value = { ...s }
}

watch(
  () => selectedIndex.value,
  (idx) => {
    if (idx >= 0 && snippets.value[idx]) draft.value = { ...snippets.value[idx] }
    if (idx < 0) draft.value = emptyDraft()
  },
  { immediate: true }
)

const addNew = () => {
  snippets.value = [...snippets.value, emptyDraft()]
  selectedIndex.value = snippets.value.length - 1
}

const removeSelected = () => {
  const idx = selectedIndex.value
  if (idx < 0) return
  const next = snippets.value.slice()
  next.splice(idx, 1)
  snippets.value = next
  selectedIndex.value = Math.min(idx, snippets.value.length - 1)
  persist()
}

const validationError = computed(() => {
  const label = (draft.value.label || '').trim()
  if (!label) return 'label 不能為空'
  if (!(label.startsWith('/') || label.startsWith('\\'))) return 'label 建議以 / 或 \\ 開頭（用於自動完成觸發）'
  return ''
})

const isValid = computed(() => !validationError.value)

const persist = () => {
  const saved = saveUserSnippets(snippets.value)
  snippets.value = saved
  emit('changed', saved)
}

const save = () => {
  if (!isValid.value) return
  const idx = selectedIndex.value
  if (idx < 0) {
    snippets.value = [...snippets.value, { ...draft.value }]
    selectedIndex.value = snippets.value.length - 1
  } else {
    const next = snippets.value.slice()
    next[idx] = { ...draft.value }
    snippets.value = next
  }
  persist()
}

const canInsert = computed(() => {
  const s = snippets.value[selectedIndex.value]
  return !!s && typeof s.insert === 'string' && s.insert.length > 0
})

const emitInsert = () => {
  const s = snippets.value[selectedIndex.value]
  if (!s) return
  emit('insert', { ...s })
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal {
  width: min(1100px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  background: white;
  border-radius: 12px;
  border: 1px solid rgb(226, 232, 240);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid rgb(226, 232, 240);
  background: rgb(248, 250, 252);
}

.title {
  font-weight: 700;
  color: rgb(15, 23, 42);
}

.icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: rgb(100, 116, 139);
}

.content {
  padding: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  overflow: auto;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: rgb(100, 116, 139);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

.empty {
  padding: 12px;
  border: 1px dashed rgb(203, 213, 225);
  border-radius: 8px;
  color: rgb(100, 116, 139);
  background: rgb(248, 250, 252);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 420px;
  overflow: auto;
  padding-right: 4px;
}

.list-item {
  text-align: left;
  border: 1px solid rgb(226, 232, 240);
  border-radius: 10px;
  padding: 10px 12px;
  background: white;
  cursor: pointer;
}

.list-item:hover {
  background: rgb(248, 250, 252);
}

.list-item.active {
  border-color: rgb(99, 102, 241);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: baseline;
}

.label {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-weight: 700;
  color: rgb(15, 23, 42);
}

.type {
  font-size: 12px;
  color: rgb(100, 116, 139);
}

.info {
  margin-top: 4px;
  font-size: 12px;
  color: rgb(100, 116, 139);
}

.left-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.hint {
  margin-top: 10px;
  font-size: 12px;
  color: rgb(100, 116, 139);
  line-height: 1.5;
}

.form {
  border: 1px solid rgb(226, 232, 240);
  border-radius: 12px;
  padding: 12px;
}

.field {
  display: block;
  margin-bottom: 10px;
}

.field-label {
  font-size: 12px;
  font-weight: 700;
  color: rgb(100, 116, 139);
  margin-bottom: 4px;
}

.input {
  width: 100%;
  border: 1px solid rgb(203, 213, 225);
  border-radius: 8px;
  padding: 8px 10px;
}

.textarea {
  width: 100%;
  min-height: 220px;
  resize: vertical;
  border: 1px solid rgb(203, 213, 225);
  border-radius: 8px;
  padding: 8px 10px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 1.5;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: rgb(99, 102, 241);
  color: white;
}

.btn-primary:hover {
  background: rgb(79, 70, 229);
}

.btn-secondary {
  background: rgb(226, 232, 240);
  color: rgb(51, 65, 85);
}

.btn-ghost {
  background: transparent;
  color: rgb(99, 102, 241);
}

.error {
  margin-top: 10px;
  font-size: 12px;
  color: rgb(220, 38, 38);
}
</style>
