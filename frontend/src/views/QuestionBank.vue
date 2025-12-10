<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-indigo-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
      <p class="text-sm font-semibold text-slate-500">教學模組</p>
      <h2 class="text-2xl font-bold text-slate-900">題庫與標籤系統</h2>
          <p class="mt-2 text-sm text-slate-500">支援 Markdown + LaTeX，含標籤管理</p>
        </div>
        <button
          @click="openFormModal()"
          class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-indigo-600 hover:to-purple-600"
        >
          新增題目
        </button>
      </div>
      <p v-if="usingMock" class="mt-3 text-sm text-amber-600">
        目前顯示示意資料（mock data），待後端 API 可用後即可串接。
      </p>
    </header>

    <!-- 載入中 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-slate-500">載入中...</div>
    </div>

    <!-- 題目列表 -->
    <section v-else class="grid gap-4 lg:grid-cols-2">
      <article
        v-for="question in questionBank"
        :key="question.question_id"
        class="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Q{{ question.question_id }} ・ {{ question.subject_name || question.subject?.name || '無科目' }} / {{ getLevelDisplay(question.level) }}
            </p>
            <h3 class="mt-1 text-lg font-semibold text-slate-900">{{ question.chapter }}</h3>
          </div>
          <span class="ml-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            難度 {{ question.difficulty }}
          </span>
        </div>
        <div class="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{{ question.content }}</div>
        <div v-if="question.correct_answer" class="mt-3 text-xs text-slate-600">
          <span class="font-semibold">答案：</span>{{ question.correct_answer }}
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <span
            v-for="tag in question.tags || []"
            :key="tag"
            class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
          >
            #{{ tag }}
          </span>
          <span v-if="!question.tags || question.tags.length === 0" class="text-xs text-slate-400">
            無標籤
          </span>
        </div>
        <div class="mt-4 flex gap-2">
          <button
            @click="openFormModal(question)"
            class="rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-600"
          >
            編輯
          </button>
          <button
            @click="deleteQuestion(question.question_id, question.chapter)"
            class="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
          >
            刪除
          </button>
        </div>
      </article>
      <div v-if="questionBank.length === 0" class="col-span-2 rounded-3xl border border-slate-100 bg-white p-12 text-center">
        <p class="text-slate-500">目前沒有題目，點擊「新增題目」開始建立題庫。</p>
      </div>
    </section>

    <!-- 新增標籤對話框 -->
    <div
      v-if="showTagForm"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="showTagForm = false"
    >
      <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-900">新增標籤</h3>
          <button @click="showTagForm = false" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveTag" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">標籤名稱 *</label>
            <input
              v-model="tagFormData.tag_name"
              type="text"
              required
              maxlength="50"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="例如：必考三角、陷阱題、被動語態"
            />
            <p class="mt-1 text-xs text-slate-500">標籤名稱將以 # 開頭顯示</p>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="showTagForm = false"
              class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="savingTag"
              class="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
            >
              {{ savingTag ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 相機拍照對話框 -->
    <div
      v-if="showCameraModal"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      @click.self="closeCamera"
    >
      <div class="w-full max-w-2xl bg-black rounded-lg overflow-hidden">
        <div class="relative">
          <video
            ref="videoRef"
            autoplay
            playsinline
            class="w-full h-auto"
          ></video>
          <canvas ref="canvasRef" class="hidden"></canvas>
        </div>
        <div class="flex justify-center gap-4 p-4 bg-black">
          <button
            type="button"
            @click="closeCamera"
            class="px-6 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700"
          >
            取消
          </button>
          <button
            type="button"
            @click="capturePhoto"
            class="px-6 py-2 bg-white rounded-full hover:bg-gray-100 flex items-center gap-2"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            <span>拍照</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 新增科目對話框 -->
    <div
      v-if="showSubjectForm"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="showSubjectForm = false"
    >
      <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-900">新增科目</h3>
          <button @click="showSubjectForm = false" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveSubject" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">科目名稱 *</label>
            <input
              v-model="subjectFormData.name"
              type="text"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="例如：數學"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">科目代碼</label>
            <input
              v-model="subjectFormData.code"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="例如：Math（選填）"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">描述</label>
            <textarea
              v-model="subjectFormData.description"
              rows="3"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="科目描述（選填）"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="showSubjectForm = false"
              class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="savingSubject"
              class="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
            >
              {{ savingSubject ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 題目表單對話框 -->
    <div
      v-if="showFormModal"
      ref="formModalRef"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="closeFormModal"
      @paste="handlePaste"
      tabindex="-1"
    >
      <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-900">
            {{ editingQuestion ? '編輯題目' : '新增題目' }}
          </h3>
          <button @click="closeFormModal" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveQuestion" @paste="handlePaste" class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-semibold text-slate-700">科目 *</label>
              <button
                type="button"
                @click.prevent.stop="openSubjectForm"
                class="text-xs text-indigo-600 hover:text-indigo-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-200 rounded px-2 py-1 transition-colors"
              >
                + 新增科目
              </button>
            </div>
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

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">適用年級 *</label>
            <select
              v-model="formData.level"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">請選擇</option>
              <option value="JHS">Junior High School</option>
              <option value="SHS">Senior High School</option>
              <option value="VCS">Vocational School</option>
            </select>
          </div>

          <div class="relative">
            <label class="block text-sm font-semibold text-slate-700 mb-1">章節/單元 *</label>
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
                  <div class="flex items-center gap-2">
                    <span
                      v-if="suggestion.relevance === 2"
                      class="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded"
                    >
                      精確匹配
                    </span>
                    <span class="text-xs text-slate-500">
                      {{ suggestion.count }} 題
                </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">題目內容 (Markdown + LaTeX) *</label>
            <div class="space-y-3">
              <!-- 編輯區域 -->
              <div class="relative">
                <MarkdownEditor
                  v-model="formData.content"
                  :placeholder="'輸入題目內容...\n\n支援 Markdown 語法：\n- **粗體**\n- *斜體*\n- `程式碼`\n\n支援 LaTeX 數學公式：\n- 行內公式：$x^2 + y^2 = r^2$\n- 區塊公式：$$\n\\int_0^1 x^2 dx = \\frac{1}{3}\n$$'"
                />
              </div>
              
              <!-- 預覽區域 -->
              <div class="border-t border-slate-200 pt-3">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">即時預覽</span>
                  <span class="text-xs text-slate-400">下方顯示渲染效果</span>
                </div>
                <div
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-50 min-h-[150px] max-h-[300px] overflow-y-auto markdown-preview"
                  v-html="renderedContent"
                ></div>
              </div>
            </div>
            <p class="mt-1 text-xs text-slate-500">
              提示：使用 $$...$$ 表示區塊公式，使用 $...$ 表示行內公式
            </p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">正確答案 *</label>
            <textarea
              v-model="formData.correct_answer"
              required
              rows="3"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="輸入正確答案..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">難度 (1-5) *</label>
            <input
              v-model.number="formData.difficulty"
              type="number"
              min="1"
              max="5"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">題目圖片（選填）</label>
            <div class="space-y-3">
              <!-- 圖片預覽 -->
              <div v-if="imagePreview" class="relative rounded-lg border border-slate-300 overflow-hidden bg-slate-50">
                <img
                  :src="imagePreview"
                  alt="圖片預覽"
                  class="w-full max-h-64 object-contain"
                />
                <button
                  type="button"
                  @click="clearImage"
                  class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <!-- 上傳按鈕 -->
              <div class="flex gap-2">
                <label class="flex-1">
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleImageSelect"
                    accept="image/*"
                    class="hidden"
                  />
                  <div class="w-full rounded-lg border-2 border-dashed border-slate-300 px-4 py-3 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                    <svg class="w-6 h-6 mx-auto mb-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm font-semibold text-slate-700">選擇圖片</span>
                  </div>
                </label>
                
                <button
                  type="button"
                  @click="handlePasteClick"
                  class="rounded-lg border-2 border-dashed border-slate-300 px-4 py-3 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                  title="從剪貼簿貼上圖片（點擊此按鈕或直接按 Ctrl+V / Cmd+V）"
                >
                  <svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span class="text-xs text-slate-600 block mt-1">貼上</span>
                </button>
                
                <button
                  type="button"
                  @click="openCamera"
                  class="rounded-lg border-2 border-dashed border-slate-300 px-4 py-3 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="text-xs text-slate-600 block mt-1">拍照</span>
                </button>
              </div>
              
              <p v-if="uploadingImage" class="text-sm text-indigo-600">上傳中...</p>
              <p v-else-if="formData.image_path" class="text-xs text-slate-500">
                已上傳：{{ formData.image_path }}
              </p>
            </div>
          </div>

          <!-- 標籤選擇區域 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-semibold text-slate-700">標籤分類</label>
              <button
                type="button"
                @click.prevent.stop="openTagForm"
                class="text-xs text-indigo-600 hover:text-indigo-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-200 rounded px-2 py-1 transition-colors"
              >
                + 新增標籤
              </button>
            </div>
            <div class="border border-slate-300 rounded-lg p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
              <div v-if="hashtags.length === 0" class="text-sm text-slate-400 text-center py-4">
                尚無標籤，點擊「新增標籤」開始建立
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

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="closeFormModal"
              class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
            >
              {{ saving ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Markdown 預覽樣式 */
:deep(.markdown-preview) {
  line-height: 1.6;
}

:deep(.markdown-preview h1),
:deep(.markdown-preview h2),
:deep(.markdown-preview h3),
:deep(.markdown-preview h4),
:deep(.markdown-preview h5),
:deep(.markdown-preview h6) {
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

:deep(.markdown-preview h1) { font-size: 1.5em; }
:deep(.markdown-preview h2) { font-size: 1.3em; }
:deep(.markdown-preview h3) { font-size: 1.1em; }

:deep(.markdown-preview p) {
  margin-bottom: 0.75em;
}

:deep(.markdown-preview ul),
:deep(.markdown-preview ol) {
  margin-left: 1.5em;
  margin-bottom: 0.75em;
}

:deep(.markdown-preview code) {
  background-color: #f1f5f9;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875em;
}

:deep(.markdown-preview pre) {
  background-color: #f1f5f9;
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 0.75em;
}

:deep(.markdown-preview pre code) {
  background-color: transparent;
  padding: 0;
}

:deep(.markdown-preview blockquote) {
  border-left: 4px solid #cbd5e1;
  padding-left: 1em;
  margin-left: 0;
  color: #64748b;
  font-style: italic;
}

:deep(.markdown-preview table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0.75em;
}

:deep(.markdown-preview table th),
:deep(.markdown-preview table td) {
  border: 1px solid #cbd5e1;
  padding: 0.5rem;
  text-align: left;
}

:deep(.markdown-preview table th) {
  background-color: #f1f5f9;
  font-weight: 600;
}

/* 圖片樣式 */
:deep(.markdown-preview img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1em 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* LaTeX 樣式 */
:deep(.katex) {
  font-size: 1.1em;
}

:deep(.katex-display) {
  margin: 1em 0;
  text-align: center;
}
</style>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { questionBankAPI, hashtagAPI, subjectAPI, uploadImageAPI, getBackendBaseURL } from '../services/api'
import { mockQuestionBank } from '../data/mockData'
import MarkdownIt from 'markdown-it'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import MarkdownEditor from '../components/MarkdownEditor.vue'

const questionBank = ref([])
const hashtags = ref([])
const subjects = ref([])
const loading = ref(false)
const usingMock = ref(false)
const showFormModal = ref(false)
const showSubjectForm = ref(false)
const showTagForm = ref(false)
const editingQuestion = ref(null)
const saving = ref(false)
const savingSubject = ref(false)
const savingTag = ref(false)
const chapterSuggestions = ref([])
const showChapterSuggestions = ref(false)
const searchChapterTimeout = ref(null)
const imagePreview = ref('')
const uploadingImage = ref(false)
const fileInput = ref(null)
const showCameraModal = ref(false)
const videoRef = ref(null)
const videoStream = ref(null)
const canvasRef = ref(null)
const formModalRef = ref(null)

// 初始化 Markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// 獲取後端伺服器 URL（從 API 配置中獲取，而不是硬編碼）
const getBackendURL = () => {
  return getBackendBaseURL()
}

// 配置圖片 URL 處理，確保相對路徑轉換為絕對路徑
md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const src = token.attrGet('src')
  
  // 處理所有圖片 URL，確保是完整的絕對路徑
  if (src) {
    let absoluteSrc = src
    
    // 如果是相對路徑，轉換為絕對路徑
    if (!src.startsWith('http://') && !src.startsWith('https://')) {
      const backendURL = getBackendURL()
      
      if (src.startsWith('/media/') || src.startsWith('media/')) {
        absoluteSrc = src.startsWith('/') ? `${backendURL}${src}` : `${backendURL}/${src}`
      } else if (src.startsWith('/')) {
        absoluteSrc = `${backendURL}${src}`
      } else {
        absoluteSrc = `${backendURL}/${src}`
      }
      
      token.attrSet('src', absoluteSrc)
    } else if (src.includes(':5173')) {
      // 如果 URL 錯誤地包含了前端端口（5173），替換為後端 URL（8000）
      const backendURL = getBackendURL()
      absoluteSrc = src.replace(/https?:\/\/[^:]+:\d+/, backendURL)
      token.attrSet('src', absoluteSrc)
    }
  }
  
  // 使用默認的圖片渲染邏輯
  return self.renderToken(tokens, idx, options)
}

// 渲染 Markdown + LaTeX
const renderMarkdownWithLatex = (text) => {
  if (!text) return ''
  
  const latexData = []
  let index = 0
  
  // 先處理 LaTeX 區塊公式 $$...$$，用特殊標記替換
  let processed = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    const placeholder = `<span data-latex-block="${index}"></span>`
    try {
      const rendered = katex.renderToString(formula.trim(), {
        displayMode: true,
        throwOnError: false
      })
      latexData[index] = rendered
    } catch (e) {
      latexData[index] = `<span class="text-red-500">LaTeX 錯誤: ${e.message}</span>`
    }
    index++
    return placeholder
  })
  
  // 再處理行內公式 $...$
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
    // 跳過已經處理過的標記
    if (match.includes('data-latex')) {
      return match
    }
    const placeholder = `<span data-latex-inline="${index}"></span>`
    try {
      const rendered = katex.renderToString(formula.trim(), {
        displayMode: false,
        throwOnError: false
      })
      latexData[index] = rendered
    } catch (e) {
      latexData[index] = `<span class="text-red-500">LaTeX 錯誤: ${e.message}</span>`
    }
    index++
    return placeholder
  })
  
  // 渲染 Markdown
  let html = md.render(processed)
  
  // 替換所有 LaTeX 佔位符
  for (let i = 0; i < index; i++) {
    const blockRegex = new RegExp(`<span data-latex-block="${i}"></span>`, 'g')
    const inlineRegex = new RegExp(`<span data-latex-inline="${i}"></span>`, 'g')
    html = html.replace(blockRegex, latexData[i])
    html = html.replace(inlineRegex, latexData[i])
  }
  
  // 再次處理圖片 URL（確保所有圖片都是絕對路徑，指向後端伺服器）
  const backendURL = getBackendURL()
  
  // 使用正則表達式替換所有圖片 URL
  html = html.replace(/<img([^>]+)src="([^"]+)"/g, (match, attrs, src) => {
    let absoluteSrc = src
    
    // 如果已經是絕對路徑
    if (src.startsWith('http://') || src.startsWith('https://')) {
      // 檢查是否錯誤地指向前端伺服器（端口 5173）
      if (src.includes(':5173')) {
        absoluteSrc = src.replace(/https?:\/\/[^:]+:\d+/, backendURL)
        console.log('修正圖片 URL（前端端口）:', src, '->', absoluteSrc)
      } else {
        // 已經是正確的 URL，不處理
        return match
      }
    } else {
      // 轉換相對路徑為絕對路徑
      absoluteSrc = src.startsWith('/') ? `${backendURL}${src}` : `${backendURL}/${src}`
      console.log('轉換圖片 URL（相對路徑）:', src, '->', absoluteSrc)
    }
    
    return `<img${attrs}src="${absoluteSrc}"`
  })
  
  return html
}

// 計算渲染後的內容
const renderedContent = computed(() => {
  return renderMarkdownWithLatex(formData.value.content)
})

const formData = ref({
  subject: '',
  level: '',
  chapter: '',
  content: '',
  correct_answer: '',
  difficulty: 1,
  image_path: '',
  tag_ids: []
})

const subjectFormData = ref({
  name: '',
  code: '',
  description: ''
})

const tagFormData = ref({
  tag_name: ''
})

const getLevelDisplay = (level) => {
  const map = {
    'JHS': '國中',
    'SHS': '高中',
    'VCS': '高職'
  }
  return map[level] || level
}

const fetchQuestions = async () => {
  loading.value = true
  try {
    const response = await questionBankAPI.getAll()
    const data = response.data.results || response.data
    questionBank.value = Array.isArray(data) ? data : []
    usingMock.value = false
  } catch (error) {
    console.warn('獲取題目失敗，使用 mock 資料：', error)
    questionBank.value = mockQuestionBank
    usingMock.value = true
  } finally {
    loading.value = false
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

const openSubjectForm = () => {
  showSubjectForm.value = true
}

const searchChapters = async () => {
  // 清除之前的延遲
  if (searchChapterTimeout.value) {
    clearTimeout(searchChapterTimeout.value)
  }
  
  const query = formData.value.chapter?.trim() || ''
  
  // 如果輸入太短，不搜尋
  if (query.length < 1) {
    chapterSuggestions.value = []
    showChapterSuggestions.value = false
    return
  }
  
  // 延遲搜尋，避免頻繁請求
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
  // 延遲隱藏，讓點擊事件先執行
  setTimeout(() => {
    showChapterSuggestions.value = false
  }, 200)
}

const handleImageSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  await processImageFile(file)
}

const processImageFile = async (file) => {
  // 檢查文件類型
  if (!file.type.startsWith('image/')) {
    alert('請選擇圖片文件')
    return
  }
  
  // 檢查文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    alert('圖片文件大小不能超過 5MB')
    return
  }
  
  // 顯示預覽
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
  
  // 上傳圖片
  uploadingImage.value = true
  try {
    const response = await uploadImageAPI.upload(file)
    formData.value.image_path = response.data.image_path
    // 更新預覽 URL 為伺服器 URL
    if (response.data.image_url) {
      imagePreview.value = `http://localhost:8000${response.data.image_url}`
    }
  } catch (error) {
    console.error('上傳圖片失敗：', error)
    alert('上傳圖片失敗，請稍後再試')
    imagePreview.value = ''
    formData.value.image_path = ''
  } finally {
    uploadingImage.value = false
    // 清空 input 值，以便可以重新選擇同一個文件
    if (fileInput.value) fileInput.value.value = ''
  }
}

const handlePasteClick = async () => {
  // 檢查 Clipboard API 是否可用
  if (!navigator.clipboard || !navigator.clipboard.read) {
    alert('您的瀏覽器不支援剪貼簿 API，請使用以下方式：\n1. 直接按 Ctrl+V (或 Cmd+V) 貼上圖片\n2. 使用「選擇圖片」功能上傳圖片\n\n提示：Clipboard API 需要 HTTPS 連線，HTTP 環境下請使用快捷鍵貼上')
    return
  }

  try {
    // 嘗試從剪貼簿讀取圖片
    const clipboardItems = await navigator.clipboard.read()
    
    for (const clipboardItem of clipboardItems) {
      // 檢查是否有圖片類型
      for (const type of clipboardItem.types) {
        if (type.startsWith('image/')) {
          const blob = await clipboardItem.getType(type)
          const file = new File([blob], `paste_${Date.now()}.${type.split('/')[1]}`, { type })
          await processImageFile(file)
          return
        }
      }
    }
    
    // 如果沒有找到圖片，提示用戶
    alert('剪貼簿中沒有圖片，請先複製圖片後再試，或直接按 Ctrl+V (或 Cmd+V) 貼上')
  } catch (error) {
    console.error('讀取剪貼簿失敗：', error)
    
    // 根據錯誤類型提供不同的提示
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      alert('需要剪貼簿權限，請允許瀏覽器訪問剪貼簿，或直接按 Ctrl+V (或 Cmd+V) 貼上圖片')
    } else if (error.name === 'SecurityError') {
      alert('安全限制：Clipboard API 需要 HTTPS 連線。\n請使用以下方式：\n1. 直接按 Ctrl+V (或 Cmd+V) 貼上圖片\n2. 使用「選擇圖片」功能上傳圖片')
    } else {
      alert('無法讀取剪貼簿，請使用以下方式：\n1. 直接按 Ctrl+V (或 Cmd+V) 貼上圖片\n2. 使用「選擇圖片」功能上傳圖片')
    }
  }
}

const handlePaste = async (event) => {
  // 只在表單對話框打開時處理
  if (!showFormModal.value) return
  
  const items = event.clipboardData?.items
  if (!items || items.length === 0) {
    // 如果沒有剪貼簿項目，可能是文字貼上，不處理
    return
  }
  
  // 檢查是否有圖片
  let hasImage = false
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    
    // 檢查是否為圖片類型
    if (item.type.startsWith('image/')) {
      hasImage = true
      event.preventDefault() // 阻止默認貼上行為
      
      const file = item.getAsFile()
      if (file) {
        await processImageFile(file)
      }
      break
    }
  }
  
  // 如果沒有圖片，允許默認的貼上行為（例如文字貼上到 textarea）
  // 不阻止事件，讓瀏覽器正常處理文字貼上
}

const clearImage = () => {
  imagePreview.value = ''
  formData.value.image_path = ''
  if (fileInput.value) fileInput.value.value = ''
}

const openCamera = async () => {
  try {
    // 請求相機權限
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment' // 使用後置相機
      }
    })
    
    videoStream.value = stream
    showCameraModal.value = true
    
    // 等待 DOM 更新後設置視頻流
    await new Promise(resolve => setTimeout(resolve, 100))
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      videoRef.value.play()
    }
  } catch (error) {
    console.error('無法訪問相機：', error)
    if (error.name === 'NotAllowedError') {
      alert('請允許瀏覽器訪問相機權限')
    } else if (error.name === 'NotFoundError') {
      alert('未找到可用的相機設備')
    } else {
      alert('無法啟動相機，請嘗試使用「選擇圖片」功能')
    }
  }
}

const closeCamera = () => {
  // 停止視頻流
  if (videoStream.value) {
    videoStream.value.getTracks().forEach(track => track.stop())
    videoStream.value = null
  }
  showCameraModal.value = false
}

const capturePhoto = async () => {
  if (!videoRef.value || !canvasRef.value) return
  
  try {
    const canvas = canvasRef.value
    const video = videoRef.value
    
    // 設置 canvas 尺寸與視頻相同
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // 繪製當前視頻幀到 canvas
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // 將 canvas 轉換為 Blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert('拍照失敗，請重試')
        return
      }
      
      // 創建 File 對象
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })
      
      // 顯示預覽
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview.value = e.target.result
      }
      reader.readAsDataURL(file)
      
      // 關閉相機
      closeCamera()
      
      // 上傳圖片
      uploadingImage.value = true
      try {
        const response = await uploadImageAPI.upload(file)
        formData.value.image_path = response.data.image_path
        if (response.data.image_url) {
          imagePreview.value = `http://localhost:8000${response.data.image_url}`
        }
      } catch (error) {
        console.error('上傳圖片失敗：', error)
        alert('上傳圖片失敗，請稍後再試')
        imagePreview.value = ''
        formData.value.image_path = ''
      } finally {
        uploadingImage.value = false
      }
    }, 'image/jpeg', 0.9)
  } catch (error) {
    console.error('拍照失敗：', error)
    alert('拍照失敗，請重試')
  }
}

const saveSubject = async () => {
  savingSubject.value = true
  try {
    const response = await subjectAPI.create(subjectFormData.value)
    subjects.value.push(response.data)
    // 自動選擇剛新增的科目
    formData.value.subject = response.data.subject_id
    showSubjectForm.value = false
    // 重置表單
    subjectFormData.value = {
      name: '',
      code: '',
      description: ''
    }
  } catch (error) {
    console.error('儲存科目失敗：', error)
    if (error.response?.data) {
      const errorMsg = typeof error.response.data === 'string' 
        ? error.response.data 
        : JSON.stringify(error.response.data)
      alert(`儲存失敗：${errorMsg}`)
    } else {
      alert('儲存失敗，請稍後再試')
    }
  } finally {
    savingSubject.value = false
  }
}

const openTagForm = () => {
  showTagForm.value = true
}

const toggleTag = (tagId) => {
  const index = formData.value.tag_ids.indexOf(tagId)
  if (index > -1) {
    // 如果已選擇，則移除
    formData.value.tag_ids.splice(index, 1)
  } else {
    // 如果未選擇，則添加
    formData.value.tag_ids.push(tagId)
  }
}

const saveTag = async () => {
  savingTag.value = true
  try {
    // 檢查標籤是否已存在
    const existingTag = hashtags.value.find(
      tag => tag.tag_name.toLowerCase() === tagFormData.value.tag_name.toLowerCase().trim()
    )
    
    if (existingTag) {
      // 如果標籤已存在，直接選擇它
      if (!formData.value.tag_ids.includes(existingTag.tag_id)) {
        formData.value.tag_ids.push(existingTag.tag_id)
      }
      showTagForm.value = false
      tagFormData.value.tag_name = ''
      alert('標籤已存在，已自動選擇')
      return
    }

    // 創建新標籤（creator 可選，允許為 null）
    const response = await hashtagAPI.create({
      tag_name: tagFormData.value.tag_name.trim()
    })
    
    // 添加新標籤到列表
    hashtags.value.push(response.data)
    // 自動選擇剛新增的標籤
    formData.value.tag_ids.push(response.data.tag_id)
    showTagForm.value = false
    // 重置表單
    tagFormData.value.tag_name = ''
  } catch (error) {
    console.error('儲存標籤失敗：', error)
    if (error.response?.data) {
      let errorMsg = ''
      if (typeof error.response.data === 'string') {
        errorMsg = error.response.data
      } else if (error.response.data.tag_name) {
        // Django 錯誤格式
        errorMsg = Array.isArray(error.response.data.tag_name)
          ? error.response.data.tag_name[0]
          : error.response.data.tag_name
      } else {
        errorMsg = JSON.stringify(error.response.data)
      }
      alert(`儲存失敗：${errorMsg}`)
    } else {
      alert('儲存失敗，請稍後再試')
    }
  } finally {
    savingTag.value = false
  }
}

const openFormModal = async (question = null) => {
  editingQuestion.value = question
  imagePreview.value = ''
  
  if (question) {
    // 獲取題目的標籤 ID
    // 優先使用 tag_ids（如果 API 返回），否則從 tags 名稱列表中查找
    let tagIds = []
    if (question.tag_ids && Array.isArray(question.tag_ids)) {
      tagIds = question.tag_ids
    } else if (question.tags && Array.isArray(question.tags)) {
      // 如果有標籤名稱列表，需要找到對應的 tag_id
      question.tags.forEach(tagName => {
        const tag = hashtags.value.find(t => t.tag_name === tagName)
        if (tag) {
          tagIds.push(tag.tag_id)
        }
      })
    }
    
    formData.value = {
      subject: question.subject?.subject_id || question.subject, // 支援對象或ID
      level: question.level,
      chapter: question.chapter,
      content: question.content,
      correct_answer: question.correct_answer,
      difficulty: question.difficulty,
      image_path: question.image_path || '',
      tag_ids: tagIds
    }
    
    // 如果有圖片路徑，顯示預覽
    if (question.image_path) {
      imagePreview.value = `http://localhost:8000/media/${question.image_path}`
    }
  } else {
    formData.value = {
      subject: '',
      level: '',
      chapter: '',
      content: '',
      correct_answer: '',
      difficulty: 1,
      image_path: '',
      tag_ids: []
    }
  }
  showFormModal.value = true
  
  // 等待 DOM 更新後聚焦對話框，以便接收 paste 事件
  await new Promise(resolve => setTimeout(resolve, 100))
  if (formModalRef.value) {
    formModalRef.value.focus()
  }
}

const closeFormModal = () => {
  showFormModal.value = false
  editingQuestion.value = null
  // 重置表單
  formData.value = {
    subject: '',
    level: '',
    chapter: '',
    content: '',
    correct_answer: '',
    difficulty: 1,
    image_path: '',
    tag_ids: []
  }
}

const saveQuestion = async () => {
  saving.value = true
  try {
    // 準備數據，將 tag_ids 改為 tag_ids_input（對應後端寫入欄位）
    const data = {
      ...formData.value,
      tag_ids_input: formData.value.tag_ids,
      // 移除 tag_ids，因為它是只讀的
      tag_ids: undefined
    }
    delete data.tag_ids
    
    if (editingQuestion.value) {
      await questionBankAPI.update(editingQuestion.value.question_id, data)
    } else {
      await questionBankAPI.create(data)
    }
    closeFormModal()
    fetchQuestions()
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

const deleteQuestion = async (id, chapter) => {
  if (!confirm(`確定要刪除題目「${chapter}」嗎？`)) {
    return
  }

  try {
    await questionBankAPI.delete(id)
    fetchQuestions()
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗，請稍後再試')
  }
}

onMounted(() => {
  fetchSubjects()
  fetchQuestions()
  fetchHashtags()
})
</script>
