# Secret Manager 安全配置指南

## 檢查結果

### 之前的情況 ❌
- 所有敏感密鑰（SECRET_KEY、DATABASE_PASSWORD 等）都直接從環境變數讀取
- 密碼和密鑰可能暴露在 Cloud Run 環境變數中
- 不符合安全最佳實踐

### 現在的改進 ✅
- 已添加 Google Cloud Secret Manager 支持
- 優先從環境變數讀取，如果啟用了 Secret Manager，則自動從 Secret Manager 讀取
- 支持生產環境和開發環境的無縫切換

## 需要從 Secret Manager 讀取的敏感信息

以下敏感信息應該存儲在 Secret Manager 中：

1. **DJANGO_SECRET_KEY** (secret ID: `django-secret-key`)
   - Django 應用的密鑰，用於加密 session、CSRF token 等
   - **重要性**: ⚠️⚠️⚠️ 極高

2. **DATABASE_PASSWORD** (secret ID: `database-password`)
   - 資料庫連接密碼
   - **重要性**: ⚠️⚠️⚠️ 極高

3. **DATABASE_USER** (secret ID: `database-user`)
   - 資料庫用戶名
   - **重要性**: ⚠️ 中等（可選）

4. **DATABASE_NAME** (secret ID: `database-name`)
   - 資料庫名稱
   - **重要性**: ⚠️ 低（可選）

## 設置步驟

### 1. 啟用 Secret Manager API

```bash
gcloud services enable secretmanager.googleapis.com --project=your-project-id
```

或使用提供的腳本：

```bash
./deploy/setup-secrets.sh
```

### 2. 創建 Secrets

```bash
PROJECT_ID=your-project-id

# Django Secret Key
echo -n 'your-secret-key-here' | gcloud secrets create django-secret-key \
    --data-file=- \
    --project=$PROJECT_ID

# 資料庫密碼
echo -n 'your-database-password' | gcloud secrets create database-password \
    --data-file=- \
    --project=$PROJECT_ID

# 資料庫用戶（可選）
echo -n 'your-database-user' | gcloud secrets create database-user \
    --data-file=- \
    --project=$PROJECT_ID

# 資料庫名稱（可選）
echo -n 'your-database-name' | gcloud secrets create database-name \
    --data-file=- \
    --project=$PROJECT_ID
```

### 3. 授予 Cloud Run 訪問權限

```bash
PROJECT_ID=your-project-id
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
SERVICE_ACCOUNT=$PROJECT_NUMBER-compute@developer.gserviceaccount.com

for secret in django-secret-key database-password database-user database-name; do
    gcloud secrets add-iam-policy-binding $secret \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="roles/secretmanager.secretAccessor" \
        --project=$PROJECT_ID
done
```

### 4. 在 Cloud Run 中啟用 Secret Manager

在 Cloud Run 環境變數中設置：

```bash
USE_SECRET_MANAGER=True
GOOGLE_CLOUD_PROJECT=your-project-id
```

或者通過命令行：

```bash
gcloud run services update 9jang-backend \
    --region asia-east1 \
    --update-env-vars "USE_SECRET_MANAGER=True,GOOGLE_CLOUD_PROJECT=your-project-id"
```

## 工作原理

### 讀取優先級

1. **環境變數**（優先）
   - 如果環境變數已設置，直接使用環境變數的值
   
2. **Secret Manager**（如果啟用）
   - 如果環境變數未設置且 `USE_SECRET_MANAGER=True`
   - 自動從 Secret Manager 讀取對應的 secret

3. **默認值**（開發環境）
   - 如果以上都未設置，使用默認值（僅用於開發）

### 代碼實現

在 `backend/config/settings.py` 中：

```python
from .secret_manager import get_env_or_secret

# 優先從環境變數讀取，否則從 Secret Manager 讀取
SECRET_KEY = get_env_or_secret(
    'DJANGO_SECRET_KEY',
    secret_id='django-secret-key',
    default='...'  # 僅開發環境使用
)
```

## 開發環境 vs 生產環境

### 開發環境（本地）

```bash
# 不需要設置 USE_SECRET_MANAGER
# 使用 .env 文件或環境變數
DJANGO_SECRET_KEY=your-local-key
```

### 生產環境（Cloud Run）

```bash
# 啟用 Secret Manager
USE_SECRET_MANAGER=True
GOOGLE_CLOUD_PROJECT=your-project-id

# 敏感信息從 Secret Manager 自動讀取
# 不需要在環境變數中設置 DJANGO_SECRET_KEY 等
```

## 更新 Secrets

```bash
# 更新 secret 的值
echo -n 'new-secret-value' | gcloud secrets versions add django-secret-key \
    --data-file=- \
    --project=$PROJECT_ID

# Secret Manager 會自動使用最新版本
# 重新部署服務以載入新值
gcloud run services update 9jang-backend \
    --region asia-east1
```

## 查看 Secrets

```bash
# 列出所有 secrets
gcloud secrets list --project=your-project-id

# 查看 secret 的版本
gcloud secrets versions list django-secret-key --project=your-project-id

# 查看 secret 的值（需要權限）
gcloud secrets versions access latest --secret=django-secret-key --project=your-project-id
```

## 安全建議

1. **永遠不要在代碼中硬編碼密鑰**
   - 使用環境變數或 Secret Manager

2. **定期輪換密鑰**
   - 定期更新 Django SECRET_KEY 和資料庫密碼

3. **最小權限原則**
   - 只授予必要的服務帳戶訪問權限

4. **審計和監控**
   - 啟用 Secret Manager 的審計日誌
   - 監控異常訪問

5. **備份 Secrets**
   - 安全地備份重要的 secrets（加密存儲）

## 故障排除

### Secret Manager 讀取失敗

如果 Secret Manager 讀取失敗，應用會：
1. 記錄警告日誌
2. 使用默認值（如果提供）
3. 或拋出異常（如果未提供默認值）

檢查日誌：

```bash
gcloud run services logs read 9jang-backend --region asia-east1
```

### 權限問題

確保 Cloud Run 服務帳戶有 `roles/secretmanager.secretAccessor` 角色。

檢查權限：

```bash
gcloud secrets get-iam-policy django-secret-key --project=your-project-id
```

## 相關文件

- `backend/config/secret_manager.py` - Secret Manager 工具函數
- `backend/config/settings.py` - 使用 Secret Manager 的配置
- `deploy/setup-secrets.sh` - 設置腳本
- `GCP_DEPLOYMENT.md` - 完整部署指南

