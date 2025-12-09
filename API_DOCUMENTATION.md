# API 文件

## 基礎資訊

- **Base URL**: `/api/`
- **認證方式**: JWT Token (Bearer Token)
- **格式**: JSON

---

## 目錄

1. [認證模組 (Account)](#認證模組-account)
2. [補習班核心模組 (Cramschool)](#補習班核心模組-cramschool)
   - [學生管理](#學生管理)
   - [老師管理](#老師管理)
   - [課程管理](#課程管理)
   - [報名管理](#報名管理)
   - [費用管理](#費用管理)
   - [上課記錄管理](#上課記錄管理)
   - [出席管理](#出席管理)
   - [請假管理](#請假管理)
   - [題庫管理](#題庫管理)
   - [團購管理](#團購管理)

---

## 認證模組 (Account)

### 登入

**POST** `/api/account/login/`

**請求體**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**回應**:
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "message": "登入成功",
  "must_change_password": false
}
```

### 登出

**POST** `/api/account/logout/`

**權限**: 需要認證

**請求體**:
```json
{
  "refresh": "refresh_token_here"
}
```

### 獲取當前用戶資訊

**GET** `/api/account/users/me/`

**權限**: 需要認證

**回應**:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "role": "ADMIN",
  "first_name": "管理員",
  "last_name": ""
}
```

### 修改密碼

**POST** `/api/account/change-password/`

**權限**: 需要認證

**請求體**:
```json
{
  "old_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

### 刷新 Token

**POST** `/api/account/token/refresh/`

**請求體**:
```json
{
  "refresh": "refresh_token_here"
}
```

---

## 用戶管理

### 列出所有用戶

**GET** `/api/account/users/`

**權限**: 需要認證
- 管理員：可查看所有用戶
- 一般用戶：只能查看自己的資料

### 獲取單一用戶

**GET** `/api/account/users/{id}/`

### 創建用戶

**POST** `/api/account/users/`

**權限**: 管理員

### 更新用戶

**PUT/PATCH** `/api/account/users/{id}/`

### 刪除用戶

**DELETE** `/api/account/users/{id}/`

---

## 角色管理

### 列出所有角色

**GET** `/api/account/roles/`

**權限**: 管理員

### 創建角色

**POST** `/api/account/roles/`

**權限**: 管理員

**請求體**:
```json
{
  "name": "助教",
  "description": "助教角色描述"
}
```

### 更新角色權限

**POST** `/api/account/roles/{id}/permissions/`

**權限**: 管理員

**請求體**:
```json
{
  "permissions": [
    {
      "permission_type": "api",
      "resource": "/api/cramschool/students/",
      "method": "GET"
    },
    {
      "permission_type": "page",
      "resource": "/students"
    }
  ]
}
```

---

## 補習班核心模組 (Cramschool)

## 學生管理

### 列出所有學生

**GET** `/api/cramschool/students/`

**查詢參數**:
- 無特殊查詢參數

**回應欄位**:
- `student_id`: 學生ID
- `name`: 姓名
- `school`: 學校
- `grade`: 年級
- `phone`: 電話
- `username`: 用戶名（管理員可見）
- `user_email`: 用戶郵箱（管理員可見）
- `password`: 初始密碼（僅管理員可見）
- `total_fees`: 總費用
- `unpaid_fees`: 未繳費用
- `enrollments_count`: 報名課程數量

### 獲取單一學生

**GET** `/api/cramschool/students/{id}/`

### 創建學生

**POST** `/api/cramschool/students/`

**請求體**:
```json
{
  "name": "張三",
  "school": "XX國中",
  "grade": "九年級",
  "phone": "0912345678",
  "emergency_contact_name": "張父",
  "emergency_contact_phone": "0923456789",
  "notes": "備註資訊"
}
```

**回應**: 自動創建用戶帳號並返回帳號資訊

### 更新學生

**PUT/PATCH** `/api/cramschool/students/{id}/`

### 刪除學生

**DELETE** `/api/cramschool/students/{id}/`

### 重置學生密碼

**POST** `/api/cramschool/students/{id}/reset-password/`

**權限**: 管理員

**請求體**:
```json
{
  "password": "newpassword123"
}
```

### 切換學生帳號狀態

**POST** `/api/cramschool/students/{id}/toggle-account-status/`

**權限**: 管理員

### 檢查學費狀態

**GET** `/api/cramschool/students/{id}/tuition_status/`

**回應**: 返回學生需要生成的學費月份列表

### 生成學費

**POST** `/api/cramschool/students/{id}/generate_tuition/`

**請求體**:
```json
{
  "year": 2024,
  "month": 12,
  "enrollment_id": 1,
  "weeks": 4
}
```

---

## 老師管理

### 列出所有老師

**GET** `/api/cramschool/teachers/`

### 獲取單一老師

**GET** `/api/cramschool/teachers/{id}/`

### 創建老師

**POST** `/api/cramschool/teachers/`

**請求體**:
```json
{
  "name": "李老師",
  "username": "teacher_li",
  "password": "password123",
  "permission_level": "Teacher",
  "phone": "0912345678",
  "hire_date": "2024-01-01"
}
```

### 更新老師

**PUT/PATCH** `/api/cramschool/teachers/{id}/`

### 刪除老師

**DELETE** `/api/cramschool/teachers/{id}/`

---

## 課程管理

### 列出所有課程

**GET** `/api/cramschool/courses/`

**權限控制**:
- 管理員/老師：可查看所有課程
- 學生：只能查看自己報名的課程

### 獲取單一課程

**GET** `/api/cramschool/courses/{id}/`

### 創建課程

**POST** `/api/cramschool/courses/`

**請求體**:
```json
{
  "course_name": "高三數學總複習班",
  "teacher": 1,
  "start_time": "18:00:00",
  "end_time": "20:00:00",
  "day_of_week": "Mon",
  "fee_per_session": 500.00,
  "status": "Active"
}
```

### 更新課程

**PUT/PATCH** `/api/cramschool/courses/{id}/`

### 刪除課程

**DELETE** `/api/cramschool/courses/{id}/`

---

## 報名管理

### 列出所有報名記錄

**GET** `/api/cramschool/enrollments/`

### 獲取單一報名記錄

**GET** `/api/cramschool/enrollments/{id}/`

### 創建報名記錄

**POST** `/api/cramschool/enrollments/`

**請求體**:
```json
{
  "student": 1,
  "course": 1,
  "enroll_date": "2024-01-01",
  "discount_rate": 0.0,
  "is_active": true
}
```

**注意**: 創建報名時會自動創建初始上課期間

### 更新報名記錄

**PUT/PATCH** `/api/cramschool/enrollments/{id}/`

### 刪除報名記錄

**DELETE** `/api/cramschool/enrollments/{id}/`

---

## 報名期間管理

### 列出所有報名期間

**GET** `/api/cramschool/enrollment-periods/`

**查詢參數**:
- `enrollment`: 報名ID（可選）

### 獲取單一報名期間

**GET** `/api/cramschool/enrollment-periods/{id}/`

### 創建報名期間

**POST** `/api/cramschool/enrollment-periods/`

**請求體**:
```json
{
  "enrollment": 1,
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "is_active": true,
  "notes": "第一學期"
}
```

### 更新報名期間

**PUT/PATCH** `/api/cramschool/enrollment-periods/{id}/`

### 刪除報名期間

**DELETE** `/api/cramschool/enrollment-periods/{id}/`

---

## 費用管理

### 列出所有費用

**GET** `/api/cramschool/fees/`

**查詢參數**:
- `student`: 學生ID（可選）

### 獲取單一費用

**GET** `/api/cramschool/fees/{id}/`

### 創建費用

**POST** `/api/cramschool/fees/`

**請求體**:
```json
{
  "student": 1,
  "item": "Tuition",
  "amount": 2000.00,
  "fee_date": "2024-01-01",
  "payment_status": "Unpaid",
  "notes": "2024年1月學費"
}
```

**費用項目選項**: `Tuition`, `Transport`, `Meal`, `Book`, `Other`

**繳費狀態選項**: `Paid`, `Unpaid`, `Partial`

### 更新費用

**PUT/PATCH** `/api/cramschool/fees/{id}/`

### 刪除費用

**DELETE** `/api/cramschool/fees/{id}/`

---

## 上課記錄管理

### 列出所有上課記錄

**GET** `/api/cramschool/sessions/`

### 獲取單一上課記錄

**GET** `/api/cramschool/sessions/{id}/`

### 創建上課記錄

**POST** `/api/cramschool/sessions/`

**請求體**:
```json
{
  "course": 1,
  "session_date": "2024-01-01"
}
```

### 更新上課記錄

**PUT/PATCH** `/api/cramschool/sessions/{id}/`

### 刪除上課記錄

**DELETE** `/api/cramschool/sessions/{id}/`

---

## 出席管理

### 列出所有出席記錄

**GET** `/api/cramschool/attendances/`

### 獲取單一出席記錄

**GET** `/api/cramschool/attendances/{id}/`

### 創建出席記錄

**POST** `/api/cramschool/attendances/`

**請求體**:
```json
{
  "session": 1,
  "student": 1,
  "status": "Present"
}
```

**狀態選項**: `Present`, `Absent`, `Late`, `Leave`

### 更新出席記錄

**PUT/PATCH** `/api/cramschool/attendances/{id}/`

### 刪除出席記錄

**DELETE** `/api/cramschool/attendances/{id}/`

---

## 請假管理

### 列出所有請假記錄

**GET** `/api/cramschool/leaves/`

### 獲取單一請假記錄

**GET** `/api/cramschool/leaves/{id}/`

### 創建請假記錄

**POST** `/api/cramschool/leaves/`

**請求體**:
```json
{
  "student": 1,
  "course": 1,
  "leave_date": "2024-01-15",
  "reason": "生病請假",
  "approval_status": "Pending"
}
```

**審核狀態選項**: `Pending`, `Approved`, `Rejected`

### 更新請假記錄

**PUT/PATCH** `/api/cramschool/leaves/{id}/`

### 刪除請假記錄

**DELETE** `/api/cramschool/leaves/{id}/`

---

## 科目管理

### 列出所有科目

**GET** `/api/cramschool/subjects/`

### 獲取單一科目

**GET** `/api/cramschool/subjects/{id}/`

### 創建科目

**POST** `/api/cramschool/subjects/`

**請求體**:
```json
{
  "name": "數學",
  "code": "MATH",
  "description": "數學科目"
}
```

### 更新科目

**PUT/PATCH** `/api/cramschool/subjects/{id}/`

### 刪除科目

**DELETE** `/api/cramschool/subjects/{id}/`

---

## 題庫管理

### 列出所有題目

**GET** `/api/cramschool/questions/`

### 獲取單一題目

**GET** `/api/cramschool/questions/{id}/`

### 創建題目

**POST** `/api/cramschool/questions/`

**請求體**:
```json
{
  "subject": 1,
  "level": "JHS",
  "chapter": "第一章：有理數",
  "content": "題目內容（Markdown + LaTeX）",
  "image_path": "question_images/2024/01/01/xxx.jpg",
  "correct_answer": "正確答案",
  "difficulty": 3
}
```

**年級選項**: `JHS` (國中), `SHS` (高中), `VCS` (高職)

**難度**: 1-5（數字越大越難）

### 搜尋章節

**GET** `/api/cramschool/questions/search_chapters/`

**查詢參數**:
- `q`: 搜尋關鍵字（必需）
- `subject`: 科目ID（可選）
- `level`: 年級（可選）

**回應**: 返回匹配的章節列表，按相關性排序

### 更新題目

**PUT/PATCH** `/api/cramschool/questions/{id}/`

### 刪除題目

**DELETE** `/api/cramschool/questions/{id}/`

---

## 標籤管理

### 列出所有標籤

**GET** `/api/cramschool/hashtags/`

### 獲取單一標籤

**GET** `/api/cramschool/hashtags/{id}/`

### 創建標籤

**POST** `/api/cramschool/hashtags/`

**請求體**:
```json
{
  "tag_name": "幾何",
  "creator": 1
}
```

### 更新標籤

**PUT/PATCH** `/api/cramschool/hashtags/{id}/`

### 刪除標籤

**DELETE** `/api/cramschool/hashtags/{id}/`

---

## 題目標籤關聯管理

### 列出所有關聯

**GET** `/api/cramschool/question-tags/`

### 獲取單一關聯

**GET** `/api/cramschool/question-tags/{id}/`

### 創建關聯

**POST** `/api/cramschool/question-tags/`

**請求體**:
```json
{
  "question": 1,
  "tag": 1
}
```

### 刪除關聯

**DELETE** `/api/cramschool/question-tags/{id}/`

---

## 學生作答記錄管理

### 列出所有作答記錄

**GET** `/api/cramschool/student-answers/`

### 獲取單一作答記錄

**GET** `/api/cramschool/student-answers/{id}/`

### 創建作答記錄

**POST** `/api/cramschool/student-answers/`

**請求體**:
```json
{
  "student": 1,
  "question": 1,
  "test_name": "第一次月考",
  "is_correct": false,
  "scanned_file_path": "scans/2024/01/01/xxx.pdf"
}
```

### 更新作答記錄

**PUT/PATCH** `/api/cramschool/student-answers/{id}/`

### 刪除作答記錄

**DELETE** `/api/cramschool/student-answers/{id}/`

---

## 錯題本管理

### 列出所有錯題記錄

**GET** `/api/cramschool/error-logs/`

**查詢參數**:
- `student`: 學生ID（可選）

### 獲取單一錯題記錄

**GET** `/api/cramschool/error-logs/{id}/`

### 創建錯題記錄

**POST** `/api/cramschool/error-logs/`

**請求體**:
```json
{
  "student": 1,
  "question": 1,
  "error_count": 1,
  "review_status": "New"
}
```

**掌握狀態選項**: `New`, `Reviewing`, `Mastered`

### 更新錯題記錄

**PUT/PATCH** `/api/cramschool/error-logs/{id}/`

### 刪除錯題記錄

**DELETE** `/api/cramschool/error-logs/{id}/`

---

## 圖片上傳

### 上傳圖片

**POST** `/api/cramschool/upload-image/`

**請求**: multipart/form-data

**請求參數**:
- `image`: 圖片文件（必需）

**限制**:
- 允許格式: jpg, jpeg, png, gif, webp
- 最大大小: 5MB

**回應**:
```json
{
  "image_path": "question_images/2024/01/01/xxx.jpg",
  "image_url": "/media/question_images/2024/01/01/xxx.jpg"
}
```

---

## 團購管理

### 店家管理

#### 列出所有店家

**GET** `/api/cramschool/restaurants/`

#### 獲取單一店家

**GET** `/api/cramschool/restaurants/{id}/`

#### 創建店家

**POST** `/api/cramschool/restaurants/`

**請求體**:
```json
{
  "name": "XX餐廳",
  "phone": "02-12345678",
  "address": "台北市XX路XX號",
  "menu_image_path": "menus/restaurant_1.jpg",
  "is_active": true
}
```

#### 更新店家

**PUT/PATCH** `/api/cramschool/restaurants/{id}/`

#### 刪除店家

**DELETE** `/api/cramschool/restaurants/{id}/`

---

### 團購管理

#### 列出所有團購

**GET** `/api/cramschool/group-orders/`

#### 獲取單一團購

**GET** `/api/cramschool/group-orders/{id}/`

#### 創建團購

**POST** `/api/cramschool/group-orders/`

**請求體**:
```json
{
  "restaurant": 1,
  "title": "週五午餐團購",
  "deadline": "2024-01-12T12:00:00Z",
  "created_by": 1,
  "status": "Open"
}
```

**注意**: 創建時會自動生成唯一連結 (`order_link`)

#### 完成團購

**POST** `/api/cramschool/group-orders/{id}/complete/`

**功能**: 完成團購並自動為每個訂單生成費用記錄

**回應**:
```json
{
  "message": "團購已完成",
  "fees_created": 5,
  "fee_ids": [1, 2, 3, 4, 5]
}
```

#### 更新團購

**PUT/PATCH** `/api/cramschool/group-orders/{id}/`

#### 刪除團購

**DELETE** `/api/cramschool/group-orders/{id}/`

---

### 訂單管理

#### 列出所有訂單

**GET** `/api/cramschool/orders/`

**查詢參數**:
- `group_order`: 團購ID（可選）
- `student`: 學生ID（可選）

#### 獲取單一訂單

**GET** `/api/cramschool/orders/{id}/`

#### 創建訂單

**POST** `/api/cramschool/orders/`

**請求體**:
```json
{
  "group_order": 1,
  "student": 1,
  "status": "Pending",
  "notes": "備註"
}
```

**注意**: 創建訂單後，需要創建訂單項目 (`order-items`)，總金額會自動計算

#### 更新訂單

**PUT/PATCH** `/api/cramschool/orders/{id}/`

#### 刪除訂單

**DELETE** `/api/cramschool/orders/{id}/`

---

### 訂單項目管理

#### 列出所有訂單項目

**GET** `/api/cramschool/order-items/`

#### 獲取單一訂單項目

**GET** `/api/cramschool/order-items/{id}/`

#### 創建訂單項目

**POST** `/api/cramschool/order-items/`

**請求體**:
```json
{
  "order": 1,
  "item_name": "雞腿飯",
  "quantity": 2,
  "unit_price": 100.00
}
```

**注意**: 小計和訂單總金額會自動計算

#### 更新訂單項目

**PUT/PATCH** `/api/cramschool/order-items/{id}/`

**注意**: 更新時會自動重新計算小計和訂單總金額

#### 刪除訂單項目

**DELETE** `/api/cramschool/order-items/{id}/`

**注意**: 刪除時會自動重新計算訂單總金額

---

## 錯誤處理

### 錯誤回應格式

```json
{
  "detail": "錯誤訊息",
  "field_name": ["欄位相關錯誤"]
}
```

### 常見錯誤碼

- `400`: 請求錯誤（參數錯誤、驗證失敗等）
- `401`: 未認證（未提供 Token 或 Token 無效）
- `403`: 權限不足
- `404`: 資源不存在
- `500`: 伺服器錯誤

---

## 認證說明

### 使用 JWT Token

在請求 header 中加入：

```
Authorization: Bearer {access_token}
```

### Token 過期

當 access token 過期時，使用 refresh token 獲取新的 access token：

**POST** `/api/account/token/refresh/`

---

## 權限說明

### 角色類型

- **ADMIN**: 系統管理員，擁有所有權限
- **TEACHER**: 老師，可管理課程、出席等
- **STUDENT**: 學生，只能查看自己的相關資料

### 權限控制

大部分 API 目前設定為 `AllowAny`（開發階段），生產環境應改為適當的權限控制。

建議修改的權限設定：
- 管理員專用 API: `IsAuthenticated` + 管理員檢查
- 老師專用 API: `IsAuthenticated` + 老師或管理員檢查
- 學生專用 API: `IsAuthenticated` + 學生自己或管理員檢查

---

## 注意事項

1. 所有日期格式使用 ISO 8601 格式（如：`2024-01-01`）
2. 所有時間格式使用 24 小時制（如：`18:00:00`）
3. 金額欄位使用 Decimal 類型，保留兩位小數
4. 創建學生時會自動創建用戶帳號
5. 創建報名記錄時會自動創建初始上課期間
6. 團購完成時會自動生成費用記錄
7. 訂單項目的增刪改會自動更新訂單總金額

