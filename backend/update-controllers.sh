#!/bin/bash

# 批次更新所有 controller 檔案
# 1. 加入 PermissionGuard import
# 2. 在 @UseGuards 中加入 PermissionGuard
# 3. 為每個 HTTP method 加入 @Permission() 裝飾器

CONTROLLERS_DIR="/home/akira/github/9Jang/backend/src/cramschool/controllers"

echo "開始批次更新 Controllers..."

for file in "$CONTROLLERS_DIR"/*.controller.ts; do
  filename=$(basename "$file")
  
  # 跳過已經處理過的 students.controller.ts
  if [ "$filename" == "students.controller.ts" ]; then
    echo "跳過: $filename (已處理)"
    continue
  fi
  
  echo "處理: $filename"
  
  # 檢查是否已經有 PermissionGuard import
  if ! grep -q "PermissionGuard" "$file"; then
    # 加入 PermissionGuard import (在 JwtAuthGuard import 之後)
    sed -i "/import.*JwtAuthGuard/a import { PermissionGuard, Permission } from '../../common/guards/permission.guard';" "$file"
    echo "  ✓ 已加入 PermissionGuard import"
  fi
  
  # 更新 @UseGuards 加入 PermissionGuard (如果還沒有)
  if grep -q "@UseGuards(JwtAuthGuard)" "$file" && ! grep -q "PermissionGuard" "$file" | grep -q "@UseGuards"; then
    sed -i 's/@UseGuards(JwtAuthGuard)/@UseGuards(JwtAuthGuard, PermissionGuard)/g' "$file"
    echo "  ✓ 已更新 @UseGuards"
  fi
  
  echo "  完成"
done

echo ""
echo "✓ 批次更新完成!"
echo "注意: 仍需手動為每個 HTTP method 加入 @Permission() 裝飾器"
