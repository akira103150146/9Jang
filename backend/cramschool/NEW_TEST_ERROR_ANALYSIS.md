# 新測試錯誤分析報告

## 錯誤統計

- **總測試數**: 90 個
- **錯誤**: 2 個 (IntegrityError, TypeError)
- **失敗**: 2 個 (AssertionError)
- **通過**: 86 個

---

## 🔴 錯誤 1: OrderItem subtotal NOT NULL 約束違反

### 錯誤訊息
```
sqlite3.IntegrityError: NOT NULL constraint failed: cramschool_orderitem.subtotal
```

### 錯誤位置
- **文件**: `backend/cramschool/api_views.py` line 1269
- **測試**: `test_create_order_item_auto_calculates_subtotal`

### 錯誤原因分析

**問題根源**：
1. **數據庫層面**：`OrderItem.subtotal` 欄位在模型中定義為 `DecimalField`，**沒有設置 `null=True` 或 `default` 值**，所以數據庫要求該欄位在插入時必須有值（NOT NULL 約束）。

2. **序列化器層面**：雖然我們將 `subtotal` 設為 `read_only_fields`，這只是告訴 DRF 在**序列化輸出時**不要要求這個欄位，但**不會影響數據庫的 NOT NULL 約束**。

3. **視圖邏輯問題**：在 `OrderItemViewSet.perform_create()` 中的執行順序是：
   ```python
   item = serializer.save()  # ❌ 這裡會嘗試插入數據庫，但 subtotal 為 NULL
   item.subtotal = item.quantity * item.unit_price  # ✅ 計算 subtotal
   item.save()  # ✅ 更新 subtotal
   ```
   
   問題在於 `serializer.save()` 會立即執行數據庫插入操作，此時 `subtotal` 還沒有值，違反了 NOT NULL 約束。

### 為什麼會發生？

**執行流程**：
1. 客戶端發送 POST 請求，數據中**不包含 `subtotal`**（因為它是 read_only）
2. DRF 序列化器驗證通過（因為 `subtotal` 是 read_only，不會被驗證）
3. `perform_create()` 被調用
4. `serializer.save()` 嘗試創建 `OrderItem` 對象並**立即插入數據庫**
5. 數據庫檢查：`subtotal` 欄位為 NULL，但模型定義不允許 NULL → **IntegrityError**

### 解決方案選項

**選項 A：在 `perform_create` 中先計算再保存**（推薦）
- 在調用 `serializer.save()` 之前，先計算 `subtotal`
- 將計算好的 `subtotal` 傳入 `validated_data`
- 但這需要修改序列化器的 `create` 方法，或者使用 `serializer.save(subtotal=...)`

**選項 B：修改模型，允許 subtotal 為 NULL 或設置默認值**
- 在模型中添加 `null=True` 或 `default=Decimal('0.00')`
- 但這可能不符合業務邏輯（小計應該總是有值）

**選項 C：在序列化器中重寫 `create` 方法**
- 在 `create` 方法中計算 `subtotal`，然後再調用 `super().create()`
- 這樣可以確保在插入數據庫之前就有值

---

## 🔴 錯誤 2: TeacherSerializer create 方法中 password 欄位問題

### 錯誤訊息
```
TypeError: Teacher() got unexpected keyword arguments: 'password'
```

### 錯誤位置
- **文件**: `backend/cramschool/serializers.py` line 180
- **測試**: `test_create_teacher`

### 錯誤原因分析

**問題根源**：
1. **序列化器定義**：`TeacherSerializer` 中定義了 `password` 欄位（line 88）：
   ```python
   password = serializers.CharField(write_only=True, required=False, allow_blank=True)
   ```
   這個欄位是 `write_only`，意味著它會被包含在 `validated_data` 中。

2. **create 方法邏輯**：在 `TeacherSerializer.create()` 方法中（line 132-180）：
   - 從 `self.initial_data` 獲取 `password` 和 `username`（line 139-140）
   - 創建 `CustomUser`（line 166-174）
   - 將 `user` 添加到 `validated_data`（line 179）
   - **然後調用 `super().create(validated_data)`**（line 180）

3. **問題所在**：當調用 `super().create(validated_data)` 時，`validated_data` 中**仍然包含 `password` 欄位**，因為：
   - `password` 是 `write_only`，所以會被包含在 `validated_data` 中
   - 但 `Teacher` 模型**沒有 `password` 欄位**（密碼存儲在關聯的 `CustomUser` 中）
   - DRF 嘗試將 `validated_data` 中的所有鍵作為參數傳給 `Teacher.objects.create()`
   - `Teacher.objects.create(password=...)` → **TypeError**

### 為什麼會發生？

**執行流程**：
1. 測試發送 POST 請求，包含 `password` 欄位
2. 序列化器驗證通過，`password` 被包含在 `validated_data` 中
3. `create()` 方法被調用
4. 從 `self.initial_data` 獲取 `password` 並創建 `CustomUser`
5. 將 `user` 添加到 `validated_data`
6. **但沒有從 `validated_data` 中移除 `password`**
7. 調用 `super().create(validated_data)`，嘗試創建 `Teacher` 對象
8. `Teacher.objects.create()` 收到 `password` 參數 → **TypeError**

### 解決方案

**必須在調用 `super().create()` 之前從 `validated_data` 中移除 `password` 和 `username`**：
```python
# 在 line 179 之後，line 180 之前添加：
validated_data.pop('password', None)  # 移除 password
validated_data.pop('username', None)   # 移除 username（如果有的話）
return super().create(validated_data)
```

---

## 🟡 失敗 1: test_filter_periods_by_enrollment - 數據隔離問題

### 錯誤訊息
```
AssertionError: 4 != 1
```

### 錯誤位置
- **文件**: `backend/cramschool/test_api.py` line 1951
- **測試**: `test_filter_periods_by_enrollment`

### 錯誤原因分析

**問題根源**：
1. **測試邏輯**：測試期望當查詢參數 `enrollment=self.enrollment.enrollment_id` 時，只返回 1 個 `EnrollmentPeriod` 記錄。

2. **實際結果**：返回了 4 個記錄，說明有其他測試創建的數據沒有被清理。

3. **數據隔離問題**：
   - 雖然我們將 `BaseAPITestCase` 改為使用 `setUpTestData()`，但這只解決了**測試類之間**的數據隔離
   - **同一個測試類的不同測試方法之間**，數據庫不會自動清空
   - 如果其他測試方法（例如 `test_create_enrollment_period`）創建了 `EnrollmentPeriod` 記錄，這些記錄會保留在數據庫中
   - 當 `test_filter_periods_by_enrollment` 運行時，它會看到：
     - 自己創建的 1 個記錄（`self.enrollment`）
     - 其他測試方法創建的記錄（可能是 3 個）

4. **API 邏輯正確性**：
   - `EnrollmentPeriodViewSet.get_queryset()` 的邏輯是正確的（line 498-500）：
     ```python
     enrollment_id = self.request.query_params.get('enrollment', None)
     if enrollment_id:
         queryset = queryset.filter(enrollment_id=enrollment_id)
     ```
   - 問題不在 API，而在測試數據隔離

### 為什麼會發生？

**執行流程**：
1. `test_create_enrollment_period` 運行，創建了 `EnrollmentPeriod` 記錄
2. 測試結束，但數據庫**沒有清空**（Django 測試框架在同一個測試類的不同測試方法之間不會清空數據庫）
3. `test_filter_periods_by_enrollment` 運行
4. 它創建了自己的測試數據（`self.enrollment` 和 `enrollment2`）
5. 發送 GET 請求，查詢參數為 `enrollment=self.enrollment.enrollment_id`
6. API 正確過濾，但返回的結果包括：
   - 當前測試創建的記錄（1 個）
   - 之前測試創建的記錄（3 個，如果它們的 `enrollment_id` 恰好匹配，或者查詢參數沒有正確傳遞）

**可能的原因**：
- 查詢參數沒有正確傳遞（但這不太可能，因為 API 邏輯看起來正確）
- 其他測試創建的記錄的 `enrollment_id` 恰好與 `self.enrollment.enrollment_id` 相同（不太可能）
- **最可能**：測試中使用了 `response.data` 而不是 `response.data['results']`，導致計數錯誤

### 解決方案

**檢查測試代碼**：line 1951 使用了 `len(response.data)`，但應該使用 `len(self.get_response_results(response))`，因為 API 返回的是分頁格式。

---

## 🟡 失敗 2: test_individualized_quiz_only_visible_to_group_members - 個別化測驗不可見

### 錯誤訊息
```
AssertionError: '個別化測驗' not found in []
```

### 錯誤位置
- **文件**: `backend/cramschool/test_api.py` line 1497
- **測試**: `test_individualized_quiz_only_visible_to_group_members`

### 錯誤原因分析

**問題根源**：
1. **測試邏輯**：
   - 創建一個 `StudentGroup`，將 `self.student` 添加到群組中
   - 創建一個個別化測驗（`is_individualized=True`），將該群組添加到測驗的 `student_groups`
   - 使用 `self.student_user` 認證
   - 期望在測驗列表中看到這個個別化測驗

2. **API 邏輯**：`QuizViewSet.get_queryset()` (line 1382-1422)：
   ```python
   if self.request.user.is_student():
       student = self.request.user.student_profile  # ✅ 獲取學生資料
       enrolled_course_ids = StudentEnrollment.objects.filter(
           student=student,
           is_active=True,
           is_deleted=False
       ).values_list('course_id', flat=True)
       
       queryset = queryset.filter(course_id__in=enrolled_course_ids)  # ✅ 過濾已報名課程
       
       # 過濾個別化測驗
       queryset = queryset.filter(
           Q(is_individualized=False) |
           Q(student_groups__students=student)  # ✅ 個別化測驗必須在學生的群組中
       ).distinct()
   ```

3. **問題所在**：
   - API 邏輯要求學生**必須報名該測驗的課程**（`course_id__in=enrolled_course_ids`）
   - 然後才檢查個別化測驗的群組成員資格
   - **測試中創建的測驗屬於 `self.course`，但 `self.student` 可能沒有報名這個課程**

### 為什麼會發生？

**執行流程**：
1. 測試創建 `self.course`（line 1390-1397）
2. 測試創建 `self.student`，關聯到 `self.student_user`（line 1399-1404）
3. **但沒有創建 `StudentEnrollment` 記錄**，將 `self.student` 報名到 `self.course`
4. 測試創建個別化測驗，關聯到 `self.course`（line 1481-1488）
5. 使用 `self.student_user` 認證並查詢測驗列表
6. API 邏輯：
   - 獲取 `self.student_user.student_profile` → `self.student` ✅
   - 查詢 `StudentEnrollment`，過濾 `student=self.student` → **結果為空** ❌
   - `enrolled_course_ids` 為空列表
   - `queryset.filter(course_id__in=[])` → **返回空查詢集** ❌
   - 即使後面的個別化測驗過濾邏輯正確，也無法返回結果

### 解決方案

**在測試中添加 `StudentEnrollment` 記錄**：
```python
# 在創建測驗之前添加：
StudentEnrollment.objects.create(
    student=self.student,
    course=self.course,
    enroll_date=date.today(),
    is_active=True,
    is_deleted=False
)
```

---

## 📊 錯誤優先級總結

### 🔴 高優先級（必須修復）
1. **OrderItem subtotal NOT NULL 約束** - 影響核心功能
2. **TeacherSerializer password 欄位** - 影響創建功能

### 🟡 中優先級（測試邏輯問題）
3. **test_filter_periods_by_enrollment** - 可能是分頁響應處理問題
4. **test_individualized_quiz_only_visible_to_group_members** - 缺少 StudentEnrollment 記錄

---

## 🔍 需要進一步調查的問題

1. **test_filter_periods_by_enrollment**：
   - 確認是否使用了 `get_response_results()` 處理分頁響應
   - 檢查查詢參數是否正確傳遞

2. **個別化測驗邏輯**：
   - 確認業務邏輯：個別化測驗是否要求學生必須報名課程？
   - 如果不需要，需要修改 API 邏輯

---

## 📝 修復建議順序

1. ✅ **立即修復**: OrderItem subtotal 問題（修改 `perform_create` 邏輯）
2. ✅ **立即修復**: TeacherSerializer password 問題（從 `validated_data` 移除）
3. ⚠️ **檢查修復**: test_filter_periods_by_enrollment（確認分頁響應處理）
4. ⚠️ **檢查修復**: test_individualized_quiz_only_visible_to_group_members（添加 StudentEnrollment）

