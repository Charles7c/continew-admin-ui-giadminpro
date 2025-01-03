<template>
  <div class="table-page">
    <a-row justify="space-between" align="center" class="header page_header">
      <a-space wrap>
        <div class="title">字典管理</div>
      </a-space>
    </a-row>
    <SplitPanel>
      <template #left>
        <DictTree @node-click="handleSelectDict" />
      </template>
      <template #main>
        <a-row align="stretch" :gutter="14" class="h-full page_content">
          <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" :xxl="24" flex="1" class="h-full ov-hidden">
            <GiTable
              row-key="id"
              :data="dataList"
              :columns="columns"
              :loading="loading"
              :scroll="{ x: '100%', y: '100%', minWidth: 600 }"
              :pagination="pagination"
              :disabled-tools="['size']"
              :disabled-column-keys="['label']"
              @refresh="search"
            >
              <template #toolbar-left>
                <a-input-search v-model="queryForm.description" placeholder="搜索标签/描述" allow-clear @search="search" />
                <a-button @click="reset">
                  <template #icon><icon-refresh /></template>
                  <template #default>重置</template>
                </a-button>
              </template>
              <template #toolbar-right>
                <a-button v-permission="['system:dict:item:add']" type="primary" @click="onAdd">
                  <template #icon><icon-plus /></template>
                  <template #default>新增</template>
                </a-button>
              </template>
              <template #label="{ record }">
                <a-tag :color="record.color">{{ record.label }}</a-tag>
              </template>
              <template #status="{ record }">
                <GiCellStatus :status="record.status" />
              </template>
              <template #action="{ record }">
                <a-space>
                  <a-link v-permission="['system:dict:item:update']" title="修改" @click="onUpdate(record)">修改</a-link>
                  <a-link
                    v-permission="['system:dict:item:delete']"
                    status="danger"
                    title="删除"
                    @click="onDelete(record)"
                  >
                    删除
                  </a-link>
                </a-space>
              </template>
            </GiTable>
          </a-col>
        </a-row>
      </template>
    </SplitPanel>

    <DictItemAddModal ref="DictItemAddModalRef" @save-success="search" />
  </div>
</template>

<script setup lang="ts">
import DictTree from './tree/index.vue'
import DictItemAddModal from './DictItemAddModal.vue'
import { type DictItemQuery, type DictItemResp, deleteDictItem, listDictItem } from '@/apis/system/dict'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'SystemDict' })

const queryForm = reactive<DictItemQuery>({
  dictId: '',
  sort: ['createTime,desc'],
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listDictItem({ ...queryForm, ...page }), { immediate: false })
const columns: TableInstanceColumns[] = [
  {
    title: '序号',
    width: 66,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
  },
  { title: '标签', dataIndex: 'label', slotName: 'label', minWidth: 100, align: 'center' },
  { title: '值', dataIndex: 'value', minWidth: 100, align: 'center', ellipsis: true, tooltip: true },
  { title: '状态', dataIndex: 'status', slotName: 'status', align: 'center' },
  {
    title: '排序',
    dataIndex: 'sort',
    align: 'center',
    sortable: {
      sortDirections: ['ascend', 'descend'],
    },
  },
  { title: '描述', dataIndex: 'description', minWidth: 130, ellipsis: true, tooltip: true },
  { title: '创建人', dataIndex: 'createUserString', width: 140, ellipsis: true, tooltip: true, show: false },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '修改人', dataIndex: 'updateUserString', width: 140, ellipsis: true, tooltip: true, show: false },
  { title: '修改时间', dataIndex: 'updateTime', width: 180, show: false },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 130,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['system:dict:item:update', 'system:dict:item:delete']),
  },
]

// 重置
const reset = () => {
  queryForm.description = undefined
  queryForm.status = undefined
  search()
}

// 删除
const onDelete = (record: DictItemResp) => {
  return handleDelete(() => deleteDictItem(record.id), {
    content: `是否确定删除字典「${record.label}」？`,
    showModal: true,
  })
}

// 根据选中字典查询
const handleSelectDict = (keys: Array<any>) => {
  queryForm.dictId = keys.length === 1 ? keys[0] : undefined
  search()
}

const DictItemAddModalRef = ref<InstanceType<typeof DictItemAddModal>>()
// 新增
const onAdd = () => {
  DictItemAddModalRef.value?.onAdd(queryForm.dictId)
}

// 修改
const onUpdate = (record: DictItemResp) => {
  DictItemAddModalRef.value?.onUpdate(record.id)
}
</script>

<style scoped lang="scss">
.page_header {
  flex: 0 0 auto;
}

.page_content {
  flex: 1;
  overflow: auto;
}
</style>
