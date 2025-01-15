<template>
  <div class="gi_table_page">
    <GiTable
      title="租户套餐管理"
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['name']"
      @refresh="search"
    >
      <template #toolbar-left>
        <a-input v-model="queryForm.name" placeholder="请输入套餐名称" allow-clear @change="search">
          <template #prefix><icon-search /></template>
        </a-input>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['tenant:package:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
      </template>
      <template #status="{ record }">
        <GiCellStatus :status="record.status" />
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['tenant:package:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['tenant:package:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['tenant:package:delete']"
            status="danger"
            :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <TenantPackageAddModal ref="TenantPackageAddModalRef" @save-success="search" />
    <TenantPackageDetailDrawer ref="TenantPackageDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import TenantPackageAddModal from './TenantPackageAddModal.vue'
import TenantPackageDetailDrawer from './TenantPackageDetailDrawer.vue'
import {
  type TenantPackageQuery,
  type TenantPackageResp,
  deleteTenantPackage,
  listTenantPackage,
} from '@/apis/tenant/tenantPackage'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'TenantPackage' })

const queryForm = reactive<TenantPackageQuery>({
  name: undefined,
  status: undefined,
  sort: ['id,desc'],
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listTenantPackage({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstanceColumns[] = [
  { title: '套餐ID', dataIndex: 'id', slotName: 'id' },
  { title: '套餐名称', dataIndex: 'name', slotName: 'name' },
  { title: '套餐状态', dataIndex: 'status', slotName: 'status' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['tenant:package:detail', 'tenant:package:update', 'tenant:package:delete']),
  },
]

// 重置
const reset = () => {
  queryForm.name = undefined
  queryForm.status = undefined
  search()
}

// 删除
const onDelete = (record: TenantPackageResp) => {
  return handleDelete(() => deleteTenantPackage(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  })
}

const TenantPackageAddModalRef = ref<InstanceType<typeof TenantPackageAddModal>>()
// 新增
const onAdd = () => {
  TenantPackageAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: TenantPackageResp) => {
  TenantPackageAddModalRef.value?.onUpdate(record.id)
}

const TenantPackageDetailDrawerRef = ref<InstanceType<typeof TenantPackageDetailDrawer>>()
// 详情
const onDetail = (record: TenantPackageResp) => {
  TenantPackageDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
