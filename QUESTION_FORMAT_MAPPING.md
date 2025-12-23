# 題目格式解析說明

## 📋 您的 Markdown 格式

```markdown
1.  **【題號】：07107467 　　【難易度】：中　　【出處】：統測題　　【題源】：101統測C**

> （　　）已知$\frac{\pi}{2} < \theta < \pi$，$\cos\theta = - \frac{3}{5}$，則下列大小關係何者正確？　\
> (A)$\cos\theta < \sin 2\theta < \cos 2\theta < \sin\theta$　
> (B)$\sin 2\theta < \cos 2\theta < \cos\theta < \sin\theta$　
> (C)$\sin 2\theta < \cos\theta < \cos 2\theta < \sin\theta$　
> (D)$\cos\theta < \cos 2\theta < \sin 2\theta < \sin\theta$　

《答案》C

《解析》\
![CH1歷1-解](./media/image1.png)\
∵$\frac{\pi}{2} < \theta < \pi$，$\cos\theta = - \frac{3}{5} \Rightarrow \sin\theta = \frac{4}{5}$\
$${\sin 2\theta = 2\sin\theta\cos\theta = 2 \times \frac{4}{5} \times ( - \frac{3}{5}) = - \frac{24}{25}
}{\cos 2\theta = \cos^{2}\theta - \sin^{2}\theta = ( - \frac{3}{5})^{2} - (\frac{4}{5})^{2}
}{= \frac{9}{25} - \frac{16}{25} = - \frac{7}{25}
}$$∴$\sin 2\theta < \cos\theta < \cos 2\theta < \sin\theta$
```

---

## 🗂️ 解析後的資料庫格式

### 第一部分：題目內容（content 欄位）

```markdown
（　　）已知$\frac{\pi}{2} < \theta < \pi$，$\cos\theta = - \frac{3}{5}$，則下列大小關係何者正確？
(A)$\cos\theta < \sin 2\theta < \cos 2\theta < \sin\theta$
(B)$\sin 2\theta < \cos 2\theta < \cos\theta < \sin\theta$
(C)$\sin 2\theta < \cos\theta < \cos 2\theta < \sin\theta$
(D)$\cos\theta < \cos 2\theta < \sin 2\theta < \sin\theta$
```

**說明**：
- ✅ 保留題目敘述
- ✅ 保留所有選項
- ✅ 保留 LaTeX 數學公式
- ✅ 自動移除 `>` 引用符號

---

### 第二部分：答案（從 correct_answer 欄位中提取）

```
C
```

**說明**：
- ✅ 純答案值
- ✅ 支援單選（A）、多選（A,C,D）、數值等

---

### 第三部分：解析（存入 correct_answer 欄位）

完整的 `correct_answer` 欄位內容：

```markdown
**《答案》C**

**《解析》**

![CH1歷1-解](https://storage.googleapis.com/.../image1.png)
∵$\frac{\pi}{2} < \theta < \pi$，$\cos\theta = - \frac{3}{5} \Rightarrow \sin\theta = \frac{4}{5}$
$$\sin 2\theta = 2\sin\theta\cos\theta = 2 \times \frac{4}{5} \times ( - \frac{3}{5}) = - \frac{24}{25}
\cos 2\theta = \cos^{2}\theta - \sin^{2}\theta = ( - \frac{3}{5})^{2} - (\frac{4}{5})^{2}
= \frac{9}{25} - \frac{16}{25} = - \frac{7}{25}
$$∴$\sin 2\theta < \cos\theta < \cos 2\theta < \sin\theta$
```

**說明**：
- ✅ 包含答案標題和答案值
- ✅ 包含完整解析內容
- ✅ 保留 LaTeX 數學公式
- ✅ 圖片路徑已替換為雲端 URL

---

## 📊 完整資料庫映射

| 欄位 | 值 | 說明 |
|------|---|------|
| `question_id` | 自動生成 | 資料庫主鍵 |
| `subject_id` | 從匯入時選擇 | 科目 ID |
| `level` | 從匯入時選擇 | JHS/SHS/VCS |
| `chapter` | 從匯入時填寫 | 章節名稱 |
| **`content`** | **題目內容** | **第一部分：引用區塊內容** |
| **`correct_answer`** | **答案+解析** | **第二+三部分合併** |
| `difficulty` | 3 | 從【難易度】提取（易=1, 中=3, 難=5） |
| `question_type` | SINGLE_CHOICE | 自動判斷題型 |
| `options` | JSON 陣列 | 自動提取選項 |
| `question_number` | 07107467 | 從【題號】提取 |
| `origin` | 統測題 | 從【出處】提取 |
| `origin_detail` | 101統測C | 從【題源】提取 |
| `source` | 101統測C | 優先使用題源，否則使用出處 |
| `created_by` | 當前使用者 | 自動填入 |

---

## 🎯 選項格式

從題目內容中自動提取：

```json
[
  {
    "value": "A",
    "label": "$\\cos\\theta < \\sin 2\\theta < \\cos 2\\theta < \\sin\\theta$"
  },
  {
    "value": "B",
    "label": "$\\sin 2\\theta < \\cos 2\\theta < \\cos\\theta < \\sin\\theta$"
  },
  {
    "value": "C",
    "label": "$\\sin 2\\theta < \\cos\\theta < \\cos 2\\theta < \\sin\\theta$"
  },
  {
    "value": "D",
    "label": "$\\cos\\theta < \\cos 2\\theta < \\sin 2\\theta < \\sin\\theta$"
  }
]
```

**支援格式**：
- ✅ `(A)` 半形括號
- ✅ `（A）` 全形括號
- ✅ 自動清理多餘空白和符號

---

## 🖼️ 圖片處理

### 原始引用
```markdown
![CH1歷1-解](./media/image1.png)
```

### 處理流程
1. 從 `./media/` 資料夾找到 `image1.png`
2. 上傳到雲端儲存（Google Cloud Storage 或本地）
3. 獲取 URL：`https://storage.googleapis.com/.../abc123.png`
4. 替換路徑：`![CH1歷1-解](https://storage.googleapis.com/.../abc123.png)`

### 結果
- ✅ 圖片永久儲存在雲端
- ✅ 題目和解析中的圖片都會被替換
- ✅ 保留圖片的 alt 文字（說明文字）

---

## 📝 實際資料庫記錄範例

```python
QuestionBank {
    question_id: 1234,
    subject_id: 1,  # 數學
    level: 'SHS',  # 高中
    chapter: '三角函數',
    
    # 第一部分：題目內容
    content: '''（　　）已知$\\frac{\\pi}{2} < \\theta < \\pi$，$\\cos\\theta = - \\frac{3}{5}$，則下列大小關係何者正確？
(A)$\\cos\\theta < \\sin 2\\theta < \\cos 2\\theta < \\sin\\theta$
(B)$\\sin 2\\theta < \\cos 2\\theta < \\cos\\theta < \\sin\\theta$
(C)$\\sin 2\\theta < \\cos\\theta < \\cos 2\\theta < \\sin\\theta$
(D)$\\cos\\theta < \\cos 2\\theta < \\sin 2\\theta < \\sin\\theta$''',
    
    # 第二+三部分：答案和解析
    correct_answer: '''**《答案》C**

**《解析》**

![CH1歷1-解](https://storage.googleapis.com/.../image1.png)
∵$\\frac{\\pi}{2} < \\theta < \\pi$，$\\cos\\theta = - \\frac{3}{5} \\Rightarrow \\sin\\theta = \\frac{4}{5}$
$$\\sin 2\\theta = 2\\sin\\theta\\cos\\theta = ...$$
∴$\\sin 2\\theta < \\cos\\theta < \\cos 2\\theta < \\sin\\theta$''',
    
    difficulty: 3,  # 中等難度
    question_type: 'SINGLE_CHOICE',
    
    options: [
        {'value': 'A', 'label': '$\\cos\\theta < \\sin 2\\theta < ...$'},
        {'value': 'B', 'label': '$\\sin 2\\theta < \\cos 2\\theta < ...$'},
        {'value': 'C', 'label': '$\\sin 2\\theta < \\cos\\theta < ...$'},
        {'value': 'D', 'label': '$\\cos\\theta < \\cos 2\\theta < ...$'}
    ],
    
    question_number: '07107467',
    origin: '統測題',
    origin_detail: '101統測C',
    source: '101統測C',
    
    created_at: '2024-12-23 18:00:00',
    created_by: <User: teacher01>
}
```

---

## ✅ 優化重點

### 1. 更智能的選項提取
- ✅ 支援全形和半形括號
- ✅ 正確處理 LaTeX 符號（`$...$`）
- ✅ 自動清理多餘空白和特殊字元

### 2. 完整的解析內容
- ✅ 保留《答案》和《解析》標題
- ✅ 保留所有數學公式
- ✅ 保留所有圖片
- ✅ 保留推導過程

### 3. 圖片路徑處理
- ✅ 自動上傳到雲端
- ✅ 替換為永久 URL
- ✅ 支援多張圖片
- ✅ 支援子資料夾

---

## 🎉 使用效果

### 匯入前
- 📄 Markdown 檔案 + 📁 圖片資料夾

### 匯入後
- ✅ 題目內容完整
- ✅ 答案和解析清楚分離
- ✅ 選項自動提取
- ✅ 圖片永久儲存
- ✅ 所有元資料完整

### 在前端顯示時
```
題目：（　　）已知...則下列大小關係何者正確？
選項：
  ○ A. $\cos\theta < \sin 2\theta < ...$
  ○ B. $\sin 2\theta < \cos 2\theta < ...$
  ● C. $\sin 2\theta < \cos\theta < ...$  ← 正確答案
  ○ D. $\cos\theta < \cos 2\theta < ...$

【解析】
∵ $\frac{\pi}{2} < \theta < \pi$...
[圖片顯示]
∴ $\sin 2\theta < \cos\theta < ...$
```

---

## 📞 注意事項

1. **圖片路徑**必須使用 `./media/` 格式
2. **答案**必須使用《答案》標籤
3. **解析**必須使用《解析》標籤
4. **選項**必須使用 `(A)` 或 `（A）` 格式
5. **LaTeX** 公式會完整保留

您的格式已經完美支援，可以直接匯入！🎉

