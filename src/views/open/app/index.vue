<template>
  <div class="gi_table_page">
    <GiTable
      title=""
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1300 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['name']"
      @refresh="search"
    >
      <template #toolbar-left>
        <a-input-search v-model="queryForm.description" placeholder="搜索名称/描述" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['open:app:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['open:app:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #accessKey="{ record }">
        <CellCopy :content="record.accessKey" />
      </template>
      <template #secretKey="{ record }">
        <a-space v-if="record.secretKey" :size="[2]">
          <CellCopy :content="record.secretKey" />
          <a-tooltip content="隐藏">
            <a-button type="text" size="mini" @click="onSecretHide(record)">
              <template #icon><icon-eye-invisible size="16" /></template>
            </a-button>
          </a-tooltip>
        </a-space>
        <a-space v-else :size="[2]">
          <span>********************</span>
          <a-tooltip content="显示">
            <a-button v-permission="['open:app:secret']" type="text" size="mini" @click="onSecret(record)">
              <template #icon><icon-eye size="16" /></template>
            </a-button>
          </a-tooltip>
        </a-space>
      </template>
      <template #status="{ record }">
        <GiCellStatus :status="record.status" />
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['open:app:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['open:app:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['open:app:delete']"
            status="danger"
            :disabled="record.disabled"
            :title="record.disabled ? '禁止删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link>
          <a-dropdown>
            <a-button v-if="has.hasPermOr(['open:app:resetSecret'])" type="text" size="mini" title="更多">
              <template #icon>
                <icon-more :size="16" />
              </template>
            </a-button>
            <template #content>
              <a-doption v-permission="['open:app:resetSecret']" title="重置密钥" @click="onResetSecret(record)">重置密钥</a-doption>
            </template>
          </a-dropdown>
        </a-space>
      </template>
    </GiTable>

    <AppAddModal ref="AppAddModalRef" @save-success="search" />
    <AppDetailDrawer ref="AppDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import { Message, Modal } from '@arco-design/web-vue'
import AppAddModal from './AppAddModal.vue'
import AppDetailDrawer from './AppDetailDrawer.vue'
import {
  type AppQuery,
  type AppResp,
  deleteApp,
  exportApp,
  getAppSecret,
  listApp,
  resetAppSecret,
} from '@/apis/open/app'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'OpenApp' })

const queryForm = reactive<AppQuery>({
  sort: ['id,desc'],
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listApp({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstanceColumns[] = [
  {
    title: '序号',
    width: 66,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: !isMobile() ? 'left' : undefined,
  },
  { title: '名称', dataIndex: 'name', slotName: 'name', ellipsis: true, tooltip: true, fixed: !isMobile() ? 'left' : undefined },
  { title: 'Access Key', dataIndex: 'accessKey', slotName: 'accessKey', width: 200 },
  { title: 'Secret Key', dataIndex: 'secretKey', slotName: 'secretKey', width: 200 },
  { title: '失效时间', dataIndex: 'expireTime', width: 180 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 80, align: 'center' },
  { title: '描述', dataIndex: 'description', ellipsis: true, tooltip: true },
  { title: '创建人', dataIndex: 'createUserString', ellipsis: true, tooltip: true, show: false },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '修改人', dataIndex: 'updateUserString', ellipsis: true, tooltip: true, show: false },
  { title: '修改时间', dataIndex: 'updateTime', width: 180, show: false },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 190,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr([
      'open:app:detail',
      'open:app:update',
      'open:app:delete',
      'open:app:resetSecret',
    ]),
  },
]

// 重置
const reset = () => {
  queryForm.description = undefined
  search()
}

// 删除
const onDelete = (record: AppResp) => {
  return handleDelete(() => deleteApp(record.id), {
    content: `是否确定删除应用「${record.name}」？`,
    showModal: true,
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportApp(queryForm))
}

// 查看密钥
const onSecret = async (record: AppResp) => {
  const { data } = await getAppSecret(record.id)
  record.secretKey = data.secretKey
}

// 隐藏显示密钥
const onSecretHide = (record: AppResp) => {
  record.secretKey = undefined
}

// 重置密钥
const onResetSecret = async (record: AppResp) => {
  Modal.warning({
    title: '提示',
    content: `是否确定重置应用「${record.name}」密钥？`,
    okButtonProps: { status: 'warning' },
    hideCancel: false,
    maskClosable: false,
    onBeforeOk: async () => {
      try {
        await resetAppSecret(record.id)
        Message.success('重置成功')
        search()
        return true
      } catch (error) {
        return false
      }
    },
  })
}

const AppAddModalRef = ref<InstanceType<typeof AppAddModal>>()
// 新增
const onAdd = () => {
  AppAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: AppResp) => {
  AppAddModalRef.value?.onUpdate(record.id)
}

const AppDetailDrawerRef = ref<InstanceType<typeof AppDetailDrawer>>()
// 详情
const onDetail = (record: AppResp) => {
  AppDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
