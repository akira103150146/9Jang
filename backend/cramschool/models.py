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


class ExtraFee(models.Model):
    """
    學生額外收費模型
    """
    ITEM_CHOICES = [
        ('Transport', 'Transport'),
        ('Meal', 'Meal'),
        ('Book', 'Book'),
        ('Other', 'Other'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('Paid', 'Paid'),
        ('Unpaid', 'Unpaid'),
        ('Partial', 'Partial'),
    ]
    
    # 核心欄位
    fee_id = models.AutoField(primary_key=True, verbose_name='收費ID')
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='extra_fees',
        verbose_name='學生'
    )
    item = models.CharField(
        max_length=20,
        choices=ITEM_CHOICES,
        verbose_name='收費名目'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='收費金額'
    )
    fee_date = models.DateField(verbose_name='費用日期')
    payment_status = models.CharField(
        max_length=10,
        choices=PAYMENT_STATUS_CHOICES,
        default='Unpaid',
        verbose_name='繳費狀態'
    )

    class Meta:
        verbose_name = '額外收費'
        verbose_name_plural = '額外收費'
        ordering = ['-fee_date']

    def __str__(self):
        return f"{self.student.name} - {self.get_item_display()} - ${self.amount}"


class SessionRecord(models.Model):
    """
    課程上課記錄模型
    """
    # 核心欄位
    session_id = models.AutoField(primary_key=True, verbose_name='場次ID')
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='sessions',
        verbose_name='課程'
    )
    session_date = models.DateField(verbose_name='上課日期')

    class Meta:
        verbose_name = '上課記錄'
        verbose_name_plural = '上課記錄'
        ordering = ['-session_date']
        unique_together = [('course', 'session_date')]  # 確保同一課程在同一天不能重複記錄

    def __str__(self):
        return f"{self.course.course_name} - {self.session_date}"


class Attendance(models.Model):
    """
    出席記錄模型
    """
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
        ('Leave', 'Leave'),
    ]
    
    # 核心欄位
    attendance_id = models.AutoField(primary_key=True, verbose_name='出席ID')
    session = models.ForeignKey(
        SessionRecord,
        on_delete=models.CASCADE,
        related_name='attendances',
        verbose_name='課程場次'
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='attendances',
        verbose_name='學生'
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='Absent',
        verbose_name='出席狀態'
    )

    class Meta:
        verbose_name = '出席記錄'
        verbose_name_plural = '出席記錄'
        ordering = ['-session__session_date']
        unique_together = [('session', 'student')]  # 確保同一場次同一學生不能重複記錄

    def __str__(self):
        return f"{self.student.name} - {self.session.course.course_name} ({self.session.session_date}) - {self.get_status_display()}"


class Leave(models.Model):
    """
    請假記錄模型
    """
    APPROVAL_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    
    # 核心欄位
    leave_id = models.AutoField(primary_key=True, verbose_name='請假ID')
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='leaves',
        verbose_name='學生'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='leaves',
        verbose_name='課程'
    )
    leave_date = models.DateField(verbose_name='請假日期')
    reason = models.CharField(max_length=255, verbose_name='請假原因')
    approval_status = models.CharField(
        max_length=10,
        choices=APPROVAL_STATUS_CHOICES,
        default='Pending',
        verbose_name='審核狀態'
    )

    class Meta:
        verbose_name = '請假記錄'
        verbose_name_plural = '請假記錄'
        ordering = ['-leave_date']

    def __str__(self):
        return f"{self.student.name} - {self.course.course_name} ({self.leave_date}) - {self.get_approval_status_display()}"


class Subject(models.Model):
    """
    科目模型
    """
    subject_id = models.AutoField(primary_key=True, verbose_name='科目ID')
    name = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='科目名稱'
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True,
        default=None,
        verbose_name='科目代碼'
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='描述'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='建立時間'
    )

    class Meta:
        verbose_name = '科目'
        verbose_name_plural = '科目'
        ordering = ['name']

    def __str__(self):
        return self.name


class QuestionBank(models.Model):
    """
    題目庫模型
    """
    LEVEL_CHOICES = [
        ('JHS', 'Junior High School'),
        ('SHS', 'Senior High School'),
        ('VCS', 'Vocational School'),
    ]
    
    # 核心欄位
    question_id = models.AutoField(primary_key=True, verbose_name='題目ID')
    subject = models.ForeignKey(
        Subject,
        on_delete=models.PROTECT,
        related_name='questions',
        verbose_name='科目'
    )
    level = models.CharField(
        max_length=3,
        choices=LEVEL_CHOICES,
        verbose_name='適用年級'
    )
    chapter = models.CharField(max_length=100, verbose_name='章節/單元')
    content = models.TextField(verbose_name='題目內容 (Markdown + LaTeX)')
    image_path = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='題目圖片路徑'
    )
    correct_answer = models.TextField(verbose_name='正確答案')
    difficulty = models.IntegerField(
        default=1,
        verbose_name='難度等級 (1-5)'
    )

    class Meta:
        verbose_name = '題目庫'
        verbose_name_plural = '題目庫'
        ordering = ['subject', 'level', 'chapter']

    def __str__(self):
        return f"{self.subject.name if self.subject else '無科目'} - {self.chapter} (Q{self.question_id})"


class Hashtag(models.Model):
    """
    自訂標籤模型
    """
    tag_id = models.AutoField(primary_key=True, verbose_name='標籤ID')
    tag_name = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='標籤名稱'
    )
    creator = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_tags',
        verbose_name='創建者'
    )

    class Meta:
        verbose_name = '標籤'
        verbose_name_plural = '標籤'
        ordering = ['tag_name']

    def __str__(self):
        return f"#{self.tag_name}"


class QuestionTag(models.Model):
    """
    題目與標籤關聯模型
    """
    question_tag_id = models.AutoField(primary_key=True, verbose_name='關聯ID')
    question = models.ForeignKey(
        QuestionBank,
        on_delete=models.CASCADE,
        related_name='tags',
        verbose_name='題目'
    )
    tag = models.ForeignKey(
        Hashtag,
        on_delete=models.CASCADE,
        related_name='questions',
        verbose_name='標籤'
    )

    class Meta:
        verbose_name = '題目標籤關聯'
        verbose_name_plural = '題目標籤關聯'
        unique_together = [('question', 'tag')]

    def __str__(self):
        return f"{self.question} - {self.tag}"


class StudentAnswer(models.Model):
    """
    學生作答記錄模型
    """
    answer_id = models.AutoField(primary_key=True, verbose_name='作答ID')
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='answers',
        verbose_name='學生'
    )
    question = models.ForeignKey(
        QuestionBank,
        on_delete=models.CASCADE,
        related_name='student_answers',
        verbose_name='題目'
    )
    test_name = models.CharField(max_length=100, verbose_name='測驗/作業名稱')
    is_correct = models.BooleanField(default=False, verbose_name='是否答對')
    scanned_file_path = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='考卷掃描檔路徑'
    )

    class Meta:
        verbose_name = '學生作答記錄'
        verbose_name_plural = '學生作答記錄'
        ordering = ['-answer_id']

    def __str__(self):
        return f"{self.student.name} - Q{self.question.question_id} - {self.test_name}"


class ErrorLog(models.Model):
    """
    錯題本模型
    """
    REVIEW_STATUS_CHOICES = [
        ('New', 'New'),
        ('Reviewing', 'Reviewing'),
        ('Mastered', 'Mastered'),
    ]
    
    error_log_id = models.AutoField(primary_key=True, verbose_name='錯誤記錄ID')
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='error_logs',
        verbose_name='學生'
    )
    question = models.ForeignKey(
        QuestionBank,
        on_delete=models.CASCADE,
        related_name='error_logs',
        verbose_name='錯題'
    )
    error_count = models.IntegerField(default=1, verbose_name='錯誤次數')
    review_status = models.CharField(
        max_length=10,
        choices=REVIEW_STATUS_CHOICES,
        default='New',
        verbose_name='掌握狀態'
    )

    class Meta:
        verbose_name = '錯題本'
        verbose_name_plural = '錯題本'
        ordering = ['-error_count']
        unique_together = [('student', 'question')]  # 確保同一學生同一題目只有一筆記錄

    def __str__(self):
        return f"{self.student.name} - Q{self.question.question_id} - 錯誤{self.error_count}次"
