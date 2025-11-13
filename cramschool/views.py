from django.shortcuts import render,redirect,get_object_or_404
from django.urls import reverse # 🎯 用於導航回列表頁
from django.views.decorators.http import require_POST # 🎯 新增：確保只接受 POST 請求
from .models import Student
from .forms import StudentForm # 🎯 匯入我們定義的表單
# cramschool/views.py

def student_list(request):
    """
    顯示所有學生資料的視圖
    """
    students = Student.objects.all() # 取得所有學生資料
    return render(request, 'cramschool/student_list.html', {'students': students})

def student_create(request):
    """
    FBV: 處理新增學生記錄的邏輯
    """
    if request.method == 'POST':
        # 這是處理表單提交 (POST) 的部分
        
        # 1. 將 POST 數據綁定到表單實例
        form = StudentForm(request.POST) 
        
        # 2. 檢查表單數據是否有效
        if form.is_valid():
            # 3. 有效：保存數據到資料庫
            # ModelForm 的 save() 方法會創建並保存新物件
            form.save()
            return redirect(reverse('student_list'))
            
            # 4. 重定向：成功後導航回學生列表頁面
            return redirect(reverse('student_list'))
            
    else:
        # 這是處理初次訪問 (GET) 的部分
        
        # 1. 創建一個空的表單實例
        form = StudentForm()

    # 5. 渲染：不論是空的 GET 請求，還是無效的 POST 請求，都會到這裡
    context = {
        'form': form,
        'page_title': '新增學生資料'
    }
    
    # 渲染使用的模板名和之前 CBV 應該是一致的
    return render(request, 'cramschool/student_form.html', context)

def student_update(request, pk):
    """
    FBV: 處理編輯 (Update) 學生記錄的邏輯
    
    Args:
        pk (int): URL 中傳入的學生主鍵 (Primary Key)
    """
    # 1. 獲取要編輯的學生實例，如果不存在則返回 404
    student = get_object_or_404(Student, pk=pk)

    if request.method == 'POST':
        # 這是處理表單提交 (POST) 的部分
        
        # 2. 數據綁定：將 POST 數據和當前學生實例 (instance) 綁定到表單
        form = StudentForm(request.POST, instance=student) 
        
        # 3. 檢查表單數據是否有效
        if form.is_valid():
            # 4. 有效：保存數據，這將更新現有的實例
            form.save()
            
            # 5. 重定向：成功後導航回學生列表頁面
            return redirect(reverse('student_list'))
            
    else:
        # 這是處理初次訪問 (GET) 的部分
        
        # 2. 創建一個帶有當前學生數據的表單實例
        # 將 student 實例傳入 instance 參數，表單會自動填充現有數據
        form = StudentForm(instance=student)

    # 6. 渲染：將表單和頁面標題傳遞給模板
    context = {
        'form': form,
        'page_title': f'編輯學生資料：{student.name}'
    }
    
    # 繼續使用 student_form.html 模板 (與 Create 共用)
    return render(request, 'cramschool/student_form.html', context)

@require_POST # 確保只有 POST 請求才能觸發此函數
def student_delete(request, pk):
    """
    FBV: 處理刪除學生記錄的邏輯
    
    Args:
        pk (int): URL 中傳入的學生主鍵 (Primary Key)
    """
    # 1. 獲取要刪除的學生實例，如果不存在則返回 404
    student = get_object_or_404(Student, pk=pk)

    # 2. 執行刪除操作
    student.delete()
    
    # 3. 重定向：成功後導航回學生列表頁面
    return redirect(reverse('student_list'))