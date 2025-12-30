"""
Google Cloud Secret Manager 工具函數
用於在生產環境中安全地讀取敏感配置
"""
import os
from typing import Optional

def get_secret_from_manager(secret_id: str, project_id: Optional[str] = None, default: Optional[str] = None) -> Optional[str]:
    """
    從 Google Cloud Secret Manager 讀取密鑰
    
    Args:
        secret_id: Secret 的名稱（例如 'django-secret-key'）
        project_id: GCP 專案 ID（如果為 None，從環境變數 GOOGLE_CLOUD_PROJECT 讀取）
        default: 如果讀取失敗或不在 GCP 環境中，返回的默認值
    
    Returns:
        Secret 的值，如果讀取失敗返回 default
    """
    # 如果不是生產環境或未啟用 Secret Manager，直接返回默認值
    use_secret_manager = os.getenv('USE_SECRET_MANAGER', 'False').lower() == 'true'
    if not use_secret_manager:
        return default
    
    try:
        from google.cloud import secretmanager
        
        # 獲取專案 ID
        if not project_id:
            project_id = os.getenv('GOOGLE_CLOUD_PROJECT') or os.getenv('GCP_PROJECT_ID')
        
        if not project_id:
            if default is not None:
                return default
            raise ValueError("未設置 GOOGLE_CLOUD_PROJECT 或 GCP_PROJECT_ID")
        
        # 創建 Secret Manager 客戶端
        client = secretmanager.SecretManagerServiceClient()
        
        # 構建 secret 名稱
        name = f"projects/{project_id}/secrets/{secret_id}/versions/latest"
        
        # 訪問 secret
        response = client.access_secret_version(request={"name": name})
        
        # 返回 secret 的值（去除可能的換行符）
        secret_value = response.payload.data.decode('UTF-8').strip()
        
        return secret_value
        
    except ImportError:
        # google-cloud-secret-manager 未安裝，使用默認值
        if default is not None:
            return default
        raise ImportError("google-cloud-secret-manager 未安裝，無法使用 Secret Manager")
    
    except Exception as e:
        # 讀取失敗，記錄錯誤但返回默認值（避免應用啟動失敗）
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"無法從 Secret Manager 讀取 {secret_id}: {str(e)}")
        
        if default is not None:
            return default
        raise


def get_env_or_secret(env_key: str, secret_id: str = None, project_id: Optional[str] = None, default: Optional[str] = None) -> Optional[str]:
    """
    優先從環境變數讀取，如果不存在且啟用了 Secret Manager，則從 Secret Manager 讀取
    
    Args:
        env_key: 環境變數名稱
        secret_id: Secret Manager 中的 secret 名稱（如果為 None，使用 env_key 的小寫加連字號形式）
        project_id: GCP 專案 ID
        default: 最終的默認值
    
    Returns:
        配置值
    """
    # 優先從環境變數讀取
    value = os.getenv(env_key)
    if value:
        return value
    
    # 如果未設置，嘗試從 Secret Manager 讀取
    if secret_id is None:
        # 自動轉換：DJANGO_SECRET_KEY -> django-secret-key
        secret_id = env_key.lower().replace('_', '-')
    
    return get_secret_from_manager(secret_id, project_id, default)

