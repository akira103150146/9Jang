# CSV 資料匯入指南

本目錄包含 CSV 格式的資料匯入功能，支援從 Excel 或 CSV 檔案匯入資料到資料庫。

## 📁 目錄結構

```
csv/
├── templates/          # CSV 範本檔案（含範例資料）
├── data/              # 實際要匯入的資料檔案
└── README.md          # 本說明文件
```

## 🚀 快速開始

### 1. 生成 CSV 範本

```bash
cd backend
pnpm seed:csv:templates
```

這會在 `templates/` 目錄中生成所有模型的 CSV 範本檔案，包含：
- CSV header（使用 snake_case 欄位名稱）
- 範例資料行
- 註解說明外鍵引用格式

### 2. 準備資料

複製範本到 `data/` 目錄並填入您的資料：

```bash
cp templates/Student.csv data/
# 使用 Excel 或文字編輯器編輯 data/Student.csv
```

### 3. 匯入資料

```bash
# 預覽模式（不會實際寫入資料庫）
pnpm seed:csv --dry-run

# 實際匯入
pnpm seed:csv

# 只匯入特定表格
pnpm seed:csv --tables Student,Teacher,Course
```

## 📝 CSV 格式說明

### 基本格式

CSV 檔案的第一行是 header（欄位名稱），使用 snake_case 格式：

```csv
student_id,name,school,grade,phone,notes
1,張小明,中山國中,9,0912345678,數學很好
2,李小華,大安高中,10,0923456789,
```

### 外鍵引用格式

當欄位是外鍵時，使用以下格式引用其他表格的資料：

```
@ModelName:field_name:value
```

範例：

```csv
student_id,name,user_id
1,張小明,@CustomUser:username:student001
2,李小華,@CustomUser:username:student002
```

說明：
- `@CustomUser` - 引用的模型名稱（使用 PascalCase）
- `username` - 查找欄位名稱（使用 snake_case）
- `student001` - 查找值

### 支援的外鍵格式

1. **明確格式**（推薦）：
   ```
   @Teacher:teacher_id:T001
   ```

2. **完整格式**（相容 JSON seeder）：
   ```
   cramschool.Teacher:teacher_id:T001
   ```

3. **直接 ID**（如果已知 ID）：
   ```
   123
   ```

## 📋 常用指令

### 範本生成

```bash
# 生成所有模型的範本
pnpm seed:csv:templates

# 只生成特定模型的範本
pnpm seed:csv:templates --models Student,Teacher,Course

# 生成空白範本（不含範例資料）
pnpm seed:csv:templates --empty
```

### 資料匯入

```bash
# 匯入 data/ 目錄中的所有 CSV 檔案
pnpm seed:csv

# 只匯入特定表格
pnpm seed:csv --tables Student,Teacher

# 指定 CSV 目錄
pnpm seed:csv --csv-dir ./my-data

# 預覽模式（不實際寫入）
pnpm seed:csv --dry-run

# 清空現有資料後匯入
pnpm seed:csv --clear

# 遇到錯誤繼續執行
pnpm seed:csv --continue-on-error
```

## 🔄 Upsert 邏輯

匯入時會自動判斷資料是否已存在：

- **存在** → 更新現有記錄
- **不存在** → 創建新記錄

判斷依據（lookup fields）：
- `Student` → `student_id`
- `Teacher` → `teacher_id`
- `Course` → `course_id`
- `CustomUser` → `username`
- 其他模型 → 主鍵欄位

## ⚠️ 注意事項

### 1. 檔案編碼

CSV 檔案必須使用 **UTF-8 編碼**。

在 Excel 中另存為 CSV 時，選擇「CSV UTF-8 (逗號分隔)」。

### 2. 匯入順序

由於外鍵依賴關係，建議按以下順序匯入：

1. `CustomUser.csv` - 使用者帳號
2. `Role.csv` - 角色
3. `Student.csv` - 學生
4. `Teacher.csv` - 教師
5. `Subject.csv` - 科目
6. `Course.csv` - 課程
7. `StudentEnrollment.csv` - 學生選課
8. 其他模型...

### 3. 必填欄位

請確保必填欄位都有值，否則會驗證失敗。查看範本檔案中的範例資料了解哪些欄位是必填的。

### 4. 資料驗證

所有資料都會經過 Zod schema 驗證，確保資料格式正確。如果驗證失敗，會顯示詳細的錯誤訊息。

### 5. 特殊欄位處理

#### 密碼欄位（CustomUser）

如果沒有提供 `password` 欄位，系統會：
1. 使用 `username` 作為預設密碼
2. 或使用 `password123`

密碼會自動進行 bcrypt hash 處理。

#### 日期時間欄位

使用 ISO 8601 格式：
```
2024-01-01T10:00:00Z
```

#### 布林值欄位

使用：
- `true` / `false`
- `1` / `0`
- `yes` / `no`

## 🐛 錯誤處理

### 常見錯誤

#### 1. 找不到外鍵引用

```
錯誤: 找不到引用 @CustomUser:username:invalid_user
```

**解決方法**：
- 確認引用的資料已經存在於資料庫中
- 檢查引用格式是否正確
- 先匯入被引用的表格

#### 2. 驗證錯誤

```
欄位 'phone': 格式不正確
```

**解決方法**：
- 檢查資料格式是否符合要求
- 查看範本檔案中的範例資料
- 確認必填欄位都有值

#### 3. CSV 解析錯誤

```
CSV 解析失敗: 第 5 行
```

**解決方法**：
- 檢查 CSV 格式是否正確
- 確認使用逗號分隔
- 檢查是否有多餘的逗號或引號

## 📊 範例

### Student.csv

```csv
student_id,name,school,grade,phone,emergency_contact_name,emergency_contact_phone,notes,user_id
1,張小明,中山國中,9,0912345678,張爸爸,0987654321,數學很好,@CustomUser:username:student001
2,李小華,大安高中,10,0923456789,李媽媽,0976543210,,@CustomUser:username:student002
```

### Course.csv

```csv
course_id,course_name,subject_id,teacher_id,start_time,end_time,day_of_week,classroom,max_students
C001,國三數學A班,@Subject:code:MATH,@Teacher:teacher_id:T001,18:00,20:00,1,A101,20
C002,高一英文B班,@Subject:code:ENG,@Teacher:teacher_id:T002,19:00,21:00,3,B202,25
```

## 🔗 相關文件

- [Prisma Schema](../prisma/schema.prisma) - 資料庫模型定義
- [Zod Schemas](../../shared/src/schemas/) - 資料驗證規則
- [JSON Seeder](../src/scripts/seed-data.ts) - JSON 格式匯入（另一種方式）

## 💡 提示

1. **使用 Excel 編輯**：Excel 比文字編輯器更方便編輯 CSV
2. **先測試預覽**：使用 `--dry-run` 先檢查資料是否正確
3. **分批匯入**：大量資料建議分成多個檔案分批匯入
4. **備份資料庫**：匯入前建議先備份資料庫
5. **檢查日誌**：匯入時會顯示詳細的操作日誌

## 🆘 需要幫助？

如果遇到問題，請：
1. 查看錯誤訊息
2. 檢查範本檔案中的範例
3. 確認資料格式是否正確
4. 使用 `--dry-run` 預覽模式測試
