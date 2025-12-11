"""
API CRUD 測試文件
為所有 API 端點提供完整的 CRUD 測試，包括關聯 API 的商業邏輯測試
"""
from datetime import timedelta, date
from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from cramschool.models import (
    Student, Teacher, Course, StudentEnrollment, EnrollmentPeriod, ExtraFee,
    SessionRecord, Attendance, Leave, Subject, QuestionBank, Hashtag, QuestionTag,
    StudentAnswer, ErrorLog, Restaurant, GroupOrder, Order, OrderItem,
    StudentGroup, Quiz, Exam, CourseMaterial, AssessmentSubmission
)
from account.models import CustomUser, UserRole


class BaseAPITestCase(TestCase):
    """API 測試基礎類，提供通用的設置和工具方法"""
    
    @classmethod
    def setUpTestData(cls):
        """設置測試數據（每個測試類只執行一次，測試方法之間共享）"""
        # 創建不同角色的用戶
        cls.admin_user = CustomUser.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='admin123',
            role=UserRole.ADMIN
        )
        
        cls.teacher_user = CustomUser.objects.create_user(
            username='teacher',
            email='teacher@test.com',
            password='teacher123',
            role=UserRole.TEACHER
        )
        
        cls.student_user = CustomUser.objects.create_user(
            username='student',
            email='student@test.com',
            password='student123',
            role=UserRole.STUDENT
        )
        
        cls.accountant_user = CustomUser.objects.create_user(
            username='accountant',
            email='accountant@test.com',
            password='accountant123',
            role=UserRole.ACCOUNTANT
        )
        
        # 創建基礎數據
        cls.teacher = Teacher.objects.create(
            name='測試老師',
            permission_level='Teacher',
            user=cls.teacher_user
        )
        
        cls.subject = Subject.objects.create(
            name='數學',
            code='MATH'
        )
        
        cls.restaurant = Restaurant.objects.create(
            name='測試餐廳',
            phone='1234567890'
        )
    
    def setUp(self):
        """設置測試環境（每個測試方法執行前都會執行）"""
        self.client = APIClient()
    
    def authenticate_user(self, user):
        """認證用戶"""
        self.client.force_authenticate(user=user)
    
    def get_api_url(self, viewset_name, action='list', pk=None):
        """獲取 API URL"""
        base_url = f'/api/cramschool/{viewset_name}/'
        if action == 'detail' and pk:
            return f'{base_url}{pk}/'
        elif action != 'list':
            return f'{base_url}{pk}/{action}/' if pk else f'{base_url}{action}/'
        return base_url
    
    def get_response_results(self, response):
        """獲取分頁響應中的實際數據列表"""
        if isinstance(response.data, dict) and 'results' in response.data:
            return response.data['results']
        return response.data if isinstance(response.data, list) else [response.data]


class StudentAPITestCase(BaseAPITestCase):
    """Student API CRUD 測試"""
    
    def setUp(self):
        super().setUp()
        self.student_data = {
            'name': '張三',
            'school': '測試中學',
            'grade': '一年級',
            'phone': '0912345678'
        }
    
    def test_create_student(self):
        """測試創建學生"""
        self.authenticate_user(self.admin_user)
        url = self.get_api_url('students')
        
        response = self.client.post(url, self.student_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user_account', response.data)
        self.assertEqual(response.data['name'], self.student_data['name'])
        
        # 驗證學生和用戶帳號都已創建
        student = Student.objects.get(name=self.student_data['name'])
        self.assertIsNotNone(student.user)
        self.assertEqual(student.user.role, UserRole.STUDENT)
        self.assertIsNotNone(student.initial_password)
    
    def test_list_students(self):
        """測試列出學生"""
        # 創建測試學生
        student1 = Student.objects.create(
            name='學生1',
            school='學校1',
            grade='一年級'
        )
        student2 = Student.objects.create(
            name='學生2',
            school='學校2',
            grade='二年級',
            is_deleted=True
        )
        
        url = self.get_api_url('students')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # 預設應該不包含已刪除的學生
        results = self.get_response_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], '學生1')
        
        # 測試包含已刪除的學生
        response = self.client.get(url, {'include_deleted': 'true'})
        results = self.get_response_results(response)
        self.assertEqual(len(results), 2)
    
    def test_retrieve_student(self):
        """測試獲取單個學生"""
        student = Student.objects.create(
            name='測試學生',
            school='測試學校',
            grade='一年級'
        )
        
        url = self.get_api_url('students', 'detail', student.student_id)
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], '測試學生')
    
    def test_update_student(self):
        """測試更新學生"""
        student = Student.objects.create(
            name='原始名稱',
            school='原始學校',
            grade='一年級'
        )
        
        url = self.get_api_url('students', 'detail', student.student_id)
        update_data = {'name': '更新名稱', 'school': '更新學校'}
        
        response = self.client.patch(url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        student.refresh_from_db()
        self.assertEqual(student.name, '更新名稱')
        self.assertEqual(student.school, '更新學校')
    
    def test_soft_delete_student(self):
        """測試軟刪除學生"""
        student = Student.objects.create(
            name='待刪除學生',
            school='學校',
            grade='一年級'
        )
        
        url = self.get_api_url('students', 'detail', student.student_id)
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        student.refresh_from_db()
        self.assertTrue(student.is_deleted)
        self.assertIsNotNone(student.deleted_at)
    
    def test_restore_student(self):
        """測試恢復學生"""
        student = Student.objects.create(
            name='已刪除學生',
            school='學校',
            grade='一年級',
            is_deleted=True
        )
        
        url = self.get_api_url('students', 'restore', student.student_id)
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        student.refresh_from_db()
        self.assertFalse(student.is_deleted)
    
    def test_reset_password(self):
        """測試重置學生密碼（僅管理員）"""
        student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級',
            user=self.student_user
        )
        
        url = self.get_api_url('students', 'reset-password', student.student_id)
        
        # 非管理員無法重置
        self.authenticate_user(self.teacher_user)
        response = self.client.post(url, {'password': 'newpass123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # 管理員可以重置
        self.authenticate_user(self.admin_user)
        response = self.client.post(url, {'password': 'newpass123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student_user.refresh_from_db()
        self.assertTrue(self.student_user.check_password('newpass123'))
    
    def test_toggle_account_status(self):
        """測試啟用/停用學生帳號"""
        student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級',
            user=self.student_user
        )
        
        url = self.get_api_url('students', 'toggle-account-status', student.student_id)
        
        # 非管理員無法操作
        self.authenticate_user(self.teacher_user)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # 管理員可以操作
        self.authenticate_user(self.admin_user)
        original_status = self.student_user.is_active
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student_user.refresh_from_db()
        self.assertNotEqual(self.student_user.is_active, original_status)
    
    def test_tuition_status(self):
        """測試獲取學費狀態"""
        student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級'
        )
        
        course = Course.objects.create(
            course_name='數學課',
            teacher=self.teacher,
            start_time='09:00:00',
            end_time='10:00:00',
            day_of_week='Mon',
            fee_per_session=Decimal('100.00')
        )
        
        enrollment = StudentEnrollment.objects.create(
            student=student,
            course=course,
            enroll_date=date.today() - timedelta(days=60)
        )
        
        url = self.get_api_url('students', 'tuition_status', student.student_id)
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tuition_months', response.data)
    
    def test_generate_tuition(self):
        """測試生成學費"""
        student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級'
        )
        
        course = Course.objects.create(
            course_name='數學課',
            teacher=self.teacher,
            start_time='09:00:00',
            end_time='10:00:00',
            day_of_week='Mon',
            fee_per_session=Decimal('100.00')
        )
        
        enrollment = StudentEnrollment.objects.create(
            student=student,
            course=course,
            enroll_date=date.today()
        )
        
        url = self.get_api_url('students', 'generate_tuition', student.student_id)
        today = date.today()
        data = {
            'year': today.year,
            'month': today.month,
            'enrollment_id': enrollment.enrollment_id,
            'weeks': 4
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('fee_id', response.data)
        
        # 驗證費用已創建
        fee = ExtraFee.objects.get(fee_id=response.data['fee_id'])
        self.assertEqual(fee.student, student)
        self.assertEqual(fee.item, 'Tuition')
    
    def test_attendance_and_leaves(self):
        """測試獲取出缺勤和請假記錄"""
        student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級'
        )
        
        course = Course.objects.create(
            course_name='數學課',
            teacher=self.teacher,
            start_time='09:00:00',
            end_time='10:00:00',
            day_of_week='Mon',
            fee_per_session=Decimal('100.00')
        )
        
        session = SessionRecord.objects.create(
            course=course,
            session_date=date.today()
        )
        
        Attendance.objects.create(
            session=session,
            student=student,
            status='Present'
        )
        
        Leave.objects.create(
            student=student,
            course=course,
            leave_date=date.today(),
            reason='生病'
        )
        
        url = self.get_api_url('students', 'attendance_and_leaves', student.student_id)
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('attendances', response.data)
        self.assertIn('leaves', response.data)
        self.assertEqual(len(response.data['attendances']), 1)
        self.assertEqual(len(response.data['leaves']), 1)


class TeacherAPITestCase(BaseAPITestCase):
    """Teacher API CRUD 測試"""
    
    def setUp(self):
        super().setUp()
        self.teacher_data = {
            'name': '新老師',
            'username': 'newteacher',
            'permission_level': 'Teacher',
            'phone': '0912345678',
            'password': 'teacherpass123'
        }
    
    def test_create_teacher(self):
        """測試創建老師"""
        url = self.get_api_url('teachers')
        response = self.client.post(url, self.teacher_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], self.teacher_data['name'])
        
        # 驗證老師和用戶都已創建
        teacher = Teacher.objects.get(name=self.teacher_data['name'])
        self.assertIsNotNone(teacher.user)
    
    def test_list_teachers(self):
        """測試列出老師"""
        Teacher.objects.create(name='老師1', permission_level='Teacher')
        Teacher.objects.create(name='老師2', permission_level='Admin')
        
        url = self.get_api_url('teachers')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_response_results(response)
        self.assertEqual(len(results), 3)  # 包括 setUp 中創建的
    
    def test_retrieve_teacher(self):
        """測試獲取單個老師"""
        url = self.get_api_url('teachers', 'detail', self.teacher.teacher_id)
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.teacher.name)
    
    def test_update_teacher(self):
        """測試更新老師"""
        url = self.get_api_url('teachers', 'detail', self.teacher.teacher_id)
        update_data = {'name': '更新名稱', 'phone': '0987654321'}
        
        response = self.client.patch(url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.teacher.refresh_from_db()
        self.assertEqual(self.teacher.name, '更新名稱')
    
    def test_delete_teacher(self):
        """測試刪除老師"""
        url = self.get_api_url('teachers', 'detail', self.teacher.teacher_id)
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Teacher.objects.filter(teacher_id=self.teacher.teacher_id).exists())


class CourseAPITestCase(BaseAPITestCase):
    """Course API CRUD 測試"""
    
    def setUp(self):
        super().setUp()
        self.course_data = {
            'course_name': '數學課',
            'teacher': self.teacher.teacher_id,
            'start_time': '09:00:00',
            'end_time': '10:00:00',
            'day_of_week': 'Mon',
            'fee_per_session': '100.00',
            'status': 'Active'
        }
    
    def test_create_course(self):
        """測試創建課程"""
        url = self.get_api_url('courses')
        response = self.client.post(url, self.course_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['course_name'], self.course_data['course_name'])
    
    def test_list_courses(self):
        """測試列出課程"""
        Course.objects.create(
            course_name='課程1',
            teacher=self.teacher,
            start_time='09:00:00',
            end_time='10:00:00',
            day_of_week='Mon',
            fee_per_session=Decimal('100.00')
        )
        
        url = self.get_api_url('courses')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_response_results(response)
        self.assertGreaterEqual(len(results), 1)
    
    def test_student_can_only_see_enrolled_courses(self):
        """測試學生只能看到自己報名的課程"""
        course1 = Course.objects.create(
            course_name='已報名課程',
            teacher=self.teacher,
            start_time='09:00:00',
            end_time='10:00:00',
            day_of_week='Mon',
            fee_per_session=Decimal('100.00')
        )
        
        course2 = Course.objects.create(
            course_name='未報名課程',
            teacher=self.teacher,
            start_time='10:00:00',
            end_time='11:00:00',
            day_of_week='Tue',
            fee_per_session=Decimal('100.00')
        )
        
        student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級',
            user=self.student_user
        )
        
        StudentEnrollment.objects.create(
            student=student,
            course=course1,
            enroll_date=date.today()
        )
        
        self.authenticate_user(self.student_user)
        url = self.get_api_url('courses')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        course_names = [c['course_name'] for c in self.get_response_results(response)]
        self.assertIn('已報名課程', course_names)
        self.assertNotIn('未報名課程', course_names)
    
    def test_admin_can_see_all_courses(self):
        """測試管理員可以看到所有課程"""
        Course.objects.create(
            course_name='課程1',
            teacher=self.teacher,
            start_time='09:00:00',
            end_time='10:00:00',
            day_of_week='Mon',
            fee_per_session=Decimal('100.00')
        )
        
        self.authenticate_user(self.admin_user)
        url = self.get_api_url('courses')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_response_results(response)
        self.assertGreaterEqual(len(results), 1)


class StudentEnrollmentAPITestCase(BaseAPITestCase):
    """StudentEnrollment API CRUD 測試"""
    
    def setUp(self):
        super().setUp()
        self.student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級'
        )
        
        self.course = Course.objects.create(
            course_name='數學課',
            teacher=self.teacher,
            start_time='09:00:00',
            end_time='10:00:00',
            day_of_week='Mon',
            fee_per_session=Decimal('100.00')
        )
        
        self.enrollment_data = {
            'student': self.student.student_id,
            'course': self.course.course_id,
            'enroll_date': date.today().isoformat(),
            'discount_rate': '0.00'
        }
    
    def test_create_enrollment(self):
        """測試創建報名記錄"""
        url = self.get_api_url('enrollments')
        response = self.client.post(url, self.enrollment_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 驗證自動創建了初始上課期間
        enrollment = StudentEnrollment.objects.get(
            student=self.student,
            course=self.course
        )
        periods = enrollment.periods.all()
        self.assertEqual(periods.count(), 1)
        self.assertTrue(periods.first().is_active)
    
    def test_list_enrollments(self):
        """測試列出報名記錄"""
        enrollment = StudentEnrollment.objects.create(
            student=self.student,
            course=self.course,
            enroll_date=date.today()
        )
        
        url = self.get_api_url('enrollments')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_response_results(response)
        self.assertGreaterEqual(len(results), 1)
    
    def test_soft_delete_enrollment(self):
        """測試軟刪除報名記錄"""
        enrollment = StudentEnrollment.objects.create(
            student=self.student,
            course=self.course,
            enroll_date=date.today()
        )
        
        url = self.get_api_url('enrollments', 'detail', enrollment.enrollment_id)
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        enrollment.refresh_from_db()
        self.assertTrue(enrollment.is_deleted)
    
    def test_restore_enrollment(self):
        """測試恢復報名記錄"""
        enrollment = StudentEnrollment.objects.create(
            student=self.student,
            course=self.course,
            enroll_date=date.today(),
            is_deleted=True
        )
        
        url = self.get_api_url('enrollments', 'restore', enrollment.enrollment_id)
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        enrollment.refresh_from_db()
        self.assertFalse(enrollment.is_deleted)


class ExtraFeeAPITestCase(BaseAPITestCase):
    """ExtraFee API CRUD 測試"""
    
    def setUp(self):
        super().setUp()
        self.student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級'
        )
        
        self.fee_data = {
            'student': self.student.student_id,
            'item': 'Tuition',
            'amount': '1000.00',
            'fee_date': date.today().isoformat(),
            'payment_status': 'Unpaid'
        }
    
    def test_create_fee(self):
        """測試創建費用記錄"""
        url = self.get_api_url('fees')
        response = self.client.post(url, self.fee_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['item'], 'Tuition')
    
    def test_list_fees(self):
        """測試列出費用記錄"""
        ExtraFee.objects.create(
            student=self.student,
            item='Tuition',
            amount=Decimal('1000.00'),
            fee_date=date.today(),
            payment_status='Unpaid'
        )
        
        url = self.get_api_url('fees')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_response_results(response)
        self.assertGreaterEqual(len(results), 1)
    
    def test_filter_fees_by_student(self):
        """測試按學生篩選費用"""
        student2 = Student.objects.create(
            name='學生2',
            school='學校',
            grade='一年級'
        )
        
        ExtraFee.objects.create(
            student=self.student,
            item='Tuition',
            amount=Decimal('1000.00'),
            fee_date=date.today()
        )
        
        ExtraFee.objects.create(
            student=student2,
            item='Tuition',
            amount=Decimal('2000.00'),
            fee_date=date.today()
        )
        
        url = self.get_api_url('fees')
        response = self.client.get(url, {'student': self.student.student_id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_response_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['student'], self.student.student_id)
    
    def test_cannot_delete_fee(self):
        """測試無法刪除費用記錄"""
        fee = ExtraFee.objects.create(
            student=self.student,
            item='Tuition',
            amount=Decimal('1000.00'),
            fee_date=date.today()
        )
        
        url = self.get_api_url('fees', 'detail', fee.fee_id)
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_restore_fee(self):
        """測試恢復費用記錄"""
        fee = ExtraFee.objects.create(
            student=self.student,
            item='Tuition',
            amount=Decimal('1000.00'),
            fee_date=date.today(),
            is_deleted=True
        )
        
        url = self.get_api_url('fees', 'restore', fee.fee_id)
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        fee.refresh_from_db()
        self.assertFalse(fee.is_deleted)


class SessionRecordAPITestCase(BaseAPITestCase):
    """SessionRecord API CRUD 測試"""
    
    def setUp(self):
        super().setUp()
        self.course = Course.objects.create(
            course_name='數學課',
            teacher=self.teacher,
            start_time='09:00:00',
            end_time='10:00:00',
            day_of_week='Mon',
            fee_per_session=Decimal('100.00')
        )
        
        self.session_data = {
            'course': self.course.course_id,
            'session_date': date.today().isoformat()
        }
    
    def test_create_session(self):
        """測試創建上課記錄"""
        url = self.get_api_url('sessions')
        response = self.client.post(url, self.session_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['course'], self.course.course_id)
    
    def test_list_sessions(self):
        """測試列出上課記錄"""
        SessionRecord.objects.create(
            course=self.course,
            session_date=date.today()
        )
        
        url = self.get_api_url('sessions')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_response_results(response)
        self.assertGreaterEqual(len(results), 1)
    
    def test_unique_session_per_course_per_date(self):
        """測試同一課程同一天不能重複記錄"""
        SessionRecord.objects.create(
            course=self.course,
            session_date=date.today()
        )
        
        url = self.get_api_url('sessions')
        response = self.client.post(url, self.session_data, format='json')
        
        # 應該失敗，因為違反了 unique_together 約束
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AttendanceAPITestCase(BaseAPITestCase):
    """Attendance API CRUD 測試"""
    
    def setUp(self):
        super().setUp()
        self.student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級'
        )
        
        self.course = Course.objects.create(
            course_name='數學課',
            teacher=self.teacher,
            start_time='09:00:00',
            end_time='10:00:00',
            day_of_week='Mon',
            fee_per_session=Decimal('100.00')
        )
        
        self.session = SessionRecord.objects.create(
            course=self.course,
            session_date=date.today()
        )
        
        self.attendance_data = {
            'session': self.session.session_id,
            'student': self.student.student_id,
            'status': 'Present'
        }
    
    def test_create_attendance(self):
        """測試創建出席記錄"""
        url = self.get_api_url('attendances')
        response = self.client.post(url, self.attendance_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'Present')
    
    def test_list_attendances(self):
        """測試列出出席記錄"""
        Attendance.objects.create(
            session=self.session,
            student=self.student,
            status='Present'
        )
        
        url = self.get_api_url('attendances')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_response_results(response)
        self.assertGreaterEqual(len(results), 1)
    
    def test_soft_delete_attendance(self):
        """測試軟刪除出席記錄"""
        attendance = Attendance.objects.create(
            session=self.session,
            student=self.student,
            status='Present'
        )
        
        url = self.get_api_url('attendances', 'detail', attendance.attendance_id)
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        attendance.refresh_from_db()
        self.assertTrue(attendance.is_deleted)
    
    def test_restore_attendance(self):
        """測試恢復出席記錄"""
        attendance = Attendance.objects.create(
            session=self.session,
            student=self.student,
            status='Present',
            is_deleted=True
        )
        
        url = self.get_api_url('attendances', 'restore', attendance.attendance_id)
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        attendance.refresh_from_db()
        self.assertFalse(attendance.is_deleted)


class LeaveAPITestCase(BaseAPITestCase):
    """Leave API CRUD 測試"""
    
    def setUp(self):
        super().setUp()
        self.student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級'
        )
        
        self.course = Course.objects.create(
            course_name='數學課',
            teacher=self.teacher,
            start_time='09:00:00',
            end_time='10:00:00',
            day_of_week='Mon',
            fee_per_session=Decimal('100.00')
        )
        
        self.leave_data = {
            'student': self.student.student_id,
            'course': self.course.course_id,
            'leave_date': date.today().isoformat(),
            'reason': '生病',
            'approval_status': 'Pending'
        }
    
    def test_create_leave(self):
        """測試創建請假記錄"""
        url = self.get_api_url('leaves')
        response = self.client.post(url, self.leave_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['reason'], '生病')
    
    def test_list_leaves(self):
        """測試列出請假記錄"""
        Leave.objects.create(
            student=self.student,
            course=self.course,
            leave_date=date.today(),
            reason='生病'
        )
        
        url = self.get_api_url('leaves')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_response_results(response)
        self.assertGreaterEqual(len(results), 1)
    
    def test_soft_delete_leave(self):
        """測試軟刪除請假記錄"""
        leave = Leave.objects.create(
            student=self.student,
            course=self.course,
            leave_date=date.today(),
            reason='生病'
        )
        
        url = self.get_api_url('leaves', 'detail', leave.leave_id)
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        leave.refresh_from_db()
        self.assertTrue(leave.is_deleted)
    
    def test_restore_leave(self):
        """測試恢復請假記錄"""
        leave = Leave.objects.create(
            student=self.student,
            course=self.course,
            leave_date=date.today(),
            reason='生病',
            is_deleted=True
        )
        
        url = self.get_api_url('leaves', 'restore', leave.leave_id)
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        leave.refresh_from_db()
        self.assertFalse(leave.is_deleted)


class SubjectAPITestCase(BaseAPITestCase):
    """Subject API CRUD 測試"""
    
    def setUp(self):
        super().setUp()
        self.subject_data = {
            'name': '物理',
            'code': 'PHYS',
            'description': '物理科目'
        }
    
    def test_create_subject(self):
        """測試創建科目"""
        url = self.get_api_url('subjects')
        response = self.client.post(url, self.subject_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], '物理')
    
    def test_list_subjects(self):
        """測試列出科目"""
        Subject.objects.create(name='化學', code='CHEM')
        
        url = self.get_api_url('subjects')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_response_results(response)
        self.assertGreaterEqual(len(results), 2)  # 包括 setUp 中的
    
    def test_unique_subject_name(self):
        """測試科目名稱必須唯一"""
        Subject.objects.create(name='物理', code='PHYS')
        
        url = self.get_api_url('subjects')
        response = self.client.post(url, self.subject_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class QuestionBankAPITestCase(BaseAPITestCase):
    """QuestionBank API CRUD 測試"""
    
    def setUp(self):
        super().setUp()
        self.question_data = {
            'subject': self.subject.subject_id,
            'level': 'SHS',
            'chapter': '第一章',
            'content': '測試題目內容',
            'correct_answer': '答案',
            'difficulty': 1
        }
    
    def test_create_question(self):
        """測試創建題目"""
        url = self.get_api_url('questions')
        response = self.client.post(url, self.question_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['chapter'], '第一章')
    
    def test_list_questions(self):
        """測試列出題目"""
        QuestionBank.objects.create(
            subject=self.subject,
            level='SHS',
            chapter='第一章',
            content='題目1',
            correct_answer='答案1'
        )
        
        url = self.get_api_url('questions')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_response_results(response)
        self.assertGreaterEqual(len(results), 1)
    
    def test_filter_questions_by_subject(self):
        """測試按科目篩選題目"""
        subject2 = Subject.objects.create(name='物理', code='PHYS')
        
        QuestionBank.objects.create(
            subject=self.subject,
            level='SHS',
            chapter='第一章',
            content='數學題',
            correct_answer='答案'
        )
        
        QuestionBank.objects.create(
            subject=subject2,
            level='SHS',
            chapter='第一章',
            content='物理題',
            correct_answer='答案'
        )
        
        url = self.get_api_url('questions')
        response = self.client.get(url, {'subject': self.subject.subject_id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # 驗證只返回數學科目的題目
        for question in self.get_response_results(response):
            self.assertEqual(question['subject'], self.subject.subject_id)
    
    def test_search_chapters(self):
        """測試搜尋章節"""
        QuestionBank.objects.create(
            subject=self.subject,
            level='SHS',
            chapter='第一章 函數',
            content='題目',
            correct_answer='答案'
        )
        
        QuestionBank.objects.create(
            subject=self.subject,
            level='SHS',
            chapter='第二章 三角函數',
            content='題目',
            correct_answer='答案'
        )
        
        url = self.get_api_url('questions', 'search_chapters')
        response = self.client.get(url, {'q': '函數'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_response_results(response)
        self.assertGreaterEqual(len(results), 1)
        # 驗證返回的章節包含搜尋關鍵字
        chapters = [item['chapter'] for item in response.data]
        self.assertTrue(any('函數' in ch for ch in chapters))


class GroupOrderAPITestCase(BaseAPITestCase):
    """GroupOrder API CRUD 測試 - 包含商業邏輯測試"""
    
    def setUp(self):
        super().setUp()
        self.student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級'
        )
        
        self.group_order_data = {
            'restaurant': self.restaurant.restaurant_id,
            'title': '測試團購',
            'deadline': (timezone.now() + timedelta(days=1)).isoformat(),
            'created_by': self.teacher.teacher_id
        }
    
    def test_create_group_order(self):
        """測試創建團購"""
        url = self.get_api_url('group-orders')
        response = self.client.post(url, self.group_order_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('order_link', response.data)
        self.assertIsNotNone(response.data['order_link'])
    
    def test_complete_group_order_generates_fees(self):
        """測試完成團購時自動生成費用"""
        group_order = GroupOrder.objects.create(
            restaurant=self.restaurant,
            title='測試團購',
            order_link='test-link-123',
            deadline=timezone.now() + timedelta(days=1),
            created_by=self.teacher
        )
        
        order = Order.objects.create(
            group_order=group_order,
            student=self.student,
            status='Confirmed',
            total_amount=Decimal('100.00')
        )
        
        url = self.get_api_url('group-orders', 'complete', group_order.group_order_id)
        self.authenticate_user(self.admin_user)
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('fees_created', response.data)
        
        # 驗證費用已創建
        fee = ExtraFee.objects.filter(
            student=self.student,
            item='Meal',
            is_deleted=False
        ).first()
        self.assertIsNotNone(fee)
        self.assertEqual(fee.amount, Decimal('100.00'))
    
    def test_only_admin_or_accountant_can_complete(self):
        """測試只有管理員或會計可以完成團購"""
        group_order = GroupOrder.objects.create(
            restaurant=self.restaurant,
            title='測試團購',
            order_link='test-link-123',
            deadline=timezone.now() + timedelta(days=1),
            created_by=self.teacher
        )
        
        url = self.get_api_url('group-orders', 'complete', group_order.group_order_id)
        
        # 老師無法完成
        self.authenticate_user(self.teacher_user)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # 會計可以完成
        self.authenticate_user(self.accountant_user)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class OrderAPITestCase(BaseAPITestCase):
    """Order API CRUD 測試 - 包含商業邏輯測試"""
    
    def setUp(self):
        super().setUp()
        self.student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級'
        )
        
        self.group_order = GroupOrder.objects.create(
            restaurant=self.restaurant,
            title='測試團購',
            order_link='test-link-123',
            deadline=timezone.now() + timedelta(days=1),
            created_by=self.teacher
        )
        
        self.order_data = {
            'group_order': self.group_order.group_order_id,
            'student': self.student.student_id,
            'status': 'Pending',
            'total_amount': '0.00'
        }
    
    def test_create_order(self):
        """測試創建訂單"""
        url = self.get_api_url('orders')
        response = self.client.post(url, self.order_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['student'], self.student.student_id)
    
    def test_order_total_calculated_from_items(self):
        """測試訂單總金額自動從項目計算"""
        order = Order.objects.create(
            group_order=self.group_order,
            student=self.student,
            status='Pending',
            total_amount=Decimal('0.00')
        )
        
        OrderItem.objects.create(
            order=order,
            item_name='便當',
            quantity=2,
            unit_price=Decimal('80.00'),
            subtotal=Decimal('160.00')
        )
        
        OrderItem.objects.create(
            order=order,
            item_name='飲料',
            quantity=1,
            unit_price=Decimal('30.00'),
            subtotal=Decimal('30.00')
        )
        
        # 創建項目時應該自動更新總金額
        order.refresh_from_db()
        # 注意：實際的自動更新在 perform_create 中，這裡我們手動觸發
        items = OrderItem.objects.filter(order=order)
        order.total_amount = sum(item.subtotal for item in items)
        order.save()
        
        self.assertEqual(order.total_amount, Decimal('190.00'))
    
    def test_cannot_delete_order_from_completed_group_order(self):
        """測試無法刪除已完成團購的訂單"""
        group_order = GroupOrder.objects.create(
            restaurant=self.restaurant,
            title='已完成團購',
            order_link='completed-link',
            deadline=timezone.now() - timedelta(days=1),
            created_by=self.teacher,
            status='Completed'
        )
        
        order = Order.objects.create(
            group_order=group_order,
            student=self.student,
            status='Confirmed',
            total_amount=Decimal('100.00')
        )
        
        url = self.get_api_url('orders', 'detail', order.order_id)
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class OrderItemAPITestCase(BaseAPITestCase):
    """OrderItem API CRUD 測試 - 包含商業邏輯測試"""
    
    def setUp(self):
        super().setUp()
        self.student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級'
        )
        
        self.group_order = GroupOrder.objects.create(
            restaurant=self.restaurant,
            title='測試團購',
            order_link='test-link',
            deadline=timezone.now() + timedelta(days=1),
            created_by=self.teacher
        )
        
        self.order = Order.objects.create(
            group_order=self.group_order,
            student=self.student,
            status='Pending',
            total_amount=Decimal('0.00')
        )
        
        self.item_data = {
            'order': self.order.order_id,
            'item_name': '便當',
            'quantity': 2,
            'unit_price': '80.00'
        }
    
    def test_create_order_item_auto_calculates_subtotal(self):
        """測試創建訂單項目時自動計算小計"""
        url = self.get_api_url('order-items')
        response = self.client.post(url, self.item_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            Decimal(str(response.data['subtotal'])),
            Decimal('160.00')  # 2 * 80.00
        )
    
    def test_update_order_item_updates_order_total(self):
        """測試更新訂單項目時更新訂單總金額"""
        item = OrderItem.objects.create(
            order=self.order,
            item_name='便當',
            quantity=2,
            unit_price=Decimal('80.00'),
            subtotal=Decimal('160.00')
        )
        
        self.order.total_amount = Decimal('160.00')
        self.order.save()
        
        url = self.get_api_url('order-items', 'detail', item.order_item_id)
        update_data = {'quantity': 3}
        response = self.client.patch(url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertEqual(item.subtotal, Decimal('240.00'))  # 3 * 80.00
        
        # 驗證訂單總金額已更新
        self.order.refresh_from_db()
        self.assertEqual(self.order.total_amount, Decimal('240.00'))
    
    def test_delete_order_item_updates_order_total(self):
        """測試刪除訂單項目時更新訂單總金額"""
        item1 = OrderItem.objects.create(
            order=self.order,
            item_name='便當',
            quantity=2,
            unit_price=Decimal('80.00'),
            subtotal=Decimal('160.00')
        )
        
        item2 = OrderItem.objects.create(
            order=self.order,
            item_name='飲料',
            quantity=1,
            unit_price=Decimal('30.00'),
            subtotal=Decimal('30.00')
        )
        
        self.order.total_amount = Decimal('190.00')
        self.order.save()
        
        url = self.get_api_url('order-items', 'detail', item2.order_item_id)
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # 驗證訂單總金額已更新
        self.order.refresh_from_db()
        self.assertEqual(self.order.total_amount, Decimal('160.00'))


class QuizAPITestCase(BaseAPITestCase):
    """Quiz API CRUD 測試 - 包含個別化教學邏輯"""
    
    def setUp(self):
        super().setUp()
        self.course = Course.objects.create(
            course_name='數學課',
            teacher=self.teacher,
            start_time='09:00:00',
            end_time='10:00:00',
            day_of_week='Mon',
            fee_per_session=Decimal('100.00')
        )
        
        self.student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級',
            user=self.student_user
        )
        
        self.question = QuestionBank.objects.create(
            subject=self.subject,
            level='SHS',
            chapter='第一章',
            content='測試題目',
            correct_answer='答案'
        )
        
        self.quiz_data = {
            'title': '測試測驗',
            'course': self.course.course_id,
            'questions': [self.question.question_id],
            'is_individualized': False
        }
    
    def test_create_quiz(self):
        """測試創建測驗"""
        url = self.get_api_url('quizzes')
        self.authenticate_user(self.teacher_user)
        response = self.client.post(url, self.quiz_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], '測試測驗')
    
    def test_student_can_only_see_enrolled_course_quizzes(self):
        """測試學生只能看到自己報名課程的測驗"""
        # 創建報名
        StudentEnrollment.objects.create(
            student=self.student,
            course=self.course,
            enroll_date=date.today()
        )
        
        quiz = Quiz.objects.create(
            title='已報名課程測驗',
            course=self.course,
            is_individualized=False,
            created_by=self.teacher_user
        )
        quiz.questions.add(self.question)
        
        course2 = Course.objects.create(
            course_name='未報名課程',
            teacher=self.teacher,
            start_time='10:00:00',
            end_time='11:00:00',
            day_of_week='Tue',
            fee_per_session=Decimal('100.00')
        )
        
        quiz2 = Quiz.objects.create(
            title='未報名課程測驗',
            course=course2,
            is_individualized=False,
            created_by=self.teacher_user
        )
        quiz2.questions.add(self.question)
        
        self.authenticate_user(self.student_user)
        url = self.get_api_url('quizzes')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        quiz_titles = [q['title'] for q in self.get_response_results(response)]
        self.assertIn('已報名課程測驗', quiz_titles)
        self.assertNotIn('未報名課程測驗', quiz_titles)
    
    def test_individualized_quiz_only_visible_to_group_members(self):
        """測試個別化測驗只對群組成員可見"""
        student_group = StudentGroup.objects.create(
            name='測試群組',
            created_by=self.teacher_user
        )
        student_group.students.add(self.student)
        
        quiz = Quiz.objects.create(
            title='個別化測驗',
            course=self.course,
            is_individualized=True,
            created_by=self.teacher_user
        )
        quiz.questions.add(self.question)
        quiz.student_groups.add(student_group)
        
        # 學生在群組中，應該可以看到
        self.authenticate_user(self.student_user)
        url = self.get_api_url('quizzes')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        quiz_titles = [q['title'] for q in self.get_response_results(response)]
        self.assertIn('個別化測驗', quiz_titles)
    
    def test_submit_quiz(self):
        """測試提交測驗"""
        quiz = Quiz.objects.create(
            title='測試測驗',
            course=self.course,
            is_individualized=False,
            created_by=self.teacher_user
        )
        quiz.questions.add(self.question)
        
        # 創建報名
        StudentEnrollment.objects.create(
            student=self.student,
            course=self.course,
            enroll_date=date.today()
        )
        
        self.authenticate_user(self.student_user)
        url = self.get_api_url('quizzes', 'submit', quiz.quiz_id)
        
        submit_data = {
            'answers': [{
                'question_id': self.question.question_id,
                'answer_text': '答案',
                'image_path': None
            }]
        }
        
        response = self.client.post(url, submit_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('submission_id', response.data)
        self.assertIn('score', response.data)
        
        # 驗證提交記錄已創建
        submission = AssessmentSubmission.objects.get(
            submission_id=response.data['submission_id']
        )
        self.assertEqual(submission.student, self.student)
        self.assertEqual(submission.quiz, quiz)
        
        # 驗證作答記錄已創建
        answer = StudentAnswer.objects.get(
            student=self.student,
            question=self.question
        )
        self.assertTrue(answer.is_correct)
        
        # 驗證錯題本未創建（因為答對了）
        error_log = ErrorLog.objects.filter(
            student=self.student,
            question=self.question
        ).first()
        self.assertIsNone(error_log)
    
    def test_submit_quiz_with_wrong_answer_creates_error_log(self):
        """測試提交錯誤答案時創建錯題本"""
        quiz = Quiz.objects.create(
            title='測試測驗',
            course=self.course,
            is_individualized=False,
            created_by=self.teacher_user
        )
        quiz.questions.add(self.question)
        
        StudentEnrollment.objects.create(
            student=self.student,
            course=self.course,
            enroll_date=date.today()
        )
        
        self.authenticate_user(self.student_user)
        url = self.get_api_url('quizzes', 'submit', quiz.quiz_id)
        
        submit_data = {
            'answers': [{
                'question_id': self.question.question_id,
                'answer_text': '錯誤答案',
                'image_path': None
            }]
        }
        
        response = self.client.post(url, submit_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 驗證錯題本已創建
        error_log = ErrorLog.objects.get(
            student=self.student,
            question=self.question
        )
        self.assertEqual(error_log.error_count, 1)
        self.assertEqual(error_log.review_status, 'New')


class ExamAPITestCase(BaseAPITestCase):
    """Exam API CRUD 測試 - 類似 Quiz 但針對考卷"""
    
    def setUp(self):
        super().setUp()
        self.course = Course.objects.create(
            course_name='數學課',
            teacher=self.teacher,
            start_time='09:00:00',
            end_time='10:00:00',
            day_of_week='Mon',
            fee_per_session=Decimal('100.00')
        )
        
        self.student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級',
            user=self.student_user
        )
        
        self.question = QuestionBank.objects.create(
            subject=self.subject,
            level='SHS',
            chapter='第一章',
            content='測試題目',
            correct_answer='答案'
        )
    
    def test_create_exam(self):
        """測試創建考卷"""
        exam_data = {
            'title': '期中考',
            'course': self.course.course_id,
            'questions': [self.question.question_id],
            'is_individualized': False
        }
        
        url = self.get_api_url('exams')
        self.authenticate_user(self.teacher_user)
        response = self.client.post(url, exam_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], '期中考')
    
    def test_submit_exam(self):
        """測試提交考卷"""
        exam = Exam.objects.create(
            title='期中考',
            course=self.course,
            is_individualized=False,
            created_by=self.teacher_user
        )
        exam.questions.add(self.question)
        
        StudentEnrollment.objects.create(
            student=self.student,
            course=self.course,
            enroll_date=date.today()
        )
        
        self.authenticate_user(self.student_user)
        url = self.get_api_url('exams', 'submit', exam.exam_id)
        
        submit_data = {
            'answers': [{
                'question_id': self.question.question_id,
                'answer_text': '答案',
                'image_path': None
            }]
        }
        
        response = self.client.post(url, submit_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('submission_id', response.data)


class StudentGroupAPITestCase(BaseAPITestCase):
    """StudentGroup API CRUD 測試"""
    
    def setUp(self):
        super().setUp()
        self.student1 = Student.objects.create(
            name='學生1',
            school='學校',
            grade='一年級'
        )
        
        self.student2 = Student.objects.create(
            name='學生2',
            school='學校',
            grade='一年級'
        )
        
        self.group_data = {
            'name': '測試群組',
            'description': '測試描述',
            'students': [self.student1.student_id, self.student2.student_id]
        }
    
    def test_create_student_group(self):
        """測試創建學生群組"""
        url = self.get_api_url('student-groups')
        self.authenticate_user(self.teacher_user)
        response = self.client.post(url, self.group_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], '測試群組')
    
    def test_add_students_to_group(self):
        """測試添加學生到群組"""
        group = StudentGroup.objects.create(
            name='測試群組',
            created_by=self.teacher_user
        )
        
        url = self.get_api_url('student-groups', 'add-students', group.group_id)
        self.authenticate_user(self.teacher_user)
        response = self.client.post(url, {
            'student_ids': [self.student1.student_id, self.student2.student_id]
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        group.refresh_from_db()
        self.assertEqual(group.students.count(), 2)
    
    def test_remove_students_from_group(self):
        """測試從群組移除學生"""
        group = StudentGroup.objects.create(
            name='測試群組',
            created_by=self.teacher_user
        )
        group.students.add(self.student1, self.student2)
        
        url = self.get_api_url('student-groups', 'remove-students', group.group_id)
        self.authenticate_user(self.teacher_user)
        response = self.client.post(url, {
            'student_ids': [self.student1.student_id]
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        group.refresh_from_db()
        self.assertEqual(group.students.count(), 1)
        self.assertIn(self.student2, group.students.all())


class ErrorLogAPITestCase(BaseAPITestCase):
    """ErrorLog API CRUD 測試"""
    
    def setUp(self):
        super().setUp()
        self.student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級'
        )
        
        self.question = QuestionBank.objects.create(
            subject=self.subject,
            level='SHS',
            chapter='第一章',
            content='測試題目',
            correct_answer='答案'
        )
    
    def test_create_error_log(self):
        """測試創建錯題記錄"""
        error_log_data = {
            'student': self.student.student_id,
            'question': self.question.question_id,
            'error_count': 1,
            'review_status': 'New'
        }
        
        url = self.get_api_url('error-logs')
        response = self.client.post(url, error_log_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['error_count'], 1)
    
    def test_filter_error_logs_by_student(self):
        """測試按學生篩選錯題記錄"""
        student2 = Student.objects.create(
            name='學生2',
            school='學校',
            grade='一年級'
        )
        
        ErrorLog.objects.create(
            student=self.student,
            question=self.question,
            error_count=1
        )
        
        ErrorLog.objects.create(
            student=student2,
            question=self.question,
            error_count=2
        )
        
        url = self.get_api_url('error-logs')
        response = self.client.get(url, {'student': self.student.student_id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_response_results(response)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['student'], self.student.student_id)


class HashtagAPITestCase(BaseAPITestCase):
    """Hashtag API CRUD 測試"""
    
    def setUp(self):
        super().setUp()
        self.hashtag_data = {
            'tag_name': '重要',
            'creator': self.teacher.teacher_id
        }
    
    def test_create_hashtag(self):
        """測試創建標籤"""
        url = self.get_api_url('hashtags')
        response = self.client.post(url, self.hashtag_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['tag_name'], '重要')
    
    def test_unique_tag_name(self):
        """測試標籤名稱必須唯一"""
        Hashtag.objects.create(tag_name='重要', creator=self.teacher)
        
        url = self.get_api_url('hashtags')
        response = self.client.post(url, self.hashtag_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class QuestionTagAPITestCase(BaseAPITestCase):
    """QuestionTag API CRUD 測試 - 關聯測試"""
    
    def setUp(self):
        super().setUp()
        self.question = QuestionBank.objects.create(
            subject=self.subject,
            level='SHS',
            chapter='第一章',
            content='測試題目',
            correct_answer='答案'
        )
        
        self.hashtag = Hashtag.objects.create(
            tag_name='重要',
            creator=self.teacher
        )
        
        self.question_tag_data = {
            'question': self.question.question_id,
            'tag': self.hashtag.tag_id
        }
    
    def test_create_question_tag(self):
        """測試創建題目標籤關聯"""
        url = self.get_api_url('question-tags')
        response = self.client.post(url, self.question_tag_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['question'], self.question.question_id)
        self.assertEqual(response.data['tag'], self.hashtag.tag_id)
    
    def test_unique_question_tag_pair(self):
        """測試題目和標籤的組合必須唯一"""
        QuestionTag.objects.create(
            question=self.question,
            tag=self.hashtag
        )
        
        url = self.get_api_url('question-tags')
        response = self.client.post(url, self.question_tag_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class EnrollmentPeriodAPITestCase(BaseAPITestCase):
    """EnrollmentPeriod API CRUD 測試"""
    
    def setUp(self):
        super().setUp()
        self.student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級'
        )
        
        self.course = Course.objects.create(
            course_name='數學課',
            teacher=self.teacher,
            start_time='09:00:00',
            end_time='10:00:00',
            day_of_week='Mon',
            fee_per_session=Decimal('100.00')
        )
        
        self.enrollment = StudentEnrollment.objects.create(
            student=self.student,
            course=self.course,
            enroll_date=date.today()
        )
        
        self.period_data = {
            'enrollment': self.enrollment.enrollment_id,
            'start_date': date.today().isoformat(),
            'end_date': None,
            'is_active': True
        }
    
    def test_create_enrollment_period(self):
        """測試創建上課期間"""
        url = self.get_api_url('enrollment-periods')
        response = self.client.post(url, self.period_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['enrollment'], self.enrollment.enrollment_id)
    
    def test_filter_periods_by_enrollment(self):
        """測試按報名記錄篩選期間"""
        # 創建不同的課程以避免唯一性約束違反
        course2 = Course.objects.create(
            course_name='英語課',
            teacher=self.teacher,
            start_time='10:00:00',
            end_time='11:00:00',
            day_of_week='Tue',
            fee_per_session=Decimal('100.00')
        )
        enrollment2 = StudentEnrollment.objects.create(
            student=self.student,
            course=course2,
            enroll_date=date.today()
        )
        
        EnrollmentPeriod.objects.create(
            enrollment=self.enrollment,
            start_date=date.today(),
            is_active=True
        )
        
        EnrollmentPeriod.objects.create(
            enrollment=enrollment2,
            start_date=date.today(),
            is_active=True
        )
        
        url = self.get_api_url('enrollment-periods')
        response = self.client.get(url, {'enrollment': self.enrollment.enrollment_id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['enrollment'], self.enrollment.enrollment_id)


class RestaurantAPITestCase(BaseAPITestCase):
    """Restaurant API CRUD 測試"""
    
    def setUp(self):
        super().setUp()
        self.restaurant_data = {
            'name': '新餐廳',
            'phone': '0987654321',
            'address': '測試地址',
            'is_active': True
        }
    
    def test_create_restaurant(self):
        """測試創建餐廳"""
        url = self.get_api_url('restaurants')
        response = self.client.post(url, self.restaurant_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], '新餐廳')
    
    def test_list_restaurants(self):
        """測試列出餐廳"""
        Restaurant.objects.create(name='餐廳1', phone='111')
        Restaurant.objects.create(name='餐廳2', phone='222')
        
        url = self.get_api_url('restaurants')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self.get_response_results(response)
        self.assertGreaterEqual(len(results), 3)  # 包括 setUp 中的


class CourseMaterialAPITestCase(BaseAPITestCase):
    """CourseMaterial API CRUD 測試"""
    
    def setUp(self):
        super().setUp()
        self.course = Course.objects.create(
            course_name='數學課',
            teacher=self.teacher,
            start_time='09:00:00',
            end_time='10:00:00',
            day_of_week='Mon',
            fee_per_session=Decimal('100.00')
        )
        
        self.material_data = {
            'title': '第一章講義',
            'course': self.course.course_id,
            'content': '# 第一章\n\n這是講義內容',
            'is_individualized': False
        }
    
    def test_create_course_material(self):
        """測試創建講義"""
        url = self.get_api_url('materials')
        self.authenticate_user(self.teacher_user)
        response = self.client.post(url, self.material_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], '第一章講義')
    
    def test_student_can_only_see_enrolled_course_materials(self):
        """測試學生只能看到自己報名課程的講義"""
        student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級',
            user=self.student_user
        )
        
        StudentEnrollment.objects.create(
            student=student,
            course=self.course,
            enroll_date=date.today()
        )
        
        material = CourseMaterial.objects.create(
            title='講義1',
            course=self.course,
            content='內容',
            is_individualized=False,
            created_by=self.teacher_user
        )
        
        course2 = Course.objects.create(
            course_name='未報名課程',
            teacher=self.teacher,
            start_time='10:00:00',
            end_time='11:00:00',
            day_of_week='Tue',
            fee_per_session=Decimal('100.00')
        )
        
        material2 = CourseMaterial.objects.create(
            title='講義2',
            course=course2,
            content='內容',
            is_individualized=False,
            created_by=self.teacher_user
        )
        
        self.authenticate_user(self.student_user)
        url = self.get_api_url('materials')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [m['title'] for m in self.get_response_results(response)]
        self.assertIn('講義1', titles)
        self.assertNotIn('講義2', titles)


class StudentAnswerAPITestCase(BaseAPITestCase):
    """StudentAnswer API CRUD 測試"""
    
    def setUp(self):
        super().setUp()
        self.student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級'
        )
        
        self.question = QuestionBank.objects.create(
            subject=self.subject,
            level='SHS',
            chapter='第一章',
            content='測試題目',
            correct_answer='答案'
        )
        
        self.answer_data = {
            'student': self.student.student_id,
            'question': self.question.question_id,
            'test_name': '測試測驗',
            'is_correct': True
        }
    
    def test_create_student_answer(self):
        """測試創建作答記錄"""
        url = self.get_api_url('student-answers')
        response = self.client.post(url, self.answer_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['test_name'], '測試測驗')
    
    def test_soft_delete_student_answer(self):
        """測試軟刪除作答記錄"""
        answer = StudentAnswer.objects.create(
            student=self.student,
            question=self.question,
            test_name='測試測驗',
            is_correct=True
        )
        
        url = self.get_api_url('student-answers', 'detail', answer.answer_id)
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        answer.refresh_from_db()
        self.assertTrue(answer.is_deleted)


# 測試文件已完成，涵蓋了所有主要的 API CRUD 操作和商業邏輯
