<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden">
    <!-- 左側邊欄：設定與資源庫 -->
    <aside class="w-80 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-lg z-10 transition-all duration-300" :class="{ '-ml-80': !sidebarOpen }">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-bold text-slate-800">資源編輯器</h2>
        <button @click="sidebarOpen = false" class="text-slate-400 hover:text-slate-600 lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Tab 切換 -->
      <div class="flex border-b border-slate-100">
        <button
          v-for="tab in ['settings', 'questions', 'templates']"
          :key="tab"
          @click="currentTab = tab"
          class="flex-1 py-3 text-sm font-medium transition-colors border-b-2"
          :class="currentTab === tab ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'"
        >
          {{ tab === 'settings' ? '文件設定' : tab === 'questions' ? '題目庫' : '模板庫' }}
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <!-- 設定面板 -->
        <div v-show="currentTab === 'settings'" class="space-y-6">
          <!-- 基本資訊 -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-slate-700">標題</label>
            <input v-model="resource.title" type="text" class="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="輸入文件標題...">
          </div>

          <!-- 資源類型 -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-slate-700">類型</label>
            <select v-model="resource.resource_type" class="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              <option value="QUIZ">小考 (Quiz)</option>
              <option value="EXAM">段考卷 (Exam)</option>
              <option value="HANDOUT">講義 (Handout)</option>
              <option value="DOCUMENT">一般文件</option>
            </select>
          </div>

          <!-- 紙張設定 -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-slate-700">紙張大小</label>
            <select v-model="resource.settings.paperSize" class="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              <option value="A4">A4 (210mm x 297mm)</option>
              <option value="B4">B4 (250mm x 353mm)</option>
            </select>
          </div>

          <!-- 課程綁定 -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-slate-700">所屬課程</label>
            <select v-model="resource.course" class="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              <option :value="null">未綁定</option>
              <option v-for="c in courses" :key="c.course_id" :value="c.course_id">
                {{ c.course_name }}
              </option>
            </select>
          </div>

          <!-- 學生群組 -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-slate-700">可見學生群組</label>
            <div class="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded p-2">
              <div v-for="g in studentGroups" :key="g.group_id" class="flex items-center">
                <input
                  type="checkbox"
                  :id="`group-${g.group_id}`"
                  :value="g.group_id"
                  v-model="resource.student_group_ids"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                >
                <label :for="`group-${g.group_id}`" class="ml-2 block text-sm text-gray-900">
                  {{ g.name }}
                </label>
              </div>
            </div>
          </div>

          <!-- 標籤 -->
          <div class="space-y-3">
            <label class="block text-sm font-medium text-slate-700">標籤</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span v-for="tagId in resource.tag_ids" :key="tagId" class="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                #{{ getTagName(tagId) }}
                <button @click="removeTag(tagId)" class="ml-1 text-indigo-600 hover:text-indigo-900">×</button>
              </span>
            </div>
            <select @change="addTag($event.target.value)" class="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
              <option value="">+ 新增標籤</option>
              <option v-for="t in availableTags" :key="t.tag_id" :value="t.tag_id">
                {{ t.tag_name }}
              </option>
            </select>
          </div>
        </div>

        <!-- 模板庫面板 -->
        <div v-show="currentTab === 'templates'" class="space-y-4">
          <div class="relative">
            <input
              v-model="templateSearch"
              type="text"
              placeholder="搜尋模板..."
              class="w-full rounded-md border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 border"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- 可拖曳模板列表 -->
          <div class="space-y-3 mt-4">
            <div
              v-for="template in filteredTemplates"
              :key="template.template_id"
              draggable="true"
              @dragstart="handleTemplateDragStart($event, template)"
              class="bg-white p-3 rounded border border-slate-200 shadow-sm cursor-move hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div class="flex justify-between items-start mb-1">
                <span class="text-xs font-bold text-purple-600">模板</span>
                <span class="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">T{{ template.template_id }}</span>
              </div>
              <h4 class="text-sm font-semibold text-slate-800 mb-2">{{ template.title }}</h4>
              <div class="flex justify-between items-center">
                <div class="flex gap-1">
                  <span v-for="tag in (template.tags || []).slice(0, 2)" :key="tag" class="text-[10px] bg-purple-50 text-purple-600 px-1 rounded">#{{ tag }}</span>
                </div>
                <button @click="addTemplateBlock(template)" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  + 加入
                </button>
              </div>
            </div>
            <div v-if="filteredTemplates.length === 0" class="text-center text-sm text-slate-400 py-4">
              {{ templateSearch ? '沒有找到符合的模板' : '尚無模板，請先創建模板' }}
            </div>
          </div>
        </div>

        <!-- 題目庫面板 -->
        <div v-show="currentTab === 'questions'" class="space-y-4">
          <div class="relative">
            <input
              v-model="questionSearch"
              type="text"
              placeholder="搜尋題目..."
              class="w-full rounded-md border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 border"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- 篩選器 -->
          <div class="space-y-2">
            <div class="grid grid-cols-2 gap-2">
              <select v-model="questionFilters.subject" class="rounded border-slate-300 text-xs py-1.5 px-2">
                <option value="">所有科目</option>
                <option v-for="s in subjects" :key="s.subject_id" :value="s.subject_id">{{ s.name }}</option>
              </select>
              <select v-model="questionFilters.level" class="rounded border-slate-300 text-xs py-1.5 px-2">
                <option value="">所有年級</option>
                <option value="JHS">國中</option>
                <option value="SHS">高中</option>
                <option value="VCS">高職</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="questionFilters.chapter"
                type="text"
                placeholder="章節關鍵字"
                class="rounded border-slate-300 text-xs py-1.5 px-2"
              >
              <select v-model="questionFilters.difficulty" class="rounded border-slate-300 text-xs py-1.5 px-2">
                <option value="">所有難度</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            <div>
              <select v-model="questionFilters.tags" multiple class="w-full rounded border-slate-300 text-xs py-1.5 px-2 min-h-[60px]">
                <option value="">所有標籤</option>
                <option v-for="tag in availableTags" :key="tag.tag_id" :value="tag.tag_id">#{{ tag.tag_name }}</option>
              </select>
            </div>
            <button
              @click="resetQuestionFilters"
              class="w-full text-xs text-slate-600 hover:text-slate-800 font-semibold py-1"
            >
              清除篩選
            </button>
          </div>

          <!-- 可拖曳題目列表 -->
          <div class="space-y-3 mt-4">
            <div
              v-for="q in filteredQuestions"
              :key="q.question_id"
              draggable="true"
              @dragstart="handleDragStart($event, q)"
              class="bg-white p-3 rounded border border-slate-200 shadow-sm cursor-move hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div class="flex justify-between items-start mb-1">
                <span class="text-xs font-bold text-slate-500">{{ q.subject_name }} / {{ q.chapter }}</span>
                <span class="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Q{{ q.question_id }}</span>
              </div>
              <div class="text-sm text-slate-800 line-clamp-3 mb-2" v-html="renderMarkdownPreview(q.content)"></div>
              <div class="flex justify-between items-center">
                <div class="flex gap-1">
                  <span v-for="tag in (q.tags || []).slice(0, 2)" :key="tag" class="text-[10px] bg-indigo-50 text-indigo-600 px-1 rounded">#{{ tag }}</span>
                </div>
                <button @click="addQuestionBlock(q)" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  + 加入
                </button>
              </div>
            </div>
            <div v-if="filteredQuestions.length === 0" class="text-center text-sm text-slate-400 py-4">
              沒有找到符合的題目
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主要編輯區 -->
    <main class="flex-1 flex flex-col min-w-0 bg-slate-100/50">
      <!-- 頂部工具列 -->
      <header class="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="text-slate-500 hover:text-indigo-600 transition-colors" title="返回">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <button @click="sidebarOpen = !sidebarOpen" class="text-slate-500 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div class="flex flex-col">
            <h1 class="text-lg font-bold text-slate-800 leading-tight">
              {{ resource.title || '未命名文件' }}
            </h1>
            <span class="text-xs text-slate-400 flex items-center gap-1">
              <span v-if="isSaving" class="text-amber-500">儲存中...</span>
              <span v-else-if="lastSaved" class="text-green-600">已儲存於 {{ formatTime(lastSaved) }}</span>
              <span v-else>尚未儲存</span>
            </span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button @click="print" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            列印 / 預覽 PDF
          </button>
          <button @click="saveResource(true)" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            儲存
          </button>
        </div>
      </header>

      <!-- 畫布區域 -->
      <div 
        class="flex-1 overflow-auto p-8 relative flex flex-col items-center gap-4" 
        @dragover.prevent="handleDragOver"
        @drop="handleDrop"
        ref="canvasContainer"
      >
        <!-- 磁吸對齊線 -->
        <div
          v-if="snapLine.show"
          class="fixed pointer-events-none z-50"
          :class="snapLine.type === 'horizontal' ? 'w-full h-0.5 bg-indigo-500' : 'w-0.5 h-full bg-indigo-500'"
          :style="{
            left: snapLine.type === 'vertical' ? `${snapLine.position}px` : '0',
            top: snapLine.type === 'horizontal' ? `${snapLine.position}px` : '0',
            opacity: snapLine.show ? 1 : 0,
            transition: 'opacity 0.1s'
          }"
        ></div>

        <!-- 動態生成的頁面 -->
        <div
          v-for="pageIndex in totalPages"
          :key="pageIndex"
          ref="pageContainers"
          class="bg-white shadow-xl relative print:shadow-none print:mb-0 print-paper"
          :class="[
            resource.settings.paperSize === 'A4' ? 'w-[210mm]' : 'w-[250mm]',
            pageIndex < totalPages ? 'mb-4' : ''
          ]"
          :style="{
            padding: '20mm',
            minHeight: resource.settings.paperSize === 'A4' ? '297mm' : '353mm',
            height: pageIndex === totalPages ? 'auto' : (resource.settings.paperSize === 'A4' ? '297mm' : '353mm')
          }"
          @dragover.prevent="handlePageDragOver($event, pageIndex)"
          @drop="handlePageDrop($event, pageIndex)"
        >
          <!-- 頁面標題 (僅編輯時顯示) -->
          <div class="absolute -top-8 left-0 text-xs text-slate-400 font-medium print:hidden">
            第 {{ pageIndex }} 頁
          </div>

          <!-- 區塊列表 -->
          <div 
            ref="pageContentContainers"
            class="space-y-4 relative"
            :data-page="pageIndex"
          >
            <div
              v-for="(block, index) in getBlocksForPage(pageIndex)"
              :key="block.id || `block-${index}`"
              :data-block-id="block.id"
              :data-block-index="getGlobalBlockIndex(block)"
              draggable="true"
              @dragstart="handleBlockDragStart($event, block, getGlobalBlockIndex(block))"
              @dragend="handleBlockDragEnd"
              @dragover.prevent="handleBlockDragOver($event, block, getGlobalBlockIndex(block))"
              class="group relative border border-transparent hover:border-indigo-300 rounded p-1 -m-1 transition-all cursor-move"
              :class="{ 
                'break-inside-avoid': block.type === 'question',
                'opacity-50': draggingBlock?.id === block.id,
                'ring-2 ring-indigo-400': draggingBlock?.id === block.id
              }"
            >
              <!-- 拖動手柄 -->
              <div class="absolute -left-6 top-2 opacity-0 group-hover:opacity-100 print:hidden transition-opacity cursor-grab active:cursor-grabbing">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
                </svg>
              </div>

              <!-- 區塊操作按鈕 (Hover 顯示) -->
              <div class="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 flex flex-col gap-1 print:hidden z-20">
                <button @click="moveBlock(getGlobalBlockIndex(block), -1)" class="p-1 bg-white border border-slate-200 rounded text-slate-400 hover:text-indigo-600 shadow-sm" title="上移">↑</button>
                <button @click="moveBlock(getGlobalBlockIndex(block), 1)" class="p-1 bg-white border border-slate-200 rounded text-slate-400 hover:text-indigo-600 shadow-sm" title="下移">↓</button>
                <button @click="removeBlock(getGlobalBlockIndex(block))" class="p-1 bg-white border border-slate-200 rounded text-slate-400 hover:text-rose-600 shadow-sm" title="刪除">×</button>
              </div>

              <!-- 區塊內容 -->
              <template v-if="block.type === 'text'">
                <div class="prose max-w-none">
                  <MarkdownEditor
                    :ref="el => { if (el) markdownEditorRefs[block.id] = el }"
                    v-model="block.content"
                    :placeholder="'輸入文字...'"
                    class="border-none shadow-none bg-transparent"
                  />
                </div>
              </template>

              <template v-else-if="block.type === 'question'">
                <QuestionBlock :question-id="block.question_id" />
              </template>

              <template v-else-if="block.type === 'template'">
                <TemplateBlock :template-id="block.template_id" />
              </template>

              <template v-else-if="block.type === 'page_break'">
                <div class="flex items-center gap-4 py-4 select-none print:hidden">
                  <div class="h-px bg-red-200 flex-1 border-t border-dashed border-red-300"></div>
                  <span class="text-xs font-bold text-red-400 uppercase tracking-wider">強制分頁 (Page Break)</span>
                  <div class="h-px bg-red-200 flex-1 border-t border-dashed border-red-300"></div>
                </div>
                <!-- 列印時實際產生分頁 -->
                <div class="hidden print:block break-after-page"></div>
              </template>
            </div>

            <!-- 插入指示器 (拖動時顯示) -->
            <div
              v-if="dragOverPage === pageIndex && dragOverIndex !== null"
              class="h-1 bg-indigo-500 rounded-full transition-all"
              :style="{ marginTop: '-0.5rem', marginBottom: '-0.5rem' }"
            ></div>

            <!-- 新增區塊按鈕 (僅最後一頁顯示) -->
            <div v-if="pageIndex === totalPages" class="h-8 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity group print:hidden">
              <div class="flex gap-2">
                <button @click="addBlock('text')" class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-bold hover:bg-indigo-100 transition-colors shadow-sm border border-indigo-200">+ 文字</button>
                <button @click="sidebarOpen = true; currentTab = 'questions'" class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-bold hover:bg-indigo-100 transition-colors shadow-sm border border-indigo-200">+ 題目</button>
                <button @click="addBlock('page_break')" class="px-3 py-1 bg-red-50 text-red-600 rounded text-xs font-bold hover:bg-red-100 transition-colors shadow-sm border border-red-200">+ 分頁</button>
              </div>
            </div>
          </div>
          
          <!-- 空白狀態提示 (僅第一頁且無內容時顯示) -->
          <div v-if="pageIndex === 1 && structure.length === 0" class="h-40 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            <p>拖曳題目至此，或點擊下方按鈕開始編輯</p>
            <div class="flex gap-2 mt-4">
              <button @click="addBlock('text')" class="px-4 py-2 bg-white border border-slate-300 rounded shadow-sm text-sm hover:bg-slate-50 text-slate-700">新增文字區塊</button>
              <button @click="sidebarOpen = true; currentTab = 'questions'" class="px-4 py-2 bg-indigo-600 border border-transparent rounded shadow-sm text-sm hover:bg-indigo-700 text-white">瀏覽題目庫</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { learningResourceAPI, courseAPI, studentGroupAPI, hashtagAPI, questionBankAPI, subjectAPI, contentTemplateAPI } from '../services/api'
import MarkdownEditor from '../components/MarkdownEditor.vue'
import QuestionBlock from '../components/QuestionBlock.vue'
import TemplateBlock from '../components/TemplateBlock.vue'
import { useMarkdownRenderer } from '../composables/useMarkdownRenderer'

// Simple debounce function
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const route = useRoute()
const router = useRouter()
const { renderMarkdownWithLatex } = useMarkdownRenderer()

// 返回上一頁
const goBack = () => {
  // 如果有上一頁歷史，則返回；否則跳轉到題庫頁面
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/questions')
  }
}

// State
const sidebarOpen = ref(true)
const currentTab = ref('settings')
const isSaving = ref(false)
const lastSaved = ref(null)
const courses = ref([])
const studentGroups = ref([])
const availableTags = ref([])
const subjects = ref([])
const questions = ref([])
const loadingQuestions = ref(false)
const templates = ref([])
const templateSearch = ref('')

// Resource Data
const resource = reactive({
  title: '未命名文件',
  resource_type: 'QUIZ',
  course: null,
  student_group_ids: [],
  tag_ids: [],
  settings: {
    paperSize: 'A4',
    orientation: 'portrait'
  }
})

const structure = ref([])

// Refs for page calculation
const paperContainer = ref(null)
const contentContainer = ref(null)
const canvasContainer = ref(null)
const pageContainers = ref([])
const pageContentContainers = ref([])
const totalPages = ref(1)
const markdownEditorRefs = ref({})

// Drag & Drop state
const draggingBlock = ref(null)
const dragOverPage = ref(null)
const dragOverIndex = ref(null)
const snapLine = reactive({
  show: false,
  type: 'horizontal', // 'horizontal' or 'vertical'
  position: 0
})

// Filters
const questionSearch = ref('')
const questionFilters = reactive({
  subject: '',
  level: '',
  chapter: '',
  difficulty: '',
  tags: [],
  source: ''
})

const resetQuestionFilters = () => {
  questionFilters.subject = ''
  questionFilters.level = ''
  questionFilters.chapter = ''
  questionFilters.difficulty = ''
  questionFilters.tags = []
  questionFilters.source = ''
  questionSearch.value = ''
}

// Computed
const filteredQuestions = computed(() => {
  return questions.value.filter(q => {
    const matchSearch = !questionSearch.value || 
      q.content.toLowerCase().includes(questionSearch.value.toLowerCase()) || 
      q.chapter.toLowerCase().includes(questionSearch.value.toLowerCase())
    
    const matchSubject = !questionFilters.subject || q.subject === questionFilters.subject || q.subject_id === questionFilters.subject
    const matchLevel = !questionFilters.level || q.level === questionFilters.level
    const matchChapter = !questionFilters.chapter || q.chapter.toLowerCase().includes(questionFilters.chapter.toLowerCase())
    const matchDifficulty = !questionFilters.difficulty || q.difficulty === parseInt(questionFilters.difficulty)
    const matchTags = !questionFilters.tags || questionFilters.tags.length === 0 || 
      (q.tags && questionFilters.tags.some(tagId => 
        q.tags.some(tag => typeof tag === 'object' ? tag.tag_id === parseInt(tagId) : tag === tagId)
      ))
    
    return matchSearch && matchSubject && matchLevel && matchChapter && matchDifficulty && matchTags
  }).slice(0, 50) // Limit display
})

const filteredTemplates = computed(() => {
  return templates.value.filter(t => {
    const matchSearch = !templateSearch.value || 
      t.title.toLowerCase().includes(templateSearch.value.toLowerCase())
    return matchSearch
  })
})

// Methods
const getTagName = (id) => {
  const tag = availableTags.value.find(t => t.tag_id === id)
  return tag ? tag.tag_name : 'Unknown'
}

const addTag = (id) => {
  if (!id) return
  const tagId = parseInt(id)
  if (!resource.tag_ids.includes(tagId)) {
    resource.tag_ids.push(tagId)
  }
}

const removeTag = (id) => {
  const index = resource.tag_ids.indexOf(id)
  if (index > -1) resource.tag_ids.splice(index, 1)
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString()
}

const renderMarkdownPreview = (content) => {
  // Simple preview, strip tags or just render first line
  if (!content) return ''
  return renderMarkdownWithLatex(content.substring(0, 100) + (content.length > 100 ? '...' : ''))
}

// Block Operations
const addBlock = async (type, content = '') => {
  const newBlock = {
    id: Date.now() + Math.random(),
    type,
    content: type === 'text' ? content : null,
    question_id: null
  }
  structure.value.push(newBlock)
  
  // 如果是文字區塊，等待 DOM 更新後自動聚焦
  if (type === 'text') {
    await nextTick()
    setTimeout(() => {
      const editor = markdownEditorRefs.value[newBlock.id]
      if (editor && editor.focus) {
        editor.focus()
      }
    }, 100)
  }
  
  // 自動新增頁面如果需要的話
  setTimeout(() => {
    ensurePages()
  }, 100)
  return newBlock
}

const addQuestionBlock = (question) => {
  const newBlock = {
    id: Date.now() + Math.random(),
    type: 'question',
    question_id: question.question_id
  }
  structure.value.push(newBlock)
  // 自動新增頁面如果需要的話
  setTimeout(() => {
    ensurePages()
  }, 100)
  return newBlock
}

const addTemplateBlock = (template) => {
  const newBlock = {
    id: Date.now() + Math.random(),
    type: 'template',
    template_id: template.template_id
  }
  structure.value.push(newBlock)
  // 自動新增頁面如果需要的話
  setTimeout(() => {
    ensurePages()
  }, 100)
  return newBlock
}

const handleTemplateDragStart = (event, template) => {
  event.dataTransfer.setData('application/json', JSON.stringify({ type: 'template', template }))
  event.dataTransfer.effectAllowed = 'copy'
}

const removeBlock = (index) => {
  structure.value.splice(index, 1)
  // 重新計算頁數
  setTimeout(() => {
    ensurePages()
  }, 100)
}

const moveBlock = (index, direction) => {
  if (index + direction < 0 || index + direction >= structure.value.length) return
  const temp = structure.value[index]
  structure.value[index] = structure.value[index + direction]
  structure.value[index + direction] = temp
  setTimeout(() => {
    ensurePages()
  }, 100)
}

// 獲取區塊所在的頁面
const getBlockPage = (blockIndex) => {
  if (!pageContentContainers.value.length) return 1
  
  // 計算累積高度來判斷區塊應該在哪一頁
  const pageHeightMm = resource.settings.paperSize === 'A4' ? 297 : 353
  const usableHeightMm = pageHeightMm - 40 // 減去 padding
  
  // 簡單實現：根據區塊索引和每頁可容納的區塊數估算
  // 實際應該根據 DOM 位置計算，這裡先簡化
  let currentHeight = 0
  let currentPage = 1
  
  for (let i = 0; i < blockIndex; i++) {
    // 估算每個區塊的高度（這裡簡化為固定值，實際應該測量）
    const estimatedBlockHeight = 50 // mm，實際應該動態計算
    if (currentHeight + estimatedBlockHeight > usableHeightMm) {
      currentPage++
      currentHeight = estimatedBlockHeight
    } else {
      currentHeight += estimatedBlockHeight
    }
  }
  
  return currentPage
}

// 獲取指定頁面的區塊 - 根據累積高度分配
const getBlocksForPage = (pageIndex) => {
  if (pageIndex > totalPages.value || structure.value.length === 0) return []
  if (totalPages.value === 1) return structure.value
  
  const pageHeightMm = resource.settings.paperSize === 'A4' ? 297 : 353
  const usableHeightMm = pageHeightMm - 40 // 減去上下 padding
  
  // 計算每個區塊應該在哪一頁
  const pageBlocks = []
  let currentPage = 1
  let currentPageHeight = 0
  
  for (let i = 0; i < structure.value.length; i++) {
    const block = structure.value[i]
    
    // 估算區塊高度（mm）- 實際應該從已渲染的 DOM 獲取
    let blockHeightMm = 40 // 默認高度
    
    // 嘗試從 DOM 獲取實際高度（如果已經渲染）
    if (canvasContainer.value) {
      const blockEl = canvasContainer.value.querySelector(`[data-block-id="${block.id}"]`)
      if (blockEl) {
        // 獲取實際高度並轉換為 mm
        const rect = blockEl.getBoundingClientRect()
        const mmToPx = 3.7795 // 簡化轉換
        blockHeightMm = rect.height / mmToPx
      }
    }
    
    // 如果當前頁面放不下，移到下一頁
    if (currentPageHeight + blockHeightMm > usableHeightMm && currentPageHeight > 0) {
      currentPage++
      currentPageHeight = blockHeightMm
    } else {
      currentPageHeight += blockHeightMm
    }
    
    // 如果這個區塊屬於目標頁面，添加到結果中
    if (currentPage === pageIndex) {
      pageBlocks.push(block)
    } else if (currentPage > pageIndex) {
      // 已經超過目標頁面，停止
      break
    }
  }
  
  return pageBlocks
}

// 獲取區塊的全域索引
const getGlobalBlockIndex = (block) => {
  return structure.value.findIndex(b => b.id === block.id)
}

// 確保有足夠的頁面
const ensurePages = () => {
  calculatePages()
}

// Drag & Drop - 從側邊欄拖動題目
const handleDragStart = (event, question) => {
  event.dataTransfer.setData('application/json', JSON.stringify(question))
  event.dataTransfer.effectAllowed = 'copy'
}

const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDrop = (event) => {
  try {
    const data = event.dataTransfer.getData('application/json')
    if (data) {
      const item = JSON.parse(data)
      if (item.type === 'template') {
        addTemplateBlock(item.template)
      } else {
        // 預設為 question
        addQuestionBlock(item)
      }
    }
  } catch (e) {
    console.error('Drop error', e)
  }
}

// 區塊拖動
const handleBlockDragStart = (event, block, index) => {
  draggingBlock.value = { ...block, originalIndex: index }
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', '') // 某些瀏覽器需要這個
  event.target.style.opacity = '0.5'
}

const handleBlockDragEnd = (event) => {
  event.target.style.opacity = '1'
  draggingBlock.value = null
  dragOverPage.value = null
  dragOverIndex.value = null
  snapLine.show = false
}

const handleBlockDragOver = (event, block, index) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  
  if (!draggingBlock.value || draggingBlock.value.id === block.id) return
  
  const rect = event.currentTarget.getBoundingClientRect()
  const mouseY = event.clientY
  const blockMiddle = rect.top + rect.height / 2
  
  // 判斷插入位置
  const insertBefore = mouseY < blockMiddle
  const newIndex = insertBefore ? index : index + 1
  
  dragOverIndex.value = newIndex
  
  // 磁吸對齊：檢查是否接近其他區塊的邊緣
  checkSnapAlignment(event, block, index)
}

const handlePageDragOver = (event, pageIndex) => {
  event.preventDefault()
  if (!draggingBlock.value) return
  
  dragOverPage.value = pageIndex
  
  // 如果拖動到頁面底部，顯示插入指示器
  const rect = event.currentTarget.getBoundingClientRect()
  const mouseY = event.clientY
  const pageBottom = rect.bottom
  
  if (mouseY > pageBottom - 50) {
    // 接近頁面底部，在最後插入
    const pageBlocks = getBlocksForPage(pageIndex)
    dragOverIndex.value = pageBlocks.length
  }
}

const handlePageDrop = (event, pageIndex) => {
  event.preventDefault()
  
  if (!draggingBlock.value) {
    // 可能是從側邊欄拖動的題目
    handleDrop(event)
    return
  }
  
  // 移動區塊到新位置
  const originalIndex = draggingBlock.value.originalIndex
  const targetIndex = dragOverIndex.value !== null ? dragOverIndex.value : structure.value.length
  
  if (originalIndex !== targetIndex && originalIndex !== targetIndex - 1) {
    // 移除原位置
    const block = structure.value.splice(originalIndex, 1)[0]
    
    // 插入新位置
    const insertIndex = originalIndex < targetIndex ? targetIndex - 1 : targetIndex
    structure.value.splice(insertIndex, 0, block)
  }
  
  // 重置狀態
  draggingBlock.value = null
  dragOverPage.value = null
  dragOverIndex.value = null
  snapLine.show = false
  
  // 確保頁面足夠
  setTimeout(() => {
    ensurePages()
  }, 100)
}

// 磁吸對齊檢查
const checkSnapAlignment = (event, block, index) => {
  if (!canvasContainer.value) return
  
  const containerRect = canvasContainer.value.getBoundingClientRect()
  const mouseY = event.clientY
  const mouseX = event.clientX
  
  const snapThreshold = 10 // 像素
  
  // 檢查水平對齊（與其他區塊的垂直位置對齊）
  let snapY = null
  let snapX = null
  
  // 獲取所有區塊元素
  const allBlocks = canvasContainer.value.querySelectorAll('[data-block-id]')
  
  for (const otherBlock of allBlocks) {
    if (otherBlock.getAttribute('data-block-id') === block.id.toString()) continue
    
    const blockRect = otherBlock.getBoundingClientRect()
    
    // 檢查頂部對齊
    if (Math.abs(mouseY - blockRect.top) < snapThreshold) {
      snapY = blockRect.top - containerRect.top
    }
    
    // 檢查底部對齊
    if (Math.abs(mouseY - blockRect.bottom) < snapThreshold) {
      snapY = blockRect.bottom - containerRect.top
    }
    
    // 檢查左側對齊
    if (Math.abs(mouseX - blockRect.left) < snapThreshold) {
      snapX = blockRect.left - containerRect.left
    }
    
    // 檢查右側對齊
    if (Math.abs(mouseX - blockRect.right) < snapThreshold) {
      snapX = blockRect.right - containerRect.left
    }
  }
  
  // 顯示對齊線
  if (snapY !== null) {
    snapLine.show = true
    snapLine.type = 'horizontal'
    snapLine.position = snapY
  } else if (snapX !== null) {
    snapLine.show = true
    snapLine.type = 'vertical'
    snapLine.position = snapX
  } else {
    snapLine.show = false
  }
}

// Data Fetching
const fetchInitialData = async () => {
  try {
    const [cRes, gRes, tRes, sRes, qRes, templateRes] = await Promise.all([
      courseAPI.getAll(),
      studentGroupAPI.getAll(),
      hashtagAPI.getAll(),
      subjectAPI.getAll(),
      questionBankAPI.getAll(), // Fetch all for sidebar, optimize later with pagination/search API
      contentTemplateAPI.getAll()
    ])
    
    courses.value = cRes.data.results || cRes.data
    studentGroups.value = gRes.data.results || gRes.data
    availableTags.value = tRes.data.results || tRes.data
    subjects.value = sRes.data.results || sRes.data
    questions.value = qRes.data.results || qRes.data
    templates.value = templateRes.data.results || templateRes.data
    
    // If edit mode
    if (route.params.id) {
      const res = await learningResourceAPI.getById(route.params.id)
      const data = res.data
      resource.title = data.title
      resource.resource_type = data.resource_type
      resource.course = data.course
      resource.student_group_ids = data.student_group_ids || []
      resource.tag_ids = data.tag_ids || []
      resource.settings = data.settings || { paperSize: 'A4', orientation: 'portrait' }
      structure.value = data.structure || []
    } else if (route.query.template_id) {
      // 如果從 template 創建，載入 template 內容
      try {
        const templateRes = await contentTemplateAPI.getById(route.query.template_id)
        const template = templateRes.data
        if (template.structure && template.structure.length > 0) {
          // 將 template 的 structure 插入到文件開頭
          structure.value = [...template.structure]
        }
      } catch (error) {
        console.error('載入模板失敗：', error)
      }
    }
  } catch (error) {
    console.error('Failed to load data', error)
  }
}

// Saving
const saveResource = async (manual = false) => {
  if (!resource.title) return
  isSaving.value = true
  
  const payload = {
    ...resource,
    structure: structure.value,
    tag_ids_input: resource.tag_ids,
    student_group_ids: resource.student_group_ids
  }
  
  try {
    let response
    if (route.params.id) {
      response = await learningResourceAPI.update(route.params.id, payload)
    } else {
      response = await learningResourceAPI.create(payload)
      // Redirect to edit mode if created
      if (!route.params.id && manual) {
        router.replace(`/resources/edit/${response.data.resource_id}`)
      }
    }
    lastSaved.value = new Date()
  } catch (error) {
    console.error('Save failed', error)
    if (manual) alert('儲存失敗')
  } finally {
    isSaving.value = false
  }
}

// Auto-save
const debouncedSave = debounce(() => saveResource(false), 3000)

watch(
  [() => resource, structure],
  () => {
    if (route.params.id || resource.title !== '未命名文件') { // Only auto-save if editing or title changed
      debouncedSave()
    }
  },
  { deep: true }
)

const print = async () => {
  // 使用 iframe 隔離列印內容，確保樣式不受影響
  await nextTick() // 確保 DOM 已更新
  
  // 獲取所有有內容的頁面
  const paperElements = document.querySelectorAll('.print-paper')
  const pagesWithContent = Array.from(paperElements).filter(page => {
    // 檢查頁面是否有實際內容（排除空白頁）
    const hasBlocks = page.querySelector('[data-block-id]')
    const hasText = page.textContent.trim().length > 0
    return hasBlocks || hasText
  })
  
  if (pagesWithContent.length === 0) {
    alert('沒有可列印的內容')
    return
  }
  
  // 創建 iframe 用於列印
  const printFrame = document.createElement('iframe')
  printFrame.style.position = 'fixed'
  printFrame.style.right = '0'
  printFrame.style.bottom = '0'
  printFrame.style.width = '0'
  printFrame.style.height = '0'
  printFrame.style.border = '0'
  document.body.appendChild(printFrame)
  
  // 等待 iframe 載入
  await new Promise(resolve => {
    printFrame.onload = resolve
    printFrame.src = 'about:blank'
  })
  
  const iframeDoc = printFrame.contentDocument || printFrame.contentWindow.document
  
  // 複製必要的樣式表
  const stylesheets = Array.from(document.styleSheets)
  let styleContent = ''
  
  for (const sheet of stylesheets) {
    try {
      if (sheet.href) {
        // 外部樣式表
        const link = iframeDoc.createElement('link')
        link.rel = 'stylesheet'
        link.href = sheet.href
        iframeDoc.head.appendChild(link)
      } else {
        // 內聯樣式表
        const rules = Array.from(sheet.cssRules || [])
        for (const rule of rules) {
          styleContent += rule.cssText + '\n'
        }
      }
    } catch (e) {
      // 跨域樣式表可能無法訪問，跳過
      console.warn('無法複製樣式表:', e)
    }
  }
  
  // 添加內聯樣式
  const styleEl = iframeDoc.createElement('style')
  styleEl.textContent = styleContent + `
    @page {
      size: ${resource.settings.paperSize === 'A4' ? 'A4' : 'B4'};
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
      background: white;
    }
    .print-paper {
      width: ${resource.settings.paperSize === 'A4' ? '210mm' : '250mm'};
      min-height: ${resource.settings.paperSize === 'A4' ? '297mm' : '353mm'};
      padding: 20mm;
      margin: 0 auto;
      background: white;
      box-sizing: border-box;
    }
    /* KaTeX 分數樣式已從 markdown-preview.css 中自動包含 */
  `
  iframeDoc.head.appendChild(styleEl)
  
  // 複製頁面內容到 iframe
  const container = iframeDoc.createElement('div')
  container.style.background = 'white'
  
  pagesWithContent.forEach((page, index) => {
    const clone = page.cloneNode(true)
    // 確保所有樣式都被複製
    const computedStyle = window.getComputedStyle(page)
    clone.style.cssText = computedStyle.cssText
    clone.style.margin = '0'
    clone.style.marginBottom = index < pagesWithContent.length - 1 ? '20mm' : '0'
    container.appendChild(clone)
  })
  
  iframeDoc.body.appendChild(container)
  
  // 等待內容渲染
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 觸發列印
  printFrame.contentWindow.focus()
  printFrame.contentWindow.print()
  
  // 列印完成後清理
  setTimeout(() => {
    document.body.removeChild(printFrame)
  }, 1000)
}

// 計算總頁數 - 根據實際內容高度
const calculatePages = () => {
  if (structure.value.length === 0) {
    totalPages.value = 1
    return
  }
  
  // 等待 DOM 更新
  setTimeout(() => {
    const pageHeightMm = resource.settings.paperSize === 'A4' ? 297 : 353
    const usableHeightMm = pageHeightMm - 40 // 減去上下 padding
    
    let currentPageHeight = 0
    let pages = 1
    
    // 遍歷所有區塊來計算需要的頁數
    for (let i = 0; i < structure.value.length; i++) {
      const block = structure.value[i]
      
      // 估算區塊高度（mm）
      let blockHeightMm = 40 // 默認高度
      
      // 嘗試從 DOM 獲取實際高度
      if (canvasContainer.value) {
        const blockEl = canvasContainer.value.querySelector(`[data-block-id="${block.id}"]`)
        if (blockEl) {
          const rect = blockEl.getBoundingClientRect()
          const mmToPx = 3.7795
          blockHeightMm = rect.height / mmToPx
        }
      }
      
      // 如果當前頁面放不下，新增一頁
      if (currentPageHeight + blockHeightMm > usableHeightMm && currentPageHeight > 0) {
        pages++
        currentPageHeight = blockHeightMm
      } else {
        currentPageHeight += blockHeightMm
      }
    }
    
    // 至少需要 1 頁，確保有足夠的頁面
    totalPages.value = Math.max(1, pages)
  }, 150)
}

// 使用 ResizeObserver 監聽內容變化
let resizeObserver = null

onMounted(() => {
  fetchInitialData()
  
  // 等待 DOM 更新後計算頁數
  setTimeout(() => {
    if (canvasContainer.value) {
      calculatePages()
      
      // 設置 ResizeObserver 來監聽內容變化
      resizeObserver = new ResizeObserver(() => {
        calculatePages()
      })
      
      // 監聽所有頁面容器
      if (pageContentContainers.value.length > 0) {
        pageContentContainers.value.forEach(container => {
          if (container) resizeObserver.observe(container)
        })
      }
      
      // 也監聽整個畫布容器
      resizeObserver.observe(canvasContainer.value)
    }
  }, 200)
})

// 監聽結構和紙張大小變化
watch(
  [() => structure.value, () => resource.settings.paperSize],
  () => {
    setTimeout(() => {
      ensurePages()
    }, 100)
  },
  { deep: true }
)

// 清理 ResizeObserver
onUnmounted(() => {
  if (resizeObserver && contentContainer.value) {
    resizeObserver.unobserve(contentContainer.value)
    resizeObserver.disconnect()
  }
})
</script>

<style scoped>
/* 拖動時的視覺效果 */
[draggable="true"] {
  user-select: none;
}

[draggable="true"]:active {
  cursor: grabbing;
}

/* 磁吸對齊線動畫 */
@keyframes snapPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 拖動指示器 */
.drag-indicator {
  height: 2px;
  background: linear-gradient(90deg, transparent, #6366f1, transparent);
  animation: snapPulse 1s ease-in-out infinite;
}

@media print {
  @page {
    size: A4;
    margin: 0;
  }
  
  /* 隱藏側邊欄 */
  aside {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* 隱藏頂部工具列 */
  header {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* 隱藏所有按鈕 */
  button {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* 隱藏拖動手柄和操作按鈕 */
  .absolute.-left-6,
  .absolute.-right-8,
  .group-hover\:opacity-100,
  .print\:hidden {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* 頁面標題隱藏 */
  .absolute.-top-8 {
    display: none !important;
  }
  
  /* 空白狀態提示隱藏 */
  .h-40.flex {
    display: none !important;
  }
  
  /* 新增區塊按鈕隱藏 */
  .h-8.flex.items-center {
    display: none !important;
  }
  
  /* 重置根容器和主容器，確保列印時正確顯示 */
  .flex.h-screen {
    display: block !important;
    height: auto !important;
    background: white !important;
    overflow: visible !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  /* 確保主容器正確顯示 */
  main.flex-1 {
    display: block !important;
    background: white !important;
    overflow: visible !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  /* 確保畫布容器正確顯示 */
  .flex-1.overflow-auto {
    display: block !important;
    padding: 0 !important;
    overflow: visible !important;
    background: white !important;
    position: static !important;
    margin: 0 !important;
  }
  
  /* 顯示並格式化頁面容器 - 保持 A4 尺寸 */
  .print-paper {
    box-shadow: none !important;
    width: 210mm !important;
    max-width: 210mm !important;
    min-width: 210mm !important;
    padding: 20mm !important;
    margin: 0 auto !important;
    page-break-after: auto;
    position: relative;
    left: 0;
    top: 0;
    background: white !important;
    display: block !important;
    box-sizing: border-box !important;
  }
  
  /* 確保 .print-paper 內的所有內容正確顯示 - 只設置必要的屬性 */
  .print-paper img,
  .print-paper table {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  
  /* 確保題目內容正確顯示 - 不要過度覆蓋 prose 樣式 */
  .question-content {
    visibility: visible !important;
    color: black !important;
  }
  
  /* 確保 prose 樣式正常顯示，只設置必要的顏色 */
  .prose {
    visibility: visible !important;
    color: black !important;
  }
  
  .prose p,
  .prose h1,
  .prose h2,
  .prose h3,
  .prose h4,
  .prose h5,
  .prose h6,
  .prose ul,
  .prose ol,
  .prose li,
  .prose strong,
  .prose em {
    color: black !important;
    visibility: visible !important;
  }
  
  /* 確保 prose 內的 KaTeX 不受 prose 的 line-height 影響 */
  .prose .katex,
  .prose .katex * {
    line-height: normal !important;
  }
  
  /* 確保整個頁面背景是白色 */
  body,
  html {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
  }
  
  .break-after-page {
    page-break-after: always;
    break-after: page;
  }
  
  .break-inside-avoid {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  
  /* 確保區塊不會被分頁切斷 */
  .group {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  
  /* 確保 Markdown 編輯器在列印時顯示內容 */
  :deep(.cm-editor) {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
  }
  
  :deep(.cm-scroller) {
    overflow: visible !important;
  }
  
  :deep(.cm-content) {
    padding: 0 !important;
    background: transparent !important;
  }
  
  /* 隱藏 CodeMirror 的行號和編輯器 UI */
  :deep(.cm-lineNumbers),
  :deep(.cm-gutters),
  :deep(.cm-activeLineGutter) {
    display: none !important;
  }
  
  /* 確保文字可選和可讀 */
  :deep(.cm-line) {
    color: black !important;
  }
}
</style>

<!-- 非 scoped 的列印樣式，確保能應用到所有元素 -->
<style>
@media print {
  @page {
    size: A4;
    margin: 0;
  }
  
  /* 強制隱藏所有捲軸 */
  * {
    overflow: visible !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  
  *::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
    background: transparent !important;
  }
  
  /* 強制隱藏側邊欄及其所有子元素 - 使用多種選擇器確保匹配 */
  aside,
  aside *,
  body > div > aside,
  body > div > aside *,
  .flex.h-screen > aside,
  .flex.h-screen > aside * {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    position: absolute !important;
    left: -9999px !important;
  }
  
  /* 強制隱藏頂部工具列及其所有子元素 - 使用多種選擇器確保匹配 */
  header,
  header *,
  main > header,
  main > header *,
  main.flex-1 > header,
  main.flex-1 > header * {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    position: absolute !important;
    left: -9999px !important;
  }
  
  /* 隱藏所有按鈕 */
  button {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* 確保 KaTeX 數學公式正確顯示 - 防止 prose 樣式影響 */
  .katex {
    color: black !important;
    visibility: visible !important;
    font-family: KaTeX_Main, KaTeX_Math, KaTeX_Size1, KaTeX_Size2, KaTeX_Size3, KaTeX_Size4, "Times New Roman", serif !important;
    /* 重置可能被 prose 影響的屬性 */
    line-height: normal !important; /* 讓 KaTeX 自己控制 line-height */
    font-size: 1em !important;
  }
  
  /* 確保 KaTeX 在 prose 內時不受影響 */
  .prose .katex {
    line-height: normal !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  /* 確保分數正確顯示，防止重疊 */
  .katex .mfrac {
    /* 不設置任何樣式，讓 KaTeX 使用默認值 */
  }
  
  /* 針對上標中的分數，增加分子分母之間的間距 */
  .katex .msupsub .mfrac {
    padding-top: 0.15em !important;
    padding-bottom: 0.15em !important;
  }
  
  /* 增加分數線的厚度和上下間距，讓分數更清晰 */
  .katex .msupsub .mfrac .frac-line {
    border-bottom-width: 0.06em !important;
    min-height: 0.06em !important;
    margin-top: 0.1em !important;
    margin-bottom: 0.1em !important;
  }
  
  /* 確保分數的分子和分母容器有足夠的空間 */
  .katex .msupsub .mfrac .vlist-t2 {
    padding-top: 0.05em !important;
    padding-bottom: 0.05em !important;
  }
  
  /* 確保分數線正確顯示 */
  .katex .frac-line {
    /* 不設置任何樣式，讓 KaTeX 使用默認值 */
  }
  
  /* 調整上標位置，讓它更往右上方 */
  .katex .msupsub {
    vertical-align: 0.3em !important; /* 增加上標的垂直偏移 */
    margin-left: 0.1em !important; /* 增加上標的水平偏移 */
  }
  
  /* 確保上標/下標容器正確顯示 */
  .katex .vlist-t,
  .katex .vlist-r,
  .katex .vlist-s,
  .katex .vlist {
    /* 不設置任何樣式，讓 KaTeX 使用默認值 */
  }
  
  /* 針對上標中的 vlist，確保有足夠的垂直空間 */
  .katex .msupsub .vlist-t {
    margin-top: 0.05em !important;
    margin-bottom: 0.05em !important;
  }
  
  /* 確保 MathML 隱藏（使用 HTML 渲染） */
  .katex-mathml {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* 只確保 KaTeX 內的元素可見且顏色正確，不干預布局 */
  .katex * {
    color: black !important;
    visibility: visible !important;
    /* 重置可能被 prose 影響的 line-height */
    line-height: inherit !important;
  }
  
  /* 確保畫布容器在列印時正確顯示 */
  .flex-1.overflow-auto,
  div[class*="overflow-auto"],
  main .flex-1.overflow-auto {
    overflow: visible !important;
    padding: 0 !important;
    margin: 0 !important;
    background: white !important;
  }
  
  /* 確保整個頁面背景是白色 */
  body,
  html {
    background: white !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    height: auto !important;
  }
  
  /* 確保根容器正確顯示 */
  .flex.h-screen {
    overflow: visible !important;
    background: white !important;
  }
}
</style>
