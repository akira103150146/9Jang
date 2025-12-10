# cramschool/serializers.py

from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import (
    Student, Teacher, Course, StudentEnrollment, EnrollmentPeriod, ExtraFee, 
    SessionRecord, Attendance, Leave, Subject, QuestionBank, Hashtag, QuestionTag,
    StudentAnswer, ErrorLog, Restaurant, GroupOrder, Order, OrderItem
)

class StudentSerializer(serializers.ModelSerializer):
    """
    學生資料序列化器
    """
    total_fees = serializers.SerializerMethodField()
    unpaid_fees = serializers.SerializerMethodField()
    enrollments_count = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    password = serializers.SerializerMethodField()  # 密碼欄位，僅管理員可見
    is_account_active = serializers.SerializerMethodField()  # 帳號狀態，僅管理員可見
    must_change_password = serializers.SerializerMethodField()  # 是否需修改密碼，僅管理員可見
    
    class Meta:
        model = Student
        fields = [
            'student_id', 'name', 'school', 'grade', 'phone', 
            'emergency_contact_name', 'emergency_contact_phone', 'notes',
            'user', 'username', 'user_email', 'password', 'is_account_active', 'must_change_password',
            'total_fees', 'unpaid_fees', 'enrollments_count',
            'is_deleted', 'deleted_at'
        ]
        read_only_fields = ['student_id', 'user', 'username', 'user_email', 'password', 'is_account_active', 'must_change_password', 'total_fees', 'unpaid_fees', 'enrollments_count', 'is_deleted', 'deleted_at']
    
    def get_password(self, obj):
        """
        僅管理員可以看到密碼
        """
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.is_admin():
            return obj.initial_password or ''
        return None
    
    def get_is_account_active(self, obj):
        """
        僅管理員可以看到帳號狀態
        """
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.is_admin():
            return obj.user.is_active if obj.user else None
        return None
    
    def get_must_change_password(self, obj):
        """
        僅管理員可以看到是否需要修改密碼
        """
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.is_admin():
            return obj.user.must_change_password if obj.user else None
        return None
    
    def get_total_fees(self, obj):
        """計算學生總費用"""
        from django.db.models import Sum
        result = obj.extra_fees.aggregate(total=Sum('amount'))
        return float(result['total'] or 0)
    
    def get_unpaid_fees(self, obj):
        """計算學生未繳費用"""
        from django.db.models import Sum, Q
        result = obj.extra_fees.filter(
            Q(payment_status='Unpaid') | Q(payment_status='Partial')
        ).aggregate(total=Sum('amount'))
        return float(result['total'] or 0)
    
    def get_enrollments_count(self, obj):
        """獲取學生報名的課程數量"""
        return obj.enrollments.count()


class TeacherSerializer(serializers.ModelSerializer):
    """
    老師資料序列化器
    """
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = Teacher
        fields = ['teacher_id', 'name', 'username', 'password', 'password_hash', 'permission_level', 'phone', 'hire_date']
        read_only_fields = ['teacher_id', 'password_hash']
        extra_kwargs = {
            'password': {'write_only': True},
            'name': {'required': True},
            'username': {'required': True},
        }
    
    def validate_username(self, value):
        """驗證帳號唯一性"""
        if not value or not value.strip():
            raise serializers.ValidationError('帳號不能為空')
        
        # 檢查是否已存在（編輯時排除自己）
        queryset = Teacher.objects.filter(username=value.strip())
        if self.instance:  # 編輯模式
            queryset = queryset.exclude(teacher_id=self.instance.teacher_id)
        if queryset.exists():
            raise serializers.ValidationError('此帳號已被使用，請選擇其他帳號')
        
        return value.strip()
    
    def validate_name(self, value):
        """驗證姓名"""
        if not value or not value.strip():
            raise serializers.ValidationError('姓名不能為空')
        return value.strip()
    
    def create(self, validated_data):
        # 創建時必須提供密碼
        password = validated_data.pop('password', None)
        if not password or (isinstance(password, str) and password.strip() == ''):
            raise serializers.ValidationError({'password': ['創建老師時必須提供密碼']})
        
        # 確保密碼是字符串
        if not isinstance(password, str):
            password = str(password)
        
        validated_data['password_hash'] = make_password(password.strip())
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # 更新時如果提供了密碼，則進行雜湊處理
        password = validated_data.pop('password', None)
        if password and password.strip() != '':
            validated_data['password_hash'] = make_password(password)
        return super().update(instance, validated_data)


class CourseSerializer(serializers.ModelSerializer):
    """
    課程資料序列化器
    """
    teacher_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'course_id', 'course_name', 'teacher', 'teacher_name',
            'start_time', 'end_time', 'day_of_week', 'fee_per_session', 'status'
        ]
        read_only_fields = ['course_id', 'teacher_name']
    
    def get_teacher_name(self, obj):
        return obj.teacher.name if obj.teacher else None


class EnrollmentPeriodSerializer(serializers.ModelSerializer):
    """
    報名期間序列化器
    """
    class Meta:
        model = EnrollmentPeriod
        fields = [
            'period_id', 'enrollment', 'start_date', 'end_date', 'is_active', 'notes'
        ]
        read_only_fields = ['period_id']


class StudentEnrollmentSerializer(serializers.ModelSerializer):
    """
    學生課程報名序列化器
    """
    student_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()
    periods = EnrollmentPeriodSerializer(many=True, read_only=True)
    
    class Meta:
        model = StudentEnrollment
        fields = [
            'enrollment_id', 'student', 'student_name', 'course', 'course_name',
            'enroll_date', 'discount_rate', 'is_active', 'periods',
            'is_deleted', 'deleted_at'
        ]
        read_only_fields = ['enrollment_id', 'student_name', 'course_name', 'is_deleted', 'deleted_at']
    
    def get_student_name(self, obj):
        return obj.student.name if obj.student else None
    
    def get_course_name(self, obj):
        return obj.course.course_name if obj.course else None


class ExtraFeeSerializer(serializers.ModelSerializer):
    """
    額外收費序列化器
    """
    student_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ExtraFee
        fields = [
            'fee_id', 'student', 'student_name', 'item', 'amount', 'fee_date', 'payment_status', 'notes',
            'is_deleted', 'deleted_at'
        ]
        read_only_fields = ['fee_id', 'student_name', 'is_deleted', 'deleted_at']
    
    def get_student_name(self, obj):
        return obj.student.name if obj.student else None


class SessionRecordSerializer(serializers.ModelSerializer):
    """
    課程上課記錄序列化器
    """
    course_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SessionRecord
        fields = ['session_id', 'course', 'course_name', 'session_date']
        read_only_fields = ['session_id', 'course_name']
    
    def get_course_name(self, obj):
        return obj.course.course_name if obj.course else None


class AttendanceSerializer(serializers.ModelSerializer):
    """
    出席記錄序列化器
    """
    student_name = serializers.SerializerMethodField()
    session_id_display = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()
    session_date = serializers.SerializerMethodField()
    
    class Meta:
        model = Attendance
        fields = [
            'attendance_id', 'session', 'session_id_display', 'student', 'student_name',
            'status', 'course_name', 'session_date',
            'is_deleted', 'deleted_at'
        ]
        read_only_fields = ['attendance_id', 'student_name', 'session_id_display', 'course_name', 'session_date', 'is_deleted', 'deleted_at']
    
    def get_student_name(self, obj):
        return obj.student.name if obj.student else None
    
    def get_session_id_display(self, obj):
        return obj.session.session_id if obj.session else None
    
    def get_course_name(self, obj):
        return obj.session.course.course_name if obj.session and obj.session.course else None
    
    def get_session_date(self, obj):
        return obj.session.session_date if obj.session else None


class LeaveSerializer(serializers.ModelSerializer):
    """
    請假記錄序列化器
    """
    student_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Leave
        fields = [
            'leave_id', 'student', 'student_name', 'course', 'course_name',
            'leave_date', 'reason', 'approval_status',
            'is_deleted', 'deleted_at'
        ]
        read_only_fields = ['leave_id', 'student_name', 'course_name', 'is_deleted', 'deleted_at']
    
    def get_student_name(self, obj):
        return obj.student.name if obj.student else None
    
    def get_course_name(self, obj):
        return obj.course.course_name if obj.course else None


class SubjectSerializer(serializers.ModelSerializer):
    """
    科目序列化器
    """
    class Meta:
        model = Subject
        fields = ['subject_id', 'name', 'code', 'description', 'created_at']
        read_only_fields = ['subject_id', 'created_at']


class HashtagSerializer(serializers.ModelSerializer):
    """
    標籤序列化器
    """
    creator_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Hashtag
        fields = ['tag_id', 'tag_name', 'creator', 'creator_name']
        read_only_fields = ['tag_id', 'creator_name']
        extra_kwargs = {
            'creator': {'required': False, 'allow_null': True}
        }
    
    def get_creator_name(self, obj):
        return obj.creator.name if obj.creator else None


class QuestionTagSerializer(serializers.ModelSerializer):
    """
    題目標籤關聯序列化器
    """
    tag_name = serializers.SerializerMethodField()
    
    class Meta:
        model = QuestionTag
        fields = ['question_tag_id', 'question', 'tag', 'tag_name']
        read_only_fields = ['question_tag_id', 'tag_name']
    
    def get_tag_name(self, obj):
        return obj.tag.tag_name if obj.tag else None


class QuestionBankSerializer(serializers.ModelSerializer):
    """
    題目庫序列化器
    """
    tags = serializers.SerializerMethodField()
    tag_ids = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    tag_ids_input = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text='標籤ID列表（寫入用）'
    )
    
    class Meta:
        model = QuestionBank
        fields = [
            'question_id', 'subject', 'subject_name', 'level', 'chapter', 'content',
            'image_path', 'correct_answer', 'difficulty', 'tags', 'tag_ids', 'tag_ids_input'
        ]
        read_only_fields = ['question_id', 'tags', 'tag_ids', 'subject_name']
    
    def get_tags(self, obj):
        """
        獲取題目的所有標籤名稱
        """
        return [qt.tag.tag_name for qt in obj.tags.select_related('tag').all()]
    
    def get_tag_ids(self, obj):
        """
        獲取題目的所有標籤ID
        """
        return [qt.tag.tag_id for qt in obj.tags.select_related('tag').all()]
    
    def get_subject_name(self, obj):
        """
        獲取科目名稱
        """
        return obj.subject.name if obj.subject else None
    
    def create(self, validated_data):
        """
        創建題目並關聯標籤
        """
        tag_ids = validated_data.pop('tag_ids_input', [])
        question = QuestionBank.objects.create(**validated_data)
        
        # 關聯標籤
        if tag_ids:
            for tag_id in tag_ids:
                try:
                    tag = Hashtag.objects.get(tag_id=tag_id)
                    QuestionTag.objects.get_or_create(question=question, tag=tag)
                except Hashtag.DoesNotExist:
                    pass
        
        return question
    
    def update(self, instance, validated_data):
        """
        更新題目並處理標籤關聯
        """
        tag_ids = validated_data.pop('tag_ids_input', None)
        
        # 更新題目基本資訊
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # 如果提供了 tag_ids，則更新標籤關聯
        if tag_ids is not None:
            # 刪除現有的標籤關聯
            QuestionTag.objects.filter(question=instance).delete()
            # 創建新的標籤關聯
            for tag_id in tag_ids:
                try:
                    tag = Hashtag.objects.get(tag_id=tag_id)
                    QuestionTag.objects.create(question=instance, tag=tag)
                except Hashtag.DoesNotExist:
                    pass
        
        return instance


class StudentAnswerSerializer(serializers.ModelSerializer):
    """
    學生作答記錄序列化器
    """
    student_name = serializers.SerializerMethodField()
    question_chapter = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentAnswer
        fields = [
            'answer_id', 'student', 'student_name', 'question', 'question_chapter',
            'test_name', 'is_correct', 'scanned_file_path',
            'is_deleted', 'deleted_at'
        ]
        read_only_fields = ['answer_id', 'student_name', 'question_chapter', 'is_deleted', 'deleted_at']
    
    def get_student_name(self, obj):
        return obj.student.name if obj.student else None
    
    def get_question_chapter(self, obj):
        return obj.question.chapter if obj.question else None
    
    def create(self, validated_data):
        """
        創建作答記錄，如果答錯則自動創建或更新錯題記錄
        """
        answer = StudentAnswer.objects.create(**validated_data)
        
        # 如果答錯，更新錯題記錄
        if not answer.is_correct:
            error_log, created = ErrorLog.objects.get_or_create(
                student=answer.student,
                question=answer.question,
                defaults={'error_count': 1, 'review_status': 'New'}
            )
            
            if not created:
                # 如果錯題記錄已存在，增加錯誤次數
                error_log.error_count += 1
                # 如果狀態是已掌握，改回複習中
                if error_log.review_status == 'Mastered':
                    error_log.review_status = 'Reviewing'
                error_log.save()
        
        return answer
    
    def update(self, instance, validated_data):
        """
        更新作答記錄，如果改為答錯則更新錯題記錄
        """
        old_is_correct = instance.is_correct
        answer = super().update(instance, validated_data)
        
        # 如果從答對改為答錯，需要創建或更新錯題記錄
        if old_is_correct and not answer.is_correct:
            error_log, created = ErrorLog.objects.get_or_create(
                student=answer.student,
                question=answer.question,
                defaults={'error_count': 1, 'review_status': 'New'}
            )
            
            if not created:
                error_log.error_count += 1
                if error_log.review_status == 'Mastered':
                    error_log.review_status = 'Reviewing'
                error_log.save()
        
        return answer


class ErrorLogSerializer(serializers.ModelSerializer):
    """
    錯題本序列化器
    """
    student_name = serializers.SerializerMethodField()
    question_chapter = serializers.SerializerMethodField()
    question_subject = serializers.SerializerMethodField()
    question_level = serializers.SerializerMethodField()
    question_content = serializers.SerializerMethodField()
    
    class Meta:
        model = ErrorLog
        fields = [
            'error_log_id', 'student', 'student_name', 'question', 
            'question_chapter', 'question_subject', 'question_level',
            'question_content', 'error_count', 'review_status',
            'is_deleted', 'deleted_at'
        ]
        read_only_fields = [
            'error_log_id', 'student_name', 'question_chapter', 
            'question_subject', 'question_level', 'question_content',
            'is_deleted', 'deleted_at'
        ]
    
    def get_student_name(self, obj):
        return obj.student.name if obj.student else None
    
    def get_question_chapter(self, obj):
        return obj.question.chapter if obj.question else None
    
    def get_question_subject(self, obj):
        return obj.question.subject.name if obj.question and obj.question.subject else None
    
    def get_question_level(self, obj):
        return obj.question.get_level_display() if obj.question else None
    
    def get_question_content(self, obj):
        # 只返回內容的前100個字符作為預覽
        if obj.question and obj.question.content:
            content = obj.question.content
            if len(content) > 100:
                return content[:100] + '...'
            return content
        return None


class OrderItemSerializer(serializers.ModelSerializer):
    """
    訂單項目序列化器
    """
    class Meta:
        model = OrderItem
        fields = ['order_item_id', 'order', 'item_name', 'quantity', 'unit_price', 'subtotal']
        read_only_fields = ['order_item_id']


class OrderSerializer(serializers.ModelSerializer):
    """
    訂單序列化器
    """
    student_name = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True, read_only=True)
    group_order_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'order_id', 'group_order', 'group_order_title', 'student', 'student_name',
            'status', 'total_amount', 'notes', 'items', 'created_at', 'updated_at',
            'is_deleted', 'deleted_at'
        ]
        read_only_fields = ['order_id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']
        extra_kwargs = {
            'group_order': {'required': False},
            'student': {'required': False},
            'total_amount': {'required': False},
        }
    
    def get_student_name(self, obj):
        return obj.student.name if obj.student else None
    
    def get_group_order_title(self, obj):
        return obj.group_order.title if obj.group_order else None


class GroupOrderSerializer(serializers.ModelSerializer):
    """
    團購序列化器
    """
    restaurant_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    orders_count = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = GroupOrder
        fields = [
            'group_order_id', 'restaurant', 'restaurant_name', 'title', 'order_link',
            'status', 'deadline', 'created_by', 'created_by_name', 'orders_count',
            'total_amount', 'created_at', 'closed_at'
        ]
        read_only_fields = ['group_order_id', 'order_link', 'created_at']
    
    def get_restaurant_name(self, obj):
        return obj.restaurant.name if obj.restaurant else None
    
    def get_created_by_name(self, obj):
        return obj.created_by.name if obj.created_by else None
    
    def get_orders_count(self, obj):
        return obj.orders.filter(status__in=['Pending', 'Confirmed']).count()
    
    def get_total_amount(self, obj):
        from django.db.models import Sum
        total = obj.orders.filter(status__in=['Pending', 'Confirmed']).aggregate(
            total=Sum('total_amount')
        )['total']
        return float(total) if total else 0.00


class RestaurantSerializer(serializers.ModelSerializer):
    """
    店家序列化器
    """
    menu_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Restaurant
        fields = [
            'restaurant_id', 'name', 'phone', 'address', 'menu_image_path',
            'menu_image_url', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['restaurant_id', 'created_at', 'updated_at']
    
    def get_menu_image_url(self, obj):
        if obj.menu_image_path:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(f'/media/{obj.menu_image_path}')
        return None

