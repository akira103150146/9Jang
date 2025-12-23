# 遞迴更新錯誤修正總結

## 修正日期
2024-12-19

## 問題描述
ResourceEditor 組件出現「Maximum recursive updates exceeded」錯誤，導致頁面無法正常使用，並且不斷嘗試保存資源（導致 500 錯誤）。

## 根本原因

### 問題 1: Watcher 監聽了會被修改的狀態
**位置**: `ResourceEditor.vue` 自動保存 watcher

**原始程式碼**:
```javascript
watch(
  [() => resource, structure],  // 監聽整個 resource 對象
  () => {
    if (route.params.id || resource.title !== '未命名文件') {
      debouncedSave()
    }
  },
  { deep: true }
)
```

**問題**:
- 監聽整個 `resource` 對象，包括 `isSaving` 和 `lastSaved`
- `saveResource()` 函數會修改 `isSaving` 和 `lastSaved`
- 修改這些狀態會觸發 watcher → 調用 `debouncedSave()` → 無限循環

### 問題 2: 初始化期間觸發自動保存
**位置**: `ResourceEditor.vue` 的 `fetchInitialData()` 和 `watch(() => resource.mode)`

**觸發路徑**:
1. `fetchInitialData()` 載入資料並設置 `resource.settings`
2. `watch(() => resource.mode, { immediate: true })` 在初始化時執行
3. 修改 `resource.settings`（合併 defaultSettings）
4. 觸發自動保存 watcher
5. 嘗試保存尚未完全初始化的資料
6. 造成遞迴更新和 500 錯誤

### 問題 3: HandoutEditor 的 watcher 造成額外更新
**位置**: `HandoutEditor.vue`

**問題**:
- `watch(() => localSettings.value.handout)` 會在每次變化時 emit 事件
- 即使是初始化時的賦值也會觸發
- 沒有檢查實際是否有變化就 emit

## 修正方案

### 修正 1: 只監聽需要保存的屬性
```javascript
watch(
  [
    () => resource.title,
    () => resource.mode,
    () => resource.course,
    () => resource.student_group_ids,
    () => resource.tag_ids,
    () => resource.settings,
    structure
  ],
  () => {
    // 初始化期間不觸發自動保存
    if (isInitializing.value) return
    
    if (route.params.id || resource.title !== '未命名文件') {
      debouncedSave()
    }
  },
  { deep: true }
)
```

**改進**:
- ✅ 不再監聽 `isSaving` 和 `lastSaved`
- ✅ 添加 `isInitializing` 檢查，初始化期間不觸發保存

### 修正 2: 添加初始化標記
```javascript
const isInitializing = ref(true)

const fetchInitialData = async () => {
  isInitializing.value = true
  try {
    // ... 載入資料 ...
  } finally {
    await nextTick()
    setTimeout(() => {
      isInitializing.value = false
    }, 100)
  }
}
```

**改進**:
- ✅ 在初始化期間設置標記
- ✅ 完成後等待 nextTick 和 100ms 再啟用自動保存
- ✅ 確保所有初始化操作完成後才開始監聽變化

### 修正 3: 防止模式 watcher 在初始化時修改 settings
```javascript
watch(() => resource.mode, () => {
  loadModeEditor()
  if (!props.viewMode && !isInitializing.value) {  // 添加 isInitializing 檢查
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

### 修正 4: 改進 HandoutEditor 的 watcher
```javascript
watch(() => localSettings.value.handout, (newHandout, oldHandout) => {
  // 只在實際變化時才 emit
  if (JSON.stringify(newHandout) !== JSON.stringify(oldHandout)) {
    emit('update:settings', {
      ...props.settings,
      handout: newHandout
    })
  }
}, { deep: true, immediate: false })  // immediate: false 避免初始化時觸發
```

### 修正 5: updateSettings 函數添加保護
```javascript
const updateSettings = (newSettings) => {
  if (isInitializing.value) return  // 初始化期間不處理更新
  resource.settings = { ...resource.settings, ...newSettings }
}
```

## 修正的檔案

1. **frontend/src/views/ResourceEditor.vue**
   - 添加 `isInitializing` 狀態標記
   - 修改自動保存 watcher，只監聽特定屬性
   - 在 watcher 中添加 `isInitializing` 檢查
   - 修改 `fetchInitialData()` 設置初始化標記
   - 修改 `watch(() => resource.mode)` 添加初始化檢查
   - 修改 `updateSettings()` 添加初始化檢查

2. **frontend/src/components/resource-modes/HandoutEditor.vue**
   - 修改 watcher 添加實際變化檢查
   - 設置 `immediate: false` 避免初始化時觸發

## 測試建議

1. 重新整理頁面 http://172.18.69.55:5173/resources/edit/10
2. 確認沒有遞迴更新錯誤
3. 確認沒有 500 錯誤
4. 修改標題、模式、設定等，確認自動保存正常工作
5. 確認手動保存功能正常

## 技術細節

### 遞迴更新的常見原因
1. Watcher 監聽的狀態在 watcher 回調中被修改
2. Computed 屬性的 setter 觸發了 getter 的依賴
3. 組件的 emit 事件觸發父組件更新，父組件又更新子組件 props
4. 初始化期間的多個 watcher 互相觸發

### 防止遞迴更新的最佳實踐
1. **精確監聽**: 只監聽真正需要的屬性，不要監聽整個對象
2. **初始化標記**: 使用標記來區分初始化和用戶操作
3. **變化檢查**: 在更新前檢查是否真的有變化
4. **immediate: false**: 對於不需要立即執行的 watcher，設置為 false
5. **避免在 watcher 中修改被監聽的狀態**: 如果必須修改，使用標記或條件判斷

## 相關錯誤

### SlashCommands 錯誤
錯誤訊息中還出現了：
```
SlashCommands.js:84 Uncaught TypeError: component.ref?.onKeyDown is not a function
```

這是另一個問題，可能需要單獨修正。但這個錯誤是在遞迴更新期間出現的，修正遞迴更新後可能會消失。

## 後續監控

如果問題仍然存在，需要檢查：
1. 後端 500 錯誤的具體原因
2. SlashCommands 的 component.ref 問題
3. 其他可能的響應式循環

## 相關文件
- `AUTO_PAGE_BREAK_FIX.md` - 自動換頁功能修正
- `PAPER_PREVIEW_REMOVAL.md` - 移除紙張預覽
- `GENERATOR_REMOVAL_SUMMARY.md` - 移除生成器模塊
