<template>
  <node-view-wrapper class="page-break-wrapper">
    <div class="page-break-block print:hidden">
      <div class="flex items-center gap-4 py-4 select-none">
        <div class="h-px bg-red-200 flex-1 border-t border-dashed border-red-300"></div>
        <span class="text-xs font-bold text-red-400 uppercase tracking-wider">強制分頁 (Page Break)</span>
        <div class="h-px bg-red-200 flex-1 border-t border-dashed border-red-300"></div>
      </div>
    </div>
    <!-- 列印時實際產生分頁 -->
    <div class="hidden print:block break-after-page"></div>
  </node-view-wrapper>
</template>

<script setup>
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

defineProps(nodeViewProps)
</script>

<style scoped>
.page-break-wrapper {
  margin: 1rem 0;
}

.page-break-block {
  width: 100%;
}

@media print {
  .break-after-page {
    page-break-after: always;
    break-after: page;
  }
}
</style>
