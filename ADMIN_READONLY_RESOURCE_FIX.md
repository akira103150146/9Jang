# 管理員唯讀查看教學資源功能修復

## 問題描述

管理員可以在課程列表看到「查看文件」按鈕並打開課程文件列表，但點擊「查看」按鈕跳轉到資源詳情頁面時，會出現「無權限查看此頁面」的錯誤。

## 根本原因

1. **前端路由權限限制**：`/resources/view/:id` 路由的 `allowedRoles` 只包含 `['TEACHER', 'STUDENT']`，沒有包含 `ADMIN`
2. **前端路由守衛限制**：`router.beforeEach` 中有特殊檢查，阻止管理員訪問所有 `/resources` 開頭的路徑
3. **前端角色過濾器限制**：`getRoleBasedRouteFilter` 函數將 `/resources` 列為管理員的禁止路徑
4. **後端 API 權限限制**：`LearningResourceViewSet` 的 `get_queryset` 方法會阻止管理員訪問教學資源
5. **前端編輯器未禁用**：ResourceEditor 組件雖然有 `viewMode` prop，但沒有完全禁用編輯功能

## 解決方案

### 1. 前端路由配置修改 (`frontend/src/router/index.js`)

#### 1.1 路由定義
**變更**：將 `ADMIN` 添加到允許的角色列表中

```javascript
{
  path: '/resources/view/:id',
  name: 'resource-view',
  component: ResourceEditor,
  props: route => ({ id: route.params.id, viewMode: true }),
  meta: { title: '查看教學資源', allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'] },
},
```

#### 1.2 路由守衛修改
**變更**：修改管理員訪問老師專用頁面的檢查邏輯

```javascript
// 檢查管理員是否在模擬狀態下訪問老師專用頁面
if (user.role === 'ADMIN' && effectiveRole === 'ADMIN') {
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
}
```

**關鍵變更**：
- 從 `teacherOnlyPaths` 中移除 `/resources`
- 新增 `teacherOnlyResourcePaths` 專門檢查資源的新增和編輯路徑
- 允許管理員訪問 `/resources/view/:id` 路徑

#### 1.3 角色過濾器修改
**變更**：在 `getRoleBasedRouteFilter` 函數中添加特殊處理

```javascript
if (role === 'ADMIN') {
  return (path) => {
    // ... 其他邏輯 ...

    // 特殊處理：允許管理員查看資源（唯讀）
    if (path.startsWith('/resources/view/')) {
      return true
    }

    // 禁止：學生群組、訂便當、學生首頁、題庫、資源編輯、模板
    const excludedPrefixes = ['/student-groups', '/lunch-orders', '/student-home', '/questions', '/resources', '/templates']
    if (excludedPrefixes.some(excluded => path.startsWith(excluded))) {
      return false
    }

    // ... 其他邏輯 ...
  }
}
```

**關鍵變更**：
- 在檢查 `excludedPrefixes` 之前，先檢查是否為 `/resources/view/` 路徑
- 如果是查看路徑，直接返回 `true` 允許訪問

### 2. 後端 API 修改 (`backend/cramschool/api_views.py`)

**變更**：修改 `LearningResourceViewSet.get_queryset()` 方法，允許管理員查看所有資源

```python
def get_queryset(self):
    queryset = super().get_queryset()
    
    user = self.request.user
    
    # 1. 未登入：不顯示
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

**重要**：管理員只能查看（`retrieve`、`list`），不能創建（`create`）、更新（`update`）、刪除（`destroy`）資源。這些操作的權限檢查保持不變。

### 3. 前端編輯器修改 (`frontend/src/views/ResourceEditor.vue`)

**變更**：在 `viewMode` 下完全禁用編輯功能

#### 3.1 禁用輸入框

```vue
<!-- 標題 -->
<input v-model="resource.title" type="text" :disabled="viewMode" 
  class="... disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed">

<!-- 模式選擇 -->
<select v-model="resource.mode" :disabled="viewMode" 
  class="... disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed">

<!-- 課程綁定 -->
<select v-model="resource.course" :disabled="viewMode" 
  class="... disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed">

<!-- 學生群組 -->
<input type="checkbox" :disabled="viewMode" 
  class="... disabled:opacity-50 disabled:cursor-not-allowed">
```

#### 3.2 隱藏編輯功能

```vue
<!-- 隱藏保存按鈕 -->
<button v-if="!viewMode" @click="saveResource(true)">儲存</button>

<!-- 隱藏標籤編輯 -->
<button v-if="!viewMode" @click="removeTag(tagId)">×</button>
<select v-if="!viewMode" @change="addTag($event.target.value)">...</select>

<!-- 隱藏側邊欄編輯功能 -->
<div v-if="!viewMode" class="flex border-b border-slate-100">
  <!-- Tab 切換 -->
</div>
<div v-else class="border-b border-slate-100 py-3 text-center">
  <span class="text-sm font-medium text-slate-600">唯讀模式</span>
</div>
```

## 功能驗證

### 管理員功能

✅ **可以執行的操作**：
- 在課程列表查看「查看文件」按鈕
- 打開課程文件列表彈窗
- 查看課程的所有教學資源
- 點擊「查看」按鈕進入資源詳情頁面
- 以唯讀模式查看資源內容
- 列印/預覽 PDF

❌ **不能執行的操作**：
- 編輯資源標題、模式、課程綁定等設定
- 添加或移除標籤
- 修改學生群組
- 保存資源
- 從題目庫或模板庫拖曳內容（側邊欄被隱藏）

### 老師功能（保持不變）

✅ 可以完整編輯和管理自己課程的教學資源
✅ 所有編輯功能正常運作

### 學生功能（保持不變）

✅ 只能查看分配給自己的教學資源
✅ 以唯讀模式查看

## 測試建議

### 手動測試步驟

1. **測試管理員查看功能**
   ```
   1. 以管理員身份登入
   2. 進入課程列表頁面 (/courses)
   3. 點擊任一課程的「查看文件」按鈕
   4. 驗證彈窗顯示課程的教學資源
   5. 點擊某個資源的「查看」按鈕
   6. 驗證成功進入資源詳情頁面（不再出現權限錯誤）
   7. 驗證所有輸入框都是禁用狀態
   8. 驗證「儲存」按鈕被隱藏
   9. 驗證側邊欄顯示「唯讀模式」而不是編輯選項
   10. 驗證可以正常列印/預覽 PDF
   ```

2. **測試老師功能不受影響**
   ```
   1. 以老師身份登入
   2. 進入課程列表頁面
   3. 點擊自己課程的「查看課程內容」按鈕
   4. 驗證可以查看和編輯資源
   5. 驗證所有編輯功能正常
   ```

3. **測試權限邊界**
   ```
   1. 嘗試以管理員身份直接訪問編輯頁面 (/resources/edit/:id)
   2. 驗證被正確阻止（路由權限控制）
   ```

### API 測試

```bash
# 測試管理員獲取資源列表
curl -X GET \
  "http://localhost:8000/api/cramschool/resources/" \
  -H "Authorization: Bearer {admin_access_token}"

# 測試管理員獲取單個資源
curl -X GET \
  "http://localhost:8000/api/cramschool/resources/{resource_id}/" \
  -H "Authorization: Bearer {admin_access_token}"

# 測試管理員嘗試修改資源（應該失敗）
curl -X PUT \
  "http://localhost:8000/api/cramschool/resources/{resource_id}/" \
  -H "Authorization: Bearer {admin_access_token}" \
  -H "Content-Type: application/json" \
  -d '{"title": "測試修改"}'
```

## 變更文件清單

### 後端
- ✅ `backend/cramschool/api_views.py` - 修改 `LearningResourceViewSet.get_queryset()`

### 前端
- ✅ `frontend/src/router/index.js` - 添加 `ADMIN` 到 `/resources/view/:id` 的 `allowedRoles`
- ✅ `frontend/src/views/ResourceEditor.vue` - 在 `viewMode` 下禁用所有編輯功能

### 文檔
- ✅ `ADMIN_READONLY_RESOURCE_FIX.md` - 本文檔

## 權限總結

| 角色 | 列表查看 | 詳情查看 | 創建 | 編輯 | 刪除 |
|------|---------|---------|------|------|------|
| 管理員 | ✅ 所有資源 | ✅ 唯讀 | ❌ | ❌ | ❌ |
| 老師 | ✅ 自己的課程 | ✅ 完整 | ✅ | ✅ | ✅ |
| 學生 | ✅ 分配的資源 | ✅ 唯讀 | ❌ | ❌ | ❌ |

## 相關文件

- 原功能文檔：`ADMIN_COURSE_RESOURCES_FEATURE.md`
- 功能總結：`ADMIN_VIEW_COURSE_RESOURCES_SUMMARY.md`
- API 文檔：`API_DOCUMENTATION.md`

## 完成時間

2024年12月19日
