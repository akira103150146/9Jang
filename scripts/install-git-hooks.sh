#!/bin/bash
# 安裝 Git hooks 腳本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GIT_HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

echo "📦 安裝 Git hooks..."

# 檢查 .git/hooks 目錄是否存在
if [ ! -d "$GIT_HOOKS_DIR" ]; then
    echo "❌ 錯誤：找不到 .git/hooks 目錄"
    echo "   請確保您在 Git 倉庫根目錄運行此腳本"
    exit 1
fi

# 安裝 pre-push hook
if [ -f "$SCRIPT_DIR/pre-push" ]; then
    ln -sf "$SCRIPT_DIR/pre-push" "$GIT_HOOKS_DIR/pre-push"
    chmod +x "$GIT_HOOKS_DIR/pre-push"
    echo "✅ 已安裝 pre-push hook"
else
    echo "⚠️  警告：找不到 pre-push 腳本"
fi

echo ""
echo "✅ Git hooks 安裝完成！"
echo ""
echo "現在當您執行 'git push' 時，會自動運行測試檢查。"
echo "如果測試失敗，推送將被阻止。"
