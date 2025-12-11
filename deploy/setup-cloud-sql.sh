#!/bin/bash
# Cloud SQL 實例創建腳本

set -e

# 配置變數
PROJECT_ID="${GCP_PROJECT_ID}"
INSTANCE_NAME="${GCP_CLOUD_SQL_INSTANCE:-9jang-db}"
DATABASE_NAME="${DATABASE_NAME:-9jang_db}"
DATABASE_USER="${DATABASE_USER:-9jang_user}"
ROOT_PASSWORD="${DATABASE_ROOT_PASSWORD}"
REGION="${GCP_REGION:-asia-east1}"
TIER="${DB_TIER:-db-f1-micro}"

if [ -z "$PROJECT_ID" ]; then
    echo "錯誤: 請設置 GCP_PROJECT_ID 環境變數"
    exit 1
fi

if [ -z "$ROOT_PASSWORD" ]; then
    echo "警告: 未設置 DATABASE_ROOT_PASSWORD，將使用隨機密碼"
    ROOT_PASSWORD=$(openssl rand -base64 32)
    echo "生成的 root 密碼: $ROOT_PASSWORD"
fi

echo "創建 Cloud SQL 實例..."
echo "專案 ID: $PROJECT_ID"
echo "實例名稱: $INSTANCE_NAME"
echo "地區: $REGION"
echo "規格: $TIER"

# 創建 Cloud SQL PostgreSQL 實例
gcloud sql instances create "$INSTANCE_NAME" \
    --database-version=POSTGRES_15 \
    --tier="$TIER" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --root-password="$ROOT_PASSWORD"

echo "Cloud SQL 實例創建完成！"

# 創建資料庫
echo "創建資料庫: $DATABASE_NAME"
gcloud sql databases create "$DATABASE_NAME" \
    --instance="$INSTANCE_NAME" \
    --project="$PROJECT_ID"

# 創建用戶
echo "創建資料庫用戶: $DATABASE_USER"
if [ -z "$DATABASE_PASSWORD" ]; then
    DATABASE_PASSWORD=$(openssl rand -base64 32)
    echo "生成的用戶密碼: $DATABASE_PASSWORD"
fi

gcloud sql users create "$DATABASE_USER" \
    --instance="$INSTANCE_NAME" \
    --password="$DATABASE_PASSWORD" \
    --project="$PROJECT_ID"

echo ""
echo "=== Cloud SQL 設置完成 ==="
echo "實例名稱: $INSTANCE_NAME"
echo "資料庫名稱: $DATABASE_NAME"
echo "用戶名稱: $DATABASE_USER"
echo "用戶密碼: $DATABASE_PASSWORD"
echo ""
echo "連接名稱: ${PROJECT_ID}:${REGION}:${INSTANCE_NAME}"
echo ""
echo "請保存這些信息，並在 Cloud Run 環境變數中設置："
echo "CLOUD_SQL_CONNECTION_NAME=${PROJECT_ID}:${REGION}:${INSTANCE_NAME}"
echo "DATABASE_NAME=$DATABASE_NAME"
echo "DATABASE_USER=$DATABASE_USER"
echo "DATABASE_PASSWORD=$DATABASE_PASSWORD"

