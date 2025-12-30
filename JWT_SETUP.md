# JWT 認證設置指南

## 概述

系統已從 Session 認證改為 JWT（JSON Web Token）認證。JWT 認證更適合 API 服務，無需維護服務器端 session。

## 設置步驟

### 1. 安裝依賴

```bash
cd backend
pip install -r requirements.txt
```

這會安裝 `djangorestframework-simplejwt==5.3.1`。

### 2. 運行數據庫遷移

JWT token 黑名單需要數據庫表：

```bash
python manage.py migrate
```

### 3. 創建預設管理員帳號（如果還沒有）

```bash
python manage.py create_admin
```

### 4. 啟動服務器

```bash
# 後端
python manage.py runserver

# 前端（另一個終端）
cd frontend
npm run dev
```

## JWT Token 說明

### Token 類型

1. **Access Token**：
   - 有效期：1 小時
   - 用於 API 請求認證
   - 存儲在 `localStorage` 的 `access_token`

2. **Refresh Token**：
   - 有效期：7 天
   - 用於刷新 Access Token
   - 存儲在 `localStorage` 的 `refresh_token`

### Token 自動刷新

前端會自動處理 token 刷新：
- 當 Access Token 過期時，自動使用 Refresh Token 刷新
- 如果 Refresh Token 也過期，會自動跳轉到登入頁面

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
      ...
    },
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "message": "登入成功"
  }
  ```

### 登出
- **URL**: `POST /api/account/logout/`
- **需要認證**: 是（Bearer Token）
- **Body**:
  ```json
  {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
  ```
- **Response**:
  ```json
  {
    "message": "登出成功"
  }
  ```

### 刷新 Token
- **URL**: `POST /api/account/token/refresh/`
- **Body**:
  ```json
  {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
  ```
- **Response**:
  ```json
  {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
  ```

### 獲取當前用戶
- **URL**: `GET /api/account/users/me/`
- **需要認證**: 是（Bearer Token）
- **Headers**:
  ```
  Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
  ```
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

## 前端使用

### 自動 Token 管理

前端 API 服務會自動：
1. 在每個請求中添加 `Authorization: Bearer <token>` header
2. 當 Access Token 過期時自動刷新
3. 當 Refresh Token 也過期時清除 token 並跳轉到登入頁

### 手動管理 Token

如果需要手動管理 token：

```javascript
import { setTokens, clearTokens, getToken } from '../services/api'

// 保存 token
setTokens(accessToken, refreshToken)

// 獲取 token
const token = getToken()

// 清除 token
clearTokens()
```

## 配置選項

在 `backend/config/settings.py` 中可以調整 JWT 設置：

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),  # Access token 有效期
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),  # Refresh token 有效期
    'ROTATE_REFRESH_TOKENS': True,  # 刷新時輪換 refresh token
    'BLACKLIST_AFTER_ROTATION': True,  # 輪換後將舊 token 加入黑名單
    ...
}
```

## Token 黑名單

系統使用 token 黑名單來處理登出：
- 登出時，refresh token 會被加入黑名單
- 已加入黑名單的 token 無法再用於刷新
- 需要運行遷移來創建黑名單表

## 安全注意事項

1. **Token 存儲**：
   - 目前 token 存儲在 `localStorage`
   - 生產環境可以考慮使用 `httpOnly` cookies（需要額外配置）

2. **HTTPS**：
   - 生產環境必須使用 HTTPS
   - 設置 `SESSION_COOKIE_SECURE = True`（如果使用 cookies）

3. **Token 過期時間**：
   - Access Token：建議 1 小時或更短
   - Refresh Token：建議 7-30 天

4. **Token 輪換**：
   - 已啟用 `ROTATE_REFRESH_TOKENS`
   - 每次刷新時會生成新的 refresh token

## 故障排除

### Token 過期錯誤

如果遇到 token 過期錯誤：
1. 檢查 token 是否正確存儲在 `localStorage`
2. 檢查系統時間是否正確
3. 嘗試重新登入

### 無法刷新 Token

如果無法刷新 token：
1. 檢查 refresh token 是否過期
2. 檢查 refresh token 是否在黑名單中
3. 清除 `localStorage` 並重新登入

### 401 未授權錯誤

如果遇到 401 錯誤：
1. 檢查 `Authorization` header 是否正確設置
2. 檢查 token 格式是否正確（應該是 `Bearer <token>`）
3. 檢查 token 是否過期

## 從 Session 認證遷移

如果之前使用 Session 認證：
1. 清除瀏覽器的 cookies
2. 清除 `localStorage` 中的舊數據
3. 重新登入以獲取 JWT token

## 優勢

相比 Session 認證，JWT 認證的優勢：
1. **無狀態**：不需要服務器端存儲 session
2. **可擴展**：適合微服務架構
3. **跨域友好**：不需要處理 CSRF
4. **移動端友好**：適合移動應用

## 下一步

- [ ] 實現 token 刷新提示（在 token 即將過期時）
- [ ] 添加「記住我」功能（延長 refresh token 有效期）
- [ ] 實現多設備登入管理
- [ ] 添加 token 撤銷功能

