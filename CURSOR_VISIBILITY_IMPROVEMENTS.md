# 游標可見性改進

## 問題描述
用戶在使用 BlockEditor 時經常遇到游標消失的問題,不知道游標現在在哪個物件/區塊中。

## 解決方案

### 1. 區塊選中視覺反饋

為所有自定義區塊添加了選中和聚焦時的視覺提示:

#### 通用樣式 (BlockEditor.vue)
```css
/* 選中區塊的視覺反饋 */
:deep(.ProseMirror > [data-type].ProseMirror-selectednode),
:deep(.ProseMirror > [data-type].has-focus) {
  background: rgb(238, 242, 255) !important;
  box-shadow: 0 0 0 2px rgb(99, 102, 241);
  border-radius: 4px;
}

/* 游標所在區塊的邊框提示 */
:deep(.ProseMirror-focused > [data-type]:has(.ProseMirror-focused)) {
  outline: 2px solid rgb(99, 102, 241);
  outline-offset: 2px;
  border-radius: 4px;
}
```

#### 題目區塊 (QuestionBlockComponent.vue)
- **正常狀態**: 綠色邊框 `rgb(34, 197, 94)` + 淺綠背景 `rgb(240, 253, 244)`
- **選中/聚焦**: 深綠邊框 `rgb(22, 163, 74)` + 更淺綠背景 `rgb(220, 252, 231)` + 陰影效果

#### 模板區塊 (TemplateBlockComponent.vue)
- **正常狀態**: 紫色邊框 `rgb(147, 51, 234)` + 淺紫背景 `rgb(250, 245, 255)`
- **選中/聚焦**: 深紫邊框 `rgb(126, 34, 206)` + 更淺紫背景 `rgb(243, 232, 255)` + 陰影效果

#### LaTeX 區塊 (LaTeXBlockComponent.vue)
- **正常狀態**: 透明邊框 + 灰色背景 `rgb(249, 250, 251)`
- **選中/聚焦** (非編輯模式): 藍色邊框 `rgb(59, 130, 246)` + 淺藍背景 `rgb(239, 246, 255)` + 陰影效果
- **編輯模式**: 保持原有的 indigo 邊框樣式

### 2. 游標位置指示器

在編輯器頂部添加了一個浮動指示器,實時顯示當前游標所在的區塊類型:

#### 功能特點
- **實時更新**: 使用 Tiptap 的 `onSelectionUpdate` 事件追蹤游標位置
- **視覺設計**: 漸層紫藍色背景,白色文字,圓角設計
- **動畫效果**: 淡入動畫 (fadeIn),從上方滑入
- **固定位置**: `position: sticky`,始終保持在視窗頂部可見
- **區塊類型圖標**: 每種區塊類型都有對應的 emoji 圖標

#### 支援的區塊類型

| 區塊類型 | 圖標 | 標籤 |
|---------|------|------|
| questionBlock | ❓ | 題目區塊 |
| templateBlock | 📄 | 模板區塊 |
| latexBlock | 𝑓 | LaTeX 區塊 |
| diagram2DBlock | 📊 | 2D 圖表 |
| diagram3DBlock | 🎲 | 3D 圖表 |
| circuitBlock | ⚡ | 電路圖 |
| pageBreak | 📄 | 換頁符 |
| heading | 📝 | 標題 |
| paragraph | ¶ | 段落 |
| bulletList | • | 無序列表 |
| orderedList | 1. | 有序列表 |
| codeBlock | </> | 程式碼 |
| blockquote | " | 引用 |

#### 實現代碼

```javascript
// 追蹤當前游標所在的節點類型
const currentNodeType = ref(null)

// 在編輯器配置中添加
onSelectionUpdate: ({ editor }) => {
  const { $from } = editor.state.selection
  const node = $from.parent
  currentNodeType.value = node ? node.type.name : null
}

// 取得節點圖標和標籤的輔助函數
const getNodeIcon = (nodeType) => { /* ... */ }
const getNodeLabel = (nodeType) => { /* ... */ }
```

### 3. 改進的 Hover 效果

所有區塊在 hover 時都有平滑的過渡效果:

```css
:deep(.ProseMirror > [data-type]) {
  position: relative;
  padding-left: 0;
  transition: background 0.2s, box-shadow 0.2s, border-color 0.2s;
  border-radius: 4px;
}

:deep(.ProseMirror > [data-type]:hover) {
  background: rgb(249, 250, 251);
}
```

## 使用效果

### 視覺層次
1. **第一層 - Hover**: 淡灰色背景,表示滑鼠經過
2. **第二層 - 選中**: 特定顏色的邊框 + 陰影 + 背景色加深
3. **第三層 - 編輯**: 更強烈的邊框和背景對比(如 LaTeX 編輯模式)

### 游標追蹤
- 頂部指示器隨時顯示當前編輯的區塊類型
- 即使在複雜的嵌套結構中,也能清楚知道游標位置
- 在不同區塊間移動時,指示器會平滑更新

## 修改的檔案

1. **frontend/src/components/BlockEditor/BlockEditor.vue**
   - 添加游標位置指示器 UI
   - 添加 `onSelectionUpdate` 事件處理
   - 添加選中區塊的通用樣式
   - 添加 `getNodeIcon` 和 `getNodeLabel` 函數

2. **frontend/src/components/BlockEditor/components/QuestionBlockComponent.vue**
   - 添加選中/聚焦狀態的樣式

3. **frontend/src/components/BlockEditor/components/TemplateBlockComponent.vue**
   - 添加選中/聚焦狀態的樣式

4. **frontend/src/components/BlockEditor/components/LaTeXBlockComponent.vue**
   - 添加選中/聚焦狀態的樣式(避免影響編輯模式)

## 未來改進

1. **可配置性**: 允許用戶自定義指示器的位置和樣式
2. **更多信息**: 在指示器中顯示嵌套層級、字數統計等
3. **鍵盤快捷鍵**: 添加快速跳轉到特定區塊的快捷鍵
4. **小地圖**: 顯示整個文檔的縮略圖,標記當前位置
5. **面包屑導航**: 顯示當前節點的完整路徑(對於深層嵌套特別有用)

## 測試建議

1. 在不同類型的區塊之間移動游標,觀察指示器是否正確更新
2. 測試嵌套區塊中的游標追蹤
3. 驗證選中區塊時的視覺反饋是否明顯
4. 測試 LaTeX 區塊的編輯模式,確保樣式不衝突
5. 檢查在小螢幕上指示器是否正常顯示

## 相關 Issue

- 游標消失問題
- 用戶體驗改進
- 視覺反饋增強

---

**實作日期**: 2025-12-18
**版本**: v1.0
