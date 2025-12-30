<template>
  <div class="min-h-screen bg-slate-50">
    <div class="max-w-4xl mx-auto p-6">
      <!-- 頂部工具列 -->
      <header class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm mb-6 rounded-lg">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="text-slate-500 hover:text-indigo-600 transition-colors" title="返回">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div class="flex flex-col">
            <h1 class="text-lg font-bold text-slate-800 leading-tight">
              {{ isEdit ? '編輯題目' : '新增題目' }}
            </h1>
            <p v-if="isEdit && importedStudentName" class="text-xs text-amber-700 mt-1">
              來源學生：{{ importedStudentName }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            取消
          </button>
          <button
            @click="saveQuestion"
            :disabled="saving"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ saving ? '儲存中...' : '儲存' }}
          </button>
        </div>
      </header>

      <!-- 表單內容 -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
        <!-- 科目 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            科目 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.subject"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">請選擇科目</option>
            <option
              v-for="subject in subjects"
              :key="subject.subject_id"
              :value="subject.subject_id"
            >
              {{ subject.name }}{{ subject.code ? ` (${subject.code})` : '' }}
            </option>
          </select>
        </div>

        <!-- 適用年級 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            適用年級 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.level"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">請選擇</option>
            <option value="JHS">國中</option>
            <option value="SHS">高中</option>
            <option value="VCS">高職</option>
          </select>
        </div>

        <!-- 章節/單元 -->
        <div class="relative">
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            章節/單元 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.chapter"
            type="text"
            required
            @input="searchChapters"
            @focus="searchChapters"
            @blur="handleChapterBlur"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="例如：向量與空間（輸入關鍵字自動搜尋）"
          />
          <!-- 章節候選列表 -->
          <div
            v-if="chapterSuggestions.length > 0 && showChapterSuggestions"
            class="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div
              v-for="(suggestion, index) in chapterSuggestions"
              :key="index"
              @mousedown.prevent="selectChapter(suggestion.chapter)"
              class="px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-900">{{ suggestion.chapter }}</span>
                <span class="text-xs text-slate-500">{{ suggestion.count }} 題</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 題目類型 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            題目類型 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.question_type"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="SINGLE_CHOICE">單選題</option>
            <option value="MULTIPLE_CHOICE">多選題</option>
            <option value="FILL_IN_BLANK">填充題</option>
            <option value="PROGRAMMING">程式題</option>
            <option value="LISTENING">聽力題</option>
          </select>
        </div>

        <!-- 選項（僅選擇題和多選題顯示） -->
        <div v-if="formData.question_type === 'SINGLE_CHOICE' || formData.question_type === 'MULTIPLE_CHOICE'">
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            選項 <span class="text-red-500">*</span>
            <span class="text-xs font-normal text-slate-500 ml-2">（至少需要 2 個選項）</span>
          </label>
          <div class="space-y-2">
            <div
              v-for="(option, index) in formData.options"
              :key="index"
              class="flex items-center gap-2"
            >
              <span class="text-sm font-medium text-slate-600 w-8">{{ String.fromCharCode(65 + index) }}.</span>
              <input
                v-model="formData.options[index]"
                type="text"
                :placeholder="`選項 ${String.fromCharCode(65 + index)}`"
                class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                v-if="formData.options.length > 2"
                @click="removeOption(index)"
                type="button"
                class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                title="移除選項"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <button
              @click="addOption"
              type="button"
              class="w-full rounded-lg border-2 border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              + 新增選項
            </button>
          </div>
        </div>

        <!-- 題目內容 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            題目內容 (Markdown + LaTeX) <span class="text-red-500">*</span>
          </label>
          <div class="space-y-3">
            <div class="border border-slate-300 rounded-lg question-editor-wrapper">
              <BlockEditor
                v-model="formData.content"
                :readonly="false"
                :questions="allQuestions"
              />
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            <span v-if="formData.question_type === 'SINGLE_CHOICE' || formData.question_type === 'MULTIPLE_CHOICE'">
              提示：貼上包含選項的題目（如 (A)選項1 (B)選項2），系統會自動提取選項。使用 $$...$$ 表示區塊公式，使用 $...$ 表示行內公式
            </span>
            <span v-else>
              提示：使用 $$...$$ 表示區塊公式，使用 $...$ 表示行內公式
            </span>
          </p>
        </div>

        <!-- 正確答案 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            正確答案 <span class="text-red-500">*</span>
            <span v-if="formData.question_type === 'SINGLE_CHOICE' || formData.question_type === 'MULTIPLE_CHOICE'" class="text-xs font-normal text-slate-500 ml-2">
              （選擇題可直接輸入答案，如：C 或 A,B,C）
            </span>
          </label>
          <div class="space-y-3">
            <div class="border border-slate-300 rounded-lg answer-editor-wrapper">
              <BlockEditor
                v-model="formData.correct_answer"
                :readonly="false"
                :questions="allQuestions"
              />
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            <span v-if="formData.question_type === 'SINGLE_CHOICE' || formData.question_type === 'MULTIPLE_CHOICE'">
              提示：直接輸入答案字母（如 C）或逗號分隔的多個答案（如 A,B,C），系統會自動判斷單選/多選
            </span>
            <span v-else>
              提示：使用 $$...$$ 表示區塊公式，使用 $...$ 表示行內公式
            </span>
          </p>
        </div>

        <!-- 詳解內容（使用 BlockEditor） -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            詳解內容（富文本編輯器）
          </label>
          <div class="border border-slate-300 rounded-lg solution-editor-wrapper">
            <BlockEditor
              v-model="formData.solution_content"
              :readonly="false"
              :questions="allQuestions"
            />
          </div>
          <p class="mt-1 text-xs text-slate-500">
            提示：支援富文本、數學公式、2D/3D 圖形等
          </p>
        </div>

        <!-- 難度 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            難度 (1-5) <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="formData.difficulty"
            type="number"
            min="1"
            max="5"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <!-- 題目來源 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">
            題目來源
          </label>
          <div class="flex gap-2 items-center">
            <select
              v-model="formData.source"
              class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option v-for="option in sourceOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
            <input
              v-if="formData.source === '其他'"
              v-model="formData.customSource"
              type="text"
              placeholder="請輸入來源"
              class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <p class="mt-1 text-xs text-slate-500">
            選擇題目來源，如果是老師手動新增則為「九章自命題」，從錯題本匯入則為「學生錯題」
          </p>
        </div>

        <!-- 標籤分類 -->

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">標籤分類</label>
          <div class="border border-slate-300 rounded-lg p-3 min-h-[100px] max-h-[300px] overflow-y-auto">
            <div v-if="hashtags.length === 0" class="text-sm text-slate-400 text-center py-4">
              尚無標籤
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <button
                v-for="tag in hashtags"
                :key="tag.tag_id"
                type="button"
                @click="toggleTag(tag.tag_id)"
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold transition-all',
                  formData.tag_ids.includes(tag.tag_id)
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                ]"
              >
                #{{ tag.tag_name }}
                <span v-if="formData.tag_ids.includes(tag.tag_id)" class="ml-1">✓</span>
              </button>
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            已選擇 {{ formData.tag_ids.length }} 個標籤
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { questionBankAPI, hashtagAPI, subjectAPI } from '../services/api'
import BlockEditor from '../components/BlockEditor/BlockEditor.vue'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const hashtags = ref([])
const subjects = ref([])
const importedStudentName = ref('')
const sourceOptions = ref(['九章自命題', '學生錯題', '學測', '會考', '統測', '模擬考', '基測', '其他'])
const customSource = ref('')

const formData = ref({
  subject: '',
  level: '',
  chapter: '',
  question_type: 'SINGLE_CHOICE',
  options: ['', ''],
  content: { type: 'doc', content: [] },
  correct_answer: { type: 'doc', content: [] },
  solution_content: { type: 'doc', content: [] },
  difficulty: 1,
  tag_ids: [],
  source: '九章自命題',
  metadata: {}
})

const chapterSuggestions = ref([])
const showChapterSuggestions = ref(false)
const searchChapterTimeout = ref(null)
const isAutoUpdating = ref(false) // 防止循環更新
const allQuestions = ref([]) // 所有題目列表，用於 BlockEditor 的題目選擇器

// 從 Tiptap JSON 提取純文字的輔助函式
const extractTextFromTiptapJSON = (node) => {
  if (!node || typeof node !== 'object') return ''
  
  let text = ''
  if (node.type === 'text' && node.text) {
    text = node.text
  }
  
  if (node.content && Array.isArray(node.content)) {
    for (const child of node.content) {
      text += extractTextFromTiptapJSON(child)
    }
  }
  
  return text
}

// 從題目內容中提取選項
const extractOptionsFromContent = (content) => {
  if (!content) return []
  
  // 從 Tiptap JSON 提取純文字
  let contentText = ''
  if (typeof content === 'string') {
    contentText = content
  } else if (typeof content === 'object' && content.type === 'doc') {
    // 遞迴提取 Tiptap JSON 中的所有文字節點
    contentText = extractTextFromTiptapJSON(content)
  } else {
    return []
  }
  
  const options = []
  const foundOptions = []
  const seenLetters = new Set()
  
  // 匹配格式：(A)選項內容、(B)選項內容
  // 支援多種格式：
  // 1. (A)選項內容　(B)選項內容
  // 2. (A) 選項內容 (B) 選項內容
  // 3. A.選項內容 B.選項內容
  // 4. A. 選項內容 B. 選項內容
  
  // 優先匹配括號格式：(A)選項內容
  const bracketPattern = /\(([A-Z])\)\s*([^()]+?)(?=\s*\([A-Z]\)|$|[\n\r])/g
  let match
  while ((match = bracketPattern.exec(contentText)) !== null) {
    const letter = match[1]
    let optionText = match[2]?.trim() || ''
    
    // 清理選項文字（移除多餘空格、換行等）
    optionText = optionText.replace(/\s+/g, ' ').trim()
    
    if (!seenLetters.has(letter) && optionText && optionText.length > 0) {
      foundOptions.push({
        letter,
        text: optionText
      })
      seenLetters.add(letter)
    }
  }
  
  // 如果括號格式沒找到，嘗試點號格式：A.選項內容
  if (foundOptions.length < 2) {
    seenLetters.clear()
    foundOptions.length = 0
    const dotPattern = /([A-Z])\.\s*([^A-Z.]+?)(?=\s*[A-Z]\.|$|[\n\r])/g
    while ((match = dotPattern.exec(contentText)) !== null) {
      const letter = match[1]
      let optionText = match[2]?.trim() || ''
      
      optionText = optionText.replace(/\s+/g, ' ').trim()
      
      if (!seenLetters.has(letter) && optionText && optionText.length > 0) {
        foundOptions.push({
          letter,
          text: optionText
        })
        seenLetters.add(letter)
      }
    }
  }
  
  // 如果找到選項，按字母順序排序並返回
  if (foundOptions.length >= 2) {
    foundOptions.sort((a, b) => a.letter.localeCompare(b.letter))
    return foundOptions.map(opt => opt.text)
  }
  
  return []
}

// 檢測正確答案是否為多選
const detectAnswerType = (answer) => {
  if (!answer) return formData.value.question_type
  
  // 從 Tiptap JSON 提取純文字
  let answerText = ''
  if (typeof answer === 'string') {
    answerText = answer
  } else if (typeof answer === 'object' && answer.type === 'doc') {
    answerText = extractTextFromTiptapJSON(answer)
  } else {
    return formData.value.question_type
  }
  
  if (!answerText || !answerText.trim()) {
    return formData.value.question_type
  }
  
  const trimmedAnswer = answerText.trim()
  
  // 提取純文字（移除 Markdown 格式、LaTeX 等）
  // 只保留字母、逗號、分號、空格
  const cleanAnswer = trimmedAnswer.replace(/[^A-Z,，;\s]/gi, '').trim()
  
  // 如果答案為空，保持原類型
  if (!cleanAnswer) return formData.value.question_type
  
  // 如果包含逗號、分號或空格分隔的多個字母，視為多選
  // 匹配格式：A,B,C 或 A, B, C 或 A，B，C
  const multiChoicePattern = /^[A-Z]([,，;\s]+[A-Z])+$/i
  if (multiChoicePattern.test(cleanAnswer)) {
    return 'MULTIPLE_CHOICE'
  }
  
  // 單個字母視為單選
  const singleChoicePattern = /^[A-Z]$/i
  if (singleChoicePattern.test(cleanAnswer)) {
    return 'SINGLE_CHOICE'
  }
  
  // 其他情況保持原類型
  return formData.value.question_type
}

// 返回上一頁
const goBack = () => {
  // 檢查是否有 returnTab 查詢參數來決定返回哪個 tab
  const returnTab = route.query.returnTab || 'questions'
  
  // 總是跳轉到題庫頁面並帶上 tab 參數，確保正確切換到對應的 tab
  router.push({ path: '/questions', query: { tab: returnTab } })
}

// 載入題目資料（編輯模式）
const fetchQuestion = async () => {
  if (!isEdit.value) return
  
  try {
    const response = await questionBankAPI.getById(route.params.id)
    const question = response.data
    importedStudentName.value = question.imported_student_name || ''
    
    // 獲取題目的標籤 ID
    let tagIds = []
    if (question.tag_ids && Array.isArray(question.tag_ids)) {
      tagIds = question.tag_ids
    } else if (question.tags && Array.isArray(question.tags)) {
      question.tags.forEach(tagName => {
        const tag = hashtags.value.find(t => t.tag_name === tagName)
        if (tag) tagIds.push(tag.tag_id)
      })
    }
    
    // 輔助函式：確保 Tiptap JSON 格式正確
    // 後端會自動轉換舊格式，這裡只需要處理空值或確保格式正確
    // 處理換行符號：將文字中的 `\\` 或行尾的 `\` 轉換為 hardBreak 節點
    // 注意：必須排除 LaTeX 命令中的反斜線
    const parseLineBreaks = (text) => {
      if (!text) return []
      
      // 檢查文字中是否包含 LaTeX 公式（有 $ 符號）
      const hasLatex = text.includes('$')
      
      // 如果包含 LaTeX，不處理換行符號，避免誤判 LaTeX 命令中的反斜線
      // LaTeX 中的換行應該使用 \\ 或 \newline，這些會被 LaTeX 渲染器正確處理
      if (hasLatex) {
        return [{ type: 'text', text }]
      }
      
      const parts = []
      let lastIndex = 0
      // 只在沒有 LaTeX 的情況下處理換行符號
      // 匹配行尾的 `\\`（兩個反斜線）作為換行符號
      const lineBreakRegex = /\\\\\s*$/gm
      const lineBreakPositions = []
      let match
      
      // 找出所有換行符號的位置
      while ((match = lineBreakRegex.exec(text)) !== null) {
        lineBreakPositions.push({
          start: match.index,
          end: match.index + match[0].length
        })
      }
      
      // 構建節點陣列
      for (const lbMatch of lineBreakPositions) {
        // 添加換行符號前的文字
        if (lbMatch.start > lastIndex) {
          const beforeText = text.substring(lastIndex, lbMatch.start)
          if (beforeText) {
            parts.push({ type: 'text', text: beforeText })
          }
        }
        
        // 添加 hardBreak 節點
        parts.push({ type: 'hardBreak' })
        
        lastIndex = lbMatch.end
      }
      
      // 添加剩餘文字
      if (lastIndex < text.length) {
        const remainingText = text.substring(lastIndex)
        if (remainingText) {
          parts.push({ type: 'text', text: remainingText })
        }
      }
      
      return parts.length > 0 ? parts : [{ type: 'text', text }]
    }
    
    // 將文字中的 LaTeX 轉換為節點陣列（不處理換行符號，換行符號由 parseLineBreaks 處理）
    const parseLatexInTextOnly = (text) => {
      if (!text) return []
      
      const parts = []
      let lastIndex = 0
      
      // 先處理區塊 LaTeX ($$...$$)
      const blockLatexRegex = /\$\$([\s\S]*?)\$\$/g
      let match
      const blockMatches = []
      
      while ((match = blockLatexRegex.exec(text)) !== null) {
        blockMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          latex: match[1].trim()
        })
      }
      
      // 再處理行內 LaTeX ($...$)，但要排除已經在區塊 LaTeX 中的
      const inlineLatexRegex = /\$([^$\n]+?)\$/g
      const inlineMatches = []
      
      while ((match = inlineLatexRegex.exec(text)) !== null) {
        const start = match.index
        const end = match.index + match[0].length
        
        // 檢查是否在區塊 LaTeX 內
        const inBlock = blockMatches.some(block => start >= block.start && end <= block.end)
        if (!inBlock) {
          inlineMatches.push({
            start,
            end,
            latex: match[1].trim()
          })
        }
      }
      
      // 合併所有匹配（區塊和行內）
      const allMatches = [
        ...blockMatches.map(m => ({ ...m, isBlock: true })),
        ...inlineMatches.map(m => ({ ...m, isBlock: false }))
      ].sort((a, b) => a.start - b.start)
      
      // 構建節點陣列
      for (const match of allMatches) {
        // 添加匹配前的文字
        if (match.start > lastIndex) {
          const beforeText = text.substring(lastIndex, match.start)
          if (beforeText) {
            parts.push({ type: 'text', text: beforeText })
          }
        }
        
        // 添加 LaTeX 節點
        if (match.isBlock) {
          parts.push({
            type: 'latexBlock',
            attrs: {
              id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              formula: match.latex,
              displayMode: true
            }
          })
        } else {
          parts.push({
            type: 'inlineLatex',
            attrs: {
              formula: match.latex
            }
          })
        }
        
        lastIndex = match.end
      }
      
      // 添加剩餘文字
      if (lastIndex < text.length) {
        const remainingText = text.substring(lastIndex)
        if (remainingText) {
          parts.push({ type: 'text', text: remainingText })
        }
      }
      
      return parts.length > 0 ? parts : [{ type: 'text', text }]
    }
    
    // 將文字中的 LaTeX 和換行符號轉換為節點陣列
    const parseLatexInText = (text) => {
      if (!text) return []
      
      // 先處理換行符號，將文字分割成多個部分
      const lineBreakParts = parseLineBreaks(text)
      const parts = []
      
      // 對每個部分處理 LaTeX
      for (const part of lineBreakParts) {
        if (part.type === 'hardBreak') {
          // 直接添加 hardBreak
          parts.push(part)
          continue
        }
        
        if (part.type === 'text' && part.text) {
          // 處理這個文字部分的 LaTeX
          const latexParsed = parseLatexInTextOnly(part.text)
          parts.push(...latexParsed)
        }
      }
      
      return parts.length > 0 ? parts : [{ type: 'text', text }]
    }
    
    // 處理圖片連結：將 Markdown 格式的圖片連結轉換為圖片節點（同時處理換行符號）
    const parseImageInText = (text) => {
      if (!text) return []
      
      // 先處理換行符號，將文字分割成多個部分
      const lineBreakParts = parseLineBreaks(text)
      const parts = []
      
      // 對每個部分處理圖片
      for (const part of lineBreakParts) {
        if (part.type === 'hardBreak') {
          // 直接添加 hardBreak
          parts.push(part)
          continue
        }
        
        if (part.type === 'text' && part.text) {
          const textContent = part.text
          const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
          let lastIndex = 0
          let match
          const imageMatches = []
          
          while ((match = imageRegex.exec(textContent)) !== null) {
            imageMatches.push({
              start: match.index,
              end: match.index + match[0].length,
              alt: match[1] || '',
              src: match[2]
            })
          }
          
          for (const imgMatch of imageMatches) {
            // 添加圖片前的文字（需要處理 LaTeX）
            if (imgMatch.start > lastIndex) {
              const beforeText = textContent.substring(lastIndex, imgMatch.start)
              if (beforeText) {
                const latexParsed = parseLatexInTextOnly(beforeText)
                parts.push(...latexParsed)
              }
            }
            
            // 添加圖片節點
            parts.push({
              type: 'image',
              attrs: {
                src: imgMatch.src,
                alt: imgMatch.alt,
                title: imgMatch.alt
              }
            })
            
            lastIndex = imgMatch.end
          }
          
          // 添加剩餘文字（需要處理 LaTeX）
          if (lastIndex < textContent.length) {
            const remainingText = textContent.substring(lastIndex)
            if (remainingText) {
              const latexParsed = parseLatexInTextOnly(remainingText)
              parts.push(...latexParsed)
            }
          }
        }
      }
      
      return parts.length > 0 ? parts : [{ type: 'text', text }]
    }
    
    // 處理跨段落的 LaTeX 區塊：在 doc 層級合併跨段落的 $$...$$
    const mergeCrossParagraphLatex = (content) => {
      if (!Array.isArray(content)) return content
      
      const merged = []
      let i = 0
      
      while (i < content.length) {
        const node = content[i]
        
        // 如果是段落，檢查是否包含 LaTeX 區塊的開始或結束
        if (node.type === 'paragraph' && node.content && Array.isArray(node.content)) {
          // 提取段落中的所有文字
          const paragraphText = node.content
            .filter(c => c.type === 'text' && c.text)
            .map(c => c.text)
            .join('')
          
          // 檢查是否包含 $$ 開始或結束
          const hasStartDollar = paragraphText.includes('$$')
          const hasEndDollar = paragraphText.endsWith('$$')
          
          if (hasStartDollar && !hasEndDollar) {
            // 這是 LaTeX 區塊的開始，需要合併後續段落直到找到 $$
            let latexText = paragraphText
            let j = i + 1
            let foundEnd = false
            
            // 收集 LaTeX 區塊開始前的文字
            const beforeLatex = paragraphText.substring(0, paragraphText.indexOf('$$'))
            
            // 收集 LaTeX 內容（從 $$ 開始）
            latexText = paragraphText.substring(paragraphText.indexOf('$$') + 2)
            
            // 繼續查找後續段落
            while (j < content.length && !foundEnd) {
              const nextNode = content[j]
              if (nextNode.type === 'paragraph' && nextNode.content && Array.isArray(nextNode.content)) {
                const nextText = nextNode.content
                  .filter(c => c.type === 'text' && c.text)
                  .map(c => c.text)
                  .join('')
                
                if (nextText.includes('$$')) {
                  // 找到結束
                  const endIndex = nextText.indexOf('$$')
                  latexText += nextText.substring(0, endIndex)
                  const afterLatex = nextText.substring(endIndex + 2)
                  foundEnd = true
                  
                  // 創建 LaTeX 區塊
                  const latexBlock = {
                    type: 'latexBlock',
                    attrs: {
                      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                      formula: latexText.trim(),
                      displayMode: true
                    }
                  }
                  
                  // 添加開始前的文字段落（需要處理圖片和 LaTeX）
                  if (beforeLatex.trim()) {
                    const beforeParts = parseImageInText(beforeLatex)
                    const beforeContent = []
                    for (const part of beforeParts) {
                      if (part.type === 'text') {
                        const latexParsed = parseLatexInText(part.text)
                        beforeContent.push(...latexParsed)
                      } else {
                        beforeContent.push(part)
                      }
                    }
                    merged.push({
                      type: 'paragraph',
                      content: beforeContent
                    })
                  }
                  
                  // 添加 LaTeX 區塊
                  merged.push(latexBlock)
                  
                  // 添加結束後的文字段落（需要處理圖片和 LaTeX）
                  if (afterLatex.trim()) {
                    const afterParts = parseImageInText(afterLatex)
                    const afterContent = []
                    for (const part of afterParts) {
                      if (part.type === 'text') {
                        const latexParsed = parseLatexInText(part.text)
                        afterContent.push(...latexParsed)
                      } else {
                        afterContent.push(part)
                      }
                    }
                    merged.push({
                      type: 'paragraph',
                      content: afterContent
                    })
                  }
                  
                  i = j + 1
                  continue
                } else {
                  // 繼續收集 LaTeX 內容
                  latexText += nextText
                  j++
                }
              } else {
                j++
              }
            }
            
            if (!foundEnd) {
              // 沒有找到結束，當作普通段落處理（不遞迴調用，避免循環）
              const processedNode = processParagraphNode(node)
              merged.push(processedNode)
              i++
            }
          } else {
            // 普通段落，正常處理（不遞迴調用，避免循環）
            const processedNode = processParagraphNode(node)
            merged.push(processedNode)
            i++
          }
        } else {
          // 非段落節點，正常處理（不遞迴調用，避免循環）
          merged.push(node)
          i++
        }
      }
      
      return merged
    }
    
    // 處理段落節點（不遞迴，避免循環）
    const processParagraphNode = (node) => {
      if (node.type !== 'paragraph' || !node.content || !Array.isArray(node.content)) {
        return node
      }
      
      const processedContent = []
      for (const child of node.content) {
        if (child.type === 'text' && child.text) {
          // 先處理圖片，再處理 LaTeX
          const imageParsed = parseImageInText(child.text)
          if (imageParsed.length === 1 && imageParsed[0].type === 'text') {
            const latexParsed = parseLatexInText(child.text)
            processedContent.push(...latexParsed)
          } else {
            // 有圖片，需要對每個文字節點處理 LaTeX
            for (const part of imageParsed) {
              if (part.type === 'text') {
                const latexParsed = parseLatexInText(part.text)
                processedContent.push(...latexParsed)
              } else {
                processedContent.push(part)
              }
            }
          }
        } else {
          processedContent.push(child)
        }
      }
      
      // 特殊處理：如果段落只包含一個 latexBlock，直接返回 latexBlock
      if (processedContent.length === 1 && processedContent[0].type === 'latexBlock') {
        return processedContent[0]
      }
      
      return {
        ...node,
        content: processedContent
      }
    }
    
    // 將 Tiptap JSON 中的 LaTeX 文字轉換為 LaTeX 節點
    const convertLatexInTiptapJSON = (node) => {
      if (!node || typeof node !== 'object') return node
      
      // 如果已經是 LaTeX 節點，確保屬性名稱正確
      if (node.type === 'latexBlock') {
        // 如果使用舊的屬性名稱，轉換為新的
        if (node.attrs && node.attrs.latex !== undefined && node.attrs.formula === undefined) {
          return {
            ...node,
            attrs: {
              ...node.attrs,
              formula: node.attrs.latex,
              id: node.attrs.id || `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              displayMode: node.attrs.displayMode !== undefined ? node.attrs.displayMode : true
            }
          }
        }
        return node
      }
      
      if (node.type === 'inlineLatex') {
        // 如果使用舊的屬性名稱，轉換為新的
        if (node.attrs && node.attrs.latex !== undefined && node.attrs.formula === undefined) {
          return {
            ...node,
            attrs: {
              ...node.attrs,
              formula: node.attrs.latex
            }
          }
        }
        return node
      }
      
      // 如果是 doc 節點，先處理跨段落的 LaTeX
      if (node.type === 'doc' && node.content && Array.isArray(node.content)) {
        const mergedContent = mergeCrossParagraphLatex(node.content)
        return {
          ...node,
          content: mergedContent
        }
      }
      
      // 如果是文字節點，先處理圖片，再處理 LaTeX
      if (node.type === 'text' && node.text) {
        // 先處理圖片連結
        const imageParsed = parseImageInText(node.text)
        // 如果沒有圖片，直接處理 LaTeX
        if (imageParsed.length === 1 && imageParsed[0].type === 'text') {
          const latexParsed = parseLatexInText(node.text)
          // 如果只有一個節點且是文字，直接返回
          if (latexParsed.length === 1 && latexParsed[0].type === 'text') {
            return node
          }
          // 否則返回解析後的節點陣列
          return latexParsed
        } else {
          // 有圖片，需要對每個文字節點處理 LaTeX
          const finalParts = []
          for (const part of imageParsed) {
            if (part.type === 'text') {
              const latexParsed = parseLatexInText(part.text)
              finalParts.push(...latexParsed)
            } else {
              finalParts.push(part)
            }
          }
          return finalParts
        }
      }
      
      // 如果是段落節點，使用 processParagraphNode 處理
      if (node.type === 'paragraph') {
        return processParagraphNode(node)
      }
      
      // 如果有子節點，遞迴處理
      if (node.content && Array.isArray(node.content)) {
        const processedContent = []
        for (const child of node.content) {
          const processed = convertLatexInTiptapJSON(child)
          if (Array.isArray(processed)) {
            // 如果返回陣列，展開它
            processedContent.push(...processed)
          } else if (processed) {
            processedContent.push(processed)
          }
        }
        return {
          ...node,
          content: processedContent
        }
      }
      
      return node
    }
    
    const ensureTiptapFormat = (data) => {
      // 處理空值或空物件
      if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        return { type: 'doc', content: [] }
      }
      // 如果已經是正確的 Tiptap 格式
      if (typeof data === 'object' && data.type === 'doc') {
        // 轉換其中的 LaTeX 文字為 LaTeX 節點
        const converted = convertLatexInTiptapJSON(data)
        // 確保返回的是正確的 doc 結構
        if (converted && converted.type === 'doc') {
          return converted
        } else {
          // 如果轉換後不是 doc，包裝成 doc
          return { type: 'doc', content: Array.isArray(converted) ? converted : (converted ? [converted] : []) }
        }
      }
      // 其他情況返回空 doc（理論上不應該發生，因為後端會自動轉換）
      return { type: 'doc', content: [] }
    }
    
    isAutoUpdating.value = true
    formData.value = {
      subject: question.subject?.subject_id || question.subject,
      level: question.level,
      chapter: question.chapter,
      question_type: question.question_type || 'SINGLE_CHOICE',
      options: question.options || (question.question_type === 'SINGLE_CHOICE' || question.question_type === 'MULTIPLE_CHOICE' ? ['', ''] : []),
      content: ensureTiptapFormat(question.content),
      correct_answer: ensureTiptapFormat(question.correct_answer),
      solution_content: ensureTiptapFormat(question.solution_content),
      difficulty: question.difficulty,
      tag_ids: tagIds,
      metadata: question.metadata || {}
    }
    isAutoUpdating.value = false
    isQuestionLoaded.value = true
  } catch (error) {
    console.error('載入題目失敗：', error)
    alert('載入題目失敗，請稍後再試')
    router.push('/questions')
  }
}

// 載入科目和標籤
const fetchSourceOptions = async () => {
  try {
    const response = await questionBankAPI.getSourceOptions()
    if (response.data && response.data.options) {
      sourceOptions.value = [...response.data.options, '其他']
    }
  } catch (error) {
    console.error('獲取來源選項失敗：', error)
  }
}

const fetchSubjects = async () => {
  try {
    const response = await subjectAPI.getAll()
    const data = response.data.results || response.data
    subjects.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('獲取科目失敗：', error)
    subjects.value = []
  }
}

const fetchHashtags = async () => {
  try {
    const response = await hashtagAPI.getAll()
    const data = response.data.results || response.data
    hashtags.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('獲取標籤失敗：', error)
  }
}

// 搜尋章節
const searchChapters = async () => {
  if (searchChapterTimeout.value) {
    clearTimeout(searchChapterTimeout.value)
  }
  const query = formData.value.chapter?.trim() || ''
  if (query.length < 1) {
    chapterSuggestions.value = []
    showChapterSuggestions.value = false
    return
  }
  searchChapterTimeout.value = setTimeout(async () => {
    try {
      const response = await questionBankAPI.searchChapters(
        query,
        formData.value.subject || null,
        formData.value.level || null
      )
      chapterSuggestions.value = response.data || []
      showChapterSuggestions.value = chapterSuggestions.value.length > 0
    } catch (error) {
      console.warn('搜尋章節失敗：', error)
      chapterSuggestions.value = []
      showChapterSuggestions.value = false
    }
  }, 300)
}

const selectChapter = (chapter) => {
  formData.value.chapter = chapter
  showChapterSuggestions.value = false
  chapterSuggestions.value = []
}

const handleChapterBlur = () => {
  setTimeout(() => {
    showChapterSuggestions.value = false
  }, 200)
}

const toggleTag = (tagId) => {
  const index = formData.value.tag_ids.indexOf(tagId)
  if (index > -1) {
    formData.value.tag_ids.splice(index, 1)
  } else {
    formData.value.tag_ids.push(tagId)
  }
}

// 新增選項
const addOption = () => {
  if (formData.value.options.length < 10) {
    formData.value.options.push('')
  }
}

// 移除選項
const removeOption = (index) => {
  if (formData.value.options.length > 2) {
    formData.value.options.splice(index, 1)
  }
}

// 儲存題目
// 處理來源字段
const getSourceValue = () => {
  if (formData.value.source === '其他' && customSource.value) {
    return customSource.value
  }
  return formData.value.source || '九章自命題'
}

const saveQuestion = async () => {
  // 驗證必填欄位
  if (!formData.value.subject) {
    alert('請選擇科目')
    return
  }
  if (!formData.value.level) {
    alert('請選擇適用年級')
    return
  }
  if (!formData.value.chapter?.trim()) {
    alert('請輸入章節/單元')
    return
  }
  // 驗證 Tiptap JSON 格式的內容
  const contentText = extractTextFromTiptapJSON(formData.value.content)
  if (!contentText || !contentText.trim()) {
    alert('請輸入題目內容')
    return
  }
  const answerText = extractTextFromTiptapJSON(formData.value.correct_answer)
  if (!answerText || !answerText.trim()) {
    alert('請輸入正確答案')
    return
  }

  saving.value = true
  try {
    // 處理選項：如果不是選擇題，設為空陣列
    const options = (formData.value.question_type === 'SINGLE_CHOICE' || formData.value.question_type === 'MULTIPLE_CHOICE')
      ? formData.value.options.filter(opt => opt?.trim())
      : []

    const data = {
      ...formData.value,
      options: options,
      tag_ids_input: formData.value.tag_ids,
      tag_ids: undefined
    }
    delete data.tag_ids

    let createdQuestion = null
    if (isEdit.value) {
      await questionBankAPI.update(route.params.id, data)
    } else {
      const createResponse = await questionBankAPI.create(data)
      createdQuestion = createResponse.data
    }
    
    alert('儲存成功！')
    goBack()
  } catch (error) {
    console.error('儲存題目失敗：', error)
    if (error.response?.data) {
      const errorMsg = typeof error.response.data === 'string' 
        ? error.response.data 
        : JSON.stringify(error.response.data)
      alert(`儲存失敗：${errorMsg}`)
    } else {
      alert('儲存失敗，請稍後再試')
    }
  } finally {
    saving.value = false
  }
}

// 標記是否已載入題目（避免載入時觸發自動提取）
const isQuestionLoaded = ref(false)

// 監聽題目內容變化，自動提取選項
watch(() => formData.value.content, (newContent, oldContent) => {
  if (isAutoUpdating.value || !isQuestionLoaded.value) return
  
  // 只在選擇題類型時自動提取
  if (formData.value.question_type !== 'SINGLE_CHOICE' && formData.value.question_type !== 'MULTIPLE_CHOICE') {
    return
  }
  
  // 只在新增模式或選項為空時自動提取
  const shouldExtract = !isEdit.value || 
    (formData.value.options.length === 0 || formData.value.options.every(opt => !opt?.trim()))
  
  if (shouldExtract) {
    const extractedOptions = extractOptionsFromContent(newContent)
    if (extractedOptions.length >= 2) {
      isAutoUpdating.value = true
      formData.value.options = [...extractedOptions]
      // 確保至少有2個選項，最多10個
      while (formData.value.options.length < 2) {
        formData.value.options.push('')
      }
      while (formData.value.options.length > 10) {
        formData.value.options.pop()
      }
      isAutoUpdating.value = false
    }
  }
}, { deep: true })

// 監聽正確答案變化，自動判斷單選/多選
watch(() => formData.value.correct_answer, (newAnswer) => {
  if (isAutoUpdating.value || !isQuestionLoaded.value) return
  
  // 只在選擇題類型時自動判斷
  if (formData.value.question_type !== 'SINGLE_CHOICE' && formData.value.question_type !== 'MULTIPLE_CHOICE') {
    return
  }
  
  const detectedType = detectAnswerType(newAnswer)
  if (detectedType !== formData.value.question_type) {
    isAutoUpdating.value = true
    formData.value.question_type = detectedType
    
    // 如果是多選題但選項不足，確保有足夠的選項
    if (detectedType === 'MULTIPLE_CHOICE' && formData.value.options.length < 2) {
      while (formData.value.options.length < 2) {
        formData.value.options.push('')
      }
    }
    
    isAutoUpdating.value = false
  }
}, { deep: true })

// 獲取所有題目列表（用於 BlockEditor 的題目選擇器）
const fetchAllQuestions = async () => {
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionForm.vue:fetchAllQuestions:start',message:'fetchAllQuestions called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  
  try {
    // #region agent log
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionForm.vue:fetchAllQuestions:beforeAPI',message:'calling questionBankAPI.getAll',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F,G'})}).catch(()=>{});
    // #endregion
    
    const response = await questionBankAPI.getAll()
    
    // #region agent log
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionForm.vue:fetchAllQuestions:afterAPI',message:'questionBankAPI.getAll response',data:{hasData:!!response.data,dataLength:response.data?.length,responseKeys:Object.keys(response)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'G,H'})}).catch(()=>{});
    // #endregion
    
    allQuestions.value = response.data || []
    
    // #region agent log
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionForm.vue:fetchAllQuestions:success',message:'fetched all questions',data:{totalQuestions:allQuestions.value.length,firstQuestion:allQuestions.value[0]},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F,G,H'})}).catch(()=>{});
    // #endregion
  } catch (error) {
    console.error('獲取題目列表失敗：', error)
    
    // #region agent log
    fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionForm.vue:fetchAllQuestions:error',message:'failed to fetch questions',data:{errorMessage:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
  }
}

onMounted(async () => {
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionForm.vue:onMounted:start',message:'onMounted called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  
  await Promise.all([
    fetchSubjects(),
    fetchHashtags(),
    fetchAllQuestions() // 獲取所有題目
  ])
  
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionForm.vue:onMounted:afterFetch',message:'after fetching subjects, hashtags, questions',data:{allQuestionsLength:allQuestions.value.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F,H'})}).catch(()=>{});
  // #endregion
  
  // 載入完成標籤後再載入題目（因為需要標籤來映射 tag_ids）
  await fetchQuestion()
  // 標記題目已載入，啟用自動提取功能（新增模式也需要啟用）
  isQuestionLoaded.value = true
  
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'QuestionForm.vue:onMounted:complete',message:'onMounted complete',data:{allQuestionsLength:allQuestions.value.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F,H'})}).catch(()=>{});
  // #endregion
})
</script>

<style scoped>
.markdown-preview {
  line-height: 1.6;
}

/* 讓編輯器高度自動調整，隨內容增加而變高 */
.question-editor-wrapper :deep(.block-editor-container),
.answer-editor-wrapper :deep(.block-editor-container),
.solution-editor-wrapper :deep(.block-editor-container) {
  min-height: auto;
}

.question-editor-wrapper :deep(.paper-sheet),
.answer-editor-wrapper :deep(.paper-sheet),
.solution-editor-wrapper :deep(.paper-sheet) {
  max-height: none !important; /* 移除最大高度限制 */
  min-height: 200px; /* 設置最小高度 */
  height: auto; /* 自動高度 */
  overflow-y: auto; /* 當內容超出時顯示滾動條 */
}

.question-editor-wrapper :deep(.editor-content),
.answer-editor-wrapper :deep(.editor-content),
.solution-editor-wrapper :deep(.editor-content) {
  min-height: 200px; /* 設置最小高度 */
  height: auto; /* 自動高度 */
}

.question-editor-wrapper :deep(.ProseMirror),
.answer-editor-wrapper :deep(.ProseMirror),
.solution-editor-wrapper :deep(.ProseMirror) {
  min-height: 200px; /* 設置最小高度 */
  height: auto; /* 自動高度 */
}
</style>
