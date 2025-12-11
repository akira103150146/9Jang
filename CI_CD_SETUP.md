# CI/CD 設置指南

本專案已配置完整的 CI/CD 流程，確保在推送代碼和部署前所有測試都必須通過。

## 📋 目錄

- [GitHub Actions 自動測試](#github-actions-自動測試)
- [Cloud Build 部署檢查](#cloud-build-部署檢查)
- [本地 Git Hooks](#本地-git-hooks)
- [分支保護設置](#分支保護設置)

## 🔄 GitHub Actions 自動測試

### 觸發條件

GitHub Actions 會在以下情況自動運行測試：

- ✅ 推送到任何分支（`push`）
- ✅ 創建 Pull Request 到 `main` 或 `develop` 分支
- ✅ 推送到 `main` 或 `develop` 分支

### 測試流程

1. **後端測試**
   - 設置 PostgreSQL 測試數據庫
   - 運行數據庫遷移
   - 執行所有 Django 測試
   - 生成測試覆蓋率報告（可選）

2. **前端測試**
   - 安裝 Node.js 依賴
   - 運行 Lint 檢查
   - 構建前端應用

3. **測試結果檢查**
   - 如果任何測試失敗，整個工作流會失敗
   - Pull Request 會顯示測試狀態
   - 測試失敗時會阻止合併（如果設置了分支保護）

### 查看測試結果

1. 在 GitHub 倉庫頁面，點擊 **Actions** 標籤
2. 選擇對應的工作流運行
3. 查看詳細的測試日誌

## ☁️ Cloud Build 部署檢查

### 測試步驟

在部署到 GCP Cloud Run 之前，Cloud Build 會：

1. **運行後端測試**（必須通過）
   - 安裝 Python 依賴
   - 運行所有 Django 測試
   - 如果測試失敗，**部署會立即中止**

2. **構建 Docker 映像**（僅在測試通過後）
3. **推送到 Container Registry**
4. **部署到 Cloud Run**

### 使用方式

```bash
# 使用 Cloud Build 部署（會自動運行測試）
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE_NAME=9jang-backend,_REGION=asia-east1
```

### 測試失敗處理

如果測試失敗：
- ❌ 構建過程會立即停止
- ❌ Docker 映像不會被構建
- ❌ 不會部署到 Cloud Run
- ✅ 錯誤日誌會顯示在 Cloud Build 控制台

## 🔧 本地 Git Hooks

### 安裝 Git Hooks

在項目根目錄運行：

```bash
./scripts/install-git-hooks.sh
```

這會安裝 `pre-push` hook，在推送代碼前自動運行測試。

### Pre-Push Hook 行為

- **推送至 `main` 或 `develop` 分支**：強制運行測試
  - 如果測試失敗，推送會被阻止
  - 必須修復所有測試錯誤後才能推送

- **推送至其他分支**：跳過本地測試
  - CI/CD 仍會在遠程運行測試
  - 允許快速推送功能分支

### 手動運行測試

在推送前，您可以手動運行測試：

```bash
# 在 backend 目錄
cd backend
python manage.py test

# 運行特定測試
python manage.py test cramschool.tests.FlushDbCommandTest

# 運行所有測試並顯示詳細輸出
python manage.py test --verbosity=2
```

### 跳過 Hook（不推薦）

如果必須跳過 hook（例如緊急修復），可以使用：

```bash
git push --no-verify
```

⚠️ **警告**：跳過 hook 可能會導致 CI/CD 失敗，請謹慎使用。

## 🛡️ 分支保護設置

為了確保代碼質量，建議在 GitHub 設置分支保護規則：

### 設置步驟

1. 前往 GitHub 倉庫設置頁面
2. 點擊 **Branches** → **Add rule**
3. 設置以下規則：

#### 對於 `main` 分支：

- ✅ **Require a pull request before merging**
  - Require approvals: 1
  - Dismiss stale pull request approvals when new commits are pushed

- ✅ **Require status checks to pass before merging**
  - 選擇：`後端測試` 和 `前端測試`
  - Require branches to be up to date before merging

- ✅ **Require conversation resolution before merging**

- ✅ **Do not allow bypassing the above settings**

#### 對於 `develop` 分支：

- ✅ **Require status checks to pass before merging**
  - 選擇：`後端測試` 和 `前端測試`

### 效果

設置分支保護後：
- ✅ 所有 Pull Request 必須通過測試才能合併
- ✅ 無法直接推送到受保護的分支（除非是管理員）
- ✅ 確保代碼庫始終保持可部署狀態

## 📊 測試覆蓋率

### 查看測試覆蓋率

```bash
cd backend
pip install coverage
coverage run --source='.' manage.py test
coverage report -m
coverage html  # 生成 HTML 報告
```

### 目標覆蓋率

建議維持至少：
- **核心功能**：80%+
- **關鍵業務邏輯**：90%+
- **工具函數**：100%

## 🚨 故障排除

### 測試在 CI/CD 中失敗但在本地通過

可能原因：
1. **環境變數不同**：檢查 CI/CD 環境變數設置
2. **數據庫配置**：CI/CD 使用 PostgreSQL，本地可能使用 SQLite
3. **依賴版本**：確保 `requirements.txt` 中的版本正確

解決方法：
```bash
# 使用與 CI/CD 相同的環境運行測試
cd backend
DATABASE_ENGINE=django.db.backends.postgresql \
DATABASE_NAME=testdb \
DATABASE_USER=testuser \
DATABASE_PASSWORD=testpass \
DATABASE_HOST=localhost \
python manage.py test
```

### Pre-Push Hook 不工作

檢查：
1. Hook 是否已安裝：`ls -la .git/hooks/pre-push`
2. Hook 是否有執行權限：`chmod +x .git/hooks/pre-push`
3. 重新安裝：`./scripts/install-git-hooks.sh`

### Cloud Build 測試失敗

檢查：
1. Cloud Build 日誌中的錯誤信息
2. 測試數據庫配置是否正確
3. 依賴是否正確安裝

## 📝 最佳實踐

1. **提交前運行測試**
   ```bash
   cd backend && python manage.py test
   ```

2. **小步提交**
   - 每次提交都應該包含相關的測試
   - 避免大型提交，難以定位問題

3. **修復測試失敗**
   - 優先修復測試失敗，而不是跳過測試
   - 測試失敗通常表示代碼有問題

4. **保持測試更新**
   - 添加新功能時，同時添加測試
   - 修復 bug 時，添加回歸測試

5. **定期檢查 CI/CD**
   - 定期查看 GitHub Actions 和 Cloud Build 狀態
   - 及時修復持續失敗的測試

## 🔗 相關文檔

- [測試文檔](./backend/cramschool/tests.py)
- [部署文檔](./GCP_DEPLOYMENT.md)
- [GitHub Actions 配置](./.github/workflows/test.yml)
- [Cloud Build 配置](./cloudbuild.yaml)
