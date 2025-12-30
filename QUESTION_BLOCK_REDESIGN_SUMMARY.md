# 題目區塊重新設計總結

## 📋 實作日期
2025-12-29

## 🎯 設計目標

1. **簡潔的編輯體驗**：平時只顯示白色純文字，不被元數據干擾
2. **直覺的操作**：滑鼠懸停時才顯示綠色邊框和操作選單
3. **自動編號**：題號自動按順序計算，不需手動維護
4. **靈活的列印**：支援三種列印模式（純題目/題目+答案/題目+詳解）
5. **專業的排版**：支援大題分組，符合考卷格式

## 🔧 實作內容

### 1. QuestionBlock.vue（題目顯示組件）

**主要變更：**
- ✅ 移除題目元數據顯示（題庫 ID、科目、章節等）
- ✅ 添加題號顯示（從 props 接收）
- ✅ 重新設計答案和詳解區域的樣式
- ✅ 添加列印模式控制（通過 CSS data-print-mode 屬性）

**新增 Props：**
```javascript
{
  questionNumber: Number,  // 題號
  showMetadata: Boolean    // 是否顯示元數據（保留但預設為 false）
}
```

**列印模式控制：**
```css
/* 純題目模式：隱藏答案和詳解 */
[data-print-mode="question-only"] .print-answer,
[data-print-mode="question-only"] .print-solution {
  display: none !important;
}

/* 題目+答案模式：顯示答案，隱藏詳解 */
[data-print-mode="with-answer"] .print-solution {
  display: none !important;
}

/* 題目+詳解模式：顯示答案和詳解 */
[data-print-mode="with-solution"] .print-answer,
[data-print-mode="with-solution"] .print-solution {
  display: block !important;
}
```

### 2. QuestionBlockComponent.vue（編輯器中的題目區塊）

**主要變更：**
- ✅ 移除固定的綠色邊框和背景
- ✅ 添加懸停狀態（isHovered）
- ✅ 操作工具列只在懸停時顯示
- ✅ 添加刪除按鈕
- ✅ 自動計算題號（computed property）

**題號計算邏輯：**
```javascript
// 根據最近的 SectionBlock（大題標題）來編號
const questionNumber = computed(() => {
  try {
    const editor = props.editor
    if (!editor || !props.node.attrs.questionId) return null
    
    const currentPos = props.getPos()
    if (currentPos === undefined || currentPos === null) return null
    
    let count = 0
    let lastSectionPos = -1
    
    // 遍歷文檔，找到當前題目之前最近的 SectionBlock
    editor.state.doc.descendants((node, pos) => {
      // 如果遇到 SectionBlock 且在當前節點之前，記錄其位置
      if (node.type.name === 'sectionBlock' && pos < currentPos) {
        lastSectionPos = pos
        count = 0 // 重置計數
      }
      
      // 如果是題目區塊且有 questionId
      if (node.type.name === 'questionBlock' && node.attrs.questionId) {
        // 只計算在最近的 SectionBlock 之後的題目
        if (pos > lastSectionPos && pos <= currentPos) {
          count++
        }
      }
    })
    
    return count > 0 ? count : null
  } catch (error) {
    console.error('計算題號時出錯:', error)
    return null
  }
})
```

**懸停效果：**
- 平時：白色背景，無邊框
- 懸停時：淡綠色背景，綠色邊框，顯示操作工具列

### 3. SectionBlock（大題標題功能）

**新增文件：**
- `frontend/src/components/BlockEditor/components/SectionBlockComponent.vue`
- `frontend/src/components/BlockEditor/extensions/SectionBlock.js`

**功能特點：**
- ✅ 可編輯的大題標題（例如：第一大題、選擇題）
- ✅ 懸停時顯示刪除按鈕
- ✅ 列印時自動隱藏操作按鈕
- ✅ 支援通過 Slash Command 插入

**使用方式：**
```
/ + "大題" 或 "section"
```

### 4. ResourceEditor.vue（列印模式選擇）

**主要變更：**
- ✅ 添加列印模式下拉選單（純題目卷/題目+答案/題目+詳解）
- ✅ 使用 provide/inject 將列印模式傳遞給子組件
- ✅ 列印前設置 data-print-mode 屬性

**新增代碼：**
```vue
<!-- 列印模式選擇 -->
<select v-model="printModeSelection" class="...">
  <option value="question-only">純題目卷</option>
  <option value="with-answer">題目+答案</option>
  <option value="with-solution">題目+詳解</option>
</select>
```

```javascript
// 列印模式選擇
const printModeSelection = ref('question-only')

// 提供給子組件使用
provide('printMode', printModeSelection)

// 列印前設定
const print = async () => {
  const container = document.querySelector('.block-editor-container')
  if (container) {
    container.setAttribute('data-print-mode', printModeSelection.value)
  }
  // ... 列印邏輯
}
```

### 5. SlashCommands 更新

**新增命令：**
```javascript
{
  title: '大題標題',
  icon: '📋',
  description: '插入大題分組標題',
  command: ({ editor, range }) => {
    editor
      .chain()
      .focus()
      .deleteRange(range)
      .insertSectionBlock()
      .run()
  },
  keywords: ['section', '大題', '標題', '分組', 'group']
}
```

## 📝 使用流程

### 建立考卷結構

1. **插入大題標題**
   - 輸入 `/大題` 或 `/section`
   - 點擊「大題標題」
   - 輸入標題文字（例如：第一大題、選擇題）

2. **插入題目**
   - 輸入 `/題目` 或 `/question`
   - 點擊「瀏覽題庫」選擇題目
   - 題號自動編排（1, 2, 3...）

3. **編輯時操作**
   - 滑鼠懸停在題目上 → 顯示綠色邊框和操作選單
   - 可以更換題目或刪除
   - 題號自動更新

4. **列印輸出**
   - 選擇列印模式：
     - 純題目卷：只顯示題目內容
     - 題目+答案：顯示題目和答案
     - 題目+詳解：顯示題目、答案和詳解
   - 點擊「列印 / 預覽 PDF」
   - 在瀏覽器列印對話框中預覽或儲存

### 考卷範例結構

```
第一大題（選擇題）
├─ 1. 題目內容...
├─ 2. 題目內容...
└─ 3. 題目內容...

第二大題（填充題）
├─ 4. 題目內容...
└─ 5. 題目內容...

第三大題（計算題）
├─ 6. 題目內容...
└─ 7. 題目內容...
```

## 🎨 UI/UX 改進

### 編輯模式

**改進前：**
- 題目區塊始終顯示綠色邊框和背景
- 顯示題庫 ID、科目、章節等元數據
- 操作按鈕始終可見
- 視覺干擾較多

**改進後：**
- 平時只顯示白色背景的純文字
- 不顯示元數據，只顯示題號
- 懸停時才顯示操作選單
- 視覺更簡潔，專注於內容

### 列印模式

**新增功能：**
- ✅ 三種列印模式可選
- ✅ 一鍵切換，無需修改內容
- ✅ 列印時自動隱藏所有編輯工具
- ✅ 專業的排版格式

## 🔄 技術架構

### 數據流

```
ResourceEditor.vue (提供 printMode)
    ↓ provide
BlockEditor.vue
    ↓ provide
QuestionBlockComponent.vue (計算 questionNumber)
    ↓ props
QuestionBlock.vue (顯示題目內容)
    ↓ inject printMode
CSS 控制顯示/隱藏
```

### 題號計算

```
編輯器文檔
    ↓ descendants 遍歷
計算所有 questionBlock 節點
    ↓ 找到當前節點位置
返回題號（count）
    ↓ computed property
自動更新題號顯示
```

## ✨ 優勢

1. **更簡潔的介面**
   - ✅ 移除不必要的視覺元素
   - ✅ 專注於題目內容本身
   - ✅ 懸停操作，不佔用空間

2. **更智能的編號**
   - ✅ 自動計算題號
   - ✅ 插入/刪除題目時自動更新
   - ✅ 不需手動維護

3. **更靈活的列印**
   - ✅ 三種列印模式
   - ✅ 一鍵切換
   - ✅ 適應不同使用場景

4. **更專業的排版**
   - ✅ 支援大題分組
   - ✅ 符合考卷格式
   - ✅ 列印效果專業

## 🧪 測試建議

### 功能測試

1. **題目插入**
   - [ ] 使用 Slash Command 插入題目
   - [ ] 選擇題目後正確顯示
   - [ ] 題號正確顯示

2. **懸停操作**
   - [ ] 滑鼠懸停時顯示綠色邊框
   - [ ] 操作工具列正確顯示
   - [ ] 更換題目功能正常
   - [ ] 刪除題目功能正常

3. **大題標題**
   - [ ] 使用 Slash Command 插入大題標題
   - [ ] 標題可編輯
   - [ ] 懸停時顯示刪除按鈕
   - [ ] 刪除功能正常

4. **題號自動編排**
   - [ ] 插入多個題目，題號正確（1, 2, 3...）
   - [ ] 刪除中間題目，後續題號自動更新
   - [ ] 在中間插入題目，題號正確更新

5. **列印模式**
   - [ ] 純題目卷：只顯示題目
   - [ ] 題目+答案：顯示題目和答案，隱藏詳解
   - [ ] 題目+詳解：顯示題目、答案和詳解
   - [ ] 列印時隱藏所有編輯工具

### 視覺測試

1. **編輯模式**
   - [ ] 平時顯示白色背景，無邊框
   - [ ] 懸停時顯示淡綠色背景和綠色邊框
   - [ ] 操作工具列動畫流暢
   - [ ] 題號顯示位置正確

2. **列印模式**
   - [ ] 列印預覽中格式正確
   - [ ] 大題標題顯示正確
   - [ ] 題號顯示正確
   - [ ] 答案和詳解根據模式正確顯示/隱藏

## 📦 相關文件

### 修改的文件
- `frontend/src/components/QuestionBlock.vue`
- `frontend/src/components/BlockEditor/components/QuestionBlockComponent.vue`
- `frontend/src/components/BlockEditor/BlockEditor.vue`
- `frontend/src/components/BlockEditor/extensions/index.js`
- `frontend/src/components/BlockEditor/utils/commandItems.js`
- `frontend/src/views/ResourceEditor.vue`

### 新增的文件
- `frontend/src/components/BlockEditor/components/SectionBlockComponent.vue`
- `frontend/src/components/BlockEditor/extensions/SectionBlock.js`
- `QUESTION_BLOCK_REDESIGN_SUMMARY.md`

## 🎉 總結

成功實作了題目區塊的重新設計，實現了：
- 📉 **更簡潔的介面**：移除不必要的視覺干擾
- 🎨 **更直覺的操作**：懸停顯示操作選單
- 🔢 **更智能的編號**：自動計算和更新題號
- 🖨️ **更靈活的列印**：三種列印模式可選
- 📋 **更專業的排版**：支援大題分組

這個設計大幅提升了考卷編輯的用戶體驗，讓教師可以更專注於內容本身，而不是被繁瑣的格式和元數據干擾。
