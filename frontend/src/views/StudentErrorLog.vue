<template>
  <div class="space-y-6">
    <header class="rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-purple-50 p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-500">學生學習追蹤</p>
          <h2 class="text-2xl font-bold text-slate-900">{{ studentName }} 的錯題本</h2>
          <p class="mt-2 text-sm text-slate-500">追蹤學習進度與複習狀態</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="openAddErrorModal"
            class="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-purple-600 hover:to-indigo-600"
          >
            + 新增錯題
          </button>
          <router-link
            to="/students"
            class="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            返回學生列表
          </router-link>
        </div>
      </div>
    </header>

    <!-- 統計卡片 -->
    <section class="grid gap-4 md:grid-cols-4">
      <div class="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">總錯題數</p>
        <p class="mt-2 text-3xl font-bold text-slate-900">{{ errorLogs.length }}</p>
      </div>
      <div class="rounded-3xl border border-rose-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">新錯題</p>
        <p class="mt-2 text-3xl font-bold text-rose-600">
          {{ errorLogs.filter(e => e.review_status === 'New').length }}
        </p>
      </div>
      <div class="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">複習中</p>
        <p class="mt-2 text-3xl font-bold text-amber-600">
          {{ errorLogs.filter(e => e.review_status === 'Reviewing').length }}
        </p>
      </div>
      <div class="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">已掌握</p>
        <p class="mt-2 text-3xl font-bold text-emerald-600">
          {{ errorLogs.filter(e => e.review_status === 'Mastered').length }}
        </p>
      </div>
    </section>

    <!-- 錯題列表 -->
    <section class="rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div class="p-5 border-b border-slate-100">
        <h3 class="text-lg font-semibold text-slate-900">錯題列表</h3>
        <p class="text-sm text-slate-500">點擊題目查看詳情，點擊狀態更新複習進度</p>
      </div>

      <div v-if="loading" class="p-12 text-center">
        <p class="text-slate-500">載入中...</p>
      </div>

      <div v-else-if="errorLogs.length === 0" class="p-12 text-center">
        <p class="text-slate-500">目前沒有錯題記錄。</p>
        <button
          @click="openAddErrorModal"
          class="mt-4 rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-600"
        >
          新增錯題
        </button>
      </div>

      <div v-else class="divide-y divide-slate-100">
        <div
          v-for="errorLog in errorLogs"
          :key="errorLog.error_log_id"
          class="p-5 transition hover:bg-slate-50/70 cursor-pointer"
          @click="viewErrorDetail(errorLog)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="statusColor(errorLog.review_status)"
                >
                  {{ getReviewStatusDisplay(errorLog.review_status) }}
                </span>
                <span class="text-xs text-slate-500">
                  {{ errorLog.question_subject }} / {{ errorLog.question_level }}
                </span>
              </div>
              <h4 class="text-lg font-semibold text-slate-900 mb-1">
                {{ errorLog.question_chapter || `題目 #${errorLog.question}` }}
              </h4>
              <p class="text-sm text-slate-600 mb-3 line-clamp-2">
                {{ errorLog.question_content || getQuestionContent(errorLog.question) }}
              </p>
              <div class="flex items-center gap-4 text-xs text-slate-500">
                <span>錯誤次數：<strong class="text-slate-900">{{ errorLog.error_count }}</strong></span>
              </div>
            </div>
            <div class="ml-4 flex gap-2">
              <button
                @click.stop="updateErrorStatus(errorLog)"
                class="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-600"
              >
                更新狀態
              </button>
              <button
                @click.stop="incrementErrorCount(errorLog)"
                class="rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600"
              >
                +1 次錯誤
              </button>
              <button
                @click.stop="deleteErrorLog(errorLog.error_log_id, errorLog.question_chapter)"
                class="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 新增錯題對話框 -->
    <div
      v-if="showAddErrorModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="showAddErrorModal = false"
    >
      <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-900">新增錯題記錄</h3>
          <button @click="showAddErrorModal = false" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveErrorLog" class="space-y-4">
          <!-- 從題庫選擇或新增題目 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-semibold text-slate-700">題目來源</label>
              <button
                type="button"
                @click="errorFormData.useExistingQuestion = !errorFormData.useExistingQuestion"
                class="text-xs text-purple-600 hover:text-purple-700 font-semibold"
              >
                {{ errorFormData.useExistingQuestion ? '改為新增題目' : '從題庫選擇' }}
              </button>
            </div>
            
            <!-- 從題庫選擇 -->
            <select
              v-if="errorFormData.useExistingQuestion"
              v-model="errorFormData.selectedQuestionId"
              @change="loadQuestionFromBank"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              <option value="">請選擇題庫中的題目</option>
              <option
                v-for="question in questions"
                :key="question.question_id"
                :value="question.question_id"
              >
                {{ question.subject_name }} - {{ question.chapter }} (Q{{ question.question_id }})
              </option>
            </select>
            
            <!-- 或新增題目 -->
            <div v-else class="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
              將在題庫中新增此題目，並自動標記為錯題
            </div>
          </div>

          <!-- 科目 -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-semibold text-slate-700">科目 *</label>
              <button
                type="button"
                @click="showSubjectForm = true"
                class="text-xs text-purple-600 hover:text-purple-700 font-semibold"
              >
                + 新增科目
              </button>
            </div>
            <select
              v-model="errorFormData.subject"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
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
            <label class="block text-sm font-semibold text-slate-700 mb-1">適用年級 *</label>
            <select
              v-model="errorFormData.level"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              <option value="">請選擇</option>
              <option value="JHS">Junior High School</option>
              <option value="SHS">Senior High School</option>
              <option value="VCS">Vocational School</option>
            </select>
          </div>

          <!-- 章節/單元 -->
          <div class="relative">
            <label class="block text-sm font-semibold text-slate-700 mb-1">章節/單元 *</label>
            <input
              v-model="errorFormData.chapter"
              type="text"
              required
              @input="searchChapters"
              @focus="searchChapters"
              @blur="handleChapterBlur"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
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
                class="px-3 py-2 hover:bg-purple-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-900">{{ suggestion.chapter }}</span>
                  <div class="flex items-center gap-2">
                    <span
                      v-if="suggestion.relevance === 2"
                      class="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded"
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

          <!-- 題目內容 -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">題目內容 (Markdown + LaTeX) *</label>
            <textarea
              v-model="errorFormData.content"
              required
              rows="6"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="輸入題目內容..."
            ></textarea>
          </div>

          <!-- 正確答案 -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">正確答案 *</label>
            <textarea
              v-model="errorFormData.correct_answer"
              required
              rows="3"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="輸入正確答案..."
            ></textarea>
          </div>

          <!-- 難度 -->
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">難度 (1-5) *</label>
            <input
              v-model.number="errorFormData.difficulty"
              type="number"
              min="1"
              max="5"
              required
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>

          <!-- 圖片上傳 -->
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
                  <div class="w-full rounded-lg border-2 border-dashed border-slate-300 px-4 py-3 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                    <svg class="w-6 h-6 mx-auto mb-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm font-semibold text-slate-700">選擇圖片</span>
                  </div>
                </label>
                
                <button
                  type="button"
                  @click="openCamera"
                  class="rounded-lg border-2 border-dashed border-slate-300 px-4 py-3 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="text-xs text-slate-600 block mt-1">拍照</span>
                </button>
              </div>
              
              <p v-if="uploadingImage" class="text-sm text-purple-600">上傳中...</p>
              <p v-else-if="errorFormData.image_path" class="text-xs text-slate-500">
                已上傳：{{ errorFormData.image_path }}
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
                class="text-xs text-purple-600 hover:text-purple-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-200 rounded px-2 py-1 transition-colors"
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
                    errorFormData.tag_ids.includes(tag.tag_id)
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  ]"
                >
                  #{{ tag.tag_name }}
                  <span v-if="errorFormData.tag_ids.includes(tag.tag_id)" class="ml-1">✓</span>
                </button>
              </div>
            </div>
            <p class="mt-1 text-xs text-slate-500">
              已選擇 {{ errorFormData.tag_ids.length }} 個標籤
            </p>
          </div>

          <!-- 錯題相關資訊 -->
          <div class="border-t border-slate-200 pt-4">
            <h4 class="text-sm font-semibold text-slate-700 mb-3">錯題資訊</h4>
            
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">錯誤次數 *</label>
              <input
                v-model.number="errorFormData.error_count"
                type="number"
                min="1"
                required
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div class="mt-4">
              <label class="block text-sm font-semibold text-slate-700 mb-1">複習狀態 *</label>
              <select
                v-model="errorFormData.review_status"
                required
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="New">新錯題</option>
                <option value="Reviewing">複習中</option>
                <option value="Mastered">已掌握</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="showAddErrorModal = false"
              class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-600 disabled:opacity-50"
            >
              {{ saving ? '儲存中...' : '儲存' }}
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
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="例如：數學"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">科目代碼</label>
            <input
              v-model="subjectFormData.code"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="例如：MATH（選填）"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">描述</label>
            <textarea
              v-model="subjectFormData.description"
              rows="3"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
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
              class="rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-600 disabled:opacity-50"
            >
              {{ savingSubject ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

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
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              placeholder="例如：錯題、需複習"
            />
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
              class="rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-600 disabled:opacity-50"
            >
              {{ savingTag ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 錯題詳情對話框 -->
    <div
      v-if="showDetailModal && selectedError"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="showDetailModal = false"
    >
      <div class="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-900">錯題詳情</h3>
          <button @click="showDetailModal = false" class="text-slate-400 hover:text-slate-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="questionDetail" class="space-y-4">
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div class="flex items-center gap-3 mb-3">
              <span
                class="rounded-full px-3 py-1 text-xs font-semibold"
                :class="statusColor(selectedError.review_status)"
              >
                {{ getReviewStatusDisplay(selectedError.review_status) }}
              </span>
              <span class="text-sm text-slate-600">
                {{ questionDetail.subject_name }} / {{ getLevelDisplay(questionDetail.level) }}
              </span>
              <span class="text-sm text-slate-600">錯誤次數：<strong>{{ selectedError.error_count }}</strong></span>
            </div>
            <h4 class="text-lg font-semibold text-slate-900 mb-2">{{ questionDetail.chapter }}</h4>
            <div class="text-sm text-slate-700 whitespace-pre-wrap mb-3">{{ questionDetail.content }}</div>
            <div v-if="questionDetail.correct_answer" class="text-sm text-slate-600">
              <span class="font-semibold">正確答案：</span>{{ questionDetail.correct_answer }}
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              @click="showDetailModal = false"
              class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              關閉
            </button>
            <button
              @click="updateErrorStatus(selectedError)"
              class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600"
            >
              更新狀態
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { errorLogAPI, questionBankAPI, studentAPI, subjectAPI, hashtagAPI, uploadImageAPI } from '../services/api'

const route = useRoute()
const studentId = parseInt(route.params.id)

const errorLogs = ref([])
const questions = ref([])
const subjects = ref([])
const hashtags = ref([])
const questionDetail = ref(null)
const loading = ref(false)
const saving = ref(false)
const showAddErrorModal = ref(false)
const showDetailModal = ref(false)
const showSubjectForm = ref(false)
const showTagForm = ref(false)
const savingSubject = ref(false)
const savingTag = ref(false)
const selectedError = ref(null)
const studentName = ref('')
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

const errorFormData = ref({
  useExistingQuestion: true,
  selectedQuestionId: '',
  subject: '',
  level: '',
  chapter: '',
  content: '',
  correct_answer: '',
  difficulty: 1,
  image_path: '',
  tag_ids: [],
  error_count: 1,
  review_status: 'New'
})

const subjectFormData = ref({
  name: '',
  code: '',
  description: ''
})

const tagFormData = ref({
  tag_name: ''
})

const statusColor = (status) => {
  const map = {
    New: 'bg-rose-50 text-rose-600',
    Reviewing: 'bg-amber-50 text-amber-600',
    Mastered: 'bg-emerald-50 text-emerald-600',
  }
  return map[status] ?? 'bg-slate-100 text-slate-700'
}

const getReviewStatusDisplay = (status) => {
  const map = {
    'New': '新錯題',
    'Reviewing': '複習中',
    'Mastered': '已掌握'
  }
  return map[status] || status
}

const getLevelDisplay = (level) => {
  const map = {
    'JHS': '國中',
    'SHS': '高中',
    'VCS': '高職'
  }
  return map[level] || level
}

const getQuestionContent = (questionId) => {
  const question = questions.value.find(q => q.question_id === questionId)
  return question ? question.content : '載入中...'
}

const fetchStudentInfo = async () => {
  try {
    const response = await studentAPI.getById(studentId)
    studentName.value = response.data.name
  } catch (error) {
    console.warn('獲取學生資訊失敗：', error)
    studentName.value = '學生'
  }
}

const fetchErrorLogs = async () => {
  loading.value = true
  try {
    const response = await errorLogAPI.getAll(studentId)
    const data = response.data.results || response.data
    errorLogs.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('獲取錯題記錄失敗：', error)
    errorLogs.value = []
  } finally {
    loading.value = false
  }
}

const fetchQuestions = async () => {
  try {
    const response = await questionBankAPI.getAll()
    const data = response.data.results || response.data
    questions.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.warn('獲取題目失敗：', error)
    questions.value = []
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
    hashtags.value = []
  }
}

const loadQuestionFromBank = async () => {
  if (!errorFormData.value.selectedQuestionId) return
  
  try {
    const response = await questionBankAPI.getById(errorFormData.value.selectedQuestionId)
    const question = response.data
    
    // 自動填充表單
    errorFormData.value.subject = question.subject?.subject_id || question.subject
    errorFormData.value.level = question.level
    errorFormData.value.chapter = question.chapter
    errorFormData.value.content = question.content
    errorFormData.value.correct_answer = question.correct_answer
    errorFormData.value.difficulty = question.difficulty
    errorFormData.value.image_path = question.image_path || ''
    
    // 如果有圖片路徑，顯示預覽
    if (question.image_path) {
      imagePreview.value = `http://localhost:8000/media/${question.image_path}`
    } else {
      imagePreview.value = ''
    }
    
    // 自動帶入題目的標籤
    if (question.tag_ids && Array.isArray(question.tag_ids)) {
      errorFormData.value.tag_ids = [...question.tag_ids]
    }
    
    // 自動添加錯題相關標籤
    addErrorTags()
  } catch (error) {
    console.error('載入題目失敗：', error)
    alert('載入題目失敗')
  }
}

const addErrorTags = () => {
  // 查找錯題相關標籤（#錯題、#需複習等）
  const errorTagNames = ['錯題', '需複習', '易錯題']
  errorTagNames.forEach(tagName => {
    const tag = hashtags.value.find(t => 
      t.tag_name.toLowerCase() === tagName.toLowerCase()
    )
    if (tag && !errorFormData.value.tag_ids.includes(tag.tag_id)) {
      errorFormData.value.tag_ids.push(tag.tag_id)
    }
  })
}

const searchChapters = async () => {
  if (searchChapterTimeout.value) {
    clearTimeout(searchChapterTimeout.value)
  }
  
  const query = errorFormData.value.chapter?.trim() || ''
  
  if (query.length < 1) {
    chapterSuggestions.value = []
    showChapterSuggestions.value = false
    return
  }
  
  searchChapterTimeout.value = setTimeout(async () => {
    try {
      const response = await questionBankAPI.searchChapters(
        query,
        errorFormData.value.subject || null,
        errorFormData.value.level || null
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
  errorFormData.value.chapter = chapter
  showChapterSuggestions.value = false
  chapterSuggestions.value = []
}

const handleChapterBlur = () => {
  setTimeout(() => {
    showChapterSuggestions.value = false
  }, 200)
}

const toggleTag = (tagId) => {
  const index = errorFormData.value.tag_ids.indexOf(tagId)
  if (index > -1) {
    errorFormData.value.tag_ids.splice(index, 1)
  } else {
    errorFormData.value.tag_ids.push(tagId)
  }
}

const openTagForm = () => {
  showTagForm.value = true
}

const saveTag = async () => {
  savingTag.value = true
  try {
    const existingTag = hashtags.value.find(
      tag => tag.tag_name.toLowerCase() === tagFormData.value.tag_name.toLowerCase().trim()
    )
    
    if (existingTag) {
      if (!errorFormData.value.tag_ids.includes(existingTag.tag_id)) {
        errorFormData.value.tag_ids.push(existingTag.tag_id)
      }
      showTagForm.value = false
      tagFormData.value.tag_name = ''
      return
    }

    const response = await hashtagAPI.create({
      tag_name: tagFormData.value.tag_name.trim()
    })
    
    hashtags.value.push(response.data)
    errorFormData.value.tag_ids.push(response.data.tag_id)
    showTagForm.value = false
    tagFormData.value.tag_name = ''
  } catch (error) {
    console.error('儲存標籤失敗：', error)
    if (error.response?.data) {
      let errorMsg = ''
      if (typeof error.response.data === 'string') {
        errorMsg = error.response.data
      } else if (error.response.data.tag_name) {
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

const openSubjectForm = () => {
  showSubjectForm.value = true
}

const saveSubject = async () => {
  savingSubject.value = true
  try {
    const response = await subjectAPI.create(subjectFormData.value)
    subjects.value.push(response.data)
    errorFormData.value.subject = response.data.subject_id
    showSubjectForm.value = false
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

const openAddErrorModal = () => {
  errorFormData.value = {
    useExistingQuestion: true,
    selectedQuestionId: '',
    subject: '',
    level: '',
    chapter: '',
    content: '',
    correct_answer: '',
    difficulty: 1,
    image_path: '',
    tag_ids: [],
    error_count: 1,
    review_status: 'New'
  }
  imagePreview.value = ''
  showAddErrorModal.value = true
}

const handleImageSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
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
    errorFormData.value.image_path = response.data.image_path
    // 更新預覽 URL 為伺服器 URL
    if (response.data.image_url) {
      imagePreview.value = `http://localhost:8000${response.data.image_url}`
    }
  } catch (error) {
    console.error('上傳圖片失敗：', error)
    alert('上傳圖片失敗，請稍後再試')
    imagePreview.value = ''
    errorFormData.value.image_path = ''
  } finally {
    uploadingImage.value = false
    // 清空 input 值，以便可以重新選擇同一個文件
    if (fileInput.value) fileInput.value.value = ''
    if (cameraInput.value) cameraInput.value.value = ''
  }
}

const clearImage = () => {
  imagePreview.value = ''
  errorFormData.value.image_path = ''
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
        errorFormData.value.image_path = response.data.image_path
        if (response.data.image_url) {
          imagePreview.value = `http://localhost:8000${response.data.image_url}`
        }
      } catch (error) {
        console.error('上傳圖片失敗：', error)
        alert('上傳圖片失敗，請稍後再試')
        imagePreview.value = ''
        errorFormData.value.image_path = ''
      } finally {
        uploadingImage.value = false
      }
    }, 'image/jpeg', 0.9)
  } catch (error) {
    console.error('拍照失敗：', error)
    alert('拍照失敗，請重試')
  }
}

const saveErrorLog = async () => {
  saving.value = true
  try {
    let questionId = null
    
    // 如果選擇了題庫中的題目，直接使用
    if (errorFormData.value.useExistingQuestion && errorFormData.value.selectedQuestionId) {
      questionId = parseInt(errorFormData.value.selectedQuestionId)
      
      // 更新題目的標籤（添加錯題相關標籤）
      if (errorFormData.value.tag_ids.length > 0) {
        try {
          const question = questions.value.find(q => q.question_id === questionId)
          if (question) {
            const existingTagIds = question.tag_ids || []
            const allTagIds = [...new Set([...existingTagIds, ...errorFormData.value.tag_ids])]
            
            await questionBankAPI.update(questionId, {
              ...question,
              tag_ids_input: allTagIds
            })
          }
        } catch (error) {
          console.warn('更新題目標籤失敗：', error)
        }
      }
    } else {
      // 如果沒有選擇題目，先創建新題目
      // 自動添加錯題相關標籤
      addErrorTags()
      
      const questionData = {
        subject: errorFormData.value.subject,
        level: errorFormData.value.level,
        chapter: errorFormData.value.chapter,
        content: errorFormData.value.content,
        correct_answer: errorFormData.value.correct_answer,
        difficulty: errorFormData.value.difficulty,
        image_path: errorFormData.value.image_path || '',
        tag_ids_input: errorFormData.value.tag_ids
      }
      
      const questionResponse = await questionBankAPI.create(questionData)
      questionId = questionResponse.data.question_id
      
      // 更新題目列表
      questions.value.push(questionResponse.data)
    }
    
    // 創建錯題記錄
    await errorLogAPI.create({
      student: studentId,
      question: questionId,
      error_count: errorFormData.value.error_count,
      review_status: errorFormData.value.review_status
    })
    
    showAddErrorModal.value = false
    fetchErrorLogs()
  } catch (error) {
    console.error('儲存錯題記錄失敗：', error)
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

const viewErrorDetail = async (errorLog) => {
  selectedError.value = errorLog
  try {
    const response = await questionBankAPI.getById(errorLog.question)
    questionDetail.value = response.data
    showDetailModal.value = true
  } catch (error) {
    console.error('獲取題目詳情失敗：', error)
    alert('無法載入題目詳情')
  }
}

const updateErrorStatus = async (errorLog) => {
  const statuses = ['New', 'Reviewing', 'Mastered']
  const currentIndex = statuses.indexOf(errorLog.review_status)
  const nextStatus = statuses[(currentIndex + 1) % statuses.length]
  
  try {
    await errorLogAPI.update(errorLog.error_log_id, {
      ...errorLog,
      review_status: nextStatus
    })
    fetchErrorLogs()
    if (selectedError.value && selectedError.value.error_log_id === errorLog.error_log_id) {
      selectedError.value.review_status = nextStatus
    }
  } catch (error) {
    console.error('更新狀態失敗:', error)
    alert('更新狀態失敗，請稍後再試')
  }
}

const incrementErrorCount = async (errorLog) => {
  try {
    await errorLogAPI.update(errorLog.error_log_id, {
      ...errorLog,
      error_count: errorLog.error_count + 1,
      review_status: errorLog.review_status === 'Mastered' ? 'Reviewing' : errorLog.review_status
    })
    fetchErrorLogs()
  } catch (error) {
    console.error('增加錯誤次數失敗:', error)
    alert('操作失敗，請稍後再試')
  }
}

const deleteErrorLog = async (id, chapter) => {
  if (!confirm(`確定要刪除錯題記錄「${chapter}」嗎？`)) {
    return
  }

  try {
    await errorLogAPI.delete(id)
    fetchErrorLogs()
    if (showDetailModal.value) {
      showDetailModal.value = false
    }
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗，請稍後再試')
  }
}

onMounted(() => {
  fetchStudentInfo()
  fetchErrorLogs()
  fetchQuestions()
  fetchSubjects()
  fetchHashtags()
})
</script>

