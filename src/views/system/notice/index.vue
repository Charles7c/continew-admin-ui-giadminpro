<template>
  <div class="gi_table_page">
    <GiTable
      row-key="id"
      title=""
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1200 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['title']"
      @refresh="search"
    >
      <template #toolbar-left>
        <a-input-search v-model="queryForm.title" placeholder="搜索标题" allow-clear @search="search" />
        <a-select
          v-model="queryForm.type"
          :options="notice_type"
          placeholder="请选择类型"
          allow-clear
          style="width: 150px"
          @change="search"
        />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['system:notice:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
      </template>
      <template #type="{ record }">
        <GiCellTag :value="record.type" :dict="notice_type" />
      </template>
      <template #status="{ record }">
        <GiCellTag :value="record.status" :dict="notice_status_enum" />
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['system:notice:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['system:notice:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link v-permission="['system:notice:delete']" status="danger" title="删除" @click="onDelete(record)"> 删除 </a-link>
        </a-space>
      </template>
    </GiTable>
  </div>
</template>

<script setup lang="ts">
import { type NoticeQuery, type NoticeResp, deleteNotice, listNotice } from '@/apis/system'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'SystemNotice' })

const { notice_type, notice_status_enum } = useDict('notice_type', 'notice_status_enum')

const router = useRouter()
const queryForm = reactive<NoticeQuery>({
  sort: ['id,desc'],
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listNotice({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstanceColumns[] = [
  {
    title: '序号',
    width: 66,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
  },
  { title: '标题', dataIndex: 'title', slotName: 'title', minWidth: 200, ellipsis: true, tooltip: true },
  { title: '类型', dataIndex: 'type', slotName: 'type', align: 'center' },
  { title: '状态', dataIndex: 'status', slotName: 'status', align: 'center' },
  { title: '生效时间', dataIndex: 'effectiveTime', width: 180 },
  { title: '终止时间', dataIndex: 'terminateTime', width: 180 },
  { title: '创建人', dataIndex: 'createUserString', show: false, ellipsis: true, tooltip: true },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['system:notice:detail', 'system:notice:update', 'system:notice:delete']),
  },
]

// 重置
const reset = () => {
  queryForm.title = undefined
  queryForm.type = undefined
  search()
}

// 删除
const onDelete = (record: NoticeResp) => {
  return handleDelete(() => deleteNotice(record.id), {
    content: `是否确定删除公告「${record.title}」？`,
    showModal: true,
  })
}

// 新增
const onAdd = () => {
  router.push({ path: '/system/notice/add' })
}

// 修改
const onUpdate = (record: NoticeResp) => {
  router.push({ path: '/system/notice/add', query: { id: record.id, type: 'update' } })
}

// 详情
const onDetail = (record: NoticeResp) => {
  router.push({ path: '/system/notice/detail', query: { id: record.id } })
}
</script>

<style scoped lang="scss"></style>
