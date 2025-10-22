# Makefile for Django Project

# ==============================================================================
# Development Tasks
# ==============================================================================
#創造虛擬伺服器
venv:
	python3 -m venv venv     # 使用內建的 venv 模組建立一個名為 'venv' 的虛擬環境
#啟動伺服器
venv-run:
	source venv/bin/activate
# 啟動開發伺服器
run:
	python manage.py runserver
#安裝django
install: 
	pip install django
#建立專案
start:
	django-admin startproject config .


# 執行資料庫遷移
migrate:
	python manage.py migrate

# 建立新的資料庫遷移檔案
makemigrations:
	python manage.py makemigrations

# 生成專案的依賴文件
generaterequirements:
	pip freeze > requirements.txt

# 安裝專案所需的套件
install:
	pip install -r requirements.txt

# 創建管理員帳號
createadmin:
	python manage.py createsuperuser

# 啟動Django Shell
shell:
	python manage.py shell
