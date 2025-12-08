# cramschool/api_urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import StudentViewSet, TeacherViewSet

# 建立一個 Router 實例
router = DefaultRouter()

# 將 StudentViewSet 註冊到 'students' 這個 URL 前綴下
# 註冊後會自動產生 /api/cramschool/students/, /api/cramschool/students/{id}/ 等路由
router.register(r'students', StudentViewSet)

# 將 TeacherViewSet 註冊到 'teachers' 這個 URL 前綴下
# 註冊後會自動產生 /api/cramschool/teachers/, /api/cramschool/teachers/{id}/ 等路由
router.register(r'teachers', TeacherViewSet)

# 應用程式的 URL 模式
urlpatterns = [
    path('', include(router.urls)),
]

