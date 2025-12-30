# 資料庫 Seeder 使用說明

## 概述

這個目錄包含用於初始化資料庫的 JSON 格式資料文件。

## 使用方法

### 基本用法

```bash
# 從 JSON 文件初始化資料
python manage.py seed_data fixtures/seed_data_example.json

# 預覽模式（不會實際寫入資料庫）
python manage.py seed_data fixtures/seed_data_example.json --dry-run

# 清除現有資料後再初始化（危險操作）
python manage.py seed_data fixtures/seed_data_example.json --clear
```

## JSON 文件格式

```json
{
  "models": {
    "app_label.ModelName": [
      {
        "lookup_fields": ["field1", "field2"],
        "data": {
          "field1": "value1",
          "field2": "value2",
          "foreign_key_field": "app_label.ModelName:lookup_field:lookup_value"
        }
      }
    ]
  }
}
```

### 欄位說明

- **models**: 包含所有要初始化的模型資料
- **app_label.ModelName**: Django 模型的完整路徑（例如：`account.CustomUser`、`cramschool.Student`）
- **lookup_fields**: 用於查找現有記錄的欄位列表（用於 `update_or_create`）
- **data**: 要創建或更新的資料

### 外鍵引用格式

當需要引用其他模型時，使用以下格式：

```
"app_label.ModelName:lookup_field:lookup_value"
```

例如：
- `"user": "account.CustomUser:username:student1"` - 引用 username 為 "student1" 的 CustomUser
- `"subject": "cramschool.Subject:code:MATH"` - 引用 code 為 "MATH" 的 Subject

### 注意事項

1. **lookup_fields**: 如果指定了 `lookup_fields`，系統會使用這些欄位查找現有記錄：
   - 如果找到，則更新該記錄
   - 如果沒找到，則創建新記錄

2. **外鍵順序**: 確保被引用的模型在引用它的模型之前定義（例如：先定義 `CustomUser`，再定義 `Student`）

3. **唯一性**: `lookup_fields` 中的欄位組合應該能唯一識別一條記錄

## 範例

### 創建用戶和學生

```json
{
  "models": {
    "account.CustomUser": [
      {
        "lookup_fields": ["username"],
        "data": {
          "username": "student1",
          "email": "student1@example.com",
          "role": "STUDENT"
        }
      }
    ],
    "cramschool.Student": [
      {
        "lookup_fields": ["name", "school"],
        "data": {
          "name": "張三",
          "school": "XX國中",
          "grade": "七年級",
          "user": "account.CustomUser:username:student1"
        }
      }
    ]
  }
}
```

### 創建課程和報名記錄

```json
{
  "models": {
    "cramschool.Course": [
      {
        "lookup_fields": ["course_name"],
        "data": {
          "course_name": "七年級數學",
          "subject": "cramschool.Subject:code:MATH",
          "teacher": "account.CustomUser:username:teacher1"
        }
      }
    ],
    "cramschool.StudentEnrollment": [
      {
        "lookup_fields": ["student", "course"],
        "data": {
          "student": "cramschool.Student:name:張三",
          "course": "cramschool.Course:course_name:七年級數學",
          "enroll_date": "2024-01-01"
        }
      }
    ]
  }
}
```

## 安全提示

- 使用 `--dry-run` 先預覽操作結果
- 在生產環境使用前，務必備份資料庫
- `--clear` 選項會刪除所有現有資料，請謹慎使用

