<template>
  <div class="container">
    <div class="search">
      <a-input v-model="searchKey" placeholder="搜索名称/编码" allow-clear>
        <template #prefix><icon-search /></template>
      </a-input>
      <a-button v-permission="['system:dict:add']" type="primary" @click="onAdd">
        <template #icon><icon-plus /></template>
      </a-button>
    </div>
    <div class="tree-wrapper">
      <div class="tree">
        <a-tree
          :data="(treeData as unknown as TreeNodeData[])"
          :field-names="{ key: 'id' }"
          block-node
          :selected-keys="selectedKeys"
          @select="select"
        >
          <template #title="node">
            <a-typography-paragraph
              :ellipsis="{
                rows: 1,
                showTooltip: true,
                css: true,
              }"
            >
              {{ node.name }} ({{ node.code }})
            </a-typography-paragraph>
          </template>
          <template #extra="node">
            <a-trigger trigger="click" align-point animation-name="slide-dynamic-origin" auto-fit-transform-origin position="bl" scroll-to-close>
              <icon-more-vertical v-if="has.hasPermOr(['system:dict:update', 'system:dict:delete'])" class="action" />
              <template #content>
                <RightMenu :data="node" @on-menu-item-click="onMenuItemClick" />
              </template>
            </a-trigger>
          </template>
        </a-tree>
      </div>
    </div>

    <DictAddModal ref="DictAddModalRef" @save-success="getTreeData" />
  </div>
</template>

<script setup lang="ts">
import { Message, Modal } from '@arco-design/web-vue'
import type { TreeNodeData } from '@arco-design/web-vue'
import { mapTree } from 'xe-utils'
import DictAddModal from './DictAddModal.vue'
import RightMenu from './RightMenu.vue'
import { type DictResp, deleteDict, listDict } from '@/apis/system/dict'
import has from '@/utils/has'

const emit = defineEmits<{
  (e: 'node-click', keys: Array<any>): void
}>()

const selectedKeys = ref()
// 选中节点
const select = (keys: Array<any>) => {
  if (selectedKeys.value && selectedKeys.value[0] === keys[0]) {
    return
  }
  selectedKeys.value = keys
  emit('node-click', keys)
}

interface TreeItem extends DictResp {
  popupVisible: boolean
}
const dataList = ref<TreeItem[]>([])
const loading = ref(false)
// 查询树列表
const getTreeData = async () => {
  try {
    loading.value = true
    const { data } = await listDict()
    dataList.value = mapTree(data, (i) => ({
      ...i,
      popupVisible: false,
      icon: () => {
        return null
      },
    }))
    await nextTick(() => {
      select([dataList.value[0]?.id])
    })
  } finally {
    loading.value = false
  }
}

// 过滤树
const searchKey = ref('')
const search = (keyword: string) => {
  const loop = (data: TreeItem[]) => {
    const result = [] as TreeItem[]
    data.forEach((item: TreeItem) => {
      if (item.name?.toLowerCase().includes(keyword) || item.code?.toLowerCase().includes(keyword)) {
        result.push({ ...item })
      }
    })
    return result
  }
  return loop(dataList.value)
}

const treeData = computed(() => {
  if (!searchKey.value) return dataList.value
  return search(searchKey.value.toLowerCase())
})

const DictAddModalRef = ref<InstanceType<typeof DictAddModal>>()
// 新增
const onAdd = () => {
  DictAddModalRef.value?.onAdd()
}

// 点击菜单项
const onMenuItemClick = (mode: string, node: DictResp) => {
  if (mode === 'update') {
    DictAddModalRef.value?.onUpdate(node.id)
  } else if (mode === 'delete') {
    Modal.warning({
      title: '提示',
      content: `是否确定删除 [${node.name}]？`,
      hideCancel: false,
      okButtonProps: { status: 'danger' },
      onBeforeOk: async () => {
        try {
          const res = await deleteDict(node.id)
          if (res.success) {
            Message.success('删除成功')
            await getTreeData()
          }
          return res.success
        } catch (error) {
          return false
        }
      },
    })
  }
}

onMounted(() => {
  getTreeData()
})
</script>

<style scoped lang="scss">
:deep(.arco-tree-node) {
  line-height: normal;
  border-radius: var(--border-radius-medium);
  margin: 5px 0;
  .action {
    opacity: 0;
  }
  &:hover {
    background-color: var(--color-secondary-hover);
    .action {
      opacity: 1;
    }
  }

  .arco-tree-node-switcher {
    width: 0;
    margin-right: 0;
  }

  .arco-tree-node-title {
    &:hover {
      background-color: transparent;
    }
  }

  .arco-tree-node-title-text {
    width: 100%;
    white-space: normal;
    overflow-wrap: anywhere;
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
    display: flex;
    justify-content: start;
    margin-bottom: 10px;
    .arco-btn {
      margin-left: 8px;
      padding: 0 15px;
    }
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
