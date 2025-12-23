# 📚 Markdown 題庫匯入功能

在網頁介面 `http://172.18.69.55:5173/questions` 的「匯入外部題本」功能中，您現在可以直接上傳 Markdown 檔案和圖片資料夾，自動匯入到題庫資料庫！

## 🚀 使用方法

### 步驟 1：準備您的教材

將您的教材整理成以下結構：

```
my_questions/
├── chapter1.md          # Markdown 題目檔案
└── media/               # 圖片資料夾
    ├── image1.png
    ├── image2.png
    └── image3.png
```

### 步驟 2：開啟匯入頁面

1. 登入系統（使用教師帳號）
2. 進入「題庫管理」頁面：`http://172.18.69.55:5173/questions`
3. 點擊「**匯入外部題本**」按鈕

### 步驟 3：上傳檔案

1. **選擇 Markdown 檔案**：點擊上傳區域，選擇您的 `.md` 檔案
2. **選擇圖片資料夾**（選填）：點擊圖片上傳區域，選擇包含圖片的資料夾
3. **填寫必要資訊**：
   - 科目（必填）
   - 適用年級（必填）：國中/高中/高職
   - 章節/單元（必填）

### 步驟 4：預覽題目

點擊「**預覽題目**」按鈕，系統會：
- 解析 Markdown 檔案
- 顯示將要匯入的題目列表
- 顯示圖片數量

### 步驟 5：確認匯入

檢查預覽無誤後，點擊「**確認匯入**」按鈕，系統會：
- 自動上傳所有圖片到伺服器
- 替換 Markdown 中的圖片路徑為上傳後的 URL
- 將題目匯入到題庫資料庫

---

## 📋 Markdown 格式要求

### 支援的格式

您提供的格式已經完全支援！

```markdown
**題型：單選題**

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
$$\sin 2\theta = 2\sin\theta\cos\theta = 2 \times \frac{4}{5} \times ( - \frac{3}{5}) = - \frac{24}{25}$$
```

### 格式說明

#### 題目元資料
```
【題號】：07107467        # 題目編號
【難易度】：中           # 易/中/難（對應 1/3/5 星）
【出處】：統測題         # 題目出處
【題源】：101統測C       # 詳細來源
```

#### 題目內容
- 使用 `>` 引用區塊包裹
- 支援 LaTeX 數學公式：`$...$` 或 `$$...$$`
- 支援選項：`(A)`、`(B)`、`(C)`、`(D)`

#### 答案與解析
```
《答案》C                 # 正確答案

《解析》                  # 解析內容
解析文字...
![說明](./media/image.png)  # 圖片引用
```

### 圖片引用格式

**重要**：圖片路徑必須使用以下格式：

```markdown
![圖片說明](./media/image1.png)
```

✅ 正確：`./media/image1.png`  
❌ 錯誤：`media/image1.png`  
❌ 錯誤：`../media/image1.png`

---

## ✨ 功能特色

### 自動處理
- ✅ 自動解析題目元資料（題號、難度、出處）
- ✅ 自動識別題型（單選題、多選題、填充題等）
- ✅ 自動提取選項
- ✅ 自動上傳圖片到雲端
- ✅ 自動替換圖片路徑為 CDN URL

### 支援項目
- ✅ LaTeX 數學公式
- ✅ 多種圖片格式（PNG, JPG, GIF, WebP）
- ✅ 批次匯入多題
- ✅ 錯誤提示和警告
- ✅ 預覽功能

---

## 🎯 實際範例

### 範例 1：單選題

```markdown
1.  **【題號】：07107467 　　【難易度】：中　　【出處】：統測題**

> （　　）若 $\tan\theta = \frac{4}{3}$，則 $\cos 2\theta$ 之值為何？
> (A) $-\frac{24}{25}$　(B) $-\frac{7}{25}$　(C) $\frac{7}{25}$　(D) $\frac{24}{25}$

《答案》B

《解析》
由 $\tan\theta = \frac{4}{3}$ 可知 $\sin\theta = \pm\frac{4}{5}$，$\cos\theta = \pm\frac{3}{5}$
$$\cos 2\theta = \cos^{2}\theta - \sin^{2}\theta = \frac{9}{25} - \frac{16}{25} = -\frac{7}{25}$$
```

### 範例 2：含圖片的題目

```markdown
2.  **【題號】：07107468 　　【難易度】：難**

> ![](./media/diagram.png)
> 已知三角形 ABC，$\overline{AB} = 13$，求面積？
> (A) 30　(B) 36　(C) 42　(D) 48

《答案》A

《解析》
![解法圖](./media/solution.png)
根據圖示，使用公式...
```

---

## ⚙️ 技術細節

### 匯入流程

```
1. 上傳 Markdown 檔案和圖片
    ↓
2. 解析 Markdown 內容
    ↓
3. 提取題目元資料
    ↓
4. 上傳圖片到雲端 (GCS or local)
    ↓
5. 替換圖片路徑
    ↓
6. 寫入資料庫 (QuestionBank)
```

### API 端點

**預覽**
```
POST /api/cramschool/questions/preview_from_markdown/
Content-Type: multipart/form-data

- markdown_file: .md 檔案
- images: 圖片檔案（多個）
- subject_id: 科目 ID
- level: 年級 (JHS/SHS/VCS)
- chapter: 章節
```

**匯入**
```
POST /api/cramschool/questions/import_from_markdown/
Content-Type: multipart/form-data

（參數同上）
```

### 資料庫結構

題目會被儲存到 `QuestionBank` 模型：

```python
{
    'subject_id': 科目ID,
    'level': 年級,
    'chapter': 章節,
    'content': 題目內容（Markdown + LaTeX），
    'correct_answer': 答案和解析,
    'difficulty': 難度（1-5），
    'question_type': 題型,
    'options': 選項列表,
    'question_number': 題號,
    'origin': 出處,
    'origin_detail': 題源,
    'source': 來源,
    'created_by': 建立者
}
```

---

## ❓ 常見問題

### Q1: 圖片上傳失敗怎麼辦？

**A:** 檢查：
- 圖片格式是否支援（PNG, JPG, GIF, WebP）
- 圖片大小是否超過 5MB
- 圖片檔名是否含中文或特殊字元（建議使用英文和數字）

### Q2: 如何批次匯入多個章節？

**A:** 
1. 將每個章節的題目整理成獨立的 Markdown 檔案
2. 圖片可以放在共用的 media 資料夾
3. 逐個檔案匯入，或聯繫開發者實作批次匯入功能

### Q3: 題目格式不完全符合怎麼辦？

**A:** 
系統會盡量解析，但建議：
- 題目元資料盡量完整
- 使用標準的《答案》和《解析》標籤
- 圖片路徑統一使用 `./media/` 格式

### Q4: 可以匯入哪些題型？

**A:** 目前支援：
- 單選題（SINGLE_CHOICE）
- 多選題（MULTIPLE_CHOICE）
- 填充題（FILL_IN_BLANK）
- 程式題（PROGRAMMING）
- 聽力題（LISTENING）

系統會根據選項格式自動判斷題型。

### Q5: 匯入後可以修改嗎？

**A:** 可以！匯入後：
1. 在題庫列表中找到該題
2. 點擊「編輯」按鈕
3. 使用編輯器修改內容
4. 儲存更新

---

## 🎓 最佳實踐

### 1. 檔案命名
- ✅ 使用有意義的名稱：`chapter1_trigonometry.md`
- ✅ 避免空格：使用連字號或底線
- ✅ 圖片使用英文命名：`image1.png`, `diagram_01.png`

### 2. 內容組織
- ✅ 每個檔案包含同一章節的題目
- ✅ 題目按序號排列
- ✅ 保持格式一致

### 3. 圖片管理
- ✅ 所有圖片放在同一個 media 資料夾
- ✅ 使用清晰的檔名（如 `ch1_q1.png`）
- ✅ 壓縮大圖片（< 1MB 為佳）

### 4. 測試流程
- ✅ 先用小檔案測試（1-2 題）
- ✅ 確認格式正確後再批次匯入
- ✅ 使用預覽功能檢查

---

## 📞 技術支援

### 檢查清單

匯入前確認：
- [ ] Markdown 檔案編碼是 UTF-8
- [ ] 圖片路徑格式正確（`./media/xxx`）
- [ ] 圖片檔名不含中文或特殊字元
- [ ] 已選擇科目、年級、章節
- [ ] 使用教師帳號登入

### 錯誤排查

| 錯誤訊息 | 可能原因 | 解決方法 |
|---------|---------|---------|
| 未能解析出任何題目 | 格式不符 | 檢查題目是否包含【題號】標籤 |
| 圖片上傳失敗 | 檔案過大或格式不支援 | 壓縮圖片或轉換格式 |
| 科目不存在 | 科目ID錯誤 | 重新選擇科目 |
| 創建題目失敗 | 必填欄位缺失 | 檢查每題是否包含完整資訊 |

---

## 🎉 完成！

現在您可以：
1. 進入題庫頁面
2. 點擊「匯入外部題本」
3. 上傳您的 Markdown 檔案和圖片
4. 開始使用！

如有任何問題，請聯繫系統管理員。

