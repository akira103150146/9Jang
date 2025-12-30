# GCP Cloud Run 部署指南

本指南將幫助您將 9Jang 專案部署到 Google Cloud Platform (GCP)。

## 部署架構

- **後端**: Django 應用容器化後部署到 Cloud Run
- **資料庫**: Cloud SQL PostgreSQL (db-f1-micro)
- **前端**: Vue.js 構建後部署到 Cloud Storage + Cloud CDN

## 前置準備

### 1. 安裝必要的工具

```bash
# 安裝 Google Cloud SDK
# macOS
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash

# 初始化並登入
gcloud init
gcloud auth login
```

### 2. 設置 GCP 專案

```bash
# 創建新專案（或使用現有專案）
gcloud projects create your-project-id --name="9Jang Project"

# 設置為當前專案
gcloud config set project your-project-id

# 啟用必要的 API
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    sqladmin.googleapis.com \
    storage-component.googleapis.com \
    storage-api.googleapis.com
```

### 3. 設置環境變數

在專案根目錄創建 `deploy/.env.production` 文件（參考 `deploy/.env.production.example`）：

```bash
cp deploy/.env.production.example deploy/.env.production
# 然後編輯並填入實際值
```

或在 shell 中設置：

```bash
export GCP_PROJECT_ID=your-project-id
export GCP_REGION=asia-east1
export GCP_SERVICE_NAME=9jang-backend
export GCP_STORAGE_BUCKET=your-project-id-frontend
export GCP_CLOUD_SQL_INSTANCE=9jang-db
```

## 部署步驟

### 步驟 1: 創建 Cloud SQL 實例

```bash
# 使用提供的腳本
chmod +x deploy/setup-cloud-sql.sh
export GCP_PROJECT_ID=your-project-id
export DATABASE_ROOT_PASSWORD=your-secure-password
./deploy/setup-cloud-sql.sh

# 或手動創建
gcloud sql instances create 9jang-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=asia-east1 \
    --root-password=your-secure-password
```

記錄下連接信息：
- 連接名稱: `project-id:region:instance-name`
- 資料庫名稱
- 用戶名稱和密碼

### 步驟 2: 準備環境變數

在 Cloud Run 部署時需要設置以下環境變數（可以在部署後通過控制台設置）：

```bash
# Django 配置
DJANGO_SECRET_KEY=<生成新的密鑰>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=*.run.app,yourdomain.com

# 資料庫配置
CLOUD_SQL_CONNECTION_NAME=project-id:region:instance-name
DATABASE_NAME=9jang_db
DATABASE_USER=9jang_user
DATABASE_PASSWORD=your-database-password

# CORS 配置
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=https://storage.googleapis.com

# 其他配置
SESSION_COOKIE_SECURE=True
```

生成 Django SECRET_KEY：

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 步驟 3: 部署後端到 Cloud Run

#### 方法 1: 使用部署腳本（推薦）

```bash
export GCP_PROJECT_ID=your-project-id
export GCP_SERVICE_NAME=9jang-backend
export GCP_REGION=asia-east1

./deploy/deploy-backend.sh
```

#### 方法 2: 使用 Cloud Build

```bash
gcloud builds submit --config cloudbuild.yaml \
    --substitutions _SERVICE_NAME=9jang-backend,_REGION=asia-east1,_CLOUD_SQL_CONNECTION_NAME=project-id:region:instance-name
```

#### 方法 3: 手動部署

```bash
# 構建映像
gcloud builds submit --tag gcr.io/your-project-id/9jang-backend

# 部署到 Cloud Run
gcloud run deploy 9jang-backend \
    --image gcr.io/your-project-id/9jang-backend \
    --platform managed \
    --region asia-east1 \
    --allow-unauthenticated \
    --set-cloudsql-instances project-id:region:instance-name \
    --set-env-vars "DJANGO_DEBUG=False,DATABASE_NAME=9jang_db,..." \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10
```

### 步驟 4: 運行資料庫遷移

### 步驟 4.5: 設置媒體文件 Cloud Storage（重要！）

**必須執行此步驟**，否則用戶上傳的圖片會在容器重啟後丟失。

```bash
# 設置環境變數
export GCP_PROJECT_ID=your-project-id
export GS_BUCKET_NAME=your-project-id-media  # 可選，默認為 project-id-media

# 運行設置腳本
./deploy/setup-media-storage.sh
```

或手動創建：

```bash
# 創建 bucket
gsutil mb -l asia-east1 gs://your-project-id-media

# 設置公開讀取權限
gsutil uniformbucketlevelaccess set on gs://your-project-id-media
gsutil defacl ch -u AllUsers:R gs://your-project-id-media
```

然後在 Cloud Run 環境變數中添加：
- `GS_BUCKET_NAME=your-project-id-media`
- `GS_PROJECT_ID=your-project-id`
- `MEDIA_URL=https://storage.googleapis.com/your-project-id-media/`

```bash
# 方法 1: 使用 Cloud SQL Proxy 在本地運行（推薦測試時）
# 先安裝 Cloud SQL Proxy
# 然後啟動代理：
cloud-sql-proxy project-id:region:instance-name

# 在另一個終端運行遷移
export DATABASE_HOST=127.0.0.1
export DATABASE_PORT=5432
export DATABASE_NAME=9jang_db
export DATABASE_USER=9jang_user
export DATABASE_PASSWORD=your-password
python backend/manage.py migrate

# 方法 2: 在 Cloud Run 服務器上運行
# 通過 Cloud Run Jobs（需要先創建 Job）
# 或通過臨時容器執行
```

### 步驟 5: 構建並部署前端

```bash
# 設置環境變數
export GCP_PROJECT_ID=your-project-id
export GCP_STORAGE_BUCKET=your-project-id-frontend

# 構建前端
./deploy/build-frontend.sh

# 部署到 Cloud Storage
./deploy/deploy-frontend.sh
```

### 步驟 6: 配置前端環境變數

在部署前端前，需要更新前端構建時的環境變數：

```bash
# 在 frontend/.env.production 中設置
VITE_API_BASE_URL=https://your-service-url.run.app/api
VITE_BACKEND_URL=https://your-service-url.run.app
```

然後重新構建和部署：

```bash
cd frontend
npm run build
cd ..
./deploy/deploy-frontend.sh
```

### 步驟 7: 配置自訂域名（可選）

#### 為 Cloud Run 服務配置域名

```bash
# 映射自訂域名到 Cloud Run
gcloud run domain-mappings create \
    --service 9jang-backend \
    --domain api.yourdomain.com \
    --region asia-east1
```

#### 為 Cloud Storage 配置域名

1. 在 Cloud Storage bucket 設置中啟用「網站託管」
2. 配置 Cloud CDN 和負載平衡器
3. 設置 DNS 記錄指向 GCP 負載平衡器

## 環境變數配置

### 使用 Secret Manager（推薦，生產環境）

**重要**: 敏感信息（如密鑰、密碼）應該存儲在 Google Cloud Secret Manager 中，而不是直接作為環境變數。

#### 設置 Secret Manager

```bash
# 運行設置腳本
export GCP_PROJECT_ID=your-project-id
./deploy/setup-secrets.sh

# 創建 secrets（使用腳本中顯示的命令）
# 1. Django Secret Key
echo -n 'your-secret-key-here' | gcloud secrets create django-secret-key \
    --data-file=- \
    --project=$PROJECT_ID

# 2. 資料庫密碼
echo -n 'your-database-password' | gcloud secrets create database-password \
    --data-file=- \
    --project=$PROJECT_ID

# 3. 資料庫用戶名（可選）
echo -n 'your-database-user' | gcloud secrets create database-user \
    --data-file=- \
    --project=$PROJECT_ID

# 4. 資料庫名稱（可選）
echo -n 'your-database-name' | gcloud secrets create database-name \
    --data-file=- \
    --project=$PROJECT_ID

# 授予 Cloud Run 服務帳戶訪問權限
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
SERVICE_ACCOUNT=$PROJECT_NUMBER-compute@developer.gserviceaccount.com

for secret in django-secret-key database-password database-user database-name; do
    gcloud secrets add-iam-policy-binding $secret \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="roles/secretmanager.secretAccessor" \
        --project=$PROJECT_ID
done
```

然後在 Cloud Run 環境變數中設置：
```
USE_SECRET_MANAGER=True
GOOGLE_CLOUD_PROJECT=your-project-id
```

應用會自動從 Secret Manager 讀取這些密鑰。

### Cloud Run 環境變數

如果**不使用** Secret Manager，在 Cloud Run 服務中設置以下環境變數（可通過控制台或命令行）：

```bash
# 核心配置
DJANGO_SECRET_KEY=<your-secret-key>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=*.run.app,yourdomain.com

# 資料庫配置
CLOUD_SQL_CONNECTION_NAME=project-id:region:instance-name
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=9jang_db
DATABASE_USER=9jang_user
DATABASE_PASSWORD=<your-password>

# CORS 配置
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=https://storage.googleapis.com,https://your-frontend-domain.com

# CSRF 配置
CSRF_TRUSTED_ORIGINS=https://your-frontend-domain.com

# Session 配置
SESSION_COOKIE_SECURE=True
SESSION_COOKIE_SAMESITE=Lax
SESSION_COOKIE_HTTPONLY=True

# JWT 配置
JWT_ACCESS_TOKEN_LIFETIME_HOURS=1
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# Cloud Storage 媒體文件配置（用於持久化存儲用戶上傳的圖片）
GS_BUCKET_NAME=your-project-id-media
GS_PROJECT_ID=your-project-id
MEDIA_URL=https://storage.googleapis.com/your-project-id-media/
```

**重要**: 必須設置 `GS_BUCKET_NAME` 才能讓用戶上傳的圖片持久化保存。否則圖片會存儲在臨時文件系統中，容器重啟後會丟失。

### 創建媒體文件 Cloud Storage Bucket

```bash
# 創建用於存儲媒體文件的 bucket
gsutil mb -l asia-east1 gs://your-project-id-media

# 設置公開讀取權限（用於訪問上傳的圖片）
gsutil iam ch allUsers:objectViewer gs://your-project-id-media

# 或使用更細粒度的權限控制（推薦）
# 設置 bucket 為統一分類存儲（Uniform bucket-level access）
gsutil uniformbucketlevelaccess set on gs://your-project-id-media

# 設置默認對象 ACL 為公開讀取
gsutil defacl ch -u AllUsers:R gs://your-project-id-media
```

### 更新環境變數

```bash
gcloud run services update 9jang-backend \
    --region asia-east1 \
    --update-env-vars "KEY=VALUE,KEY2=VALUE2"
```

## 維護和更新

### 更新後端

```bash
# 重新構建並部署
./deploy/deploy-backend.sh

# 或使用 Cloud Build
gcloud builds submit --tag gcr.io/your-project-id/9jang-backend
gcloud run deploy 9jang-backend --image gcr.io/your-project-id/9jang-backend --region asia-east1
```

### 更新前端

```bash
# 重新構建並部署
./deploy/deploy-frontend.sh
```

### 查看日誌

```bash
# Cloud Run 日誌
gcloud run services logs read 9jang-backend --region asia-east1

# 即時日誌
gcloud run services logs tail 9jang-backend --region asia-east1
```

### 資料庫備份

```bash
# 創建備份
gcloud sql backups create --instance=9jang-db

# 列出備份
gcloud sql backups list --instance=9jang-db

# 恢復備份
gcloud sql backups restore BACKUP_ID --backup-instance=9jang-db
```

## 成本估算

### 方案 A（本部署方案）

- **Cloud Run**: NT$500-1,000/月（根據流量）
  - 前 200 萬請求/月免費
  - CPU/記憶體: 按使用量計費
  - 無流量時: $0

- **Cloud SQL (db-f1-micro)**: NT$450/月
  - 共享 CPU，0.6GB RAM
  - 包含 10GB 儲存空間

- **Cloud Storage + CDN**: NT$100/月
  - 儲存: NT$0.02/GB/月
  - CDN: NT$0.12/GB（出口流量）

**總計: 約 NT$1,050-1,550/月**

### 免費額度

GCP 提供 $300 美元免費額度（90 天），涵蓋大部分試用需求。

## 故障排除

### 常見問題

#### 1. 資料庫連接失敗

- 檢查 `CLOUD_SQL_CONNECTION_NAME` 是否正確
- 確認 Cloud Run 服務已連接到 Cloud SQL 實例
- 檢查資料庫用戶權限

#### 2. 靜態文件 404

- 確認已運行 `python manage.py collectstatic`
- 檢查 WhiteNoise 中間件配置
- 確認 STATIC_ROOT 設置正確

#### 3. CORS 錯誤

- 檢查 `CORS_ALLOWED_ORIGINS` 是否包含前端域名
- 確認 `CORS_ALLOW_CREDENTIALS` 設置

#### 4. CSRF 錯誤

- 檢查 `CSRF_TRUSTED_ORIGINS` 配置
- 確認前端正確發送 CSRF token

### 獲取幫助

- [Cloud Run 文檔](https://cloud.google.com/run/docs)
- [Cloud SQL 文檔](https://cloud.google.com/sql/docs)
- [Cloud Storage 文檔](https://cloud.google.com/storage/docs)

## 安全建議

1. **永遠不要在代碼中硬編碼密鑰**
   - 使用 GCP Secret Manager 存儲敏感信息
   - 通過環境變數傳遞配置

2. **啟用 HTTPS**
   - Cloud Run 默認提供 HTTPS
   - 為自訂域名配置 SSL 憑證

3. **限制訪問**
   - 根據需要設置 Cloud Run 服務的訪問權限
   - 配置 Cloud SQL 的授權網絡

4. **定期更新依賴**
   - 定期檢查並更新 requirements.txt
   - 修補安全漏洞

5. **啟用監控和告警**
   - 設置 Cloud Monitoring
   - 配置錯誤告警

## 下一步

- [ ] 設置 CI/CD 管道（使用 Cloud Build）
- [ ] 配置自訂域名和 SSL
- [ ] 設置監控和告警
- [ ] 配置自動備份
- [ ] 優化性能（緩存、CDN 等）

