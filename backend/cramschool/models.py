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


class Course(models.Model):
    """
    補習班課程資料模型
    """
    DAY_CHOICES = [
        ('Mon', 'Monday'),
        ('Tue', 'Tuesday'),
        ('Wed', 'Wednesday'),
        ('Thu', 'Thursday'),
        ('Fri', 'Friday'),
        ('Sat', 'Saturday'),
        ('Sun', 'Sunday'),
    ]
    
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Pending', 'Pending'),
        ('Closed', 'Closed'),
    ]
    
    # 核心欄位
    course_id = models.AutoField(primary_key=True, verbose_name='課程ID')
    course_name = models.CharField(max_length=100, verbose_name='課程名稱')
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        related_name='courses',
        verbose_name='授課老師'
    )
    start_time = models.TimeField(verbose_name='開始時間')
    end_time = models.TimeField(verbose_name='結束時間')
    day_of_week = models.CharField(
        max_length=3,
        choices=DAY_CHOICES,
        verbose_name='上課日'
    )
    fee_per_session = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='每堂課收費'
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='Active',
        verbose_name='課程狀態'
    )

    class Meta:
        verbose_name = '課程'
        verbose_name_plural = '課程'
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
        return f"{self.course_name} ({self.get_day_of_week_display()})"


class StudentEnrollment(models.Model):
    """
    學生課程報名模型
    """
    # 核心欄位
    enrollment_id = models.AutoField(primary_key=True, verbose_name='報名ID')
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name='學生'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name='課程'
    )
    enroll_date = models.DateField(verbose_name='報名日期')
    discount_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.0,
        verbose_name='折扣百分比'
    )

    class Meta:
        verbose_name = '學生報名'
        verbose_name_plural = '學生報名'
        ordering = ['-enroll_date']
        unique_together = [('student', 'course')]  # 確保一個學生不能重複報名同一課程

    def __str__(self):
        return f"{self.student.name} - {self.course.course_name}"
