<template>
  <node-view-wrapper class="page-break-wrapper">
    <!-- 編輯模式：模擬兩張紙的間隔 -->
    <div class="page-break-container">
      <!-- 上方紙張底部陰影 -->
      <div class="paper-bottom-shadow"></div>
      
      <!-- 間隔區域 -->
      <div class="page-break-gap">
        <div class="page-break-label">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>分頁</span>
        </div>
      </div>
      
      <!-- 下方紙張頂部陰影 -->
      <div class="paper-top-shadow"></div>
    </div>
  </node-view-wrapper>
</template>

<script setup>
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

defineProps(nodeViewProps)
</script>

<style scoped>
.page-break-wrapper {
  /* 負邊距讓效果延伸到紙張外，並創造真正的間隔 */
  margin-left: -20mm;
  margin-right: -20mm;
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding: 0;
  position: relative;
}

/* 使用偽元素在左右兩側創建灰色覆蓋 */
.page-break-wrapper::before,
.page-break-wrapper::after {
  content: '';
  position: absolute;
  top: 16px;
  bottom: 16px;
  width: 20mm;
  background: #f3f4f6;
  z-index: 5;
}

.page-break-wrapper::before {
  left: 0;
}

.page-break-wrapper::after {
  right: 0;
}

.page-break-container {
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 上方紙張底部陰影 - 更明顯 */
.paper-bottom-shadow {
  height: 16px;
  margin-left: 20mm;
  margin-right: 20mm;
  background: linear-gradient(to bottom, 
    white 0%,
    rgba(0, 0, 0, 0.08) 20%,
    rgba(0, 0, 0, 0.04) 60%,
    transparent 100%
  );
  position: relative;
  z-index: 2;
}

/* 間隔區域 - 顯示背景色（灰色），模擬兩張紙之間的空隙 */
.page-break-gap {
  height: 3rem;
  background: #f3f4f6;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
  /* 確保完全覆蓋 */
  margin-left: 0;
  margin-right: 0;
}

/* 下方紙張頂部陰影 - 更明顯 */
.paper-top-shadow {
  height: 16px;
  margin-left: 20mm;
  margin-right: 20mm;
  background: linear-gradient(to bottom, 
    transparent 0%,
    rgba(0, 0, 0, 0.04) 40%,
    rgba(0, 0, 0, 0.08) 80%,
    white 100%
  );
  position: relative;
  z-index: 2;
}

/* 分頁標籤 */
.page-break-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
  z-index: 10;
  position: relative;
}

.page-break-label:hover {
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.page-break-label .icon {
  width: 1rem;
  height: 1rem;
  color: #9ca3af;
}

/* 列印時的處理 */
@media print {
  /* 隱藏整個分頁包裝器的視覺效果 */
  .page-break-wrapper {
    margin: 0;
    padding: 0;
    height: 0;
    overflow: hidden;
  }
  
  .page-break-container,
  .paper-bottom-shadow,
  .page-break-gap,
  .paper-top-shadow {
    display: none;
  }
  
  /* 實際產生分頁效果 */
  .page-break-wrapper {
    page-break-before: always;
    break-before: page;
  }
}
</style>
