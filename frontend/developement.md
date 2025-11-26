
---

# 📚 補習班復合管理系統 - 資料庫規格書

這份規格書定義了系統中所有資料庫表格的結構、欄位名稱、資料類型和主要目的。

## I. 行政與基礎資料模組

*（此區塊與先前保持一致，確保基礎資料的穩定性。）*

### 1. 學生表格 (`Student`)

| 欄位名稱 | 資料類型 | Key | 說明 |
| :--- | :--- | :--- | :--- |
| `student_id` | INT | Primary Key | 學生唯一識別碼。 |
| `name` | VARCHAR(100) | | 學生姓名。 |
| `school` | VARCHAR(100) | | 學生就讀學校名稱。 |
| `grade` | ENUM/VARCHAR(20) | | 學生年級。 |
| `phone` | VARCHAR(20) | | 學生主要聯絡電話/手機。 |
| `emergency_contact_name` | VARCHAR(100) | | 緊急聯絡人姓名。 |
| `emergency_contact_phone` | VARCHAR(20) | | 緊急聯絡人電話。 |
| `notes` | TEXT | | 學生相關備註。 |

### 2. 老師表格 (`Teacher`)

| 欄位名稱 | 資料類型 | Key | 說明 |
| :--- | :--- | :--- | :--- |
| `teacher_id` | INT | Primary Key | 老師唯一識別碼。 |
| `name` | VARCHAR(100) | | 老師姓名。 |
| `username` | VARCHAR(50) | Unique | 老師登入系統使用的帳號。 |
| `password_hash` | VARCHAR(255) | | 儲存加密後的密碼。 |
| `permission_level` | ENUM('Teacher', 'Admin') | | 系統權限等級。 |
| `phone` | VARCHAR(20) | | 老師聯絡電話。 |
| `hire_date` | DATE | | 老師入職日期。 |

### 3. 課程表格 (`Course`)

| 欄位名稱 | 資料類型 | Key | 說明 |
| :--- | :--- | :--- | :--- |
| `course_id` | INT | Primary Key | 課程唯一識別碼。 |
| `course_name` | VARCHAR(100) | | 課程名稱 (如：高三數學總複習班)。 |
| `teacher_id` | INT | Foreign Key | 授課老師 ID，連結到 `Teacher.teacher_id`。 |
| `start_time` | TIME | | 每日課程開始時間。 |
| `end_time` | TIME | | 每日課程結束時間。 |
| `day_of_week` | ENUM('Mon', 'Tue', ...) | | 課程上課日。 |
| `fee_per_session` | DECIMAL(10, 2) | | 每堂課的收費金額。 |
| `status` | ENUM('Active', 'Pending', 'Closed') | | 課程狀態。 |

### 4. 學生課程報名 (`StudentEnrollment`)

| 欄位名稱 | 資料類型 | Key | 說明 |
| :--- | :--- | :--- | :--- |
| `enrollment_id` | INT | Primary Key | 報名記錄唯一識別碼。 |
| `student_id` | INT | Foreign Key | 學生 ID。 |
| `course_id` | INT | Foreign Key | 課程 ID。 |
| `enroll_date` | DATE | | 學生報名此課程的日期。 |
| `discount_rate` | DECIMAL(5, 2) | | 給予該學生的學費折扣百分比。 |

## II. 會計與費用模組

### 5. 學生額外收費 (`ExtraFee`)

| 欄位名稱 | 資料類型 | Key | 說明 |
| :--- | :--- | :--- | :--- |
| `fee_id` | INT | Primary Key | 收費記錄唯一識別碼。 |
| `student_id` | INT | Foreign Key | 學生 ID。 |
| `item` | ENUM('Transport', 'Meal', 'Book', 'Other') | | 收費名目。 |
| `amount` | DECIMAL(10, 2) | | 收費金額。 |
| `fee_date` | DATE | | 費用發生的日期。 |
| `payment_status` | ENUM('Paid', 'Unpaid', 'Partial') | | 繳費狀態。 |

## III. 點名與出缺勤模組

### 6. 課程上課記錄 (`SessionRecord`)

| 欄位名稱 | 資料類型 | Key | 說明 |
| :--- | :--- | :--- | :--- |
| `session_id` | INT | Primary Key | 課程場次唯一識別碼。 |
| `course_id` | INT | Foreign Key | 課程 ID。 |
| `session_date` | DATE | | 實際開課的日期。 |

### 7. 出席記錄 (`Attendance`)

| 欄位名稱 | 資料類型 | Key | 說明 |
| :--- | :--- | :--- | :--- |
| `attendance_id` | INT | Primary Key | 出席記錄唯一識別碼。 |
| `session_id` | INT | Foreign Key | 課程場次 ID。 |
| `student_id` | INT | Foreign Key | 學生 ID。 |
| `status` | ENUM('Present', 'Absent', 'Late', 'Leave') | | 出席狀態。 |

### 8. 請假 (`Leave`)

| 欄位名稱 | 資料類型 | Key | 說明 |
| :--- | :--- | :--- | :--- |
| `leave_id` | INT | Primary Key | 請假記錄唯一識別碼。 |
| `student_id` | INT | Foreign Key | 學生 ID。 |
| `course_id` | INT | Foreign Key | 針對哪一課程請假。 |
| `leave_date` | DATE | | 請假的日期。 |
| `reason` | VARCHAR(255) | | 請假原因。 |
| `approval_status` | ENUM('Pending', 'Approved', 'Rejected') | | 審核狀態。 |

## IV. 教學與老師模組 (錯題/題庫系統)

### 9. 題目庫 (`QuestionBank`)

*題目內容使用 Markdown + LaTeX 儲存。*

| 欄位名稱 | 資料類型 | Key | 說明 |
| :--- | :--- | :--- | :--- |
| `question_id` | INT | Primary Key | 題目唯一識別碼。 |
| `subject` | ENUM('Eng', 'Math', ...) | | 科目。 |
| `level` | ENUM('JHS', 'SHS', 'VCS') | | 適用年級/階段。 |
| `chapter` | VARCHAR(100) | | 題目所屬的章節/單元。 |
| **`content`** | TEXT | | **題目內容 (Markdown + LaTeX 格式)。** |
| `image_path` | VARCHAR(255) | | 題目圖片或複雜圖形檔案路徑。 |
| `correct_answer` | TEXT | | 題目的正確答案。 |
| `difficulty` | INT (1-5) | | 難度等級。 |

### 10. **自訂標籤 (Hashtag) 表格 (`Hashtag`)** 🆕

*儲存所有老師創建過的標籤定義。*

| 欄位名稱 | 資料類型 | Key | 說明 |
| :--- | :--- | :--- | :--- |
| **`tag_id`** | INT | Primary Key | 標籤唯一識別碼。 |
| **`tag_name`** | VARCHAR(50) | Unique | 標籤的名稱 (例如：`#陷阱題`、`#必考三角`、`#被動語態時態`)。 |
| `creator_id` | INT | Foreign Key | 創建此標籤的老師 ID (連結到 `Teacher.teacher_id`)。 |

### 11. **題目與標籤關聯表格 (`QuestionTag`)** 🆕

*用於建立一題多標籤 (Many-to-Many) 的關係。*

| 欄位名稱 | 資料類型 | Key | 說明 |
| :--- | :--- | :--- | :--- |
| `question_tag_id` | INT | Primary Key | 關聯記錄唯一識別碼。 |
| **`question_id`** | INT | Foreign Key | 題目 ID (連結到 `QuestionBank.question_id`)。 |
| **`tag_id`** | INT | Foreign Key | 標籤 ID (連結到 `Hashtag.tag_id`)。 |
| *複合主鍵:* | (question\_id, tag\_id) | | 確保同一題目不會重複被標記同一個標籤。 |

### 12. 學生作答記錄 (`StudentAnswer`)

| 欄位名稱 | 資料類型 | Key | 說明 |
| :--- | :--- | :--- | :--- |
| `answer_id` | INT | Primary Key | 作答記錄唯一識別碼。 |
| `student_id` | INT | Foreign Key | 學生 ID。 |
| `question_id` | INT | Foreign Key | 題目 ID。 |
| `test_name` | VARCHAR(100) | | 該作答所屬的測驗/作業名稱。 |
| `is_correct` | BOOLEAN | | 是否答對。 |
| `scanned_file_path` | VARCHAR(255) | | 學生考卷掃描檔連結。 |

### 13. 錯題本 (`ErrorLog`)

| 欄位名稱 | 資料類型 | Key | 說明 |
| :--- | :--- | :--- | :--- |
| `error_log_id` | INT | Primary Key | 錯誤記錄唯一識別碼。 |
| `student_id` | INT | Foreign Key | 學生 ID。 |
| `question_id` | INT | Foreign Key | 錯題的 ID。 |
| `error_count` | INT | | 學生重複犯此題錯誤的次數。 |
| `review_status` | ENUM('New', 'Reviewing', 'Mastered') | | 追蹤學生對此錯題的掌握狀態。 |

---

## V. 雜項模組

### 14. 店家資訊 (`Store`)

| 欄位名稱 | 資料類型 | Key | 說明 |
| :--- | :--- | :--- | :--- |
| `store_id` | INT | Primary Key | 店家唯一識別碼。 |
| `name` | VARCHAR(100) | | 店家名稱。 |
| `business_hours` | VARCHAR(255) | | 營業時間描述。 |
| `menu_image_path` | VARCHAR(255) | | 菜單圖片檔案路徑。 |

---
