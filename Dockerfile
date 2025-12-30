# 使用官方 Python 運行時作為基礎映像
FROM python:3.11-slim

# 設置工作目錄
WORKDIR /app

# 設置環境變數
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    postgresql-client \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 複製 requirements 文件並安裝 Python 依賴
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# 複製專案文件
COPY backend/ /app/

# 創建靜態文件目錄
RUN mkdir -p /app/staticfiles /app/media

# 設置權限
RUN chmod +x /app/manage.py /app/entrypoint.sh

# 暴露端口（Cloud Run 會自動設置 PORT 環境變數）
EXPOSE 8080

# 設置入口點
ENTRYPOINT ["/app/entrypoint.sh"]

# 啟動命令
# Cloud Run 會提供 PORT 環境變數，默認使用 8080
CMD exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120

