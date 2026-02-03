#!/bin/bash

# Docker 快速啟動腳本
# 自動檢查環境並啟動 Docker Compose

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}九章補習班管理系統 - Docker 啟動腳本${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# 檢查 Docker
echo -e "${BLUE}步驟 1: 檢查 Docker 環境${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker 未安裝${NC}"
    echo "請先安裝 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓ Docker 已安裝: $(docker --version)${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose 未安裝${NC}"
    echo "請先安裝 Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose 已安裝: $(docker-compose --version)${NC}"

# 檢查 Docker 服務
if ! docker info &> /dev/null; then
    echo -e "${RED}✗ Docker 服務未運行${NC}"
    echo "請啟動 Docker 服務"
    exit 1
fi
echo -e "${GREEN}✓ Docker 服務正在運行${NC}"
echo ""

# 檢查 .env 文件
echo -e "${BLUE}步驟 2: 檢查環境變數配置${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env 文件不存在，正在創建...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ 已創建 .env 文件${NC}"
    echo -e "${YELLOW}請編輯 .env 文件並設置：${NC}"
    echo "  - POSTGRES_PASSWORD"
    echo "  - JWT_SECRET"
    echo ""
    read -p "按 Enter 繼續（使用預設配置）或 Ctrl+C 退出編輯配置... " -r
fi
echo -e "${GREEN}✓ .env 文件存在${NC}"
echo ""

# 選擇模式
echo -e "${BLUE}步驟 3: 選擇啟動模式${NC}"
echo "1) 開發模式（Development）- 支持熱重載"
echo "2) 生產模式（Production）- 優化性能"
echo "3) 僅資料庫（Database Only）"
echo "4) 開發模式 + 管理工具（pgAdmin）"
read -p "請選擇 [1-4, 預設: 1]: " mode
mode=${mode:-1}
echo ""

case $mode in
    1)
        echo -e "${GREEN}啟動開發模式...${NC}"
        COMPOSE_FILES="-f docker-compose.yml"
        ;;
    2)
        echo -e "${GREEN}啟動生產模式...${NC}"
        COMPOSE_FILES="-f docker-compose.yml -f docker-compose.prod.yml"
        ;;
    3)
        echo -e "${GREEN}僅啟動資料庫...${NC}"
        docker-compose up -d postgres
        echo ""
        echo -e "${GREEN}✓ PostgreSQL 已啟動${NC}"
        echo "連接資訊:"
        echo "  Host: localhost"
        echo "  Port: 5432"
        echo "  Database: 9jang_db"
        echo "  Username: postgres"
        exit 0
        ;;
    4)
        echo -e "${GREEN}啟動開發模式 + 管理工具...${NC}"
        COMPOSE_FILES="-f docker-compose.yml"
        PROFILES="--profile tools"
        ;;
    *)
        echo -e "${RED}無效的選擇${NC}"
        exit 1
        ;;
esac

# 檢查端口占用
echo -e "${BLUE}步驟 4: 檢查端口占用${NC}"
PORTS_TO_CHECK=(3000 5173 5432)
PORTS_BUSY=false

for port in "${PORTS_TO_CHECK[@]}"; do
    if ss -tln | grep -q ":$port "; then
        echo -e "${YELLOW}⚠ 端口 $port 已被占用${NC}"
        PORTS_BUSY=true
    else
        echo -e "${GREEN}✓ 端口 $port 可用${NC}"
    fi
done

if [ "$PORTS_BUSY" = true ]; then
    echo ""
    read -p "是否繼續？(y/n) [n]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo ""

# 構建並啟動服務
echo -e "${BLUE}步驟 5: 啟動服務${NC}"
echo "正在構建並啟動容器..."
docker-compose $COMPOSE_FILES $PROFILES up -d --build

echo ""
echo -e "${GREEN}✓ 容器已啟動${NC}"
echo ""

# 等待服務就緒
echo -e "${BLUE}步驟 6: 等待服務就緒${NC}"
echo "等待資料庫啟動..."
sleep 5

MAX_TRIES=30
TRIES=0
while ! docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; do
    TRIES=$((TRIES+1))
    if [ $TRIES -gt $MAX_TRIES ]; then
        echo -e "${RED}✗ 資料庫啟動超時${NC}"
        exit 1
    fi
    echo -n "."
    sleep 1
done
echo ""
echo -e "${GREEN}✓ 資料庫已就緒${NC}"
echo ""

# 初始化資料庫
echo -e "${BLUE}步驟 7: 初始化資料庫${NC}"
read -p "是否要初始化資料庫結構？(y/n) [y]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    echo "正在生成 Prisma Client..."
    docker-compose exec -T backend pnpm prisma:generate
    
    echo "正在推送 Schema 到資料庫..."
    docker-compose exec -T backend pnpm prisma:db:push
    
    echo -e "${GREEN}✓ 資料庫初始化完成${NC}"
fi
echo ""

# 顯示狀態
echo -e "${BLUE}步驟 8: 查看服務狀態${NC}"
docker-compose ps
echo ""

# 顯示訪問資訊
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}啟動完成！${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "服務訪問地址："
echo -e "  🌐 前端: ${BLUE}http://localhost:5173${NC}"
echo -e "  🔧 後端 API: ${BLUE}http://localhost:3000/api${NC}"
echo -e "  📊 資料庫: ${BLUE}localhost:5432${NC}"

if [ "$mode" = "4" ]; then
    echo -e "  🛠️  pgAdmin: ${BLUE}http://localhost:5050${NC}"
fi

echo ""
echo "常用命令："
echo "  查看日誌: docker-compose logs -f"
echo "  停止服務: docker-compose down"
echo "  重啟服務: docker-compose restart"
echo "  進入後端: docker-compose exec backend sh"
echo ""
echo -e "完整文檔請查看: ${BLUE}DOCKER_GUIDE.md${NC}"
echo ""
