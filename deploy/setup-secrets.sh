#!/bin/bash
# 設置 Google Cloud Secret Manager 密鑰

set -e

# 配置變數
PROJECT_ID="${GCP_PROJECT_ID}"

if [ -z "$PROJECT_ID" ]; then
    echo "錯誤: 請設置 GCP_PROJECT_ID 環境變數"
    exit 1
fi

echo "設置 Google Cloud Secret Manager..."
echo "專案 ID: $PROJECT_ID"
echo ""

# 啟用 Secret Manager API
echo "啟用 Secret Manager API..."
gcloud services enable secretmanager.googleapis.com --project="$PROJECT_ID"

echo ""
echo "請使用以下命令創建 secrets："
echo ""
echo "# 1. 創建 Django Secret Key"
echo "echo -n 'your-secret-key-here' | gcloud secrets create django-secret-key \\"
echo "    --data-file=- \\"
echo "    --project=$PROJECT_ID"
echo ""
echo "# 2. 創建資料庫密碼"
echo "echo -n 'your-database-password' | gcloud secrets create database-password \\"
echo "    --data-file=- \\"
echo "    --project=$PROJECT_ID"
echo ""
echo "# 3. 創建資料庫用戶名（如果需要）"
echo "echo -n 'your-database-user' | gcloud secrets create database-user \\"
echo "    --data-file=- \\"
echo "    --project=$PROJECT_ID"
echo ""
echo "# 4. 創建資料庫名稱（如果需要）"
echo "echo -n 'your-database-name' | gcloud secrets create database-name \\"
echo "    --data-file=- \\"
echo "    --project=$PROJECT_ID"
echo ""
echo "# 授予 Cloud Run 服務帳戶訪問權限"
echo "PROJECT_NUMBER=\$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')"
echo "SERVICE_ACCOUNT=\$PROJECT_NUMBER-compute@developer.gserviceaccount.com"
echo ""
echo "gcloud secrets add-iam-policy-binding django-secret-key \\"
echo "    --member=\"serviceAccount:\$SERVICE_ACCOUNT\" \\"
echo "    --role=\"roles/secretmanager.secretAccessor\" \\"
echo "    --project=$PROJECT_ID"
echo ""
echo "gcloud secrets add-iam-policy-binding database-password \\"
echo "    --member=\"serviceAccount:\$SERVICE_ACCOUNT\" \\"
echo "    --role=\"roles/secretmanager.secretAccessor\" \\"
echo "    --project=$PROJECT_ID"
echo ""
echo "gcloud secrets add-iam-policy-binding database-user \\"
echo "    --member=\"serviceAccount:\$SERVICE_ACCOUNT\" \\"
echo "    --role=\"roles/secretmanager.secretAccessor\" \\"
echo "    --project=$PROJECT_ID"
echo ""
echo "gcloud secrets add-iam-policy-binding database-name \\"
echo "    --member=\"serviceAccount:\$SERVICE_ACCOUNT\" \\"
echo "    --role=\"roles/secretmanager.secretAccessor\" \\"
echo "    --project=$PROJECT_ID"
echo ""
echo "完成後，在 Cloud Run 環境變數中設置："
echo "USE_SECRET_MANAGER=True"
echo "GOOGLE_CLOUD_PROJECT=$PROJECT_ID"

