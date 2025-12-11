#!/bin/bash
# 後端部署到 Cloud Run 腳本

set -e

# 配置變數（請根據實際情況修改）
PROJECT_ID="${GCP_PROJECT_ID}"
SERVICE_NAME="${GCP_SERVICE_NAME:-9jang-backend}"
REGION="${GCP_REGION:-asia-east1}"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

if [ -z "$PROJECT_ID" ]; then
    echo "錯誤: 請設置 GCP_PROJECT_ID 環境變數"
    exit 1
fi

echo "開始部署後端到 Cloud Run..."
echo "專案 ID: $PROJECT_ID"
echo "服務名稱: $SERVICE_NAME"
echo "地區: $REGION"
echo "映像名稱: $IMAGE_NAME"

# 切換到專案根目錄
cd "$(dirname "$0")/.."

# 構建 Docker 映像
echo "構建 Docker 映像..."
gcloud builds submit --tag "$IMAGE_NAME" --project "$PROJECT_ID"

# 部署到 Cloud Run
echo "部署到 Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --image "$IMAGE_NAME" \
    --platform managed \
    --region "$REGION" \
    --allow-unauthenticated \
    --project "$PROJECT_ID" \
    --set-env-vars "DJANGO_DEBUG=False" \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 300

echo "後端部署完成！"

# 獲取服務 URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
    --platform managed \
    --region "$REGION" \
    --project "$PROJECT_ID" \
    --format 'value(status.url)')

echo "服務 URL: $SERVICE_URL"

