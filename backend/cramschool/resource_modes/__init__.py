# resource_modes/__init__.py
from .registry import ModeRegistry
from .base import ResourceModeHandler
from .handout import HandoutModeHandler
from .online_quiz import OnlineQuizModeHandler

# 自動註冊模式處理器
ModeRegistry.register(HandoutModeHandler)
ModeRegistry.register(OnlineQuizModeHandler)

__all__ = ['ModeRegistry', 'ResourceModeHandler', 'HandoutModeHandler', 'OnlineQuizModeHandler']
