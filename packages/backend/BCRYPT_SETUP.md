# bcrypt 原生模組設置指南

## 問題說明

在 pnpm monorepo 環境中，bcrypt 的原生模組（`.node` 文件）需要編譯構建。pnpm 預設會忽略構建腳本以提升安全性，因此需要手動批准或配置。

## 解決方案

### 方法 1: 批准構建腳本（推薦）

```bash
# 在項目根目錄執行
pnpm approve-builds bcrypt
# 然後選擇 bcrypt 並確認
```

### 方法 2: 手動構建（如果方法 1 無效）

```bash
# 進入 bcrypt 目錄並手動構建
cd node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt
npm install --build-from-source
```

### 方法 3: 配置 .npmrc（永久解決）

在項目根目錄的 `.npmrc` 文件中添加：

```ini
enable-pre-post-scripts=true
```

或者在 `packages/backend/.npmrc` 中添加：

```ini
enable-pre-post-scripts=true
```

## 驗證

構建完成後，驗證 bcrypt 是否正常工作：

```bash
cd packages/backend
node -e "try { require('bcrypt'); console.log('✓ bcrypt OK'); } catch(e) { console.log('✗ ERROR:', e.message); }"
```

應該輸出：`✓ bcrypt OK`

## 注意事項

- bcrypt 是原生模組，需要編譯 C++ 代碼
- 確保系統已安裝構建工具（如 `build-essential`、`python3`、`node-gyp`）
- 在 WSL 環境中，可能需要安裝額外的構建依賴

## 故障排除

如果仍然無法載入：

1. 檢查文件是否存在：
   ```bash
   ls -la node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt/lib/binding/napi-v3/bcrypt_lib.node
   ```

2. 重新構建：
   ```bash
   pnpm rebuild bcrypt --filter @9jang/backend
   ```

3. 完全重新安裝：
   ```bash
   pnpm remove bcrypt --filter @9jang/backend
   pnpm add bcrypt@5.1.1 --filter @9jang/backend
   ```
