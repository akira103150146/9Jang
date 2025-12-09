# cramschool/api_views.py

from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Q, Count, Sum
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
import calendar
import os
import uuid
from .models import (
    Student, Teacher, Course, StudentEnrollment, EnrollmentPeriod, ExtraFee, 
    SessionRecord, Attendance, Leave, Subject, QuestionBank, Hashtag, QuestionTag,
    StudentAnswer, ErrorLog, Restaurant, GroupOrder, Order, OrderItem
)
from .serializers import (
    StudentSerializer, TeacherSerializer, CourseSerializer, 
    StudentEnrollmentSerializer, EnrollmentPeriodSerializer, ExtraFeeSerializer, 
    SessionRecordSerializer, AttendanceSerializer, LeaveSerializer,
    SubjectSerializer, QuestionBankSerializer, HashtagSerializer, QuestionTagSerializer,
    StudentAnswerSerializer, ErrorLogSerializer,
    RestaurantSerializer, GroupOrderSerializer, OrderSerializer, OrderItemSerializer
)

class StudentViewSet(viewsets.ModelViewSet):
    """
    提供 Student 模型 CRUD 操作的 API 視圖集
    """
    queryset = Student.objects.prefetch_related('enrollments__course', 'extra_fees').all()
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制
    
    @action(detail=True, methods=['get'])
    def tuition_status(self, request, pk=None):
        """
        檢查學生需要生成的學費月份
        返回從報名時間起到現在，每個月是否需要生成學費
        考慮學生的上課期間（EnrollmentPeriod），只在上課期間生成學費
        """
        student = self.get_object()
        enrollments = student.enrollments.filter(is_active=True).prefetch_related('periods')
        
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
                        notes__icontains=f"{course.course_name}"
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
                student=student
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
            notes__icontains=f"{course.course_name}"
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
    queryset = StudentEnrollment.objects.select_related('student', 'course').prefetch_related('periods').all()
    serializer_class = StudentEnrollmentSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制
    
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


class ExtraFeeViewSet(viewsets.ModelViewSet):
    """
    提供 ExtraFee 模型 CRUD 操作的 API 視圖集
    """
    queryset = ExtraFee.objects.select_related('student').all()
    serializer_class = ExtraFeeSerializer
    permission_classes = [AllowAny]  # 開發階段允許所有請求，生產環境請改為適當的權限控制
    
    def get_queryset(self):
        queryset = super().get_queryset()
        student_id = self.request.query_params.get('student', None)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        return queryset


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
        
        group_order = self.get_object()
        
        # 更新團購狀態
        group_order.status = 'Completed'
        group_order.closed_at = timezone.now()
        group_order.save()
        
        # 為每個已確認和待確認的訂單生成費用
        # 包括 Pending 和 Confirmed 狀態的訂單
        orders_to_process = group_order.orders.filter(status__in=['Pending', 'Confirmed'])
        created_fees = []
        
        for order in orders_to_process:
            # 檢查是否已經為這個學生在同一天生成過相同金額的餐費
            # 使用金額和日期作為重複檢查條件（因為同一個訂單金額相同）
            today = timezone.now().date()
            existing_fee = ExtraFee.objects.filter(
                student=order.student,
                item='Meal',
                amount=order.total_amount,
                fee_date=today
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
    queryset = Order.objects.select_related('group_order', 'student').prefetch_related('items').all()
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """
        支援按團購 ID 和學生 ID 篩選
        """
        queryset = super().get_queryset()
        group_order_id = self.request.query_params.get('group_order', None)
        student_id = self.request.query_params.get('student', None)
        
        if group_order_id:
            queryset = queryset.filter(group_order_id=group_order_id)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        return queryset
    
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

