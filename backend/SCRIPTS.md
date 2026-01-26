# 資料庫管理腳本

## flush-db - 清空資料庫

清空資料庫中的所有資料（危險操作！）

### 使用方法

```bash
# 清空所有資料（需要確認）
pnpm flush:db

# 跳過確認，直接清空
pnpm flush:db --noinput

# 保留認證相關資料（account 模組）
pnpm flush:db --keep-auth

# 組合使用
pnpm flush:db --noinput --keep-auth
```

### 選項說明

- `--noinput` 或 `--no-input`: 跳過確認提示，直接執行清空操作
- `--keep-auth`: 保留認證相關的資料（Account 模組的所有表）

### 注意事項

⚠️ **此操作無法復原！** 請確保已備份資料庫。

腳本會按照外鍵依賴關係正確排序刪除順序，確保不會因為外鍵約束而失敗。

## seed-data - 初始化資料

從 JSON 文件初始化資料庫資料

### 使用方法

```bash
# 使用默認文件初始化資料（seed_data_example.json）
pnpm seed:data

# 從指定的 JSON 文件初始化資料
pnpm seed:data fixtures/seed_data_example.json

# 預覽模式（不會實際寫入資料庫，使用默認文件）
pnpm seed:data --dry-run

# 清除現有資料後再初始化（危險操作，使用默認文件）
pnpm seed:data --clear

# 指定文件並預覽
pnpm seed:data fixtures/seed_data_example.json --dry-run

# 指定文件並清除後初始化
pnpm seed:data fixtures/seed_data_example.json --clear
```

### 選項說明

- `<json_file_path>`: JSON 資料文件的路徑（必需）
- `--dry-run`: 僅顯示將要執行的操作，不實際寫入資料庫
- `--clear`: 清除現有資料後再初始化（會刪除 JSON 文件中定義的所有模型的資料）

### JSON 文件格式

詳見 `fixtures/README.md`

### 範例

```bash
# 預覽將要創建的資料
pnpm seed:data fixtures/seed_data_example.json --dry-run

# 清除並重新初始化
pnpm seed:data fixtures/seed_data_example.json --clear

# 從 Django 的 fixtures 文件初始化
pnpm seed:data ../../backend/fixtures/seed_data_example.json
```

## 完整工作流程範例

### 重置資料庫並初始化

```bash
# 1. 清空資料庫（保留認證資料）
pnpm flush:db --noinput --keep-auth

# 2. 初始化資料
pnpm seed:data fixtures/seed_data_example.json
```

### 完全重置資料庫

```bash
# 1. 清空所有資料
pnpm flush:db --noinput

# 2. 初始化資料（包括用戶）
pnpm seed:data fixtures/seed_data_example.json
```

## 與 Django 的對應關係

| Django 命令 | NestJS 命令 |
|------------|------------|
| `python manage.py flush_db` | `pnpm flush:db` |
| `python manage.py flush_db --noinput` | `pnpm flush:db --noinput` |
| `python manage.py flush_db --keep-auth` | `pnpm flush:db --keep-auth` |
| `python manage.py seed_data <file>` | `pnpm seed:data <file>` |
| `python manage.py seed_data <file> --dry-run` | `pnpm seed:data <file> --dry-run` |
| `python manage.py seed_data <file> --clear` | `pnpm seed:data <file> --clear` |

## 故障排除

### flush-db 錯誤

如果遇到外鍵約束錯誤，請檢查：
1. 模型刪除順序是否正確（腳本已自動處理）
2. 是否有自定義的外鍵約束

### seed-data 錯誤

常見錯誤：

1. **找不到模型映射**: 確保 JSON 文件中的模型路徑格式正確（`app_label.ModelName`）
2. **外鍵引用失敗**: 確保被引用的模型已先創建
3. **查找欄位不存在**: 檢查 `lookup_fields` 中的欄位是否在 `data` 中存在

### 調試技巧

```bash
# 使用 dry-run 預覽操作
pnpm seed:data fixtures/seed_data_example.json --dry-run

# 檢查資料庫連接
pnpm test:db
```
