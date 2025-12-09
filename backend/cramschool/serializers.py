# cramschool/serializers.py

from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import (
    Student, Teacher, Course, StudentEnrollment, ExtraFee, 
    SessionRecord, Attendance, Leave, Subject, QuestionBank, Hashtag, QuestionTag,
    StudentAnswer, ErrorLog
)

class StudentSerializer(serializers.ModelSerializer):
    """
    學生資料序列化器
    """
    
    class Meta:
        model = Student
        fields = ['student_id', 'name', 'school', 'grade', 'phone', 'emergency_contact_name', 'emergency_contact_phone', 'notes']
        read_only_fields = ['student_id']


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
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        # 如果有提供密碼，則進行雜湊處理
        password = validated_data.pop('password', None)
        if password:
            validated_data['password_hash'] = make_password(password)
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # 如果有提供密碼，則進行雜湊處理
        password = validated_data.pop('password', None)
        if password:
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


class StudentEnrollmentSerializer(serializers.ModelSerializer):
    """
    學生課程報名序列化器
    """
    student_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentEnrollment
        fields = [
            'enrollment_id', 'student', 'student_name', 'course', 'course_name',
            'enroll_date', 'discount_rate'
        ]
        read_only_fields = ['enrollment_id', 'student_name', 'course_name']
    
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
            'fee_id', 'student', 'student_name', 'item', 'amount', 'fee_date', 'payment_status'
        ]
        read_only_fields = ['fee_id', 'student_name']
    
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
            'status', 'course_name', 'session_date'
        ]
        read_only_fields = ['attendance_id', 'student_name', 'session_id_display', 'course_name', 'session_date']
    
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
            'leave_date', 'reason', 'approval_status'
        ]
        read_only_fields = ['leave_id', 'student_name', 'course_name']
    
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
            'test_name', 'is_correct', 'scanned_file_path'
        ]
        read_only_fields = ['answer_id', 'student_name', 'question_chapter']
    
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
            'question_content', 'error_count', 'review_status'
        ]
        read_only_fields = [
            'error_log_id', 'student_name', 'question_chapter', 
            'question_subject', 'question_level', 'question_content'
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

