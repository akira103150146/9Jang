# API 測試錯誤分析報告

## 錯誤分類統計

- **總測試數**: 90 個
- **失敗**: 6 個 (AssertionError)
- **錯誤**: 9 個 (TypeError, NameError, IntegrityError)
- **通過**: 75 個

---

## 🔴 錯誤類型 1: NameError - AssessmentSubmission 未導入

### 影響的測試 (3個)
- `test_submit_quiz` (line 1448)
- `test_submit_quiz_with_wrong_answer_creates_error_log` (line 1448)
- `test_submit_exam` (line 1588)

### 錯誤原因
**文件**: `backend/cramschool/api_views.py`

在 `api_views.py` 的第 16-20 行導入模型時，**缺少了 `AssessmentSubmission`**：

```python
from .models import (
    Student, Teacher, Course, StudentEnrollment, EnrollmentPeriod, ExtraFee, 
    SessionRecord, Attendance, Leave, Subject, QuestionBank, Hashtag, QuestionTag,
    StudentAnswer, ErrorLog, Restaurant, GroupOrder, Order, OrderItem,
    StudentGroup, Quiz, Exam, CourseMaterial  # ❌ 缺少 AssessmentSubmission
)
```

但在 `QuizViewSet.submit()` (line 1448) 和 `ExamViewSet.submit()` (line 1588) 方法中使用了：
```python
submission = AssessmentSubmission.objects.create(...)  # ❌ 未定義
```

### 影響範圍
- **API 功能**: Quiz 和 Exam 的提交功能完全無法使用
- **嚴重程度**: 🔴 **高** - 核心功能無法運作

### 修復方式
在 `api_views.py` 第 16-20 行的導入中添加 `AssessmentSubmission`：
```python
from .models import (
    ...,
    AssessmentSubmission  # ✅ 添加這一行
)
```

---

## 🔴 錯誤類型 2: TypeError - response.data 結構錯誤

### 影響的測試 (5個)
- `test_student_can_only_see_enrolled_courses` (line 513)
- `test_student_can_only_see_enrolled_course_materials` (line 2028)
- `test_filter_questions_by_subject` (line 1056)
- `test_individualized_quiz_only_visible_to_group_members` (line 1472)
- `test_student_can_only_see_enrolled_course_quizzes` (line 1445)

### 錯誤原因
測試代碼假設 `response.data` 是列表，但實際返回的是字符串或其他格式。

**錯誤代碼示例**:
```python
course_names = [c['course_name'] for c in response.data]  # ❌ response.data 不是列表
```

### 根本原因 ✅ 已確認
**文件**: `backend/config/settings.py` line 247-248

DRF 配置了**全局分頁**：
```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}
```

這意味著**所有列表 API 都返回分頁格式**：
```python
{
    'count': 總數,
    'next': 下一頁URL或None,
    'previous': 上一頁URL或None,
    'results': [實際數據列表]  # ✅ 實際數據在這裡
}
```

但測試代碼直接使用 `response.data`，期望它是列表：
```python
course_names = [c['course_name'] for c in response.data]  # ❌ response.data 是字典
```

應該使用：
```python
course_names = [c['course_name'] for c in response.data['results']]  # ✅ 正確
```

### 影響範圍
- **API 功能**: 列表查詢功能可能正常，但測試無法正確驗證
- **嚴重程度**: 🟡 **中** - 功能可能正常，但測試需要修正

### 修復方式 ✅ 已確認
**所有受影響的測試都需要修改**：

```python
# 修改前
course_names = [c['course_name'] for c in response.data]

# 修改後
course_names = [c['course_name'] for c in response.data['results']]
```

**或者創建一個輔助方法**：
```python
def get_response_results(self, response):
    """獲取分頁響應中的實際數據列表"""
    if isinstance(response.data, dict) and 'results' in response.data:
        return response.data['results']
    return response.data

# 使用
course_names = [c['course_name'] for c in self.get_response_results(response)]
```

---

## 🟡 錯誤類型 3: IntegrityError - 唯一性約束違反

### 影響的測試 (1個)
- `test_filter_periods_by_enrollment` (line 1895)

### 錯誤原因
**文件**: `backend/cramschool/test_api.py`

在 `EnrollmentPeriodAPITestCase.setUp()` 中已經創建了一個 enrollment：
```python
self.enrollment = StudentEnrollment.objects.create(
    student=self.student,
    course=self.course,
    enroll_date=date.today()
)
```

但在 `test_filter_periods_by_enrollment()` 中又嘗試創建**同一個學生和課程**的 enrollment：
```python
enrollment2 = StudentEnrollment.objects.create(  # ❌ 違反 unique_together
    student=self.student,  # 同一個學生
    course=self.course,    # 同一個課程
    enroll_date=date.today()
)
```

而 `StudentEnrollment` 模型有 `unique_together = [('student', 'course')]` 約束。

### 影響範圍
- **API 功能**: 不影響 API 功能，只是測試邏輯錯誤
- **嚴重程度**: 🟢 **低** - 僅測試問題

### 修復方式
使用不同的學生或課程來創建第二個 enrollment：
```python
# 選項 1: 使用不同的課程
course2 = Course.objects.create(...)
enrollment2 = StudentEnrollment.objects.create(
    student=self.student,
    course=course2,  # ✅ 不同的課程
    enroll_date=date.today()
)

# 選項 2: 使用不同的學生
student2 = Student.objects.create(...)
enrollment2 = StudentEnrollment.objects.create(
    student=student2,  # ✅ 不同的學生
    course=self.course,
    enroll_date=date.today()
)
```

---

## 🟡 錯誤類型 4: AssertionError - 測試數據隔離問題

### 影響的測試 (4個)
- `test_list_students` - 期望 1，實際 4
- `test_list_teachers` - 期望 3，實際 4
- `test_filter_fees_by_student` - 期望 1，實際 4
- `test_filter_error_logs_by_student` - 期望 1，實際 4

### 錯誤原因
**問題**: 測試之間數據沒有完全隔離

1. **BaseAPITestCase.setUp()** 在每個測試類運行前都會執行，創建基礎數據
2. 但 Django 的測試框架在**同一個測試類**的不同測試方法之間**不會清空數據庫**
3. 所以 `test_list_students` 會看到：
   - BaseAPITestCase.setUp() 創建的數據（如果有）
   - 之前測試方法創建的數據
   - 當前測試創建的數據

### 具體分析

#### `test_list_students` (期望 1，實際 4)
- 測試創建了 2 個學生（student1, student2，其中 student2 已刪除）
- 但實際返回 4 個，說明還有其他學生存在
- **可能原因**: BaseAPITestCase 或其他測試創建的學生沒有被清理

#### `test_list_teachers` (期望 3，實際 4)
- 測試創建了 2 個老師
- BaseAPITestCase.setUp() 創建了 1 個老師
- 期望總共 3 個，但實際 4 個
- **可能原因**: 有其他測試創建了老師

#### `test_filter_fees_by_student` (期望 1，實際 4)
- 測試為 self.student 創建了 1 個費用
- 但返回 4 個費用
- **可能原因**: 其他測試創建的費用沒有被清理

#### `test_filter_error_logs_by_student` (期望 1，實際 4)
- 測試為 self.student 創建了 1 個錯題記錄
- 但返回 4 個錯題記錄
- **可能原因**: 其他測試創建的錯題記錄沒有被清理

### 影響範圍
- **API 功能**: 不影響 API 功能，API 本身工作正常
- **嚴重程度**: 🟢 **低** - 僅測試問題，但會導致測試不穩定

### 修復方式

**選項 1: 使用 `setUpTestData` 代替 `setUp`**（推薦）
```python
@classmethod
def setUpTestData(cls):
    """每個測試類只執行一次，測試方法之間共享"""
    cls.teacher = Teacher.objects.create(...)
```

**選項 2: 在測試中明確清理數據**
```python
def test_list_students(self):
    # 先清理所有學生（除了需要的）
    Student.objects.exclude(name='學生1').exclude(name='學生2').delete()
    # 然後運行測試
```

**選項 3: 使用更精確的斷言**
```python
# 不檢查總數，而是檢查特定數據是否存在
self.assertIn('學生1', [s['name'] for s in response.data])
self.assertNotIn('學生2', [s['name'] for s in response.data if not s.get('is_deleted')])
```

**選項 4: 使用 `TransactionTestCase`**（較慢，但完全隔離）
```python
from django.test import TransactionTestCase
class BaseAPITestCase(TransactionTestCase):
    # 每個測試方法都在獨立事務中運行
```

---

## 🟡 錯誤類型 5: AssertionError - 創建失敗 (400 錯誤)

### 影響的測試 (2個)
- `test_create_teacher` (line 389) - 期望 201，實際 400
- `test_create_order_item_auto_calculates_subtotal` (line 1299) - 期望 201，實際 400

### 錯誤原因

#### `test_create_teacher` (400 錯誤)
**文件**: `backend/cramschool/test_api.py` line 385-390

測試數據：
```python
self.teacher_data = {
    'name': '新老師',
    'permission_level': 'Teacher',
    'phone': '0912345678',
    'password': 'teacherpass123'
    # ❌ 缺少 'username' 欄位
}
```

但 `TeacherSerializer` 的 `create()` 方法 (line 144) 要求：
```python
username = self.initial_data.get('username', '').strip()
if not username:
    raise serializers.ValidationError({'username': '帳號不能為空'})  # ❌ 驗證失敗
```

**問題**: 測試數據缺少必需的 `username` 欄位

#### `test_create_order_item_auto_calculates_subtotal` (400 錯誤)
**文件**: `backend/cramschool/test_api.py` line 1295-1303

測試數據：
```python
self.item_data = {
    'order': self.order.order_id,
    'item_name': '便當',
    'quantity': 2,
    'unit_price': '80.00'  # ✅ 字符串格式應該可以，DRF 會自動轉換
}
```

**已檢查**:
- `OrderItemSerializer` 的欄位：`['order_item_id', 'order', 'item_name', 'quantity', 'unit_price', 'subtotal']`
- `unit_price` 是 `DecimalField`，字符串 '80.00' 應該可以正常轉換
- `subtotal` 是 `read_only_fields`，不會在創建時驗證

**可能的原因**:
1. **序列化器驗證失敗**: 可能有自定義驗證邏輯
2. **外鍵驗證**: `order` 外鍵可能驗證失敗（但 order_id 應該存在）
3. **數據庫約束**: 可能有其他數據庫層面的約束

**需要實際運行測試查看詳細錯誤訊息**:
```python
# 在測試中添加
if response.status_code != 201:
    print(f"錯誤響應: {response.data}")  # 查看實際錯誤訊息
```

### 影響範圍
- **API 功能**: 創建功能可能正常，但測試數據不完整
- **嚴重程度**: 🟡 **中** - 需要修正測試數據

### 修復方式

#### 修復 `test_create_teacher`
```python
self.teacher_data = {
    'name': '新老師',
    'username': 'newteacher',  # ✅ 添加 username
    'permission_level': 'Teacher',
    'phone': '0912345678',
    'password': 'teacherpass123'
}
```

#### 修復 `test_create_order_item_auto_calculates_subtotal`
需要檢查 `OrderItemSerializer` 的定義，確保：
- 所有必需欄位都已提供
- 數據類型正確（可能需要使用 Decimal 而不是字符串）

---

## 📊 錯誤優先級建議

### 🔴 高優先級（必須修復）
1. **NameError: AssessmentSubmission** - 影響核心功能，必須立即修復

### 🟡 中優先級（建議修復）
2. **TypeError: response.data 結構** - 影響測試準確性，需要檢查 API 響應格式
3. **400 錯誤（創建失敗）** - 測試數據不完整，需要補充

### 🟢 低優先級（可選修復）
4. **IntegrityError** - 僅測試邏輯錯誤，不影響功能
5. **AssertionError（數據隔離）** - 測試不穩定，但不影響功能

---

## 🔍 需要進一步調查的問題

1. **response.data 結構問題**: 需要實際運行 API 並檢查響應格式
   - 是否使用了分頁？
   - 序列化器返回的格式是什麼？
   - API 是否返回了錯誤消息？

2. **OrderItemSerializer**: 需要檢查序列化器的定義
   - 必需欄位有哪些？
   - unit_price 的數據類型要求是什麼？

3. **測試數據隔離**: 需要決定使用哪種策略
   - 使用 `setUpTestData`？
   - 使用 `TransactionTestCase`？
   - 還是在測試中明確清理？

---

## 📝 建議的修復順序

1. ✅ **立即修復**: AssessmentSubmission 導入問題（5分鐘）
2. ✅ **優先修復**: 400 錯誤的測試數據（10分鐘）
3. ✅ **調查後修復**: response.data 結構問題（需要先檢查 API 響應）
4. ⚠️ **可選修復**: 測試數據隔離問題（可以暫時使用更寬鬆的斷言）

---

## 🛠️ 快速修復清單

### 🔴 必須立即修復
- [ ] **在 `api_views.py` 導入中添加 `AssessmentSubmission`** (line 16-20)
  - 影響: Quiz 和 Exam 提交功能完全無法使用
  - 時間: 1 分鐘

### 🟡 優先修復
- [ ] **修正所有列表 API 測試的 `response.data` 處理** (5個測試)
  - 將 `response.data` 改為 `response.data['results']`
  - 或添加輔助方法處理分頁響應
  - 時間: 10 分鐘

- [ ] **在 `test_create_teacher` 中添加 `username` 欄位**
  - 時間: 1 分鐘

- [ ] **檢查 `test_create_order_item_auto_calculates_subtotal` 的 400 錯誤**
  - 需要運行測試查看實際錯誤訊息
  - 時間: 5 分鐘

### 🟢 可選修復
- [ ] **修復 `test_filter_periods_by_enrollment` 的唯一性約束問題**
  - 使用不同的學生或課程
  - 時間: 2 分鐘

- [ ] **決定測試數據隔離策略**
  - 選項 A: 使用 `setUpTestData` (推薦)
  - 選項 B: 使用更寬鬆的斷言
  - 選項 C: 使用 `TransactionTestCase`
  - 時間: 15-30 分鐘

---

## 📋 詳細修復指南

### 1. 修復 AssessmentSubmission 導入 (🔴 高優先級)

**文件**: `backend/cramschool/api_views.py` line 16-20

**修改前**:
```python
from .models import (
    Student, Teacher, Course, StudentEnrollment, EnrollmentPeriod, ExtraFee, 
    SessionRecord, Attendance, Leave, Subject, QuestionBank, Hashtag, QuestionTag,
    StudentAnswer, ErrorLog, Restaurant, GroupOrder, Order, OrderItem,
    StudentGroup, Quiz, Exam, CourseMaterial
)
```

**修改後**:
```python
from .models import (
    Student, Teacher, Course, StudentEnrollment, EnrollmentPeriod, ExtraFee, 
    SessionRecord, Attendance, Leave, Subject, QuestionBank, Hashtag, QuestionTag,
    StudentAnswer, ErrorLog, Restaurant, GroupOrder, Order, OrderItem,
    StudentGroup, Quiz, Exam, CourseMaterial, AssessmentSubmission  # ✅ 添加
)
```

---

### 2. 修復分頁響應處理 (🟡 中優先級)

**受影響的測試** (5個):
- `test_student_can_only_see_enrolled_courses` (line 513)
- `test_student_can_only_see_enrolled_course_materials` (line 2028)
- `test_filter_questions_by_subject` (line 1056)
- `test_individualized_quiz_only_visible_to_group_members` (line 1472)
- `test_student_can_only_see_enrolled_course_quizzes` (line 1445)

**方案 A: 在 BaseAPITestCase 添加輔助方法** (推薦)

在 `BaseAPITestCase` 類中添加：
```python
def get_response_results(self, response):
    """獲取分頁響應中的實際數據列表"""
    if isinstance(response.data, dict) and 'results' in response.data:
        return response.data['results']
    return response.data if isinstance(response.data, list) else [response.data]
```

然後在所有測試中使用：
```python
# 修改前
course_names = [c['course_name'] for c in response.data]

# 修改後
course_names = [c['course_name'] for c in self.get_response_results(response)]
```

**方案 B: 直接修改每個測試** (簡單但重複)

```python
# 修改前
course_names = [c['course_name'] for c in response.data]

# 修改後
data = response.data['results'] if 'results' in response.data else response.data
course_names = [c['course_name'] for c in data]
```

---

### 3. 修復 test_create_teacher (🟡 中優先級)

**文件**: `backend/cramschool/test_api.py` line 377-381

**修改前**:
```python
self.teacher_data = {
    'name': '新老師',
    'permission_level': 'Teacher',
    'phone': '0912345678',
    'password': 'teacherpass123'
}
```

**修改後**:
```python
self.teacher_data = {
    'name': '新老師',
    'username': 'newteacher',  # ✅ 添加
    'permission_level': 'Teacher',
    'phone': '0912345678',
    'password': 'teacherpass123'
}
```

---

### 4. 修復 test_filter_periods_by_enrollment (🟢 低優先級)

**文件**: `backend/cramschool/test_api.py` line 1893-1899

**修改前**:
```python
enrollment2 = StudentEnrollment.objects.create(
    student=self.student,  # ❌ 與 self.enrollment 相同
    course=self.course,    # ❌ 與 self.enrollment 相同
    enroll_date=date.today()
)
```

**修改後** (選項 1 - 使用不同課程):
```python
course2 = Course.objects.create(
    course_name='另一門課',
    teacher=self.teacher,
    start_time='10:00:00',
    end_time='11:00:00',
    day_of_week='Tue',
    fee_per_session=Decimal('100.00')
)
enrollment2 = StudentEnrollment.objects.create(
    student=self.student,
    course=course2,  # ✅ 不同的課程
    enroll_date=date.today()
)
```

**修改後** (選項 2 - 使用不同學生):
```python
student2 = Student.objects.create(
    name='學生2',
    school='學校',
    grade='一年級'
)
enrollment2 = StudentEnrollment.objects.create(
    student=student2,  # ✅ 不同的學生
    course=self.course,
    enroll_date=date.today()
)
```

---

### 5. 修復測試數據隔離問題 (🟢 低優先級)

**選項 A: 使用更寬鬆的斷言** (最快)

```python
# 修改前
self.assertEqual(len(response.data), 1)

# 修改後
self.assertGreaterEqual(len(response.data), 1)  # 至少包含期望的數據
self.assertIn('學生1', [s['name'] for s in response.data])
```

**選項 B: 使用 setUpTestData** (推薦，但需要重構)

```python
@classmethod
def setUpTestData(cls):
    """每個測試類只執行一次"""
    cls.teacher = Teacher.objects.create(...)
    # 注意：不能使用 self，要使用 cls
```

**選項 C: 明確清理數據** (最精確)

```python
def test_list_students(self):
    # 先清理不需要的數據
    Student.objects.exclude(
        name__in=['學生1', '學生2']
    ).delete()
    # 然後運行測試
    ...
```

---

## 🎯 建議的修復順序

1. ✅ **立即修復** (5分鐘)
   - AssessmentSubmission 導入
   - test_create_teacher 添加 username

2. ✅ **優先修復** (15分鐘)
   - 添加 `get_response_results` 輔助方法
   - 修正所有分頁響應處理
   - 檢查 OrderItem 400 錯誤的實際原因

3. ⚠️ **可選修復** (20分鐘)
   - 修復唯一性約束問題
   - 實施測試數據隔離策略

