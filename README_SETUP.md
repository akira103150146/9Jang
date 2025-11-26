# 九章後台管理系統 - 前後端分離設置指南

## 專案結構

```
9Jang/
├── frontend/          # Vue.js 前端應用程式
├── account/           # Django 帳號應用
├── cramschool/        # Django 補習班應用
├── config/            # Django 專案配置
└── templates/         # 舊的 Django 模板（可保留作為參考）
```

## 後端設置 (Django)

### 1. 安裝 Python 依賴

```bash
# 激活虛擬環境
source venv/bin/activate  # macOS/Linux
# 或
venv\Scripts\activate     # Windows

# 安裝依賴
pip install -r requirements.txt
```

### 2. 運行資料庫遷移

```bash
python manage.py migrate
```

### 3. 啟動 Django 開發伺服器

```bash
python manage.py runserver
```

後端 API 將在 http://localhost:8000 運行

### API 端點

- 學生列表: `GET http://localhost:8000/api/cramschool/students/`
- 學生詳情: `GET http://localhost:8000/api/cramschool/students/{id}/`
- 創建學生: `POST http://localhost:8000/api/cramschool/students/`
- 更新學生: `PUT http://localhost:8000/api/cramschool/students/{id}/`
- 刪除學生: `DELETE http://localhost:8000/api/cramschool/students/{id}/`

## 前端設置 (Vue.js)

### 1. 安裝 Node.js

確保已安裝 Node.js (建議 v18 或更高版本)

### 2. 安裝前端依賴

```bash
cd frontend
npm install
```

### 3. 啟動前端開發伺服器

```bash
npm run dev
```

前端應用程式將在 http://localhost:5173 運行

## 開發流程

1. **啟動後端**: 在專案根目錄運行 `python manage.py runserver`
2. **啟動前端**: 在 `frontend` 資料夾運行 `npm run dev`
3. **訪問應用**: 打開瀏覽器訪問 http://localhost:5173

## 重要配置說明

### CORS 設定

後端已配置 CORS 以允許前端跨域請求。在 `config/settings.py` 中：

```python
CORS_ALLOW_ALL_ORIGINS = True  # 開發環境
```

**生產環境請改為**:
```python
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://your-production-domain.com",
]
```

### API 基礎 URL

前端 API 配置在 `frontend/src/services/api.js` 中：

```javascript
baseURL: 'http://localhost:8000/api'
```

生產環境請修改為實際的後端 URL。

## 建置生產版本

### 前端建置

```bash
cd frontend
npm run build
```

建置後的檔案在 `frontend/dist` 資料夾中。

### 部署選項

1. **分離部署**: 前端和後端分別部署到不同的伺服器
2. **整合部署**: 將前端建置檔案複製到 Django 的靜態檔案目錄

## 故障排除

### CORS 錯誤

如果遇到 CORS 錯誤，請確認：
1. `django-cors-headers` 已安裝
2. `CORS_ALLOWED_ORIGINS` 包含前端 URL
3. `CorsMiddleware` 在 `MIDDLEWARE` 中正確配置

### API 連接失敗

檢查：
1. 後端伺服器是否運行在 http://localhost:8000
2. API URL 是否正確
3. 瀏覽器控制台是否有錯誤訊息

## 下一步

- [ ] 添加身份驗證 (JWT Token)
- [ ] 添加錯誤處理和載入狀態
- [ ] 優化響應式設計
- [ ] 添加單元測試
- [ ] 配置生產環境設定

