<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { useRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useRouteStore } from '@/stores'

interface SearchHistory {
  title: string
  path: string
}

interface SearchResult {
  title: string
  path: string
}

const router = useRouter()
const routeStore = useRouteStore()

const visible = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)
const searchKeyword = ref('')
const searchHistory = ref<SearchHistory[]>([])
const searchResults = ref<SearchResult[]>([])
const selectedIndex = ref(-1)

const searchRoutes = (keyword: string) => {
  const result: SearchResult[] = []
  const loop = (routes: RouteRecordRaw[]) => {
    routes.forEach((route) => {
      if (route.children && route.children.length > 0) {
        loop(route.children)
      } else {
        if (route.meta?.title?.toLowerCase().includes(keyword.toLowerCase())) {
          result.push({
            title: route.meta.title,
            path: route.path,
          })
        }
      }
    })
  }
  loop(routeStore.routes)
  return result
}

const handleSearch = (keyword: string) => {
  if (!keyword) {
    searchResults.value = []
    return
  }
  searchResults.value = searchRoutes(keyword)
}

const handleResultClick = (item: SearchResult) => {
  if (!searchHistory.value.some((history) => history.path === item.path)) {
    searchHistory.value.unshift(item)
    if (searchHistory.value.length > 5) {
      searchHistory.value.pop()
    }
  }
  router.push(item.path)
  visible.value = false
}

const handleHistoryClick = (item: SearchHistory) => {
  router.push(item.path)
  visible.value = false
}

const clearHistory = () => {
  searchHistory.value = []
}

useEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    visible.value = true
  }
})

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    visible.value = false
  } else if (e.key === 'ArrowDown') {
    if (selectedIndex.value < searchResults.value.length - 1) {
      selectedIndex.value++
    }
  } else if (e.key === 'ArrowUp') {
    if (selectedIndex.value > 0) {
      selectedIndex.value--
    }
  } else if (e.key === 'Enter') {
    if (selectedIndex.value >= 0 && selectedIndex.value < searchResults.value.length) {
      handleResultClick(searchResults.value[selectedIndex.value])
    }
  }
}

watch(visible, (newValue) => {
  if (newValue) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  } else {
    searchResults.value = []
    searchKeyword.value = ''
    selectedIndex.value = -1
  }
})

watch(searchKeyword, (newValue) => {
  handleSearch(newValue)
})
</script>

<template>
  <div class="search-trigger" @click="visible = true">
    <icon-search :size="18" style="margin-right: 4px;" />
    <span class="search-text">
      搜索
    </span>
    <span class="shortcut-key">
      Ctrl + K
    </span>
  </div>
  <div class="search-modal">
    <a-modal
      :visible="visible"
      :mask-closable="true"
      :align-center="false"
      :closable="false"
      :render-to-body="false"
      @cancel="visible = false"
      @keydown="handleKeyDown"
    >
      <template #title>
        <div class="search-input-wrapper">
          <icon-search :size="24" />
          <input ref="searchInput" v-model="searchKeyword" placeholder="搜索页面" class="search-input">
          <div class="esc-tip">
            ESC 退出
          </div>
        </div>
      </template>
      <div class="search-content">
        <div v-if="searchResults.length">
          <div class="result-count">
            搜索到 {{ searchResults.length }} 个结果
          </div>
          <div class="result-list">
            <div
              v-for="(item, index) in searchResults" :key="item.path" class="result-item"
              :class="{ selected: selectedIndex === index }" @click="handleResultClick(item)"
            >
              <icon-file :size="18" style="margin-right: 6px;" />
              <div class="result-title">
                {{ item.title }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="searchHistory.length" class="history-section">
          <div class="history-header">
            <div class="history-title">
              搜索历史
            </div>
            <a-button type="text" size="small" class="text-xs" @click="clearHistory">
              清空历史
            </a-button>
          </div>
          <div class="history-list">
            <div v-for="item in searchHistory" :key="item.path" class="history-item" @click="handleHistoryClick(item)">
              <icon-history :size="18" style="margin-right: 6px;" />
              <div class="result-title">
                {{ item.title }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="shortcut">
          <GiSvgIcon name="select" :size="12" class="shortcut-icon" />
          <div>切换</div>
        </div>
        <div class="shortcut">
          <GiSvgIcon name="shortcut-enter" :size="12" class="shortcut-icon" />
          <div>选择</div>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<style scoped lang="scss">
.search-trigger {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  margin-right: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  background-color: #f3f4f6;

  .dark & {
    background-color: var(--color-bg-2);
  }
}

.search-text {
  line-height: 1;
  color: var(--color-text-3);
}

.shortcut-key {
  margin-left: 1rem;
  padding: 2px 6px;
  font-size: 10px;
  border-radius: 4px;
  background-color: #e5e7eb;
  color: var(--color-text-3);

  .dark & {
    background-color: var(--color-bg-4);
  }
}

.search-modal {
  :deep(.arco-modal-header) {
    height: 64px;
  }

  :deep(.arco-modal-body) {
    .search-content {
      max-height: 50vh;
      overflow-y: auto;
    }
  }
}

.search-input-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.5rem 4rem 0.5rem 0.5rem;
  border: none;
  outline: none;
  background-color: transparent;
  color: var(--color-text-3);
}

.esc-tip {
  position: absolute;
  right: 0.75rem;
  display: flex;
  align-items: center;
  padding: 0.25rem 0.375rem;
  font-size: 0.75rem;
  border-radius: 0.375rem;
  background-color: #e5e7eb;
  color: var(--color-text-3);

  .dark & {
    background-color: var(--color-bg-4);
  }
}

.result-count {
  font-size: 0.875rem;
  color: var(--color-text-3);
  margin-bottom: 0.5rem;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: var(--color-text-3);

  &:hover {
    color: #000;
    background-color: #f3f4f6;

    .dark & {
      color: #fff;
      background-color: var(--color-bg-4);
    }
  }
}

.history-section {
  margin-top: 1rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.history-title {
  font-size: 0.875rem;
  color: var(--color-text-3);
}

.clear-history {
  font-size: 0.75rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: var(--color-text-3);

  &:hover {
    color: #000;
    background-color: #f3f4f6;

    .dark & {
      color: #fff;
      background-color: var(--color-bg-4);
    }
  }
}

.selected {
  color: #000;
  background-color: #f3f4f6;

  .dark & {
    color: #fff;
    background-color: var(--color-bg-4);
  }
}

:deep(.arco-modal-footer){
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
}

.shortcut{
  display: flex;
  justify-items: center;
  align-items: center;
  gap: 8px;

  &-icon{
    padding: 4px;
    background-color: #e5e7eb;
    border-radius: 6px;
    color: var(--color-text-1);

    .dark & {
      background-color: var(--color-bg-5);
    }
  }
}
</style>
