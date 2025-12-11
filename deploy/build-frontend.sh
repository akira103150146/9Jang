#!/bin/bash
# 前端構建腳本

set -e

echo "開始構建前端..."

cd "$(dirname "$0")/../frontend"

# 安裝依賴（如果需要）
if [ ! -d "node_modules" ]; then
    echo "安裝前端依賴..."
    npm install
fi

# 構建生產版本
echo "構建生產版本..."
npm run build

echo "前端構建完成！輸出目錄: frontend/dist"

