# bcrypt 問題修復記錄

## 問題描述

在 pnpm monorepo 環境中，bcrypt 原生模組（`.node` 文件）需要編譯構建，但 pnpm 預設會忽略構建腳本，導致運行時找不到原生模組。

## 解決方案

### 1. 手動構建 bcrypt

```bash
# 進入 bcrypt 目錄
cd node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt

# 手動構建
npm install --build-from-source
```

### 2. 配置 .npmrc（永久解決）

在項目根目錄創建或更新 `.npmrc` 文件：

```ini
enable-pre-post-scripts=true
```

這會允許所有包的構建腳本執行。

### 3. 批准構建腳本（推薦）

```bash
# 在項目根目錄執行
pnpm approve-builds bcrypt
# 然後選擇 bcrypt 並確認
```

## 驗證

構建完成後，驗證 bcrypt 是否正常工作：

```bash
cd packages/backend
node -e "try { require('bcrypt'); console.log('✓ bcrypt OK'); } catch(e) { console.log('✗ ERROR:', e.message); }"
```

## 當前狀態

✅ bcrypt 原生模組已成功構建
✅ 文件位置：`node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt/lib/binding/napi-v3/bcrypt_lib.node`
✅ NestJS 應用程序可以正常啟動
✅ 所有模組載入正常

## 注意事項

- 如果重新安裝依賴，可能需要重新構建 bcrypt
- 建議在 `.npmrc` 中配置 `enable-pre-post-scripts=true` 以自動構建
- 或者使用 `pnpm approve-builds bcrypt` 批准構建腳本
