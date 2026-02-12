# CSV Seeder 快速參考

## 📋 常用指令

### 範本生成

```bash
# 生成所有範本
pnpm seed:csv:templates

# 生成特定模型
pnpm seed:csv:templates --models=Student,Teacher,Course

# 空白範本（不含範例）
pnpm seed:csv:templates --empty
```

### 資料匯入

```bash
# 基本匯入
pnpm seed:csv

# 預覽模式
pnpm seed:csv --dry-run

# 指定表格
pnpm seed:csv --tables=Student,Teacher

# 清空後匯入
pnpm seed:csv --clear

# 遇錯繼續
pnpm seed:csv --continue-on-error

# 指定目錄
pnpm seed:csv --csv-dir=./my-data
```

## 📝 CSV 格式

### 基本格式

```csv
# 註解行（以 # 開頭）
field1,field2,field3
value1,value2,value3
```

### 外鍵引用

```csv
# 格式: @ModelName:field_name:value
user_id,@CustomUser:username:student001
teacher_id,@Teacher:teacher_id:T001
```

### 資料類型

| 類型 | 範例 |
|------|------|
| 字串 | `張小明`, `中山國中` |
| 數字 | `123`, `45.67` |
| 布林 | `true`, `false`, `yes`, `no` |
| 空值 | 留空 |
| 時間 | `18:00`, `18:00:00` |
| 日期 | `2024-01-01T10:00:00Z` |

## 🔄 Upsert 邏輯

| 模型 | Lookup Field | 行為 |
|------|--------------|------|
| CustomUser | username | 存在則更新 |
| Student | student_id | 存在則更新 |
| Teacher | teacher_id | 存在則更新 |
| Course | course_id | 存在則更新 |

## 📂 目錄結構

```
backend/fixtures/csv/
├── templates/          # 範本檔案
│   ├── Student.csv
│   ├── Teacher.csv
│   └── ...
├── data/              # 實際資料
│   ├── Student.csv
│   ├── Teacher.csv
│   └── ...
└── README.md
```

## ⚠️ 注意事項

1. **檔案編碼**: 必須使用 UTF-8
2. **匯入順序**: 先匯入被引用的表格
3. **自動 ID**: 首次創建時不要提供 ID
4. **密碼**: CustomUser 會自動 hash

## 🐛 常見錯誤

| 錯誤 | 解決方案 |
|------|----------|
| CSV 解析錯誤 | 檢查逗號和引號 |
| 找不到外鍵 | 先匯入被引用的表格 |
| 驗證失敗 | 檢查資料類型和必填欄位 |
| Dry-run 外鍵失敗 | 正常，使用實際匯入 |

## 📊 範例工作流程

### 情境 1: 匯入學生資料

```bash
# 1. 生成範本
pnpm seed:csv:templates --models=CustomUser,Student

# 2. 編輯資料
cp fixtures/csv/templates/CustomUser.csv fixtures/csv/data/
cp fixtures/csv/templates/Student.csv fixtures/csv/data/
# 使用 Excel 編輯

# 3. 匯入
pnpm seed:csv --tables=CustomUser
pnpm seed:csv --tables=Student
```

### 情境 2: 更新現有資料

```bash
# 1. 編輯 CSV（保持 ID 不變）
# 2. 匯入（會自動更新）
pnpm seed:csv --tables=Student
```

### 情境 3: 清空重建

```bash
# 清空後匯入
pnpm seed:csv --clear
```

## 💡 提示

- 使用 Excel 的「另存新檔」選擇「CSV UTF-8」
- 註解行可以幫助說明資料
- 先用小量資料測試
- 使用 `--dry-run` 預覽結果
- 檢查匯入日誌確認結果

## 📞 更多資訊

- **完整指南**: [CSV_SEEDER_GUIDE.md](./CSV_SEEDER_GUIDE.md)
- **CSV 目錄說明**: [fixtures/csv/README.md](./fixtures/csv/README.md)
- **完成報告**: [CSV_SEEDER_COMPLETE.md](../CSV_SEEDER_COMPLETE.md)
