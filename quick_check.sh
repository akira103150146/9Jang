#!/bin/bash
# 快速檢查題庫篩選功能配置

echo "=========================================="
echo "題庫篩選功能快速檢查"
echo "=========================================="
echo ""

# 檢查後端配置
echo "1. 檢查後端配置..."
if [ -f "backend/config/settings.py" ]; then
    if grep -q "DEFAULT_PAGINATION_CLASS.*PageNumberPagination" backend/config/settings.py; then
        echo "   ✅ 分頁類別配置正確"
    else
        echo "   ⚠️  未找到分頁類別配置"
    fi
    
    if grep -q "PAGE_SIZE.*10" backend/config/settings.py; then
        echo "   ✅ 分頁大小配置正確 (10)"
    else
        echo "   ⚠️  未找到分頁大小配置"
    fi
else
    echo "   ❌ 找不到 settings.py"
fi

echo ""

# 檢查後端 API 視圖
echo "2. 檢查後端 API 視圖..."
if [ -f "backend/cramschool/api_views.py" ]; then
    if grep -q "getlist('tags" backend/cramschool/api_views.py && grep -q "or.*getlist('tags')" backend/cramschool/api_views.py; then
        echo "   ✅ 標籤篩選支援兩種格式"
    else
        echo "   ⚠️  標籤篩選可能只支援一種格式"
    fi
    
    if grep -q "query_params.get('source'" backend/cramschool/api_views.py; then
        echo "   ✅ 來源篩選已實現"
    else
        echo "   ⚠️  未找到來源篩選實現"
    fi
else
    echo "   ❌ 找不到 api_views.py"
fi

echo ""

# 檢查前端組件
echo "3. 檢查前端組件..."
if [ -f "frontend/src/components/QuestionList.vue" ]; then
    if grep -q "filters.source" frontend/src/components/QuestionList.vue; then
        echo "   ✅ 來源篩選欄位已添加"
    else
        echo "   ⚠️  未找到來源篩選欄位"
    fi
    
    if grep -q "fetchSourceOptions" frontend/src/components/QuestionList.vue; then
        echo "   ✅ 來源選項獲取函數已實現"
    else
        echo "   ⚠️  未找到來源選項獲取函數"
    fi
    
    if grep -q "params.page_size" frontend/src/components/QuestionList.vue; then
        echo "   ⚠️  仍在使用 page_size 參數（應該移除）"
    else
        echo "   ✅ 已移除無效的 page_size 參數"
    fi
else
    echo "   ❌ 找不到 QuestionList.vue"
fi

echo ""

# 檢查 API 服務
echo "4. 檢查 API 服務..."
if [ -f "frontend/src/services/api.js" ]; then
    if grep -q "getSourceOptions" frontend/src/services/api.js; then
        echo "   ✅ 來源選項 API 方法已實現"
    else
        echo "   ⚠️  未找到來源選項 API 方法"
    fi
else
    echo "   ❌ 找不到 api.js"
fi

echo ""
echo "=========================================="
echo "檢查完成！"
echo "=========================================="
echo ""
echo "如果所有項目都顯示 ✅，則配置正確。"
echo "如果有 ⚠️ 或 ❌，請檢查對應的文件。"
