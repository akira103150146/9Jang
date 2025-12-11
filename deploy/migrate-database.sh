#!/bin/bash
# 資料庫遷移腳本（需要在 Cloud SQL 實例上運行）

set -e

# 配置變數
PROJECT_ID="${GCP_PROJECT_ID}"
CLOUD_SQL_INSTANCE="${GCP_CLOUD_SQL_INSTANCE}"
DATABASE_NAME="${DATABASE_NAME:-postgres}"
DATABASE_USER="${DATABASE_USER:-postgres}"

if [ -z "$PROJECT_ID" ] || [ -z "$CLOUD_SQL_INSTANCE" ]; then
    echo "錯誤: 請設置 GCP_PROJECT_ID 和 GCP_CLOUD_SQL_INSTANCE 環境變數"
    exit 1
fi

echo "開始資料庫遷移..."
echo "專案 ID: $PROJECT_ID"
echo "Cloud SQL 實例: $CLOUD_SQL_INSTANCE"
echo "資料庫名稱: $DATABASE_NAME"

# 切換到專案根目錄
cd "$(dirname "$0")/.."

# 使用 Cloud SQL Proxy 連接到資料庫並運行遷移
echo "運行資料庫遷移..."

# 方法 1: 通過 Cloud SQL Proxy（推薦用於本地開發）
# 需要先啟動 Cloud SQL Proxy:
# cloud-sql-proxy ${PROJECT_ID}:${REGION}:${CLOUD_SQL_INSTANCE}

# 方法 2: 在 Cloud Run 服務器上直接運行（需要已經部署的服務）
# 這裡提供一個腳本，可以通過 gcloud 在 Cloud Run 服務上執行命令

# 方法 3: 使用 Cloud Build 運行遷移
echo "使用 Cloud Build 運行遷移..."

cat > /tmp/migrate-cloudbuild.yaml <<EOF
steps:
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'jobs'
      - 'create'
      - 'migrate-db'
      - '--image=gcr.io/${PROJECT_ID}/${GCP_SERVICE_NAME:-9jang-backend}'
      - '--region=${GCP_REGION:-asia-east1}'
      - '--command=python'
      - '--args=manage.py,migrate'
      - '--set-cloudsql-instances=${PROJECT_ID}:${GCP_REGION:-asia-east1}:${CLOUD_SQL_INSTANCE}'
      - '--set-env-vars=DJANGO_DEBUG=False'
      - '--max-retries=1'
      - '--memory=512Mi'
      - '--cpu=1'
      - '--timeout=600'
EOF

echo "注意: 建議手動在 Cloud Run 服務上執行以下命令來運行遷移："
echo "gcloud run jobs execute migrate-db --region=${GCP_REGION:-asia-east1} --project=${PROJECT_ID}"
echo ""
echo "或者通過 Cloud SQL Proxy 在本地運行："
echo "python backend/manage.py migrate"

