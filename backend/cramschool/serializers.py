# cramschool/serializers.py

from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Student, Teacher, Course, StudentEnrollment, ExtraFee, SessionRecord, Attendance, Leave

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

