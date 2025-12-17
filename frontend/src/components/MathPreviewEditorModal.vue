<template>
  <div class="overlay" @click.self="emit('cancel')">
    <div class="modal">
      <div class="header">
        <div class="title">編輯數學式</div>
        <button class="icon-btn" type="button" @click="emit('cancel')" title="關閉">✕</button>
      </div>

      <div class="body">
        <math-field
          ref="mathFieldRef"
          class="math-field"
          :value="localLatex"
          @input="syncFromField"
          @change="syncFromField"
          @keydown.enter.prevent="emitSave"
        ></math-field>
        <div class="hint">Enter：儲存　Esc：取消</div>
      </div>

      <div class="actions">
        <button class="btn btn-secondary" type="button" @click="emit('cancel')">取消</button>
        <button class="btn btn-primary" type="button" @click="emitSave">儲存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import 'mathlive'

const props = defineProps({
  latex: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['save', 'cancel'])

const localLatex = ref(props.latex || '')
const mathFieldRef = ref(null)

watch(
  () => props.latex,
  (v) => {
    localLatex.value = v || ''
  }
)

const syncFromField = () => {
  if (!mathFieldRef.value) return
  localLatex.value = mathFieldRef.value.value || ''
}

const emitSave = () => {
  emit('save', localLatex.value || '')
}

onMounted(async () => {
  await nextTick()
  try {
    mathFieldRef.value?.focus?.()
  } catch (e) {}

  // Esc 關閉
  const el = mathFieldRef.value
  if (el) {
    el.addEventListener('keydown', (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault()
        emit('cancel')
      }
    })
  }
})
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
  width: min(680px, calc(100vw - 32px));
  background: white;
  border-radius: 12px;
  border: 1px solid rgb(226, 232, 240);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
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

.body {
  padding: 14px;
}

.math-field {
  width: 100%;
  min-height: 54px;
  border: 1px solid rgb(203, 213, 225);
  border-radius: 8px;
  padding: 10px 12px;
  background: white;
}

.hint {
  margin-top: 8px;
  font-size: 12px;
  color: rgb(100, 116, 139);
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

