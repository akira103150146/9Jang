#!/bin/bash
# Django 應用程式啟動腳本
# 在容器啟動時執行資料庫遷移和初始化命令

echo "=========================================="
echo "Django 應用程式啟動中..."
echo "=========================================="

# 等待資料庫連接（可選，如果使用 Cloud SQL）
# 這裡可以添加資料庫連接檢查邏輯
echo "[1/4] 檢查資料庫連接..."

# 執行資料庫遷移
echo "[2/4] 執行資料庫遷移..."
if ! python manage.py migrate --noinput; then
    echo "警告: 資料庫遷移失敗，但繼續執行..."
fi

# 初始化預設角色（如果不存在則創建）
echo "[3/4] 初始化預設角色..."
if ! python manage.py init_default_roles; then
    echo "警告: 初始化預設角色失敗，但繼續執行..."
fi

# 收集靜態文件
echo "[4/4] 收集靜態文件..."
if ! python manage.py collectstatic --noinput; then
    echo "警告: 收集靜態文件失敗，但繼續執行..."
fi

echo "=========================================="
echo "啟動應用程式..."
echo "=========================================="
exec "$@"

