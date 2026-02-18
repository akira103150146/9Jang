#!/bin/bash

echo "🏠 切換回本機模式..."
echo "========================================="

if [ -f "frontend/.env.localhost" ]; then
    echo "📦 恢復本機配置..."
    cp frontend/.env.localhost frontend/.env
    echo "✅ 已恢復本機配置"
else
    echo "🔧 設定本機配置..."
    cd frontend
    sed -i 's|VITE_API_BASE_URL=http://.*:3000/api|VITE_API_BASE_URL=http://localhost:3000/api|g' .env
    sed -i 's|VITE_BACKEND_URL=http://.*:3000|VITE_BACKEND_URL=http://localhost:3000|g' .env
    cd ..
    echo "✅ 已設定本機配置"
fi

echo ""
echo "📝 下一步:"
echo "   重啟 Frontend 服務:"
echo "   按 Ctrl+C 停止當前的 Frontend"
echo "   ./scripts/development/start-frontend.sh"
echo ""
echo "   本機訪問網址:"
echo "   http://localhost:5173"
echo ""
echo "========================================="
