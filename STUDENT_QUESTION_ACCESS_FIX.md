# Student Question Access Fix

## Problem
When students viewed handouts containing question blocks in `StudentCourseDetailModal.vue`, they received `404 (Not Found)` errors for question resources. The error occurred because:

1. The `QuestionBlock.vue` component fetches question details via `questionBankAPI.getById(questionId)`
2. The `QuestionBankViewSet` in the backend restricted access to teachers only
3. Students were completely blocked from accessing any question bank API endpoints

## Root Cause
The `get_queryset()` method in `QuestionBankViewSet` returned `queryset.none()` for students:

```python
# Old code
if user.is_student() or user.is_accountant():
    return queryset.none()
```

This meant students couldn't even retrieve individual questions for viewing in learning resources.

## Solution
Modified `QuestionBankViewSet` to allow students **read-only** access to individual questions while maintaining write restrictions:

### Changes Made

1. **Updated `get_queryset()` method** (`backend/cramschool/api_views.py`):
   - Students can now access the `retrieve` action (viewing single questions)
   - Students are still blocked from `list`, `create`, `update`, `delete` actions
   - Teachers retain full access to all operations

2. **Added explicit permission checks** for write operations:
   - `create()`: Only teachers can create questions
   - `update()`: Only teachers can update questions
   - `destroy()`: Only teachers can delete questions
   - Returns `403 FORBIDDEN` if students attempt write operations

3. **Updated docstrings** to clarify the new permission model

## Technical Details

### Model Structure
- Model: `QuestionBank`
- Primary Key: `question_id` (AutoField)
- API Endpoint: `/api/cramschool/questions/{question_id}/`

### Permission Logic
```python
if user.is_student():
    # Allow retrieve (GET /questions/{id}/)
    if self.action == 'retrieve':
        return queryset
    # Block list, create, update, delete
    return queryset.none()
```

## Testing
To verify the fix:

1. **As a teacher**: Create a handout with question blocks and bind it to a course
2. **As a student**: 
   - Navigate to "My Courses"
   - Click "View Course Content" for the enrolled course
   - Click "View Content" on the handout
   - Questions should now display correctly without 404 errors

## Security Considerations
- Students can only **read** questions, not modify them
- Students cannot list all questions or search the question bank
- Students can only access questions embedded in learning resources they have permission to view
- The `readonly` prop in `BlockEditor` ensures students cannot edit the handout content

## Files Modified
- `backend/cramschool/api_views.py` - `QuestionBankViewSet` class

## Related Features
- Student course content viewing (`StudentCourseDetailModal.vue`)
- Question block rendering (`QuestionBlock.vue`)
- Read-only editor mode (`BlockEditor.vue`)
