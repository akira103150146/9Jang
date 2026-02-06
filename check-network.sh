#!/bin/bash

# 網路配置檢查腳本

echo "🔍 9Jang 網路配置檢查"
echo "========================================="
echo ""

# 檢查 WSL IP
echo "📡 WSL 網路資訊:"
WSL_IP=$(hostname -I | awk '{print $1}')
echo "   WSL IP: $WSL_IP"
echo ""

# 檢查端口是否被佔用
echo "🔌 端口使用情況:"
if command -v netstat &> /dev/null; then
    BACKEND_PORT=$(netstat -tuln | grep ":3000 " || echo "未使用")
    FRONTEND_PORT=$(netstat -tuln | grep ":5173 " || echo "未使用")
    echo "   端口 3000 (Backend): $BACKEND_PORT"
    echo "   端口 5173 (Frontend): $FRONTEND_PORT"
else
    echo "   ⚠️  netstat 未安裝，無法檢查端口"
fi
echo ""

# 檢查服務是否運行
echo "🚀 服務狀態:"
if curl -s http://localhost:3000/api > /dev/null 2>&1; then
    echo "   ✅ Backend 正在運行 (http://localhost:3000)"
else
    echo "   ❌ Backend 未運行"
fi

if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "   ✅ Frontend 正在運行 (http://localhost:5173)"
else
    echo "   ❌ Frontend 未運行"
fi
echo ""

# 提供 Windows 檢查指令
echo "📝 Windows 端口轉發檢查:"
echo "   請在 Windows PowerShell 中執行:"
echo "   netsh interface portproxy show all"
echo ""

echo "🌐 訪問資訊:"
echo "   本機測試:"
echo "   - http://localhost:5173"
echo "   - http://localhost:3000/api/docs"
echo ""
echo "   ⚠️  學生訪問 (請替換為您的 Windows IP):"
echo "   - http://<Windows_IP>:5173"
echo ""
echo "   💡 在 Windows 中執行 'ipconfig' 查看 IP 地址"
echo ""

echo "========================================="
