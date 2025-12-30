<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-indigo-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">教學模組</p>
          <h2 class="text-2xl font-bold text-slate-900">{{ headerTitle }}</h2>
          <p class="mt-2 text-sm text-slate-500">{{ headerDescription }}</p>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="mt-6 flex space-x-4 border-b border-slate-200">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="currentTab = tab.id"
          class="pb-2 text-sm font-medium transition-colors border-b-2"
          :class="currentTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'"
        >
          {{ tab.name }}
        </button>
      </div>
      
    </header>

    <!-- 文件庫 Tab -->
    <div v-show="currentTab === 'resources'">
      <ResourceList />
    </div>

    <!-- 題庫 Tab -->
    <div v-show="currentTab === 'questions'">
      <QuestionList />
    </div>

    <!-- 模板庫 Tab -->
    <div v-show="currentTab === 'templates'">
      <TemplateList />
    </div>

    <!-- 題目表單和相關對話框已移到 ResourceList 中 -->
  </div>
</template>


<script setup lang="ts">
import { ref, computed, watch, onMounted, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import ResourceList from '../components/ResourceList.vue'
import TemplateList from '../components/TemplateList.vue'
import QuestionList from '../components/QuestionList.vue'

type TabId = 'questions' | 'resources' | 'templates'

interface Tab {
  id: TabId
  name: string
}

const route = useRoute()

// Tabs Configuration
const currentTab: Ref<TabId> = ref('questions')
const tabs: Tab[] = [
  { id: 'questions', name: '題庫' },
  { id: 'resources', name: '文件庫' },
  { id: 'templates', name: '模板庫' }
]

// 從 URL 查詢參數讀取 tab，如果有的話
onMounted(() => {
  const tab = route.query.tab as string | undefined
  if (tab && ['questions', 'resources', 'templates'].includes(tab)) {
    currentTab.value = tab as TabId
  }
})

// 監聽路由查詢參數變化，動態切換 tab
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && ['questions', 'resources', 'templates'].includes(newTab as string)) {
      currentTab.value = newTab as TabId
    }
  }
)

const headerTitle = computed<string>(() => {
  const map: Record<TabId, string> = {
    questions: '題庫管理',
    resources: '教學資源管理',
    templates: '內容模板管理'
  }
  return map[currentTab.value] || '題庫管理'
})

const headerDescription = computed<string>(() => {
  const map: Record<TabId, string> = {
    questions: '新增、編輯與管理題目，支援多種題目類型',
    resources: '創建、編輯與管理教學資源，支援多種模式',
    templates: '管理可重複使用的內容模板'
  }
  return map[currentTab.value] || '新增、編輯與管理題目'
})
</script>
