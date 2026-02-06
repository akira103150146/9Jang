#!/bin/bash

# 啟動 Backend 服務

echo "🚀 啟動 Backend (NestJS)..."
echo "========================================="
echo ""

# 檢查是否在專案根目錄
if [ ! -f "package.json" ]; then
    echo "❌ 錯誤: 請在專案根目錄執行此腳本"
    exit 1
fi

# 獲取 WSL IP
WSL_IP=$(hostname -I | awk '{print $1}')
echo "📡 WSL IP: $WSL_IP"
echo ""

# 檢查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ 錯誤: pnpm 未安裝"
    exit 1
fi

echo "✅ 啟動 Backend 服務..."
echo "   本機: http://localhost:3000/api"
echo "   Swagger: http://localhost:3000/api/docs"
echo ""
echo "按 Ctrl+C 停止服務"
echo ""

pnpm run dev:backend
