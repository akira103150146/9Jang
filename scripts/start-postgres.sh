#!/bin/bash

# 啟動 PostgreSQL Docker 容器

set -e

echo "🚀 啟動 PostgreSQL Docker 容器..."

cd "$(dirname "$0")/.."

# 檢查 Docker 是否運行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未運行，請先啟動 Docker"
    exit 1
fi

# 啟動 PostgreSQL
docker-compose up -d postgres

# 等待數據庫就緒
echo "⏳ 等待 PostgreSQL 就緒..."
timeout=30
counter=0
while ! docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ PostgreSQL 啟動超時"
        exit 1
    fi
    sleep 1
    counter=$((counter + 1))
done

echo "✅ PostgreSQL 已就緒"
echo ""
echo "📋 連接信息："
echo "   主機: localhost"
echo "   端口: 5432"
echo "   數據庫: 9jang_db"
echo "   用戶名: postgres"
echo "   密碼: postgres"
echo ""
echo "🔗 連接字符串:"
echo "   postgresql://postgres:postgres@localhost:5432/9jang_db"
echo ""
echo "💡 提示："
echo "   - 查看日誌: docker-compose logs -f postgres"
echo "   - 停止服務: docker-compose stop postgres"
echo "   - 連接到數據庫: docker-compose exec postgres psql -U postgres -d 9jang_db"
