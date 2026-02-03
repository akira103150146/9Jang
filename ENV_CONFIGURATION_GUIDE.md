# 環境變數配置指南

本專案已從 Django 遷移至 NestJS + Prisma 架構，環境變數配置已全面更新。

## 📋 更新摘要

### 主要變更

1. **移除 Django 相關配置**
   - ❌ `DJANGO_SECRET_KEY`
   - ❌ `DJANGO_DEBUG`
   - ❌ `DJANGO_ALLOWED_HOSTS`
   - ❌ `DATABASE_ENGINE` (Django ORM)
   - ❌ Django 媒體文件設定

2. **新增 NestJS + Prisma 配置**
   - ✅ `DATABASE_URL` (Prisma 連接字串)
   - ✅ `JWT_SECRET` (NestJS JWT)
   - ✅ `PORT` (NestJS 服務端口)
   - ✅ `NODE_ENV` (Node.js 環境)

3. **前端配置更新**
   - ✅ 後端 API URL 從 `8000` 改為 `3000`
   - ✅ 所有前端變數使用 `VITE_` 前綴
   - ✅ 新增應用版本和名稱配置

## 📂 配置檔案結構

```
/
├── .env.example              # 根目錄配置範例（開發時使用）
├── backend/.env.example      # 後端專用配置（NestJS）
└── frontend/.env.example     # 前端專用配置（Vue + Vite）
```

## 🚀 快速開始

### 1. 設置後端環境

```bash
cd backend
cp .env.example .env
```

編輯 `backend/.env`，至少修改以下配置：

```env
# 資料庫連接（必須）
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/9jang_db

# JWT 密鑰（必須修改！）
JWT_SECRET=your-secret-key-here-change-in-production
```

### 2. 設置前端環境

```bash
cd frontend
cp .env.example .env
```

編輯 `frontend/.env`，確認後端 URL：

```env
# 後端 API URL（根據實際情況調整）
VITE_API_BASE_URL=http://localhost:3000/api
VITE_BACKEND_URL=http://localhost:3000
```

### 3. 設置根目錄環境（可選）

```bash
cp .env.example .env
```

根目錄的 `.env` 可以用於統一管理開發環境的配置。

## 🔧 核心配置說明

### 後端配置 (backend/.env)

| 變數名稱 | 說明 | 預設值 | 必須 |
|---------|------|--------|------|
| `PORT` | NestJS 服務端口 | 3000 | ✅ |
| `NODE_ENV` | 環境模式 | development | ✅ |
| `DATABASE_URL` | Prisma 資料庫連接字串 | - | ✅ |
| `JWT_SECRET` | JWT 密鑰 | - | ✅ |
| `CORS_ORIGINS` | 允許的 CORS 來源 | localhost:5173 | ✅ |
| `MEDIA_ROOT` | 媒體檔案存儲路徑 | ./media | ❌ |

### 前端配置 (frontend/.env)

| 變數名稱 | 說明 | 預設值 | 必須 |
|---------|------|--------|------|
| `VITE_API_BASE_URL` | 後端 API URL | http://localhost:3000/api | ✅ |
| `VITE_BACKEND_URL` | 後端基礎 URL | http://localhost:3000 | ✅ |
| `VITE_FRONTEND_PORT` | 前端開發端口 | 5173 | ❌ |
| `VITE_FRONTEND_HOST` | 前端開發主機 | localhost | ❌ |

## 🔐 安全性建議

### JWT_SECRET 生成

使用以下命令生成安全的密鑰：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 生產環境檢查清單

- [ ] 更改 `JWT_SECRET` 為強密碼
- [ ] 設置 `NODE_ENV=production`
- [ ] 配置正確的 `DATABASE_URL`
- [ ] 限制 `CORS_ORIGINS` 為特定域名
- [ ] 確保 `.env` 檔案已加入 `.gitignore`

## 📊 資料庫配置

### PostgreSQL 本地開發

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/9jang_db
```

### PostgreSQL Cloud SQL (GCP)

使用 Unix Socket：
```env
DATABASE_URL=postgresql://user:password@/9jang_db?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
```

使用 TCP：
```env
DATABASE_URL=postgresql://user:password@INSTANCE_IP:5432/9jang_db
```

### SQLite (僅測試用)

```env
DATABASE_URL=file:./dev.db
```

## 🎯 端口配置對照表

| 服務 | 舊配置 (Django) | 新配置 (NestJS) |
|------|----------------|----------------|
| 後端 API | 8000 | 3000 |
| 前端開發伺服器 | 5173 | 5173 |
| PostgreSQL | 5432 | 5432 |

## 📝 遷移注意事項

### 前端 API 呼叫

前端代碼中的 API 呼叫已自動適配新的 URL 結構：

- 舊: `http://localhost:8000/api/...`
- 新: `http://localhost:3000/api/...`

前端使用 `VITE_API_BASE_URL` 環境變數，只需修改 `.env` 即可。

### CORS 設定

NestJS 的 CORS 設定在 `backend/src/main.ts` 中，會讀取 `CORS_ORIGINS` 環境變數。

### 媒體檔案

- 舊的 Django `media/` 目錄已移除
- 新的媒體檔案將存儲在 `backend/media/` 或雲端存儲

## 🐛 常見問題

### Q: 前端無法連接後端？

檢查 `frontend/.env` 中的 `VITE_API_BASE_URL` 是否正確。

### Q: JWT 認證失敗？

確保前後端使用相同的 `JWT_SECRET`。

### Q: 資料庫連接失敗？

1. 檢查 PostgreSQL 是否運行
2. 驗證 `DATABASE_URL` 格式是否正確
3. 測試資料庫連接：`cd backend && npm run test:db`

### Q: CORS 錯誤？

在 `backend/.env` 中添加前端 URL 到 `CORS_ORIGINS`。

## 📚 相關文件

- [Prisma 配置文檔](./backend/PRISMA_COMMANDS.md)
- [NestJS 官方文檔](https://docs.nestjs.com/)
- [Vite 環境變數文檔](https://vitejs.dev/guide/env-and-mode.html)

## 🔄 更新歷史

- **2026-02-02**: 完成 Django → NestJS 遷移，更新所有 `.env.example` 檔案
- 移除所有 Django 相關配置
- 新增 Prisma 和 NestJS 相關配置
- 統一前後端環境變數命名規範
