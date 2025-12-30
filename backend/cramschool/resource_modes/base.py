# resource_modes/base.py
"""
資源模式處理器基類
所有模式處理器都應該繼承此基類並實作必要的方法
"""


class ResourceModeHandler:
    """資源模式處理器基類"""
    
    mode_name = None  # 子類必須定義
    
    def validate_settings(self, settings):
        """
        驗證模式特定設定
        
        Args:
            settings: 設定字典
            
        Returns:
            tuple: (is_valid, error_message)
        """
        raise NotImplementedError("子類必須實作 validate_settings 方法")
    
    def process_structure(self, structure):
        """
        處理內容結構
        
        Args:
            structure: 內容結構列表
            
        Returns:
            dict: 處理後的結構資料
        """
        raise NotImplementedError("子類必須實作 process_structure 方法")
    
    def generate_output(self, resource, format_type=None):
        """
        生成輸出（PDF/HTML等）
        
        Args:
            resource: LearningResource 實例
            format_type: 輸出格式類型（可選）
            
        Returns:
            bytes or str: 生成的輸出內容
        """
        raise NotImplementedError("子類必須實作 generate_output 方法")
    
    def grade_submission(self, resource, submission):
        """
        評分提交（如果適用）
        
        Args:
            resource: LearningResource 實例
            submission: 學生提交的答案
            
        Returns:
            dict: 評分結果
        """
        raise NotImplementedError("子類必須實作 grade_submission 方法（如果不適用可返回 None）")
    
    def get_default_settings(self):
        """
        獲取預設設定
        
        Returns:
            dict: 預設設定字典
        """
        return {}
