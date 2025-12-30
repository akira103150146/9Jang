#!/usr/bin/env python
"""
題庫篩選功能測試腳本
用於驗證所有篩選參數是否正確傳遞和處理

使用方法：
1. 確保後端服務正在運行
2. 確保已設置環境變數或配置（API URL、認證 token 等）
3. 運行：python test_question_filters.py
"""

import requests
import json
from urllib.parse import urlencode

# 配置
API_BASE_URL = "http://localhost:8000/api"
# 如果需要認證，請設置 token
# TOKEN = "your_token_here"
# HEADERS = {"Authorization": f"Bearer {TOKEN}"}
HEADERS = {"Content-Type": "application/json"}

def test_filter_params():
    """測試所有篩選參數"""
    
    base_url = f"{API_BASE_URL}/cramschool/questions/"
    
    test_cases = [
        {
            "name": "測試科目篩選",
            "params": {"subject": "1", "page": 1},
            "expected": "應返回指定科目的題目"
        },
        {
            "name": "測試年級篩選",
            "params": {"level": "SHS", "page": 1},
            "expected": "應返回高中年級的題目"
        },
        {
            "name": "測試章節篩選",
            "params": {"chapter": "向量", "page": 1},
            "expected": "應返回包含'向量'的章節題目"
        },
        {
            "name": "測試難度篩選",
            "params": {"difficulty": "3", "page": 1},
            "expected": "應返回難度為3的題目"
        },
        {
            "name": "測試題目類型篩選",
            "params": {"question_type": "SINGLE_CHOICE", "page": 1},
            "expected": "應返回單選題"
        },
        {
            "name": "測試標籤篩選 (tags)",
            "params": {"tags": "1", "page": 1},
            "expected": "應返回包含標籤ID 1的題目"
        },
        {
            "name": "測試標籤篩選 (tags[])",
            "params": {"tags[]": "1", "page": 1},
            "expected": "應返回包含標籤ID 1的題目"
        },
        {
            "name": "測試來源篩選",
            "params": {"source": "九章自命題", "page": 1},
            "expected": "應返回來源為'九章自命題'的題目"
        },
        {
            "name": "測試分頁",
            "params": {"page": 2},
            "expected": "應返回第2頁的題目"
        },
        {
            "name": "測試多條件組合",
            "params": {
                "subject": "1",
                "level": "SHS",
                "difficulty": "3",
                "page": 1
            },
            "expected": "應返回符合所有條件的題目"
        },
    ]
    
    print("=" * 60)
    print("開始測試題庫篩選功能")
    print("=" * 60)
    print()
    
    passed = 0
    failed = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"測試 {i}: {test_case['name']}")
        print(f"  參數: {test_case['params']}")
        print(f"  預期: {test_case['expected']}")
        
        try:
            # 構建 URL
            query_string = urlencode(test_case['params'], doseq=True)
            url = f"{base_url}?{query_string}"
            
            # 發送請求
            response = requests.get(url, headers=HEADERS)
            
            # 檢查響應
            if response.status_code == 200:
                data = response.json()
                
                # 檢查響應格式
                if 'results' in data or isinstance(data, list):
                    results = data.get('results', data) if isinstance(data, dict) else data
                    count = data.get('count', len(results)) if isinstance(data, dict) else len(results)
                    
                    print(f"  ✅ 成功 - 返回 {len(results)} 筆結果 (總數: {count})")
                    
                    # 驗證分頁格式
                    if isinstance(data, dict):
                        if 'count' in data and 'results' in data:
                            print(f"  ✅ 分頁格式正確")
                        else:
                            print(f"  ⚠️  警告：分頁格式可能不完整")
                    
                    passed += 1
                else:
                    print(f"  ❌ 失敗 - 響應格式不正確: {data}")
                    failed += 1
            elif response.status_code == 401:
                print(f"  ⚠️  需要認證 - 請設置 TOKEN")
                print(f"  響應: {response.text[:100]}")
            else:
                print(f"  ❌ 失敗 - HTTP {response.status_code}")
                print(f"  響應: {response.text[:200]}")
                failed += 1
                
        except Exception as e:
            print(f"  ❌ 錯誤: {str(e)}")
            failed += 1
        
        print()
    
    print("=" * 60)
    print(f"測試完成: {passed} 通過, {failed} 失敗")
    print("=" * 60)
    
    return passed, failed

def test_api_structure():
    """測試 API 結構和端點"""
    print("\n" + "=" * 60)
    print("測試 API 結構")
    print("=" * 60)
    
    endpoints = [
        f"{API_BASE_URL}/cramschool/questions/",
        f"{API_BASE_URL}/cramschool/questions/source_options/",
    ]
    
    for endpoint in endpoints:
        print(f"\n測試端點: {endpoint}")
        try:
            response = requests.get(endpoint, headers=HEADERS)
            print(f"  狀態碼: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"  響應類型: {type(data).__name__}")
                
                if isinstance(data, dict):
                    print(f"  響應鍵: {list(data.keys())}")
                    if 'results' in data:
                        print(f"  結果數量: {len(data['results'])}")
                        if len(data['results']) > 0:
                            print(f"  第一個結果的鍵: {list(data['results'][0].keys())[:5]}")
            else:
                print(f"  響應: {response.text[:200]}")
        except Exception as e:
            print(f"  錯誤: {str(e)}")

if __name__ == "__main__":
    print("\n注意：此腳本需要後端服務正在運行")
    print("如果使用認證，請在腳本中設置 TOKEN\n")
    
    # 測試 API 結構
    test_api_structure()
    
    # 測試篩選參數
    test_filter_params()
    
    print("\n測試完成！")
