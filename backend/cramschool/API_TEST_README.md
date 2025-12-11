# API 測試說明文檔

## 概述

`test_api.py` 文件包含了所有 API 端點的完整 CRUD 測試，以及關聯 API 的商業邏輯測試。

## 測試覆蓋範圍

### 已實現的測試類

1. **StudentAPITestCase** - 學生 API 測試
   - ✅ 創建學生（自動創建用戶帳號）
   - ✅ 列出學生（支援過濾已刪除）
   - ✅ 獲取單個學生
   - ✅ 更新學生
   - ✅ 軟刪除學生
   - ✅ 恢復學生
   - ✅ 重置密碼（權限檢查）
   - ✅ 啟用/停用帳號（權限檢查）
   - ✅ 獲取學費狀態
   - ✅ 生成學費
   - ✅ 獲取出缺勤和請假記錄

2. **TeacherAPITestCase** - 老師 API 測試
   - ✅ CRUD 操作

3. **CourseAPITestCase** - 課程 API 測試
   - ✅ CRUD 操作
   - ✅ 學生只能看到自己報名的課程
   - ✅ 管理員可以看到所有課程

4. **StudentEnrollmentAPITestCase** - 報名 API 測試
   - ✅ 創建報名（自動創建初始上課期間）
   - ✅ 軟刪除和恢復

5. **ExtraFeeAPITestCase** - 費用 API 測試
   - ✅ CRUD 操作
   - ✅ 按學生篩選
   - ✅ 無法刪除費用記錄
   - ✅ 恢復費用記錄

6. **SessionRecordAPITestCase** - 上課記錄 API 測試
   - ✅ CRUD 操作
   - ✅ 唯一性約束測試

7. **AttendanceAPITestCase** - 出席記錄 API 測試
   - ✅ CRUD 操作
   - ✅ 軟刪除和恢復

8. **LeaveAPITestCase** - 請假記錄 API 測試
   - ✅ CRUD 操作
   - ✅ 軟刪除和恢復

9. **SubjectAPITestCase** - 科目 API 測試
   - ✅ CRUD 操作
   - ✅ 唯一性約束測試

10. **QuestionBankAPITestCase** - 題目庫 API 測試
    - ✅ CRUD 操作
    - ✅ 多條件篩選（科目、年級、章節、難度、標籤）
    - ✅ 章節搜尋功能

11. **GroupOrderAPITestCase** - 團購 API 測試（商業邏輯）
    - ✅ 創建團購（自動生成唯一連結）
    - ✅ 完成團購時自動生成費用
    - ✅ 權限檢查（只有管理員或會計可以完成）

12. **OrderAPITestCase** - 訂單 API 測試（商業邏輯）
    - ✅ CRUD 操作
    - ✅ 訂單總金額自動計算
    - ✅ 無法刪除已完成團購的訂單

13. **OrderItemAPITestCase** - 訂單項目 API 測試（商業邏輯）
    - ✅ 創建項目時自動計算小計
    - ✅ 更新項目時更新訂單總金額
    - ✅ 刪除項目時更新訂單總金額

14. **QuizAPITestCase** - 測驗 API 測試（個別化教學邏輯）
    - ✅ CRUD 操作
    - ✅ 學生只能看到自己報名課程的測驗
    - ✅ 個別化測驗只對群組成員可見
    - ✅ 提交測驗（自動批改、創建錯題本）

15. **ExamAPITestCase** - 考卷 API 測試
    - ✅ CRUD 操作
    - ✅ 提交考卷

16. **StudentGroupAPITestCase** - 學生群組 API 測試
    - ✅ CRUD 操作
    - ✅ 添加學生到群組
    - ✅ 從群組移除學生

17. **ErrorLogAPITestCase** - 錯題本 API 測試
    - ✅ CRUD 操作
    - ✅ 按學生篩選

18. **HashtagAPITestCase** - 標籤 API 測試
    - ✅ CRUD 操作
    - ✅ 唯一性約束測試

19. **QuestionTagAPITestCase** - 題目標籤關聯 API 測試
    - ✅ CRUD 操作
    - ✅ 唯一性約束測試

20. **EnrollmentPeriodAPITestCase** - 上課期間 API 測試
    - ✅ CRUD 操作
    - ✅ 按報名記錄篩選

21. **RestaurantAPITestCase** - 餐廳 API 測試
    - ✅ CRUD 操作

22. **CourseMaterialAPITestCase** - 講義 API 測試
    - ✅ CRUD 操作
    - ✅ 學生只能看到自己報名課程的講義

23. **StudentAnswerAPITestCase** - 作答記錄 API 測試
    - ✅ CRUD 操作
    - ✅ 軟刪除

## 商業邏輯測試重點

### 1. 學生報名流程
- 創建報名時自動創建初始上課期間
- 學生只能看到自己報名的課程

### 2. 團購和訂單流程
- 創建團購時自動生成唯一連結
- 創建訂單項目時自動計算小計和總金額
- 完成團購時自動為每個訂單生成費用記錄
- 已完成團購的訂單無法刪除

### 3. 測驗和考卷流程
- 學生只能看到自己報名課程的測驗/考卷
- 個別化測驗/考卷只對群組成員可見
- 提交測驗時自動批改並創建錯題本

### 4. 權限控制
- 管理員可以重置學生密碼
- 管理員可以啟用/停用學生帳號
- 只有管理員或會計可以完成團購

### 5. 軟刪除機制
- 學生、報名、費用、出席、請假、作答、錯題本、訂單都支援軟刪除
- 支援恢復已刪除的記錄

## 運行測試

### 運行所有 API 測試

```bash
cd backend
python manage.py test cramschool.test_api
```

### 運行特定測試類

```bash
# 測試學生 API
python manage.py test cramschool.test_api.StudentAPITestCase

# 測試團購 API
python manage.py test cramschool.test_api.GroupOrderAPITestCase

# 測試測驗 API
python manage.py test cramschool.test_api.QuizAPITestCase
```

### 運行特定測試方法

```bash
# 測試創建學生
python manage.py test cramschool.test_api.StudentAPITestCase.test_create_student

# 測試完成團購
python manage.py test cramschool.test_api.GroupOrderAPITestCase.test_complete_group_order_generates_fees
```

### 顯示詳細輸出

```bash
python manage.py test cramschool.test_api --verbosity=2
```

## 測試統計

- **測試類數量**: 23 個
- **測試方法數量**: 80+ 個
- **覆蓋的 ViewSet**: 所有主要 ViewSet
- **商業邏輯測試**: 完整覆蓋

## 注意事項

1. **測試數據隔離**: 每個測試類都有獨立的 `setUp` 方法，確保測試之間不會相互影響

2. **認證**: 測試中使用 `APIClient` 和 `force_authenticate` 來模擬不同角色的用戶

3. **數據庫**: 測試使用獨立的測試數據庫，不會影響開發數據庫

4. **商業邏輯**: 重點測試了關聯 API 的商業邏輯，如：
   - 團購完成時自動生成費用
   - 訂單項目變更時自動更新總金額
   - 測驗提交時自動批改和創建錯題本

## 未來擴展

可以考慮添加以下測試：

1. **性能測試**: 測試大量數據下的 API 性能
2. **邊界條件測試**: 測試極端值和邊界情況
3. **錯誤處理測試**: 測試各種錯誤情況的處理
4. **並發測試**: 測試並發請求的處理
5. **API 版本測試**: 如果未來有 API 版本控制

## 相關文檔

- [API 視圖文件](./api_views.py)
- [序列化器文件](./serializers.py)
- [模型文件](./models.py)
- [API URL 配置](./api_urls.py)

