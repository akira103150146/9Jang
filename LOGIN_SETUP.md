# 登入系統設置指南

## 概述

本系統已實現完整的登入/登出功能，使用 Django Session 認證。

## 設置步驟

### 1. 創建預設管理員帳號

在後端目錄下運行以下命令：

```bash
cd backend
python manage.py create_admin
```

這會創建一個管理員帳號：
- **Email**: sunroad0418@gmail.com
- **Password**: mph586uut
- **角色**: ADMIN（系統管理員）

### 2. 運行數據庫遷移

如果還沒有運行過遷移，請執行：

```bash
python manage.py makemigrations account
python manage.py migrate
```

### 3. 啟動後端服務器

```bash
python manage.py runserver
```

### 4. 啟動前端開發服務器

在另一個終端：

```bash
cd frontend
npm run dev
```

## 使用說明

### 登入

1. 訪問 http://localhost:5173
2. 系統會自動跳轉到登入頁面（如果未登入）
3. 輸入管理員帳號：
   - Email: `sunroad0418@gmail.com`
   - Password: `mph586uut`
4. 點擊「登入」按鈕

### 登出

1. 點擊側邊欄底部的「登出」按鈕
2. 系統會清除 session 並跳轉到登入頁面

### 權限控制

- **管理員（ADMIN）**：可以訪問所有頁面，包括：
  - 角色管理
  - 操作記錄
  - 所有其他功能頁面

- **其他角色**：根據分配的權限訪問對應頁面

## API 端點

### 登入
- **URL**: `POST /api/account/login/`
- **Body**:
  ```json
  {
    "email": "sunroad0418@gmail.com",
    "password": "mph586uut"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": 1,
      "username": "sunroad0418",
      "email": "sunroad0418@gmail.com",
      "role": "ADMIN",
      "role_display": "系統管理員",
      ...
    },
    "message": "登入成功"
  }
  ```

### 登出
- **URL**: `POST /api/account/logout/`
- **需要認證**: 是
- **Response**:
  ```json
  {
    "message": "登出成功"
  }
  ```

### 獲取當前用戶
- **URL**: `GET /api/account/users/me/`
- **需要認證**: 是
- **Response**:
  ```json
  {
    "id": 1,
    "username": "sunroad0418",
    "email": "sunroad0418@gmail.com",
    "role": "ADMIN",
    ...
  }
  ```

## 路由守衛

系統會自動檢查：
1. **登入狀態**：未登入的用戶會被重定向到登入頁面
2. **管理員權限**：只有管理員可以訪問特定頁面（如角色管理、操作記錄）
3. **頁面權限**：根據用戶的角色權限過濾可訪問的頁面

## 故障排除

### 無法登入

1. **檢查後端服務器是否運行**
   ```bash
   # 確認後端在 http://localhost:8000 運行
   curl http://localhost:8000/api/account/login/
   ```

2. **檢查帳號是否存在**
   ```bash
   python manage.py shell
   ```
   ```python
   from account.models import CustomUser
   user = CustomUser.objects.filter(email='sunroad0418@gmail.com').first()
   print(user)
   ```

3. **重新創建管理員帳號**
   ```bash
   python manage.py create_admin
   ```

### Session 無效

1. **清除瀏覽器 cookies**
2. **檢查 CORS 設置**：確保 `CORS_ALLOW_CREDENTIALS = True`
3. **檢查前端 API 配置**：確保 `withCredentials: true`

### 登入後立即被登出

1. **檢查 session 設置**：確保 Django session 中間件已啟用
2. **檢查瀏覽器控制台**：查看是否有錯誤訊息
3. **檢查後端日誌**：查看是否有認證錯誤

## 安全注意事項

1. **生產環境**：
   - 修改預設管理員密碼
   - 設置 `CORS_ALLOW_ALL_ORIGINS = False`
   - 使用 HTTPS
   - 設置強密碼策略

2. **Session 安全**：
   - 設置 `SESSION_COOKIE_SECURE = True`（HTTPS 環境）
   - 設置 `SESSION_COOKIE_HTTPONLY = True`
   - 設置適當的 `SESSION_COOKIE_AGE`

3. **密碼安全**：
   - 使用強密碼
   - 定期更換密碼
   - 不要在代碼中硬編碼密碼

## 下一步

- [ ] 實現「記住我」功能
- [ ] 添加密碼重置功能
- [ ] 實現雙因素認證（2FA）
- [ ] 添加登入嘗試次數限制
- [ ] 實現 JWT Token 認證（可選）

