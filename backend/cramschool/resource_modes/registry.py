# resource_modes/registry.py
"""
模式註冊表
用於動態註冊和獲取模式處理器
"""


class ModeRegistry:
    """模式註冊表"""
    _handlers = {}
    
    @classmethod
    def register(cls, handler_class):
        """
        註冊模式處理器
        
        Args:
            handler_class: 模式處理器類（必須繼承 ResourceModeHandler）
        """
        handler = handler_class()
        if handler.mode_name is None:
            raise ValueError(f"處理器 {handler_class.__name__} 必須定義 mode_name")
        cls._handlers[handler.mode_name] = handler
    
    @classmethod
    def get_handler(cls, mode_name):
        """
        獲取模式處理器
        
        Args:
            mode_name: 模式名稱
            
        Returns:
            ResourceModeHandler: 模式處理器實例，如果不存在則返回 None
        """
        return cls._handlers.get(mode_name)
    
    @classmethod
    def get_all_modes(cls):
        """
        獲取所有已註冊的模式名稱
        
        Returns:
            list: 模式名稱列表
        """
        return list(cls._handlers.keys())
    
    @classmethod
    def is_mode_supported(cls, mode_name):
        """
        檢查模式是否已註冊
        
        Args:
            mode_name: 模式名稱
            
        Returns:
            bool: 是否支援
        """
        return mode_name in cls._handlers
