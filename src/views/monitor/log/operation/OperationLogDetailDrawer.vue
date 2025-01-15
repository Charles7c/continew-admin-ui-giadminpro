<template>
  <a-drawer v-model:visible="visible" title="日志详情" :width="720" :footer="false">
    <a-descriptions title="基本信息" :column="2" size="large" class="general-description">
      <a-descriptions-item label="日志 ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="Trace ID"><a-typography-paragraph :copyable="!!dataDetail?.traceId">{{ dataDetail?.traceId }}</a-typography-paragraph></a-descriptions-item>
      <a-descriptions-item label="操作人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="操作时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="操作内容">{{ dataDetail?.description }}</a-descriptions-item>
      <a-descriptions-item label="所属模块">{{ dataDetail?.module }}</a-descriptions-item>
      <a-descriptions-item label="操作 IP"><a-typography-paragraph :copyable="!!dataDetail?.ip">{{ dataDetail?.ip }}</a-typography-paragraph></a-descriptions-item>
      <a-descriptions-item label="操作地点">{{ dataDetail?.address }}</a-descriptions-item>
      <a-descriptions-item label="浏览器">{{ dataDetail?.browser }}</a-descriptions-item>
      <a-descriptions-item label="终端系统">{{ dataDetail?.os }}</a-descriptions-item>
      <a-descriptions-item label="状态">
        <a-tag v-if="dataDetail?.status === 1" color="green">成功</a-tag>
        <a-tag v-else color="red">失败</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="耗时">
        <a-tag v-if="dataDetail?.timeTaken > 500" color="red"> {{ dataDetail?.timeTaken }}ms </a-tag>
        <a-tag v-else-if="dataDetail?.timeTaken > 200" color="orange"> {{ dataDetail?.timeTaken }}ms </a-tag>
        <a-tag v-else color="green">{{ dataDetail?.timeTaken }} ms</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="请求 URI" :span="2">
        <a-typography-paragraph :copyable="!!dataDetail?.requestUrl">{{ dataDetail?.requestUrl }}</a-typography-paragraph>
      </a-descriptions-item>
    </a-descriptions>
    <a-descriptions
      title="响应信息"
      :column="2"
      size="large"
      class="general-description http"
      style="margin-top: 20px; position: relative"
    >
      <a-descriptions-item :span="2">
        <a-tabs type="card">
          <a-tab-pane key="1" title="响应头">
            <JsonPretty v-if="dataDetail?.responseHeaders" :json="dataDetail?.responseHeaders" />
            <span v-else>无</span>
          </a-tab-pane>
          <a-tab-pane key="2" title="响应体">
            <JsonPretty v-if="dataDetail?.responseBody" :json="dataDetail?.responseBody" />
            <span v-else>无</span>
          </a-tab-pane>
        </a-tabs>
      </a-descriptions-item>
    </a-descriptions>
    <a-descriptions
      title="请求信息"
      :column="2"
      size="large"
      class="general-description http"
      style="margin-top: 20px; position: relative"
    >
      <a-descriptions-item :span="2">
        <a-tabs type="card">
          <a-tab-pane key="1" title="请求头">
            <JsonPretty v-if="dataDetail?.requestHeaders" :json="dataDetail?.requestHeaders" />
            <span v-else>无</span>
          </a-tab-pane>
          <a-tab-pane key="2" title="请求体">
            <JsonPretty v-if="dataDetail?.requestBody" :json="dataDetail?.requestBody" />
            <span v-else>无</span>
          </a-tab-pane>
        </a-tabs>
      </a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { type LogDetailResp, getLog as getDetail } from '@/apis/monitor'

const dataId = ref('')
const dataDetail = ref<LogDetailResp>()
const visible = ref(false)

// 查询详情
const getDataDetail = async () => {
  const { data } = await getDetail(dataId.value)
  dataDetail.value = data
}

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  await getDataDetail()
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss">
.http :deep(.arco-descriptions-item-label-block) {
  padding-right: 0;
}

:deep(.arco-tabs-content) {
  padding-top: 5px;
  padding-left: 15px;
}
</style>
