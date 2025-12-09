# cramschool/api_views.py

from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count
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
    
    @action(detail=False, methods=['get'])
    def search_chapters(self, request):
        """
        模糊搜尋章節名稱
        返回匹配的章節列表，按相關性排序（開頭匹配優先）
        """
        query = request.query_params.get('q', '').strip()
        subject_id = request.query_params.get('subject', None)
        level = request.query_params.get('level', None)
        
        if not query:
            return Response([])
        
        # 建立查詢條件
        queryset = QuestionBank.objects.filter(chapter__icontains=query)
        
        # 如果有選擇科目，則過濾科目
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        
        # 如果有選擇年級，則過濾年級
        if level:
            queryset = queryset.filter(level=level)
        
        # 使用聚合查詢，按章節分組並計算使用次數
        results = queryset.values('chapter').annotate(
            count=Count('question_id')
        ).order_by('chapter')
        
        # 手動計算相關性並排序
        chapters = []
        for item in results:
            chapter = item['chapter']
            count = item['count']
            # 計算相關性：開頭匹配得分更高
            if chapter.lower().startswith(query.lower()):
                relevance = 2
            else:
                relevance = 1
            
            chapters.append({
                'chapter': chapter,
                'count': count,
                'relevance': relevance
            })
        
        # 按相關性和使用次數排序
        chapters.sort(key=lambda x: (-x['relevance'], -x['count']))
        
        # 只返回前 10 個結果
        return Response(chapters[:10])


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
    
    def get_queryset(self):
        """
        支援按學生 ID 篩選錯題記錄，並優化查詢
        """
        queryset = ErrorLog.objects.select_related(
            'student', 'question', 'question__subject'
        ).prefetch_related('question__tags__tag')
        
        student_id = self.request.query_params.get('student', None)
        
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        return queryset

