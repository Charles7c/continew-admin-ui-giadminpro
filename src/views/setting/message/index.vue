<template>
  <div class="gi_table_page">
    <GiTable
      row-key="id"
      title="消息中心"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size', 'setting']"
      :disabled-column-keys="['name']"
      :row-selection="{ type: 'checkbox', showCheckedAll: true }"
      :selected-keys="selectedKeys"
      @select-all="selectAll"
      @select="select"
      @refresh="search"
    >
      <template #toolbar-left>
        <a-input v-model="queryForm.title" placeholder="请输入标题" allow-clear @change="search">
          <template #prefix><icon-search /></template>
        </a-input>
        <a-select
          v-model="queryForm.isRead"
          placeholder="请选择状态"
          allow-clear
          style="width: 150px"
          @change="search"
        >
          <a-option :value="false">未读</a-option>
          <a-option :value="true">已读</a-option>
        </a-select>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button type="primary" status="danger" :disabled="!selectedKeys.length" :title="!selectedKeys.length ? '请选择' : ''" @click="onDelete">
          <template #icon><icon-delete /></template>
          <template #default>删除</template>
        </a-button>
        <a-button type="primary" :disabled="!selectedKeys.length" :title="!selectedKeys.length ? '请选择' : ''" @click="onRead">
          <template #default>标记为已读</template>
        </a-button>
        <a-button type="primary" :disabled="selectedKeys.length" :title="!selectedKeys.length ? '请选择' : ''" @click="onReadAll">
          <template #default>全部已读</template>
        </a-button>
      </template>
      <template #title="{ record }">
        <a-tooltip :content="record.content"><span>{{ record.title }}</span></a-tooltip>
      </template>
      <template #isRead="{ record }">
        <a-tag :color="record.isRead ? '' : 'arcoblue'">
          {{ record.isRead ? '已读' : '未读' }}
        </a-tag>
      </template>
      <template #type="{ record }">
        <GiCellTag :value="record.type" :dict="message_type" />
      </template>
    </GiTable>
  </div>
</template>

<script setup lang="ts">
import { Message, Modal } from '@arco-design/web-vue'
import { type MessageQuery, deleteMessage, listMessage, readMessage } from '@/apis'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useTable } from '@/hooks'
import { useDict } from '@/hooks/app'

defineOptions({ name: 'SystemMessage' })

const { message_type } = useDict('message_type')

const queryForm = reactive<MessageQuery>({
  sort: ['createTime,desc'],
})

const {
  tableData: dataList,
  loading,
  pagination,
  selectedKeys,
  select,
  selectAll,
  search,
  handleDelete,
} = useTable((page) => listMessage({ ...queryForm, ...page }), { immediate: true })

const columns: TableInstanceColumns[] = [
  {
    title: '序号',
    width: 66,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
  },
  { title: '标题', dataIndex: 'title', slotName: 'title', minWidth: 100, ellipsis: true, tooltip: true },
  { title: '状态', dataIndex: 'isRead', slotName: 'isRead', align: 'center' },
  { title: '时间', dataIndex: 'createTime', width: 180 },
  { title: '类型', dataIndex: 'type', slotName: 'type', width: 180, ellipsis: true, tooltip: true },
]

// 重置
const reset = () => {
  queryForm.title = undefined
  queryForm.type = undefined
  queryForm.isRead = undefined
  search()
}

// 删除
const onDelete = () => {
  if (!selectedKeys.value.length) {
    return Message.warning('请选择数据')
  }
  return handleDelete(() => deleteMessage(selectedKeys.value), { showModal: false })
}

// 标记为已读
const onRead = async () => {
  if (!selectedKeys.value.length) {
    return Message.warning('请选择数据')
  }
  await readMessage(selectedKeys.value)
  Message.success('操作成功')
  search()
}

// 全部已读
const onReadAll = async () => {
  Modal.warning({
    title: '全部已读',
    content: '确定要标记全部消息为已读吗？',
    hideCancel: false,
    maskClosable: false,
    onOk: async () => {
      await readMessage([])
      Message.success('操作成功')
      search()
    },
  })
}
</script>

<style scoped lang="scss"></style>
