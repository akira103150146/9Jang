# cramschool/serializers.py

from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    """
    學生資料序列化器
    """
    
    class Meta:
        model = Student
        fields = ['student_id', 'name', 'school', 'grade', 'phone', 'emergency_contact_name', 'emergency_contact_phone', 'notes']
        read_only_fields = ['student_id']

