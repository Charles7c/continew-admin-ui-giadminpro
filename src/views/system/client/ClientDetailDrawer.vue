<template>
  <a-drawer v-model:visible="visible" title="客户端详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="1" size="large" class="general-description">
      <a-descriptions-item label="ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="客户端ID"><a-typography-paragraph :copyable="!!dataDetail?.clientId">{{ dataDetail?.clientId }}</a-typography-paragraph></a-descriptions-item>
      <a-descriptions-item label="客户端Key">{{ dataDetail?.clientKey }}</a-descriptions-item>
      <a-descriptions-item label="客户端秘钥">{{ dataDetail?.clientSecret }}</a-descriptions-item>
      <a-descriptions-item label="认证类型">
        <a-space>
          <GiCellTag v-for="(item, index) in dataDetail?.authType" :key="index" :value="item" :dict="auth_type_enum" />
        </a-space>
      </a-descriptions-item>
      <a-descriptions-item label="客户端类型">
        <GiCellTag :value="dataDetail?.clientType" :dict="client_type" />
      </a-descriptions-item>
      <a-descriptions-item label="Token最低活跃频率">{{ dataDetail?.activeTimeout }}</a-descriptions-item>
      <a-descriptions-item label="Token有效期">{{ dataDetail?.timeout }}</a-descriptions-item>
      <a-descriptions-item label="状态">
        <GiCellStatus :status="dataDetail?.status" />
      </a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ClientDetailResp, getClient as getDetail } from '@/apis/system/client'
import { useDict } from '@/hooks/app'

const {
  client_type,
  auth_type_enum,
} = useDict('client_type', 'auth_type_enum')

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ClientDetailResp>()
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

<style scoped lang="scss"></style>
