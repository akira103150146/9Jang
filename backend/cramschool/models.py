from django.db import models
from django.contrib.auth import get_user_model
# cramschool/models.py

CustomUser = get_user_model()

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
    
    # 用戶帳號關聯（一對一關係）
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='student_profile',
        verbose_name='用戶帳號'
    )
    
    # 初始密碼（用於管理員查看，可選）
    initial_password = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name='初始密碼',
        help_text='學生帳號的初始密碼，僅供管理員查看'
    )
    
    # 緊急聯絡人欄位
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True, verbose_name='緊急聯絡人姓名')
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='緊急聯絡人電話')
    
    # 備註欄位 (可為空)
    notes = models.TextField(blank=True, null=True, verbose_name='備註')
    
    # Soft delete 欄位
    is_deleted = models.BooleanField(default=False, verbose_name='是否已刪除')
    deleted_at = models.DateTimeField(blank=True, null=True, verbose_name='刪除時間')

    class Meta:
        verbose_name = '學生資料'
        verbose_name_plural = '學生資料'
        ordering = ['name'] # 依姓名排序

    def __str__(self):
        return f"{self.name} ({self.school} - {self.grade})"
    
    def soft_delete(self):
        """軟刪除學生及其所有相關聯的資料"""
        from django.utils import timezone
        delete_time = timezone.now()
        
        # 軟刪除學生本身
        self.is_deleted = True
        self.deleted_at = delete_time
        self.save()
        
        # 軟刪除所有相關聯的資料
        # 1. 學生報名記錄
        self.enrollments.filter(is_deleted=False).update(is_deleted=True, deleted_at=delete_time)
        
        # 2. 出席記錄
        self.attendances.filter(is_deleted=False).update(is_deleted=True, deleted_at=delete_time)
        
        # 3. 請假記錄
        self.leaves.filter(is_deleted=False).update(is_deleted=True, deleted_at=delete_time)
        
        # 4. 額外收費記錄
        self.extra_fees.filter(is_deleted=False).update(is_deleted=True, deleted_at=delete_time)
        
        # 5. 學生作答記錄
        self.answers.filter(is_deleted=False).update(is_deleted=True, deleted_at=delete_time)
        
        # 6. 錯題本記錄
        self.error_logs.filter(is_deleted=False).update(is_deleted=True, deleted_at=delete_time)
        
        # 7. 訂單記錄
        self.orders.filter(is_deleted=False).update(is_deleted=True, deleted_at=delete_time)
    
    def restore(self):
        """恢復學生及其所有相關聯的資料"""
        # 恢復學生本身
        self.is_deleted = False
        self.deleted_at = None
        self.save()
        
        # 恢復所有相關聯的資料
        # 1. 學生報名記錄
        self.enrollments.filter(is_deleted=True).update(is_deleted=False, deleted_at=None)
        
        # 2. 出席記錄
        self.attendances.filter(is_deleted=True).update(is_deleted=False, deleted_at=None)
        
        # 3. 請假記錄
        self.leaves.filter(is_deleted=True).update(is_deleted=False, deleted_at=None)
        
        # 4. 額外收費記錄
        self.extra_fees.filter(is_deleted=True).update(is_deleted=False, deleted_at=None)
        
        # 5. 學生作答記錄
        self.answers.filter(is_deleted=True).update(is_deleted=False, deleted_at=None)
        
        # 6. 錯題本記錄
        self.error_logs.filter(is_deleted=True).update(is_deleted=False, deleted_at=None)
        
        # 7. 訂單記錄
        self.orders.filter(is_deleted=True).update(is_deleted=False, deleted_at=None)


class Teacher(models.Model):
    """
    補習班老師資料模型
    """
    PERMISSION_CHOICES = [
        ('Teacher', 'Teacher'),
        ('Admin', 'Admin'),
        ('Accountant', 'Accountant'),
    ]
    
    # 核心欄位
    teacher_id = models.AutoField(primary_key=True, verbose_name='老師ID')
    name = models.CharField(max_length=100, verbose_name='姓名')
    
    # 用戶帳號關聯（一對一關係）
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='teacher_profile',
        verbose_name='用戶帳號'
    )
    
    # 保留 permission_level 用於業務邏輯（但實際權限應該從 user.role 獲取）
    permission_level = models.CharField(
        max_length=10,
        choices=PERMISSION_CHOICES,
        default='Teacher',
        verbose_name='權限等級',
        help_text='此欄位用於業務邏輯，實際權限應從 user.role 獲取'
    )
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='聯絡電話')
    hire_date = models.DateField(blank=True, null=True, verbose_name='入職日期')

    class Meta:
        verbose_name = '老師資料'
        verbose_name_plural = '老師資料'
        ordering = ['name']

    def __str__(self):
        username = self.user.username if self.user else '未設置帳號'
        return f"{self.name} ({username})"
    
    @property
    def username(self):
        """獲取用戶名（從關聯的 user 獲取）"""
        return self.user.username if self.user else None


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
        on_delete=models.PROTECT,  # 如果老師被刪除，保護課程不被刪除
        null=False,
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
    is_active = models.BooleanField(default=True, verbose_name='是否有效')
    
    # Soft delete 欄位
    is_deleted = models.BooleanField(default=False, verbose_name='是否已刪除')
    deleted_at = models.DateTimeField(blank=True, null=True, verbose_name='刪除時間')

    class Meta:
        verbose_name = '學生報名'
        verbose_name_plural = '學生報名'
        ordering = ['-enroll_date']
        unique_together = [('student', 'course')]  # 確保一個學生不能重複報名同一課程

    def __str__(self):
        return f"{self.student.name} - {self.course.course_name}"
    
    def soft_delete(self):
        """軟刪除報名記錄"""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """恢復報名記錄"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class EnrollmentPeriod(models.Model):
    """
    學生報名的上課期間模型
    用於記錄學生在報名期間的多個上課階段（例如：1-3月、5-8月，中間4月暫停）
    """
    period_id = models.AutoField(primary_key=True, verbose_name='期間ID')
    enrollment = models.ForeignKey(
        StudentEnrollment,
        on_delete=models.CASCADE,
        related_name='periods',
        verbose_name='報名記錄'
    )
    start_date = models.DateField(verbose_name='開始日期')
    end_date = models.DateField(blank=True, null=True, verbose_name='結束日期')
    is_active = models.BooleanField(default=True, verbose_name='是否進行中')
    notes = models.TextField(blank=True, null=True, verbose_name='備註')

    class Meta:
        verbose_name = '報名期間'
        verbose_name_plural = '報名期間'
        ordering = ['start_date']

    def __str__(self):
        end_str = self.end_date.strftime('%Y-%m-%d') if self.end_date else '進行中'
        return f"{self.enrollment.student.name} - {self.enrollment.course.course_name} ({self.start_date} ~ {end_str})"


class ExtraFee(models.Model):
    """
    學生額外收費模型
    """
    ITEM_CHOICES = [
        ('Tuition', '學費'),
        ('Transport', '交通費'),
        ('Meal', '餐費'),
        ('Book', '書籍費'),
        ('Other', '其他'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('Paid', 'Paid'),
        ('Unpaid', 'Unpaid'),
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
    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name='備註'
    )
    
    # 繳費時間（當 payment_status 變為 'Paid' 時記錄）
    paid_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='繳費時間',
        help_text='當繳費狀態變為已繳費時的記錄時間'
    )
    
    # Soft delete 欄位
    is_deleted = models.BooleanField(default=False, verbose_name='是否已刪除')
    deleted_at = models.DateTimeField(blank=True, null=True, verbose_name='刪除時間')

    class Meta:
        verbose_name = '額外收費'
        verbose_name_plural = '額外收費'
        ordering = ['-fee_date']

    def __str__(self):
        return f"{self.student.name} - {self.get_item_display()} - ${self.amount}"
    
    def save(self, *args, **kwargs):
        """
        保存時自動記錄繳費時間
        當 payment_status 變為 'Paid' 時，記錄 paid_at
        當 payment_status 變為 'Unpaid' 時，清除 paid_at
        """
        from django.utils import timezone
        
        # 如果是更新操作（pk 已存在）
        if self.pk:
            try:
                old_instance = ExtraFee.objects.get(pk=self.pk)
                old_status = old_instance.payment_status
                
                # 如果狀態從非 Paid 變為 Paid，記錄繳費時間
                if old_status != 'Paid' and self.payment_status == 'Paid':
                    self.paid_at = timezone.now()
                # 如果狀態從 Paid 變為非 Paid，清除繳費時間
                elif old_status == 'Paid' and self.payment_status != 'Paid':
                    self.paid_at = None
                # 如果狀態一直是 Unpaid，確保 paid_at 為 None
                elif self.payment_status == 'Unpaid':
                    self.paid_at = None
            except ExtraFee.DoesNotExist:
                # 如果是新創建的記錄且狀態為 Paid，記錄繳費時間
                if self.payment_status == 'Paid':
                    self.paid_at = timezone.now()
                # 如果是新創建的記錄且狀態為 Unpaid，確保 paid_at 為 None
                else:
                    self.paid_at = None
        else:
            # 如果是新創建的記錄且狀態為 Paid，記錄繳費時間
            if self.payment_status == 'Paid':
                self.paid_at = timezone.now()
            # 如果是新創建的記錄且狀態為 Unpaid，確保 paid_at 為 None
            else:
                self.paid_at = None
        
        super().save(*args, **kwargs)
    
    def soft_delete(self):
        """軟刪除收費記錄"""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """恢復收費記錄"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()


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
    
    # Soft delete 欄位
    is_deleted = models.BooleanField(default=False, verbose_name='是否已刪除')
    deleted_at = models.DateTimeField(blank=True, null=True, verbose_name='刪除時間')

    class Meta:
        verbose_name = '出席記錄'
        verbose_name_plural = '出席記錄'
        ordering = ['-session__session_date']
        unique_together = [('session', 'student')]  # 確保同一場次同一學生不能重複記錄

    def __str__(self):
        return f"{self.student.name} - {self.session.course.course_name} ({self.session.session_date}) - {self.get_status_display()}"
    
    def soft_delete(self):
        """軟刪除出席記錄"""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """恢復出席記錄"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()


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
    
    # Soft delete 欄位
    is_deleted = models.BooleanField(default=False, verbose_name='是否已刪除')
    deleted_at = models.DateTimeField(blank=True, null=True, verbose_name='刪除時間')

    class Meta:
        verbose_name = '請假記錄'
        verbose_name_plural = '請假記錄'
        ordering = ['-leave_date']

    def __str__(self):
        return f"{self.student.name} - {self.course.course_name} ({self.leave_date}) - {self.get_approval_status_display()}"
    
    def soft_delete(self):
        """軟刪除請假記錄"""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """恢復請假記錄"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()


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
    
    # 預設來源選項（僅供參考，實際使用字串存儲以保持擴展性）
    DEFAULT_SOURCE_OPTIONS = [
        '九章自命題',
        '學生錯題',
        '學測',
        '會考',
        '統測',
        '模擬考',
        '基測',
    ]
    
    QUESTION_TYPE_CHOICES = [
        ('SINGLE_CHOICE', '單選題'),
        ('MULTIPLE_CHOICE', '多選題'),
        ('FILL_IN_BLANK', '填充題'),
        ('PROGRAMMING', '程式題'),
        ('LISTENING', '聽力題'),
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
    
    # 題目類型相關欄位
    question_type = models.CharField(
        max_length=20,
        choices=QUESTION_TYPE_CHOICES,
        default='SINGLE_CHOICE',
        verbose_name='題目類型'
    )
    options = models.JSONField(
        default=list,
        blank=True,
        null=True,
        verbose_name='選項',
        help_text='選擇題的選項列表（JSON 格式）'
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        null=True,
        verbose_name='模式特定元資料',
        help_text='不同模式所需的額外資料（JSON 格式）'
    )
    
    # 題目來源資訊欄位
    question_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name='題號',
        help_text='從 Word 匯入的題號'
    )
    origin = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='出處',
        help_text='題目出處（例如：統測題）'
    )
    origin_detail = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='題源',
        help_text='題目來源詳細資訊（例如：101統測B）'
    )
    
    # 新增欄位：題目來源（使用字串以保持擴展性）
    source = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        default='九章自命題',
        verbose_name='題目來源',
        help_text='題目來源，例如：九章自命題、學生錯題、學測、會考、統測、模擬考、基測等'
    )
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_questions',
        verbose_name='建立者'
    )
    imported_from_error_log = models.ForeignKey(
        'ErrorLog',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='imported_questions',
        verbose_name='來源錯題記錄'
    )
    imported_student = models.ForeignKey(
        'Student',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='imported_questions',
        verbose_name='來源學生',
        help_text='若此題由學生錯題彙整而來，記錄來源學生以利針對性教學'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')
    
    # 新增欄位：詳解內容（Tiptap JSON 格式）
    solution_content = models.JSONField(
        default=dict,
        blank=True,
        null=True,
        verbose_name='詳解內容 (Tiptap JSON)',
        help_text='使用 Tiptap 編輯器創建的詳解內容，支援富文本、2D/3D 圖形'
    )
    
    # 新增欄位：搜尋文字內容（用於全文檢索）
    search_text_content = models.TextField(
        blank=True,
        null=True,
        help_text='用於全文檢索的純文字（從 Tiptap JSON 自動提取）',
        verbose_name='搜尋文字內容'
    )

    class Meta:
        verbose_name = '題目庫'
        verbose_name_plural = '題目庫'
        ordering = ['subject', 'level', 'chapter']

    def __str__(self):
        return f"{self.subject.name if self.subject else '無科目'} - {self.chapter} (Q{self.question_id})"
    
    def extract_text_from_tiptap_json(self, json_data):
        """
        遞迴提取 Tiptap JSON 中的所有文字節點
        用於生成 search_text_content
        """
        if not json_data or not isinstance(json_data, dict):
            return []

        # 兼容：以 Markdown 純文字儲存的格式（由前端 RichTextEditor 產生）
        if json_data.get('format') == 'markdown' and isinstance(json_data.get('text'), str):
            text = json_data.get('text', '').strip()
            return [text] if text else []
        
        text_parts = []
        
        # 如果是文字節點
        if json_data.get('type') == 'text':
            text = json_data.get('text', '')
            if text:
                text_parts.append(text)
        
        # 遞迴處理子節點
        if 'content' in json_data and isinstance(json_data['content'], list):
            for child in json_data['content']:
                text_parts.extend(self.extract_text_from_tiptap_json(child))
        
        return text_parts
    
    def save(self, *args, **kwargs):
        """
        在保存時自動從 solution_content JSON 中提取純文字
        存入 search_text_content 欄位
        並自動處理題目來源設置
        """
        # 處理題目來源
        if self.imported_from_error_log and not self.source:
            self.source = '學生錯題'
        if not self.source:
            self.source = '九章自命題'
        
        # 處理搜尋文字內容
        if self.solution_content:
            text_parts = self.extract_text_from_tiptap_json(self.solution_content)
            self.search_text_content = ' '.join(text_parts)
        else:
            self.search_text_content = None
        
        super().save(*args, **kwargs)


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


class AssessmentSubmission(models.Model):
    """
    教學資源提交記錄模型（統一處理測驗、考卷等提交）
    """
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Graded', 'Graded'),
    ]

    submission_id = models.AutoField(primary_key=True, verbose_name='提交ID')
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='submissions',
        verbose_name='學生'
    )
    learning_resource = models.ForeignKey(
        'LearningResource',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='submissions',
        verbose_name='教學資源'
    )
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.0,
        verbose_name='總分'
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='Pending',
        verbose_name='狀態'
    )
    submitted_at = models.DateTimeField(auto_now_add=True, verbose_name='提交時間')

    class Meta:
        verbose_name = '教學資源提交'
        verbose_name_plural = '教學資源提交'
        ordering = ['-submitted_at']

    def __str__(self):
        source = self.quiz.title if self.quiz else (self.exam.title if self.exam else 'Unknown')
        return f"{self.student.name} - {source} - {self.score}"


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
    submission = models.ForeignKey(
        AssessmentSubmission,
        on_delete=models.CASCADE,
        related_name='answers',
        null=True,
        blank=True,
        verbose_name='提交記錄'
    )
    is_correct = models.BooleanField(default=False, verbose_name='是否答對')
    scanned_file_path = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='考卷掃描檔路徑'
    )
    
    # Soft delete 欄位
    is_deleted = models.BooleanField(default=False, verbose_name='是否已刪除')
    deleted_at = models.DateTimeField(blank=True, null=True, verbose_name='刪除時間')

    class Meta:
        verbose_name = '學生作答記錄'
        verbose_name_plural = '學生作答記錄'
        ordering = ['-answer_id']

    def __str__(self):
        return f"{self.student.name} - Q{self.question.question_id} - {self.test_name}"
    
    def soft_delete(self):
        """軟刪除作答記錄"""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """恢復作答記錄"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()


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
    
    # Soft delete 欄位
    is_deleted = models.BooleanField(default=False, verbose_name='是否已刪除')
    deleted_at = models.DateTimeField(blank=True, null=True, verbose_name='刪除時間')

    class Meta:
        verbose_name = '錯題本'
        verbose_name_plural = '錯題本'
        ordering = ['-error_count']
        unique_together = [('student', 'question')]  # 確保同一學生同一題目只有一筆記錄

    def __str__(self):
        return f"{self.student.name} - Q{self.question.question_id} - 錯誤{self.error_count}次"
    
    def soft_delete(self):
        """軟刪除錯題記錄"""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """恢復錯題記錄"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class ErrorLogImage(models.Model):
    """
    錯題本（ErrorLog）圖片：一筆錯題可有多張照片
    """
    image_id = models.AutoField(primary_key=True, verbose_name='錯題圖片ID')
    error_log = models.ForeignKey(
        ErrorLog,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name='錯題記錄'
    )
    image_path = models.CharField(max_length=255, verbose_name='圖片路徑')
    caption = models.CharField(max_length=255, blank=True, null=True, verbose_name='圖片說明')
    sort_order = models.IntegerField(default=0, verbose_name='排序')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')

    class Meta:
        verbose_name = '錯題圖片'
        verbose_name_plural = '錯題圖片'
        ordering = ['sort_order', 'image_id']
        indexes = [
            models.Index(fields=['error_log', 'sort_order'], name='errimg_log_sort_idx'),
        ]

    def __str__(self):
        return f"ErrorLog#{self.error_log_id} Image#{self.image_id}"


class StudentMistakeNote(models.Model):
    """
    學生自建錯題本（筆記式，不強制綁定題庫）
    - 僅允許學生管理自己的筆記
    """
    note_id = models.AutoField(primary_key=True, verbose_name='錯題筆記ID')
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='mistake_notes',
        verbose_name='學生'
    )
    title = models.CharField(max_length=200, verbose_name='標題')
    subject = models.CharField(max_length=100, blank=True, null=True, verbose_name='科目/分類')
    content = models.TextField(blank=True, null=True, verbose_name='內容 (Markdown)')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')

    # Soft delete 欄位
    is_deleted = models.BooleanField(default=False, verbose_name='是否已刪除')
    deleted_at = models.DateTimeField(blank=True, null=True, verbose_name='刪除時間')

    class Meta:
        verbose_name = '學生錯題筆記'
        verbose_name_plural = '學生錯題筆記'
        ordering = ['-updated_at', '-note_id']
        indexes = [
            models.Index(fields=['student', 'is_deleted'], name='mistake_student_deleted_idx'),
            models.Index(fields=['student', 'updated_at'], name='mistake_student_updated_idx'),
        ]

    def __str__(self):
        return f"{self.student.name} - {self.title}"

    def soft_delete(self):
        """軟刪除錯題筆記"""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        """恢復錯題筆記"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class StudentMistakeNoteImage(models.Model):
    """
    學生自建錯題筆記圖片：一筆筆記可有多張照片
    """
    image_id = models.AutoField(primary_key=True, verbose_name='筆記圖片ID')
    note = models.ForeignKey(
        StudentMistakeNote,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name='錯題筆記'
    )
    image_path = models.CharField(max_length=255, verbose_name='圖片路徑')
    caption = models.CharField(max_length=255, blank=True, null=True, verbose_name='圖片說明')
    sort_order = models.IntegerField(default=0, verbose_name='排序')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')

    class Meta:
        verbose_name = '錯題筆記圖片'
        verbose_name_plural = '錯題筆記圖片'
        ordering = ['sort_order', 'image_id']
        indexes = [
            models.Index(fields=['note', 'sort_order'], name='noteimg_note_sort_idx'),
        ]

    def __str__(self):
        return f"Note#{self.note_id} Image#{self.image_id}"

class Restaurant(models.Model):
    """
    店家模型
    """
    restaurant_id = models.AutoField(primary_key=True, verbose_name='店家ID')
    name = models.CharField(max_length=100, verbose_name='店家名稱')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='電話')
    address = models.CharField(max_length=255, blank=True, null=True, verbose_name='地址')
    menu_image_path = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='菜單圖片路徑'
    )
    is_active = models.BooleanField(default=True, verbose_name='是否啟用')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')

    class Meta:
        verbose_name = '店家'
        verbose_name_plural = '店家'
        ordering = ['name']

    def __str__(self):
        return self.name


class GroupOrder(models.Model):
    """
    團購模型
    """
    STATUS_CHOICES = [
        ('Open', '進行中'),
        ('Closed', '已結束'),
        ('Completed', '已完成'),
    ]
    
    group_order_id = models.AutoField(primary_key=True, verbose_name='團購ID')
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.PROTECT,
        related_name='group_orders',
        verbose_name='店家'
    )
    title = models.CharField(max_length=200, verbose_name='團購標題')
    order_link = models.CharField(
        max_length=255,
        unique=True,
        verbose_name='團購連結'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Open',
        verbose_name='狀態'
    )
    deadline = models.DateTimeField(verbose_name='截止時間')
    created_by = models.ForeignKey(
        Teacher,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_group_orders',
        verbose_name='建立者'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    closed_at = models.DateTimeField(blank=True, null=True, verbose_name='結束時間')

    class Meta:
        verbose_name = '團購'
        verbose_name_plural = '團購'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.restaurant.name}"


class Order(models.Model):
    """
    訂單模型
    """
    STATUS_CHOICES = [
        ('Pending', '待確認'),
        ('Confirmed', '已確認'),
        ('Cancelled', '已取消'),
    ]
    
    order_id = models.AutoField(primary_key=True, verbose_name='訂單ID')
    group_order = models.ForeignKey(
        GroupOrder,
        on_delete=models.CASCADE,
        related_name='orders',
        verbose_name='團購'
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='orders',
        verbose_name='學生'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Pending',
        verbose_name='狀態'
    )
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        verbose_name='總金額'
    )
    notes = models.TextField(blank=True, null=True, verbose_name='備註')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')
    
    # Soft delete 欄位
    is_deleted = models.BooleanField(default=False, verbose_name='是否已刪除')
    deleted_at = models.DateTimeField(blank=True, null=True, verbose_name='刪除時間')

    class Meta:
        verbose_name = '訂單'
        verbose_name_plural = '訂單'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.name} - {self.group_order.title}"
    
    def soft_delete(self):
        """軟刪除訂單記錄"""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """恢復訂單記錄"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class OrderItem(models.Model):
    """
    訂單項目模型
    """
    order_item_id = models.AutoField(primary_key=True, verbose_name='訂單項目ID')
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='訂單'
    )
    item_name = models.CharField(max_length=200, verbose_name='項目名稱')
    quantity = models.IntegerField(default=1, verbose_name='數量')
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='單價'
    )
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='小計'
    )

    class Meta:
        verbose_name = '訂單項目'
        verbose_name_plural = '訂單項目'
        ordering = ['order_item_id']

    def __str__(self):
        return f"{self.order.student.name} - {self.item_name} x{self.quantity}"


class StudentGroup(models.Model):
    """
    學生群組模型
    用於個別化教學，將學生分組
    也用於會計標籤管理
    """
    GROUP_TYPE_CHOICES = [
        ('teaching', '教學群組'),  # 老師用於個別化教學
        ('tag', '標籤'),          # 會計用於標籤管理
    ]
    
    group_id = models.AutoField(primary_key=True, verbose_name='群組ID')
    name = models.CharField(max_length=100, verbose_name='群組名稱')
    description = models.TextField(blank=True, null=True, verbose_name='描述')
    group_type = models.CharField(
        max_length=20,
        choices=GROUP_TYPE_CHOICES,
        default='teaching',
        verbose_name='群組類型',
        help_text='教學群組：老師用於個別化教學；標籤：會計用於標籤管理'
    )
    students = models.ManyToManyField(
        Student,
        related_name='student_groups',
        verbose_name='學生'
    )
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_student_groups',
        verbose_name='建立者'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')

    class Meta:
        verbose_name = '學生群組'
        verbose_name_plural = '學生群組'
        ordering = ['name']
        indexes = [
            models.Index(fields=['group_type']),  # 為查詢優化添加索引
        ]

    def __str__(self):
        return f"{self.name} ({self.students.count()} 位學生)"


class ContentTemplate(models.Model):
    """
    內容模板模型
    用於儲存可重複使用的區塊結構
    """
    template_id = models.AutoField(primary_key=True, verbose_name='模板ID')
    title = models.CharField(max_length=200, verbose_name='標題')
    structure = models.JSONField(default=list, verbose_name='結構內容')
    tiptap_structure = models.JSONField(default=dict, verbose_name='Tiptap JSON 結構', blank=True, null=True)
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_templates',
        verbose_name='建立者'
    )
    is_public = models.BooleanField(default=False, verbose_name='是否公開')
    tags = models.ManyToManyField(
        'Hashtag',
        related_name='templates',
        blank=True,
        verbose_name='標籤'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')

    class Meta:
        verbose_name = '內容模板'
        verbose_name_plural = '內容模板'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class LearningResource(models.Model):
    """
    教學資源模型 (統一 Quiz, Exam, Handout)
    支援多種模式：講義、線上測驗、LeetCode、聽力測驗、單字卡等
    """
    MODE_CHOICES = [
        ('HANDOUT', '講義模式'),
        ('ONLINE_QUIZ', '線上測驗模式'),
        ('LEETCODE', '程式題模式'),
        ('LISTENING_TEST', '聽力測驗模式'),
        ('FLASHCARD', '單字卡模式'),
    ]

    resource_id = models.AutoField(primary_key=True, verbose_name='資源ID')
    title = models.CharField(max_length=200, verbose_name='標題')
    mode = models.CharField(
        max_length=20,
        choices=MODE_CHOICES,
        default='HANDOUT',
        verbose_name='模式類型'
    )
    courses = models.ManyToManyField(
        'Course',
        related_name='learning_resources',
        blank=True,
        verbose_name='所屬課程'
    )
    student_groups = models.ManyToManyField(
        'StudentGroup',
        related_name='learning_resources',
        blank=True,
        verbose_name='可見學生群組'
    )
    structure = models.JSONField(default=list, verbose_name='內容結構')
    tiptap_structure = models.JSONField(default=dict, null=True, blank=True, verbose_name='Tiptap JSON 結構')
    settings = models.JSONField(default=dict, verbose_name='設定 (版面/紙張)')
    tags = models.ManyToManyField(
        'Hashtag',
        related_name='learning_resources',
        blank=True,
        verbose_name='標籤'
    )
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_resources',
        verbose_name='建立者'
    )
    is_individualized = models.BooleanField(
        default=False,
        verbose_name='是否為個別化教材'
    )
    available_from = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='開放時間'
    )
    available_until = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='截止時間'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')

    class Meta:
        verbose_name = '教學資源'
        verbose_name_plural = '教學資源'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_mode_display()})"
