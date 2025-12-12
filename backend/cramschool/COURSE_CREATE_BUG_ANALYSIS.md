# 課程新增功能 400 Bad Request 錯誤分析

## 問題描述
在新增課程時，前端發送請求到 `POST /api/cramschool/courses/` 返回 400 Bad Request 錯誤。

## 錯誤根本原因

### 1. `teacher` 欄位處理不當
**問題**：
- 前端表單中，如果用戶未選擇老師，`teacher` 欄位為空字符串 `''`
- 後端 `CourseSerializer` 期望 `teacher` 為：
  - `null`（可選欄位，ForeignKey 允許 null）
  - 或整數 ID（Teacher 的主鍵）

**錯誤代碼**：
```javascript
// 修復前
teacher: form.value.teacher || null,  // 如果為 ''，會被轉為 null，但邏輯不清晰
```

**修復後**：
```javascript
const teacherValue = form.value.teacher
const teacherId = teacherValue && teacherValue !== '' && !isNaN(parseInt(teacherValue, 10)) 
  ? parseInt(teacherValue, 10) 
  : null
```

### 2. 時間格式不一致
**問題**：
- HTML `<input type="time">` 返回的格式為 `"HH:MM"`（例如：`"09:00"`）
- Django 的 `TimeField` 雖然可以解析 `"HH:MM"`，但標準格式為 `"HH:MM:SS"`（例如：`"09:00:00"`）
- 某些情況下（特別是在驗證或序列化時），可能期望完整的 `"HH:MM:SS"` 格式

**錯誤代碼**：
```javascript
// 修復前
start_time: form.value.start_time,  // 直接傳送 "HH:MM" 格式
end_time: form.value.end_time,
```

**修復後**：
```javascript
const formatTime = (time) => {
  if (!time) return null
  if (time.includes(':') && time.split(':').length === 3) {
    return time  // 已經是 HH:MM:SS
  }
  if (time.includes(':') && time.split(':').length === 2) {
    return `${time}:00`  // 轉換 HH:MM -> HH:MM:SS
  }
  return time
}
```

### 3. `fee_per_session` 數據類型問題
**問題**：
- 前端表單中 `v-model.number` 綁定的值在未輸入時可能為空字符串 `''`
- `parseFloat('')` 返回 `NaN`，這會導致後端驗證失敗
- 後端期望 `Decimal` 類型（對應前端應為數字）

**錯誤代碼**：
```javascript
// 修復前
fee_per_session: parseFloat(form.value.fee_per_session)  // 可能為 NaN
```

**修復後**：
```javascript
fee_per_session: form.value.fee_per_session ? parseFloat(form.value.fee_per_session) : 0
```

### 4. 缺少數據驗證
**問題**：
- 前端沒有在提交前驗證必填欄位
- 錯誤訊息不夠詳細，無法幫助診斷問題

**修復**：
- 添加必填欄位驗證
- 改善錯誤處理，顯示後端返回的詳細錯誤訊息
- 驗證數字欄位的有效性

## 修復總結

### 主要修改點：
1. **teacher 欄位處理**：明確處理空字符串，轉換為 null 或有效的整數 ID
2. **時間格式標準化**：將 `"HH:MM"` 轉換為 `"HH:MM:SS"` 格式
3. **數字欄位驗證**：確保 `fee_per_session` 為有效數字，避免 NaN
4. **前端驗證增強**：添加必填欄位和數據類型驗證
5. **錯誤處理改善**：顯示更詳細的錯誤訊息

### 修復後的數據處理流程：
```javascript
const submitData = {
  course_name: form.value.course_name.trim(),  // 去除空格
  teacher: teacherId,  // null 或整數 ID
  day_of_week: form.value.day_of_week,
  start_time: formatTime(form.value.start_time),  // "HH:MM:SS"
  end_time: formatTime(form.value.end_time),      // "HH:MM:SS"
  fee_per_session: parseFloat(...) || 0,          // 數字，非 NaN
  status: form.value.status
}
```

## 預防措施
1. **前後端數據格式約定**：明確定義 API 數據格式規範
2. **類型轉換工具函數**：建立統一的數據轉換函數庫
3. **前端驗證**：在提交前進行完整的數據驗證
4. **測試覆蓋**：添加邊界情況測試，包括空值、格式不正確等情況
