# 環境變數配置說明

本專案使用 `.env` 文件來管理配置，方便在不同環境（開發、測試、生產）之間切換。

## 快速開始

### 1. 複製環境變數範例文件

```bash
# 根目錄（共用配置）
cp .env.example .env

# 後端配置
cp backend/.env.example backend/.env

# 前端配置
cp frontend/.env.example frontend/.env
```

### 2. 編輯環境變數

根據您的實際環境編輯 `.env` 文件中的值。

## 環境變數說明

### 根目錄 `.env`（共用配置）

前後端共用的配置參數：

- `ENVIRONMENT`: 環境類型（development/production/staging）
- `BACKEND_URL`: 後端伺服器完整 URL
- `FRONTEND_URL`: 前端伺服器完整 URL

### 後端 `.env`（Django 配置）

#### 安全設定
- `DJANGO_SECRET_KEY`: Django 密鑰（**生產環境必須更改**）
- `DJANGO_DEBUG`: 是否開啟調試模式（True/False）
- `DJANGO_ALLOWED_HOSTS`: 允許的主機列表（逗號分隔）

#### 資料庫配置
- `DATABASE_ENGINE`: 資料庫引擎（sqlite3/postgresql/mysql）
- `DATABASE_NAME`: 資料庫名稱
- `DATABASE_USER`: 資料庫用戶名（PostgreSQL/MySQL）
- `DATABASE_PASSWORD`: 資料庫密碼（PostgreSQL/MySQL）
- `DATABASE_HOST`: 資料庫主機
- `DATABASE_PORT`: 資料庫端口

#### CORS 設定
- `CORS_ALLOW_ALL_ORIGINS`: 是否允許所有來源（True/False）
- `CORS_ALLOWED_ORIGINS`: 允許的來源列表（逗號分隔）

#### JWT 設定
- `JWT_ACCESS_TOKEN_LIFETIME_HOURS`: Access token 有效期（小時）
- `JWT_REFRESH_TOKEN_LIFETIME_DAYS`: Refresh token 有效期（天）

### 前端 `.env`（Vite 配置）

**注意**：Vite 環境變數必須以 `VITE_` 開頭才能在前端代碼中使用。

- `VITE_API_BASE_URL`: 後端 API 基礎 URL（例如：`http://localhost:8000/api`）
- `VITE_BACKEND_URL`: 後端基礎 URL（用於圖片等靜態資源，例如：`http://localhost:8000`）
- `VITE_FRONTEND_PORT`: 前端開發伺服器端口
- `VITE_FRONTEND_HOST`: 前端開發伺服器主機

## 開發環境配置範例

### 後端 `.env`
```env
ENVIRONMENT=development
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
BACKEND_URL=http://localhost:8000
CORS_ALLOW_ALL_ORIGINS=True
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 前端 `.env`
```env
VITE_ENVIRONMENT=development
VITE_API_BASE_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000
VITE_FRONTEND_PORT=5173
VITE_FRONTEND_HOST=localhost
```

## 生產環境配置範例

### 後端 `.env`
```env
ENVIRONMENT=production
DJANGO_SECRET_KEY=your-production-secret-key-here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
BACKEND_URL=https://api.yourdomain.com
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SESSION_COOKIE_SECURE=True
```

### 前端 `.env`
```env
VITE_ENVIRONMENT=production
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_BACKEND_URL=https://api.yourdomain.com
```

## 生成 Django SECRET_KEY

生產環境請使用以下命令生成新的 SECRET_KEY：

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## 注意事項

1. **不要將 `.env` 文件提交到 Git**：`.env` 文件已加入 `.gitignore`
2. **使用 `.env.example` 作為模板**：團隊成員可以根據 `.env.example` 創建自己的 `.env`
3. **生產環境安全**：
   - 必須更改 `DJANGO_SECRET_KEY`
   - 將 `DJANGO_DEBUG` 設為 `False`
   - 將 `SESSION_COOKIE_SECURE` 設為 `True`（使用 HTTPS）
   - 限制 `CORS_ALLOWED_ORIGINS` 和 `DJANGO_ALLOWED_HOSTS`

## 環境變數載入順序

後端會按以下順序載入環境變數（後面的會覆蓋前面的）：
1. 根目錄 `.env`
2. `backend/.env`
3. `config/.env`（如果存在）
4. 系統環境變數

前端會載入：
1. `frontend/.env`
2. `frontend/.env.local`（如果存在，不會被 Git 追蹤）
3. 系統環境變數

