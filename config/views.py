# config/views.py

from django.shortcuts import render

def index(request):
    """
    渲染包含 Vue 應用程式掛載點的 HTML 模板。
    在 SSR 架構中，這是前端路由的單一進入點。
    """
    return render(request, 'index.html')