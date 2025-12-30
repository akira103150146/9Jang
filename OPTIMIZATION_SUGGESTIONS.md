# ResourceEditor 和 BlockEditor 優化建議

## 🔍 發現的主要問題

### 1. **代碼組織問題**
- **ResourceEditor.vue** (529行): 列印樣式佔了約200行，應該提取到獨立文件
- **Props Drilling**: ResourceEditorSidebar 接收了過多 props (15+)，應該使用 provide/inject
- **事件通信**: 使用 `window` 自定義事件，不夠 Vue 化

### 2. **性能問題**
- **內容同步機制**: BlockEditor 中的序列號機制可以優化
- **不必要的重新渲染**: 某些 computed 可以添加緩存
- **JSON 序列化**: 頻繁的 JSON.stringify 操作

### 3. **可維護性問題**
- **硬編碼值**: 樣式值、配置項散落在代碼中
- **重複邏輯**: 圖片映射、事件處理邏輯在多處重複
- **樣式冗長**: 深層選擇器和重複的樣式規則

## 🎯 優化方案

### 優先級 1: 高影響，低風險

#### 1.1 提取列印樣式到獨立文件
**問題**: ResourceEditor.vue 中 200+ 行的列印樣式
**方案**: 創建 `frontend/src/styles/print.css`
**影響**: 減少主文件大小，提高可維護性

#### 1.2 使用 provide/inject 替代 window 事件
**問題**: 
- `window.addEventListener('imageMappingUpdated')`
- `window.addEventListener('openImageSelector')`
**方案**: 使用 Vue 的 provide/inject 或事件總線
**影響**: 更好的組件解耦，類型安全

#### 1.3 提取編輯器同步邏輯到 composable
**問題**: BlockEditor 中的序列號機制複雜且難以測試
**方案**: 創建 `useEditorSync.js` composable（已存在，但需要增強）
**影響**: 更好的代碼復用和測試

### 優先級 2: 中影響，低風險

#### 2.1 減少 ResourceEditorSidebar 的 props
**問題**: 15+ props 需要傳遞
**方案**: 使用 provide/inject 或 Pinia store
**影響**: 降低組件耦合

#### 2.2 提取常量和配置
**問題**: 硬編碼的樣式值、配置項
**方案**: 創建 `constants/editorConfig.js`
**影響**: 統一管理配置

#### 2.3 優化 JSON 序列化
**問題**: 頻繁的 JSON.stringify 比較
**方案**: 使用淺比較或 hash
**影響**: 提升性能

### 優先級 3: 低影響，可選

#### 3.1 抽取樣式組件
**方案**: 提取重複的樣式為 CSS 類或組件
**影響**: 減少樣式重複

#### 3.2 TypeScript 遷移
**方案**: 逐步遷移到 TypeScript
**影響**: 更好的類型安全和 IDE 支持

## 📝 具體實施建議

### 實施順序
1. ✅ 提取列印樣式（最簡單，風險最低）
2. ✅ 優化事件通信機制
3. ✅ 提取編輯器同步邏輯
4. ⏳ 減少 props drilling
5. ⏳ 提取常量配置
