<template>
  <node-view-wrapper class="page-break-wrapper">
    <!-- 編輯模式：顯示灰色間隔 -->
    <div class="page-break-gap"></div>
  </node-view-wrapper>
</template>

<script setup>
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

defineProps(nodeViewProps)
</script>

<style scoped>
.page-break-wrapper {
  /* 負邊距讓灰色區域延伸到紙張外，露出背後的灰色背景 */
  margin-left: -20mm;
  margin-right: -20mm;
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding: 0;
}

/* 灰色間隔區域 */
.page-break-gap {
  height: 2rem;
  background: #e5e7eb;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 在間隔中央顯示小標籤（僅編輯模式） */
.page-break-gap::after {
  content: '分頁';
  background: rgba(255, 255, 255, 0.95);
  padding: 0.375rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  border: 1px solid #d1d5db;
}

/* 列印時的處理 */
@media print {
  /* 隱藏整個分頁包裝器 */
  .page-break-wrapper {
    margin: 0;
    padding: 0;
    height: 0;
    overflow: hidden;
  }
  
  /* 灰色間隔在列印時不顯示 */
  .page-break-gap {
    display: none;
  }
  
  /* 實際產生分頁效果 */
  .page-break-wrapper {
    page-break-before: always;
    break-before: page;
  }
}
</style>
