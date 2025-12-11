---
name: Unified Resource Management System
overview: Consolidate separate Quiz/Exam/Material views into a unified "Teaching Resources" system within QuestionBank, powered by a new Block-based backend model and a Notion-like frontend editor.
todos:
  - id: backend-models
    content: Create `ContentTemplate` and `LearningResource` models in `backend/cramschool/models.py` (including `student_groups` and `course`)
    status: completed
  - id: backend-apis
    content: Create API ViewSets/Serializers for Resources and Templates
    status: completed
  - id: frontend-editor-logic
    content: Create `ResourceEditor.vue` with Block Editor logic and Settings Sidebar (Course/Groups)
    status: completed
  - id: frontend-hub-tabs
    content: Refactor `QuestionBank.vue` to add Tabs (Questions, Documents, Templates)
    status: completed
  - id: frontend-list-components
    content: Implement "Template List" and "Document List" components
    status: completed
  - id: frontend-routing
    content: Update `router/index.js` and Sidebar navigation
    status: completed
  - id: frontend-print-optimization
    content: Implement and test Print CSS for A4/B4, ensuring LaTeX/Font compatibility
    status: completed
---

# Unified Resource Management System Plan

## 1. Backend: Unified Data Model (`LearningResource` & `ContentTemplate`)

Replace distinct `Quiz`, `Exam`, and `CourseMaterial` models with a flexible `LearningResource` model, and introduce a `ContentTemplate` model for reusable blocks.

- **Create `ContentTemplate` Model** (`backend/cramschool/models.py`)
    - **Purpose**: Stores reusable block structures (e.g., "Standard Header", "Math Section Layout").
    - **Fields**:
        - `title`: String
        - `structure`: JSONField (list of blocks)
        - `created_by`: User
        - `is_public`: Boolean (share with other teachers?)
        - `tags`: ManyToManyField(`Hashtag`)

- **Create `LearningResource` Model** (`backend/cramschool/models.py`)
    - **Purpose**: The actual document (Quiz/Exam/Handout) that teachers create and print.
    - **Fields**:
        - `title`: String
        - `resource_type`: Enum (`QUIZ`, `EXAM`, `HANDOUT`, `DOCUMENT`)
        - `course`: ForeignKey (optional) - *Binds document to a specific course*
        - `student_groups`: ManyToManyField(`StudentGroup`) - *Restricts visibility to specific student groups*
        - `structure`: JSONField (the ordered list of blocks). Blocks can be:
            - `text`: Markdown content
            - `question`: Reference to Question ID
            - `template`: Reference to Template ID (expands upon render or copy)
            - `page_break`: Print control
        - `settings`: JSONField (paper size: A4/B4, layout columns)
        - `tags`: ManyToMany
        - `created_by`: ForeignKey(User)
        - `is_individualized`: Boolean
        - `available_from`: DateTime (optional)
        - `available_until`: DateTime (optional)

- **API Development**
    - Create Serializers and ViewSets for both `ContentTemplate` and `LearningResource`.
    - Ensure `LearningResourceSerializer` handles `student_groups` and `course` fields correctly.

## 2. Frontend: Unified Interface (`QuestionBank.vue`)

Refactor `QuestionBank.vue` to serve as the central hub for all teaching content.

- **UI Overhaul**:
    - **Tabs/Dashboard**:

        1.  **題目庫 (Questions)**: Search, Filter, Add individual questions.
        2.  **文件庫 (Documents)**: List of LearningResources (Quizzes, Exams, Handouts). "Create Document" button.
        3.  **模板庫 (Templates)**: List of reusable ContentTemplates. "Create Template" button.

- **New "Block Editor" View** (`frontend/src/views/ResourceEditor.vue`)
    - **Route**: `/resources/edit/:id` (and `/resources/new`).
    - **Features**:
        - **Paper Simulation**: CSS-based A4/B4 container.
        - **Block System**:
            - **Slash Command**: Type `/` to bring up a menu (Text, Question, Template, Page Break).
            - **Drag & Drop**: Drag questions from a sidebar.
            - **Template Injection**: Select a template to insert its blocks into the current document.
        - **Document Settings Sidebar**:
            - Select **Course** (Dropdown).
            - Select **Student Groups** (Multi-select Checkbox).
            - Set **Availability Dates**.
        - **Markdown + LaTeX**: Full support in Text blocks and Question blocks.
        - **Print Optimization**: A4/B4 CSS support.

## 3. Consolidation & Cleanup

- **Deprecate Old Views**:
    - Remove/Redirect `QuizManagement.vue`, `ExamManagement.vue`, `CourseMaterialManagement.vue`.
    - Remove their routes from `router/index.js`.
- **Navigation Update**:
    - Update sidebar to point "Teaching Resources" to the unified `QuestionBank.vue`.

## 4. Implementation Steps

1.  **Backend**: Implement `ContentTemplate` & `LearningResource` models & APIs (including course/group binding).
2.  **Frontend Editor**: Build `ResourceEditor.vue` with Block Editor logic and a Settings Sidebar for Course/Group selection.
3.  **Frontend Hub**: Update `QuestionBank.vue` to include Questions, Documents, and Templates tabs.
4.  **Routing**: Switch links to point to the new system.