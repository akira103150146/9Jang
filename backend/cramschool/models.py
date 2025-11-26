from django.db import models
# cramschool/models.py

class Student(models.Model):
    """
    補習班學生資料模型
    """
    # 核心欄位
    name = models.CharField(max_length=100, verbose_name='姓名')
    school = models.CharField(max_length=100, verbose_name='學校')
    grade = models.CharField(max_length=50, verbose_name='年級')
    contact = models.CharField(max_length=150, verbose_name='聯絡方式')
    
    # 備註欄位 (可為空)
    notes = models.TextField(blank=True, null=True, verbose_name='備註')

    # 追蹤欄位 (自動建立/更新時間)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='建立時間')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新時間')

    class Meta:
        verbose_name = '學生資料'
        verbose_name_plural = '學生資料'
        ordering = ['name'] # 依姓名排序

    def __str__(self):
        return f"{self.name} ({self.school} - {self.grade})"
# Create your models here.
