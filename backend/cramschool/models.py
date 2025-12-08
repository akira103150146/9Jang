from django.db import models
# cramschool/models.py

class Student(models.Model):
    """
    補習班學生資料模型
    """
    # 核心欄位
    student_id = models.AutoField(primary_key=True, verbose_name='學生ID')
    name = models.CharField(max_length=100, verbose_name='姓名')
    school = models.CharField(max_length=100, verbose_name='學校')
    grade = models.CharField(max_length=20, verbose_name='年級')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='聯絡電話')
    
    # 緊急聯絡人欄位
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True, verbose_name='緊急聯絡人姓名')
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='緊急聯絡人電話')
    
    # 備註欄位 (可為空)
    notes = models.TextField(blank=True, null=True, verbose_name='備註')

    class Meta:
        verbose_name = '學生資料'
        verbose_name_plural = '學生資料'
        ordering = ['name'] # 依姓名排序

    def __str__(self):
        return f"{self.name} ({self.school} - {self.grade})"


class Teacher(models.Model):
    """
    補習班老師資料模型
    """
    PERMISSION_CHOICES = [
        ('Teacher', 'Teacher'),
        ('Admin', 'Admin'),
    ]
    
    # 核心欄位
    teacher_id = models.AutoField(primary_key=True, verbose_name='老師ID')
    name = models.CharField(max_length=100, verbose_name='姓名')
    username = models.CharField(max_length=50, unique=True, verbose_name='帳號')
    password_hash = models.CharField(max_length=255, verbose_name='密碼雜湊')
    permission_level = models.CharField(
        max_length=10,
        choices=PERMISSION_CHOICES,
        default='Teacher',
        verbose_name='權限等級'
    )
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='聯絡電話')
    hire_date = models.DateField(blank=True, null=True, verbose_name='入職日期')

    class Meta:
        verbose_name = '老師資料'
        verbose_name_plural = '老師資料'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.username})"
