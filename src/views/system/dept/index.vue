<template>
  <div class="gi_table_page">
    <div class="header-actions">
      <a-radio-group v-model="viewType" type="button" size="small" style="margin-bottom: 16px;">
        <a-radio value="table">表格视图</a-radio>
        <a-radio value="tree">组织架构图</a-radio>
      </a-radio-group>
    </div>
    <GiTable
      v-show="viewType === 'table'"
      ref="tableRef"
      title=""
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="false"
      :disabled-column-keys="['name']"
      @refresh="search"
    >
      <template #expand-icon="{ expanded }">
        <IconDown v-if="expanded" />
        <IconRight v-else />
      </template>
      <template #toolbar-left>
        <a-input v-model="name" placeholder="搜索名称" allow-clear>
          <template #prefix><icon-search /></template>
        </a-input>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['system:dept:add']" type="primary" @click="onAdd()">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['system:dept:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #status="{ record }">
        <GiCellStatus :status="record.status" />
      </template>
      <template #isSystem="{ record }">
        <a-tag v-if="record.isSystem" color="red" size="small">是</a-tag>
        <a-tag v-else color="arcoblue" size="small">否</a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['system:dept:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['system:dept:delete']"
            status="danger"
            :disabled="record.isSystem"
            :title="record.isSystem ? '系统内置数据不能删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link>
          <a-link v-permission="['system:dept:add']" title="新增" @click="onAdd(record.id)">新增</a-link>
        </a-space>
      </template>
    </GiTable>
    <!-- 组织架构图视图 -->
    <div v-show="viewType === 'tree'">
      <a-card>
        <a-dropdown trigger="contextMenu">
          <Vue3TreeOrg
            v-if="dataList.length"
            :data="dataList[0]"
            :collapsable="true"
            :horizontal="false"
            :define-menus="menus"
            :expand-all="true"
            :default-expand-level="999"
            :props="{ id: 'id', parentId: 'parentId', label: 'name', children: 'children' }"
            center
            :node-add="handleAdd"
            :node-delete="onDelete"
            :node-edit="onUpdate"
            @on-expand-all="bool => nodeExpandAll = bool"
          >
          </Vue3TreeOrg>
        </a-dropdown>
      </a-card>
    </div>
    <DeptAddModal ref="DeptAddModalRef" :depts="dataList" @save-success="search" />
  </div>
</template>

<script setup lang="ts">
import 'vue3-tree-org/lib/vue3-tree-org.css'
import { Vue3TreeOrg } from 'vue3-tree-org'
import DeptAddModal from './DeptAddModal.vue'
import { type DeptQuery, type DeptResp, deleteDept, exportDept, listDept } from '@/apis/system/dept'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import type GiTable from '@/components/GiTable/index.vue'
import { useDownload, useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'SystemDept' })

const queryForm = reactive<DeptQuery>({})
const tableRef = ref<InstanceType<typeof GiTable>>()
const {
  tableData,
  loading,
  search,
  handleDelete,
} = useTable(() => listDept(queryForm), {
  immediate: true,
  onSuccess: () => {
    nextTick(() => {
      tableRef.value?.tableRef?.expandAll(true)
    })
  },
})
// 查看视图类型
const viewType = ref('table')
// 组织架构图右键菜单
const menus = [
  { name: '添加部门', command: 'add' },
  { name: '编辑部门', command: 'edit' },
  { name: '删除部门', command: 'delete' },
]
// 所有节点展开状态
const nodeExpandAll = ref<boolean>(true)
// 过滤树
const searchData = (name: string) => {
  const loop = (data: DeptResp[]) => {
    const result = [] as DeptResp[]
    data.forEach((item: DeptResp) => {
      if (item.name?.toLowerCase().includes(name.toLowerCase())) {
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
  return loop(tableData.value)
}

const name = ref('')
const dataList = computed(() => {
  if (!name.value) return tableData.value
  return searchData(name.value)
})

const columns: TableInstanceColumns[] = [
  { title: '名称', dataIndex: 'name', minWidth: 170, ellipsis: true, tooltip: true },
  { title: '状态', dataIndex: 'status', slotName: 'status', align: 'center' },
  { title: '排序', dataIndex: 'sort', align: 'center', show: false },
  { title: '系统内置', dataIndex: 'isSystem', slotName: 'isSystem', align: 'center', show: false },
  { title: '描述', dataIndex: 'description', ellipsis: true, tooltip: true },
  { title: '创建人', dataIndex: 'createUserString', ellipsis: true, tooltip: true, show: false },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '修改人', dataIndex: 'updateUserString', ellipsis: true, tooltip: true, show: false },
  { title: '修改时间', dataIndex: 'updateTime', width: 180, show: false },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['system:dept:update', 'system:dept:delete', 'system:dept:add']),
  },
]

// 重置
const reset = () => {
  name.value = ''
}

// 删除
const onDelete = (record: DeptResp) => {
  return handleDelete(() => deleteDept(record.id), {
    content: `是否确定删除部门「${record.name}」？`,
    showModal: true,
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportDept(queryForm))
}

const DeptAddModalRef = ref<InstanceType<typeof DeptAddModal>>()
// 新增
const onAdd = (parentId?: string) => {
  DeptAddModalRef.value?.onAdd(parentId)
}
const handleAdd = (record: DeptResp) => {
  onAdd(record.id)
}
// 修改
const onUpdate = (record: DeptResp) => {
  DeptAddModalRef.value?.onUpdate(record.id)
}
</script>

<style scoped lang="scss">
:deep(.zm-draggable) {
  margin-top: 4px;
}

:deep(.zm-tree-org .zoom-container) {
  background-color: var(--color-bg-1);
  color: var(--color-text-1);
}

:deep(.tree-org-node__content) {
  background-color: var(--color-bg-2);
  color: var(--color-text-1);
  cursor: pointer;
  position: relative;
}

.zm-tree-org {
  background-color: var(--color-bg-1);
  height: calc(100vh - 265px);
}

:global(.zm-tree-contextmenu) {
  color: var(--color-text-1) !important;
  position: fixed !important;
  background: var(--color-bg-2) !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 4px !important;
  padding: 4px 0 !important;
  min-width: 120px !important;
  z-index: 999 !important;

  ul {
    background: var(--color-bg-1) !important;
    list-style-type: none !important;
    padding: 10px !important;
    margin: 0 !important;
  }

  .zm-tree-menu-item {
    background-color: var(--color-bg-1) !important;
    padding: 5px 15px !important;
    margin-top: 10px !important;
    cursor: pointer !important;
    transition: background-color 0.1s ease !important;
    list-style: none !important;
  }
}
:deep(.tree-org-node__expand){
  background-color: var(--color-bg-1) !important;
}
</style>
