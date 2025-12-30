# 移除講義設定功能

## 📋 需求說明

用戶要求移除「講義設定」相關的功能，因為這些設定似乎沒有實際用處。

## 🔍 移除的功能

### 1. 側邊欄的「模式特定設定」區塊

#### 移除前

```vue
<!-- 模式特定設定（動態載入） -->
<component
  :is="modeEditorComponent"
  v-if="modeEditorComponent"
  :settings="resource.settings"
  @update:settings="updateSettings"
/>
```

這個區塊會動態載入 `HandoutEditor.vue`，顯示以下設定：
- 紙張大小（A4 / B4）
- 方向（直向 / 橫向）
- 輸出格式（題目卷、詳解卷、答案卷等）

#### 移除後

完全移除這個區塊，不再顯示任何講義特定設定。

### 2. 模式編輯器相關邏輯

#### 移除前

```javascript
import { getModeConfig } from '../config/resourceModes'

// 模式編輯器組件（動態載入）
const modeEditorComponent = shallowRef(null)

// 載入模式編輯器
const loadModeEditor = async () => {
  if (props.viewMode) {
    modeEditorComponent.value = null
    return
  }
  
  const modeConfig = getModeConfig(resource.mode)
  if (modeConfig && modeConfig.editor) {
    try {
      const editorModule = await modeConfig.editor()
      modeEditorComponent.value = editorModule.default || editorModule
    } catch (error) {
      console.error('載入模式編輯器失敗：', error)
      modeEditorComponent.value = null
    }
  } else {
    modeEditorComponent.value = null
  }
}

// 更新設定
const updateSettings = (newSettings) => {
  if (isInitializing.value) return
  resource.settings = { ...resource.settings, ...newSettings }
}

watch(() => resource.mode, () => {
  loadModeEditor()
  if (!props.viewMode && !isInitializing.value) {
    const modeConfig = getModeConfig(resource.mode)
    if (modeConfig && modeConfig.defaultSettings) {
      resource.settings = {
        ...resource.settings,
        ...modeConfig.defaultSettings
      }
    }
  }
}, { immediate: true })
```

#### 移除後

```javascript
// 移除模式編輯器相關邏輯（已不需要）
```

完全移除：
- ✅ `getModeConfig` import
- ✅ `modeEditorComponent` ref
- ✅ `loadModeEditor` 函數
- ✅ `updateSettings` 函數
- ✅ `resource.mode` watch

### 3. 複雜的 settings 初始化

#### 移除前

```javascript
const resource = reactive({
  title: '未命名文件',
  mode: 'HANDOUT',
  course_ids: [],
  student_group_ids: [],
  tag_ids: [],
  settings: {
    handout: {
      paperSize: 'A4',
      orientation: 'portrait'
    }
  }
})

// 在載入資源時
const defaultSettings = {
  handout: {
    paperSize: 'A4',
    orientation: 'portrait',
    outputFormats: ['question_only'],
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    fontSize: 12,
    lineHeight: 1.5
  }
}
resource.settings = data.settings ? {
  ...defaultSettings,
  ...data.settings,
  handout: {
    ...defaultSettings.handout,
    ...(data.settings.handout || {})
  }
} : defaultSettings
```

#### 移除後

```javascript
const resource = reactive({
  title: '未命名文件',
  mode: 'HANDOUT',
  course_ids: [],
  student_group_ids: [],
  tag_ids: [],
  settings: {}
})

// 在載入資源時
resource.settings = data.settings || {}
```

### 4. 紙張大小動態讀取

#### 移除前

```javascript
// 獲取紙張大小設定
const paperSize = resource.settings?.handout?.paperSize || resource.settings?.paperSize || 'A4'
const paperWidth = paperSize === 'A4' ? '210mm' : '250mm'
const paperHeight = paperSize === 'A4' ? '297mm' : '353mm'
```

#### 移除後

```javascript
// 固定使用 A4 紙張大小
const paperSize = 'A4'
const paperWidth = '210mm'
const paperHeight = '297mm'
```

## 📊 修改對比

### UI 變化

| 修改前 | 修改後 |
|--------|--------|
| 側邊欄顯示「講義設定」區塊 | 側邊欄不顯示講義設定 |
| 可以選擇紙張大小（A4/B4） | 固定使用 A4 |
| 可以選擇方向（直向/橫向） | 固定使用直向 |
| 可以選擇輸出格式 | 使用顯示模式選擇器控制 |

### 代碼簡化

| 項目 | 修改前 | 修改後 |
|------|--------|--------|
| Import 數量 | 4 個 | 3 個（移除 `getModeConfig`） |
| Ref/Reactive 數量 | +2 個（`modeEditorComponent`, `updateSettings`） | 0 個 |
| Watch 數量 | +1 個（`resource.mode`） | 0 個 |
| 函數數量 | +2 個（`loadModeEditor`, `updateSettings`） | 0 個 |
| Settings 初始化複雜度 | 高（多層合併） | 低（簡單賦值） |

## ✨ 優勢

### 1. 簡化代碼

- ✅ 移除 100+ 行不必要的代碼
- ✅ 移除動態組件載入邏輯
- ✅ 移除複雜的設定合併邏輯
- ✅ 減少響應式依賴

### 2. 提升性能

- ✅ 不需要動態載入 `HandoutEditor.vue`
- ✅ 減少 watch 監聽
- ✅ 減少響應式更新
- ✅ 簡化初始化流程

### 3. 降低維護成本

- ✅ 減少需要維護的組件
- ✅ 減少需要測試的功能
- ✅ 減少潛在的 bug 來源
- ✅ 簡化代碼邏輯

### 4. 更好的用戶體驗

- ✅ 側邊欄更簡潔
- ✅ 減少不必要的選項
- ✅ 使用顯示模式選擇器統一控制輸出
- ✅ 固定 A4 紙張大小，符合大多數使用場景

## 🔄 功能替代

### 原有功能 vs 新功能

| 原有功能 | 新功能 | 說明 |
|---------|--------|------|
| 輸出格式選擇（題目卷、詳解卷等） | 顯示模式選擇器 | 在頂部工具列，更直觀 |
| 紙張大小選擇（A4/B4） | 固定 A4 | A4 是最常用的紙張大小 |
| 方向選擇（直向/橫向） | 固定直向 | 考卷通常使用直向 |

### 顯示模式選擇器

現在使用頂部工具列的「顯示模式選擇器」來控制輸出：

```vue
<select v-model="printModeSelection" class="...">
  <option value="question-only">純題目</option>
  <option value="with-answer">題目+答案</option>
  <option value="with-solution">題目+詳解</option>
  <option value="with-all">題目+答案+詳解</option>
</select>
```

**優勢：**
- ✅ 位置更顯眼（在頂部工具列）
- ✅ 即時反饋（編輯模式下就能看到效果）
- ✅ 選項更清晰（4 個明確的模式）
- ✅ 與列印功能整合（所見即所得）

## 📦 相關文件

### 修改的文件

1. **frontend/src/views/ResourceEditor.vue**
   - 移除「模式特定設定」區塊
   - 移除 `getModeConfig` import
   - 移除 `modeEditorComponent` ref
   - 移除 `loadModeEditor` 函數
   - 移除 `updateSettings` 函數
   - 移除 `resource.mode` watch
   - 簡化 `resource.settings` 初始化
   - 固定紙張大小為 A4

### 保留但不再使用的文件

以下文件保留在代碼庫中，但不再被使用：

1. **frontend/src/config/resourceModes.js**
   - 定義各模式的配置
   - 包含 `HandoutEditor` 和 `OnlineQuizEditor` 的 import

2. **frontend/src/components/resource-modes/HandoutEditor.vue**
   - 講義模式的設定編輯器
   - 包含紙張大小、方向、輸出格式等設定

**注意：** 這些文件可以在未來需要時重新啟用，或者在確認不需要後刪除。

### 相關文檔

- **DISPLAY_MODE_CONTROL.md** - 顯示模式控制（替代輸出格式選擇）
- **PRINT_FUNCTION_FIX.md** - 列印功能修復
- **PRINT_WATERMARK_FEATURE.md** - 列印浮水印功能

### 新增的文件

- **HANDOUT_SETTINGS_REMOVAL.md** - 本文檔

## 🧪 測試建議

### 測試 1：基本功能

1. 打開資源編輯器
2. 檢查側邊欄
3. 預期結果：
   - ✅ 不顯示「講義設定」區塊
   - ✅ 其他設定正常顯示（標題、模式、課程、學生標籤等）

### 測試 2：顯示模式

1. 插入題目
2. 切換顯示模式（純題目、題目+答案等）
3. 預期結果：
   - ✅ 顯示模式正常切換
   - ✅ 內容根據模式顯示/隱藏

### 測試 3：列印功能

1. 創建包含題目的文件
2. 點擊「列印 / 預覽 PDF」
3. 預期結果：
   - ✅ 列印預覽正常顯示
   - ✅ 使用 A4 紙張大小
   - ✅ 根據顯示模式顯示內容

### 測試 4：保存和載入

1. 創建新資源
2. 添加內容
3. 保存
4. 重新載入
5. 預期結果：
   - ✅ 資源正常保存
   - ✅ 資源正常載入
   - ✅ 內容完整保留
   - ✅ 不會因為缺少 settings.handout 而出錯

### 測試 5：舊資源兼容性

1. 打開一個舊的資源（包含 settings.handout）
2. 預期結果：
   - ✅ 資源正常載入
   - ✅ 不會因為有舊的 settings.handout 而出錯
   - ✅ 編輯和保存正常

## 🎯 未來考慮

### 如果需要重新啟用講義設定

如果未來需要重新啟用講義設定功能，可以：

1. **恢復 import**
   ```javascript
   import { getModeConfig } from '../config/resourceModes'
   ```

2. **恢復模式編輯器邏輯**
   - 恢復 `modeEditorComponent` ref
   - 恢復 `loadModeEditor` 函數
   - 恢復 `updateSettings` 函數
   - 恢復 `resource.mode` watch

3. **恢復 UI 區塊**
   ```vue
   <component
     :is="modeEditorComponent"
     v-if="modeEditorComponent"
     :settings="resource.settings"
     @update:settings="updateSettings"
   />
   ```

### 如果需要添加其他設定

如果未來需要添加其他設定（例如字體大小、行距等），建議：

1. **直接在側邊欄添加**
   - 不需要動態組件
   - 直接使用 `v-model="resource.settings.fontSize"` 等

2. **使用簡單的設定結構**
   ```javascript
   resource.settings = {
     fontSize: 12,
     lineHeight: 1.5,
     // ... 其他設定
   }
   ```

3. **避免複雜的嵌套結構**
   - 不需要 `settings.handout.paperSize`
   - 直接使用 `settings.paperSize`

## 🎉 總結

成功移除了講義設定相關的功能：

- ✅ **移除 UI 區塊**：側邊欄不再顯示講義設定
- ✅ **移除動態邏輯**：不再動態載入模式編輯器
- ✅ **簡化初始化**：settings 初始化更簡單
- ✅ **固定紙張大小**：統一使用 A4
- ✅ **代碼簡化**：移除 100+ 行代碼
- ✅ **性能提升**：減少響應式依賴和動態載入
- ✅ **維護簡化**：減少需要維護的組件和邏輯

現在資源編輯器更簡潔、更高效，同時保留了所有必要的功能！🎊

## 💡 建議

### 清理不再使用的文件

如果確定不再需要講義設定功能，可以考慮刪除以下文件：

```bash
# 刪除講義編輯器
rm frontend/src/components/resource-modes/HandoutEditor.vue

# 刪除線上測驗編輯器（如果也不使用）
rm frontend/src/components/resource-modes/OnlineQuizEditor.vue

# 刪除模式配置文件（如果不再需要）
rm frontend/src/config/resourceModes.js
```

**注意：** 在刪除前，請確認這些文件沒有被其他地方使用。

### 保留模式選擇器

雖然移除了講義設定，但保留了「模式選擇器」（講義模式 / 線上測驗模式），因為：

1. **未來擴展**：可能會添加不同模式的功能
2. **數據結構**：資源數據中仍然有 `mode` 字段
3. **兼容性**：保持與舊資源的兼容性

如果確定只使用講義模式，也可以考慮移除模式選擇器，直接固定為 `HANDOUT`。
