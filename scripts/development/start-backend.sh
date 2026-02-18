#!/bin/bash

echo "🚀 啟動 Backend (NestJS)..."
echo "========================================="
echo ""

if [ ! -f "package.json" ]; then
    echo "❌ 錯誤: 請在專案根目錄執行此腳本"
    exit 1
fi

WSL_IP=$(hostname -I | awk '{print $1}')
echo "📡 WSL IP: $WSL_IP"
echo ""

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
