# StudentList.vue 重構計劃

## 📊 現狀分析

- **文件大小**: 2481 行
- **模態框數量**: 6 個
- **狀態管理**: 30+ 個 ref
- **函數數量**: 119 個函數/常量定義
- **職責**: 學生列表、篩選、標籤管理、課程報名、請假管理、學費生成、帳號管理等

## 🎯 重構目標

1. **減少主文件大小**: 目標 800-1000 行（減少 60%+）
2. **提高可維護性**: 將功能拆分為獨立的 composables 和組件
3. **提高可測試性**: 每個 composable 和組件都可以獨立測試
4. **使用 TypeScript**: 所有新文件使用 TypeScript

## 📋 重構階段

### ✅ 階段 0: 基礎設施準備（已完成）

- [x] 創建 `utils/studentFormatters.ts` - 格式化工具函數
- [x] 創建 `utils/studentUtils.ts` - 學生數據標準化工具
- [x] 創建 `constants/studentConstants.ts` - 常量定義
- [x] 創建 `composables/useStudentList.ts` - 學生列表核心邏輯
- [x] 創建 `composables/useStudentFilters.ts` - 篩選邏輯

### 階段 1: 創建剩餘 Composables

#### 1.1 useStudentEnrollment.ts
**功能**: 課程報名管理
**包含**:
- `openEnrollmentModal` - 打開報名模態框
- `saveEnrollment` - 保存報名
- `deleteEnrollment` - 刪除報名
- `restoreEnrollment` - 恢復報名
- `openPeriodModal` - 打開期間管理模態框
- `savePeriods` - 保存上課期間
- 相關狀態管理（showEnrollmentModal, enrollmentForm, studentEnrollments 等）

**依賴**:
- `enrollmentAPI`, `enrollmentPeriodAPI`
- `studentAPI` (用於更新學生數據)
- `normalizeStudent` 工具函數

#### 1.2 useStudentTuition.ts
**功能**: 學費生成管理
**包含**:
- `openTuitionModal` - 打開學費生成模態框
- `generateAllTuitions` - 生成選中的學費
- `handleBatchGenerateTuitions` - 批次生成所有學生的學費
- 相關狀態管理（showTuitionModal, tuitionStatus, loadingTuition 等）

**依賴**:
- `studentAPI`
- `formatAmount` 工具函數

#### 1.3 useStudentTags.ts
**功能**: 標籤管理
**包含**:
- `fetchTags` - 獲取標籤列表
- `openTagManager` - 打開標籤管理模態框
- `createTag` - 創建標籤
- `updateTag` - 更新標籤
- `deleteTag` - 刪除標籤
- `addTagToStudent` - 為學生添加標籤
- `removeStudentFromTag` - 從學生移除標籤
- 相關狀態管理（showTagManager, tagForm, availableTags 等）

**依賴**:
- `studentGroupAPI`
- `studentAPI` (用於更新學生數據)
- `normalizeStudent` 工具函數

#### 1.4 useStudentLeave.ts
**功能**: 請假管理
**包含**:
- `openLeaveModal` - 打開請假模態框
- `submitLeave` - 提交請假記錄
- `deleteLeave` - 刪除請假記錄
- `restoreLeave` - 恢復請假記錄
- `getLeaveStatusColor` - 獲取請假狀態顏色
- `getLeaveStatusDisplay` - 獲取請假狀態顯示文字
- 相關狀態管理（showLeaveModal, leaveForm, leaveData 等）

**依賴**:
- `leaveAPI`
- `formatDate` 工具函數
- `LEAVE_STATUS_MAP`, `LEAVE_STATUS_COLORS` 常量

#### 1.5 useStudentAccount.ts
**功能**: 帳號和密碼管理
**包含**:
- `togglePasswordVisibility` - 切換密碼顯示/隱藏
- `startEditPassword` - 開始編輯密碼
- `cancelEditPassword` - 取消編輯密碼
- `savePassword` - 保存密碼
- `toggleAccountStatus` - 切換帳號狀態
- 相關狀態管理（visiblePasswords, editingPasswords, passwordForms 等）

**依賴**:
- `studentAPI`

#### 1.6 useStudentUser.ts
**功能**: 用戶角色檢查
**包含**:
- `fetchCurrentUser` - 獲取當前用戶
- `isAdmin` - 是否為管理員
- `isTeacher` - 是否為老師
- `isAccountant` - 是否為會計
- `canSeeAccountingFeatures` - 是否可以看到會計功能

**依賴**:
- localStorage (用戶信息)

### 階段 2: 拆分模態框組件

#### 2.1 StudentTagManagerModal.vue
**功能**: 標籤管理模態框
**Props**:
- `isOpen: boolean`
- `availableTags: Array<Tag>`
- `editingTag: Tag | null`
- `isCreatingTag: boolean`

**Emits**:
- `close`
- `create: (tag: CreateTagDto) => void`
- `update: (tagId: number, tag: UpdateTagDto) => void`
- `delete: (tagId: number) => void`
- `edit: (tag: Tag) => void`
- `cancel`

**功能**:
- 顯示標籤列表
- 創建新標籤
- 編輯現有標籤
- 刪除標籤

#### 2.2 StudentAddTagModal.vue
**功能**: 為學生添加標籤模態框
**Props**:
- `isOpen: boolean`
- `student: NormalizedStudent`
- `availableTags: Array<Tag>`
- `isAdding: boolean`

**Emits**:
- `close`
- `add: (tagId: number) => void`

**功能**:
- 顯示可用的標籤列表
- 顯示已添加的標籤
- 添加標籤到學生

#### 2.3 StudentEnrollmentModal.vue
**功能**: 課程報名管理模態框
**Props**:
- `isOpen: boolean`
- `student: NormalizedStudent`
- `courses: Array<Course>`
- `enrollments: Array<Enrollment>`
- `loading: boolean`
- `saving: boolean`

**Emits**:
- `close`
- `save: (enrollment: CreateEnrollmentDto) => void`
- `delete: (enrollmentId: number) => void`
- `restore: (enrollmentId: number) => void`
- `managePeriods: (enrollment: Enrollment) => void`

**功能**:
- 顯示已報名課程列表
- 新增課程報名
- 刪除/恢復報名記錄
- 管理上課期間

#### 2.4 StudentPeriodModal.vue
**功能**: 上課期間管理模態框
**Props**:
- `isOpen: boolean`
- `enrollment: Enrollment`
- `periods: Array<Period>`
- `loading: boolean`
- `saving: boolean`

**Emits**:
- `close`
- `save: (periods: Array<Period>) => void`

**功能**:
- 顯示和編輯上課期間
- 添加/刪除期間
- 設置期間狀態

#### 2.5 StudentTuitionModal.vue
**功能**: 學費生成模態框
**Props**:
- `isOpen: boolean`
- `student: NormalizedStudent`
- `tuitionStatus: Array<TuitionStatusItem>`
- `loading: boolean`
- `saving: boolean`

**Emits**:
- `close`
- `generate: (items: Array<TuitionStatusItem>) => void`

**功能**:
- 顯示需要生成的學費列表
- 選擇要生成的項目
- 設置週數
- 生成學費

#### 2.6 StudentLeaveModal.vue
**功能**: 請假記錄模態框
**Props**:
- `isOpen: boolean`
- `student: NormalizedStudent`
- `courses: Array<Course>`
- `leaves: Array<Leave>`
- `loading: boolean`
- `saving: boolean`

**Emits**:
- `close`
- `submit: (leave: CreateLeaveDto) => void`
- `delete: (leaveId: number) => void`
- `restore: (leaveId: number) => void`

**功能**:
- 顯示請假記錄列表
- 新增請假記錄
- 刪除/恢復請假記錄

### 階段 3: 重構主文件 StudentList.vue

#### 3.1 導入新的 Composables 和組件
- 移除舊的函數定義
- 導入新的 composables
- 導入新的模態框組件

#### 3.2 替換狀態管理
- 使用 `useStudentList()` 替換學生列表相關狀態
- 使用 `useStudentFilters()` 替換篩選相關狀態
- 使用其他 composables 替換各自的功能狀態

#### 3.3 替換函數調用
- 將舊的函數調用替換為 composable 返回的函數
- 更新事件處理函數

#### 3.4 替換模板中的模態框
- 將內聯的模態框 HTML 替換為組件
- 更新 props 和 events

#### 3.5 添加 TypeScript 類型
- 為所有變量添加類型註解
- 為 props 和 emits 添加類型
- 確保類型安全

#### 3.6 測試和修復
- 測試所有功能是否正常
- 修復類型錯誤
- 修復邏輯錯誤

## 📁 文件結構

```
frontend/src/
├── views/
│   └── StudentList.vue (重構後，~800-1000 行)
├── components/
│   ├── StudentTagManagerModal.vue
│   ├── StudentAddTagModal.vue
│   ├── StudentEnrollmentModal.vue
│   ├── StudentPeriodModal.vue
│   ├── StudentTuitionModal.vue
│   └── StudentLeaveModal.vue
├── composables/
│   ├── useStudentList.ts (✅ 已完成)
│   ├── useStudentFilters.ts (✅ 已完成)
│   ├── useStudentEnrollment.ts (待創建)
│   ├── useStudentTuition.ts (待創建)
│   ├── useStudentTags.ts (待創建)
│   ├── useStudentLeave.ts (待創建)
│   ├── useStudentAccount.ts (待創建)
│   └── useStudentUser.ts (待創建)
├── utils/
│   ├── studentFormatters.ts (✅ 已完成)
│   └── studentUtils.ts (✅ 已完成)
└── constants/
    └── studentConstants.ts (✅ 已完成)
```

## 🎯 預期成果

### 代碼量減少
- **主文件**: 2481 行 → ~800-1000 行 (減少 60%+)
- **新增文件**: ~2000 行（分布在 composables 和組件中）
- **總代碼量**: 基本持平，但結構更清晰

### 可維護性提升
- ✅ 單一職責原則：每個 composable 和組件只負責一個功能領域
- ✅ 代碼復用：composables 可以在其他組件中復用
- ✅ 易於測試：每個模塊都可以獨立測試
- ✅ 類型安全：TypeScript 提供類型檢查

### 開發效率提升
- ✅ 更快的定位問題：功能按文件組織
- ✅ 更容易添加新功能：只需創建新的 composable 或組件
- ✅ 更好的代碼審查：小文件更容易審查

## ⚠️ 注意事項

1. **向後兼容**: 確保重構後的代碼行為與原代碼一致
2. **逐步遷移**: 可以分階段進行，每個階段完成後測試
3. **類型定義**: 確保所有類型定義正確，避免運行時錯誤
4. **狀態同步**: 確保 composables 之間的狀態同步正確
5. **事件處理**: 確保模態框組件的事件正確傳遞

## 📝 執行順序

1. ✅ 階段 0: 基礎設施準備（已完成）
2. ⏳ 階段 1: 創建剩餘 Composables
3. ⏳ 階段 2: 拆分模態框組件
4. ⏳ 階段 3: 重構主文件

每個階段完成後都應該進行測試，確保功能正常。

