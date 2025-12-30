# 顯示模式控制功能

## 📋 需求說明

用戶要求在**編輯模式下**就能根據選擇的模式來控制題目的顯示內容，而不是只在列印時才隱藏。

### 顯示模式定義

1. **純題目**：只顯示題目敘述
2. **題目+答案**：顯示題目敘述 + 答案
3. **題目+詳解**：顯示題目敘述 + 詳解
4. **題目+答案+詳解**：全部顯示

### 列印行為

列印時應該根據文件當下的顯示狀態列印，不需要額外省略或顯示內容。

## 🔧 實現方案

### 1. ResourceEditor.vue - 顯示模式選擇器

#### 修改前

```vue
<select v-model="printModeSelection" ...>
  <option value="question-only">純題目卷</option>
  <option value="with-answer">題目+答案</option>
  <option value="with-solution">題目+詳解</option>
</select>
```

#### 修改後

```vue
<!-- 顯示模式選擇 -->
<select v-model="printModeSelection" ...>
  <option value="question-only">純題目</option>
  <option value="with-answer">題目+答案</option>
  <option value="with-solution">題目+詳解</option>
  <option value="with-all">題目+答案+詳解</option>
</select>
```

**變更說明：**
- ✅ 新增「題目+答案+詳解」選項（`with-all`）
- ✅ 簡化選項名稱（移除「卷」字）
- ✅ 保持使用 `printModeSelection` ref 和 `provide('printMode', printModeSelection)`

#### 列印函數簡化

```javascript
// 修改前
const print = async () => {
  const container = document.querySelector('.block-editor-container')
  if (container) {
    container.setAttribute('data-print-mode', printModeSelection.value)
  }
  // ... 列印邏輯
}

// 修改後
const print = async () => {
  // 列印時根據當前顯示狀態列印（不需要額外設置，因為已經在編輯模式下控制顯示）
  // ... 列印邏輯
}
```

**變更說明：**
- ✅ 移除 `data-print-mode` 屬性設置
- ✅ 列印時直接使用當前顯示狀態

### 2. QuestionBlock.vue - 動態顯示控制

#### Script 部分

```vue
<script setup>
import { ref, onMounted, watch, inject, computed } from 'vue'
// ... 其他 imports

// 注入顯示模式
const printMode = inject('printMode', ref('with-all'))

// 計算是否顯示答案和詳解
const showAnswer = computed(() => {
  const mode = printMode.value
  return mode === 'with-answer' || mode === 'with-all'
})

const showSolution = computed(() => {
  const mode = printMode.value
  return mode === 'with-solution' || mode === 'with-all'
})

// ... 其他邏輯
</script>
```

**變更說明：**
- ✅ 新增 `inject('printMode')` 來接收顯示模式
- ✅ 新增 `showAnswer` 計算屬性：當模式為 `with-answer` 或 `with-all` 時顯示答案
- ✅ 新增 `showSolution` 計算屬性：當模式為 `with-solution` 或 `with-all` 時顯示詳解

#### Template 部分

```vue
<!-- 修改前 -->
<div v-if="question.correct_answer" class="answer-section print-answer">
  <div class="answer-label">答案：</div>
  <div class="answer-content" v-html="renderContent(question.correct_answer)"></div>
</div>

<div v-if="question.solution_content" class="solution-section print-solution">
  <div class="solution-label">詳解：</div>
  <div class="solution-content" v-html="renderContent(question.solution_content)"></div>
</div>

<!-- 修改後 -->
<div v-if="question.correct_answer && showAnswer" class="answer-section">
  <div class="answer-label">答案：</div>
  <div class="answer-content" v-html="renderContent(question.correct_answer)"></div>
</div>

<div v-if="question.solution_content && showSolution" class="solution-section">
  <div class="solution-label">詳解：</div>
  <div class="solution-content" v-html="renderContent(question.solution_content)"></div>
</div>
```

**變更說明：**
- ✅ 答案區域：`v-if="question.correct_answer && showAnswer"`
- ✅ 詳解區域：`v-if="question.solution_content && showSolution"`
- ✅ 移除 `print-answer` 和 `print-solution` class（不再需要）

#### CSS 部分

```css
/* 修改前 */
@media print {
  [data-print-mode="question-only"] .print-answer,
  [data-print-mode="question-only"] .print-solution {
    display: none !important;
  }
  
  [data-print-mode="with-answer"] .print-solution {
    display: none !important;
  }
  
  [data-print-mode="with-solution"] .print-answer,
  [data-print-mode="with-solution"] .print-solution {
    display: block !important;
    background: white;
    border: none;
    padding: 0.5rem 0;
  }
  
  .answer-section,
  .solution-section {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}

/* 修改後 */
@media print {
  .answer-section,
  .solution-section {
    break-inside: avoid;
    page-break-inside: avoid;
    background: white;
    border: none;
    padding: 0.5rem 0;
  }
}
```

**變更說明：**
- ✅ 移除所有 `data-print-mode` 相關的 CSS 規則
- ✅ 保留基本的列印樣式（避免分頁、簡化背景和邊框）

## 📊 顯示模式對照表

| 模式 | 題目敘述 | 答案 | 詳解 |
|------|---------|------|------|
| `question-only` | ✅ | ❌ | ❌ |
| `with-answer` | ✅ | ✅ | ❌ |
| `with-solution` | ✅ | ❌ | ✅ |
| `with-all` | ✅ | ✅ | ✅ |

## 🎯 實現邏輯

### 顯示控制流程

```
ResourceEditor.vue
    ↓
    provide('printMode', printModeSelection)
    ↓
QuestionBlock.vue
    ↓
    inject('printMode')
    ↓
    computed: showAnswer, showSolution
    ↓
    v-if="question.correct_answer && showAnswer"
    v-if="question.solution_content && showSolution"
```

### 列印流程

```
用戶點擊「列印」按鈕
    ↓
print() 函數執行
    ↓
當前顯示狀態（由 printMode 控制）
    ↓
直接列印當前可見內容
    ↓
不需要額外的 CSS 隱藏/顯示
```

## 🧪 測試用例

### 測試 1：純題目模式

1. 選擇「純題目」
2. 預期結果：
   - ✅ 顯示題目敘述
   - ❌ 不顯示答案
   - ❌ 不顯示詳解
3. 列印：只列印題目敘述

### 測試 2：題目+答案模式

1. 選擇「題目+答案」
2. 預期結果：
   - ✅ 顯示題目敘述
   - ✅ 顯示答案
   - ❌ 不顯示詳解
3. 列印：列印題目敘述和答案

### 測試 3：題目+詳解模式

1. 選擇「題目+詳解」
2. 預期結果：
   - ✅ 顯示題目敘述
   - ❌ 不顯示答案
   - ✅ 顯示詳解
3. 列印：列印題目敘述和詳解

### 測試 4：題目+答案+詳解模式

1. 選擇「題目+答案+詳解」
2. 預期結果：
   - ✅ 顯示題目敘述
   - ✅ 顯示答案
   - ✅ 顯示詳解
3. 列印：列印所有內容

### 測試 5：模式切換

1. 插入題目後，預設顯示全部內容
2. 切換到「純題目」→ 答案和詳解立即消失
3. 切換到「題目+答案」→ 答案出現，詳解消失
4. 切換到「題目+詳解」→ 答案消失，詳解出現
5. 切換到「題目+答案+詳解」→ 全部出現

## ✨ 優勢

### 1. 即時反饋

- ✅ 用戶在編輯時就能看到最終效果
- ✅ 不需要等到列印預覽才知道顯示結果
- ✅ 所見即所得（WYSIWYG）

### 2. 簡化列印邏輯

- ✅ 列印時不需要額外的 CSS 規則
- ✅ 不需要設置 `data-print-mode` 屬性
- ✅ 列印結果與編輯畫面完全一致

### 3. 更好的用戶體驗

- ✅ 直觀的模式選擇
- ✅ 即時的視覺反饋
- ✅ 減少列印前的不確定性

### 4. 代碼簡化

- ✅ 移除複雜的 CSS 選擇器
- ✅ 移除 `data-print-mode` 屬性管理
- ✅ 使用 Vue 的響應式系統自動處理顯示

## 🔄 響應式流程

```javascript
// 用戶在下拉選單中選擇模式
printModeSelection.value = 'question-only'
    ↓
// Vue 的響應式系統自動更新
provide('printMode', printModeSelection)
    ↓
// QuestionBlock 接收更新
const printMode = inject('printMode')
    ↓
// 計算屬性自動重新計算
showAnswer.value = false  // 因為 mode !== 'with-answer' && mode !== 'with-all'
showSolution.value = false  // 因為 mode !== 'with-solution' && mode !== 'with-all'
    ↓
// 模板自動重新渲染
v-if="question.correct_answer && showAnswer"  // false，不顯示
v-if="question.solution_content && showSolution"  // false，不顯示
```

## 📦 相關文件

### 修改的文件

1. **frontend/src/views/ResourceEditor.vue**
   - 新增「題目+答案+詳解」選項
   - 簡化列印函數
   - 移除 `data-print-mode` 設置

2. **frontend/src/components/QuestionBlock.vue**
   - 新增 `inject('printMode')`
   - 新增 `showAnswer` 和 `showSolution` 計算屬性
   - 修改模板的 `v-if` 條件
   - 簡化列印 CSS

### 新增的文件

- **DISPLAY_MODE_CONTROL.md** - 本文檔

## 🎉 總結

成功實現了在編輯模式下就能控制題目顯示內容的功能：

- ✅ **4 種顯示模式**：純題目、題目+答案、題目+詳解、題目+答案+詳解
- ✅ **即時反饋**：切換模式時立即更新顯示
- ✅ **所見即所得**：列印結果與編輯畫面一致
- ✅ **簡化邏輯**：移除複雜的 CSS 規則和屬性管理
- ✅ **響應式控制**：使用 Vue 的 provide/inject 和 computed 實現

現在用戶可以在編輯時就選擇想要的顯示模式，並且列印時會根據當前的顯示狀態直接列印，不需要額外的處理！🎉
