# account/authentication.py

from rest_framework.authentication import SessionAuthentication


class SessionAuthenticationWithoutCSRF(SessionAuthentication):
    """
    自定義 Session 認證類，豁免 CSRF 檢查
    用於 API 視圖
    """
    def enforce_csrf(self, request):
        """
        不強制執行 CSRF 檢查
        """
        return  # 不做任何事，豁免 CSRF 檢查

