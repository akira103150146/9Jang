# cramschool/api_urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import (
    StudentViewSet, TeacherViewSet, CourseViewSet, 
    StudentEnrollmentViewSet, EnrollmentPeriodViewSet, ExtraFeeViewSet,
    SessionRecordViewSet, AttendanceViewSet, LeaveViewSet,
    SubjectViewSet, QuestionBankViewSet, HashtagViewSet, QuestionTagViewSet,
    StudentAnswerViewSet, ErrorLogViewSet,
    RestaurantViewSet, GroupOrderViewSet, OrderViewSet, OrderItemViewSet,
    StudentGroupViewSet, QuizViewSet, ExamViewSet, CourseMaterialViewSet,
    upload_image, generate_quiz, generate_exam, generate_material
)

# 建立一個 Router 實例
router = DefaultRouter()

# 將 StudentViewSet 註冊到 'students' 這個 URL 前綴下
# 註冊後會自動產生 /api/cramschool/students/, /api/cramschool/students/{id}/ 等路由
router.register(r'students', StudentViewSet)

# 將 TeacherViewSet 註冊到 'teachers' 這個 URL 前綴下
# 註冊後會自動產生 /api/cramschool/teachers/, /api/cramschool/teachers/{id}/ 等路由
router.register(r'teachers', TeacherViewSet)

# 將 CourseViewSet 註冊到 'courses' 這個 URL 前綴下
# 註冊後會自動產生 /api/cramschool/courses/, /api/cramschool/courses/{id}/ 等路由
router.register(r'courses', CourseViewSet)

# 將 StudentEnrollmentViewSet 註冊到 'enrollments' 這個 URL 前綴下
# 註冊後會自動產生 /api/cramschool/enrollments/, /api/cramschool/enrollments/{id}/ 等路由
router.register(r'enrollments', StudentEnrollmentViewSet)

# 將 EnrollmentPeriodViewSet 註冊到 'enrollment-periods' 這個 URL 前綴下
router.register(r'enrollment-periods', EnrollmentPeriodViewSet)

# 將 ExtraFeeViewSet 註冊到 'fees' 這個 URL 前綴下
# 註冊後會自動產生 /api/cramschool/fees/, /api/cramschool/fees/{id}/ 等路由
router.register(r'fees', ExtraFeeViewSet)

# 將 SessionRecordViewSet 註冊到 'sessions' 這個 URL 前綴下
# 註冊後會自動產生 /api/cramschool/sessions/, /api/cramschool/sessions/{id}/ 等路由
router.register(r'sessions', SessionRecordViewSet)

# 將 AttendanceViewSet 註冊到 'attendances' 這個 URL 前綴下
# 註冊後會自動產生 /api/cramschool/attendances/, /api/cramschool/attendances/{id}/ 等路由
router.register(r'attendances', AttendanceViewSet)

# 將 LeaveViewSet 註冊到 'leaves' 這個 URL 前綴下
# 註冊後會自動產生 /api/cramschool/leaves/, /api/cramschool/leaves/{id}/ 等路由
router.register(r'leaves', LeaveViewSet)

# 將 SubjectViewSet 註冊到 'subjects' 這個 URL 前綴下
# 註冊後會自動產生 /api/cramschool/subjects/, /api/cramschool/subjects/{id}/ 等路由
router.register(r'subjects', SubjectViewSet)

# 將 QuestionBankViewSet 註冊到 'questions' 這個 URL 前綴下
# 註冊後會自動產生 /api/cramschool/questions/, /api/cramschool/questions/{id}/ 等路由
router.register(r'questions', QuestionBankViewSet)

# 將 HashtagViewSet 註冊到 'hashtags' 這個 URL 前綴下
# 註冊後會自動產生 /api/cramschool/hashtags/, /api/cramschool/hashtags/{id}/ 等路由
router.register(r'hashtags', HashtagViewSet)

# 將 QuestionTagViewSet 註冊到 'question-tags' 這個 URL 前綴下
# 註冊後會自動產生 /api/cramschool/question-tags/, /api/cramschool/question-tags/{id}/ 等路由
router.register(r'question-tags', QuestionTagViewSet)

# 將 StudentAnswerViewSet 註冊到 'student-answers' 這個 URL 前綴下
# 註冊後會自動產生 /api/cramschool/student-answers/, /api/cramschool/student-answers/{id}/ 等路由
router.register(r'student-answers', StudentAnswerViewSet)

# 將 ErrorLogViewSet 註冊到 'error-logs' 這個 URL 前綴下
# 註冊後會自動產生 /api/cramschool/error-logs/, /api/cramschool/error-logs/{id}/ 等路由
router.register(r'error-logs', ErrorLogViewSet)

# 將 RestaurantViewSet 註冊到 'restaurants' 這個 URL 前綴下
router.register(r'restaurants', RestaurantViewSet)

# 將 GroupOrderViewSet 註冊到 'group-orders' 這個 URL 前綴下
router.register(r'group-orders', GroupOrderViewSet)

# 將 OrderViewSet 註冊到 'orders' 這個 URL 前綴下
router.register(r'orders', OrderViewSet)

# 將 OrderItemViewSet 註冊到 'order-items' 這個 URL 前綴下
router.register(r'order-items', OrderItemViewSet)

# 將 StudentGroupViewSet 註冊到 'student-groups' 這個 URL 前綴下
router.register(r'student-groups', StudentGroupViewSet)

# 將 QuizViewSet 註冊到 'quizzes' 這個 URL 前綴下
router.register(r'quizzes', QuizViewSet)

# 將 ExamViewSet 註冊到 'exams' 這個 URL 前綴下
router.register(r'exams', ExamViewSet)

# 將 CourseMaterialViewSet 註冊到 'materials' 這個 URL 前綴下
router.register(r'materials', CourseMaterialViewSet)

# 應用程式的 URL 模式
urlpatterns = [
    path('', include(router.urls)),
    path('upload-image/', upload_image, name='upload-image'),
    path('generate-quiz/', generate_quiz, name='generate-quiz'),
    path('generate-exam/', generate_exam, name='generate-exam'),
    path('generate-material/', generate_material, name='generate-material'),
]

