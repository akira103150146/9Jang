# cramschool/serializers.py

from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    """
    學生資料序列化器
    """
    
    class Meta:
        model = Student
        fields = ['id', 'name', 'school', 'grade', 'contact', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

