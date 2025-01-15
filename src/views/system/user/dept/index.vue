<template>
  <div class="container">
    <div class="search">
      <a-input v-model="searchKey" placeholder="搜索部门名称" allow-clear>
        <template #prefix><icon-search /></template>
      </a-input>
    </div>
    <div class="tree-wrapper">
      <div class="tree">
        <a-tree
          ref="treeRef"
          :data="treeData"
          show-line
          block-node
          default-expand-all
          :selected-keys="selectedKeys"
          @select="select"
        >
          <template #switcher-icon="node, { isLeaf }">
            <IconCaretDown v-if="!isLeaf" />
            <IconIdcard v-else />
          </template>
          <template #title="node">
            <a-typography-paragraph
              :ellipsis="{
                rows: 1,
                showTooltip: true,
                css: true,
              }"
            >
              {{ node?.title }}
            </a-typography-paragraph>
          </template>
        </a-tree>
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import type { TreeInstance, TreeNodeData } from '@arco-design/web-vue'
import { ref } from 'vue'
import { useDept } from '@/hooks/app'

const emit = defineEmits<{
  (e: 'node-click', keys: Array<any>): void
}>()

// 选中节点
const selectedKeys = ref()
const select = (keys: Array<any>) => {
  if (selectedKeys.value && selectedKeys.value[0] === keys[0]) {
    return
  }
  selectedKeys.value = keys
  emit('node-click', keys)
}

const treeRef = ref<TreeInstance>()
// 查询树列表
const { deptList, getDeptList } = useDept({
  onSuccess: () => {
    nextTick(() => {
      treeRef.value?.expandAll(true)
      select([deptList.value[0]?.key])
    })
  },
})

// 过滤树
const searchKey = ref('')
const search = (keyword: string) => {
  const loop = (data: TreeNodeData[]) => {
    const result = [] as TreeNodeData[]
    data.forEach((item: TreeNodeData) => {
      if (item.title?.toLowerCase().includes(keyword)) {
        result.push({ ...item })
      } else if (item.children) {
        const filterData = loop(item.children)
        if (filterData.length) {
          result.push({
            ...item,
            children: filterData,
          })
        }
      }
    })
    return result
  }
  return loop(deptList.value)
}

const treeData = computed(() => {
  if (!searchKey.value) return deptList.value
  return search(searchKey.value.toLowerCase())
})

onMounted(() => {
  getDeptList()
})
</script>

<style scoped lang="scss">
:deep(.arco-tree-node-title-text) {
  width: 100%;
  white-space: nowrap;
}

:deep(.arco-tree-node) {
  line-height: normal;
  border-radius: var(--border-radius-medium);
  &:hover {
    background-color: var(--color-secondary-hover);
  }

  .arco-tree-node-title {
    &:hover {
      background-color: transparent;
    }
  }
}

:deep(.arco-tree-node-selected) {
  font-weight: bold;
  background-color: rgba(var(--primary-6), 0.1);
  &:hover {
    background-color: rgba(var(--primary-6), 0.1);
  }
  .arco-typography {
    color: rgb(var(--primary-6));
  }
}

.container {
  flex: 1;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;

  .search {
    margin-bottom: 16px;
  }

  .tree-wrapper {
    flex: 1;
    overflow: hidden;
    background-color: var(--color-bg-1);
    position: relative;
    height: 100%;
/*    margin-bottom:10px;*/
    .tree {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      overflow: auto
    }
  }
}
</style>
