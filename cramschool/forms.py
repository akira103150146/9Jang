# cramschool/forms.py

from django import forms
from .models import Student

class StudentForm(forms.ModelForm):
    # 這裡可以自定義字段或添加額外驗證
    
    class Meta:
        # 指定要使用的模型
        model = Student
        
        # 指定表單中要包含的字段
        fields = ['name', 'school', 'grade', 'contact', 'notes'] 