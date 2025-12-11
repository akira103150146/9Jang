from datetime import timedelta
from django.test import TestCase
from django.core.management import call_command
from django.utils import timezone
from io import StringIO

from cramschool.models import (
    Subject, QuestionBank, Restaurant, GroupOrder, Student, Teacher, Course
)
from account.models import CustomUser
from cramschool.management.commands.flush_db import sort_models_by_dependencies


class FlushDbCommandTest(TestCase):
    """測試 flush_db 管理命令"""

    def setUp(self):
        """設置測試數據"""
        # 創建用戶
        self.user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # 創建科目（父模型）
        self.subject = Subject.objects.create(
            name='數學',
            code='MATH'
        )
        
        # 創建題目庫（子模型，有 PROTECT 外鍵指向 Subject）
        self.question_bank = QuestionBank.objects.create(
            subject=self.subject,
            level='SHS',
            chapter='第一章',
            content='測試題目',
            correct_answer='答案'
        )
        
        # 創建店家（父模型）
        self.restaurant = Restaurant.objects.create(
            name='測試餐廳',
            phone='1234567890'
        )
        
        # 創建老師（用於 GroupOrder）
        self.teacher = Teacher.objects.create(
            name='測試老師',
            permission_level='Teacher'
        )
        
        # 創建團購（子模型，有 PROTECT 外鍵指向 Restaurant）
        self.group_order = GroupOrder.objects.create(
            restaurant=self.restaurant,
            title='測試團購',
            order_link='https://example.com/order',
            deadline=timezone.now() + timedelta(days=30),
            created_by=self.teacher
        )

    def test_sort_models_by_dependencies(self):
        """測試模型依賴關係排序函數"""
        models = [Subject, QuestionBank, Restaurant, GroupOrder]
        
        # 排序模型
        sorted_models = sort_models_by_dependencies(models)
        
        # 驗證排序結果：子模型應該在父模型之前
        subject_idx = sorted_models.index(Subject)
        question_bank_idx = sorted_models.index(QuestionBank)
        restaurant_idx = sorted_models.index(Restaurant)
        group_order_idx = sorted_models.index(GroupOrder)
        
        # QuestionBank 應該在 Subject 之前（因為 QuestionBank 依賴 Subject）
        self.assertLess(question_bank_idx, subject_idx,
                        'QuestionBank 應該在 Subject 之前刪除')
        
        # GroupOrder 應該在 Restaurant 之前（因為 GroupOrder 依賴 Restaurant）
        self.assertLess(group_order_idx, restaurant_idx,
                        'GroupOrder 應該在 Restaurant 之前刪除')

    def test_flush_db_deletes_all_data(self):
        """測試 flush_db 命令能正確刪除所有數據"""
        # 確認數據存在
        self.assertEqual(Subject.objects.count(), 1)
        self.assertEqual(QuestionBank.objects.count(), 1)
        self.assertEqual(Restaurant.objects.count(), 1)
        self.assertEqual(GroupOrder.objects.count(), 1)
        
        # 執行命令
        out = StringIO()
        call_command('flush_db', '--noinput', stdout=out)
        
        # 驗證數據已被刪除
        self.assertEqual(Subject.objects.count(), 0)
        self.assertEqual(QuestionBank.objects.count(), 0)
        self.assertEqual(Restaurant.objects.count(), 0)
        self.assertEqual(GroupOrder.objects.count(), 0)

    def test_flush_db_with_protect_foreign_keys(self):
        """測試 flush_db 命令能正確處理 PROTECT 外鍵關係"""
        # 確認數據存在
        self.assertEqual(Subject.objects.count(), 1)
        self.assertEqual(QuestionBank.objects.count(), 1)
        
        # 執行命令（應該不會因為 PROTECT 外鍵而失敗）
        out = StringIO()
        try:
            call_command('flush_db', '--noinput', stdout=out)
            success = True
        except Exception as e:
            success = False
            self.fail(f'flush_db 命令失敗，錯誤：{str(e)}')
        
        # 驗證命令成功執行
        self.assertTrue(success, 'flush_db 命令應該成功執行，即使有 PROTECT 外鍵關係')
        
        # 驗證數據已被刪除
        self.assertEqual(Subject.objects.count(), 0)
        self.assertEqual(QuestionBank.objects.count(), 0)

    def test_flush_db_keep_auth_option(self):
        """測試 --keep-auth 選項是否正確保留認證相關數據"""
        # 確認用戶存在
        self.assertEqual(CustomUser.objects.count(), 1)
        
        # 執行命令並保留認證數據
        out = StringIO()
        call_command('flush_db', '--noinput', '--keep-auth', stdout=out)
        
        # 驗證認證相關數據被保留
        self.assertEqual(CustomUser.objects.count(), 1,
                        'CustomUser 應該被保留')
        
        # 驗證其他數據被刪除
        self.assertEqual(Subject.objects.count(), 0)
        self.assertEqual(QuestionBank.objects.count(), 0)

    def test_flush_db_deletion_order(self):
        """測試刪除順序是否正確（先刪除子模型，再刪除父模型）"""
        # 驗證排序函數本身的正確性
        models = [Subject, QuestionBank, Restaurant, GroupOrder]
        sorted_models = sort_models_by_dependencies(models)
        
        # 獲取模型在排序列表中的索引
        subject_idx = sorted_models.index(Subject)
        question_bank_idx = sorted_models.index(QuestionBank)
        restaurant_idx = sorted_models.index(Restaurant)
        group_order_idx = sorted_models.index(GroupOrder)
        
        # 驗證排序順序：子模型應該在父模型之前
        self.assertLess(question_bank_idx, subject_idx,
                       'QuestionBank 應該在 Subject 之前刪除')
        self.assertLess(group_order_idx, restaurant_idx,
                       'GroupOrder 應該在 Restaurant 之前刪除')
        
        # 執行命令驗證不會因為順序錯誤而失敗
        out = StringIO()
        try:
            call_command('flush_db', '--noinput', stdout=out)
            success = True
        except Exception as e:
            success = False
            self.fail(f'flush_db 命令應該成功執行，錯誤：{str(e)}')
        
        self.assertTrue(success, 'flush_db 命令應該成功執行')

    def test_flush_db_empty_database(self):
        """測試在空數據庫上執行 flush_db 命令"""
        # 先清空數據庫
        out = StringIO()
        call_command('flush_db', '--noinput', stdout=out)
        
        # 再次執行命令（數據庫應該已經是空的）
        out2 = StringIO()
        try:
            call_command('flush_db', '--noinput', stdout=out2)
            success = True
        except Exception as e:
            success = False
            self.fail(f'在空數據庫上執行 flush_db 應該成功，錯誤：{str(e)}')
        
        self.assertTrue(success, '在空數據庫上執行 flush_db 應該成功')

    def test_flush_db_with_multiple_dependencies(self):
        """測試多層依賴關係的處理"""
        # 創建更多數據來測試複雜的依賴關係
        student = Student.objects.create(
            name='測試學生',
            school='測試學校',
            grade='一年級'
        )
        
        teacher = Teacher.objects.create(
            name='測試老師2',
            permission_level='Teacher'
        )
        
        course = Course.objects.create(
            course_name='測試課程',
            teacher=teacher,
            start_time='09:00:00',
            end_time='10:00:00',
            day_of_week='Mon',
            fee_per_session=100.00
        )
        
        # 執行命令
        out = StringIO()
        call_command('flush_db', '--noinput', stdout=out)
        
        # 驗證所有數據都被刪除
        self.assertEqual(Student.objects.count(), 0)
        self.assertEqual(Teacher.objects.count(), 0)
        self.assertEqual(Course.objects.count(), 0)
        self.assertEqual(Subject.objects.count(), 0)
        self.assertEqual(QuestionBank.objects.count(), 0)

    def test_sort_models_by_dependencies_with_no_protect(self):
        """測試沒有 PROTECT 關係的模型排序"""
        # 使用沒有 PROTECT 關係的模型
        models = [Student, Teacher]
        
        # 排序應該不會改變順序（因為沒有 PROTECT 關係）
        sorted_models = sort_models_by_dependencies(models)
        
        # 驗證所有模型都在結果中
        self.assertEqual(len(sorted_models), len(models))
        self.assertIn(Student, sorted_models)
        self.assertIn(Teacher, sorted_models)

    def test_sort_models_by_dependencies_empty_list(self):
        """測試空列表的排序"""
        models = []
        sorted_models = sort_models_by_dependencies(models)
        self.assertEqual(sorted_models, [])

    def test_sort_models_by_dependencies_single_model(self):
        """測試單個模型的排序"""
        models = [Subject]
        sorted_models = sort_models_by_dependencies(models)
        self.assertEqual(sorted_models, [Subject])
