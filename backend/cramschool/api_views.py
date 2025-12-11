# cramschool/api_views.py

from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Q, Count, Sum
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
import calendar
import os
import uuid
from django.contrib.auth import get_user_model
from account.models import UserRole
from .models import (
    Student, Teacher, Course, StudentEnrollment, EnrollmentPeriod, ExtraFee, 
    SessionRecord, Attendance, Leave, Subject, QuestionBank, Hashtag, QuestionTag,
    StudentAnswer, ErrorLog, Restaurant, GroupOrder, Order, OrderItem,
    StudentGroup, Quiz, Exam, CourseMaterial
)

CustomUser = get_user_model()
from .serializers import (
    StudentSerializer, TeacherSerializer, CourseSerializer, 
    StudentEnrollmentSerializer, EnrollmentPeriodSerializer, ExtraFeeSerializer, 
    SessionRecordSerializer, AttendanceSerializer, LeaveSerializer,
    SubjectSerializer, QuestionBankSerializer, HashtagSerializer, QuestionTagSerializer,
    StudentAnswerSerializer, ErrorLogSerializer,
    RestaurantSerializer, GroupOrderSerializer, OrderSerializer, OrderItemSerializer,
    StudentGroupSerializer, QuizSerializer, ExamSerializer, CourseMaterialSerializer
)

class StudentViewSet(viewsets.ModelViewSet):
    """
    提供 Student 模型 CRUD 操作的 API 視圖集
    """
    queryset = Student.objects.all()  # 用於路由器確定 basename，實際查詢由 get_queryset() 處理
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制
    
    def get_queryset(self):
        """
        根據查詢參數決定是否包含已刪除的記錄
        """
        queryset = Student.objects.prefetch_related('enrollments__course', 'extra_fees', 'user').all()
        
        # 檢查是否有 include_deleted 參數
        include_deleted = self.request.query_params.get('include_deleted', 'false').lower() == 'true'
        
        if not include_deleted:
            # 預設過濾掉已刪除的記錄
            queryset = queryset.filter(is_deleted=False)
        
        return queryset
    
    def get_serializer_context(self):
        """
        將 request 傳遞給序列化器，用於判斷是否為管理員
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def destroy(self, request, *args, **kwargs):
        """
        軟刪除學生記錄
        """
        instance = self.get_object()
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
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
        創建學生時自動創建用戶帳號
        """
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
                must_change_password=True  # 首次登入需修改密碼
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
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制
    
    def get_serializer_context(self):
        """
        將 request 傳遞給序列化器，用於獲取初始數據
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class CourseViewSet(viewsets.ModelViewSet):
    """
    提供 Course 模型 CRUD 操作的 API 視圖集
    學生只能看到自己報名的課程
    """
    queryset = Course.objects.select_related('teacher').all()
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制
    
    def get_queryset(self):
        """
        根據用戶角色過濾課程
        - 管理員：可以看到所有課程
        - 老師：可以看到所有課程
        - 學生：只能看到自己報名的課程
        """
        queryset = super().get_queryset()
        
        # 如果用戶未認證，返回所有課程
        if not self.request.user.is_authenticated:
            return queryset
        
        # 管理員和老師可以看到所有課程
        if self.request.user.is_admin() or self.request.user.is_teacher():
            return queryset
        
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
        
        # 其他情況返回所有課程
        return queryset


class EnrollmentPeriodViewSet(viewsets.ModelViewSet):
    """
    提供 EnrollmentPeriod 模型 CRUD 操作的 API 視圖集
    """
    queryset = EnrollmentPeriod.objects.select_related('enrollment', 'enrollment__student', 'enrollment__course').all()
    serializer_class = EnrollmentPeriodSerializer
    permission_classes = [AllowAny]
    
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
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制
    
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
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制
    
    def get_queryset(self):
        """
        根據查詢參數決定是否包含已刪除的記錄
        """
        queryset = ExtraFee.objects.select_related('student').all()
        
        # 檢查是否有 include_deleted 參數
        include_deleted = self.request.query_params.get('include_deleted', 'false').lower() == 'true'
        
        if not include_deleted:
            # 預設過濾掉已刪除的記錄
            queryset = queryset.filter(is_deleted=False)
        
        student_id = self.request.query_params.get('student', None)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        """
        禁止刪除費用記錄
        """
        return Response(
            {'detail': '費用記錄無法刪除，請修改狀態或備註'},
            status=status.HTTP_403_FORBIDDEN
        )
    
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
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    提供 Attendance 模型 CRUD 操作的 API 視圖集
    """
    queryset = Attendance.objects.all()  # 用於路由器確定 basename，實際查詢由 get_queryset() 處理
    serializer_class = AttendanceSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制
    
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
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制
    
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
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制


class QuestionBankViewSet(viewsets.ModelViewSet):
    """
    提供 QuestionBank 模型 CRUD 操作的 API 視圖集
    支援多條件篩選：科目、年級、章節、難度、標籤、來源
    """
    queryset = QuestionBank.objects.select_related('subject', 'created_by', 'imported_from_error_log').prefetch_related('tags__tag').all()
    serializer_class = QuestionBankSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制
    
    def get_queryset(self):
        """
        根據查詢參數進行多條件篩選
        """
        queryset = super().get_queryset()
        
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
        
        # 標籤篩選（支援多個標籤）
        tags = self.request.query_params.getlist('tags[]')
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
    queryset = StudentAnswer.objects.all()  # 用於路由器確定 basename，實際查詢由 get_queryset() 處理
    serializer_class = StudentAnswerSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制
    
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
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制
    
    def get_queryset(self):
        """
        支援按學生 ID 篩選錯題記錄，並優化查詢
        根據查詢參數決定是否包含已刪除的記錄
        """
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
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        """
        軟刪除錯題記錄
        """
        instance = self.get_object()
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
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
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class GroupOrderViewSet(viewsets.ModelViewSet):
    """
    提供 GroupOrder 模型 CRUD 操作的 API 視圖集
    """
    queryset = GroupOrder.objects.select_related('restaurant', 'created_by').prefetch_related('orders').all()
    serializer_class = GroupOrderSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        """
        創建團購時自動生成唯一連結
        """
        # 生成唯一連結
        unique_link = f"order-{uuid.uuid4().hex[:12]}"
        
        # 確保連結唯一
        while GroupOrder.objects.filter(order_link=unique_link).exists():
            unique_link = f"order-{uuid.uuid4().hex[:12]}"
        
        # 保存時自動設置連結
        serializer.save(order_link=unique_link)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        完成團購並自動生成費用
        """
        from django.utils import timezone
        from decimal import Decimal
        
        # 權限：僅管理員或會計可完成團購
        if not request.user.is_authenticated or not (request.user.is_admin() or request.user.is_accountant()):
            return Response(
                {'detail': '只有管理員或會計可以完成團購'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        group_order = self.get_object()
        
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
                    # 如果有 notes 欄位，添加團購資訊（需要遷移後才能使用）
                    try:
                        fee.notes = f"團購：{group_order.title} (訂單ID: {order.order_id}, 團購ID: {group_order.group_order_id})"
                        fee.save()
                    except:
                        pass  # 如果 notes 欄位不存在，忽略
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
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """
        支援按團購 ID 和學生 ID 篩選
        根據查詢參數決定是否包含已刪除的記錄
        """
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
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        """
        創建訂單項目時自動計算小計，並更新訂單總金額
        """
        item = serializer.save()
        item.subtotal = item.quantity * item.unit_price
        item.save()
        
        # 更新訂單總金額
        order = item.order
        items = OrderItem.objects.filter(order=order)
        order.total_amount = sum(item.subtotal for item in items)
        order.save()
    
    def perform_update(self, serializer):
        """
        更新訂單項目時自動計算小計，並更新訂單總金額
        """
        item = serializer.save()
        item.subtotal = item.quantity * item.unit_price
        item.save()
        
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
    permission_classes = [AllowAny]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'], url_path='add-students')
    def add_students(self, request, pk=None):
        """
        新增學生到群組
        """
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


class QuizViewSet(viewsets.ModelViewSet):
    """
    提供 Quiz 模型 CRUD 操作的 API 視圖集
    """
    queryset = Quiz.objects.select_related('course', 'created_by').prefetch_related('questions', 'student_groups__students').all()
    serializer_class = QuizSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            from .serializers import QuizDetailSerializer
            return QuizDetailSerializer
        return self.serializer_class

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        """
        根據用戶角色過濾 Quiz
        """
        queryset = super().get_queryset()
        
        # 如果用戶未認證，返回所有 Quiz
        if not self.request.user.is_authenticated:
            return queryset
        
        # 管理員和老師可以看到所有 Quiz
        if self.request.user.is_admin() or self.request.user.is_teacher():
            return queryset
        
        # 學生只能看到自己報名課程的 Quiz，且符合群組可見性
        if self.request.user.is_student():
            try:
                student = self.request.user.student_profile
                enrolled_course_ids = StudentEnrollment.objects.filter(
                    student=student,
                    is_active=True,
                    is_deleted=False
                ).values_list('course_id', flat=True)
                
                queryset = queryset.filter(course_id__in=enrolled_course_ids)
                
                # 過濾個別化測驗
                queryset = queryset.filter(
                    Q(is_individualized=False) |
                    Q(student_groups__students=student)
                ).distinct()
                
                return queryset
            except Student.DoesNotExist:
                return queryset.none()
        
        # 會計看不到 Quiz
        if self.request.user.is_accountant():
            return queryset.none()
        
        return queryset

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """
        提交測驗作答
        request.data: {
            'answers': [
                {'question_id': 1, 'answer_text': 'A', 'image_path': 'path/to/image.jpg'}
            ]
        }
        """
        if not request.user.is_authenticated or not request.user.is_student():
            return Response({'detail': '只有學生可以提交測驗'}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            student = request.user.student_profile
        except Student.DoesNotExist:
            return Response({'detail': '找不到學生資料'}, status=status.HTTP_404_NOT_FOUND)
            
        quiz = self.get_object()
        answers_data = request.data.get('answers', [])
        
        # 檢查是否已經提交過 (可選：是否允許重複提交)
        # 這裡假設每次提交都是新的 AssessmentSubmission
        
        submission = AssessmentSubmission.objects.create(
            student=student,
            quiz=quiz,
            status='Pending' # 待批改 (或如果有自動批改則設為 Graded)
        )
        
        total_score = 0
        is_fully_graded = True
        
        for ans_data in answers_data:
            question_id = ans_data.get('question_id')
            answer_text = ans_data.get('answer_text')
            image_path = ans_data.get('image_path')
            
            try:
                question = QuestionBank.objects.get(question_id=question_id)
            except QuestionBank.DoesNotExist:
                continue
                
            is_correct = False
            # 自動批改邏輯 (僅針對選擇題或簡單填空)
            # 假設 correct_answer 存的是標準答案
            if answer_text and question.correct_answer:
                # 簡單比對 (去除空白與大小寫)
                if answer_text.strip().lower() == question.correct_answer.strip().lower():
                    is_correct = True
                    total_score += 1 # 假設每題1分，或者需要題目分數欄位 (目前沒有，暫定1分)
            
            # 創建單題作答記錄
            StudentAnswer.objects.create(
                student=student,
                question=question,
                test_name=quiz.title,
                submission=submission,
                is_correct=is_correct,
                scanned_file_path=image_path
            )
            
            # 更新錯題本
            if not is_correct:
                error_log, created = ErrorLog.objects.get_or_create(
                    student=student,
                    question=question,
                    defaults={'error_count': 1, 'review_status': 'New'}
                )
                if not created:
                    error_log.error_count += 1
                    error_log.review_status = 'Reviewing'
                    error_log.save()
        
        submission.score = total_score
        submission.status = 'Graded' # 簡單邏輯：全部自動批改完成
        submission.save()
        
        return Response({
            'message': '測驗提交成功',
            'submission_id': submission.submission_id,
            'score': total_score
        })


class ExamViewSet(viewsets.ModelViewSet):
    """
    提供 Exam 模型 CRUD 操作的 API 視圖集
    支援個別化教學，學生只能看到自己群組的考卷
    """
    queryset = Exam.objects.select_related('course', 'created_by').prefetch_related('questions', 'student_groups__students').all()
    serializer_class = ExamSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            from .serializers import ExamDetailSerializer
            return ExamDetailSerializer
        return self.serializer_class
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        """
        根據用戶角色過濾 Exam
        """
        queryset = super().get_queryset()
        
        # 如果用戶未認證，返回所有 Exam
        if not self.request.user.is_authenticated:
            return queryset
        
        # 管理員和老師可以看到所有 Exam
        if self.request.user.is_admin() or self.request.user.is_teacher():
            return queryset
        
        # 學生只能看到自己報名課程的 Exam，且符合群組可見性
        if self.request.user.is_student():
            try:
                student = self.request.user.student_profile
                enrolled_course_ids = StudentEnrollment.objects.filter(
                    student=student,
                    is_active=True,
                    is_deleted=False
                ).values_list('course_id', flat=True)
                
                # 過濾課程
                queryset = queryset.filter(course_id__in=enrolled_course_ids)
                
                # 過濾個別化考卷：只顯示學生所屬群組的考卷，或非個別化的考卷
                queryset = queryset.filter(
                    Q(is_individualized=False) |  # 非個別化考卷，所有學生可見
                    Q(student_groups__students=student)  # 個別化考卷，但學生在群組中
                ).distinct()
                
                return queryset
            except Student.DoesNotExist:
                return queryset.none()
        
        # 會計看不到 Exam
        if self.request.user.is_accountant():
            return queryset.none()
        
        return queryset

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """
        提交考卷作答
        """
        if not request.user.is_authenticated or not request.user.is_student():
            return Response({'detail': '只有學生可以提交考卷'}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            student = request.user.student_profile
        except Student.DoesNotExist:
            return Response({'detail': '找不到學生資料'}, status=status.HTTP_404_NOT_FOUND)
            
        exam = self.get_object()
        answers_data = request.data.get('answers', [])
        
        submission = AssessmentSubmission.objects.create(
            student=student,
            exam=exam,
            status='Pending'
        )
        
        total_score = 0
        
        for ans_data in answers_data:
            question_id = ans_data.get('question_id')
            answer_text = ans_data.get('answer_text')
            image_path = ans_data.get('image_path')
            
            try:
                question = QuestionBank.objects.get(question_id=question_id)
            except QuestionBank.DoesNotExist:
                continue
                
            is_correct = False
            if answer_text and question.correct_answer:
                if answer_text.strip().lower() == question.correct_answer.strip().lower():
                    is_correct = True
                    total_score += 1
            
            StudentAnswer.objects.create(
                student=student,
                question=question,
                test_name=exam.title,
                submission=submission,
                is_correct=is_correct,
                scanned_file_path=image_path
            )
            
            if not is_correct:
                error_log, created = ErrorLog.objects.get_or_create(
                    student=student,
                    question=question,
                    defaults={'error_count': 1, 'review_status': 'New'}
                )
                if not created:
                    error_log.error_count += 1
                    error_log.review_status = 'Reviewing'
                    error_log.save()
        
        submission.score = total_score
        submission.status = 'Graded'
        submission.save()
        
        return Response({
            'message': '考卷提交成功',
            'submission_id': submission.submission_id,
            'score': total_score
        })


class CourseMaterialViewSet(viewsets.ModelViewSet):
    """
    提供 CourseMaterial 模型 CRUD 操作的 API 視圖集
    """
    queryset = CourseMaterial.objects.select_related('course', 'created_by').prefetch_related('questions').all()
    serializer_class = CourseMaterialSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        """
        根據用戶角色過濾 CourseMaterial
        """
        queryset = super().get_queryset()
        
        # 如果用戶未認證，返回所有 CourseMaterial
        if not self.request.user.is_authenticated:
            return queryset
        
        # 管理員和老師可以看到所有 CourseMaterial
        if self.request.user.is_admin() or self.request.user.is_teacher():
            return queryset
        
        # 學生只能看到自己報名課程的講義
        if self.request.user.is_student():
            try:
                student = self.request.user.student_profile
                enrolled_course_ids = StudentEnrollment.objects.filter(
                    student=student,
                    is_active=True,
                    is_deleted=False
                ).values_list('course_id', flat=True)
                
                queryset = queryset.filter(course_id__in=enrolled_course_ids)
                
                # 過濾個別化講義
                queryset = queryset.filter(
                    Q(is_individualized=False) |
                    Q(student_groups__students=student)
                ).distinct()
                
                return queryset
            except Student.DoesNotExist:
                return queryset.none()
        
        # 會計看不到 CourseMaterial
        if self.request.user.is_accountant():
            return queryset.none()
        
        return queryset


@api_view(['POST'])
def generate_quiz(request):
    """
    根據篩選條件生成 Quiz 的結構化資料
    """
    # 獲取篩選條件
    subject_id = request.data.get('subject_id')
    level = request.data.get('level')
    chapter = request.data.get('chapter')
    difficulty = request.data.get('difficulty')
    tag_ids = request.data.get('tag_ids', [])
    source = request.data.get('source')
    course_id = request.data.get('course_id')
    title = request.data.get('title', '自動生成的 Quiz')
    
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
    
    questions = queryset[:50]  # 限制最多50題
    
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
            'tags': [qt.tag.tag_name for qt in q.tags.all()]
        })
    
    return Response({
        'title': title,
        'course_id': course_id,
        'questions': question_data,
        'total_count': len(question_data)
    })


@api_view(['POST'])
def generate_exam(request):
    """
    根據篩選條件生成 Exam 的結構化資料
    """
    # 獲取篩選條件
    subject_id = request.data.get('subject_id')
    level = request.data.get('level')
    chapter = request.data.get('chapter')
    difficulty = request.data.get('difficulty')
    tag_ids = request.data.get('tag_ids', [])
    source = request.data.get('source')
    course_id = request.data.get('course_id')
    title = request.data.get('title', '自動生成的考卷')
    is_individualized = request.data.get('is_individualized', False)
    student_group_ids = request.data.get('student_group_ids', [])
    
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
    
    questions = queryset[:100]  # 限制最多100題
    
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
            'tags': [qt.tag.tag_name for qt in q.tags.all()]
        })
    
    return Response({
        'title': title,
        'course_id': course_id,
        'is_individualized': is_individualized,
        'student_group_ids': student_group_ids,
        'questions': question_data,
        'total_count': len(question_data)
    })


@api_view(['POST'])
def generate_material(request):
    """
    根據篩選條件生成 CourseMaterial 的結構化資料
    """
    # 獲取篩選條件
    subject_id = request.data.get('subject_id')
    level = request.data.get('level')
    chapter = request.data.get('chapter')
    difficulty = request.data.get('difficulty')
    tag_ids = request.data.get('tag_ids', [])
    source = request.data.get('source')
    course_id = request.data.get('course_id')
    title = request.data.get('title', '自動生成的講義')
    content = request.data.get('content', '')  # 講義內容（Markdown）
    
    # 建立查詢（用於引用的題目）
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
    
    questions = queryset[:200]  # 限制最多200題
    
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
            'tags': [qt.tag.tag_name for qt in q.tags.all()]
        })
    
    return Response({
        'title': title,
        'course_id': course_id,
        'content': content,
        'questions': question_data,
        'total_count': len(question_data)
    })

