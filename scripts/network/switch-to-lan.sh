#!/bin/bash

echo "🌐 切換到區域網路模式..."
echo "========================================="

WINDOWS_IP="192.168.200.137"

echo "📡 設定資訊:"
echo "   Windows IP: $WINDOWS_IP"
echo "   WSL IP: $(hostname -I | awk '{print $1}')"
echo ""

if [ ! -f "frontend/.env.localhost" ]; then
    echo "📦 備份本機配置..."
    cp frontend/.env frontend/.env.localhost
fi

echo "🔧 修改 Frontend 配置..."
cd frontend
sed -i "s|VITE_API_BASE_URL=http://.*:3000/api|VITE_API_BASE_URL=http://${WINDOWS_IP}:3000/api|g" .env
sed -i "s|VITE_BACKEND_URL=http://.*:3000|VITE_BACKEND_URL=http://${WINDOWS_IP}:3000|g" .env
cd ..

echo ""
echo "✅ 已切換到區域網路模式"
echo ""
echo "📝 下一步:"
echo "   1. 在 Windows PowerShell (系統管理員) 中執行:"
echo "      .\wsl-port-forward.ps1"
echo ""
echo "   2. 重啟 Frontend 服務:"
echo "      按 Ctrl+C 停止當前的 Frontend"
echo "      ./scripts/development/start-frontend.sh"
echo ""
echo "   3. 學生訪問網址:"
echo "      http://${WINDOWS_IP}:5173"
echo ""
echo "========================================="
