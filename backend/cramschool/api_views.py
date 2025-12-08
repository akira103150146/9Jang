# cramschool/api_views.py

from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Student, Teacher
from .serializers import StudentSerializer, TeacherSerializer

class StudentViewSet(viewsets.ModelViewSet):
    """
    提供 Student 模型 CRUD 操作的 API 視圖集
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制


class TeacherViewSet(viewsets.ModelViewSet):
    """
    提供 Teacher 模型 CRUD 操作的 API 視圖集
    """
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制

