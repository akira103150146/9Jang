# CSV Seeder 使用指南

CSV Seeder 功能已完整實作，支援從 CSV 檔案匯入資料到資料庫。

## ✅ 已完成的功能

1. **CSV 解析器** - 支援 UTF-8 編碼、註解行、自動類型轉換
2. **外鍵解析器** - 支援 `@ModelName:field_name:value` 格式的外鍵引用
3. **資料驗證器** - 整合 Zod schemas 進行完整驗證
4. **Upsert 處理器** - 自動判斷創建或更新記錄
5. **範本生成器** - 從 Prisma schema 自動生成 CSV 範本
6. **主要腳本** - 範本生成和資料匯入腳本

## 🚀 快速開始

### 1. 生成 CSV 範本

```bash
cd backend

# 生成所有模型的範本
pnpm seed:csv:templates

# 只生成特定模型
pnpm seed:csv:templates --models=Student,Teacher,Course

# 生成空白範本（不含範例資料）
pnpm seed:csv:templates --empty
```

範本會生成在 `backend/fixtures/csv/templates/` 目錄。

### 2. 準備資料

複製範本到 `data` 目錄並填入資料：

```bash
cp fixtures/csv/templates/CustomUser.csv fixtures/csv/data/
cp fixtures/csv/templates/Student.csv fixtures/csv/data/
# 使用 Excel 或文字編輯器編輯 CSV 檔案
```

### 3. 匯入資料

```bash
# 預覽模式（不實際寫入）
pnpm seed:csv --dry-run

# 實際匯入
pnpm seed:csv

# 只匯入特定表格
pnpm seed:csv --tables=Student,Teacher

# 清空後匯入
pnpm seed:csv --clear

# 遇到錯誤繼續執行
pnpm seed:csv --continue-on-error
```

## 📝 CSV 格式說明

### 基本格式

```csv
# 註解行（以 # 開頭）
# 外鍵引用格式: @ModelName:field_name:value

student_id,name,school,grade,phone,notes
1,張小明,中山國中,9,0912345678,數學很好
2,李小華,大安高中,10,0923456789,
```

### 外鍵引用

使用 `@ModelName:field_name:value` 格式引用其他表格：

```csv
student_id,name,user_id
1,張小明,@CustomUser:username:student001
2,李小華,@CustomUser:username:student002
```

### 支援的資料類型

- **字串**: 直接輸入
- **數字**: `123`, `45.67`
- **布林值**: `true`/`false`, `1`/`0`, `yes`/`no`
- **空值**: 留空
- **日期時間**: ISO 8601 格式 `2024-01-01T10:00:00Z`

## 📋 可用指令

### 範本生成

```bash
# 生成所有模型的範本
pnpm seed:csv:templates

# 指定模型
pnpm seed:csv:templates --models=Student,Teacher,Course

# 空白範本
pnpm seed:csv:templates --empty
```

### 資料匯入

```bash
# 基本匯入
pnpm seed:csv

# 指定目錄
pnpm seed:csv --csv-dir=./my-data

# 指定表格
pnpm seed:csv --tables=Student,Teacher

# 預覽模式
pnpm seed:csv --dry-run

# 清空後匯入
pnpm seed:csv --clear

# 遇錯繼續
pnpm seed:csv --continue-on-error
```

## 🔄 Upsert 邏輯

系統會根據 lookup fields 判斷記錄是否存在：

- **存在** → 更新現有記錄
- **不存在** → 創建新記錄

預設 lookup fields：
- `Student` → `student_id`
- `Teacher` → `teacher_id`
- `Course` → `course_id`
- `CustomUser` → `username`

## ⚠️ 注意事項

### 1. 檔案編碼

CSV 檔案必須使用 **UTF-8 編碼**。

### 2. 匯入順序

由於外鍵依賴，建議按以下順序匯入：

1. `CustomUser` - 使用者帳號
2. `Role` - 角色
3. `Student` - 學生
4. `Teacher` - 教師
5. `Subject` - 科目
6. `Course` - 課程
7. 其他模型...

### 3. 註解行

以 `#` 開頭的行會被視為註解並忽略。

### 4. 密碼處理

對於 `CustomUser` 模型：
- 如果沒有提供 `password` 欄位，會使用 `username` 作為預設密碼
- 密碼會自動進行 bcrypt hash

## 📊 範例

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

student_id,name,school,grade,phone,emergency_contact_name,emergency_contact_phone,notes,user_id
1,張小明,中山國中,9,0912345678,張爸爸,0987654321,數學很好,@CustomUser:username:student001
2,李小華,大安高中,10,0923456789,李媽媽,0976543210,,@CustomUser:username:student002
```

### Course.csv

```csv
# Course.csv
# 課程資料

course_id,course_name,subject_id,teacher_id,start_time,end_time,day_of_week,classroom,max_students
1,國三數學A班,@Subject:code:MATH,@Teacher:teacher_id:1,18:00,20:00,1,A101,20
2,高一英文B班,@Subject:code:ENG,@Teacher:teacher_id:2,19:00,21:00,3,B202,25
```

## 🐛 常見問題

### Q: CSV 解析錯誤

**A:** 檢查：
- 檔案編碼是否為 UTF-8
- 是否有多餘的逗號或引號
- 欄位數量是否正確

### Q: 找不到外鍵引用

**A:** 確認：
- 引用的資料已存在於資料庫
- 外鍵格式正確：`@ModelName:field_name:value`
- 先匯入被引用的表格

### Q: 驗證失敗

**A:** 檢查：
- 必填欄位是否都有值
- 資料類型是否正確
- 查看範本檔案中的範例

### Q: Dry-run 模式下外鍵查找失敗

**A:** 這是正常的。Dry-run 模式不會實際寫入資料庫，所以外鍵引用會找不到。使用實際匯入模式即可。

## 🔗 相關檔案

- **範本目錄**: `backend/fixtures/csv/templates/`
- **資料目錄**: `backend/fixtures/csv/data/`
- **README**: `backend/fixtures/csv/README.md`
- **原始碼**: `backend/src/scripts/csv/`

## 💡 提示

1. **使用 Excel 編輯** - 比文字編輯器方便
2. **先測試預覽** - 使用 `--dry-run` 檢查資料
3. **分批匯入** - 大量資料分成多個檔案
4. **備份資料庫** - 匯入前先備份
5. **檢查日誌** - 匯入時會顯示詳細日誌

## 🎉 完成！

CSV Seeder 功能已完整實作並測試通過。您現在可以：

1. 生成 CSV 範本
2. 填入資料
3. 匯入到資料庫
4. 使用 Upsert 邏輯自動更新

詳細說明請參考 `backend/fixtures/csv/README.md`。
