# cramschool/api_urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import StudentViewSet, TeacherViewSet, CourseViewSet, StudentEnrollmentViewSet, ExtraFeeViewSet

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

# 將 ExtraFeeViewSet 註冊到 'fees' 這個 URL 前綴下
# 註冊後會自動產生 /api/cramschool/fees/, /api/cramschool/fees/{id}/ 等路由
router.register(r'fees', ExtraFeeViewSet)

# 應用程式的 URL 模式
urlpatterns = [
    path('', include(router.urls)),
]

