# cramschool/serializers.py

from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Student, Teacher, Course, StudentEnrollment, ExtraFee

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

