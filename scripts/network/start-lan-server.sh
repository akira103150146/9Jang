#!/bin/bash

echo "🚀 9Jang 補習班管理系統 - 區域網路部署"
echo "========================================="
echo ""

WSL_IP=$(hostname -I | awk '{print $1}')
echo "📡 WSL IP 地址: $WSL_IP"
echo ""

echo "⚠️  請先在 Windows PowerShell (系統管理員) 中執行:"
echo "   .\wsl-port-forward.ps1"
echo ""
echo "按 Enter 繼續啟動應用程式..."
read

if [ ! -f "package.json" ]; then
    echo "❌ 錯誤: 請在專案根目錄執行此腳本"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ 錯誤: pnpm 未安裝"
    echo "請執行: npm install -g pnpm"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📦 正在安裝依賴..."
    pnpm install
fi

echo ""
echo "✅ 準備啟動服務..."
echo ""
echo "📝 訪問資訊:"
echo "   - 前端 (本機): http://localhost:5173"
echo "   - 後端 (本機): http://localhost:3000/api"
echo "   - Swagger 文檔: http://localhost:3000/api/docs"
echo ""
echo "   ⚠️  請在 Windows 中執行 ipconfig 查看您的 IP 地址"
echo "   學生訪問網址: http://<您的IP>:5173"
echo ""
echo "按 Ctrl+C 停止服務"
echo ""
echo "========================================="
echo ""

echo "💡 啟動方式:"
echo ""
echo "方法 1: 使用兩個終端機 (推薦)"
echo "   終端機 1: ./scripts/development/start-backend.sh"
echo "   終端機 2: ./scripts/development/start-frontend.sh"
echo ""
echo "方法 2: 手動啟動"
echo "   終端機 1: pnpm run dev:backend"
echo "   終端機 2: pnpm run dev"
echo ""
echo "方法 3: 使用 tmux (進階)"
echo "   tmux new -s 9jang"
echo "   # 在 tmux 中執行: pnpm run dev:backend"
echo "   # Ctrl+B 然後按 % 分割視窗"
echo "   # 在新窗格執行: pnpm run dev"
echo ""
echo "========================================="
