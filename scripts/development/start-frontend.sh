#!/bin/bash

echo "🚀 啟動 Frontend (Vite + Vue)..."
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

echo "✅ 啟動 Frontend 服務..."
echo "   本機: http://localhost:5173"
echo ""
echo "⚠️  學生訪問網址: http://<Windows_IP>:5173"
echo "   (請在 Windows 中執行 ipconfig 查看 IP)"
echo ""
echo "按 Ctrl+C 停止服務"
echo ""

pnpm run dev
