<template>
  <div class="overlay" @click.self="emit('cancel')">
    <div class="modal">
      <div class="header">
        <div class="title">{{ title }}</div>
        <button class="icon-btn" type="button" @click="emit('cancel')" title="關閉">✕</button>
      </div>

      <div class="content">
        <div class="left">
          <div class="section-title">JSON</div>
          <textarea v-model="raw" class="editor" spellcheck="false"></textarea>
          <div class="hint">提示：貼上/編輯 JSON，按儲存會直接回寫到原始 Markdown。</div>
        </div>

        <div class="right">
          <div class="section-title">預覽</div>
          <div class="preview-box">
            <component :is="previewComponent" :data="parsedForPreview" />
          </div>
          <div v-if="parseError" class="error">{{ parseError }}</div>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-secondary" type="button" @click="emit('cancel')">取消</button>
        <button class="btn btn-primary" type="button" :disabled="!!parseError" @click="emitSave">儲存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Ref, type Component } from 'vue'

interface Props {
  title?: string
  initial?: string
  previewComponent: Component | (() => Component)
}

const props = withDefaults(defineProps<Props>(), {
  title: '編輯',
  initial: '{}'
})

interface Emits {
  (e: 'save', value: string): void
  (e: 'cancel'): void
}

const emit = defineEmits<Emits>()

const raw: Ref<string> = ref(props.initial || '{}')
watch(
  () => props.initial,
  (v) => {
    raw.value = v || '{}'
  }
)

const parseError: Ref<string> = ref('')
const parsed = computed<Record<string, unknown> | null>(() => {
  try {
    parseError.value = ''
    return raw.value ? JSON.parse(raw.value) : {}
  } catch (e) {
    const error = e as Error
    parseError.value = `JSON 解析失敗：${error?.message || 'unknown'}`
    return null
  }
})

const parsedForPreview = computed<Record<string, unknown>>(() => {
  // 讓 preview 元件同時支援 {diagram_data:{...}} 或直接 {...}
  return parsed.value || {}
})

const emitSave = (): void => {
  emit('save', raw.value || '{}')
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

.editor {
  width: 100%;
  min-height: 360px;
  resize: vertical;
  border: 1px solid rgb(203, 213, 225);
  border-radius: 8px;
  padding: 10px 12px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 1.5;
}

.hint {
  margin-top: 8px;
  font-size: 12px;
  color: rgb(100, 116, 139);
}

.preview-box {
  border: 1px solid rgb(203, 213, 225);
  border-radius: 8px;
  padding: 10px;
  background: rgb(249, 250, 251);
}

.error {
  margin-top: 8px;
  font-size: 12px;
  color: rgb(220, 38, 38);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid rgb(226, 232, 240);
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
</style>

