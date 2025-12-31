#!/bin/bash

# 設置資料庫腳本：運行 Django migrations 創建表結構

set -e

echo "🚀 設置資料庫表結構..."

cd "$(dirname "$0")/.."

# 檢查 Docker PostgreSQL 是否運行
if ! docker ps | grep -q "9jang-postgres"; then
    echo "❌ PostgreSQL 容器未運行，請先啟動："
    echo "   ./scripts/start-postgres.sh"
    exit 1
fi

# 檢查 Django 虛擬環境
if [ ! -f "venv/bin/python" ]; then
    echo "❌ 找不到 Django 虛擬環境，請先設置："
    echo "   python -m venv venv"
    echo "   source venv/bin/activate"
    echo "   pip install -r backend/requirements.txt"
    exit 1
fi

echo "📋 當前資料庫配置："
echo "   主機: localhost"
echo "   端口: 5432"
echo "   數據庫: 9jang_db"
echo "   用戶名: postgres"
echo ""

# 檢查是否需要更新 Django .env
if ! grep -q "DATABASE_ENGINE=django.db.backends.postgresql" backend/.env 2>/dev/null; then
    echo "⚠️  需要更新 Django .env 以使用 PostgreSQL"
    echo ""
    echo "請在 backend/.env 中添加或更新以下配置："
    echo "DATABASE_ENGINE=django.db.backends.postgresql"
    echo "DATABASE_NAME=9jang_db"
    echo "DATABASE_USER=postgres"
    echo "DATABASE_PASSWORD=postgres"
    echo "DATABASE_HOST=localhost"
    echo "DATABASE_PORT=5432"
    echo ""
    read -p "是否已更新 .env 文件？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 請先更新 .env 文件後再運行此腳本"
        exit 1
    fi
fi

echo "⏳ 運行 Django migrations..."

# 使用虛擬環境中的 Python
./venv/bin/python backend/manage.py migrate

echo ""
echo "✅ 資料庫表結構已創建！"
echo ""
echo "📋 下一步："
echo "   1. 驗證表結構：pnpm test:db"
echo "   2. 初始化資料：pnpm seed:data"
echo ""
