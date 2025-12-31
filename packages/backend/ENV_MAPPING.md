# Django 到 NestJS 環境變數映射指南

本文檔說明如何將 Django 後端的環境變數轉換為 NestJS 後端的環境變數。

## 環境變數對照表

### 資料庫配置

| Django | NestJS (Prisma) | 說明 |
|--------|----------------|------|
| `DATABASE_ENGINE` | - | Prisma 自動檢測資料庫類型 |
| `DATABASE_NAME` | `DATABASE_URL` | 需要構建完整的連接字符串 |
| `DATABASE_USER` | `DATABASE_URL` | 包含在連接字符串中 |
| `DATABASE_PASSWORD` | `DATABASE_URL` | 包含在連接字符串中 |
| `DATABASE_HOST` | `DATABASE_URL` | 包含在連接字符串中 |
| `DATABASE_PORT` | `DATABASE_URL` | 包含在連接字符串中 |
| `CLOUD_SQL_CONNECTION_NAME` | `DATABASE_URL` | 使用 Unix Socket 格式 |

**轉換範例：**

```bash
# Django
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=9jang_db
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# NestJS (Prisma)
DATABASE_URL=postgresql://postgres:password@localhost:5432/9jang_db
```

**SQLite 範例：**

```bash
# Django
DATABASE_ENGINE=django.db.backends.sqlite3
DATABASE_NAME=db.sqlite3

# NestJS (Prisma)
DATABASE_URL=file:./db.sqlite3
```

**Cloud SQL (Unix Socket) 範例：**

```bash
# Django
CLOUD_SQL_CONNECTION_NAME=project:region:instance
DATABASE_NAME=9jang_db
DATABASE_USER=postgres
DATABASE_PASSWORD=password

# NestJS (Prisma)
DATABASE_URL=postgresql://postgres:password@/9jang_db?host=/cloudsql/project:region:instance
```

### JWT 認證配置

| Django | NestJS | 說明 |
|--------|--------|------|
| `DJANGO_SECRET_KEY` | `JWT_SECRET` | **必須使用相同的值**以保持 JWT token 兼容 |
| `JWT_ACCESS_TOKEN_LIFETIME_HOURS` | `JWT_ACCESS_TOKEN_LIFETIME_HOURS` | 相同 |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | 相同 |
| `JWT_ROTATE_REFRESH_TOKENS` | - | NestJS 目前不支援（可選實現） |
| `JWT_BLACKLIST_AFTER_ROTATION` | - | NestJS 目前不支援（可選實現） |

### CORS 配置

| Django | NestJS | 說明 |
|--------|--------|------|
| `CORS_ALLOW_ALL_ORIGINS` | - | 在開發環境（`NODE_ENV != production`）下，如果未設置 `CORS_ORIGINS`，則自動允許所有來源 |
| `CORS_ALLOWED_ORIGINS` | `CORS_ORIGINS` | 格式相同（逗號分隔），例如：`http://localhost:5173,http://172.18.69.55:5173` |

**注意：**
- 開發環境：如果未設置 `CORS_ORIGINS`，將自動允許所有來源（方便 WSL/遠程開發）
- 生產環境：必須明確設置 `CORS_ORIGINS`，否則只允許 `http://localhost:5173`

### 應用配置

| Django | NestJS | 說明 |
|--------|--------|------|
| `PORT` (默認 8080) | `PORT` (默認 3000) | NestJS 使用不同的默認端口 |
| `DJANGO_DEBUG` | `NODE_ENV` | `NODE_ENV=development` 對應 `DEBUG=True` |
| `DJANGO_ALLOWED_HOSTS` | - | NestJS 不需要（由 CORS 處理） |
| - | `BASE_URL` | NestJS 專用，用於生成媒體文件 URL |

### 媒體文件配置

| Django | NestJS | 說明 |
|--------|--------|------|
| `MEDIA_ROOT` | `MEDIA_ROOT` | 相同 |
| `MEDIA_URL` | `MEDIA_URL` | 相同 |
| `GS_BUCKET_NAME` | `GS_BUCKET_NAME` | 可選，用於 GCP Cloud Storage |
| `GS_PROJECT_ID` | `GS_PROJECT_ID` | 可選，用於 GCP Cloud Storage |

### 其他配置

| Django | NestJS | 說明 |
|--------|--------|------|
| `TIME_ZONE` | `TIME_ZONE` | 相同（可選） |
| `LANGUAGE_CODE` | `LANGUAGE_CODE` | 相同（可選） |
| `CSRF_TRUSTED_ORIGINS` | - | NestJS 不需要（由 CORS 處理） |
| `SESSION_*` | - | NestJS 使用 JWT，不需要 session |

## 重要注意事項

### 1. JWT Secret 必須一致

**非常重要**：`JWT_SECRET` 必須與 Django 的 `DJANGO_SECRET_KEY` 使用相同的值，這樣：
- 前端可以同時使用兩個後端（遷移期間）
- JWT token 可以在兩個後端之間共享
- 用戶無需重新登入

### 2. 資料庫連接字符串格式

Prisma 使用標準的 PostgreSQL 連接字符串格式：
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

### 3. 端口差異

- Django 默認端口：`8000`
- NestJS 默認端口：`3000`

確保前端配置正確的 API 端點。

### 4. 環境變數優先級

NestJS 使用 `@nestjs/config`，會自動從以下位置讀取環境變數：
1. `.env` 文件（項目根目錄）
2. 系統環境變數
3. 默認值（在代碼中定義）

## 快速轉換腳本

如果需要批量轉換，可以使用以下 Python 腳本：

```python
import os
from urllib.parse import quote_plus

def convert_django_to_nestjs_env():
    """將 Django 環境變數轉換為 NestJS 格式"""
    
    # 讀取 Django .env
    django_env = {}
    if os.path.exists('backend/.env'):
        with open('backend/.env', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    django_env[key.strip()] = value.strip()
    
    # 構建 NestJS .env
    nestjs_env = {}
    
    # 資料庫 URL
    if django_env.get('DATABASE_ENGINE') == 'django.db.backends.postgresql':
        user = django_env.get('DATABASE_USER', 'postgres')
        password = django_env.get('DATABASE_PASSWORD', '')
        host = django_env.get('DATABASE_HOST', 'localhost')
        port = django_env.get('DATABASE_PORT', '5432')
        name = django_env.get('DATABASE_NAME', '')
        
        if django_env.get('CLOUD_SQL_CONNECTION_NAME'):
            # Cloud SQL Unix Socket
            conn_name = django_env['CLOUD_SQL_CONNECTION_NAME']
            nestjs_env['DATABASE_URL'] = f"postgresql://{user}:{quote_plus(password)}@/{name}?host=/cloudsql/{conn_name}"
        else:
            # 標準 PostgreSQL
            nestjs_env['DATABASE_URL'] = f"postgresql://{user}:{quote_plus(password)}@{host}:{port}/{name}"
    elif django_env.get('DATABASE_ENGINE') == 'django.db.backends.sqlite3':
        name = django_env.get('DATABASE_NAME', 'db.sqlite3')
        nestjs_env['DATABASE_URL'] = f"file:./{name}"
    
    # JWT 配置
    nestjs_env['JWT_SECRET'] = django_env.get('DJANGO_SECRET_KEY', '')
    nestjs_env['JWT_ACCESS_TOKEN_LIFETIME_HOURS'] = django_env.get('JWT_ACCESS_TOKEN_LIFETIME_HOURS', '1')
    nestjs_env['JWT_REFRESH_TOKEN_LIFETIME_DAYS'] = django_env.get('JWT_REFRESH_TOKEN_LIFETIME_DAYS', '7')
    
    # 應用配置
    nestjs_env['PORT'] = '3000'
    nestjs_env['NODE_ENV'] = 'development' if django_env.get('DJANGO_DEBUG', 'True') == 'True' else 'production'
    nestjs_env['BASE_URL'] = 'http://localhost:3000'
    
    # CORS
    nestjs_env['CORS_ORIGINS'] = django_env.get('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:3000')
    
    # 媒體文件
    nestjs_env['MEDIA_ROOT'] = django_env.get('MEDIA_ROOT', './media')
    nestjs_env['MEDIA_URL'] = django_env.get('MEDIA_URL', '/media/')
    
    # 輸出
    print("# NestJS 環境變數（從 Django 轉換）\n")
    for key, value in nestjs_env.items():
        print(f"{key}={value}")
    
    return nestjs_env

if __name__ == '__main__':
    convert_django_to_nestjs_env()
```

## 檢查清單

在設置 NestJS 後端環境變數時，請確認：

- [ ] `DATABASE_URL` 格式正確且可以連接
- [ ] `JWT_SECRET` 與 Django 的 `DJANGO_SECRET_KEY` 完全相同
- [ ] `CORS_ORIGINS` 包含所有前端域名
- [ ] `PORT` 設置為 3000（或與前端配置一致）
- [ ] `MEDIA_ROOT` 和 `MEDIA_URL` 與 Django 一致（如果共享媒體文件）
- [ ] 生產環境中 `NODE_ENV=production`
- [ ] 生產環境中 `JWT_SECRET` 已更改為強密鑰
