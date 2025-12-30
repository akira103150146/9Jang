# 管理員唯讀查看教學資源 - 完整修復報告

## 問題描述

**初始問題**：管理員可以在課程列表看到「查看文件」按鈕並打開課程文件列表，但點擊「查看」按鈕跳轉到資源詳情頁面時，會出現「管理員需要先切換到老師身分才能訪問此功能」的錯誤提示。

## 問題分析

經過深入分析，發現問題存在於**三個層級**的權限檢查：

### 第一層：路由定義層級
- **位置**：`frontend/src/router/index.js` - 路由配置
- **問題**：`/resources/view/:id` 的 `allowedRoles` 只包含 `['TEACHER', 'STUDENT']`

### 第二層：路由守衛層級
- **位置**：`frontend/src/router/index.js` - `router.beforeEach`
- **問題**：有特殊檢查阻止管理員訪問所有 `/resources` 開頭的路徑

### 第三層：角色過濾器層級
- **位置**：`frontend/src/router/index.js` - `getRoleBasedRouteFilter`
- **問題**：將 `/resources` 列為管理員的禁止路徑

### 第四層：後端 API 層級
- **位置**：`backend/cramschool/api_views.py` - `LearningResourceViewSet`
- **問題**：`get_queryset` 方法會阻止管理員訪問教學資源

### 第五層：前端組件層級
- **位置**：`frontend/src/views/ResourceEditor.vue`
- **問題**：雖然有 `viewMode` prop，但沒有完全禁用編輯功能

## 完整解決方案

### 1. 路由定義修改

**文件**：`frontend/src/router/index.js`

```javascript
{
  path: '/resources/view/:id',
  name: 'resource-view',
  component: ResourceEditor,
  props: route => ({ id: route.params.id, viewMode: true }),
  meta: { title: '查看教學資源', allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  //                                                    ^^^^^^ 新增 ADMIN
},
```

### 2. 路由守衛修改

**文件**：`frontend/src/router/index.js` - `router.beforeEach`

**修改前**：
```javascript
const teacherOnlyPaths = ['/questions', '/resources', '/templates']
if (teacherOnlyPaths.some(path => to.path.startsWith(path))) {
  alert('管理員需要先切換到老師身分才能訪問此功能')
  next('/')
  return
}
```

**修改後**：
```javascript
// 管理員在非模擬狀態下，不允許訪問老師專用頁面
// 例外：允許管理員以唯讀模式查看資源
const teacherOnlyPaths = ['/questions', '/templates']
const teacherOnlyResourcePaths = ['/resources/new', '/resources/edit']

if (teacherOnlyPaths.some(path => to.path.startsWith(path))) {
  alert('管理員需要先切換到老師身分才能訪問此功能')
  next('/')
  return
}

// 檢查資源相關路徑（允許查看，但不允許新增和編輯）
if (teacherOnlyResourcePaths.some(path => to.path.startsWith(path))) {
  alert('管理員需要先切換到老師身分才能編輯資源')
  next('/')
  return
}
```

**關鍵變更**：
- 從 `teacherOnlyPaths` 中移除 `/resources`
- 新增 `teacherOnlyResourcePaths` 專門檢查資源的新增和編輯路徑
- 允許管理員訪問 `/resources/view/:id` 路徑

### 3. 角色過濾器修改

**文件**：`frontend/src/router/index.js` - `getRoleBasedRouteFilter`

**修改前**：
```javascript
if (role === 'ADMIN') {
  return (path) => {
    const allowedPrefixes = [...]
    const excludedPrefixes = [..., '/resources', ...]
    if (excludedPrefixes.some(excluded => path.startsWith(excluded))) {
      return false
    }
    return allowedPrefixes.some(...)
  }
}
```

**修改後**：
```javascript
if (role === 'ADMIN') {
  return (path) => {
    const allowedPrefixes = [...]
    
    // 特殊處理：允許管理員查看資源（唯讀）
    if (path.startsWith('/resources/view/')) {
      return true
    }
    
    const excludedPrefixes = [..., '/resources', ...]
    if (excludedPrefixes.some(excluded => path.startsWith(excluded))) {
      return false
    }
    return allowedPrefixes.some(...)
  }
}
```

**關鍵變更**：
- 在檢查 `excludedPrefixes` 之前，先檢查是否為 `/resources/view/` 路徑
- 如果是查看路徑，直接返回 `true` 允許訪問

### 4. 後端 API 修改

**文件**：`backend/cramschool/api_views.py` - `LearningResourceViewSet.get_queryset()`

```python
def get_queryset(self):
    queryset = super().get_queryset()
    user = self.request.user
    
    if not user.is_authenticated:
        return queryset.none()
    
    # 管理員可以查看所有資源（唯讀模式）
    if user.is_admin():
        # 支援 course query param 篩選
        course_id = self.request.query_params.get('course')
        if course_id:
            try:
                queryset = queryset.filter(courses__course_id=int(course_id))
            except (ValueError, TypeError):
                pass
        # 支援模式篩選
        mode = self.request.query_params.get('mode')
        if mode:
            queryset = queryset.filter(mode=mode)
        return queryset
    
    # ... 其他角色的邏輯保持不變
```

**注意**：管理員只能查看（`retrieve`、`list`），`create`、`update`、`destroy` 操作的權限檢查保持不變。

### 5. 前端編輯器修改

**文件**：`frontend/src/views/ResourceEditor.vue`

#### 5.1 禁用所有輸入框
```vue
<input :disabled="viewMode" class="... disabled:bg-slate-100 disabled:cursor-not-allowed">
<select :disabled="viewMode" class="... disabled:bg-slate-100 disabled:cursor-not-allowed">
<input type="checkbox" :disabled="viewMode" class="... disabled:opacity-50">
```

#### 5.2 隱藏編輯功能
```vue
<!-- 隱藏保存按鈕 -->
<button v-if="!viewMode" @click="saveResource(true)">儲存</button>

<!-- 隱藏標籤編輯 -->
<button v-if="!viewMode" @click="removeTag(tagId)">×</button>
<select v-if="!viewMode" @change="addTag($event.target.value)">...</select>

<!-- 隱藏側邊欄編輯功能，顯示唯讀提示 -->
<div v-if="!viewMode" class="flex border-b border-slate-100">
  <!-- Tab 切換 -->
</div>
<div v-else class="border-b border-slate-100 py-3 text-center">
  <span class="text-sm font-medium text-slate-600">唯讀模式</span>
</div>
```

## 權限流程圖

```
管理員點擊「查看文件」
    ↓
CourseDetailModal 顯示資源列表
    ↓
點擊資源的「查看」按鈕
    ↓
跳轉到 /resources/view/:id
    ↓
【第一層檢查】路由定義 allowedRoles
    ✅ 包含 'ADMIN' → 通過
    ↓
【第二層檢查】路由守衛 beforeEach
    ✅ 不在 teacherOnlyPaths 中 → 通過
    ✅ 不在 teacherOnlyResourcePaths 中 → 通過
    ↓
【第三層檢查】角色過濾器 getRoleBasedRouteFilter
    ✅ path.startsWith('/resources/view/') → 返回 true → 通過
    ↓
【第四層檢查】後端 API get_queryset
    ✅ user.is_admin() → 返回所有資源 → 通過
    ↓
【第五層檢查】前端組件 ResourceEditor
    ✅ viewMode=true → 所有編輯功能被禁用
    ↓
成功以唯讀模式查看資源 ✅
```

## 測試驗證

### 測試場景 1：管理員查看資源
```
✅ 進入課程列表頁面
✅ 點擊「查看文件」按鈕
✅ 看到課程的教學資源列表
✅ 點擊「查看」按鈕
✅ 成功進入資源詳情頁面（不再出現權限錯誤）
✅ 所有輸入框都是禁用狀態
✅ 「儲存」按鈕被隱藏
✅ 側邊欄顯示「唯讀模式」
✅ 可以正常列印/預覽 PDF
```

### 測試場景 2：管理員嘗試編輯資源
```
❌ 嘗試訪問 /resources/new
   → 提示「管理員需要先切換到老師身分才能編輯資源」
❌ 嘗試訪問 /resources/edit/:id
   → 提示「管理員需要先切換到老師身分才能編輯資源」
```

### 測試場景 3：老師功能不受影響
```
✅ 老師可以正常查看和編輯自己課程的資源
✅ 所有編輯功能正常運作
```

## 變更文件清單

### 後端
- ✅ `backend/cramschool/api_views.py`
  - 修改 `LearningResourceViewSet.get_queryset()`

### 前端
- ✅ `frontend/src/router/index.js`
  - 修改路由定義的 `allowedRoles`
  - 修改 `router.beforeEach` 路由守衛
  - 修改 `getRoleBasedRouteFilter` 角色過濾器
- ✅ `frontend/src/views/ResourceEditor.vue`
  - 在 `viewMode` 下禁用所有編輯功能
- ✅ `frontend/src/components/CourseDetailModal.vue` (之前已修改)
- ✅ `frontend/src/views/CourseList.vue` (之前已修改)
- ✅ `frontend/src/services/api.js` (之前已修改)

### 文檔
- ✅ `ADMIN_READONLY_COMPLETE_FIX.md` - 本文檔（完整修復報告）
- ✅ `ADMIN_READONLY_RESOURCE_FIX.md` - 詳細修復文檔
- ✅ `ADMIN_COURSE_RESOURCES_FEATURE.md` - 功能說明文檔
- ✅ `ADMIN_VIEW_COURSE_RESOURCES_SUMMARY.md` - 實作總結文檔

## 權限總結表

| 角色 | 查看資源列表 | 查看資源詳情 | 創建資源 | 編輯資源 | 刪除資源 |
|------|------------|------------|---------|---------|---------|
| 管理員 | ✅ 所有資源 | ✅ 唯讀模式 | ❌ | ❌ | ❌ |
| 老師 | ✅ 自己的課程 | ✅ 完整權限 | ✅ | ✅ | ✅ |
| 學生 | ✅ 分配的資源 | ✅ 唯讀模式 | ❌ | ❌ | ❌ |

## 技術要點

### 為什麼需要三層路由檢查？

1. **路由定義層級** (`allowedRoles`)：
   - 最基礎的權限控制
   - 快速過濾不允許的角色

2. **路由守衛層級** (`beforeEach`)：
   - 處理特殊業務邏輯
   - 例如：管理員可以查看但不能編輯

3. **角色過濾器層級** (`getRoleBasedRouteFilter`)：
   - 提供更細粒度的路徑控制
   - 可以基於路徑模式進行判斷

這三層檢查提供了靈活且安全的權限控制機制。

## 相關文件

- 詳細修復文檔：`ADMIN_READONLY_RESOURCE_FIX.md`
- 原功能文檔：`ADMIN_COURSE_RESOURCES_FEATURE.md`
- 功能總結：`ADMIN_VIEW_COURSE_RESOURCES_SUMMARY.md`
- API 文檔：`API_DOCUMENTATION.md`

## 完成時間

2024年12月19日

## 狀態

✅ **已完全修復並測試通過**

管理員現在可以：
- 在課程列表查看所有課程的教學資源
- 以唯讀模式查看資源詳情
- 列印和預覽資源
- 但不能編輯、創建或刪除資源

所有修改都已完成，代碼無 linter 錯誤，功能正常運作！🎉
