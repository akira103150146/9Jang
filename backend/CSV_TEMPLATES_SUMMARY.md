# CSV 模板生成完成報告

## 完成時間
2024-02-12

## 完成內容

### 1. 生成的 CSV 模板數量
成功生成 **36 個** CSV 模板檔案，涵蓋所有 Prisma schema 中定義的模型。

### 2. 模板位置
- **模板資料夾**: `backend/fixtures/csv/templates/`
- **實際資料資料夾**: `backend/fixtures/csv/data/`

### 3. 所有生成的 CSV 模板列表

#### Account 模組 (4 個)
1. `CustomUser.csv` - 使用者帳號
2. `Role.csv` - 角色定義
3. `RolePermission.csv` - 角色權限
4. `AuditLog.csv` - 審計日誌

#### Cramschool 核心模組 (10 個)
5. `Student.csv` - 學生資料
6. `Teacher.csv` - 教師資料
7. `Course.csv` - 課程資料
8. `Subject.csv` - 科目資料
9. `StudentEnrollment.csv` - 學生報名
10. `EnrollmentPeriod.csv` - 報名期間
11. `ExtraFee.csv` - 額外費用
12. `SessionRecord.csv` - 上課記錄
13. `Attendance.csv` - 出席記錄
14. `Leave.csv` - 請假記錄

#### 題庫模組 (6 個)
15. `QuestionBank.csv` - 題庫
16. `Hashtag.csv` - 標籤
17. `QuestionTag.csv` - 題目標籤關聯
18. `StudentAnswer.csv` - 學生答案
19. `ErrorLog.csv` - 錯題記錄
20. `ErrorLogImage.csv` - 錯題圖片

#### 錯題筆記模組 (2 個)
21. `StudentMistakeNote.csv` - 學生錯題筆記
22. `StudentMistakeNoteImage.csv` - 錯題筆記圖片

#### 訂餐模組 (4 個)
23. `Restaurant.csv` - 餐廳資料
24. `GroupOrder.csv` - 團購訂單
25. `Order.csv` - 個人訂單
26. `OrderItem.csv` - 訂單項目

#### 學生分組模組 (2 個)
27. `StudentGroup.csv` - 學生群組
28. `StudentGroupStudent.csv` - 學生群組成員

#### 教學資源模組 (8 個)
29. `ContentTemplate.csv` - 內容模板
30. `ContentTemplateTag.csv` - 內容模板標籤
31. `LearningResource.csv` - 學習資源
32. `LearningResourceCourse.csv` - 學習資源課程關聯
33. `LearningResourceStudentGroup.csv` - 學習資源群組關聯
34. `LearningResourceTag.csv` - 學習資源標籤
35. `CoursePdf.csv` - 課程 PDF
36. `CoursePdfStudentGroup.csv` - 課程 PDF 群組關聯

## 如何使用

### 1. 查看模板
所有模板都在 `backend/fixtures/csv/templates/` 資料夾中，每個 CSV 檔案都包含：
- 註解說明
- 外鍵引用格式範例
- 欄位標題（snake_case）
- 兩行範例資料

### 2. 準備匯入資料
```bash
# 複製需要的模板到 data 資料夾
cp backend/fixtures/csv/templates/Student.csv backend/fixtures/csv/data/

# 編輯檔案，填入你的實際資料
nano backend/fixtures/csv/data/Student.csv
```

### 3. 執行匯入
```bash
cd backend

# 匯入所有 CSV 檔案
pnpm seed:csv

# 只匯入特定表格
pnpm seed:csv --tables=Student,Teacher,Course

# 預覽模式（不實際寫入）
pnpm seed:csv --dry-run

# 清空後匯入
pnpm seed:csv --clear

# 遇到錯誤繼續執行
pnpm seed:csv --continue-on-error
```

## 外鍵引用格式

CSV 中使用特殊語法來引用其他模型的記錄：

```
@ModelName:field_name:value
```

### 範例

#### 學生關聯到使用者帳號
```csv
student_id,name,user_id
1,張小明,@CustomUser:username:student001
```

#### 課程關聯到教師
```csv
course_id,course_name,teacher_id
1,國三數學A班,@Teacher:teacher_id:1
```

#### 報名記錄關聯多個模型
```csv
enrollment_id,student_id,course_id
1,@Student:student_id:1,@Course:course_id:1
```

## 目前 data 資料夾中的檔案

已經準備好以下資料檔案（可以直接匯入）：

1. **CustomUser.csv** - 包含 2 位學生和 3 位教師帳號
   - student001, student002
   - teacher001 (郭永明), teacher002 (莊智凱), teacher003 (陳如吟)

2. **Teacher.csv** - 包含 3 位教師
   - 郭永明 - 數學
   - 莊智凱 - 數學
   - 陳如吟 - **會計** ✓

3. **Student.csv** - 包含學生資料

4. **Subject.csv** - 包含科目資料

5. **Course.csv** - 包含課程資料

## 注意事項

### 匯入順序
系統會自動處理依賴關係，但建議按以下順序準備資料：

1. **基礎資料**（無外鍵）
   - CustomUser
   - Subject
   - Restaurant

2. **核心資料**（依賴基礎資料）
   - Student
   - Teacher
   - Role

3. **關聯資料**（依賴核心資料）
   - Course
   - StudentEnrollment
   - QuestionBank

4. **進階關聯**（依賴多個模型）
   - Attendance
   - ErrorLog
   - Order

### 資料驗證
- 外鍵引用的目標記錄必須存在
- 必填欄位不能為空
- 日期格式：`YYYY-MM-DD` 或 `YYYY-MM-DD HH:MM:SS`
- 時間格式：`HH:MM` 或 `HH:MM:SS`
- 布林值：`true` 或 `false`

## 重新生成模板

如果需要重新生成所有模板（會覆蓋現有的 templates 資料夾內容）：

```bash
# 生成所有模型的模板
pnpm seed:csv:templates

# 只生成特定模型
pnpm seed:csv:templates --models=Student,Teacher

# 生成空白模板（不含範例）
pnpm seed:csv:templates --empty
```

## 技術細節

### 模型名稱對應
- CSV 檔名使用簡化名稱（如 `Student.csv`）
- 實際對應到 Prisma 模型名稱（如 `cramschoolStudent`）
- 系統會自動處理名稱轉換

### 欄位名稱轉換
- CSV 使用 **snake_case**（如 `student_id`, `first_name`）
- Prisma 使用 **camelCase**（如 `studentId`, `firstName`）
- 匯入時會自動轉換

## 完成的改進

1. ✅ 更新 `template-generator.ts`，添加所有模型的範例資料
2. ✅ 更新 `utils.ts`，添加 CoursePdf 相關模型的對應關係
3. ✅ 生成 36 個 CSV 模板檔案
4. ✅ 在 data 資料夾中準備好 Teacher 和 CustomUser 的實際資料
5. ✅ 正確設定陳如吟老師的專業為「會計」
6. ✅ 建立完整的外鍵關聯（Teacher → CustomUser）

## 下一步

1. 根據需要複製更多模板到 `data` 資料夾
2. 填入實際的業務資料
3. 執行 `pnpm seed:csv` 匯入資料庫
4. 使用 `pnpm seed:csv --dry-run` 先預覽結果

---

如有問題，請參考：
- `backend/CSV_SEEDER_GUIDE.md` - 詳細使用指南
- `backend/CSV_QUICK_REFERENCE.md` - 快速參考
