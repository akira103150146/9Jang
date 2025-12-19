# cramschool/api_views.py

from rest_framework import viewsets, status, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count, Sum, Prefetch
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
import calendar
import os
import uuid
import json
import time
from django.contrib.auth import get_user_model
from account.models import UserRole
from .models import (
    Student, Teacher, Course, StudentEnrollment, EnrollmentPeriod, ExtraFee, 
    SessionRecord, Attendance, Leave, Subject, QuestionBank, Hashtag, QuestionTag,
    StudentAnswer, ErrorLog, Restaurant, GroupOrder, Order, OrderItem,
    StudentGroup, AssessmentSubmission,
    ContentTemplate, LearningResource, StudentMistakeNote, StudentMistakeNoteImage, ErrorLogImage
)

CustomUser = get_user_model()
from .serializers import (
    StudentSerializer, TeacherSerializer, CourseSerializer, 
    StudentEnrollmentSerializer, EnrollmentPeriodSerializer, ExtraFeeSerializer, 
    SessionRecordSerializer, AttendanceSerializer, LeaveSerializer,
    SubjectSerializer, QuestionBankSerializer, HashtagSerializer, QuestionTagSerializer,
    StudentAnswerSerializer, ErrorLogSerializer,
    StudentMistakeNoteImageSerializer, ErrorLogImageSerializer,
    RestaurantSerializer, GroupOrderSerializer, OrderSerializer, OrderItemSerializer,
    StudentGroupSerializer,
    ContentTemplateSerializer, LearningResourceSerializer, StudentMistakeNoteSerializer
)


def _save_uploaded_image(request, image_file, folder_prefix: str) -> tuple[str, str]:
    """
    儲存上傳圖片並回傳 (saved_path, image_url)
    folder_prefix: 例如 'mistake_images' / 'error_log_images'
    """
    from django.core.files.storage import default_storage
    from datetime import datetime as _dt

    filename = image_file.name or 'image'
    file_ext = filename.split('.')[-1].lower() if '.' in filename else 'jpg'
    unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
    date_folder = _dt.now().strftime('%Y/%m/%d')
    relative_path = f'{folder_prefix}/{date_folder}/{unique_filename}'

    saved_path = default_storage.save(relative_path, image_file)
    image_url = default_storage.url(saved_path)
    if not image_url.startswith('http'):
        image_url = request.build_absolute_uri(image_url)
    return saved_path, image_url

def _agent_log(location: str, message: str, data: dict, hypothesis_id: str, run_id: str = "run1"):
    """
    Debug-mode NDJSON logger (no secrets / no PII).
    Writes to: /home/akira/github/9Jang/.cursor/debug.log
    """
    try:
        payload = {
            "sessionId": "debug-session",
            "runId": run_id,
            "hypothesisId": hypothesis_id,
            "location": location,
            "message": message,
            "data": data,
            "timestamp": int(time.time() * 1000),
        }
        with open("/home/akira/github/9Jang/.cursor/debug.log", "a", encoding="utf-8") as f:
            f.write(json.dumps(payload, ensure_ascii=False) + "\n")
    except Exception:
        # Never break API due to logging
        return


class _DRFPermissionError(Exception):
    """內部使用：將 PermissionError 轉成 DRF 的 403 回應"""


class StudentViewSet(viewsets.ModelViewSet):
    """
    提供 Student 模型 CRUD 操作的 API 視圖集
    """
    queryset = Student.objects.all()  # 用於路由器確定 basename，實際查詢由 get_queryset() 處理
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        根據查詢參數決定是否包含已刪除的記錄
        使用 annotate 預先計算聚合值以避免 N+1 查詢
        根據用戶角色過濾學生：
        - 管理員：可以看到所有學生
        - 老師：只能看到上過自己課程的學生（含暫停仍留存）
        - 學生：只能看到自己（如果系統有學生端使用此 ViewSet）
        """
        user = self.request.user
        
        # 未登入：不回傳
        if not user.is_authenticated:
            return Student.objects.none()
        
        # 先進行 annotate 聚合計算（在過濾之前）
        queryset = Student.objects.select_related('user').annotate(
            # 預先計算總費用
            _total_fees=Sum(
                'extra_fees__amount',
                filter=Q(extra_fees__is_deleted=False)
            ),
            # 預先計算未繳費用
            _unpaid_fees=Sum(
                'extra_fees__amount',
                filter=Q(
                    extra_fees__is_deleted=False,
                    extra_fees__payment_status='Unpaid'
                )
            ),
            # 預先計算報名課程數量
            _enrollments_count=Count(
                'enrollments',
                filter=Q(enrollments__is_deleted=False)
            )
        )
        
        # 老師：只能看到上過自己課程的學生（含暫停仍留存，只看 enrollment.is_deleted）
        if user.is_teacher():
            try:
                teacher = user.teacher_profile
                # 獲取該老師的課程ID列表
                teacher_course_ids = Course.objects.filter(teacher=teacher).values_list('course_id', flat=True)
                # 獲取有報名過這些課程的學生ID（只排除 enrollment.is_deleted=True，不看 is_active）
                enrolled_student_ids = StudentEnrollment.objects.filter(
                    course_id__in=teacher_course_ids,
                    is_deleted=False
                ).values_list('student_id', flat=True).distinct()
                # 只返回這些學生
                queryset = queryset.filter(student_id__in=enrolled_student_ids)
            except Teacher.DoesNotExist:
                return Student.objects.none()
        
        # 學生：只能看到自己（如果系統有學生端使用此 ViewSet）
        elif user.is_student():
            try:
                student = user.student_profile
                queryset = queryset.filter(student_id=student.student_id)
            except Student.DoesNotExist:
                return Student.objects.none()
        
        # 管理員：可以看到所有學生（繼續執行後續過濾）
        
        # 檢查是否有 include_deleted 參數
        include_deleted = self.request.query_params.get('include_deleted', 'false').lower() == 'true'
        
        if not include_deleted:
            # 預設過濾掉已刪除的記錄
            queryset = queryset.filter(is_deleted=False)
        
        # 在 annotate 之後進行 prefetch_related 以優化關聯查詢
        # 注意：Prefetch 中的過濾不會影響 annotate 的結果，但可以優化序列化器的查詢
        queryset = queryset.prefetch_related(
            Prefetch('enrollments', queryset=StudentEnrollment.objects.filter(is_deleted=False).select_related('course')),
            Prefetch('extra_fees', queryset=ExtraFee.objects.filter(is_deleted=False))
        )
        
        return queryset
    
    def get_serializer_context(self):
        """
        將 request 傳遞給序列化器，用於判斷是否為管理員
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    # 註解：刪除功能已禁用，避免誤刪導致資料庫錯誤
    # 唯一刪除方式是透過 flush_db 指令
    # def destroy(self, request, *args, **kwargs):
    #     """
    #     軟刪除學生記錄：僅管理員可用
    #     """
    #     if not request.user.is_authenticated or not request.user.is_admin():
    #         return Response(
    #             {'detail': '只有管理員可以刪除學生'},
    #             status=status.HTTP_403_FORBIDDEN
    #         )
    #     instance = self.get_object()
    #     instance.soft_delete()
    #     return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        恢復已刪除的學生記錄及其所有相關聯的資料
        """
        # 直接從資料庫查找，不過濾已刪除的記錄
        try:
            student = Student.objects.get(pk=pk)
        except Student.DoesNotExist:
            return Response(
                {'detail': '找不到該學生記錄'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not student.is_deleted:
            return Response(
                {'detail': '該學生記錄未被刪除'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # 這會自動恢復所有相關聯的資料（enrollments, attendances, leaves, extra_fees, answers, error_logs, orders）
        student.restore()
        serializer = self.get_serializer(student)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """
        創建學生時自動創建用戶帳號：僅管理員或會計可用
        """
        if not request.user.is_authenticated or (not request.user.is_admin() and not request.user.is_accountant()):
            return Response(
                {'detail': '只有管理員或會計可以創建學生'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 獲取學生資料
        student_data = serializer.validated_data
        name = student_data.get('name')
        
        # 先保存學生以獲取 student_id
        student = serializer.save()
        
        # 生成唯一的用戶名
        base_username = f"student_{student.student_id}"
        username = base_username
        counter = 1
        while CustomUser.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1
        
        # 生成預設密碼（6位數學生ID，不足補0）
        default_password = str(student.student_id).zfill(6)
        
        # 生成 email
        email = f"{username}@student.local"
        counter = 1
        while CustomUser.objects.filter(email=email).exists():
            email = f"{username}_{counter}@student.local"
            counter += 1
        
        # 創建用戶帳號
        try:
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=default_password,
                role=UserRole.STUDENT,
                first_name=name,
                is_active=True,
                must_change_password=False  # 首次登入不強制修改密碼
            )
            
            # 關聯學生和用戶，並保存初始密碼
            student.user = user
            student.initial_password = default_password
            student.save()
            
            # 更新序列化器數據以包含用戶信息
            response_serializer = self.get_serializer(student)
            return Response({
                **response_serializer.data,
                'user_account': {
                    'username': username,
                    'password': default_password,
                    'email': email
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # 如果創建用戶失敗，刪除已創建的學生記錄
            student.delete()
            return Response(
                {'detail': f'創建學生帳號失敗: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        """
        重置學生密碼（僅管理員可用）
        """
        # 檢查是否為管理員
        if not request.user.is_authenticated or not request.user.is_admin():
            return Response(
                {'detail': '只有管理員可以重置學生密碼'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        student = self.get_object()
        if not student.user:
            return Response(
                {'detail': '該學生尚未創建帳號'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        new_password = request.data.get('password')
        if not new_password:
            return Response(
                {'detail': '請提供新密碼'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 更新密碼
        student.user.set_password(new_password)
        student.user.must_change_password = True  # 重置後需要修改密碼
        student.user.save()
        
        # 更新初始密碼記錄
        student.initial_password = new_password
        student.save()
        
        return Response({
            'message': '密碼已重置',
            'password': new_password
        })
    
    def update(self, request, *args, **kwargs):
        """
        更新學生：僅管理員或會計可用
        """
        if not request.user.is_authenticated or (not request.user.is_admin() and not request.user.is_accountant()):
            return Response(
                {'detail': '只有管理員或會計可以編輯學生'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """
        部分更新學生：僅管理員或會計可用
        """
        if not request.user.is_authenticated or (not request.user.is_admin() and not request.user.is_accountant()):
            return Response(
                {'detail': '只有管理員或會計可以編輯學生'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'], url_path='toggle-account-status')
    def toggle_account_status(self, request, pk=None):
        """
        啟用/停用學生帳號（僅管理員可用）
        """
        # 檢查是否為管理員
        if not request.user.is_authenticated or not request.user.is_admin():
            return Response(
                {'detail': '只有管理員可以管理帳號狀態'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        student = self.get_object()
        if not student.user:
            return Response(
                {'detail': '該學生尚未創建帳號'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 切換帳號狀態
        student.user.is_active = not student.user.is_active
        student.user.save()
        
        return Response({
            'message': f'帳號已{"啟用" if student.user.is_active else "停用"}',
            'is_active': student.user.is_active
        })
    
    @action(detail=True, methods=['get'])
    def tuition_status(self, request, pk=None):
        """
        檢查學生需要生成的學費月份
        返回從報名時間起到現在，每個月是否需要生成學費
        考慮學生的上課期間（EnrollmentPeriod），只在上課期間生成學費
        """
        student = self.get_object()
        enrollments = student.enrollments.filter(is_active=True, is_deleted=False).prefetch_related('periods')
        
        now = timezone.now().date()
        tuition_months = []
        
        for enrollment in enrollments:
            enroll_date = enrollment.enroll_date
            course = enrollment.course
            periods = enrollment.periods.filter(is_active=True).order_by('start_date')
            
            # 如果沒有定義期間，則使用報名日期作為起始
            if not periods.exists():
                # 沒有期間記錄，使用報名日期開始
                start_date = enroll_date.replace(day=1)
            else:
                # 使用最早的上課期間開始日期
                start_date = periods.first().start_date.replace(day=1)
            
            # 計算從最早開始月份到現在的每個月
            current = start_date
            
            while current <= now:
                year_month = current.strftime('%Y-%m')
                current_year = current.year
                current_month = current.month
                
                # 檢查該月份是否在任何上課期間內
                is_in_active_period = False
                if periods.exists():
                    for period in periods:
                        period_start = period.start_date.replace(day=1)
                        period_end = period.end_date.replace(day=1) if period.end_date else None
                        
                        # 檢查當前月份是否在期間內
                        if current >= period_start:
                            if period_end is None or current <= period_end:
                                is_in_active_period = True
                                break
                else:
                    # 沒有期間記錄，視為從報名日期起持續有效
                    if current >= enroll_date.replace(day=1):
                        is_in_active_period = True
                
                # 只有在上課期間內的月份才需要生成學費
                if is_in_active_period:
                    # 檢查該月份是否已經有學費記錄
                    existing_fee = ExtraFee.objects.filter(
                        student=student,
                        item='Tuition',
                        fee_date__year=current_year,
                        fee_date__month=current_month,
                        notes__icontains=f"{course.course_name}",
                        is_deleted=False
                    ).first()
                    
                    # 每週費用 = 課程費用 / 4
                    weekly_fee = float(course.fee_per_session) / 4
                    monthly_fee_4weeks = weekly_fee * 4  # 預設4週
                    
                    tuition_months.append({
                        'year': current_year,
                        'month': current_month,
                        'year_month': year_month,
                        'enrollment_id': enrollment.enrollment_id,
                        'course_id': course.course_id,
                        'course_name': course.course_name,
                        'enroll_date': enroll_date.isoformat(),
                        'weekly_fee': weekly_fee,
                        'default_fee': monthly_fee_4weeks,
                        'has_fee': existing_fee is not None,
                        'fee_id': existing_fee.fee_id if existing_fee else None,
                        'current_fee': float(existing_fee.amount) if existing_fee else None,
                        'weeks': 4  # 預設4週
                    })
                
                # 移到下一個月
                if current.month == 12:
                    current = current.replace(year=current.year + 1, month=1)
                else:
                    current = current.replace(month=current.month + 1)
        
        return Response({
            'student_id': student.student_id,
            'student_name': student.name,
            'tuition_months': tuition_months
        })
    
    @action(detail=True, methods=['post'])
    def generate_tuition(self, request, pk=None):
        """
        生成學費記錄
        需要提供：
        - year: 年份
        - month: 月份
        - enrollment_id: 報名ID
        - weeks: 週數（預設4週）
        """
        student = self.get_object()
        year = int(request.data.get('year'))
        month = int(request.data.get('month'))
        enrollment_id = int(request.data.get('enrollment_id'))
        weeks = int(request.data.get('weeks', 4))
        
        try:
            enrollment = StudentEnrollment.objects.get(
                enrollment_id=enrollment_id,
                student=student,
                is_deleted=False
            )
        except StudentEnrollment.DoesNotExist:
            return Response({'error': '找不到報名記錄'}, status=status.HTTP_404_NOT_FOUND)
        
        course = enrollment.course
        weekly_fee = float(course.fee_per_session) / 4
        total_fee = weekly_fee * weeks
        
        # 計算費用日期（該月第一天）
        from datetime import date
        fee_date = date(year, month, 1)
        
        # 檢查是否已經有該月的學費記錄
        existing_fee = ExtraFee.objects.filter(
            student=student,
            item='Tuition',
            fee_date__year=year,
            fee_date__month=month,
            notes__icontains=f"{course.course_name}",
            is_deleted=False
        ).first()
        
        if existing_fee:
            # 更新現有記錄
            existing_fee.amount = total_fee
            existing_fee.notes = f"{course.course_name} - {year}年{month}月 ({weeks}週)"
            existing_fee.save()
            fee = existing_fee
        else:
            # 創建新記錄
            fee = ExtraFee.objects.create(
                student=student,
                item='Tuition',
                amount=total_fee,
                fee_date=fee_date,
                payment_status='Unpaid',
                notes=f"{course.course_name} - {year}年{month}月 ({weeks}週)"
            )
        
        serializer = ExtraFeeSerializer(fee)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def attendance_and_leaves(self, request, pk=None):
        """
        獲取學生的出缺勤和請假記錄
        返回該學生的所有出席記錄和請假記錄
        """
        student = self.get_object()
        
        # 獲取出席記錄
        attendances = Attendance.objects.filter(
            student=student,
            is_deleted=False
        ).select_related('session', 'session__course').order_by('-session__session_date')
        
        # 獲取請假記錄
        leaves = Leave.objects.filter(
            student=student,
            is_deleted=False
        ).select_related('course').order_by('-leave_date')
        
        # 序列化數據
        attendance_serializer = AttendanceSerializer(attendances, many=True)
        leave_serializer = LeaveSerializer(leaves, many=True)
        
        return Response({
            'student_id': student.student_id,
            'student_name': student.name,
            'attendances': attendance_serializer.data,
            'leaves': leave_serializer.data
        })


class TeacherViewSet(viewsets.ModelViewSet):
    """
    提供 Teacher 模型 CRUD 操作的 API 視圖集
    注意：創建/更新老師時會自動創建/更新對應的 CustomUser
    """
    queryset = Teacher.objects.select_related('user').all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        老師管理：僅老闆（ADMIN）可管理全部；老師只能看自己的資料
        """
        user = self.request.user
        if not user.is_authenticated:
            return Teacher.objects.none()
        if user.is_admin():
            return super().get_queryset()
        if user.is_teacher():
            return Teacher.objects.select_related('user').filter(user=user)
        return Teacher.objects.none()
    
    def get_serializer_context(self):
        """
        將 request 傳遞給序列化器，用於獲取初始數據
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    # 註解：刪除功能已禁用，避免誤刪導致資料庫錯誤
    # 唯一刪除方式是透過 flush_db 指令
    # def destroy(self, request, *args, **kwargs):
    #     """
    #     刪除老師記錄：僅管理員可用
    #     """
    #     if not request.user.is_authenticated or not request.user.is_admin():
    #         return Response(
    #             {'detail': '只有管理員可以刪除老師'},
    #             status=status.HTTP_403_FORBIDDEN
    #         )
    #     return super().destroy(request, *args, **kwargs)


class CourseViewSet(viewsets.ModelViewSet):
    """
    提供 Course 模型 CRUD 操作的 API 視圖集
    學生只能看到自己報名的課程
    """
    queryset = Course.objects.select_related('teacher').all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        根據用戶角色過濾課程
        - 管理員：可以看到所有課程
        - 老師：只能看到自己被指派的課程
        - 學生：只能看到自己報名的課程
        """
        queryset = super().get_queryset()
        
        # 未登入：不回傳
        if not self.request.user.is_authenticated:
            return queryset.none()
        
        # 管理員：可以看到所有課程
        if self.request.user.is_admin():
            return queryset
        
        # 會計：可以看到所有課程（僅查看）
        if self.request.user.is_accountant():
            return queryset
        
        # 老師：只能看到自己被指派的課程
        if self.request.user.is_teacher():
            try:
                teacher = self.request.user.teacher_profile
                return queryset.filter(teacher=teacher)
            except Teacher.DoesNotExist:
                return queryset.none()
        
        # 學生只能看到自己報名的課程
        if self.request.user.is_student():
            # 獲取學生的 Student 記錄
            try:
                student = self.request.user.student_profile
                # 獲取學生報名的課程ID列表
                enrolled_course_ids = StudentEnrollment.objects.filter(
                    student=student,
                    is_active=True,
                    is_deleted=False
                ).values_list('course_id', flat=True)
                
                # 只返回學生報名的課程
                return queryset.filter(course_id__in=enrolled_course_ids)
            except Student.DoesNotExist:
                # 如果學生沒有對應的 Student 記錄，返回空查詢集
                return queryset.none()
        
        # 其他情況返回空查詢集
        return queryset.none()
    
    def create(self, request, *args, **kwargs):
        """
        創建課程：僅管理員可用
        """
        if not request.user.is_authenticated or not request.user.is_admin():
            return Response(
                {'detail': '只有管理員可以創建課程'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """
        更新課程：僅管理員可用
        """
        if not request.user.is_authenticated or not request.user.is_admin():
            return Response(
                {'detail': '只有管理員可以編輯課程'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """
        部分更新課程：僅管理員可用
        """
        if not request.user.is_authenticated or not request.user.is_admin():
            return Response(
                {'detail': '只有管理員可以編輯課程'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)
    
    # 註解：刪除功能已禁用，避免誤刪導致資料庫錯誤
    # 唯一刪除方式是透過 flush_db 指令
    # def destroy(self, request, *args, **kwargs):
    #     """
    #     刪除課程：僅管理員可用
    #     """
    #     if not request.user.is_authenticated or not request.user.is_admin():
    #         return Response(
    #             {'detail': '只有管理員可以刪除課程'},
    #             status=status.HTTP_403_FORBIDDEN
    #         )
    #     return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'], url_path='student-status')
    def student_status(self, request, pk=None):
        """
        獲取課程的學生狀態統計（出席/請假/暫停）
        用於在課程列表中顯示
        
        邏輯：
        1. 暫停：學生的報名期間（EnrollmentPeriod）已經不在當前日期區間內
        2. 請假：今天有請假記錄的學生（且不在暫停狀態）
        3. 出席：今天沒有請假記錄的學生（且不在暫停狀態）
        """
        course = self.get_object()
        today = timezone.now().date()
        
        # 獲取該課程的所有報名學生（未刪除的報名記錄）
        enrollments = StudentEnrollment.objects.filter(
            course=course,
            is_deleted=False
        ).select_related('student').prefetch_related('periods')
        
        # 初始化計數器
        present_count = 0
        leave_count = 0
        inactive_count = 0
        
        # 獲取今天該課程的請假記錄（用於快速查找）
        today_leaves = Leave.objects.filter(
            course=course,
            leave_date=today,
            is_deleted=False
        ).values_list('student_id', flat=True)
        today_leave_student_ids = set(today_leaves)
        
        # 遍歷每個報名記錄，判斷學生狀態
        for enrollment in enrollments:
            student_id = enrollment.student_id
            
            # 檢查該學生的報名期間是否包含今天
            # 如果沒有任何期間包含今天，則算作暫停
            has_active_period = False
            periods = enrollment.periods.all()
            
            for period in periods:
                # 檢查期間是否包含今天
                if period.start_date <= today:
                    # 如果沒有結束日期，或結束日期在今天之後，則期間有效
                    if not period.end_date or period.end_date >= today:
                        has_active_period = True
                        break
            
            # 如果沒有活躍的期間，算作暫停
            if not has_active_period:
                inactive_count += 1
                continue
            
            # 如果有活躍期間，檢查今天是否有請假記錄
            if student_id in today_leave_student_ids:
                leave_count += 1
            else:
                # 沒有請假記錄，算作出席
                present_count += 1
        
        total_students = enrollments.count()
        
        return Response({
            'course_id': course.course_id,
            'course_name': course.course_name,
            'total_students': total_students,
            'present_count': present_count,
            'leave_count': leave_count,
            'inactive_count': inactive_count,  # 暫停（期間不在區間內）
        })
    
    @action(detail=True, methods=['get'], url_path='resources')
    def get_resources(self, request, pk=None):
        """
        獲取課程的所有教學資源
        管理員可以查看所有老師綁定在課程的教學資源
        老師只能查看自己的課程資源
        """
        course = self.get_object()
        user = request.user
        
        if not user.is_authenticated:
            return Response(
                {'detail': '需要登入'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # 管理員可以查看所有課程的資源
        if user.is_admin():
            resources = LearningResource.objects.filter(
                courses=course
            ).prefetch_related('courses', 'tags', 'student_groups').select_related('created_by')
            serializer = LearningResourceSerializer(resources, many=True, context={'request': request})
            return Response(serializer.data)
        
        # 老師只能查看自己課程的資源
        if user.is_teacher():
            try:
                teacher = user.teacher_profile
                # 確認這是老師的課程
                if course.teacher != teacher:
                    return Response(
                        {'detail': '您沒有權限查看此課程的資源'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                resources = LearningResource.objects.filter(
                    courses=course
                ).prefetch_related('courses', 'tags', 'student_groups').select_related('created_by')
                serializer = LearningResourceSerializer(resources, many=True, context={'request': request})
                return Response(serializer.data)
            except Teacher.DoesNotExist:
                return Response(
                    {'detail': '找不到老師資料'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # 其他角色不允許訪問
        return Response(
            {'detail': '您沒有權限查看課程資源'},
            status=status.HTTP_403_FORBIDDEN
        )


class EnrollmentPeriodViewSet(viewsets.ModelViewSet):
    """
    提供 EnrollmentPeriod 模型 CRUD 操作的 API 視圖集
    """
    queryset = EnrollmentPeriod.objects.select_related('enrollment', 'enrollment__student', 'enrollment__course').all()
    serializer_class = EnrollmentPeriodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        enrollment_id = self.request.query_params.get('enrollment', None)
        if enrollment_id:
            queryset = queryset.filter(enrollment_id=enrollment_id)
        return queryset


class StudentEnrollmentViewSet(viewsets.ModelViewSet):
    """
    提供 StudentEnrollment 模型 CRUD 操作的 API 視圖集
    """
    queryset = StudentEnrollment.objects.all()  # 用於路由器確定 basename，實際查詢由 get_queryset() 處理
    serializer_class = StudentEnrollmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        根據查詢參數決定是否包含已刪除的記錄
        """
        queryset = StudentEnrollment.objects.select_related('student', 'course').prefetch_related('periods').all()
        
        # 檢查是否有 include_deleted 參數
        include_deleted = self.request.query_params.get('include_deleted', 'false').lower() == 'true'
        
        if not include_deleted:
            # 預設過濾掉已刪除的記錄
            queryset = queryset.filter(is_deleted=False)
        
        return queryset
    
    def perform_create(self, serializer):
        enrollment = serializer.save()
        # 自動創建初始上課期間（從報名日期開始）
        EnrollmentPeriod.objects.create(
            enrollment=enrollment,
            start_date=enrollment.enroll_date,
            end_date=None,  # 沒有結束日期表示持續中
            is_active=True,
            notes=f'初始上課期間（從報名日期開始）'
        )
    
    def destroy(self, request, *args, **kwargs):
        """
        軟刪除報名記錄
        """
        instance = self.get_object()
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        恢復已刪除的報名記錄
        """
        # 直接從資料庫查找，不過濾已刪除的記錄
        try:
            enrollment = StudentEnrollment.objects.get(pk=pk)
        except StudentEnrollment.DoesNotExist:
            return Response(
                {'detail': '找不到該報名記錄'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not enrollment.is_deleted:
            return Response(
                {'detail': '該報名記錄未被刪除'},
                status=status.HTTP_400_BAD_REQUEST
            )
        enrollment.restore()
        serializer = self.get_serializer(enrollment)
        return Response(serializer.data)


class ExtraFeeViewSet(viewsets.ModelViewSet):
    """
    提供 ExtraFee 模型 CRUD 操作的 API 視圖集
    """
    queryset = ExtraFee.objects.all()  # 用於路由器確定 basename，實際查詢由 get_queryset() 處理
    serializer_class = ExtraFeeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        根據查詢參數決定是否包含已刪除的記錄
        支援條件：
        - student: 學生ID
        - student_name: 學生姓名（模糊）
        - item: 名目（精準）
        - q: 備註關鍵字（模糊）
        """
        user = self.request.user
        if not user.is_authenticated:
            return ExtraFee.objects.none()

        # 老師不可用；老闆/會計可管理；學生只能看自己的
        if user.is_teacher():
            return ExtraFee.objects.none()

        queryset = ExtraFee.objects.select_related('student').all().order_by('-fee_date', '-fee_id')
        
        # 檢查是否有 include_deleted 參數
        include_deleted = self.request.query_params.get('include_deleted', 'false').lower() == 'true'
        
        if not include_deleted:
            # 預設過濾掉已刪除的記錄
            queryset = queryset.filter(is_deleted=False)
        
        student_id = self.request.query_params.get('student', None)
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        # 名目（精準）
        item = self.request.query_params.get('item', None)
        if item:
            queryset = queryset.filter(item=item)

        # 學生姓名（模糊）
        student_name = self.request.query_params.get('student_name', None)
        if student_name:
            queryset = queryset.filter(student__name__icontains=student_name.strip())

        # 備註模糊搜尋
        q = self.request.query_params.get('q', None)
        if q:
            queryset = queryset.filter(notes__icontains=q.strip())
        
        if user.is_student():
            try:
                student = user.student_profile
                return queryset.filter(student=student)
            except Student.DoesNotExist:
                return ExtraFee.objects.none()

        # ADMIN / ACCOUNTANT
        if user.is_admin() or user.is_accountant():
            return queryset

        return ExtraFee.objects.none()
    
    def destroy(self, request, *args, **kwargs):
        """
        禁止刪除費用記錄
        """
        return Response(
            {'detail': '費用記錄無法刪除，請修改狀態或備註'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    @action(detail=False, methods=['post'], url_path='batch-update')
    def batch_update(self, request):
        """
        批次更新費用記錄的繳費狀態
        請求格式: { "fee_ids": [1, 2, 3], "payment_status": "Paid" }
        """
        fee_ids = request.data.get('fee_ids', [])
        payment_status = request.data.get('payment_status')
        
        if not fee_ids or not isinstance(fee_ids, list):
            return Response(
                {'detail': '請提供有效的費用 ID 列表'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if payment_status not in ['Paid', 'Unpaid']:
            return Response(
                {'detail': '繳費狀態必須是 Paid 或 Unpaid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 獲取當前用戶的查詢集（確保權限檢查）
        queryset = self.get_queryset()
        
        # 過濾出要更新的費用記錄
        fees_to_update = queryset.filter(fee_id__in=fee_ids)
        
        if fees_to_update.count() != len(fee_ids):
            return Response(
                {'detail': '部分費用記錄不存在或無權限訪問'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 批次更新
        updated_count = fees_to_update.update(payment_status=payment_status)
        
        # 記錄操作日誌
        try:
            from account.utils import log_audit
            log_audit(
                request, 'update', 'ExtraFee',
                None, None,
                description=f'批次更新 {updated_count} 筆費用記錄為 {payment_status}',
                response_status=status.HTTP_200_OK
            )
        except:
            pass
        
        return Response({
            'detail': f'成功更新 {updated_count} 筆費用記錄',
            'updated_count': updated_count,
            'payment_status': payment_status
        })
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        恢復已刪除的收費記錄
        """
        # 直接從資料庫查找，不過濾已刪除的記錄
        try:
            fee = ExtraFee.objects.get(pk=pk)
        except ExtraFee.DoesNotExist:
            return Response(
                {'detail': '找不到該收費記錄'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not fee.is_deleted:
            return Response(
                {'detail': '該收費記錄未被刪除'},
                status=status.HTTP_400_BAD_REQUEST
            )
        fee.restore()
        serializer = self.get_serializer(fee)
        return Response(serializer.data)


class SessionRecordViewSet(viewsets.ModelViewSet):
    """
    提供 SessionRecord 模型 CRUD 操作的 API 視圖集
    """
    queryset = SessionRecord.objects.select_related('course').all()
    serializer_class = SessionRecordSerializer
    permission_classes = [IsAuthenticated]


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    提供 Attendance 模型 CRUD 操作的 API 視圖集
    """
    queryset = Attendance.objects.all()  # 用於路由器確定 basename，實際查詢由 get_queryset() 處理
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        根據查詢參數決定是否包含已刪除的記錄
        """
        queryset = Attendance.objects.select_related('session', 'session__course', 'student').all()
        
        # 檢查是否有 include_deleted 參數
        include_deleted = self.request.query_params.get('include_deleted', 'false').lower() == 'true'
        
        if not include_deleted:
            # 預設過濾掉已刪除的記錄
            queryset = queryset.filter(is_deleted=False)
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        """
        軟刪除出席記錄
        """
        instance = self.get_object()
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        恢復已刪除的出席記錄
        """
        # 直接從資料庫查找，不過濾已刪除的記錄
        try:
            attendance = Attendance.objects.get(pk=pk)
        except Attendance.DoesNotExist:
            return Response(
                {'detail': '找不到該出席記錄'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not attendance.is_deleted:
            return Response(
                {'detail': '該出席記錄未被刪除'},
                status=status.HTTP_400_BAD_REQUEST
            )
        attendance.restore()
        serializer = self.get_serializer(attendance)
        return Response(serializer.data)


class LeaveViewSet(viewsets.ModelViewSet):
    """
    提供 Leave 模型 CRUD 操作的 API 視圖集
    """
    queryset = Leave.objects.all()  # 用於路由器確定 basename，實際查詢由 get_queryset() 處理
    serializer_class = LeaveSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        根據查詢參數決定是否包含已刪除的記錄
        """
        queryset = Leave.objects.select_related('student', 'course').all()
        
        # 檢查是否有 include_deleted 參數
        include_deleted = self.request.query_params.get('include_deleted', 'false').lower() == 'true'
        
        if not include_deleted:
            # 預設過濾掉已刪除的記錄
            queryset = queryset.filter(is_deleted=False)
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        """
        軟刪除請假記錄
        """
        instance = self.get_object()
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        恢復已刪除的請假記錄
        """
        # 直接從資料庫查找，不過濾已刪除的記錄
        try:
            leave = Leave.objects.get(pk=pk)
        except Leave.DoesNotExist:
            return Response(
                {'detail': '找不到該請假記錄'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not leave.is_deleted:
            return Response(
                {'detail': '該請假記錄未被刪除'},
                status=status.HTTP_400_BAD_REQUEST
            )
        leave.restore()
        serializer = self.get_serializer(leave)
        return Response(serializer.data)


class SubjectViewSet(viewsets.ModelViewSet):
    """
    提供 Subject 模型 CRUD 操作的 API 視圖集
    """
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Subject.objects.none()
        # 題庫相關：學生/會計不提供
        if user.is_student() or user.is_accountant():
            return Subject.objects.none()
        return super().get_queryset()


class QuestionBankViewSet(viewsets.ModelViewSet):
    """
    提供 QuestionBank 模型 CRUD 操作的 API 視圖集
    支援多條件篩選：科目、年級、章節、難度、標籤、來源
    """
    queryset = QuestionBank.objects.select_related('subject', 'created_by', 'imported_from_error_log').prefetch_related('tags__tag', 'imported_from_error_log__images').all()
    serializer_class = QuestionBankSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        根據查詢參數進行多條件篩選
        只有老師可以訪問（管理員需要先模擬老師身分）
        """
        queryset = super().get_queryset()

        # 題庫：只有老師可以訪問
        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()
        
        # 管理員在非模擬狀態下不能訪問
        if user.is_admin():
            return queryset.none()
        
        # 學生和會計不可用
        if user.is_student() or user.is_accountant():
            return queryset.none()
        
        # 只有老師可以訪問
        if not user.is_teacher():
            return queryset.none()
        
        # 科目篩選
        subject_id = self.request.query_params.get('subject', None)
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        
        # 年級篩選
        level = self.request.query_params.get('level', None)
        if level:
            queryset = queryset.filter(level=level)
        
        # 章節篩選
        chapter = self.request.query_params.get('chapter', None)
        if chapter:
            queryset = queryset.filter(chapter__icontains=chapter)
        
        # 難度篩選
        difficulty = self.request.query_params.get('difficulty', None)
        if difficulty:
            try:
                difficulty_int = int(difficulty)
                queryset = queryset.filter(difficulty=difficulty_int)
            except ValueError:
                pass
        
        # 題目類型篩選
        question_type = self.request.query_params.get('question_type', None)
        if question_type:
            queryset = queryset.filter(question_type=question_type)
        
        # 標籤篩選（支援多個標籤）
        # 同時支援 tags[] 和 tags 兩種格式
        tags = self.request.query_params.getlist('tags[]') or self.request.query_params.getlist('tags')
        if tags:
            try:
                tag_ids = [int(tag) for tag in tags]
                # 使用 distinct() 避免重複
                queryset = queryset.filter(tags__tag_id__in=tag_ids).distinct()
            except ValueError:
                pass
        
        # 來源篩選
        source = self.request.query_params.get('source', None)
        if source:
            queryset = queryset.filter(source=source)
        
        # 全文檢索（使用 search_text_content）
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(search_text_content__icontains=search)
        
        # 按創建時間降序排序（最新的在前），如果沒有指定其他排序
        ordering = self.request.query_params.get('ordering', None)
        if not ordering:
            queryset = queryset.order_by('-created_at', '-question_id')
        
        return queryset
    
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
    
    @action(detail=False, methods=['get'])
    def source_options(self, request):
        """
        獲取題目來源的預設選項列表
        """
        from .models import QuestionBank
        options = QuestionBank.DEFAULT_SOURCE_OPTIONS
        return Response({
            'options': options,
            'default': '九章自命題'
        })
    

    
    @action(detail=False, methods=['post'])
    def preview_from_word(self, request):
        """
        預覽 Word 檔案中的題目（不匯入）
        接收 multipart/form-data：
        - file: Word 檔案（.docx 或 .doc）
        - subject_id: 科目ID（必填）
        - level: 年級（必填，JHS/SHS/VCS）
        - chapter: 章節（必填）
        """
        from .word_importer import WordQuestionImporter
        
        # 驗證檔案
        if 'file' not in request.FILES:
            return Response(
                {'error': '請選擇要匯入的檔案'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        filename = file.name
        
        # 驗證檔案格式
        if not (filename.endswith('.docx') or filename.endswith('.doc')):
            return Response(
                {'error': '不支援的檔案格式，請上傳 .docx 或 .doc 檔案'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 獲取必填參數
        subject_id = request.data.get('subject_id')
        level = request.data.get('level')
        chapter = request.data.get('chapter')
        
        if not subject_id:
            return Response(
                {'error': '請選擇科目'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not level:
            return Response(
                {'error': '請選擇年級'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not chapter:
            return Response(
                {'error': '請輸入章節'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 驗證科目是否存在
        try:
            subject = Subject.objects.get(subject_id=subject_id)
        except Subject.DoesNotExist:
            return Response(
                {'error': '科目不存在'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 讀取檔案內容
        try:
            file_content = file.read()
        except Exception as e:
            return Response(
                {'error': f'讀取檔案失敗：{str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 定義保存圖片的函數
        def save_image_func(image_bytes: bytes, filename: str) -> str:
            """保存圖片並返回 URL"""
            from django.core.files.storage import default_storage
            from django.core.files.base import ContentFile
            
            now = datetime.now()
            date_folder = now.strftime('%Y/%m/%d')
            relative_path = f'question_images/{date_folder}/{filename}'
            
            # 保存圖片
            saved_path = default_storage.save(relative_path, ContentFile(image_bytes))
            
            # 獲取圖片 URL
            image_url = default_storage.url(saved_path)
            if not image_url.startswith('http'):
                image_url = request.build_absolute_uri(image_url)
            
            return image_url
        
        # 解析題目（只解析，不匯入）
        importer = WordQuestionImporter()
        try:
            questions, errors = importer.import_questions(
                file_content=file_content,
                filename=filename,
                default_subject_id=subject_id,
                default_level=level,
                default_chapter=chapter,
                save_images_func=save_image_func
            )
        except Exception as e:
            return Response(
                {'error': f'解析檔案失敗：{str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not questions:
            return Response(
                {
                    'error': '未能從檔案中解析出任何題目',
                    'errors': errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 返回預覽數據（不包含 subject_id，因為前端已經知道）
        preview_questions = []
        for q in questions:
            preview_questions.append({
                'question_number': q.get('question_number', ''),
                'origin': q.get('origin', ''),
                'origin_detail': q.get('origin_detail', ''),
                'difficulty': q.get('difficulty', 3),
                'content': q.get('content', ''),
                'correct_answer': q.get('correct_answer', ''),
            })
        
        return Response({
            'success': True,
            'total': len(questions),
            'questions': preview_questions,
            'errors': errors[:20]  # 只返回前 20 個錯誤
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def import_from_word(self, request):
        """
        從 Word 檔案匯入題目
        接收 multipart/form-data：
        - file: Word 檔案（.docx 或 .doc）
        - subject_id: 科目ID（必填）
        - level: 年級（必填，JHS/SHS/VCS）
        - chapter: 章節（必填）
        """
        from .word_importer import WordQuestionImporter
        from django.db import transaction
        
        # 驗證檔案
        if 'file' not in request.FILES:
            return Response(
                {'error': '請選擇要匯入的檔案'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        filename = file.name
        
        # 驗證檔案格式
        if not (filename.endswith('.docx') or filename.endswith('.doc')):
            return Response(
                {'error': '不支援的檔案格式，請上傳 .docx 或 .doc 檔案'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 獲取必填參數
        subject_id = request.data.get('subject_id')
        level = request.data.get('level')
        chapter = request.data.get('chapter')
        
        if not subject_id:
            return Response(
                {'error': '請選擇科目'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not level:
            return Response(
                {'error': '請選擇年級'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not chapter:
            return Response(
                {'error': '請輸入章節'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 驗證科目是否存在
        try:
            subject = Subject.objects.get(subject_id=subject_id)
        except Subject.DoesNotExist:
            return Response(
                {'error': '科目不存在'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 讀取檔案內容
        try:
            file_content = file.read()
        except Exception as e:
            return Response(
                {'error': f'讀取檔案失敗：{str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 定義保存圖片的函數
        def save_image_func(image_bytes: bytes, filename: str) -> str:
            """保存圖片並返回 URL"""
            from django.core.files.storage import default_storage
            from django.core.files.base import ContentFile
            
            now = datetime.now()
            date_folder = now.strftime('%Y/%m/%d')
            relative_path = f'question_images/{date_folder}/{filename}'
            
            # 保存圖片
            saved_path = default_storage.save(relative_path, ContentFile(image_bytes))
            
            # 獲取圖片 URL
            image_url = default_storage.url(saved_path)
            if not image_url.startswith('http'):
                image_url = request.build_absolute_uri(image_url)
            
            return image_url
        
        # 解析題目
        importer = WordQuestionImporter()
        try:
            questions, errors = importer.import_questions(
                file_content=file_content,
                filename=filename,
                default_subject_id=subject_id,
                default_level=level,
                default_chapter=chapter,
                save_images_func=save_image_func
            )
        except Exception as e:
            return Response(
                {'error': f'解析檔案失敗：{str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not questions:
            return Response(
                {
                    'error': '未能從檔案中解析出任何題目',
                    'errors': errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 批量創建題目
        created_count = 0
        failed_count = 0
        created_by = request.user if request.user.is_authenticated else None
        
        with transaction.atomic():
            for question_data in questions:
                try:
                    # 設置建立者
                    question_data['created_by'] = created_by
                    
                    # 創建題目（subject_id 已經在 question_data 中）
                    question = QuestionBank.objects.create(**question_data)
                    created_count += 1
                except Exception as e:
                    failed_count += 1
                    errors.append(f"創建題目失敗（題號：{question_data.get('question_number', '未知')}）：{str(e)}")
        
        return Response({
            'success': True,
            'created_count': created_count,
            'failed_count': failed_count,
            'total_parsed': len(questions),
            'errors': errors[:20]  # 只返回前 20 個錯誤
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def export_to_latex(self, request, pk=None):
        """
        導出題目的詳解為 LaTeX 格式
        """
        from .utils.diagram_converter import json_to_tikz_2d, json_to_circuitikz, json_to_latex_3d
        
        question = self.get_object()
        solution_content = question.solution_content
        
        if not solution_content:
            return Response(
                {'error': '該題目沒有詳解內容'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        latex_parts = []
        content = solution_content.get('content', [])
        
        for node in content:
            node_type = node.get('type')
            attrs = node.get('attrs', {})
            
            if node_type == 'paragraph':
                # 提取段落文字
                text = self._extract_text_from_node(node)
                if text:
                    latex_parts.append(text)
            
            elif node_type == 'mathField':
                latex = attrs.get('latex', '')
                if latex:
                    latex_parts.append(f'${latex}$')
            
            elif node_type == 'latexFormula':
                latex = attrs.get('latex', '')
                display_mode = attrs.get('displayMode', True)
                if latex:
                    if display_mode:
                        latex_parts.append(f'$$\\begin{{align}}{latex}\\end{{align}}$$')
                    else:
                        latex_parts.append(f'${latex}$')
            
            elif node_type == 'diagram2D':
                try:
                    tikz = json_to_tikz_2d(attrs)
                    latex_parts.append(tikz)
                except Exception as e:
                    latex_parts.append(f'% 圖形轉換錯誤: {str(e)}')
            
            elif node_type == 'circuit':
                try:
                    circuit = json_to_circuitikz(attrs)
                    latex_parts.append(circuit)
                except Exception as e:
                    latex_parts.append(f'% 電路圖轉換錯誤: {str(e)}')
            
            elif node_type == 'diagram3D':
                try:
                    tikz_3d = json_to_latex_3d(attrs)
                    latex_parts.append(tikz_3d)
                except Exception as e:
                    latex_parts.append(f'% 3D 圖形轉換錯誤: {str(e)}')
        
        latex_code = '\n\n'.join(latex_parts)
        
        return Response({
            'latex': latex_code,
            'question_id': question.question_id,
        })
    
    @action(detail=True, methods=['get'])
    def export_to_markdown(self, request, pk=None):
        """
        導出題目的詳解為 Markdown 格式
        """
        from .utils.markdown_exporter import solution_to_markdown
        
        question = self.get_object()
        solution_content = question.solution_content
        
        if not solution_content:
            return Response(
                {'error': '該題目沒有詳解內容'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 兼容：前端以 Markdown 純文字儲存
        if isinstance(solution_content, dict) and solution_content.get('format') == 'markdown':
            return Response({
                'markdown': solution_content.get('text', '') or '',
                'question_id': question.question_id,
            })
        
        markdown = solution_to_markdown(solution_content)
        
        return Response({
            'markdown': markdown,
            'question_id': question.question_id,
        })
    
    def _extract_text_from_node(self, node):
        """輔助方法：從節點中提取純文字"""
        if not node:
            return ''
        
        text_parts = []
        
        if node.get('type') == 'text':
            text = node.get('text', '')
            if text:
                text_parts.append(text)
        
        content = node.get('content', [])
        for child in content:
            text_parts.append(self._extract_text_from_node(child))
        
        return ' '.join(text_parts)


class HashtagViewSet(viewsets.ModelViewSet):
    """
    提供 Hashtag 模型 CRUD 操作的 API 視圖集
    """
    queryset = Hashtag.objects.select_related('creator').all()
    serializer_class = HashtagSerializer
    permission_classes = [IsAuthenticated]


class QuestionTagViewSet(viewsets.ModelViewSet):
    """
    提供 QuestionTag 模型 CRUD 操作的 API 視圖集
    """
    queryset = QuestionTag.objects.select_related('question', 'tag').all()
    serializer_class = QuestionTagSerializer
    permission_classes = [IsAuthenticated]


class StudentAnswerViewSet(viewsets.ModelViewSet):
    """
    提供 StudentAnswer 模型 CRUD 操作的 API 視圖集
    """
    queryset = StudentAnswer.objects.all()  # 用於路由器確定 basename，實際查詢由 get_queryset() 處理
    serializer_class = StudentAnswerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        根據查詢參數決定是否包含已刪除的記錄
        """
        queryset = StudentAnswer.objects.select_related('student', 'question').all()
        
        # 檢查是否有 include_deleted 參數
        include_deleted = self.request.query_params.get('include_deleted', 'false').lower() == 'true'
        
        if not include_deleted:
            # 預設過濾掉已刪除的記錄
            queryset = queryset.filter(is_deleted=False)
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        """
        軟刪除作答記錄
        """
        instance = self.get_object()
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        恢復已刪除的作答記錄
        """
        # 直接從資料庫查找，不過濾已刪除的記錄
        try:
            answer = StudentAnswer.objects.get(pk=pk)
        except StudentAnswer.DoesNotExist:
            return Response(
                {'detail': '找不到該作答記錄'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not answer.is_deleted:
            return Response(
                {'detail': '該作答記錄未被刪除'},
                status=status.HTTP_400_BAD_REQUEST
            )
        answer.restore()
        serializer = self.get_serializer(answer)
        return Response(serializer.data)


class ErrorLogViewSet(viewsets.ModelViewSet):
    """
    提供 ErrorLog 模型 CRUD 操作的 API 視圖集
    """
    queryset = ErrorLog.objects.all()  # 用於路由器確定 basename，實際查詢由 get_queryset() 處理
    serializer_class = ErrorLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        支援按學生 ID 篩選錯題記錄，並優化查詢
        根據查詢參數決定是否包含已刪除的記錄
        """
        user = self.request.user
        if not user.is_authenticated:
            return ErrorLog.objects.none()

        # 會計不可用
        if user.is_accountant():
            return ErrorLog.objects.none()

        queryset = ErrorLog.objects.select_related(
            'student', 'question', 'question__subject'
        ).prefetch_related('question__tags__tag')
        
        # 檢查是否有 include_deleted 參數
        include_deleted = self.request.query_params.get('include_deleted', 'false').lower() == 'true'
        
        if not include_deleted:
            # 預設過濾掉已刪除的記錄
            queryset = queryset.filter(is_deleted=False)
        
        student_id = self.request.query_params.get('student', None)
        
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        # 學生只能看自己的錯題
        if user.is_student():
            try:
                student = user.student_profile
                return queryset.filter(student=student)
            except Student.DoesNotExist:
                return ErrorLog.objects.none()

        # 老闆/老師可看
        if user.is_admin() or user.is_teacher():
            return queryset
        return ErrorLog.objects.none()
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        """
        軟刪除錯題記錄
        """
        instance = self.get_object()
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='upload-images')
    def upload_images(self, request, pk=None):
        """
        上傳錯題圖片（multipart/form-data: images[]）
        權限：老師/會計/管理員（學生預設不開放）
        """
        if not request.user.is_authenticated:
            return Response({'detail': '未登入'}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.is_student():
            return Response({'detail': '學生不可上傳學生管理端錯題圖片'}, status=status.HTTP_403_FORBIDDEN)
        if not (request.user.is_admin() or request.user.is_teacher() or request.user.is_accountant()):
            return Response({'detail': '無權限'}, status=status.HTTP_403_FORBIDDEN)

        error_log = self.get_object()
        files = request.FILES.getlist('images') or []
        if not files:
            return Response({'detail': '沒有提供圖片'}, status=status.HTTP_400_BAD_REQUEST)

        created = []
        # 依目前最大 sort_order 接續
        current_max = ErrorLogImage.objects.filter(error_log=error_log).aggregate(m=models.Max('sort_order')).get('m') or 0
        for idx, f in enumerate(files, start=1):
            saved_path, _url = _save_uploaded_image(request, f, 'error_log_images')
            img = ErrorLogImage.objects.create(
                error_log=error_log,
                image_path=saved_path,
                sort_order=current_max + idx
            )
            created.append(img)

        serializer = ErrorLogImageSerializer(created, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='reorder-images')
    def reorder_images(self, request, pk=None):
        """
        重新排序錯題圖片
        body: { image_ids: [1,2,3] }
        """
        if not request.user.is_authenticated:
            return Response({'detail': '未登入'}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.is_student():
            return Response({'detail': '學生不可操作'}, status=status.HTTP_403_FORBIDDEN)
        if not (request.user.is_admin() or request.user.is_teacher() or request.user.is_accountant()):
            return Response({'detail': '無權限'}, status=status.HTTP_403_FORBIDDEN)

        error_log = self.get_object()
        image_ids = request.data.get('image_ids') or []
        if not isinstance(image_ids, list) or not image_ids:
            return Response({'detail': '請提供 image_ids'}, status=status.HTTP_400_BAD_REQUEST)

        images = list(ErrorLogImage.objects.filter(error_log=error_log, image_id__in=image_ids))
        if len(images) != len(image_ids):
            return Response({'detail': 'image_ids 包含不屬於此錯題的圖片'}, status=status.HTTP_400_BAD_REQUEST)

        order_map = {int(image_id): idx for idx, image_id in enumerate(image_ids)}
        for img in images:
            img.sort_order = order_map.get(img.image_id, img.sort_order)
        ErrorLogImage.objects.bulk_update(images, ['sort_order'])
        return Response({'success': True})

    @action(detail=True, methods=['post'], url_path='import-to-question-bank')
    def import_to_question_bank(self, request, pk=None):
        """
        從 ErrorLog 匯入題庫（建立一份可追溯來源學生的題目）
        - 權限：老師/管理員可用；會計禁止
        - 行為：若已存在 imported_from_error_log=此錯題 的題目，回傳既有題目
        """
        if not request.user.is_authenticated:
            return Response({'detail': '未登入'}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.is_accountant():
            return Response({'detail': '會計不可匯入題庫'}, status=status.HTTP_403_FORBIDDEN)
        if not (request.user.is_admin() or request.user.is_teacher()):
            return Response({'detail': '無權限'}, status=status.HTTP_403_FORBIDDEN)

        error_log = self.get_object()

        existing = QuestionBank.objects.filter(imported_from_error_log=error_log).first()
        if existing:
            serializer = QuestionBankSerializer(existing, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        q = error_log.question
        # 複製題目（保留內容/答案/難度/科目/年級/章節/圖片等）
        new_question = QuestionBank.objects.create(
            subject=q.subject,
            level=q.level,
            chapter=q.chapter,
            content=q.content,
            image_path=q.image_path,
            correct_answer=q.correct_answer,
            difficulty=q.difficulty,
            question_number=q.question_number,
            origin=q.origin,
            origin_detail=q.origin_detail,
            solution_content=q.solution_content,
            source='imported_from_error_log',
            created_by=request.user,
            imported_from_error_log=error_log,
            imported_student=error_log.student,
        )
        serializer = QuestionBankSerializer(new_question, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        恢復已刪除的錯題記錄
        """
        # 直接從資料庫查找，不過濾已刪除的記錄
        try:
            error_log = ErrorLog.objects.get(pk=pk)
        except ErrorLog.DoesNotExist:
            return Response(
                {'detail': '找不到該錯題記錄'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not error_log.is_deleted:
            return Response(
                {'detail': '該錯題記錄未被刪除'},
                status=status.HTTP_400_BAD_REQUEST
            )
        error_log.restore()
        serializer = self.get_serializer(error_log)
        return Response(serializer.data)


class StudentMistakeNoteViewSet(viewsets.ModelViewSet):
    """
    學生自建錯題本（筆記式）
    - 僅允許學生存取自己的筆記
    - 管理員/老師預設不可用（避免資料外洩；需要的話可再加特例）
    """
    queryset = StudentMistakeNote.objects.select_related('student', 'student__user').all()
    serializer_class = StudentMistakeNoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return StudentMistakeNote.objects.none()

        # 老師/管理員可以查看指定學生的筆記
        if user.is_teacher() or user.is_admin():
            student_id = self.request.query_params.get('student_id')
            if student_id:
                try:
                    student = Student.objects.get(student_id=student_id)
                    qs = StudentMistakeNote.objects.select_related('student').filter(student=student)
                except Student.DoesNotExist:
                    return StudentMistakeNote.objects.none()
            else:
                return StudentMistakeNote.objects.none()

        # 學生只能查看自己的筆記
        elif user.is_student():
            try:
                student = user.student_profile
                qs = StudentMistakeNote.objects.select_related('student').filter(student=student)
            except Exception:
                return StudentMistakeNote.objects.none()
        else:
            return StudentMistakeNote.objects.none()

        # 過濾已刪除的記錄
        include_deleted = self.request.query_params.get('include_deleted', 'false').lower() == 'true'
        if not include_deleted:
            qs = qs.filter(is_deleted=False)

        # 搜尋功能
        q = (self.request.query_params.get('q') or '').strip()
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(subject__icontains=q) | Q(content__icontains=q))

        return qs.order_by('-updated_at', '-note_id')

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated or not user.is_student():
            raise _DRFPermissionError('只有學生可以新增錯題筆記')
        try:
            student = user.student_profile
        except Exception:
            raise _DRFPermissionError('找不到學生資料')
        serializer.save(student=student)

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except _DRFPermissionError as e:
            return Response({'detail': str(e)}, status=status.HTTP_403_FORBIDDEN)

    def update(self, request, *args, **kwargs):
        try:
            obj = self.get_object()
        except Exception:
            return Response({'detail': '找不到筆記'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if not user.is_authenticated or not user.is_student():
            return Response({'detail': '只有學生可以編輯錯題筆記'}, status=status.HTTP_403_FORBIDDEN)
        try:
            student = user.student_profile
        except Exception:
            return Response({'detail': '找不到學生資料'}, status=status.HTTP_403_FORBIDDEN)
        if obj.student != student:
            return Response({'detail': '只能編輯自己的錯題筆記'}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated or not user.is_student():
            return Response({'detail': '只有學生可以刪除錯題筆記'}, status=status.HTTP_403_FORBIDDEN)
        obj = self.get_object()
        try:
            student = user.student_profile
        except Exception:
            return Response({'detail': '找不到學生資料'}, status=status.HTTP_403_FORBIDDEN)
        if obj.student != student:
            return Response({'detail': '只能刪除自己的錯題筆記'}, status=status.HTTP_403_FORBIDDEN)

        obj.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='upload-images')
    def upload_images(self, request, pk=None):
        """
        上傳錯題筆記圖片（multipart/form-data: images[]）
        權限：學生僅能上傳到自己的 note
        """
        user = request.user
        if not user.is_authenticated:
            return Response({'detail': '未登入'}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_student():
            return Response({'detail': '只有學生可以上傳錯題筆記圖片'}, status=status.HTTP_403_FORBIDDEN)

        note = self.get_object()
        try:
            student = user.student_profile
        except Exception:
            return Response({'detail': '找不到學生資料'}, status=status.HTTP_403_FORBIDDEN)
        if note.student != student:
            return Response({'detail': '只能操作自己的錯題筆記'}, status=status.HTTP_403_FORBIDDEN)

        files = request.FILES.getlist('images') or []
        if not files:
            return Response({'detail': '沒有提供圖片'}, status=status.HTTP_400_BAD_REQUEST)

        created = []
        current_max = StudentMistakeNoteImage.objects.filter(note=note).aggregate(m=models.Max('sort_order')).get('m') or 0
        for idx, f in enumerate(files, start=1):
            saved_path, _url = _save_uploaded_image(request, f, 'mistake_images')
            img = StudentMistakeNoteImage.objects.create(
                note=note,
                image_path=saved_path,
                sort_order=current_max + idx
            )
            created.append(img)

        serializer = StudentMistakeNoteImageSerializer(created, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='reorder-images')
    def reorder_images(self, request, pk=None):
        """
        重新排序錯題筆記圖片
        body: { image_ids: [1,2,3] }
        """
        user = request.user
        if not user.is_authenticated:
            return Response({'detail': '未登入'}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_student():
            return Response({'detail': '只有學生可以操作'}, status=status.HTTP_403_FORBIDDEN)

        note = self.get_object()
        try:
            student = user.student_profile
        except Exception:
            return Response({'detail': '找不到學生資料'}, status=status.HTTP_403_FORBIDDEN)
        if note.student != student:
            return Response({'detail': '只能操作自己的錯題筆記'}, status=status.HTTP_403_FORBIDDEN)

        image_ids = request.data.get('image_ids') or []
        if not isinstance(image_ids, list) or not image_ids:
            return Response({'detail': '請提供 image_ids'}, status=status.HTTP_400_BAD_REQUEST)

        images = list(StudentMistakeNoteImage.objects.filter(note=note, image_id__in=image_ids))
        if len(images) != len(image_ids):
            return Response({'detail': 'image_ids 包含不屬於此筆記的圖片'}, status=status.HTTP_400_BAD_REQUEST)

        order_map = {int(image_id): idx for idx, image_id in enumerate(image_ids)}
        for img in images:
            img.sort_order = order_map.get(img.image_id, img.sort_order)
        StudentMistakeNoteImage.objects.bulk_update(images, ['sort_order'])
        return Response({'success': True})

    @action(detail=True, methods=['post'], url_path='import-to-question-bank')
    def import_to_question_bank(self, request, pk=None):
        """
        從 StudentMistakeNote 手動匯入題庫
        - 權限：老師/管理員可用；會計禁止
        - 需要手動輸入題目資訊（因為筆記可能不完整）
        """
        if not request.user.is_authenticated:
            return Response({'detail': '未登入'}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.is_accountant():
            return Response({'detail': '會計不可匯入題庫'}, status=status.HTTP_403_FORBIDDEN)
        if not (request.user.is_admin() or request.user.is_teacher()):
            return Response({'detail': '無權限'}, status=status.HTTP_403_FORBIDDEN)

        # 直接查詢對象，不依賴 get_queryset() 的限制（因為 action 中沒有 student_id 查詢參數）
        try:
            note = StudentMistakeNote.objects.select_related('student').get(note_id=pk, is_deleted=False)
        except StudentMistakeNote.DoesNotExist:
            return Response({'detail': '找不到錯題筆記'}, status=status.HTTP_404_NOT_FOUND)

        # 驗證必填欄位
        required_fields = ['subject_id', 'level', 'chapter', 'content', 'correct_answer']
        for field in required_fields:
            if field not in request.data:
                return Response({'detail': f'缺少必填欄位：{field}'}, status=status.HTTP_400_BAD_REQUEST)

        # 創建題目
        new_question = QuestionBank.objects.create(
            subject_id=request.data['subject_id'],
            level=request.data['level'],
            chapter=request.data['chapter'],
            content=request.data['content'],
            correct_answer=request.data['correct_answer'],
            difficulty=request.data.get('difficulty', 3),
            question_number=request.data.get('question_number'),
            origin=request.data.get('origin', ''),
            origin_detail=request.data.get('origin_detail', ''),
            solution_content=request.data.get('solution_content', ''),
            image_path=request.data.get('image_path'),  # 可選：從筆記圖片中選擇
            source='imported_from_student_note',
            created_by=request.user,
            imported_student=note.student,
        )

        # 處理標籤
        if 'tag_ids' in request.data and isinstance(request.data['tag_ids'], list):
            for tag_id in request.data['tag_ids']:
                QuestionTag.objects.get_or_create(
                    question=new_question,
                    tag_id=tag_id
                )

        serializer = QuestionBankSerializer(new_question, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StudentMistakeNoteImageViewSet(viewsets.ModelViewSet):
    """
    錯題筆記圖片管理（刪除/編輯 caption）
    """
    queryset = StudentMistakeNoteImage.objects.select_related('note', 'note__student').all()
    serializer_class = StudentMistakeNoteImageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated or not user.is_student():
            return StudentMistakeNoteImage.objects.none()
        try:
            student = user.student_profile
        except Exception:
            return StudentMistakeNoteImage.objects.none()
        return self.queryset.filter(note__student=student)

    def update(self, request, *args, **kwargs):
        # 只允許改 caption/sort_order（必要時）
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)


class ErrorLogImageViewSet(viewsets.ModelViewSet):
    """
    錯題圖片管理（刪除/編輯 caption）
    """
    queryset = ErrorLogImage.objects.select_related('error_log', 'error_log__student').all()
    serializer_class = ErrorLogImageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return ErrorLogImage.objects.none()
        # 學生不可用
        if user.is_student():
            return ErrorLogImage.objects.none()
        # 老師/會計/管理員可用
        if user.is_admin() or user.is_teacher() or user.is_accountant():
            return self.queryset
        return ErrorLogImage.objects.none()

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        user = request.user
        if not user.is_authenticated or not user.is_student():
            return Response({'detail': '只有學生可以恢復錯題筆記'}, status=status.HTTP_403_FORBIDDEN)
        obj = self.get_object()
        try:
            student = user.student_profile
        except Exception:
            return Response({'detail': '找不到學生資料'}, status=status.HTTP_403_FORBIDDEN)
        if obj.student != student:
            return Response({'detail': '只能恢復自己的錯題筆記'}, status=status.HTTP_403_FORBIDDEN)

        if not obj.is_deleted:
            return Response({'detail': '該筆記未被刪除'}, status=status.HTTP_400_BAD_REQUEST)

        obj.restore()
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

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
    from django.core.files.storage import default_storage
    
    now = datetime.now()
    date_folder = now.strftime('%Y/%m/%d')
    
    # 生成唯一的文件名
    unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
    
    # 構建相對路徑（相對於 MEDIA_ROOT 或 Cloud Storage bucket）
    relative_path = f'question_images/{date_folder}/{unique_filename}'
    
    # 使用 Django 的默認文件存儲保存文件（自動支持 Cloud Storage 或本地文件系統）
    try:
        saved_path = default_storage.save(relative_path, image_file)
        
        # 獲取文件 URL（自動處理 Cloud Storage 或本地 URL）
        image_url = default_storage.url(saved_path)
        
        # 如果 MEDIA_URL 是相對路徑，構建絕對 URL
        if not image_url.startswith('http'):
            from django.urls import reverse
            image_url = request.build_absolute_uri(image_url)
            
    except Exception as e:
        return Response(
            {'error': f'保存文件失敗：{str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return Response({
        'image_path': saved_path,  # 使用實際保存的路徑
        'image_url': image_url  # 完整的訪問 URL（支持 Cloud Storage）
    }, status=status.HTTP_201_CREATED)


class RestaurantViewSet(viewsets.ModelViewSet):
    """
    提供 Restaurant 模型 CRUD 操作的 API 視圖集
    """
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        訂便當模組：
        - 老闆（ADMIN）預設不可用（需模擬登入其他身分）
        - 老師/會計/學生可依需求使用
        """
        user = self.request.user
        if not user.is_authenticated:
            return Restaurant.objects.none()
        if user.is_admin():
            return Restaurant.objects.none()
        return super().get_queryset()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class GroupOrderViewSet(viewsets.ModelViewSet):
    """
    提供 GroupOrder 模型 CRUD 操作的 API 視圖集
    """
    queryset = GroupOrder.objects.select_related('restaurant', 'created_by').prefetch_related('orders').annotate(
        # 預先計算訂單數量
        _orders_count=Count(
            'orders',
            filter=Q(orders__status__in=['Pending', 'Confirmed'], orders__is_deleted=False)
        ),
        # 預先計算總金額
        _total_amount=Sum(
            'orders__total_amount',
            filter=Q(orders__status__in=['Pending', 'Confirmed'], orders__is_deleted=False)
        )
    ).all()
    serializer_class = GroupOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        訂便當模組：
        - 老闆（ADMIN）預設不可用
        - 老師/會計可查看全部團購
        - 學生僅能透過 join link / 建立自己的訂單（由 Order API 控制），這裡先允許讀取（避免前端 join 頁面壞掉）
        """
        user = self.request.user
        if not user.is_authenticated:
            return GroupOrder.objects.none()
        if user.is_admin():
            return GroupOrder.objects.none()
        return super().get_queryset()

    def perform_create(self, serializer):
        """
        創建團購時自動生成唯一連結
        """
        user = self.request.user
        created_by_teacher = None

        # 僅允許老師建立團購，並自動綁定 created_by
        if not user.is_authenticated or not user.is_teacher():
            raise _DRFPermissionError('只有老師可以建立團購')

        try:
            created_by_teacher = user.teacher_profile
        except Exception:
            created_by_teacher = None

        if created_by_teacher is None:
            raise _DRFPermissionError('找不到老師資料，無法建立團購')

        # 生成唯一連結
        unique_link = f"order-{uuid.uuid4().hex[:12]}"
        
        # 確保連結唯一
        while GroupOrder.objects.filter(order_link=unique_link).exists():
            unique_link = f"order-{uuid.uuid4().hex[:12]}"
        
        # 保存時自動設置連結與建立者
        serializer.save(order_link=unique_link, created_by=created_by_teacher)

    def create(self, request, *args, **kwargs):
        """
        將 perform_create 的權限錯誤轉為 403（避免變成 500）
        """
        try:
            return super().create(request, *args, **kwargs)
        except _DRFPermissionError as e:
            return Response({'detail': str(e)}, status=status.HTTP_403_FORBIDDEN)

    def update(self, request, *args, **kwargs):
        """
        老師只能編輯自己發起的團購；會計可編輯；學生不可編輯。
        """
        instance = self.get_object()
        user = request.user

        if not user.is_authenticated:
            return Response({'detail': '未登入'}, status=status.HTTP_401_UNAUTHORIZED)

        if user.is_student():
            return Response({'detail': '學生不可編輯團購'}, status=status.HTTP_403_FORBIDDEN)

        if user.is_teacher():
            if not instance.created_by or instance.created_by.user != user:
                return Response({'detail': '只能編輯自己發起的團購'}, status=status.HTTP_403_FORBIDDEN)

        # 會計（或其他允許的角色）走原本流程
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        同 update 的權限邏輯
        """
        instance = self.get_object()
        user = request.user

        if not user.is_authenticated:
            return Response({'detail': '未登入'}, status=status.HTTP_401_UNAUTHORIZED)

        if user.is_student():
            return Response({'detail': '學生不可編輯團購'}, status=status.HTTP_403_FORBIDDEN)

        if user.is_teacher():
            if not instance.created_by or instance.created_by.user != user:
                return Response({'detail': '只能編輯自己發起的團購'}, status=status.HTTP_403_FORBIDDEN)

        return super().partial_update(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        完成團購並自動生成費用
        """
        from django.utils import timezone
        from decimal import Decimal
        
        # 權限：會計 或 發起該團購的老師 可完成
        if not request.user.is_authenticated:
            return Response(
                {'detail': '未登入'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        group_order = self.get_object()

        is_accountant = request.user.is_accountant()
        is_owner_teacher = (
            request.user.is_teacher()
            and group_order.created_by
            and group_order.created_by.user == request.user
        )

        if not (is_accountant or is_owner_teacher):
            return Response(
                {'detail': '只有會計或發起該團購的老師可以完成團購'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # 更新團購狀態
        group_order.status = 'Completed'
        group_order.closed_at = timezone.now()
        group_order.save()
        
        # 為每個已確認和待確認的訂單生成費用
        # 包括 Pending 和 Confirmed 狀態的訂單（排除已刪除的訂單）
        orders_to_process = group_order.orders.filter(status__in=['Pending', 'Confirmed'], is_deleted=False)
        created_fees = []
        
        for order in orders_to_process:
            # 檢查是否已經為這個學生在同一天生成過相同金額的餐費
            # 使用金額和日期作為重複檢查條件（因為同一個訂單金額相同）
            today = timezone.now().date()
            existing_fee = ExtraFee.objects.filter(
                student=order.student,
                item='Meal',
                amount=order.total_amount,
                fee_date=today,
                is_deleted=False
            ).first()
            
            if not existing_fee:
                try:
                    fee = ExtraFee.objects.create(
                        student=order.student,
                        item='Meal',
                        amount=order.total_amount,
                        fee_date=today,
                        payment_status='Unpaid'
                    )
                    # 備註：讓會計可追溯是哪位老師發起的團購
                    teacher_name = group_order.created_by.name if group_order.created_by else '未知'
                    fee.notes = (
                        f"餐費/團購：{group_order.title}｜店家：{group_order.restaurant.name if group_order.restaurant else '未知'}｜"
                        f"發起老師：{teacher_name}｜團購ID:{group_order.group_order_id}｜訂單ID:{order.order_id}"
                    )
                    fee.save()
                    created_fees.append(fee.fee_id)
                except Exception as e:
                    # 如果創建失敗（可能是 notes 欄位問題），記錄錯誤但繼續
                    print(f"創建費用失敗：{e}")
        
        return Response({
            'message': '團購已完成',
            'fees_created': len(created_fees),
            'fee_ids': created_fees
        })


class OrderViewSet(viewsets.ModelViewSet):
    """
    提供 Order 模型 CRUD 操作的 API 視圖集
    """
    queryset = Order.objects.all()  # 用於路由器確定 basename，實際查詢由 get_queryset() 處理
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        支援按團購 ID 和學生 ID 篩選
        根據查詢參數決定是否包含已刪除的記錄
        """
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()

        # 老闆（ADMIN）預設不可用
        if user.is_admin():
            return Order.objects.none()

        queryset = Order.objects.select_related('group_order', 'student').prefetch_related('items').all()
        
        # 檢查是否有 include_deleted 參數
        include_deleted = self.request.query_params.get('include_deleted', 'false').lower() == 'true'
        
        if not include_deleted:
            # 預設過濾掉已刪除的記錄
            queryset = queryset.filter(is_deleted=False)
        
        group_order_id = self.request.query_params.get('group_order', None)
        student_id = self.request.query_params.get('student', None)
        
        if group_order_id:
            queryset = queryset.filter(group_order_id=group_order_id)
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        # 學生：只能看自己的訂單（不信任 query string）
        if user.is_student():
            try:
                student = user.student_profile
                queryset = queryset.filter(student=student)
            except Student.DoesNotExist:
                return Order.objects.none()

        # 老師/會計：可看全部
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        """
        軟刪除訂單記錄
        已完成的團購訂單無法刪除
        """
        instance = self.get_object()
        
        # 檢查團購狀態
        if instance.group_order.status == 'Completed':
            return Response(
                {'detail': '無法刪除已完成團購的訂單'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def update(self, request, *args, **kwargs):
        """
        訂單確認（狀態變更）權限：
        - 會計：可更新
        - 老師：僅能更新「自己發起的團購」底下的訂單
        - 學生：僅能更新自己的訂單（且不可將狀態改為 Confirmed）
        """
        instance = self.get_object()
        user = request.user

        if not user.is_authenticated:
            return Response({'detail': '未登入'}, status=status.HTTP_401_UNAUTHORIZED)

        incoming_status = request.data.get('status')
        is_status_change = incoming_status is not None and incoming_status != instance.status

        if user.is_teacher():
            if not instance.group_order.created_by or instance.group_order.created_by.user != user:
                return Response({'detail': '只能管理自己發起團購的訂單'}, status=status.HTTP_403_FORBIDDEN)

        if user.is_student():
            # 學生只能動自己的訂單
            try:
                student = user.student_profile
            except Exception:
                return Response({'detail': '找不到學生資料'}, status=status.HTTP_403_FORBIDDEN)

            if instance.student != student:
                return Response({'detail': '只能管理自己的訂單'}, status=status.HTTP_403_FORBIDDEN)

            # 禁止學生自行確認訂單
            if is_status_change and incoming_status == 'Confirmed':
                return Response({'detail': '學生不可確認訂單'}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        同 update 的權限邏輯
        """
        instance = self.get_object()
        user = request.user

        if not user.is_authenticated:
            return Response({'detail': '未登入'}, status=status.HTTP_401_UNAUTHORIZED)

        incoming_status = request.data.get('status')
        is_status_change = incoming_status is not None and incoming_status != instance.status

        if user.is_teacher():
            if not instance.group_order.created_by or instance.group_order.created_by.user != user:
                return Response({'detail': '只能管理自己發起團購的訂單'}, status=status.HTTP_403_FORBIDDEN)

        if user.is_student():
            try:
                student = user.student_profile
            except Exception:
                return Response({'detail': '找不到學生資料'}, status=status.HTTP_403_FORBIDDEN)

            if instance.student != student:
                return Response({'detail': '只能管理自己的訂單'}, status=status.HTTP_403_FORBIDDEN)

            if is_status_change and incoming_status == 'Confirmed':
                return Response({'detail': '學生不可確認訂單'}, status=status.HTTP_403_FORBIDDEN)

        return super().partial_update(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        恢復已刪除的訂單記錄
        """
        # 直接從資料庫查找，不過濾已刪除的記錄
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response(
                {'detail': '找不到該訂單記錄'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not order.is_deleted:
            return Response(
                {'detail': '該訂單記錄未被刪除'},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.restore()
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        """
        創建訂單時自動計算總金額
        """
        order = serializer.save()
        
        # 計算總金額
        items = OrderItem.objects.filter(order=order)
        total = sum(item.subtotal for item in items)
        order.total_amount = total
        order.save()


class OrderItemViewSet(viewsets.ModelViewSet):
    """
    提供 OrderItem 模型 CRUD 操作的 API 視圖集
    """
    queryset = OrderItem.objects.select_related('order').all()
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return OrderItem.objects.none()
        if user.is_admin():
            return OrderItem.objects.none()
        qs = super().get_queryset()
        if user.is_student():
            try:
                student = user.student_profile
                return qs.filter(order__student=student)
            except Student.DoesNotExist:
                return OrderItem.objects.none()
        return qs
    
    def perform_create(self, serializer):
        """
        創建訂單項目時自動計算小計，並更新訂單總金額
        """
        # 計算小計 (避免 IntegrityError: subtotal cannot be null)
        quantity = serializer.validated_data.get('quantity', 1)
        unit_price = serializer.validated_data.get('unit_price')
        # 如果 unit_price 為 None (理論上序列化器會驗證必填)，則從 validated_data 獲取
        if unit_price is None:
             # 這邊防禦性編碼，實際上序列化器應該已經擋下
             raise serializers.ValidationError({"unit_price": "此欄位為必填項。"})

        subtotal = quantity * unit_price
        
        item = serializer.save(subtotal=subtotal)
        
        # 更新訂單總金額
        order = item.order
        items = OrderItem.objects.filter(order=order)
        order.total_amount = sum(item.subtotal for item in items)
        order.save()
    
    def perform_update(self, serializer):
        """
        更新訂單項目時自動計算小計，並更新訂單總金額
        """
        # 計算小計
        instance = serializer.instance
        quantity = serializer.validated_data.get('quantity', instance.quantity)
        unit_price = serializer.validated_data.get('unit_price', instance.unit_price)
        subtotal = quantity * unit_price
        
        item = serializer.save(subtotal=subtotal)
        
        # 更新訂單總金額
        order = item.order
        items = OrderItem.objects.filter(order=order)
        order.total_amount = sum(item.subtotal for item in items)
        order.save()
    
    def perform_destroy(self, instance):
        """
        刪除訂單項目時更新訂單總金額
        """
        order = instance.order
        instance.delete()
        
        # 更新訂單總金額
        items = OrderItem.objects.filter(order=order)
        order.total_amount = sum(item.subtotal for item in items)
        order.save()


class StudentGroupViewSet(viewsets.ModelViewSet):
    """
    提供 StudentGroup 模型 CRUD 操作的 API 視圖集
    """
    queryset = StudentGroup.objects.prefetch_related('students', 'created_by').all()
    serializer_class = StudentGroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        學生群組：只有老師可用（老闆需模擬登入老師）
        """
        user = self.request.user
        if not user.is_authenticated:
            return StudentGroup.objects.none()
        if not user.is_teacher():
            return StudentGroup.objects.none()
        return super().get_queryset()

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_teacher():
            return Response({'detail': '只有老師可以管理學生群組'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['post'], url_path='add-students')
    def add_students(self, request, pk=None):
        """
        新增學生到群組
        """
        if not request.user.is_authenticated or not request.user.is_teacher():
            return Response({'detail': '只有老師可以管理學生群組'}, status=status.HTTP_403_FORBIDDEN)
        group = self.get_object()
        student_ids = request.data.get('student_ids', [])
        
        if not student_ids:
            return Response(
                {'detail': '請提供學生ID列表'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        students = Student.objects.filter(student_id__in=student_ids)
        group.students.add(*students)
        
        serializer = self.get_serializer(group)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='remove-students')
    def remove_students(self, request, pk=None):
        """
        從群組移除學生
        """
        if not request.user.is_authenticated or not request.user.is_teacher():
            return Response({'detail': '只有老師可以管理學生群組'}, status=status.HTTP_403_FORBIDDEN)
        group = self.get_object()
        student_ids = request.data.get('student_ids', [])
        
        if not student_ids:
            return Response(
                {'detail': '請提供學生ID列表'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        students = Student.objects.filter(student_id__in=student_ids)
        group.students.remove(*students)
        
        serializer = self.get_serializer(group)
        return Response(serializer.data)


class ContentTemplateViewSet(viewsets.ModelViewSet):
    """
    提供 ContentTemplate 模型 CRUD 操作的 API 視圖集
    """
    queryset = ContentTemplate.objects.select_related('created_by').prefetch_related('tags').all()
    serializer_class = ContentTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()

        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()

        # 管理員在非模擬狀態下不能訪問
        if user.is_admin():
            return queryset.none()

        # 會計不可用
        if user.is_accountant():
            return queryset.none()
        
        # 只有老師可以訪問
        if not user.is_teacher():
            return queryset.none()
            
        # 返回公開的 或 自己創建的
        return queryset.filter(
            Q(is_public=True) | Q(created_by=self.request.user)
        )

    def perform_create(self, serializer):
        user = self.request.user
        # 管理員在非模擬狀態下不能創建
        if user.is_admin():
            raise serializers.ValidationError('管理員需要先切換到老師身分才能執行此操作')
        # 只有老師可以創建
        if not user.is_teacher():
            raise serializers.ValidationError('只有老師可以創建模板')
        if user.is_authenticated:
            serializer.save(created_by=user)
        else:
            serializer.save()

    def update(self, request, *args, **kwargs):
        # 檢查權限：只有創建者可以修改
        instance = self.get_object()
        user = request.user
        
        # 管理員在非模擬狀態下不能修改
        if user.is_admin():
            return Response({'detail': '管理員需要先切換到老師身分才能執行此操作'}, status=status.HTTP_403_FORBIDDEN)
        
        # 只有老師可以修改
        if not user.is_teacher():
            return Response({'detail': '只有老師可以修改此模板'}, status=status.HTTP_403_FORBIDDEN)
        
        if user.is_authenticated and instance.created_by != user:
             return Response({'detail': '只有創建者可以修改此模板'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # 檢查權限：只有創建者可以刪除
        instance = self.get_object()
        user = request.user
        
        # 管理員在非模擬狀態下不能刪除
        if user.is_admin():
            return Response({'detail': '管理員需要先切換到老師身分才能執行此操作'}, status=status.HTTP_403_FORBIDDEN)
        
        # 只有老師可以刪除
        if not user.is_teacher():
            return Response({'detail': '只有老師可以刪除此模板'}, status=status.HTTP_403_FORBIDDEN)
        
        if user.is_authenticated and instance.created_by != user:
             return Response({'detail': '只有創建者可以刪除此模板'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class LearningResourceViewSet(viewsets.ModelViewSet):
    """
    提供 LearningResource 模型 CRUD 操作的 API 視圖集
    """
    queryset = LearningResource.objects.prefetch_related('courses', 'tags', 'student_groups').select_related('created_by').all()
    serializer_class = LearningResourceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        user = self.request.user
        
        # 1. 未登入：不顯示
        if not user.is_authenticated:
            return queryset.none()
        
        # 管理員可以查看所有資源（唯讀模式）
        if user.is_admin():
            # 支援 course query param 篩選
            course_id = self.request.query_params.get('course')
            if course_id:
                try:
                    queryset = queryset.filter(courses__course_id=int(course_id))
                except (ValueError, TypeError):
                    pass
            # 支援模式篩選
            mode = self.request.query_params.get('mode')
            if mode:
                queryset = queryset.filter(mode=mode)
            return queryset
        
        # 支援 course query param 篩選 (改為多對多)
        course_id = self.request.query_params.get('course')
        if course_id:
            try:
                queryset = queryset.filter(courses__course_id=int(course_id))
            except (ValueError, TypeError):
                pass
        
        # 2. 老師：只能看到自己課程的資源
        if user.is_teacher():
            try:
                teacher = user.teacher_profile
                teacher_course_ids = Course.objects.filter(teacher=teacher).values_list('course_id', flat=True)
                queryset = queryset.filter(
                    Q(courses__course_id__in=teacher_course_ids) | ~Q(courses__isnull=False)
                ).distinct()
                # 支援模式篩選
                mode = self.request.query_params.get('mode')
                if mode:
                    queryset = queryset.filter(mode=mode)
                return queryset
            except Teacher.DoesNotExist:
                return queryset.none()
            
        # 3. 學生：只顯示可見的
        if user.is_student():
            try:
                student = user.student_profile
                now = timezone.now()
                
                # 時間過濾
                time_filter = Q(available_from__lte=now) | Q(available_from__isnull=True)
                time_filter &= Q(available_until__gte=now) | Q(available_until__isnull=True)
                
                queryset = queryset.filter(time_filter)
                
                # 綁定課程
                enrolled_course_ids = StudentEnrollment.objects.filter(
                    student=student, is_active=True, is_deleted=False
                ).values_list('course_id', flat=True)
                
                # 學生群組
                student_group_ids = student.student_groups.values_list('group_id', flat=True)
                
                queryset = queryset.filter(
                    # 課程匹配
                    Q(courses__course_id__in=enrolled_course_ids) |
                    # 群組匹配
                    Q(student_groups__in=student_group_ids) |
                    # 既沒綁課程也沒綁群組 (公開資源?)
                    (~Q(courses__isnull=False) & ~Q(student_groups__isnull=False))
                ).distinct()
                
                # 再次過濾模式
                mode = self.request.query_params.get('mode')
                if mode:
                    queryset = queryset.filter(mode=mode)
                    
                return queryset
                
            except Student.DoesNotExist:
                return queryset.none()
                
        return queryset.none()

    def create(self, request, *args, **kwargs):
        """
        創建 LearningResource：只有老師可以創建（管理員需要先模擬老師身分）
        """
        user = request.user
        if not user.is_authenticated:
            return Response(
                {'detail': '需要登入'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # 管理員在非模擬狀態下不能創建
        if user.is_admin():
            return Response(
                {'detail': '管理員需要先切換到老師身分才能執行此操作'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # 只有老師可以創建
        if not user.is_teacher():
            return Response(
                {'detail': '只有老師可以創建教學資源'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        course_ids = request.data.get('course_ids', [])
        if user.is_teacher() and course_ids:
            # 如果指定了 courses，驗證是否都為自己的課程
            try:
                teacher = user.teacher_profile
                teacher_course_ids = Course.objects.filter(teacher=teacher).values_list('course_id', flat=True)
                invalid_courses = [cid for cid in course_ids if cid not in teacher_course_ids]
                if invalid_courses:
                    return Response(
                        {'detail': f'只能在自己課程下創建資源，無效的課程ID: {invalid_courses}'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Teacher.DoesNotExist:
                return Response(
                    {'detail': '找不到老師資料'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer.save(created_by=user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        """
        更新 LearningResource：只有老師可以更新（管理員需要先模擬老師身分）
        """
        instance = self.get_object()
        user = request.user
        
        if not user.is_authenticated:
            return Response(
                {'detail': '需要登入'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # 管理員在非模擬狀態下不能更新
        if user.is_admin():
            return Response(
                {'detail': '管理員需要先切換到老師身分才能執行此操作'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # 只有老師可以更新
        if not user.is_teacher():
            return Response(
                {'detail': '只有老師可以更新教學資源'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if user.is_teacher():
            if instance.course:
                try:
                    teacher = user.teacher_profile
                    if instance.course.teacher != teacher:
                        return Response(
                            {'detail': '只能編輯自己課程的資源'},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except Teacher.DoesNotExist:
                    return Response(
                        {'detail': '找不到老師資料'},
                        status=status.HTTP_403_FORBIDDEN
                    )
        
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """
        部分更新 LearningResource：只有老師可以更新（管理員需要先模擬老師身分）
        """
        instance = self.get_object()
        user = request.user
        
        if not user.is_authenticated:
            return Response(
                {'detail': '需要登入'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # 管理員在非模擬狀態下不能更新
        if user.is_admin():
            return Response(
                {'detail': '管理員需要先切換到老師身分才能執行此操作'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # 只有老師可以更新
        if not user.is_teacher():
            return Response(
                {'detail': '只有老師可以更新教學資源'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if user.is_teacher():
            # 檢查是否為該資源相關課程的老師
            try:
                teacher = user.teacher_profile
                resource_course_ids = instance.courses.values_list('course_id', flat=True)
                teacher_course_ids = Course.objects.filter(teacher=teacher).values_list('course_id', flat=True)
                
                # 如果資源有綁定課程，檢查是否至少有一個是自己的課程
                if resource_course_ids and not any(cid in teacher_course_ids for cid in resource_course_ids):
                    return Response(
                        {'detail': '只能編輯自己課程的資源'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Teacher.DoesNotExist:
                return Response(
                    {'detail': '找不到老師資料'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return super().partial_update(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'], url_path='bind-to-course')
    def bind_to_course(self, request, pk=None):
        """
        將教學資源綁定到課程（或從課程解除綁定）
        
        請求參數：
        - course_id: 課程ID
        - action: 'add' 或 'remove'
        """
        resource = self.get_object()
        user = request.user
        
        if not user.is_authenticated:
            return Response(
                {'detail': '需要登入'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_teacher():
            return Response(
                {'detail': '只有老師可以綁定教學資源到課程'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        course_id = request.data.get('course_id')
        action_type = request.data.get('action', 'add')
        
        if not course_id:
            return Response(
                {'detail': '需要提供 course_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            course = Course.objects.get(course_id=course_id)
            teacher = user.teacher_profile
            
            # 驗證是否為自己的課程
            if course.teacher != teacher:
                return Response(
                    {'detail': '只能在自己的課程下綁定資源'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if action_type == 'add':
                resource.courses.add(course)
                message = f'已將資源綁定到課程 {course.course_name}'
            elif action_type == 'remove':
                resource.courses.remove(course)
                message = f'已從課程 {course.course_name} 解除綁定'
            else:
                return Response(
                    {'detail': 'action 必須是 add 或 remove'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response({
                'detail': message,
                'resource_id': resource.resource_id,
                'course_ids': list(resource.courses.values_list('course_id', flat=True))
            }, status=status.HTTP_200_OK)
            
        except Course.DoesNotExist:
            return Response(
                {'detail': '課程不存在'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Teacher.DoesNotExist:
            return Response(
                {'detail': '找不到老師資料'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    @action(detail=True, methods=['post'], url_path='export')
    def export(self, request, pk=None):
        """
        匯出資源（PDF/HTML）
        
        請求參數：
        - format_type: 輸出格式 (question_only, question_solution_answer, solution_only, answer_only)
        """
        from cramschool.resource_modes import ModeRegistry
        
        resource = self.get_object()
        format_type = request.data.get('format_type', 'question_only')
        
        handler = ModeRegistry.get_handler(resource.mode)
        if not handler:
            return Response(
                {'detail': f'不支援的模式: {resource.mode}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            output = handler.generate_output(resource, format_type)
            return Response(output, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'detail': f'匯出失敗: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='grade')
    def grade(self, request, pk=None):
        """
        評分提交（僅適用於支援評分的模式）
        
        請求參數：
        - submission: 學生提交的答案字典
        """
        from cramschool.resource_modes import ModeRegistry
        
        resource = self.get_object()
        submission = request.data.get('submission', {})
        
        handler = ModeRegistry.get_handler(resource.mode)
        if not handler:
            return Response(
                {'detail': f'不支援的模式: {resource.mode}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            result = handler.grade_submission(resource, submission)
            if result is None:
                return Response(
                    {'detail': '此模式不支援評分'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'detail': f'評分失敗: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        """
        刪除 LearningResource：只有老師可以刪除（管理員需要先模擬老師身分）
        """
        instance = self.get_object()
        user = request.user
        
        if not user.is_authenticated:
            return Response(
                {'detail': '需要登入'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # 管理員在非模擬狀態下不能刪除
        if user.is_admin():
            return Response(
                {'detail': '管理員需要先切換到老師身分才能執行此操作'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # 只有老師可以刪除
        if not user.is_teacher():
            return Response(
                {'detail': '只有老師可以刪除教學資源'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if user.is_teacher():
            if instance.course:
                try:
                    teacher = user.teacher_profile
                    if instance.course.teacher != teacher:
                        return Response(
                            {'detail': '只能刪除自己課程的資源'},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except Teacher.DoesNotExist:
                    return Response(
                        {'detail': '找不到老師資料'},
                        status=status.HTTP_403_FORBIDDEN
                    )
        
        return super().destroy(request, *args, **kwargs)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_resource(request):
    """
    統一的資源生成 API
    根據模式和篩選條件生成教學資源的結構化資料
    """
    from cramschool.resource_modes import ModeRegistry
    
    # 獲取基本參數
    mode = request.data.get('mode', 'HANDOUT')
    title = request.data.get('title', '自動生成的資源')
    
    # 獲取篩選條件
    subject_id = request.data.get('subject_id')
    level = request.data.get('level')
    chapter = request.data.get('chapter')
    difficulty = request.data.get('difficulty')
    tag_ids = request.data.get('tag_ids', [])
    source = request.data.get('source')
    course_id = request.data.get('course_id')
    
    # 獲取模式特定參數
    is_individualized = request.data.get('is_individualized', False)
    student_group_ids = request.data.get('student_group_ids', [])
    template_id = request.data.get('template_id')
    
    # 建立查詢
    queryset = QuestionBank.objects.select_related('subject').prefetch_related('tags__tag').all()
    
    if subject_id:
        queryset = queryset.filter(subject_id=subject_id)
    if level:
        queryset = queryset.filter(level=level)
    if chapter:
        queryset = queryset.filter(chapter__icontains=chapter)
    if difficulty:
        try:
            queryset = queryset.filter(difficulty=int(difficulty))
        except ValueError:
            pass
    if tag_ids:
        queryset = queryset.filter(tags__tag_id__in=tag_ids).distinct()
    if source:
        queryset = queryset.filter(source=source)
    
    # 根據模式決定題目數量限制
    if mode == 'ONLINE_QUIZ':
        questions = queryset[:50]  # 線上測驗最多50題
    else:
        questions = queryset[:100]  # 講義模式最多100題
    
    # 生成結構化資料
    question_data = []
    for q in questions:
        question_data.append({
            'question_id': q.question_id,
            'subject': q.subject.name if q.subject else None,
            'level': q.get_level_display(),
            'chapter': q.chapter,
            'content': q.content,
            'correct_answer': q.correct_answer,
            'difficulty': q.difficulty,
            'question_type': q.question_type,
            'options': q.options,
            'tags': [qt.tag.tag_name for qt in q.tags.all()]
        })
    
    # 構建結構
    structure = []
    id_counter = 1
    
    # 如果有選擇 Template，先插入 Template 區塊
    if template_id:
        structure.append({
            'id': id_counter,
            'type': 'template',
            'template_id': template_id
        })
        id_counter += 1
    
    # 添加題目區塊
    for question in question_data:
        structure.append({
            'id': id_counter,
            'type': 'question',
            'question_id': question['question_id']
        })
        id_counter += 1
    
    response_data = {
        'title': title,
        'mode': mode,
        'course_id': course_id,
        'questions': question_data,
        'structure': structure,
        'total_count': len(question_data)
    }
    
    # 根據模式添加特定參數
    if mode == 'ONLINE_QUIZ':
        response_data['is_individualized'] = is_individualized
        response_data['student_group_ids'] = student_group_ids if is_individualized else []
    
    return Response(response_data)
