# cramschool/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # 根路徑: 顯示所有學生資料 (Read)
    path('', views.student_list, name='student_list'),
    
    # 新增學生資料 (Create)
    path('add/', views.student_create, name='student_add'),
    
    # 更新學生資料 (Update)
    path('update/<int:pk>/', views.student_update, name='student_update'),
    
    # 刪除學生資料 (Delete)
    path('delete/<int:pk>/', views.student_delete, name='student_delete'),
]