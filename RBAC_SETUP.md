# RBAC 權限管理系統設置指南

## 概述

本系統實現了基於角色的訪問控制（RBAC），允許管理員：
- 創建自定義角色
- 為每個角色設定可訪問的頁面和 API
- 查看所有操作記錄
- 管理用戶的角色分配

## 後端設置

### 1. 創建數據庫遷移

在後端目錄下運行以下命令來創建數據庫遷移：

```bash
cd backend
python manage.py makemigrations account
python manage.py migrate
```

### 2. 創建初始管理員角色（可選）

如果需要創建一個預設的管理員角色，可以在 Django shell 中執行：

```python
python manage.py shell
```

然後執行：

```python
from account.models import Role, RolePermission

# 創建管理員角色（可選，因為 ADMIN 角色已經有所有權限）
admin_role = Role.objects.create(
    name='系統管理員',
    description='擁有所有權限的管理員角色',
    is_active=True
)
```

### 3. 為用戶分配角色

在 Django admin 或通過 API 為用戶分配自定義角色：

```python
from account.models import Role, CustomUser

# 獲取角色
role = Role.objects.get(name='會計')

# 為用戶分配角色
user = CustomUser.objects.get(username='accountant')
user.custom_role = role
user.save()
```

## 前端設置

### 1. 用戶認證

確保前端有適當的用戶認證機制。用戶信息應該存儲在 `localStorage` 中，格式如下：

```javascript
{
  id: 1,
  username: 'admin',
  role: 'ADMIN',  // 或 'TEACHER', 'STUDENT'
  custom_role: 1,  // 自定義角色 ID（可選）
  // ... 其他用戶信息
}
```

### 2. 頁面訪問控制

系統會自動根據用戶的角色和權限控制頁面訪問：
- **管理員（ADMIN）**：可以訪問所有頁面
- **其他角色**：只能訪問被授予權限的頁面

### 3. API 權限控制

API 權限檢查可以通過兩種方式實現：
1. **中間件自動檢查**（可選）：在 `settings.py` 中啟用 `PermissionCheckMiddleware`
2. **手動檢查**：在視圖中使用 `@require_api_permission` 裝飾器

## 使用指南

### 1. 創建新角色

1. 登入系統（需要管理員權限）
2. 導航到「角色管理」頁面
3. 點擊「新增角色」
4. 填寫角色名稱和描述
5. 點擊「儲存」

### 2. 設定角色權限

1. 在角色列表中，點擊角色的「權限」按鈕
2. 選擇「頁面權限」或「API 權限」標籤
3. 勾選該角色可以訪問的頁面或 API
4. 點擊「儲存權限」

### 3. 為用戶分配角色

可以通過以下方式為用戶分配角色：

**方式一：通過 Django Admin**
1. 登入 Django Admin
2. 找到要修改的用戶
3. 選擇「自訂角色」
4. 保存

**方式二：通過 API**
```javascript
import { userAPI } from './services/api'

await userAPI.update(userId, {
  custom_role: roleId
})
```

### 4. 查看操作記錄

1. 登入系統（需要管理員權限）
2. 導航到「操作記錄」頁面
3. 使用過濾器查看特定類型的操作記錄
4. 可以按操作類型、資源類型、用戶等進行過濾

## API 端點

### 角色管理

- `GET /api/account/roles/` - 獲取所有角色
- `POST /api/account/roles/` - 創建新角色
- `GET /api/account/roles/{id}/` - 獲取單個角色
- `PUT /api/account/roles/{id}/` - 更新角色
- `DELETE /api/account/roles/{id}/` - 刪除角色
- `POST /api/account/roles/{id}/permissions/` - 批量更新角色權限

### 角色權限

- `GET /api/account/role-permissions/` - 獲取所有權限
- `GET /api/account/role-permissions/?role={roleId}` - 獲取特定角色的權限
- `POST /api/account/role-permissions/` - 創建權限
- `PUT /api/account/role-permissions/{id}/` - 更新權限
- `DELETE /api/account/role-permissions/{id}/` - 刪除權限

### 操作記錄

- `GET /api/account/audit-logs/` - 獲取所有操作記錄
- `GET /api/account/audit-logs/?action_type={type}` - 按操作類型過濾
- `GET /api/account/audit-logs/?resource_type={type}` - 按資源類型過濾
- `GET /api/account/audit-logs/?user={userId}` - 按用戶過濾
- `GET /api/account/audit-logs/?role={roleId}` - 按角色過濾

## 權限類型

### 頁面權限

頁面權限控制用戶可以訪問哪些前端頁面。可用的頁面包括：
- `/` - 儀表板
- `/students` - 學生資訊
- `/teachers` - 老師管理
- `/courses` - 課程管理
- `/enrollments` - 課程報名
- `/attendance` - 出缺勤
- `/questions` - 題庫系統
- `/lunch-orders` - 訂便當系統

### API 權限

API 權限控制用戶可以調用哪些後端 API。格式為：
- 路徑：例如 `/api/cramschool/students/`
- 方法：`GET`, `POST`, `PUT`, `DELETE`

## 操作記錄

系統會自動記錄以下操作：
- 創建（POST）
- 更新（PUT, PATCH）
- 刪除（DELETE）

記錄包含以下信息：
- 操作時間
- 操作者（用戶）
- 角色
- 操作類型
- 資源類型和名稱
- IP 地址
- HTTP 狀態碼

## 注意事項

1. **管理員權限**：擁有 `ADMIN` 角色的用戶自動擁有所有權限，無需額外配置
2. **操作記錄**：只有管理員可以查看操作記錄
3. **權限檢查**：如果啟用了 `PermissionCheckMiddleware`，所有 API 請求都會自動檢查權限
4. **用戶角色**：用戶可以同時擁有系統角色（ADMIN/TEACHER/STUDENT）和自定義角色，自定義角色的權限會覆蓋系統角色的權限

## 故障排除

### 無法訪問頁面

1. 檢查用戶是否已登入
2. 檢查用戶的角色和權限設置
3. 檢查瀏覽器控制台是否有錯誤

### 無法查看操作記錄

1. 確認用戶是否為管理員（role === 'ADMIN'）
2. 檢查 API 是否返回 403 錯誤

### API 權限檢查失敗

1. 檢查用戶是否有對應的 API 權限
2. 檢查權限配置中的路徑和方法是否正確
3. 如果使用中間件，檢查 `settings.py` 中的配置

## 未來改進

- [ ] 添加 JWT Token 認證
- [ ] 實現更細粒度的權限控制（例如：只能查看自己的數據）
- [ ] 添加權限繼承機制
- [ ] 實現權限模板
- [ ] 添加操作記錄的導出功能

