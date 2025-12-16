"""
查詢優化測試文件
測試 ViewSet 中的 annotate 和 prefetch_related 優化是否正確工作
"""
from datetime import date, timedelta
from decimal import Decimal
from django.test import TestCase
from django.test.utils import override_settings
from django.db import connection
from django.db.models import Sum, Count
from django.utils import timezone
from rest_framework.test import APIClient, APIRequestFactory
from rest_framework import status

from cramschool.models import (
    Student, Teacher, Course, StudentEnrollment, ExtraFee,
    GroupOrder, Order, Restaurant
)
from account.models import CustomUser, UserRole


class QueryOptimizationTestCase(TestCase):
    """查詢優化測試基礎類"""
    
    @classmethod
    def setUpTestData(cls):
        """設置測試數據"""
        cls.admin_user = CustomUser.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='admin123',
            role=UserRole.ADMIN
        )
        
        cls.teacher = Teacher.objects.create(
            name='測試老師',
            permission_level='Teacher',
            user=cls.admin_user
        )
        
        cls.restaurant = Restaurant.objects.create(
            name='測試餐廳',
            phone='1234567890'
        )
    
    def setUp(self):
        """設置測試環境"""
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin_user)


class StudentQueryOptimizationTestCase(QueryOptimizationTestCase):
    """測試 StudentViewSet 的查詢優化"""
    
    def setUp(self):
        super().setUp()
        # 創建測試學生
        self.student1 = Student.objects.create(
            name='學生1',
            school='學校1',
            grade='一年級'
        )
        
        self.student2 = Student.objects.create(
            name='學生2',
            school='學校2',
            grade='二年級'
        )
        
        # 創建課程
        self.course1 = Course.objects.create(
            course_name='數學課',
            teacher=self.teacher,
            start_time='09:00:00',
            end_time='10:00:00',
            day_of_week='Mon',
            fee_per_session=Decimal('100.00')
        )
        
        self.course2 = Course.objects.create(
            course_name='英語課',
            teacher=self.teacher,
            start_time='10:00:00',
            end_time='11:00:00',
            day_of_week='Tue',
            fee_per_session=Decimal('120.00')
        )
        
        # 創建報名記錄
        self.enrollment1 = StudentEnrollment.objects.create(
            student=self.student1,
            course=self.course1,
            enroll_date=date.today()
        )
        
        self.enrollment2 = StudentEnrollment.objects.create(
            student=self.student1,
            course=self.course2,
            enroll_date=date.today()
        )
        
        self.enrollment3 = StudentEnrollment.objects.create(
            student=self.student2,
            course=self.course1,
            enroll_date=date.today(),
            is_deleted=True  # 已刪除的報名
        )
        
        # 創建費用記錄
        ExtraFee.objects.create(
            student=self.student1,
            item='Tuition',
            amount=Decimal('1000.00'),
            fee_date=date.today(),
            payment_status='Unpaid',
            is_deleted=False
        )
        
        ExtraFee.objects.create(
            student=self.student1,
            item='Tuition',
            amount=Decimal('500.00'),
            fee_date=date.today(),
            payment_status='Paid',
            is_deleted=False
        )
        
        ExtraFee.objects.create(
            student=self.student1,
            item='Meal',
            amount=Decimal('200.00'),
            fee_date=date.today(),
            payment_status='Partial',
            is_deleted=False
        )
        
        ExtraFee.objects.create(
            student=self.student1,
            item='Tuition',
            amount=Decimal('300.00'),
            fee_date=date.today(),
            payment_status='Unpaid',
            is_deleted=True  # 已刪除的費用
        )
        
        ExtraFee.objects.create(
            student=self.student2,
            item='Tuition',
            amount=Decimal('800.00'),
            fee_date=date.today(),
            payment_status='Unpaid',
            is_deleted=False
        )
    
    def test_annotate_total_fees(self):
        """測試 annotate 正確計算總費用"""
        # 直接測試 queryset 的 annotate
        from django.db.models import Sum, Q
        
        queryset = Student.objects.annotate(
            _total_fees=Sum(
                'extra_fees__amount',
                filter=Q(extra_fees__is_deleted=False)
            )
        )
        
        student1 = queryset.filter(student_id=self.student1.student_id).first()
        
        # 驗證 annotate 的值存在
        self.assertTrue(hasattr(student1, '_total_fees'))
        # 總費用應該是 1000 + 500 + 200 = 1700（不包括已刪除的 300）
        self.assertEqual(float(student1._total_fees or 0), 1700.0)
    
    def test_annotate_unpaid_fees(self):
        """測試 annotate 正確計算未繳費用"""
        from django.db.models import Sum, Q
        
        queryset = Student.objects.annotate(
            _unpaid_fees=Sum(
                'extra_fees__amount',
                filter=Q(
                    extra_fees__is_deleted=False,
                    extra_fees__payment_status__in=['Unpaid', 'Partial']
                )
            )
        )
        
        student1 = queryset.filter(student_id=self.student1.student_id).first()
        
        # 未繳費用應該是 Unpaid (1000) + Partial (200) = 1200
        self.assertTrue(hasattr(student1, '_unpaid_fees'))
        self.assertEqual(float(student1._unpaid_fees or 0), 1200.0)
    
    def test_annotate_enrollments_count(self):
        """測試 annotate 正確計算報名課程數量"""
        from django.db.models import Count, Q
        
        queryset = Student.objects.annotate(
            _enrollments_count=Count(
                'enrollments',
                filter=Q(enrollments__is_deleted=False)
            )
        )
        
        student1 = queryset.filter(student_id=self.student1.student_id).first()
        
        # 學生1應該有2個未刪除的報名
        self.assertTrue(hasattr(student1, '_enrollments_count'))
        self.assertEqual(student1._enrollments_count, 2)
    
    def test_query_count_optimization(self):
        """測試查詢數量優化（避免 N+1 問題）"""
        from django.db.models import Sum, Count, Q, Prefetch
        
        # 重置查詢計數
        connection.queries_log.clear()
        
        # 使用與 ViewSet 相同的優化查詢
        queryset = Student.objects.select_related('user').annotate(
            _total_fees=Sum('extra_fees__amount', filter=Q(extra_fees__is_deleted=False)),
            _unpaid_fees=Sum('extra_fees__amount', filter=Q(
                extra_fees__is_deleted=False,
                extra_fees__payment_status__in=['Unpaid', 'Partial']
            )),
            _enrollments_count=Count('enrollments', filter=Q(enrollments__is_deleted=False))
        ).filter(is_deleted=False).prefetch_related(
            Prefetch('enrollments', queryset=StudentEnrollment.objects.filter(is_deleted=False).select_related('course')),
            Prefetch('extra_fees', queryset=ExtraFee.objects.filter(is_deleted=False))
        )
        
        students = list(queryset[:10])  # 獲取前10個學生
        
        # 訪問關聯對象（這通常會觸發額外查詢）
        for student in students:
            list(student.enrollments.all())
            list(student.extra_fees.all())
        
        # 驗證查詢數量（應該只有少數幾個查詢，而不是 N+1）
        query_count = len(connection.queries)
        
        # 由於使用了 annotate 和 prefetch_related，查詢數量應該遠少於 N*M
        # 對於2個學生，應該只有幾個查詢（主查詢 + prefetch）
        self.assertLess(query_count, 10, 
                       f"查詢數量過多 ({query_count})，可能存在 N+1 問題")
    
    def test_api_endpoint_returns_correct_values(self):
        """測試 API 端點返回正確的聚合值"""
        url = '/api/cramschool/students/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 處理分頁響應
        if isinstance(response.data, dict) and 'results' in response.data:
            students = response.data['results']
        else:
            students = response.data if isinstance(response.data, list) else [response.data]
        
        # 驗證至少有一個學生
        self.assertGreater(len(students), 0)
        
        # 驗證第一個學生有聚合字段
        student_data = students[0]
        self.assertIn('total_fees', student_data)
        self.assertIn('unpaid_fees', student_data)
        self.assertIn('enrollments_count', student_data)
        self.assertIsInstance(student_data['total_fees'], (int, float))
        self.assertIsInstance(student_data['unpaid_fees'], (int, float))
        self.assertIsInstance(student_data['enrollments_count'], int)
        
        # 驗證值為非負數
        self.assertGreaterEqual(student_data['total_fees'], 0)
        self.assertGreaterEqual(student_data['unpaid_fees'], 0)
        self.assertGreaterEqual(student_data['enrollments_count'], 0)


class GroupOrderQueryOptimizationTestCase(QueryOptimizationTestCase):
    """測試 GroupOrderViewSet 的查詢優化"""
    
    def setUp(self):
        super().setUp()
        
        # 創建學生
        self.student1 = Student.objects.create(
            name='學生1',
            school='學校',
            grade='一年級'
        )
        
        self.student2 = Student.objects.create(
            name='學生2',
            school='學校',
            grade='二年級'
        )
        
        # 創建團購
        self.group_order1 = GroupOrder.objects.create(
            restaurant=self.restaurant,
            title='團購1',
            order_link='order-1',
            deadline=timezone.now() + timedelta(days=1),
            created_by=self.teacher,
            status='Open'
        )
        
        self.group_order2 = GroupOrder.objects.create(
            restaurant=self.restaurant,
            title='團購2',
            order_link='order-2',
            deadline=timezone.now() + timedelta(days=1),
            created_by=self.teacher,
            status='Open'
        )
        
        # 創建訂單
        Order.objects.create(
            group_order=self.group_order1,
            student=self.student1,
            status='Pending',
            total_amount=Decimal('100.00'),
            is_deleted=False
        )
        
        Order.objects.create(
            group_order=self.group_order1,
            student=self.student2,
            status='Confirmed',
            total_amount=Decimal('150.00'),
            is_deleted=False
        )
        
        Order.objects.create(
            group_order=self.group_order1,
            student=self.student1,
            status='Cancelled',  # 不應該計入
            total_amount=Decimal('200.00'),
            is_deleted=False
        )
        
        Order.objects.create(
            group_order=self.group_order1,
            student=self.student2,
            status='Pending',
            total_amount=Decimal('50.00'),
            is_deleted=True  # 已刪除，不應該計入
        )
        
        Order.objects.create(
            group_order=self.group_order2,
            student=self.student1,
            status='Confirmed',
            total_amount=Decimal('300.00'),
            is_deleted=False
        )
    
    def test_annotate_orders_count(self):
        """測試 annotate 正確計算訂單數量"""
        from django.db.models import Count, Q
        
        queryset = GroupOrder.objects.annotate(
            _orders_count=Count(
                'orders',
                filter=Q(orders__status__in=['Pending', 'Confirmed'], orders__is_deleted=False)
            )
        )
        
        group_order1 = queryset.filter(group_order_id=self.group_order1.group_order_id).first()
        
        # 應該有2個訂單（Pending 和 Confirmed，不包括 Cancelled 和已刪除的）
        self.assertTrue(hasattr(group_order1, '_orders_count'))
        self.assertEqual(group_order1._orders_count, 2)
    
    def test_annotate_total_amount(self):
        """測試 annotate 正確計算總金額"""
        from django.db.models import Sum, Q
        
        queryset = GroupOrder.objects.annotate(
            _total_amount=Sum(
                'orders__total_amount',
                filter=Q(orders__status__in=['Pending', 'Confirmed'], orders__is_deleted=False)
            )
        )
        
        group_order1 = queryset.filter(group_order_id=self.group_order1.group_order_id).first()
        
        # 總金額應該是 100 + 150 = 250（不包括 Cancelled 和已刪除的）
        self.assertTrue(hasattr(group_order1, '_total_amount'))
        self.assertEqual(float(group_order1._total_amount or 0), 250.0)
    
    def test_api_endpoint_returns_correct_values(self):
        """測試 API 端點返回正確的聚合值"""
        url = '/api/cramschool/group-orders/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 處理分頁響應
        if isinstance(response.data, dict) and 'results' in response.data:
            group_orders = response.data['results']
        else:
            group_orders = response.data if isinstance(response.data, list) else [response.data]
        
        # 找到團購1的數據
        group_order1_data = None
        for go in group_orders:
            if go['group_order_id'] == self.group_order1.group_order_id:
                group_order1_data = go
                break
        
        self.assertIsNotNone(group_order1_data)
        
        # 驗證聚合值
        self.assertEqual(group_order1_data['orders_count'], 2)
        self.assertEqual(group_order1_data['total_amount'], 250.0)


class PrefetchRelatedOptimizationTestCase(QueryOptimizationTestCase):
    """測試 prefetch_related 優化"""
    
    def setUp(self):
        super().setUp()
        
        self.student = Student.objects.create(
            name='測試學生',
            school='學校',
            grade='一年級',
            user=self.admin_user
        )
        
        self.course = Course.objects.create(
            course_name='數學課',
            teacher=self.teacher,
            start_time='09:00:00',
            end_time='10:00:00',
            day_of_week='Mon',
            fee_per_session=Decimal('100.00')
        )
        
        # 創建多個報名記錄（使用不同的課程以避免唯一性約束）
        courses = []
        for i in range(5):
            course = Course.objects.create(
                course_name=f'課程{i}',
                teacher=self.teacher,
                start_time='09:00:00',
                end_time='10:00:00',
                day_of_week='Mon',
                fee_per_session=Decimal('100.00')
            )
            courses.append(course)
            StudentEnrollment.objects.create(
                student=self.student,
                course=course,
                enroll_date=date.today() - timedelta(days=i)
            )
        
        # 創建多個費用記錄
        for i in range(5):
            ExtraFee.objects.create(
                student=self.student,
                item='Tuition',
                amount=Decimal(f'{100 * (i + 1)}.00'),
                fee_date=date.today() - timedelta(days=i),
                payment_status='Unpaid',
                is_deleted=False
            )
    
    def test_prefetch_related_reduces_queries(self):
        """測試 prefetch_related 減少查詢數量"""
        from django.db.models import Prefetch
        
        # 重置查詢計數
        connection.queries_log.clear()
        
        # 使用 prefetch_related 優化查詢
        queryset = Student.objects.prefetch_related(
            Prefetch('enrollments', queryset=StudentEnrollment.objects.filter(is_deleted=False).select_related('course')),
            Prefetch('extra_fees', queryset=ExtraFee.objects.filter(is_deleted=False))
        )
        
        student = queryset.filter(student_id=self.student.student_id).first()
        
        # 訪問關聯對象（這通常會觸發額外查詢）
        enrollments = list(student.enrollments.all())
        fees = list(student.extra_fees.all())
        
        # 驗證查詢數量
        query_count = len(connection.queries)
        
        # 由於使用了 prefetch_related，訪問關聯對象不應該產生額外查詢
        # 應該只有主查詢和 prefetch 查詢
        self.assertLess(query_count, 5, 
                       f"查詢數量過多 ({query_count})，prefetch_related 可能沒有生效")
        
        # 驗證數據正確
        self.assertEqual(len(enrollments), 5)
        self.assertEqual(len(fees), 5)

