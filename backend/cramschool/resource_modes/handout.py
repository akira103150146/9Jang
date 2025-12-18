# resource_modes/handout.py
"""
講義模式處理器
用於處理列印輸出為主的講義模式
"""

from .base import ResourceModeHandler


class HandoutModeHandler(ResourceModeHandler):
    """講義模式處理器"""
    
    mode_name = 'HANDOUT'
    
    def validate_settings(self, settings):
        """
        驗證講義模式設定
        
        預期設定結構：
        {
            "handout": {
                "paperSize": "A4" | "B4",
                "orientation": "portrait" | "landscape",
                "outputFormats": ["question_only", "question_solution_answer", "solution_only", "answer_only"],
                "margins": {"top": 20, "right": 20, "bottom": 20, "left": 20},
                "fontSize": 12,
                "lineHeight": 1.5
            }
        }
        """
        if 'handout' not in settings:
            return False, "缺少 handout 設定"
        
        handout_settings = settings['handout']
        
        # 驗證紙張大小
        if 'paperSize' in handout_settings:
            if handout_settings['paperSize'] not in ['A4', 'B4']:
                return False, "paperSize 必須是 A4 或 B4"
        
        # 驗證方向
        if 'orientation' in handout_settings:
            if handout_settings['orientation'] not in ['portrait', 'landscape']:
                return False, "orientation 必須是 portrait 或 landscape"
        
        # 驗證輸出格式
        if 'outputFormats' in handout_settings:
            valid_formats = ['question_only', 'question_solution_answer', 'solution_only', 'answer_only']
            if not all(fmt in valid_formats for fmt in handout_settings['outputFormats']):
                return False, f"outputFormats 必須是 {valid_formats} 的子集"
        
        return True, None
    
    def process_structure(self, structure):
        """
        處理講義模式的內容結構
        講義模式支援題目和模板區塊
        """
        processed = {
            'blocks': [],
            'total_questions': 0,
            'total_templates': 0
        }
        
        for block in structure:
            if isinstance(block, dict):
                block_type = block.get('type')
                if block_type == 'question':
                    processed['blocks'].append({
                        'type': 'question',
                        'question_id': block.get('question_id'),
                        'id': block.get('id')
                    })
                    processed['total_questions'] += 1
                elif block_type == 'template':
                    processed['blocks'].append({
                        'type': 'template',
                        'template_id': block.get('template_id'),
                        'id': block.get('id')
                    })
                    processed['total_templates'] += 1
                else:
                    # 其他類型的區塊（如文字區塊）
                    processed['blocks'].append(block)
        
        return processed
    
    def generate_output(self, resource, format_type='question_only'):
        """
        生成講義輸出
        
        Args:
            resource: LearningResource 實例
            format_type: 輸出格式類型
                - question_only: 僅題目
                - question_solution_answer: 題目+詳解+答案
                - solution_only: 僅詳解
                - answer_only: 僅答案
        """
        # TODO: 實作 PDF/HTML 生成邏輯
        # 這裡先返回一個簡單的結構
        output_data = {
            'title': resource.title,
            'format': format_type,
            'structure': resource.structure,
            'settings': resource.settings.get('handout', {})
        }
        
        return output_data
    
    def grade_submission(self, resource, submission):
        """
        講義模式不支援評分
        """
        return None
    
    def get_default_settings(self):
        """獲取講義模式預設設定"""
        return {
            'handout': {
                'paperSize': 'A4',
                'orientation': 'portrait',
                'outputFormats': ['question_only'],
                'margins': {
                    'top': 20,
                    'right': 20,
                    'bottom': 20,
                    'left': 20
                },
                'fontSize': 12,
                'lineHeight': 1.5
            }
        }
