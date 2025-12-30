# config/views.py

from django.shortcuts import render

def index(request):
    context = {
        # 2. 將資料傳遞給模板
        'users':[
            {'username': 'alice', 'role': 'admin'},
            {'username': 'bob', 'role': 'user'},
            {'username': 'charlie', 'role': 'guest'},
        ]
    }
    
    # 3. 渲染模板
    return render(request, 'index.html', context)

def tuition(request):
    return render(request, 'tuition.html')
