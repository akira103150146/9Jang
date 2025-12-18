# cramschool/serializers.py

from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import (
    Student, Teacher, Course, StudentEnrollment, EnrollmentPeriod, ExtraFee, 
    SessionRecord, Attendance, Leave, Subject, QuestionBank, Hashtag, QuestionTag,
    StudentAnswer, ErrorLog, Restaurant, GroupOrder, Order, OrderItem,
    StudentGroup, Quiz, Exam, CourseMaterial, AssessmentSubmission,
    ContentTemplate, LearningResource, StudentMistakeNote, StudentMistakeNoteImage, ErrorLogImage
)

class StudentMistakeNoteImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = StudentMistakeNoteImage
        fields = ['image_id', 'note', 'image_path', 'image_url', 'caption', 'sort_order', 'created_at']
        read_only_fields = ['image_id', 'note', 'image_path', 'image_url', 'created_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if not obj.image_path:
            return None
        # 兼容：image_path 可能已是完整 URL
        if obj.image_path.startswith('http'):
            return obj.image_path
        if request:
            return request.build_absolute_uri(f'/media/{obj.image_path}')
        return f'/media/{obj.image_path}'


class ErrorLogImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ErrorLogImage
        fields = ['image_id', 'error_log', 'image_path', 'image_url', 'caption', 'sort_order', 'created_at']
        read_only_fields = ['image_id', 'error_log', 'image_path', 'image_url', 'created_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if not obj.image_path:
            return None
        if obj.image_path.startswith('http'):
            return obj.image_path
        if request:
            return request.build_absolute_uri(f'/media/{obj.image_path}')
        return f'/media/{obj.image_path}'

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
        """計算學生總費用（使用 annotate 預先計算的值）"""
        # 老師角色不應看到金錢資訊
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.is_teacher() and not request.user.is_admin():
            return None
        
        # 如果 queryset 已經使用 annotate 計算，直接使用該值
        if hasattr(obj, '_total_fees'):
            return float(obj._total_fees or 0)
        # 後備方案：如果沒有 annotate，則執行查詢
        from django.db.models import Sum
        result = obj.extra_fees.filter(is_deleted=False).aggregate(total=Sum('amount'))
        return float(result['total'] or 0)
    
    def get_unpaid_fees(self, obj):
        """計算學生未繳費用（使用 annotate 預先計算的值）"""
        # 老師角色不應看到金錢資訊
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.is_teacher() and not request.user.is_admin():
            return None
        
        # 如果 queryset 已經使用 annotate 計算，直接使用該值
        if hasattr(obj, '_unpaid_fees'):
            return float(obj._unpaid_fees or 0)
        # 後備方案：如果沒有 annotate，則執行查詢
        from django.db.models import Sum, Q
        result = obj.extra_fees.filter(
            payment_status='Unpaid',
            is_deleted=False
        ).aggregate(total=Sum('amount'))
        return float(result['total'] or 0)
    
    def get_enrollments_count(self, obj):
        """獲取學生報名的課程數量（使用 annotate 預先計算的值）"""
        # 如果 queryset 已經使用 annotate 計算，直接使用該值
        if hasattr(obj, '_enrollments_count'):
            return obj._enrollments_count or 0
        # 後備方案：如果沒有 annotate，則執行查詢
        return obj.enrollments.filter(is_deleted=False).count()


class TeacherSerializer(serializers.ModelSerializer):
    """
    老師資料序列化器
    """
    username = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    user_email = serializers.SerializerMethodField()
    
    class Meta:
        model = Teacher
        fields = ['teacher_id', 'name', 'username', 'password', 'permission_level', 'phone', 'hire_date', 'user', 'user_email']
        read_only_fields = ['teacher_id', 'user', 'username', 'user_email']
        extra_kwargs = {
            'password': {'write_only': True},
            'name': {'required': True},
        }
    
    def get_username(self, obj):
        """獲取用戶名（從關聯的 user 獲取）"""
        return obj.user.username if obj.user else None
    
    def get_user_email(self, obj):
        """獲取用戶郵箱"""
        if obj.user:
            return obj.user.email
        return None
    
    def validate(self, data):
        """驗證數據"""
        # 在創建時，如果提供了 username，驗證唯一性
        if not self.instance and 'username' in self.initial_data:
            username = self.initial_data.get('username', '').strip()
            if not username:
                raise serializers.ValidationError({'username': '帳號不能為空'})
            
            # 檢查 CustomUser 中是否已存在該帳號
            from django.contrib.auth import get_user_model
            CustomUser = get_user_model()
            if CustomUser.objects.filter(username=username).exists():
                raise serializers.ValidationError({'username': '此帳號已被使用，請選擇其他帳號'})
        
        return data
    
    def validate_name(self, value):
        """驗證姓名"""
        if not value or not value.strip():
            raise serializers.ValidationError('姓名不能為空')
        return value.strip()
    
    def create(self, validated_data):
        """創建老師時自動創建 CustomUser"""
        from django.contrib.auth import get_user_model
        from account.models import UserRole
        CustomUser = get_user_model()
        
        # 獲取創建時的數據
        password = self.initial_data.get('password', '').strip()
        username = self.initial_data.get('username', '').strip()
        permission_level = validated_data.get('permission_level', 'Teacher')
        name = validated_data.get('name')
        
        if not username:
            raise serializers.ValidationError({'username': '帳號不能為空'})
        # 如果沒有提供密碼，使用 username 作為預設密碼
        if not password:
            password = username
        
        # 根據 permission_level 決定 role
        if permission_level == 'Admin':
            user_role = UserRole.ADMIN
        elif permission_level == 'Accountant':
            user_role = UserRole.ACCOUNTANT
        else:
            user_role = UserRole.TEACHER
        
        # 生成 email
        email = f"{username}@teacher.local"
        counter = 1
        while CustomUser.objects.filter(email=email).exists():
            email = f"{username}_{counter}@teacher.local"
            counter += 1
        
        # 創建 CustomUser
        try:
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=password,
                role=user_role,
                first_name=name,
                is_active=True,
                must_change_password=False
            )
        except Exception as e:
            raise serializers.ValidationError({'username': f'創建用戶帳號失敗: {str(e)}'})
        
        # 創建 Teacher 並關聯 CustomUser
        validated_data['user'] = user
        # 移除 password 欄位，因為 Teacher 模型沒有此欄位（密碼存儲在關聯的 CustomUser 中）
        validated_data.pop('password', None)
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """更新老師時同步更新 CustomUser"""
        from django.contrib.auth import get_user_model
        from account.models import UserRole
        CustomUser = get_user_model()
        
        # 獲取更新數據
        password = self.initial_data.get('password', '').strip()
        username = self.initial_data.get('username', '').strip()
        permission_level = validated_data.get('permission_level', instance.permission_level)
        name = validated_data.get('name', instance.name)
        
        # 根據 permission_level 決定 role
        if permission_level == 'Admin':
            user_role = UserRole.ADMIN
        elif permission_level == 'Accountant':
            user_role = UserRole.ACCOUNTANT
        else:
            user_role = UserRole.TEACHER
        
        # 處理用戶帳號
        if instance.user:
            # 如果已有用戶，更新用戶資訊
            user = instance.user
            if username and username != user.username:
                # 檢查新 username 是否已被使用
                if CustomUser.objects.filter(username=username).exclude(id=user.id).exists():
                    raise serializers.ValidationError({'username': '此帳號已被使用'})
                user.username = username
            user.role = user_role
            user.first_name = name
            if password:
                user.set_password(password)
            user.save()
        else:
            # 如果沒有用戶，創建新的用戶
            if not username:
                raise serializers.ValidationError({'username': '帳號不能為空'})
            # 如果沒有提供密碼，使用 username 作為預設密碼
            if not password:
                password = username
            
            email = f"{username}@teacher.local"
            counter = 1
            while CustomUser.objects.filter(email=email).exists():
                email = f"{username}_{counter}@teacher.local"
                counter += 1
            
            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                password=password,
                role=user_role,
                first_name=name,
                is_active=True,
                must_change_password=False
            )
            validated_data['user'] = user
        
        # 移除 password 欄位，因為 Teacher 模型沒有此欄位（密碼存儲在關聯的 CustomUser 中）
        validated_data.pop('password', None)
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
        extra_kwargs = {
            'teacher': {'required': True}  # 明確標記為必填
        }
    
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
    created_by_name = serializers.SerializerMethodField()
    source_display = serializers.SerializerMethodField()
    imported_student_name = serializers.SerializerMethodField()
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
            'image_path', 'correct_answer', 'solution_content', 'difficulty',
            'question_type', 'options', 'metadata',
            'tags', 'tag_ids', 'tag_ids_input',
            'source', 'source_display', 'created_by', 'created_by_name',
            'imported_from_error_log', 'imported_student', 'imported_student_name',
            'question_number', 'origin', 'origin_detail',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'question_id', 'tags', 'tag_ids', 'subject_name', 'source_display',
            'created_by_name', 'created_at', 'updated_at'
        ]
    
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
    
    def get_created_by_name(self, obj):
        """
        獲取建立者名稱
        """
        return obj.created_by.username if obj.created_by else None
    
    def get_source_display(self, obj):
        """
        獲取來源顯示名稱
        """
        return obj.get_source_display() if obj.source else None

    def get_imported_student_name(self, obj):
        if getattr(obj, 'imported_student', None):
            return obj.imported_student.name
        return None
    
    def create(self, validated_data):
        """
        創建題目並關聯標籤
        """
        tag_ids = validated_data.pop('tag_ids_input', [])
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
            # 如果沒有指定來源，預設為老師新增
            if 'source' not in validated_data:
                validated_data['source'] = 'teacher_created'
        
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


class AssessmentSubmissionSerializer(serializers.ModelSerializer):
    """
    測驗提交記錄序列化器
    """
    student_name = serializers.SerializerMethodField()
    quiz_title = serializers.SerializerMethodField()
    exam_title = serializers.SerializerMethodField()
    
    class Meta:
        model = AssessmentSubmission
        fields = [
            'submission_id', 'student', 'student_name', 'quiz', 'quiz_title',
            'exam', 'exam_title', 'score', 'status', 'submitted_at'
        ]
        read_only_fields = ['submission_id', 'student_name', 'quiz_title', 'exam_title', 'submitted_at']
    
    def get_student_name(self, obj):
        return obj.student.name if obj.student else None
    
    def get_quiz_title(self, obj):
        return obj.quiz.title if obj.quiz else None
    
    def get_exam_title(self, obj):
        return obj.exam.title if obj.exam else None


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
            # 先查找未刪除的記錄
            error_log = ErrorLog.objects.filter(
                student=answer.student,
                question=answer.question,
                is_deleted=False
            ).first()
            
            if error_log:
                # 如果錯題記錄已存在且未刪除，增加錯誤次數
                error_log.error_count += 1
                # 如果狀態是已掌握，改回複習中
                if error_log.review_status == 'Mastered':
                    error_log.review_status = 'Reviewing'
                error_log.save()
            else:
                # 檢查是否有已刪除的記錄
                deleted_log = ErrorLog.objects.filter(
                    student=answer.student,
                    question=answer.question,
                    is_deleted=True
                ).first()
                
                if deleted_log:
                    # 恢復已刪除的記錄
                    deleted_log.restore()
                    deleted_log.error_count += 1
                    if deleted_log.review_status == 'Mastered':
                        deleted_log.review_status = 'Reviewing'
                    deleted_log.save()
                else:
                    # 創建新記錄
                    ErrorLog.objects.create(
                        student=answer.student,
                        question=answer.question,
                        error_count=1,
                        review_status='New'
                    )
        
        return answer
    
    def update(self, instance, validated_data):
        """
        更新作答記錄，如果改為答錯則更新錯題記錄
        """
        old_is_correct = instance.is_correct
        answer = super().update(instance, validated_data)
        
        # 如果從答對改為答錯，需要創建或更新錯題記錄
        if old_is_correct and not answer.is_correct:
            # 先查找未刪除的記錄
            error_log = ErrorLog.objects.filter(
                student=answer.student,
                question=answer.question,
                is_deleted=False
            ).first()
            
            if error_log:
                # 如果錯題記錄已存在且未刪除，增加錯誤次數
                error_log.error_count += 1
                if error_log.review_status == 'Mastered':
                    error_log.review_status = 'Reviewing'
                error_log.save()
            else:
                # 檢查是否有已刪除的記錄
                deleted_log = ErrorLog.objects.filter(
                    student=answer.student,
                    question=answer.question,
                    is_deleted=True
                ).first()
                
                if deleted_log:
                    # 恢復已刪除的記錄
                    deleted_log.restore()
                    deleted_log.error_count += 1
                    if deleted_log.review_status == 'Mastered':
                        deleted_log.review_status = 'Reviewing'
                    deleted_log.save()
                else:
                    # 創建新記錄
                    ErrorLog.objects.create(
                        student=answer.student,
                        question=answer.question,
                        error_count=1,
                        review_status='New'
                    )
        
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
    images = ErrorLogImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ErrorLog
        fields = [
            'error_log_id', 'student', 'student_name', 'question', 
            'question_chapter', 'question_subject', 'question_level',
            'question_content', 'error_count', 'review_status',
            'images',
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


class StudentMistakeNoteSerializer(serializers.ModelSerializer):
    """
    學生錯題筆記序列化器（筆記式）
    """
    student_name = serializers.SerializerMethodField()
    images = StudentMistakeNoteImageSerializer(many=True, read_only=True)

    class Meta:
        model = StudentMistakeNote
        fields = [
            'note_id', 'student', 'student_name',
            'title', 'subject', 'content',
            'images',
            'created_at', 'updated_at',
            'is_deleted', 'deleted_at',
        ]
        read_only_fields = [
            'note_id', 'student', 'student_name', 'created_at', 'updated_at',
            'is_deleted', 'deleted_at',
        ]

    def get_student_name(self, obj):
        return obj.student.name if obj.student else None


class OrderItemSerializer(serializers.ModelSerializer):
    """
    訂單項目序列化器
    """
    class Meta:
        model = OrderItem
        fields = ['order_item_id', 'order', 'item_name', 'quantity', 'unit_price', 'subtotal']
        read_only_fields = ['order_item_id', 'subtotal']


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
        """獲取訂單數量（使用 annotate 預先計算的值）"""
        # 如果 queryset 已經使用 annotate 計算，直接使用該值
        if hasattr(obj, '_orders_count'):
            return obj._orders_count or 0
        # 後備方案：如果沒有 annotate，則執行查詢
        return obj.orders.filter(status__in=['Pending', 'Confirmed'], is_deleted=False).count()
    
    def get_total_amount(self, obj):
        """獲取總金額（使用 annotate 預先計算的值）"""
        # 如果 queryset 已經使用 annotate 計算，直接使用該值
        if hasattr(obj, '_total_amount'):
            return float(obj._total_amount or 0)
        # 後備方案：如果沒有 annotate，則執行查詢
        from django.db.models import Sum
        total = obj.orders.filter(status__in=['Pending', 'Confirmed'], is_deleted=False).aggregate(
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


class StudentGroupSerializer(serializers.ModelSerializer):
    """
    學生群組序列化器
    """
    students_count = serializers.SerializerMethodField()
    student_names = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    student_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text='學生ID列表（寫入用）'
    )
    
    class Meta:
        model = StudentGroup
        fields = [
            'group_id', 'name', 'description', 'students', 'student_ids',
            'students_count', 'student_names', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['group_id', 'students', 'students_count', 'student_names', 'created_by_name', 'created_at', 'updated_at']
    
    def get_students_count(self, obj):
        # 使用 prefetch_related 後，直接使用 len() 避免額外查詢
        if hasattr(obj, '_prefetched_objects_cache') and 'students' in obj._prefetched_objects_cache:
            return len(obj.students.all())
        return obj.students.count()
    
    def get_student_names(self, obj):
        return [s.name for s in obj.students.all()]
    
    def get_created_by_name(self, obj):
        return obj.created_by.username if obj.created_by else None
    
    def create(self, validated_data):
        student_ids = validated_data.pop('student_ids', [])
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        
        group = StudentGroup.objects.create(**validated_data)
        
        # 關聯學生
        if student_ids:
            students = Student.objects.filter(student_id__in=student_ids)
            group.students.set(students)
        
        return group
    
    def update(self, instance, validated_data):
        student_ids = validated_data.pop('student_ids', None)
        
        # 更新基本資訊
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # 如果提供了 student_ids，則更新學生關聯
        if student_ids is not None:
            students = Student.objects.filter(student_id__in=student_ids)
            instance.students.set(students)
        
        return instance


class QuizSerializer(serializers.ModelSerializer):
    """
    Quiz 序列化器
    """
    course_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    questions_count = serializers.SerializerMethodField()
    question_details = serializers.SerializerMethodField()
    student_groups_count = serializers.SerializerMethodField()
    student_group_names = serializers.SerializerMethodField()
    question_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text='題目ID列表（寫入用）'
    )
    student_group_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text='學生群組ID列表（寫入用）'
    )
    
    class Meta:
        model = Quiz
        fields = [
            'quiz_id', 'title', 'course', 'course_name', 'questions', 'question_ids',
            'questions_count', 'question_details', 'student_groups', 'student_group_ids',
            'student_groups_count', 'student_group_names', 'is_individualized',
            'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'quiz_id', 'course_name', 'questions_count', 'question_details', 
            'student_groups_count', 'student_group_names', 'created_by_name', 
            'created_at', 'updated_at', 'questions'
        ]
    
    def get_course_name(self, obj):
        return obj.course.course_name if obj.course else None
    
    def get_created_by_name(self, obj):
        return obj.created_by.username if obj.created_by else None
    
    def get_questions_count(self, obj):
        # 使用 prefetch_related 後，直接使用 len() 避免額外查詢
        if hasattr(obj, '_prefetched_objects_cache') and 'questions' in obj._prefetched_objects_cache:
            return len(obj.questions.all())
        return obj.questions.count()
    
    def get_question_details(self, obj):
        return [
            {
                'question_id': q.question_id,
                'chapter': q.chapter,
                'subject_name': q.subject.name if q.subject else None,
                'difficulty': q.difficulty
            }
            for q in obj.questions.all()
        ]
    
    def get_student_groups_count(self, obj):
        # 使用 prefetch_related 後，直接使用 len() 避免額外查詢
        if hasattr(obj, '_prefetched_objects_cache') and 'student_groups' in obj._prefetched_objects_cache:
            return len(obj.student_groups.all())
        return obj.student_groups.count()
    
    def get_student_group_names(self, obj):
        return [g.name for g in obj.student_groups.all()]
    
    def create(self, validated_data):
        question_ids = validated_data.pop('question_ids', [])
        student_group_ids = validated_data.pop('student_group_ids', [])
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        
        quiz = Quiz.objects.create(**validated_data)
        
        # 關聯題目
        if question_ids:
            questions = QuestionBank.objects.filter(question_id__in=question_ids)
            quiz.questions.set(questions)
            
        # 關聯學生群組
        if student_group_ids:
            groups = StudentGroup.objects.filter(group_id__in=student_group_ids)
            quiz.student_groups.set(groups)
        
        return quiz
    
    def update(self, instance, validated_data):
        question_ids = validated_data.pop('question_ids', None)
        student_group_ids = validated_data.pop('student_group_ids', None)
        
        # 更新基本資訊
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # 如果提供了 question_ids，則更新題目關聯
        if question_ids is not None:
            questions = QuestionBank.objects.filter(question_id__in=question_ids)
            instance.questions.set(questions)
            
        # 如果提供了 student_group_ids，則更新學生群組關聯
        if student_group_ids is not None:
            groups = StudentGroup.objects.filter(group_id__in=student_group_ids)
            instance.student_groups.set(groups)
        
        return instance


class QuizDetailSerializer(QuizSerializer):
    """
    Quiz 詳細序列化器 (包含完整題目內容)
    """
    questions = QuestionBankSerializer(many=True, read_only=True)



class ExamSerializer(serializers.ModelSerializer):
    """
    考卷序列化器
    """
    course_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    questions_count = serializers.SerializerMethodField()
    question_details = serializers.SerializerMethodField()
    student_groups_count = serializers.SerializerMethodField()
    student_group_names = serializers.SerializerMethodField()
    question_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text='題目ID列表（寫入用）'
    )
    student_group_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text='學生群組ID列表（寫入用）'
    )
    
    class Meta:
        model = Exam
        fields = [
            'exam_id', 'title', 'course', 'course_name', 'questions', 'question_ids',
            'questions_count', 'question_details', 'student_groups', 'student_group_ids',
            'student_groups_count', 'student_group_names', 'is_individualized',
            'created_by', 'created_by_name', 'available_from', 'available_until',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'exam_id', 'course_name', 'questions_count', 'question_details',
            'student_groups_count', 'student_group_names', 'created_by_name',
            'created_at', 'updated_at', 'questions'
        ]
    
    def get_course_name(self, obj):
        return obj.course.course_name if obj.course else None
    
    def get_created_by_name(self, obj):
        return obj.created_by.username if obj.created_by else None
    
    def get_questions_count(self, obj):
        # 使用 prefetch_related 後，直接使用 len() 避免額外查詢
        if hasattr(obj, '_prefetched_objects_cache') and 'questions' in obj._prefetched_objects_cache:
            return len(obj.questions.all())
        return obj.questions.count()
    
    def get_question_details(self, obj):
        return [
            {
                'question_id': q.question_id,
                'chapter': q.chapter,
                'subject_name': q.subject.name if q.subject else None,
                'difficulty': q.difficulty
            }
            for q in obj.questions.all()
        ]
    
    def get_student_groups_count(self, obj):
        # 使用 prefetch_related 後，直接使用 len() 避免額外查詢
        if hasattr(obj, '_prefetched_objects_cache') and 'student_groups' in obj._prefetched_objects_cache:
            return len(obj.student_groups.all())
        return obj.student_groups.count()
    
    def get_student_group_names(self, obj):
        return [g.name for g in obj.student_groups.all()]
    
    def create(self, validated_data):
        question_ids = validated_data.pop('question_ids', [])
        student_group_ids = validated_data.pop('student_group_ids', [])
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        
        exam = Exam.objects.create(**validated_data)
        
        # 關聯題目
        if question_ids:
            questions = QuestionBank.objects.filter(question_id__in=question_ids)
            exam.questions.set(questions)
        
        # 關聯學生群組
        if student_group_ids:
            groups = StudentGroup.objects.filter(group_id__in=student_group_ids)
            exam.student_groups.set(groups)
        
        return exam
    
    def update(self, instance, validated_data):
        question_ids = validated_data.pop('question_ids', None)
        student_group_ids = validated_data.pop('student_group_ids', None)
        
        # 更新基本資訊
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # 如果提供了 question_ids，則更新題目關聯
        if question_ids is not None:
            questions = QuestionBank.objects.filter(question_id__in=question_ids)
            instance.questions.set(questions)
        
        # 如果提供了 student_group_ids，則更新學生群組關聯
        if student_group_ids is not None:
            groups = StudentGroup.objects.filter(group_id__in=student_group_ids)
            instance.student_groups.set(groups)
        
        return instance


class ExamDetailSerializer(ExamSerializer):
    """
    Exam 詳細序列化器 (包含完整題目內容)
    """
    questions = QuestionBankSerializer(many=True, read_only=True)


class CourseMaterialSerializer(serializers.ModelSerializer):
    """
    上課講義序列化器
    """
    course_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    questions_count = serializers.SerializerMethodField()
    question_details = serializers.SerializerMethodField()
    student_groups_count = serializers.SerializerMethodField()
    student_group_names = serializers.SerializerMethodField()
    question_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text='題目ID列表（寫入用）'
    )
    student_group_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text='學生群組ID列表（寫入用）'
    )
    
    class Meta:
        model = CourseMaterial
        fields = [
            'material_id', 'title', 'course', 'course_name', 'content',
            'questions', 'question_ids', 'questions_count', 'question_details',
            'student_groups', 'student_group_ids', 'student_groups_count', 'student_group_names', 'is_individualized',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'material_id', 'course_name', 'questions_count', 'question_details',
            'student_groups_count', 'student_group_names', 'created_by_name', 
            'created_at', 'updated_at'
        ]
    
    def get_course_name(self, obj):
        return obj.course.course_name if obj.course else None
    
    def get_created_by_name(self, obj):
        return obj.created_by.username if obj.created_by else None
    
    def get_questions_count(self, obj):
        # 使用 prefetch_related 後，直接使用 len() 避免額外查詢
        if hasattr(obj, '_prefetched_objects_cache') and 'questions' in obj._prefetched_objects_cache:
            return len(obj.questions.all())
        return obj.questions.count()
    
    def get_question_details(self, obj):
        return [
            {
                'question_id': q.question_id,
                'chapter': q.chapter,
                'subject_name': q.subject.name if q.subject else None,
                'difficulty': q.difficulty
            }
            for q in obj.questions.all()
        ]
    
    def get_student_groups_count(self, obj):
        # 使用 prefetch_related 後，直接使用 len() 避免額外查詢
        if hasattr(obj, '_prefetched_objects_cache') and 'student_groups' in obj._prefetched_objects_cache:
            return len(obj.student_groups.all())
        return obj.student_groups.count()
    
    def get_student_group_names(self, obj):
        return [g.name for g in obj.student_groups.all()]
    
    def create(self, validated_data):
        question_ids = validated_data.pop('question_ids', [])
        student_group_ids = validated_data.pop('student_group_ids', [])
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        
        material = CourseMaterial.objects.create(**validated_data)
        
        # 關聯題目
        if question_ids:
            questions = QuestionBank.objects.filter(question_id__in=question_ids)
            material.questions.set(questions)
            
        # 關聯學生群組
        if student_group_ids:
            groups = StudentGroup.objects.filter(group_id__in=student_group_ids)
            material.student_groups.set(groups)
        
        return material
    
    def update(self, instance, validated_data):
        question_ids = validated_data.pop('question_ids', None)
        student_group_ids = validated_data.pop('student_group_ids', None)
        
        # 更新基本資訊
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # 如果提供了 question_ids，則更新題目關聯
        if question_ids is not None:
            questions = QuestionBank.objects.filter(question_id__in=question_ids)
            instance.questions.set(questions)
            
        # 如果提供了 student_group_ids，則更新學生群組關聯
        if student_group_ids is not None:
            groups = StudentGroup.objects.filter(group_id__in=student_group_ids)
            instance.student_groups.set(groups)
        
        return instance


class ContentTemplateSerializer(serializers.ModelSerializer):
    """
    內容模板序列化器
    """
    created_by_name = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    tag_ids = serializers.SerializerMethodField()
    tag_ids_input = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text='標籤ID列表（寫入用）'
    )

    class Meta:
        model = ContentTemplate
        fields = [
            'template_id', 'title', 'structure', 'created_by', 'created_by_name',
            'is_public', 'tags', 'tag_ids', 'tag_ids_input',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['template_id', 'created_by', 'created_by_name', 'tags', 'tag_ids', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        return obj.created_by.username if obj.created_by else None

    def get_tags(self, obj):
        return [tag.tag_name for tag in obj.tags.all()]

    def get_tag_ids(self, obj):
        return [tag.tag_id for tag in obj.tags.all()]

    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids_input', [])
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        
        template = ContentTemplate.objects.create(**validated_data)
        
        if tag_ids:
            tags = Hashtag.objects.filter(tag_id__in=tag_ids)
            template.tags.set(tags)
            
        return template

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop('tag_ids_input', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if tag_ids is not None:
            tags = Hashtag.objects.filter(tag_id__in=tag_ids)
            instance.tags.set(tags)
            
        return instance


class LearningResourceSerializer(serializers.ModelSerializer):
    """
    教學資源序列化器
    """
    course_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    tag_ids = serializers.SerializerMethodField()
    student_group_names = serializers.SerializerMethodField()
    tag_ids_input = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    student_group_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = LearningResource
        fields = [
            'resource_id', 'title', 'mode', 'course', 'course_name',
            'student_groups', 'student_group_ids', 'student_group_names',
            'structure', 'settings', 'tags', 'tag_ids', 'tag_ids_input',
            'created_by', 'created_by_name', 'is_individualized',
            'available_from', 'available_until', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'resource_id', 'course_name', 'student_groups', 'student_group_names',
            'tags', 'tag_ids', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]

    def get_course_name(self, obj):
        return obj.course.course_name if obj.course else None

    def get_created_by_name(self, obj):
        return obj.created_by.username if obj.created_by else None

    def get_tags(self, obj):
        return [tag.tag_name for tag in obj.tags.all()]

    def get_tag_ids(self, obj):
        return [tag.tag_id for tag in obj.tags.all()]

    def get_student_group_names(self, obj):
        return [g.name for g in obj.student_groups.all()]

    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids_input', [])
        student_group_ids = validated_data.pop('student_group_ids', [])
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        
        resource = LearningResource.objects.create(**validated_data)
        
        if tag_ids:
            tags = Hashtag.objects.filter(tag_id__in=tag_ids)
            resource.tags.set(tags)
            
        if student_group_ids:
            groups = StudentGroup.objects.filter(group_id__in=student_group_ids)
            resource.student_groups.set(groups)
            
        return resource

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop('tag_ids_input', None)
        student_group_ids = validated_data.pop('student_group_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if tag_ids is not None:
            tags = Hashtag.objects.filter(tag_id__in=tag_ids)
            instance.tags.set(tags)
            
        if student_group_ids is not None:
            groups = StudentGroup.objects.filter(group_id__in=student_group_ids)
            instance.student_groups.set(groups)
            
        return instance
