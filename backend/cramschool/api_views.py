# cramschool/api_views.py

from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import (
    Student, Teacher, Course, StudentEnrollment, ExtraFee, 
    SessionRecord, Attendance, Leave, Subject, QuestionBank, Hashtag, QuestionTag,
    StudentAnswer, ErrorLog
)
from .serializers import (
    StudentSerializer, TeacherSerializer, CourseSerializer, 
    StudentEnrollmentSerializer, ExtraFeeSerializer, 
    SessionRecordSerializer, AttendanceSerializer, LeaveSerializer,
    SubjectSerializer, QuestionBankSerializer, HashtagSerializer, QuestionTagSerializer,
    StudentAnswerSerializer, ErrorLogSerializer
)

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


class CourseViewSet(viewsets.ModelViewSet):
    """
    提供 Course 模型 CRUD 操作的 API 視圖集
    """
    queryset = Course.objects.select_related('teacher').all()
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制


class StudentEnrollmentViewSet(viewsets.ModelViewSet):
    """
    提供 StudentEnrollment 模型 CRUD 操作的 API 視圖集
    """
    queryset = StudentEnrollment.objects.select_related('student', 'course').all()
    serializer_class = StudentEnrollmentSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制


class ExtraFeeViewSet(viewsets.ModelViewSet):
    """
    提供 ExtraFee 模型 CRUD 操作的 API 視圖集
    """
    queryset = ExtraFee.objects.select_related('student').all()
    serializer_class = ExtraFeeSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制


class SessionRecordViewSet(viewsets.ModelViewSet):
    """
    提供 SessionRecord 模型 CRUD 操作的 API 視圖集
    """
    queryset = SessionRecord.objects.select_related('course').all()
    serializer_class = SessionRecordSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    提供 Attendance 模型 CRUD 操作的 API 視圖集
    """
    queryset = Attendance.objects.select_related('session', 'session__course', 'student').all()
    serializer_class = AttendanceSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制


class LeaveViewSet(viewsets.ModelViewSet):
    """
    提供 Leave 模型 CRUD 操作的 API 視圖集
    """
    queryset = Leave.objects.select_related('student', 'course').all()
    serializer_class = LeaveSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制


class SubjectViewSet(viewsets.ModelViewSet):
    """
    提供 Subject 模型 CRUD 操作的 API 視圖集
    """
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制


class QuestionBankViewSet(viewsets.ModelViewSet):
    """
    提供 QuestionBank 模型 CRUD 操作的 API 視圖集
    """
    queryset = QuestionBank.objects.select_related('subject').prefetch_related('tags__tag').all()
    serializer_class = QuestionBankSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制


class HashtagViewSet(viewsets.ModelViewSet):
    """
    提供 Hashtag 模型 CRUD 操作的 API 視圖集
    """
    queryset = Hashtag.objects.select_related('creator').all()
    serializer_class = HashtagSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制


class QuestionTagViewSet(viewsets.ModelViewSet):
    """
    提供 QuestionTag 模型 CRUD 操作的 API 視圖集
    """
    queryset = QuestionTag.objects.select_related('question', 'tag').all()
    serializer_class = QuestionTagSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制


class StudentAnswerViewSet(viewsets.ModelViewSet):
    """
    提供 StudentAnswer 模型 CRUD 操作的 API 視圖集
    """
    queryset = StudentAnswer.objects.select_related('student', 'question').all()
    serializer_class = StudentAnswerSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制


class ErrorLogViewSet(viewsets.ModelViewSet):
    """
    提供 ErrorLog 模型 CRUD 操作的 API 視圖集
    """
    queryset = ErrorLog.objects.select_related('student', 'question', 'question__subject').all()
    serializer_class = ErrorLogSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制

