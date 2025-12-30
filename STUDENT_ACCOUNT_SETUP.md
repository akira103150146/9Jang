# 學生帳號自動註冊功能說明

## 概述

系統已實現自動為學生創建帳號的功能。當在學生資訊頁面新增學生資料時，系統會自動：
1. 為學生創建用戶帳號
2. 設置預設 RBAC 權限為「學生」
3. 生成預設用戶名和密碼

## 功能特點

### 1. 自動創建帳號

當創建新學生時：
- **用戶名格式**：`student_{學生ID}`（例如：`student_1`）
- **預設密碼**：6位數的學生ID（不足補0，例如：`000001`）
- **Email**：`student_{學生ID}@student.local`
- **角色**：自動設置為 `STUDENT`
- **狀態**：帳號自動啟用

### 2. 學生權限限制

學生登入後只能：
- 查看自己報名的課程
- 無法查看其他學生的課程
- 無法訪問管理功能

### 3. 管理員和老師權限

- **管理員**：可以看到所有課程和學生
- **老師**：可以看到所有課程和學生
- **學生**：只能看到自己報名的課程

## 數據庫遷移

### 運行遷移

在添加 `user` 欄位到 `Student` 模型後，需要運行數據庫遷移：

```bash
cd backend
python manage.py makemigrations cramschool
python manage.py migrate
```

### 遷移內容

遷移會添加：
- `Student.user` 欄位（一對一關聯到 `CustomUser`）
- 允許現有學生沒有關聯用戶（`null=True, blank=True`）

## 使用說明

### 創建新學生

1. **通過 API 創建**：
   ```bash
   POST /api/cramschool/students/
   {
     "name": "張三",
     "school": "XX國中",
     "grade": "三年級",
     "phone": "0912345678"
   }
   ```

2. **回應包含帳號信息**：
   ```json
   {
     "student_id": 1,
     "name": "張三",
     "school": "XX國中",
     "grade": "三年級",
     "phone": "0912345678",
     "username": "student_1",
     "user_email": "student_1@student.local",
     "user_account": {
       "username": "student_1",
       "password": "000001",
       "email": "student_1@student.local"
     }
   }
   ```

3. **重要**：`user_account.password` 只在創建時返回一次，請妥善保存或告知學生。

### 學生登入

學生可以使用創建時獲得的帳號信息登入：
- **用戶名**：`student_1`
- **密碼**：`000001`（6位數學生ID）

### 查看課程

學生登入後訪問課程列表：
- **URL**：`GET /api/cramschool/courses/`
- **結果**：只返回該學生報名的課程

管理員或老師訪問：
- **結果**：返回所有課程

## 前端整合

### 創建學生後顯示帳號信息

在前端創建學生後，可以顯示帳號信息給管理員：

```javascript
// 創建學生
const response = await studentAPI.create(studentData)

if (response.data.user_account) {
  alert(`學生帳號已創建：
    用戶名：${response.data.user_account.username}
    密碼：${response.data.user_account.password}
    請告知學生並建議首次登入後修改密碼`)
}
```

### 學生查看課程

學生登入後，課程列表會自動過濾：

```javascript
// 學生登入後
const courses = await courseAPI.getAll()
// 只會返回該學生報名的課程
```

## 安全建議

1. **密碼重置**：
   - 建議學生首次登入後修改密碼
   - 可以實現密碼重置功能

2. **帳號管理**：
   - 管理員可以查看所有學生的帳號信息
   - 可以重置學生密碼

3. **權限控制**：
   - 確保學生無法訪問管理功能
   - 確保學生只能看到自己的數據

## 故障排除

### 創建學生時帳號創建失敗

如果創建學生時帳號創建失敗：
- 學生記錄會被自動刪除（保持數據一致性）
- 檢查錯誤訊息
- 確認 `CustomUser` 模型配置正確

### 學生無法看到課程

如果學生登入後看不到課程：
1. 確認學生已報名課程（`StudentEnrollment` 記錄存在）
2. 確認報名記錄的 `is_active=True`
3. 確認學生的 `Student` 記錄與 `CustomUser` 正確關聯

### 現有學生沒有帳號

對於已存在的學生：
- 可以手動為他們創建帳號
- 或編寫腳本批量創建帳號

## 批量創建帳號腳本

如果需要為現有學生批量創建帳號，可以使用 Django shell：

```python
python manage.py shell

from cramschool.models import Student
from django.contrib.auth import get_user_model
from account.models import UserRole

CustomUser = get_user_model()

for student in Student.objects.filter(user__isnull=True):
    username = f"student_{student.student_id}"
    password = str(student.student_id).zfill(6)
    email = f"{username}@student.local"
    
    # 檢查用戶名是否已存在
    counter = 1
    while CustomUser.objects.filter(username=username).exists():
        username = f"student_{student.student_id}_{counter}"
        email = f"{username}@student.local"
        counter += 1
    
    user = CustomUser.objects.create_user(
        username=username,
        email=email,
        password=password,
        role=UserRole.STUDENT,
        first_name=student.name,
        is_active=True
    )
    
    student.user = user
    student.save()
    print(f"為 {student.name} 創建帳號: {username} / {password}")
```

## 已實現功能

### 1. 密碼重置功能 ✅

管理員可以為學生重置密碼：
- **API 端點**：`POST /api/cramschool/students/{id}/reset-password/`
- **權限**：僅管理員可用
- **功能**：重置密碼後，學生需要在下一次登入時修改密碼

### 2. 首次登入強制修改密碼 ✅

- **功能**：新創建的學生帳號在首次登入時必須修改密碼
- **實現方式**：
  - 創建學生帳號時，`must_change_password` 欄位自動設為 `True`
  - 登入時檢查 `must_change_password`，如果為 `True`，會彈出修改密碼模態框
  - 修改密碼後，`must_change_password` 自動設為 `False`

### 3. 帳號狀態管理（啟用/停用）✅

管理員可以管理學生帳號的啟用狀態：
- **API 端點**：`POST /api/cramschool/students/{id}/toggle-account-status/`
- **權限**：僅管理員可用
- **功能**：切換帳號的啟用/停用狀態
- **前端顯示**：在學生列表中顯示帳號狀態，管理員可以切換

## 使用說明

### 密碼重置

1. 在學生列表中，找到需要重置密碼的學生
2. 點擊「編輯」按鈕（在密碼欄位旁）
3. 輸入新密碼並點擊「儲存」
4. 系統會自動將 `must_change_password` 設為 `True`，學生下次登入時需要修改密碼

### 首次登入修改密碼

1. 學生使用初始密碼登入
2. 系統檢測到 `must_change_password=True`，自動彈出修改密碼模態框
3. 學生輸入新密碼（至少6位）並確認
4. 修改成功後，系統自動清除 `must_change_password` 標記

### 帳號狀態管理

1. 在學生列表中，找到需要管理的學生
2. 查看帳號狀態（啟用/停用）
3. 點擊「啟用」或「停用」按鈕切換狀態
4. 停用的帳號無法登入系統

## 前端功能

### 學生列表（管理員視圖）

管理員在學生列表中可以看到：
- **帳號欄位**：顯示學生的用戶名
- **密碼欄位**：
  - 預設隱藏（顯示為 `••••••`）
  - 點擊「顯示」可查看密碼
  - 點擊「編輯」可修改密碼
- **帳號狀態**：
  - 顯示「啟用」或「停用」標籤
  - 顯示「需修改密碼」標籤（如果 `must_change_password=True`）
  - 可以切換帳號狀態

### 修改密碼模態框

- **首次登入**：不顯示舊密碼欄位，自動使用當前登入密碼
- **一般修改**：需要輸入舊密碼和新密碼
- **驗證**：
  - 新密碼至少6位
  - 兩次輸入的新密碼必須一致

## 未來改進

- [ ] 實現批量創建帳號的管理界面
- [ ] 實現學生查看自己的成績和作業
- [ ] 添加密碼強度檢查
- [ ] 實現密碼過期提醒功能

