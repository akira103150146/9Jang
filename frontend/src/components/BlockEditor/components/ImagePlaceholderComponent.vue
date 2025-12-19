<template>
  <NodeViewWrapper class="image-placeholder-wrapper">
    <div 
      class="placeholder-box"
      @click="openImageSelector"
      :class="{ 'hover': isHovering }"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
    >
      <div class="icon">🖼️</div>
      <div class="info">
        <p class="filename">{{ filename }}</p>
        <p class="hint">圖片未找到，點擊選擇對應圖片</p>
        <p class="original-path">原路徑: {{ originalPath }}</p>
      </div>
      <button class="select-btn">選擇圖片</button>
    </div>
  </NodeViewWrapper>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps({
  node: { type: Object, required: true },
  updateAttributes: { type: Function, required: true },
  deleteNode: { type: Function, required: true },
  editor: { type: Object, required: true }
})

const isHovering = ref(false)

// 從父組件注入的映射表
const imageMappings = inject('imageMappings', new Map())

const filename = computed(() => props.node.attrs.filename)
const originalPath = computed(() => props.node.attrs.originalPath)

// 打開圖片選擇器
const openImageSelector = () => {
  // #region agent log
  fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ImagePlaceholderComponent.vue:41',message:'openImageSelector called',data:{nodeId:props.node.attrs.id,filename:props.node.attrs.filename},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,E'})}).catch(()=>{});
  // #endregion
  
  // 通過 emit 事件通知父組件
  const event = new CustomEvent('openImageSelector', {
    detail: {
      placeholderNode: props.node,
      placeholderNodeId: props.node.attrs.id, // 傳遞節點 ID 用於匹配
      onSelect: (selectedUrl) => {
        // #region agent log
        fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ImagePlaceholderComponent.vue:48',message:'onSelect called',data:{selectedUrl,nodeId:props.node.attrs.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
        // #endregion
        
        // 找到當前節點的位置 - 使用節點 ID 或屬性來匹配
        const { state } = props.editor
        let pos = null
        const targetId = props.node.attrs.id
        const targetFilename = props.node.attrs.filename
        
        // #region agent log
        fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ImagePlaceholderComponent.vue:55',message:'Searching for node',data:{targetId,targetFilename},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        
        state.doc.descendants((node, nodePos) => {
          // 使用節點 ID 或檔名來匹配
          if (node.type.name === 'imagePlaceholder') {
            const nodeId = node.attrs.id
            const nodeFilename = node.attrs.filename
            // #region agent log
            fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ImagePlaceholderComponent.vue:62',message:'Checking node',data:{nodeId,nodeFilename,matchesId:nodeId===targetId,matchesFilename:nodeFilename===targetFilename},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            
            if (nodeId === targetId || (nodeFilename === targetFilename && targetId)) {
              pos = nodePos
              // #region agent log
              fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ImagePlaceholderComponent.vue:68',message:'Node found',data:{pos,nodeId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
              // #endregion
              return false
            }
          }
        })
        
        // #region agent log
        fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ImagePlaceholderComponent.vue:75',message:'Before replace',data:{pos,hasPos:pos!==null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
        // #endregion
        
        if (pos !== null) {
          // 替換為真實圖片節點
          props.editor.chain()
            .focus()
            .setTextSelection(pos)
            .deleteSelection()
            .insertContent({
              type: 'image',
              attrs: {
                src: selectedUrl,
                alt: props.node.attrs.alt || props.node.attrs.filename,
                title: props.node.attrs.filename
              }
            })
            .run()
          
          // #region agent log
          fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ImagePlaceholderComponent.vue:93',message:'Replace command executed',data:{success:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,D'})}).catch(()=>{});
          // #endregion
        } else {
          // #region agent log
          fetch('http://127.0.0.1:1839/ingest/9404a257-940d-4c9b-801f-942831841c9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ImagePlaceholderComponent.vue:97',message:'Node position not found',data:{targetId,targetFilename},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C,E'})}).catch(()=>{});
          // #endregion
        }
      }
    }
  })
  window.dispatchEvent(event)
}
</script>

<style scoped>
.image-placeholder-wrapper {
  margin: 1rem 0;
}

.placeholder-box {
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  padding: 1.5rem;
  background: #f7fafc;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.placeholder-box.hover {
  border-color: #4299e1;
  background: #ebf8ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.icon {
  font-size: 3rem;
}

.info {
  flex: 1;
}

.filename {
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.hint {
  color: #718096;
  font-size: 0.875rem;
  margin: 0.25rem 0;
}

.original-path {
  color: #a0aec0;
  font-size: 0.75rem;
  font-family: monospace;
  margin: 0;
}

.select-btn {
  padding: 0.5rem 1rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.select-btn:hover {
  background: #3182ce;
}
</style>
