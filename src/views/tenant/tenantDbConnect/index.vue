<template>
  <div class="gi_table_page">
    <GiTable
      title="租户数据连接管理"
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
        <a-input v-model="queryForm.connectName" placeholder="请输入连接名称" allow-clear @change="search">
          <template #prefix>
            <icon-search />
          </template>
        </a-input>
        <a-button @click="reset">
          <template #icon>
            <icon-refresh />
          </template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['tenant:tenantDbConnect:add']" type="primary" @click="onAdd">
          <template #icon>
            <icon-plus />
          </template>
          <template #default>新增</template>
        </a-button>
      </template>

      <template #type="{ record }">
        <a-tag v-if="record.type === 0" color="green" size="small">
          <template #default>MYSQL</template>
        </a-tag>
      </template>

      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['tenant:tenantDbConnect:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['tenant:tenantDbConnect:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['tenant:tenantDbConnect:delete']"
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

    <TenantDbConnectAddModal ref="TenantDbConnectAddModalRef" @save-success="search" />
    <TenantDbConnectDetailDrawer ref="TenantDbConnectDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import TenantDbConnectAddModal from './TenantDbConnectAddModal.vue'
import TenantDbConnectDetailDrawer from './TenantDbConnectDetailDrawer.vue'
import {
  type TenantDbConnectQuery,
  type TenantDbConnectResp,
  deleteTenantDbConnect,
  listTenantDbConnect,
} from '@/apis/tenant/tenantDbConnect'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'TenantDbConnect' })

const queryForm = reactive<TenantDbConnectQuery>({
  connectName: undefined,
  sort: ['id,desc'],
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listTenantDbConnect({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstanceColumns[] = [
  { title: '连接ID', dataIndex: 'id', slotName: 'id' },
  { title: '连接名称', dataIndex: 'connectName', slotName: 'connectName', align: 'center' },
  { title: '连接类型', dataIndex: 'type', slotName: 'type', align: 'center' },
  { title: '主机连接地址', dataIndex: 'host', slotName: 'host', align: 'center' },
  { title: '连接端口', dataIndex: 'port', slotName: 'port', align: 'center' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['tenant:tenantDbConnect:detail', 'tenant:tenantDbConnect:update', 'tenant:tenantDbConnect:delete']),
  },
]

// 重置
const reset = () => {
  queryForm.connectName = undefined
  search()
}

// 删除
const onDelete = (record: TenantDbConnectResp) => {
  return handleDelete(() => deleteTenantDbConnect(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  })
}

const TenantDbConnectAddModalRef = ref<InstanceType<typeof TenantDbConnectAddModal>>()
// 新增
const onAdd = () => {
  TenantDbConnectAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: TenantDbConnectResp) => {
  TenantDbConnectAddModalRef.value?.onUpdate(record.id)
}

const TenantDbConnectDetailDrawerRef = ref<InstanceType<typeof TenantDbConnectDetailDrawer>>()
// 详情
const onDetail = (record: TenantDbConnectResp) => {
  TenantDbConnectDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
