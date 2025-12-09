<template>
  <aside
    id="sidebar"
    :class="[
      'fixed inset-y-0 left-0 z-40 w-72 flex-shrink-0 bg-white/95 backdrop-blur border-r border-blue-100 h-full flex flex-col p-5 transition-transform duration-300 ease-in-out',
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:relative md:flex'
    ]"
  >
    <div>
      <div class="flex items-center gap-3 rounded-2xl border border-blue-100 bg-sky-50/60 px-4 py-3">
        <img :src="logoUrl" alt="九章 Logo" class="h-10 w-auto object-cover" />
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-sky-600">九章補教</p>
          <p class="text-lg font-bold text-slate-900">管理後台</p>
        </div>
      </div>

      <nav class="mt-8 space-y-2">
        <router-link
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition"
          :class="isActive(item.name)
            ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md'
            : 'text-slate-600 hover:bg-slate-50'"
          @click="$emit('close')"
        >
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import logoUrl from '../assets/logo_jiuzhang.png'

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])

const route = useRoute()

const navItems = [
  { name: 'dashboard', label: '儀表板', path: '/' },
  { name: 'student-list', label: '學生資訊', path: '/students' },
  { name: 'teachers', label: '老師管理', path: '/teachers' },
  { name: 'courses', label: '課程管理', path: '/courses' },
  { name: 'enrollments', label: '課程報名', path: '/enrollments' },
  { name: 'attendance', label: '出缺勤', path: '/attendance' },
  { name: 'questions', label: '題庫系統', path: '/questions' },
  { name: 'lunch-orders', label: '訂便當系統', path: '/lunch-orders' },
]

const childMatchMap = {
  'student-list': ['student-list', 'student-add', 'student-edit', 'student-fees'],
  'lunch-orders': ['lunch-orders', 'group-order-detail', 'join-group-order'],
}

const isActive = (name) => {
  const current = route.name
  if (childMatchMap[name]) {
    return childMatchMap[name].includes(current)
  }
  return current === name
}
</script>

