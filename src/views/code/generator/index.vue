<template>
  <div class="gi_table_page">
    <GiTable
      v-model:selectedKeys="selectedKeys"
      title=""
      row-key="tableName"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size', 'setting']"
      :disabled-column-keys="['tableName']"
      :row-selection="{ type: 'checkbox', showCheckedAll: true }"
      @select="select"
      @select-all="selectAll"
      @refresh="search"
    >
      <template #toolbar-left>
        <a-input-search v-model="queryForm.tableName" placeholder="搜索表名称" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button type="primary" :disabled="!selectedKeys.length" :title="!selectedKeys.length ? '请选择' : ''" @click="onPreview(selectedKeys)">
          <template #icon><icon-code-sandbox /></template>
          <template #default>批量生成</template>
        </a-button>
      </template>
      <template #toolbar-bottom>
        <a-alert>
          <template v-if="selectedKeys.length > 0">
            已选中 {{ selectedKeys.length }} 条记录(可跨页)
          </template>
          <template v-else>未选中任何记录</template>
          <template v-if="selectedKeys.length > 0" #action>
            <a-link @click="onClearSelected">清空</a-link>
          </template>
        </a-alert>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['code:generator:config']" title="配置" @click="onConfig(record.tableName, record.comment)">配置</a-link>
          <a-link
            v-permission="['code:generator:preview']"
            :disabled="!record.createTime"
            :title="record.createTime ? '生成' : '请先进行生成配置'"
            @click="onPreview([record.tableName])"
          >
            生成
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <GenConfigDrawer ref="GenConfigDrawerRef" @save-success="search" />
    <GenPreviewModal ref="GenPreviewModalRef" @generate="onGenerate" @download="onDownload" />
  </div>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import GenConfigDrawer from './GenConfigDrawer.vue'
import { downloadCode, generateCode, listGenConfig } from '@/apis/code/generator'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useTable } from '@/hooks'
import { isMobile } from '@/utils'

defineOptions({ name: 'CodeGenerator' })
const GenPreviewModal = defineAsyncComponent(() => import('./GenPreviewModal.vue'))

const queryForm = reactive({
  tableName: undefined,
})

const {
  tableData: dataList,
  loading,
  pagination,
  selectedKeys,
  select,
  selectAll,
  search,
} = useTable((page) => listGenConfig({ ...queryForm, ...page }), { immediate: true, formatResult: (data) => data.map((i) => ({ ...i, disabled: !i.createTime })) })
const columns: TableInstanceColumns[] = [
  {
    title: '序号',
    width: 66,
    align: 'center',
    render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (pagination.current - 1) * pagination.pageSize),
  },
  { title: '表名称', dataIndex: 'tableName', minWidth: 225, ellipsis: true, tooltip: true },
  { title: '描述', dataIndex: 'comment', ellipsis: true, tooltip: true },
  { title: '类名前缀', dataIndex: 'classNamePrefix', ellipsis: true, tooltip: true },
  { title: '作者名称', dataIndex: 'author' },
  { title: '所属模块', dataIndex: 'moduleName', ellipsis: true, tooltip: true },
  { title: '模块包名', dataIndex: 'packageName', ellipsis: true, tooltip: true },
  { title: '配置时间', dataIndex: 'createTime', width: 180 },
  { title: '修改时间', dataIndex: 'updateTime', width: 180 },
  { title: '操作', dataIndex: 'action', slotName: 'action', width: 160, align: 'center', fixed: !isMobile() ? 'right' : undefined },
]

// 重置
const reset = () => {
  queryForm.tableName = undefined
  search()
}

// 清空所有选中数据
const onClearSelected = () => {
  selectedKeys.value = []
}

const GenConfigDrawerRef = ref<InstanceType<typeof GenConfigDrawer>>()
// 配置
const onConfig = (tableName: string, comment: string) => {
  GenConfigDrawerRef.value?.onOpen(tableName, comment)
}

const GenPreviewModalRef = ref<InstanceType<typeof GenPreviewModal>>()
// 预览
const onPreview = (tableNames: Array<string>) => {
  GenPreviewModalRef.value?.onOpen(tableNames)
}

// 生成
const onDownload = async (tableNames: Array<string>) => {
  const res = await downloadCode(tableNames)
  const contentDisposition = res.headers['content-disposition']
  const pattern = /filename=([^;]+\.[^.;]+);*/
  const result = pattern.exec(contentDisposition) || ''
  // 对名字进行解码
  const fileName = window.decodeURI(result[1])
  // 创建下载的链接
  const blob = new Blob([res.data])
  const downloadElement = document.createElement('a')
  const href = window.URL.createObjectURL(blob)
  downloadElement.style.display = 'none'
  downloadElement.href = href
  // 下载后文件名
  downloadElement.download = fileName
  document.body.appendChild(downloadElement)
  // 点击下载
  downloadElement.click()
  // 下载完成，移除元素
  document.body.removeChild(downloadElement)
  // 释放掉 blob 对象
  window.URL.revokeObjectURL(href)
}

// 生成
const onGenerate = async (tableNames: Array<string>) => {
  const res = await generateCode(tableNames)
  if (res.code === 0) {
    Message.success('代码生成成功')
  }
}
</script>

<style scoped lang="scss"></style>
