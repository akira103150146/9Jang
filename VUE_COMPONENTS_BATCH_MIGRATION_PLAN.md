# Vue 組件批量遷移計劃

## ✅ 已完成（19 個組件）

### BlockEditor 相關（16 個）✅ 100%
1. BlockEditor.vue
2. CircuitBlockComponent.vue
3. LaTeXBlockComponent.vue
4. InlineLatexComponent.vue
5. QuestionBlockComponent.vue
6. DragHandle.vue
7. PageBreakBlockComponent.vue
8. SectionBlockComponent.vue
9. TemplateBlockComponent.vue
10. Diagram2DBlockComponent.vue
11. Diagram3DBlockComponent.vue
12. ImagePlaceholderComponent.vue
13. ImageSelectorModal.vue
14. QuestionSelectorModal.vue
15. TemplateSelectorModal.vue
16. SlashMenu.vue

### 核心組件（3 個）✅
17. App.vue
18. Sidebar.vue
19. forms/BaseInput.vue
20. forms/BaseSelect.vue
21. forms/BaseCheckbox.vue

## 📝 剩餘待遷移組件（60 個）

### Views 目錄（31 個）
- Login.vue
- Dashboard.vue
- CourseList.vue
- CourseForm.vue
- TeacherList.vue
- TeacherForm.vue
- StudentList.vue
- StudentForm.vue
- QuestionBank.vue
- QuestionForm.vue
- QuestionImport.vue
- TemplateEditor.vue
- ResourceEditor.vue
- EnrollmentForm.vue
- StudentHome.vue
- StudentMyCourses.vue
- StudentMistakeBook.vue
- StudentErrorLog.vue
- StudentFeeTracker.vue
- AttendanceTracker.vue
- FeeTracker.vue
- FeeForm.vue
- LeaveForm.vue
- TuitionGenerator.vue
- LunchOrderSystem.vue
- JoinGroupOrder.vue
- GroupOrderDetail.vue
- RoleManagement.vue
- AuditLog.vue
- StoreInfo.vue
- BlockEditorTest.vue

### Components 目錄（29 個）
- ResourceEditorSidebar.vue
- UserSelectModal.vue
- ChangePasswordModal.vue
- CourseDetailModal.vue
- StudentCourseDetailModal.vue
- EmbedJsonEditorModal.vue
- MathPreviewEditorModal.vue
- QuestionBlock.vue
- TemplateBlock.vue
- CodeBlockComponent.vue
- LatexFormulaNode.vue
- RichTextPreview.vue
- PaperPreview.vue
- Diagram2DPreview.vue
- Diagram3DPreview.vue
- CircuitPreview.vue
- ResourceList.vue
- TemplateList.vue
- QuestionList.vue
- resource-modes/HandoutEditor.vue
- resource-modes/OnlineQuizEditor.vue
- resource-runners/HandoutRunner.vue
- resource-runners/OnlineQuizRunner.vue
- AssessmentRunner.vue
- MathFieldComponent.vue
- Math2DPlotter.vue
- Math3DViewer.vue
- CircuitEditor.vue
- ImageRotator.vue

## 🎯 遷移策略

由於組件數量較多，建議採用批量遷移策略：

1. **已完成核心功能** - BlockEditor 相關組件已 100% 完成
2. **核心基礎設施** - App.vue 和 Sidebar.vue 已完成
3. **表單組件** - BaseInput, BaseSelect, BaseCheckbox 已完成

**建議優先順序：**
1. 核心 Modal 組件
2. 視圖組件（Views）
3. 預覽和列表組件

## 💡 遷移模板

每個組件都使用相同的遷移模式：

```typescript
<script setup lang="ts">
import { ref, computed, type Ref } from 'vue'

interface Props {
  // 定義 props
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 類型化所有變數和函數
</script>
```
