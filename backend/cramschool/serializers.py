# cramschool/serializers.py

from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Student, Teacher

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

