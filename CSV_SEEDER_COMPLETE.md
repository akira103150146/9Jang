# CSV Seeder 功能完成報告

## ✅ 功能完成狀態

CSV 資料匯入功能已完整實作並測試通過！

### 已實作的功能

1. ✅ **CSV 解析器** (`csv-parser.ts`)
   - 支援 UTF-8 編碼（自動移除 BOM）
   - 支援註解行（以 `#` 開頭）
   - 自動處理空白和空值
   - 自動轉換布林值
   - 保留字串格式（不自動轉數字，避免電話號碼問題）

2. ✅ **外鍵解析器** (`foreign-key-resolver.ts`)
   - 支援 `@ModelName:field_name:value` 格式
   - 支援完整格式 `app.ModelName:field_name:value`（相容 JSON seeder）
   - 快取機制避免重複查詢
   - 自動處理時間格式（避免誤判為外鍵）

3. ✅ **資料驗證器** (`data-validator.ts`)
   - 整合 Zod schemas 進行完整驗證
   - 支援 20+ 個模型的驗證
   - 詳細的錯誤訊息
   - 批次驗證功能

4. ✅ **Upsert 處理器** (`upsert-handler.ts`)
   - 根據 lookup fields 判斷記錄是否存在
   - 存在則更新，不存在則創建
   - 特殊處理 CustomUser 密碼（自動 bcrypt hash）
   - 批次處理功能
   - 錯誤處理和統計

5. ✅ **範本生成器** (`template-generator.ts`)
   - 從模型定義自動生成 CSV 範本
   - 包含範例資料
   - 包含註解說明
   - 支援選擇性生成

6. ✅ **主要腳本**
   - `generate-csv-templates.ts` - 範本生成腳本
   - `seed-csv.ts` - 資料匯入腳本

7. ✅ **完整文檔**
   - `fixtures/csv/README.md` - CSV 目錄說明
   - `CSV_SEEDER_GUIDE.md` - 使用指南
   - `CSV_SEEDER_COMPLETE.md` - 本文件

## 🧪 測試結果

### 測試 1: 範本生成

```bash
pnpm seed:csv:templates --models=Student,Teacher,Course
```

**結果**: ✅ 成功生成 3 個範本檔案

### 測試 2: CustomUser 匯入

```bash
pnpm seed:csv --tables=CustomUser
```

**結果**: ✅ 成功創建 2 筆 CustomUser 記錄，密碼自動 hash

### 測試 3: Student 匯入（含外鍵引用）

```bash
pnpm seed:csv --tables=Student
```

**結果**: ✅ 成功創建 2 筆 Student 記錄，外鍵引用正確解析

### 測試 4: 更新功能

```bash
pnpm seed:csv --tables=CustomUser
```

**結果**: ✅ 成功更新 2 筆 CustomUser 記錄（根據 username 查找）

### 測試 5: 完整匯入流程

```bash
pnpm seed:csv
```

**結果**: ✅ 成功匯入所有 CSV 檔案，統計資訊正確

## 📦 已創建的檔案

### 核心模組 (7 個)
```
backend/src/scripts/csv/
├── types.ts                    # 型別定義
├── utils.ts                    # 工具函式
├── csv-parser.ts               # CSV 解析器
├── foreign-key-resolver.ts     # 外鍵解析器
├── data-validator.ts           # 資料驗證器
├── upsert-handler.ts           # Upsert 處理器
└── template-generator.ts       # 範本生成器
```

### 主要腳本 (2 個)
```
backend/src/scripts/
├── generate-csv-templates.ts   # 範本生成腳本
└── seed-csv.ts                 # 資料匯入腳本
```

### 目錄結構 (3 個)
```
backend/fixtures/csv/
├── templates/                  # CSV 範本目錄
├── data/                       # 實際資料目錄
└── README.md                   # 使用說明
```

### 文檔 (2 個)
```
backend/
├── CSV_SEEDER_GUIDE.md         # 使用指南
└── CSV_SEEDER_COMPLETE.md      # 本文件
```

## 🚀 使用方式

### 基本流程

```bash
# 1. 生成範本
pnpm seed:csv:templates

# 2. 複製並編輯
cp fixtures/csv/templates/Student.csv fixtures/csv/data/
# 使用 Excel 編輯 fixtures/csv/data/Student.csv

# 3. 匯入資料
pnpm seed:csv
```

### 進階用法

```bash
# 只生成特定模型的範本
pnpm seed:csv:templates --models=Student,Teacher,Course

# 預覽匯入（不實際寫入）
pnpm seed:csv --dry-run

# 只匯入特定表格
pnpm seed:csv --tables=Student,Teacher

# 清空後匯入
pnpm seed:csv --clear

# 遇到錯誤繼續執行
pnpm seed:csv --continue-on-error

# 指定 CSV 目錄
pnpm seed:csv --csv-dir=./my-data
```

## 📝 CSV 格式範例

### CustomUser.csv

```csv
# CustomUser.csv
# 使用者帳號資料

username,password,first_name,last_name,email,role
student001,password123,小明,張,student001@example.com,STUDENT
student002,password123,小華,李,student002@example.com,STUDENT
teacher001,password123,老師,王,teacher001@example.com,TEACHER
```

### Student.csv

```csv
# Student.csv
# 學生資料
# 外鍵引用格式: @ModelName:field_name:value

name,school,grade,phone,emergency_contact_name,emergency_contact_phone,notes,user_id
張小明,中山國中,9,0912345678,張爸爸,0987654321,數學很好,@CustomUser:username:student001
李小華,大安高中,10,0923456789,李媽媽,0976543210,英文不錯,@CustomUser:username:student002
```

### Course.csv

```csv
# Course.csv
# 課程資料

course_name,subject_id,teacher_id,start_time,end_time,day_of_week,classroom,max_students
國三數學A班,@Subject:code:MATH,@Teacher:teacher_id:1,18:00,20:00,1,A101,20
高一英文B班,@Subject:code:ENG,@Teacher:teacher_id:2,19:00,21:00,3,B202,25
```

## 🎯 核心特性

### 1. 自動 Upsert

系統會自動判斷記錄是否存在：
- **CustomUser**: 根據 `username` 查找
- **Student**: 根據 `student_id` 查找（如果提供）
- **Teacher**: 根據 `teacher_id` 查找（如果提供）
- **Course**: 根據 `course_id` 查找（如果提供）

### 2. 外鍵引用

支援兩種格式：
```
@ModelName:field_name:value          # 簡化格式
app.ModelName:field_name:value       # 完整格式（相容 JSON）
```

### 3. 資料驗證

使用 Zod schemas 進行完整驗證，確保：
- 必填欄位不為空
- 資料類型正確
- 格式符合要求
- 外鍵引用有效

### 4. 錯誤處理

- 詳細的錯誤訊息（包含行號和欄位名稱）
- 支援 `--continue-on-error` 繼續執行
- 完整的統計資訊

### 5. 密碼處理

對於 CustomUser：
- 自動 bcrypt hash
- 如果沒有提供密碼，使用 username 作為預設密碼
- 更新時會重新 hash 密碼

## ⚠️ 重要提示

### 1. 匯入順序

由於外鍵依賴，建議按以下順序匯入：

```bash
# 1. 先匯入使用者
pnpm seed:csv --tables=CustomUser

# 2. 再匯入基礎資料
pnpm seed:csv --tables=Subject,Role

# 3. 然後匯入學生和教師
pnpm seed:csv --tables=Student,Teacher

# 4. 最後匯入課程和其他資料
pnpm seed:csv --tables=Course,StudentEnrollment
```

或者一次匯入所有（系統會按檔案順序處理）：

```bash
pnpm seed:csv
```

### 2. Dry-run 限制

在 `--dry-run` 模式下：
- 不會實際寫入資料庫
- 外鍵引用可能會失敗（因為引用的資料不存在）
- 這是正常行為

### 3. 檔案編碼

CSV 檔案必須使用 **UTF-8 編碼**。

在 Excel 中另存為時，選擇「CSV UTF-8 (逗號分隔)」。

### 4. 自動生成的 ID

對於有自動生成 ID 的模型（如 Student, Teacher），首次創建時：
- **不要提供** ID 欄位（讓資料庫自動生成）
- 更新時可以提供 ID 來指定要更新的記錄

## 📊 效能

- **批次處理**: 支援大量資料匯入
- **快取機制**: 避免重複查詢外鍵引用
- **事務處理**: 確保資料一致性
- **超時設定**: 120 秒超時

## 🔧 故障排除

### 問題 1: CSV 解析錯誤

```
CSV 解析錯誤: 第 5 行: Too many fields
```

**解決方案**:
- 檢查該行的欄位數量是否正確
- 確認沒有多餘的逗號
- 如果值包含逗號，需要用引號包圍

### 問題 2: 找不到外鍵引用

```
找不到引用的對象: CustomUser.username=invalid_user
```

**解決方案**:
- 確認引用的資料已存在於資料庫
- 檢查外鍵格式是否正確
- 先匯入被引用的表格

### 問題 3: 驗證失敗

```
欄位 'phone': Expected string, received number
```

**解決方案**:
- 檢查資料類型是否正確
- 查看範本檔案中的範例
- 確認必填欄位都有值

### 問題 4: Dry-run 模式外鍵失敗

這是正常的。Dry-run 不會寫入資料庫，所以外鍵查找會失敗。使用實際匯入模式即可。

## 🎓 使用建議

### 1. 使用 Excel 編輯

Excel 比文字編輯器更方便：
- 自動對齊欄位
- 支援公式和驗證
- 容易檢查資料

### 2. 先測試預覽

使用 `--dry-run` 先檢查資料是否正確：

```bash
pnpm seed:csv --dry-run
```

### 3. 分批匯入

大量資料建議分成多個檔案：
- 每個檔案 100-500 筆記錄
- 按功能或類別分類
- 方便管理和除錯

### 4. 備份資料庫

匯入前建議先備份：

```bash
# 使用 pg_dump 備份
pg_dump -U postgres 9jang > backup.sql
```

### 5. 檢查日誌

匯入時會顯示詳細日誌：
- 每筆記錄的處理結果
- 創建/更新/錯誤統計
- 外鍵解析過程

## 📚 範例資料

已提供以下範例資料：

1. **CustomUser.csv** - 2 筆使用者（student001, student002）
2. **Student.csv** - 2 筆學生（張小明, 李小華）

您可以基於這些範例創建更多資料。

## 🔗 相關資源

### 文檔
- **[CSV_SEEDER_GUIDE.md](./backend/CSV_SEEDER_GUIDE.md)** - 使用指南
- **[fixtures/csv/README.md](./backend/fixtures/csv/README.md)** - CSV 目錄說明

### 原始碼
- **[src/scripts/csv/](./backend/src/scripts/csv/)** - 核心模組
- **[src/scripts/generate-csv-templates.ts](./backend/src/scripts/generate-csv-templates.ts)** - 範本生成
- **[src/scripts/seed-csv.ts](./backend/src/scripts/seed-csv.ts)** - 資料匯入

### 範本和資料
- **[fixtures/csv/templates/](./backend/fixtures/csv/templates/)** - CSV 範本
- **[fixtures/csv/data/](./backend/fixtures/csv/data/)** - 實際資料

## 🎉 總結

CSV Seeder 功能已完整實作，包含：

- ✅ 7 個核心模組
- ✅ 2 個主要腳本
- ✅ 完整的文檔
- ✅ 範例資料
- ✅ 測試通過

您現在可以：

1. 生成任何模型的 CSV 範本
2. 使用 Excel 編輯資料
3. 匯入資料到資料庫
4. 自動處理創建和更新
5. 使用外鍵引用關聯資料
6. 完整的資料驗證

## 🚀 開始使用

```bash
cd backend

# 1. 生成範本
pnpm seed:csv:templates

# 2. 編輯資料
# 使用 Excel 編輯 fixtures/csv/data/*.csv

# 3. 匯入資料
pnpm seed:csv
```

詳細說明請參考 [CSV_SEEDER_GUIDE.md](./backend/CSV_SEEDER_GUIDE.md)

---

**CSV Seeder 功能完成！** 🎉
