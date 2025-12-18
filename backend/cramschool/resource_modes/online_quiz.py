# resource_modes/online_quiz.py
"""
線上測驗模式處理器
用於處理自動評分的線上測驗模式
"""

from .base import ResourceModeHandler
from django.db.models import Q
from cramschool.models import QuestionBank


class OnlineQuizModeHandler(ResourceModeHandler):
    """線上測驗模式處理器"""
    
    mode_name = 'ONLINE_QUIZ'
    
    def validate_settings(self, settings):
        """
        驗證線上測驗模式設定
        
        預期設定結構：
        {
            "onlineQuiz": {
                "timeLimit": 3600,  # 秒
                "autoGrade": true,
                "showAnswerAfterSubmit": true,
                "allowRetake": false,
                "shuffleQuestions": false,
                "shuffleOptions": false
            }
        }
        """
        if 'onlineQuiz' not in settings:
            return False, "缺少 onlineQuiz 設定"
        
        quiz_settings = settings['onlineQuiz']
        
        # 驗證時間限制
        if 'timeLimit' in quiz_settings:
            if not isinstance(quiz_settings['timeLimit'], int) or quiz_settings['timeLimit'] < 0:
                return False, "timeLimit 必須是非負整數（秒）"
        
        # 驗證布林值
        bool_fields = ['autoGrade', 'showAnswerAfterSubmit', 'allowRetake', 'shuffleQuestions', 'shuffleOptions']
        for field in bool_fields:
            if field in quiz_settings:
                if not isinstance(quiz_settings[field], bool):
                    return False, f"{field} 必須是布林值"
        
        return True, None
    
    def process_structure(self, structure):
        """
        處理線上測驗模式的內容結構
        線上測驗模式只支援選擇題和多選題
        """
        processed = {
            'blocks': [],
            'total_questions': 0,
            'gradable_questions': 0,
            'ungradable_questions': 0
        }
        
        for block in structure:
            if isinstance(block, dict):
                block_type = block.get('type')
                if block_type == 'question':
                    question_id = block.get('question_id')
                    try:
                        question = QuestionBank.objects.get(question_id=question_id)
                        # 檢查題目類型是否支援自動評分
                        if question.question_type in ['SINGLE_CHOICE', 'MULTIPLE_CHOICE']:
                            processed['blocks'].append({
                                'type': 'question',
                                'question_id': question_id,
                                'question_type': question.question_type,
                                'id': block.get('id'),
                                'gradable': True
                            })
                            processed['gradable_questions'] += 1
                        else:
                            # 填充題等不支援自動評分
                            processed['blocks'].append({
                                'type': 'question',
                                'question_id': question_id,
                                'question_type': question.question_type,
                                'id': block.get('id'),
                                'gradable': False
                            })
                            processed['ungradable_questions'] += 1
                        processed['total_questions'] += 1
                    except QuestionBank.DoesNotExist:
                        # 題目不存在，跳過
                        continue
        
        return processed
    
    def generate_output(self, resource, format_type=None):
        """
        生成線上測驗輸出（HTML格式，用於學生作答）
        """
        output_data = {
            'title': resource.title,
            'mode': 'ONLINE_QUIZ',
            'structure': resource.structure,
            'settings': resource.settings.get('onlineQuiz', {})
        }
        
        return output_data
    
    def grade_submission(self, resource, submission):
        """
        評分學生提交的答案
        
        Args:
            resource: LearningResource 實例
            submission: 學生提交的答案字典
                {
                    "question_id": "answer",
                    ...
                }
        
        Returns:
            dict: 評分結果
                {
                    "total_questions": 10,
                    "correct_count": 8,
                    "score": 80.0,
                    "details": [
                        {
                            "question_id": 123,
                            "correct": true,
                            "student_answer": "A",
                            "correct_answer": "A"
                        },
                        ...
                    ]
                }
        """
        from cramschool.models import QuestionBank
        
        results = {
            'total_questions': 0,
            'gradable_questions': 0,
            'correct_count': 0,
            'score': 0.0,
            'details': []
        }
        
        # 處理結構中的題目
        for block in resource.structure:
            if isinstance(block, dict) and block.get('type') == 'question':
                question_id = block.get('question_id')
                results['total_questions'] += 1
                
                try:
                    question = QuestionBank.objects.get(question_id=question_id)
                    
                    # 只評分選擇題和多選題
                    if question.question_type in ['SINGLE_CHOICE', 'MULTIPLE_CHOICE']:
                        results['gradable_questions'] += 1
                        student_answer = submission.get(str(question_id))
                        correct_answer = question.correct_answer
                        
                        # 比對答案
                        is_correct = self._compare_answers(
                            question.question_type,
                            student_answer,
                            correct_answer
                        )
                        
                        if is_correct:
                            results['correct_count'] += 1
                        
                        results['details'].append({
                            'question_id': question_id,
                            'question_type': question.question_type,
                            'correct': is_correct,
                            'student_answer': student_answer,
                            'correct_answer': correct_answer,
                            'gradable': True
                        })
                    else:
                        # 填充題等不計分，只顯示參考答案
                        results['details'].append({
                            'question_id': question_id,
                            'question_type': question.question_type,
                            'correct': None,
                            'student_answer': submission.get(str(question_id)),
                            'correct_answer': question.correct_answer,
                            'gradable': False
                        })
                        
                except QuestionBank.DoesNotExist:
                    results['details'].append({
                        'question_id': question_id,
                        'error': '題目不存在'
                    })
        
        # 計算分數
        if results['gradable_questions'] > 0:
            results['score'] = (results['correct_count'] / results['gradable_questions']) * 100
        
        return results
    
    def _compare_answers(self, question_type, student_answer, correct_answer):
        """
        比對答案
        
        Args:
            question_type: 題目類型
            student_answer: 學生答案
            correct_answer: 正確答案
        
        Returns:
            bool: 是否正確
        """
        if question_type == 'SINGLE_CHOICE':
            # 單選題：精確比對
            return str(student_answer).strip().upper() == str(correct_answer).strip().upper()
        
        elif question_type == 'MULTIPLE_CHOICE':
            # 多選題：比對答案集合（順序無關）
            if isinstance(student_answer, list):
                student_set = set(str(a).strip().upper() for a in student_answer)
            else:
                student_set = {str(student_answer).strip().upper()}
            
            if isinstance(correct_answer, list):
                correct_set = set(str(a).strip().upper() for a in correct_answer)
            else:
                correct_set = {str(correct_answer).strip().upper()}
            
            return student_set == correct_set
        
        return False
    
    def get_default_settings(self):
        """獲取線上測驗模式預設設定"""
        return {
            'onlineQuiz': {
                'timeLimit': 3600,  # 1小時
                'autoGrade': True,
                'showAnswerAfterSubmit': True,
                'allowRetake': False,
                'shuffleQuestions': False,
                'shuffleOptions': False
            }
        }
