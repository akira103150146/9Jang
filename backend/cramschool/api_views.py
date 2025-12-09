# cramschool/api_views.py

from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Q, Count
from django.conf import settings
import os
import uuid
from datetime import datetime
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


@api_view(['POST'])
def upload_image(request):
    """
    上傳圖片 API endpoint
    支援上傳圖片文件並返回圖片路徑
    """
    if 'image' not in request.FILES:
        return Response(
            {'error': '沒有提供圖片文件'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    image_file = request.FILES['image']
    
    # 檢查文件類型
    allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    file_ext = image_file.name.split('.')[-1].lower()
    if file_ext not in allowed_extensions:
        return Response(
            {'error': f'不支援的文件類型。允許的類型：{", ".join(allowed_extensions)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # 檢查文件大小（限制為 5MB）
    if image_file.size > 5 * 1024 * 1024:
        return Response(
            {'error': '圖片文件大小不能超過 5MB'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # 創建保存路徑
    # 使用日期和 UUID 來組織文件結構，避免文件名衝突
    now = datetime.now()
    date_folder = now.strftime('%Y/%m/%d')
    upload_dir = os.path.join(settings.MEDIA_ROOT, 'question_images', date_folder)
    
    # 確保目錄存在
    os.makedirs(upload_dir, exist_ok=True)
    
    # 生成唯一的文件名
    unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # 保存文件
    try:
        with open(file_path, 'wb+') as destination:
            for chunk in image_file.chunks():
                destination.write(chunk)
    except Exception as e:
        return Response(
            {'error': f'保存文件失敗：{str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # 返回相對路徑（相對於 MEDIA_ROOT）
    relative_path = os.path.join('question_images', date_folder, unique_filename)
    
    # 返回完整的 URL 路徑
    image_url = f"{settings.MEDIA_URL}{relative_path}"
    
    return Response({
        'image_path': relative_path,
        'image_url': image_url
    }, status=status.HTTP_201_CREATED)

