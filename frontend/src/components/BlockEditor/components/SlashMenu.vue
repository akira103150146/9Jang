<template>
  <div class="slash-menu" ref="menuRef">
    <div class="slash-menu-header">
      <input
        ref="searchInput"
        v-model="searchQuery"
        @keydown="handleKeyDown"
        placeholder="搜尋區塊類型..."
        class="slash-menu-search"
      />
    </div>
    
    <div class="slash-menu-items">
      <div
        v-for="(item, index) in filteredItems"
        :key="index"
        @click="selectItem(index)"
        @mouseenter="selectedIndex = index"
        class="slash-menu-item"
        :class="{ 'is-selected': index === selectedIndex }"
      >
        <div class="item-icon">{{ item.icon }}</div>
        <div class="item-content">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-description">{{ item.description }}</div>
        </div>
      </div>
      
      <div v-if="filteredItems.length === 0" class="slash-menu-empty">
        找不到符合的區塊類型
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  command: {
    type: Function,
    required: true
  }
})

const searchQuery = ref('')
const selectedIndex = ref(0)
const menuRef = ref(null)
const searchInput = ref(null)

// 過濾項目
const filteredItems = computed(() => {
  if (!searchQuery.value) return props.items
  
  const query = searchQuery.value.toLowerCase()
  return props.items.filter(item => {
    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(query))
    )
  })
})

// 監聽篩選結果變化，重置選擇
watch(filteredItems, () => {
  selectedIndex.value = 0
})

// 鍵盤導航
const handleKeyDown = (event) => {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedIndex.value = Math.max(0, selectedIndex.value - 1)
    scrollToSelected()
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedIndex.value = Math.min(filteredItems.value.length - 1, selectedIndex.value + 1)
    scrollToSelected()
  } else if (event.key === 'Enter') {
    event.preventDefault()
    selectItem(selectedIndex.value)
  } else if (event.key === 'Escape') {
    event.preventDefault()
    props.command({ close: true })
  }
}

// 選擇項目
const selectItem = (index) => {
  const item = filteredItems.value[index]
  if (item) {
    props.command(item)
  }
}

// 滾動到選中的項目
const scrollToSelected = () => {
  nextTick(() => {
    const selectedElement = menuRef.value?.querySelector('.is-selected')
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' })
    }
  })
}

// 自動聚焦搜尋框
onMounted(() => {
  nextTick(() => {
    searchInput.value?.focus()
  })
})
</script>

<style scoped>
.slash-menu {
  background: white;
  border: 1px solid rgb(226, 232, 240);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 320px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.slash-menu-header {
  padding: 0.75rem;
  border-bottom: 1px solid rgb(226, 232, 240);
}

.slash-menu-search {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgb(226, 232, 240);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  outline: none;
}

.slash-menu-search:focus {
  border-color: rgb(99, 102, 241);
}

.slash-menu-items {
  overflow-y: auto;
  max-height: 320px;
}

.slash-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: background 0.15s;
}

.slash-menu-item:hover,
.slash-menu-item.is-selected {
  background: rgb(238, 242, 255);
}

.item-icon {
  font-size: 1.5rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(30, 41, 59);
}

.item-description {
  font-size: 0.75rem;
  color: rgb(100, 116, 139);
  margin-top: 0.125rem;
}

.slash-menu-empty {
  padding: 2rem;
  text-align: center;
  color: rgb(148, 163, 184);
  font-size: 0.875rem;
}

/* 滾動條樣式 */
.slash-menu-items::-webkit-scrollbar {
  width: 6px;
}

.slash-menu-items::-webkit-scrollbar-track {
  background: transparent;
}

.slash-menu-items::-webkit-scrollbar-thumb {
  background: rgb(203, 213, 225);
  border-radius: 3px;
}

.slash-menu-items::-webkit-scrollbar-thumb:hover {
  background: rgb(148, 163, 184);
}
</style>
