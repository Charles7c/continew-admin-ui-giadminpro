<template>
  <div class="gi_table_page">
    <GiTable
      title=""
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      @refresh="search"
    >
      <template #toolbar-left>
        <a-input-search v-model="queryForm.nickname" placeholder="搜索用户名/昵称" allow-clear @search="search" />
        <DateRangePicker v-model="queryForm.loginTime" @change="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #nickname="{ record }">{{ record.nickname }}({{ record.username }})</template>
      <template #action="{ record }">
        <a-space>
          <a-popconfirm
            type="warning"
            content="是否确定强退该用户？"
            :ok-button-props="{ status: 'danger' }"
            @ok="handleKickout(record.token)"
          >
            <a-link
              v-permission="['monitor:online:kickout']"
              status="danger"
              :title="currentToken === record.token ? '不能强退自己' : '强退'"
              :disabled="currentToken === record.token"
            >
              强退
            </a-link>
          </a-popconfirm>
        </a-space>
      </template>
    </GiTable>
  </div>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { type OnlineUserQuery, kickout, listOnlineUser } from '@/apis/monitor'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import DateRangePicker from '@/components/DateRangePicker/index.vue'
import { useUserStore } from '@/stores'
import { useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'MonitorOnline' })

const userStore = useUserStore()
const currentToken = userStore.token

const queryForm = reactive<OnlineUserQuery>({
  sort: ['createTime,desc'],
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
} = useTable((page) => listOnlineUser({ ...queryForm, ...page }), { immediate: true })
const columns: TableInstanceColumns[] = [
  {
    title: '序号',
    width: 66,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
  },
  { title: '用户昵称', dataIndex: 'nickname', slotName: 'nickname', ellipsis: true, tooltip: true },
  { title: '登录 IP', dataIndex: 'ip', ellipsis: true, tooltip: true },
  { title: '登录地点', dataIndex: 'address', ellipsis: true, tooltip: true },
  { title: '浏览器', dataIndex: 'browser', ellipsis: true, tooltip: true },
  { title: '终端系统', dataIndex: 'os', ellipsis: true, tooltip: true },
  { title: '登录时间', dataIndex: 'loginTime', width: 180 },
  { title: '最后活跃时间', dataIndex: 'lastActiveTime', width: 180 },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['monitor:online:kickout']),
  },
]

// 重置
const reset = () => {
  queryForm.nickname = undefined
  queryForm.loginTime = undefined
  search()
}

// 强退
const handleKickout = (token: string) => {
  kickout(token).then(() => {
    search()
    Message.success('强退成功')
  })
}
</script>

<style scoped lang="scss"></style>
