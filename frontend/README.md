# 九章後台管理系統 - 前端

Vue 3 + Vite + Tailwind CSS 前端應用程式

## 安裝依賴

```bash
cd frontend
npm install
```

## 開發模式

```bash
npm run dev
```

應用程式將在 http://localhost:5173 運行

## 建置生產版本

```bash
npm run build
```

建置後的檔案將在 `dist` 資料夾中

## 預覽生產版本

```bash
npm run preview
```

## 專案結構

```
frontend/
├── src/
│   ├── assets/          # 靜態資源（圖片等）
│   ├── components/      # Vue 組件
│   │   └── Sidebar.vue
│   ├── router/          # Vue Router 配置
│   │   └── index.js
│   ├── services/        # API 服務
│   │   └── api.js
│   ├── views/           # 頁面視圖
│   │   ├── StudentList.vue
│   │   └── StudentForm.vue
│   ├── App.vue          # 根組件
│   ├── main.js          # 應用程式入口
│   └── style.css        # 全局樣式（包含 Tailwind）
├── index.html
├── package.json
├── vite.config.js       # Vite 配置
├── tailwind.config.js   # Tailwind CSS 配置
└── postcss.config.js    # PostCSS 配置
```

## API 端點

前端預設連接到 `http://localhost:8000/api`，可在 `src/services/api.js` 中修改。

## 技術棧

- Vue 3 (Composition API)
- Vite
- Vue Router
- Tailwind CSS
- Axios

