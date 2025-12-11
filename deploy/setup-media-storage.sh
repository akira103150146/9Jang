#!/bin/bash
# 設置 Cloud Storage 用於媒體文件存儲

set -e

# 配置變數
PROJECT_ID="${GCP_PROJECT_ID}"
BUCKET_NAME="${GS_BUCKET_NAME:-${PROJECT_ID}-media}"
REGION="${GCP_REGION:-asia-east1}"

if [ -z "$PROJECT_ID" ]; then
    echo "錯誤: 請設置 GCP_PROJECT_ID 環境變數"
    exit 1
fi

echo "設置 Cloud Storage 媒體文件存儲..."
echo "專案 ID: $PROJECT_ID"
echo "Bucket: $BUCKET_NAME"
echo "地區: $REGION"

# 檢查 bucket 是否存在
if gsutil ls -b "gs://${BUCKET_NAME}" &>/dev/null; then
    echo "Bucket $BUCKET_NAME 已存在"
else
    echo "創建 Cloud Storage bucket: $BUCKET_NAME"
    gsutil mb -l "$REGION" "gs://${BUCKET_NAME}"
fi

# 設置統一分類存儲（Uniform bucket-level access）
echo "設置統一分類存儲..."
gsutil uniformbucketlevelaccess set on "gs://${BUCKET_NAME}"

# 設置默認對象 ACL 為公開讀取（用於訪問上傳的圖片）
echo "設置公開讀取權限..."
gsutil defacl ch -u AllUsers:R "gs://${BUCKET_NAME}"

# 設置 CORS（如果需要從前端直接上傳）
echo "設置 CORS..."
cat > /tmp/cors.json <<EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
EOF
gsutil cors set /tmp/cors.json "gs://${BUCKET_NAME}"
rm /tmp/cors.json

echo ""
echo "=== Cloud Storage 設置完成 ==="
echo "Bucket 名稱: $BUCKET_NAME"
echo "公開 URL: https://storage.googleapis.com/${BUCKET_NAME}/"
echo ""
echo "請在 Cloud Run 環境變數中設置："
echo "GS_BUCKET_NAME=$BUCKET_NAME"
echo "GS_PROJECT_ID=$PROJECT_ID"
echo "MEDIA_URL=https://storage.googleapis.com/${BUCKET_NAME}/"

