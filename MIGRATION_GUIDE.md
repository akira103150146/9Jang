# 資料庫遷移指南

由於新增了 Subject 模型並修改了 QuestionBank 模型，需要執行以下步驟：

## 步驟 1: 創建遷移文件

```bash
cd backend
# 確保在虛擬環境中
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows

python manage.py makemigrations
```

## 步驟 2: 如果 QuestionBank 表已經有資料

如果 QuestionBank 表中已經有題目資料，需要先手動處理：

### 選項 A: 清空現有題目資料（測試環境）

```bash
python manage.py shell
>>> from cramschool.models import QuestionBank
>>> QuestionBank.objects.all().delete()
>>> exit()
```

### 選項 B: 保留資料並遷移

需要創建資料遷移來將現有的 subject 字串轉換為 Subject 對象。

## 步驟 3: 執行遷移

```bash
python manage.py migrate
```

## 步驟 4: 驗證

```bash
python manage.py shell
>>> from cramschool.models import Subject
>>> Subject.objects.all()
>>> # 應該不會報錯
```

## 如果遇到錯誤

如果遇到 `django.db.utils.IntegrityError` 或類似錯誤，可能需要：

1. 檢查資料庫中是否有 QuestionBank 資料
2. 如果沒有，可以刪除遷移文件重新創建
3. 如果有，需要創建資料遷移

