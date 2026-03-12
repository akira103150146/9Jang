# 9Jang 網路與 Nginx 除錯筆記

本文件記錄部署 9Jang 補習班系統時遇到的網路相關問題與解決方案。

---

## 1. 內網 WiFi 登入失敗（NAT Loopback）

### 現象
- **行動網路**（220.135.216.117:5173）：可正常開啟網頁並登入
- **內網 WiFi**（192.168.200.147:5173）：可看到網頁，但輸入正確帳密點擊登入會卡住、失敗

### 原因
前端 API 固定指向公網 IP `220.135.216.117:3000`。在內網 WiFi 時，手機與伺服器在同一 LAN，但請求仍嘗試連到公網 IP，多數路由器不支援 **NAT Loopback（NAT 迴環）**，導致連線失敗。

### 解決方案
使用**同源 API URL**：`window.location.origin + '/api'`，讓 API 依目前存取網址動態決定目標，透過 Nginx 或 Vite proxy 轉發至後端。

---

## 2. Nginx 8080 Port 登入失敗（CORS）

### 現象
- 透過 `220.135.216.117:8080` 可看到前端網頁
- 點擊登入按鈕無法正常登入

### 原因
1. 前端 API 指向 `hostname:3000`，請求直接打到 port 3000，未經 Nginx
2. 後端 CORS 只允許 `:5173`，未包含 `:8080`，跨來源請求被擋下

### 解決方案
改用**同源 API**：`window.location.origin + '/api'`，讓 API 請求走與前端相同的 port，由 Nginx 的 `location /api/` 轉發，避免 CORS 問題。

---

## 3. Port 80 改為 80 後 localhost 無法連線

### 現象
從 8080 改為 80 後，localhost 無法連線。

### 原因
Port 80 可能被其他服務佔用（IIS、Hyper-V、其他 web 服務等）。

### 檢查方式
```powershell
# Windows PowerShell
netstat -ano | findstr :80
```

### 解決方案
- 改用 8080：`ports: "8080:80"`
- 或停用佔用 port 80 的服務（如 IIS）

---

## 4. 大量 ESTABLISHED 連線（連線迴圈）

### 現象
`netstat` 出現大量：
```
TCP  192.168.200.147:3412  192.168.200.147:80  ESTABLISHED  33748
TCP  192.168.200.147:3413  192.168.200.147:80  ESTABLISHED  33748
...（數百至數千筆）
```

### 原因
**WSL Mirrored Networking** + **portproxy 轉發 port 80** 形成迴圈：

1. WSL 與 Windows 共用 IP（192.168.200.147）
2. `wsl-port-forward.ps1` 將 Windows:80 轉發至 WSL:80
3. WSL 內程式連到 192.168.200.147:80 → 經 Windows portproxy → 又回到 WSL
4. 形成無限迴圈，產生大量連線

### 解決方案（Mirrored 模式正確設定）

1. **停用 port 80 的 portproxy**
   - 執行 `wsl-port-forward-remove.ps1` 移除轉發
   - 或修改 `wsl-port-forward.ps1`，讓 `$ports` 不包含 80

2. **僅使用 Docker port 映射**
   - Mirrored 模式下，Docker 的 `ports: "80:80"` 會直接綁在共用網路
   - 不需額外 portproxy

3. **防火牆**
   - 若區網無法連線，需手動開放 port 80：
   ```powershell
   New-NetFirewallRule -DisplayName "WSL-Nginx-80" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
   ```

---

## 5. WSL Mirrored Networking 設定總結

### 正確做法
| 項目 | Mirrored 模式 |
|------|---------------|
| portproxy | **不要**對 port 80 使用 |
| Docker ports | 直接使用 `"80:80"` |
| 存取方式 | `http://localhost`、`http://192.168.200.147` |

### 錯誤做法（會造成迴圈）
- 在 Mirrored 模式下執行 `wsl-port-forward.ps1` 轉發 port 80

---

## 6. 從 WSL 執行 PowerShell 腳本

### 以系統管理員身分執行
```bash
powershell.exe -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File \"$(wslpath -w /home/akira/github/9Jang/nginx/wsl-port-forward.ps1)\"' -Verb RunAs"
```

### 直接在 Windows 執行（建議）
1. Win + X → 「終端機 (系統管理員)」
2. `cd \\wsl$\Ubuntu\home\akira\github\9Jang\nginx`
3. `.\wsl-port-forward.ps1`

---

## 7. Nginx 與其他容器溝通

### 使用 host.docker.internal（連到 Host）
適用於 frontend/backend 跑在 Host（非 Docker）時：
```nginx
proxy_pass http://host.docker.internal:5173;
proxy_pass http://host.docker.internal:3000;
```

### 使用 Docker 服務名稱（同一個 compose）
將 nginx 加入主專案 `9jang-network`，使用 service 名稱：
```nginx
proxy_pass http://frontend:5173;
proxy_pass http://backend:3000;
```

---

## 8. CCTV 監視器 Proxy

### 設定範例
```nginx
location /cctv/ {
    proxy_pass http://192.168.200.171:80/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### 注意事項
- 監視器網頁若使用絕對路徑（如 `/login`），可能造成重導向錯誤
- 可考慮用 subdomain 或 iframe 嵌入

---

## 相關檔案

| 檔案 | 用途 |
|------|------|
| `wsl-port-forward.ps1` | 設定 portproxy（Mirrored 模式勿用 port 80） |
| `wsl-port-forward-remove.ps1` | 移除 portproxy |
| `check-lan-setting.ps1` | 檢查防火牆與 port 轉發狀態 |
| `note.md` | 常用指令 |
