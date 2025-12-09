# 專案結構文件

## 專案概述

這是一個補習班綜合管理系統，採用前後端分離架構：
- **後端**: Django + Django REST Framework
- **前端**: Vue 3 + Vite + Tailwind CSS
- **認證**: JWT Token
- **資料庫**: SQLite（開發環境）

---

## 專案目錄結構

```
9Jang/
├── backend/                    # Django 後端
│   ├── account/               # 認證與用戶管理模組
│   │   ├── models.py         # 用戶、角色、權限模型
│   │   ├── views.py          # 認證相關視圖
│   │   ├── serializers.py    # 序列化器
│   │   ├── urls.py           # URL 路由
│   │   └── utils.py          # 工具函數（審計日誌等）
│   ├── cramschool/           # 補習班核心業務模組
│   │   ├── models.py         # 業務模型（學生、課程、費用等）
│   │   ├── api_views.py      # API 視圖集
│   │   ├── api_urls.py       # API 路由
│   │   ├── serializers.py    # 序列化器
│   │   └── views.py          # 傳統視圖（如有）
│   ├── config/               # Django 專案配置
│   │   ├── settings.py       # 設定檔
│   │   ├── urls.py           # 根 URL 配置
│   │   └── wsgi.py           # WSGI 配置
│   ├── templates/            # Django 模板
│   ├── media/                # 媒體檔案（上傳的圖片等）
│   └── db.sqlite3            # SQLite 資料庫（開發環境）
│
├── frontend/                  # Vue 前端
│   ├── src/
│   │   ├── components/       # Vue 組件
│   │   ├── views/            # 頁面視圖
│   │   ├── router/           # 路由配置
│   │   ├── services/         # API 服務
│   │   └── App.vue           # 根組件
│   ├── dist/                 # 建置輸出
│   └── package.json          # 前端依賴
│
└── docs/                     # 文檔（Markdown 文件）
    ├── API_DOCUMENTATION.md  # API 文件
    ├── PROJECT_STRUCTURE.md  # 本文件
    ├── JWT_SETUP.md          # JWT 設定說明
    ├── RBAC_SETUP.md         # RBAC 權限設定說明
    └── ...
```

---

## 模組說明

### 1. Account 模組（認證與用戶管理）

**功能**:
- 用戶認證（登入/登出）
- JWT Token 管理
- 用戶帳號管理（CRUD）
- 角色管理（Role）
- 權限管理（RolePermission）
- 操作審計日誌（AuditLog）

**主要模型**:
- `CustomUser`: 自定義用戶模型（繼承 AbstractUser）
- `Role`: 動態角色定義
- `RolePermission`: 角色權限關聯
- `AuditLog`: 操作記錄

**API 端點**:
- `/api/account/login/` - 登入
- `/api/account/logout/` - 登出
- `/api/account/users/` - 用戶管理
- `/api/account/roles/` - 角色管理
- `/api/account/role-permissions/` - 權限管理
- `/api/account/audit-logs/` - 審計日誌查看

---

### 2. Cramschool 模組（補習班核心業務）

#### 2.1 學生管理 (Student)

**功能**:
- 學生資料管理
- 自動創建用戶帳號
- 密碼重置
- 帳號狀態管理
- 學費狀態檢查與生成

**主要 API**:
- `/api/cramschool/students/` - 學生 CRUD
- `/api/cramschool/students/{id}/reset-password/` - 重置密碼
- `/api/cramschool/students/{id}/toggle-account-status/` - 切換帳號狀態
- `/api/cramschool/students/{id}/tuition_status/` - 學費狀態
- `/api/cramschool/students/{id}/generate_tuition/` - 生成學費

---

#### 2.2 老師管理 (Teacher)

**功能**:
- 老師資料管理
- 權限等級設定

**主要 API**:
- `/api/cramschool/teachers/` - 老師 CRUD

---

#### 2.3 課程管理 (Course)

**功能**:
- 課程資料管理
- 權限控制（學生只能看到自己報名的課程）

**主要 API**:
- `/api/cramschool/courses/` - 課程 CRUD

---

#### 2.4 報名管理 (StudentEnrollment & EnrollmentPeriod)

**功能**:
- 學生課程報名
- 上課期間管理（支援多個期間，如：1-3月、5-8月）

**主要 API**:
- `/api/cramschool/enrollments/` - 報名 CRUD
- `/api/cramschool/enrollment-periods/` - 期間 CRUD

**特性**:
- 創建報名時自動創建初始上課期間

---

#### 2.5 費用管理 (ExtraFee)

**功能**:
- 額外費用管理（學費、交通費、餐費、書籍費等）
- 繳費狀態追蹤

**費用類型**:
- `Tuition`: 學費
- `Transport`: 交通費
- `Meal`: 餐費
- `Book`: 書籍費
- `Other`: 其他

**主要 API**:
- `/api/cramschool/fees/` - 費用 CRUD

---

#### 2.6 上課記錄管理 (SessionRecord)

**功能**:
- 記錄每次上課的日期

**主要 API**:
- `/api/cramschool/sessions/` - 上課記錄 CRUD

---

#### 2.7 出席管理 (Attendance)

**功能**:
- 記錄學生出席狀態

**出席狀態**:
- `Present`: 出席
- `Absent`: 缺席
- `Late`: 遲到
- `Leave`: 請假

**主要 API**:
- `/api/cramschool/attendances/` - 出席記錄 CRUD

---

#### 2.8 請假管理 (Leave)

**功能**:
- 學生請假記錄
- 請假審核

**審核狀態**:
- `Pending`: 待審核
- `Approved`: 已批准
- `Rejected`: 已拒絕

**主要 API**:
- `/api/cramschool/leaves/` - 請假記錄 CRUD

---

#### 2.9 題庫管理 (QuestionBank, Subject, Hashtag, QuestionTag)

**功能**:
- 科目管理
- 題目管理（支援 Markdown + LaTeX）
- 標籤管理
- 題目與標籤關聯
- 章節搜尋

**主要 API**:
- `/api/cramschool/subjects/` - 科目 CRUD
- `/api/cramschool/questions/` - 題目 CRUD
- `/api/cramschool/questions/search_chapters/` - 章節搜尋
- `/api/cramschool/hashtags/` - 標籤 CRUD
- `/api/cramschool/question-tags/` - 關聯 CRUD

**特殊功能**:
- 圖片上傳：`/api/cramschool/upload-image/`
- 章節模糊搜尋（按相關性排序）

---

#### 2.10 學生作答記錄 (StudentAnswer)

**功能**:
- 記錄學生作答情況
- 支援考卷掃描檔上傳

**主要 API**:
- `/api/cramschool/student-answers/` - 作答記錄 CRUD

---

#### 2.11 錯題本 (ErrorLog)

**功能**:
- 記錄學生錯題
- 掌握狀態追蹤

**掌握狀態**:
- `New`: 新錯題
- `Reviewing`: 複習中
- `Mastered`: 已掌握

**主要 API**:
- `/api/cramschool/error-logs/` - 錯題記錄 CRUD

---

#### 2.12 團購管理 (Restaurant, GroupOrder, Order, OrderItem)

**功能**:
- 店家管理
- 團購創建與管理
- 訂單管理
- 自動生成費用記錄

**主要 API**:
- `/api/cramschool/restaurants/` - 店家 CRUD
- `/api/cramschool/group-orders/` - 團購 CRUD
- `/api/cramschool/group-orders/{id}/complete/` - 完成團購（自動生成費用）
- `/api/cramschool/orders/` - 訂單 CRUD
- `/api/cramschool/order-items/` - 訂單項目 CRUD

**特性**:
- 創建團購時自動生成唯一連結
- 完成團購時自動為每個訂單生成費用記錄
- 訂單項目增刪改時自動更新訂單總金額

---

## 技術架構

### 後端技術棧

- **框架**: Django 5.2.7
- **API 框架**: Django REST Framework
- **認證**: JWT (djangorestframework-simplejwt)
- **CORS**: django-cors-headers
- **資料庫**: SQLite（開發）/ PostgreSQL（生產建議）

### 前端技術棧

- **框架**: Vue 3 (Composition API)
- **建置工具**: Vite
- **路由**: Vue Router
- **樣式**: Tailwind CSS
- **HTTP 客戶端**: Axios

---

## 認證與權限

### JWT Token

- **Access Token**: 有效期 1 小時
- **Refresh Token**: 有效期 7 天
- **Token 刷新**: `/api/account/token/refresh/`

### 角色系統

1. **靜態角色** (UserRole):
   - `ADMIN`: 系統管理員
   - `TEACHER`: 老師
   - `STUDENT`: 學生

2. **動態角色** (Role):
   - 管理員可創建自定義角色
   - 每個角色可設定具體的頁面和 API 權限

### 權限檢查

- 目前大部分 API 設定為 `AllowAny`（開發階段）
- 生產環境需要改為適當的權限控制
- 建議使用 `IsAuthenticated` + 角色檢查

---

## 資料模型關聯圖

```
CustomUser (1) ──┬─── (1) Student
                 ├─── (0..1) Role (custom_role)
                 └─── (1..*) AuditLog

Student (1) ──── (0..*) StudentEnrollment ──── (1) Course ──── (1) Teacher
              │
              ├─── (0..*) EnrollmentPeriod
              ├─── (0..*) ExtraFee
              ├─── (0..*) Attendance
              ├─── (0..*) Leave
              ├─── (0..*) StudentAnswer ──── (1) QuestionBank
              ├─── (0..*) ErrorLog ──── (1) QuestionBank
              └─── (0..*) Order ──── (1) GroupOrder ──── (1) Restaurant

QuestionBank (1) ──── (1) Subject
            │
            └─── (0..*) QuestionTag ──── (1) Hashtag ──── (0..1) Teacher

Order (1) ──── (0..*) OrderItem
```

---

## 開發環境設定

### 後端

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

### 環境變數

建議使用 `.env` 檔案管理環境變數（需要安裝 `python-decouple` 或 `django-environ`）：
- `SECRET_KEY`
- `DEBUG`
- `DATABASE_URL`
- `CORS_ALLOWED_ORIGINS`

---

## 部署建議

### 安全性

1. 修改 `SECRET_KEY`（使用環境變數）
2. 設定 `DEBUG = False`
3. 配置 `ALLOWED_HOSTS`
4. 設定 `CORS_ALLOW_ALL_ORIGINS = False`
5. 修改 API 權限為 `IsAuthenticated`
6. 使用 HTTPS
7. 設定安全的 Session Cookie

### 資料庫

- 開發環境：SQLite
- 生產環境：建議使用 PostgreSQL 或 MySQL

### 靜態檔案

- 使用 `collectstatic` 收集靜態檔案
- 配置 Nginx 或 AWS S3 服務靜態檔案

### 媒體檔案

- 使用雲端儲存服務（AWS S3, Google Cloud Storage 等）
- 或配置 Nginx 服務媒體檔案

---

## API 設計原則

1. **RESTful**: 遵循 REST 設計原則
2. **版本控制**: 建議引入 API 版本（如 `/api/v1/`）
3. **分頁**: 列表 API 應支援分頁
4. **過濾與搜尋**: 提供靈活的查詢參數
5. **錯誤處理**: 統一的錯誤回應格式
6. **文檔**: 完整的 API 文檔（建議使用 Swagger/OpenAPI）

---

## 測試

### 後端測試

```bash
python manage.py test
```

### 前端測試

建議使用：
- Vitest (單元測試)
- Cypress (E2E 測試)

---

## 相關文檔

- [API 文件](./API_DOCUMENTATION.md) - 完整的 API 端點文檔
- [JWT 設定](./JWT_SETUP.md) - JWT 認證設定說明
- [RBAC 設定](./RBAC_SETUP.md) - 角色權限設定說明
- [學生帳號設定](./STUDENT_ACCOUNT_SETUP.md) - 學生帳號創建流程
- [登入設定](./LOGIN_SETUP.md) - 登入功能說明
- [遷移指南](./MIGRATION_GUIDE.md) - 資料庫遷移說明

---

## 待改進事項

請參考 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) 和 TODO list 中的建議項目。

