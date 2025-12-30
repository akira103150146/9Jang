from django.contrib import admin
from .models import (
    Student, Teacher, Course, StudentEnrollment, EnrollmentPeriod, ExtraFee, 
    SessionRecord, Attendance, Leave, Subject, QuestionBank, Hashtag, QuestionTag,
    StudentAnswer, ErrorLog, Restaurant, GroupOrder, Order, OrderItem,
    StudentGroup, AssessmentSubmission
)

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('name', 'school', 'grade', 'phone')
    search_fields = ('name', 'phone')

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('name', 'username', 'phone', 'permission_level')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('course_name', 'teacher', 'day_of_week', 'status')
    list_filter = ('status', 'day_of_week')

@admin.register(StudentEnrollment)
class StudentEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enroll_date', 'is_active')
    list_filter = ('is_active',)

@admin.register(StudentGroup)
class StudentGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'created_at')
    filter_horizontal = ('students',)

@admin.register(QuestionBank)
class QuestionBankAdmin(admin.ModelAdmin):
    list_display = ('chapter', 'subject', 'difficulty', 'created_by')
    list_filter = ('subject', 'difficulty', 'level')

@admin.register(AssessmentSubmission)
class AssessmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('student', 'learning_resource', 'score', 'status', 'submitted_at')
    list_filter = ('status',)

# Register other models with default configuration
admin.site.register(EnrollmentPeriod)
admin.site.register(ExtraFee)
admin.site.register(SessionRecord)
admin.site.register(Attendance)
admin.site.register(Leave)
admin.site.register(Subject)
admin.site.register(Hashtag)
admin.site.register(QuestionTag)
admin.site.register(StudentAnswer)
admin.site.register(ErrorLog)
admin.site.register(Restaurant)
admin.site.register(GroupOrder)
admin.site.register(Order)
admin.site.register(OrderItem)
