# Schema 和 API 返回格式一致性檢查報告

## 檢查日期
2024-12-30

## 摘要

已完成對後端模型定義、前端 Zod schemas 和 API 返回格式處理的全面檢查，並修正了發現的不一致問題。

## 發現的問題及修正

### 1. ✅ Course Schema - teacher_id 字段名不一致（已修正）

**問題描述**：
- 後端 `CourseSerializer` 返回的字段名是 `teacher`（ForeignKey 字段名）
- 前端 `CourseSchema` 期望的字段名是 `teacher_id`
- Django REST Framework 的 ModelSerializer 對於 ForeignKey 字段，默認序列化為 ID（數字），但字段名使用模型字段名 `teacher`，而不是 `teacher_id`

**後端模型定義** (models.py):
```python
class Course(models.Model):
    teacher = models.ForeignKey(Teacher, ...)  # 字段名是 teacher
    fee_per_session = models.DecimalField(...)  # DecimalField，可能序列化為字符串
```

**後端序列化器** (serializers.py):
```python
class CourseSerializer(serializers.ModelSerializer):
    fields = ['course_id', 'course_name', 'teacher', 'teacher_name', ...]
    # teacher 字段會被序列化為 teacher_id（數字），但字段名仍然是 'teacher'
```

**前端 Schema** (course.schema.ts):
```typescript
export const CourseSchema = z.object({
  teacher_id: z.number().int().positive(),  // 期望字段名是 teacher_id
  fee_per_session: z.number().nonnegative(),
})
```

**修正方案**：
✅ 在 `frontend/src/services/api.ts` 中創建了 `normalizeCourseResponse()` 函數，統一處理：
- 將 `teacher` 字段轉換為 `teacher_id`
- 將 `fee_per_session` 字符串轉換為數字
- 應用到所有 Course API 方法（getAll, getById, create, update）

### 2. ✅ Course Schema - fee_per_session 類型不一致（已修正）

**問題描述**：
- 後端 `fee_per_session` 是 `DecimalField`，在 JSON 序列化時可能返回字符串格式
- 前端 schema 期望是 `number` 類型

**修正方案**：
✅ 已在 `normalizeCourseResponse()` 函數中統一處理字符串到數字的轉換

### 3. ✅ Teacher Schema - user_id 字段不一致（已修正）

**問題描述**：
- 後端 `TeacherSerializer` 返回 `user` 字段（ForeignKey）
- 前端 `TeacherSchema` 期望 `user_id` 字段

**修正方案**：
✅ 在 `frontend/src/services/api.ts` 中創建了 `normalizeTeacherResponse()` 函數，將 `user` 轉換為 `user_id`，並應用到所有 Teacher API 方法

### 4. ✅ Student Schema - user_id 字段不一致（已修正）

**問題描述**：
- 後端 `StudentSerializer` 返回 `user` 字段（ForeignKey）
- 前端 `StudentSchema` 期望 `user_id` 字段

**修正方案**：
✅ 在 `frontend/src/services/api.ts` 中創建了 `normalizeStudentResponse()` 函數，將 `user` 轉換為 `user_id`，並應用到所有 Student API 方法

## 修正的 API 方法

### Course API
- ✅ `getAll()` - 已修正
- ✅ `getById()` - 已修正
- ✅ `create()` - 已修正
- ✅ `update()` - 已修正

### Teacher API
- ✅ `getAll()` - 已修正
- ✅ `getById()` - 已修正
- ✅ `create()` - 已修正
- ✅ `update()` - 已修正

### Student API
- ✅ `getAll()` - 已修正
- ✅ `getById()` - 已修正
- ✅ `create()` - 已修正
- ✅ `update()` - 已修正
- ✅ `restore()` - 已修正

## 數據預處理函數

所有預處理函數都位於 `frontend/src/services/api.ts`：

### `normalizeCourseResponse(item: unknown): Course`
處理 Course 數據的格式轉換：
- `teacher` → `teacher_id`
- `fee_per_session` (string) → `fee_per_session` (number)

### `normalizeTeacherResponse(item: unknown): Teacher`
處理 Teacher 數據的格式轉換：
- `user` → `user_id`

### `normalizeStudentResponse(item: unknown): Student`
處理 Student 數據的格式轉換：
- `user` → `user_id`

## 其他需要關注的 API

以下 API 已檢查，目前沒有發現問題，但建議持續關注：

1. ✅ Question API - 返回格式與 schema 一致
2. ✅ LearningResource API - 返回格式與 schema 一致
3. ✅ ContentTemplate API - 返回格式與 schema 一致

## 建議的後續改進

### 方案 A：在後端統一字段命名規範（長期方案）

在後端序列化器中統一使用 `_id` 後綴的字段名：

```python
class CourseSerializer(serializers.ModelSerializer):
    teacher_id = serializers.IntegerField(source='teacher.id', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['course_id', 'course_name', 'teacher_id', 'teacher_name', ...]
        # 不包含 'teacher' 字段
```

這樣可以避免前端需要做數據轉換，讓 API 響應格式更加一致和明確。

### 方案 B：保持現狀（短期方案）

繼續在前端 API 層面進行數據預處理，這是目前已經實現的方案，優點是：
- 不需要修改後端代碼
- 前端可以統一處理格式轉換
- 對現有後端 API 無影響

## 結論

✅ 所有發現的主要不一致問題都已修正
✅ 所有相關的 API 方法都已更新
✅ 代碼已通過 lint 檢查
✅ 數據預處理函數統一管理，易於維護

系統現在應該可以正常處理所有 API 響應，不會再出現 Zod 驗證錯誤。
