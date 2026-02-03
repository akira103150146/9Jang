#!/bin/bash

# 腳本驗證工具
# 檢查所有 Shell 腳本的行結束符和語法

echo "======================================"
echo "Shell 腳本驗證工具"
echo "======================================"
echo ""

# 查找所有 .sh 文件
SCRIPTS=$(find . -name "*.sh" -type f ! -path "*/node_modules/*" ! -path "*/.git/*")

if [ -z "$SCRIPTS" ]; then
    echo "未找到任何 .sh 腳本文件"
    exit 0
fi

echo "找到的腳本文件："
echo "$SCRIPTS"
echo ""

ALL_PASS=true

for script in $SCRIPTS; do
    echo "檢查: $script"
    
    # 檢查行結束符
    if file "$script" | grep -q "CRLF"; then
        echo "  ✗ 發現 Windows 行結束符 (CRLF)"
        echo "    修復: sed -i 's/\r$//' $script"
        ALL_PASS=false
    else
        echo "  ✓ 行結束符正確 (LF)"
    fi
    
    # 檢查執行權限
    if [ -x "$script" ]; then
        echo "  ✓ 有執行權限"
    else
        echo "  ⚠ 缺少執行權限"
        echo "    修復: chmod +x $script"
    fi
    
    # 檢查語法（僅對 bash 腳本）
    if head -1 "$script" | grep -q "bash"; then
        if bash -n "$script" 2>/dev/null; then
            echo "  ✓ 語法正確"
        else
            echo "  ✗ 語法錯誤"
            bash -n "$script" 2>&1 | head -5
            ALL_PASS=false
        fi
    fi
    
    echo ""
done

echo "======================================"
if [ "$ALL_PASS" = true ]; then
    echo "✓ 所有腳本檢查通過！"
    exit 0
else
    echo "✗ 發現問題，請查看上方詳細訊息"
    exit 1
fi
