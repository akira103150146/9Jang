#!/bin/bash
# 前端部署到 Cloud Storage 腳本

set -e

# 配置變數（請根據實際情況修改）
PROJECT_ID="${GCP_PROJECT_ID}"
BUCKET_NAME="${GCP_STORAGE_BUCKET:-${PROJECT_ID}-frontend}"
REGION="${GCP_REGION:-asia-east1}"

if [ -z "$PROJECT_ID" ]; then
    echo "錯誤: 請設置 GCP_PROJECT_ID 環境變數"
    exit 1
fi

echo "開始部署前端到 Cloud Storage..."
echo "專案 ID: $PROJECT_ID"
echo "Bucket: $BUCKET_NAME"
echo "地區: $REGION"

# 切換到專案根目錄
cd "$(dirname "$0")/.."

# 先構建前端
./deploy/build-frontend.sh

# 檢查 bucket 是否存在，不存在則創建
if ! gsutil ls -b "gs://${BUCKET_NAME}" &>/dev/null; then
    echo "創建 Cloud Storage bucket: $BUCKET_NAME"
    gsutil mb -l "$REGION" "gs://${BUCKET_NAME}"
    # 設置為靜態網站託管
    gsutil web set -m index.html -e index.html "gs://${BUCKET_NAME}"
    # 設置公開讀取權限
    gsutil iam ch allUsers:objectViewer "gs://${BUCKET_NAME}"
fi

# 上傳前端文件
echo "上傳前端文件到 Cloud Storage..."
gsutil -m rsync -r -d frontend/dist/ "gs://${BUCKET_NAME}/"

# 設置緩存策略
echo "設置緩存策略..."
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" "gs://${BUCKET_NAME}/*.html"
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" "gs://${BUCKET_NAME}/static/**"

echo "前端部署完成！"
echo "訪問 URL: https://storage.googleapis.com/${BUCKET_NAME}/index.html"

