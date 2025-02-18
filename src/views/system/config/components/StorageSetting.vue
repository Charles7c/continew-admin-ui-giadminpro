<template>
  <a-spin :loading="loading">
    <a-form
      ref="formRef"
      :model="form"
      :rules="rules"
      auto-label-width
      label-align="left"
      :layout="width >= 500 ? 'horizontal' : 'vertical'"
      :disabled="!isUpdate"
      scroll-to-first-error
    >
      <!-- 默认存储 -->
      <a-form-item
        field="STORAGE_DEFAULT"
        :label="storageConfig.STORAGE_DEFAULT.name"
        :help="storageConfig.STORAGE_DEFAULT.description"
        hide-asterisk
      >
        <a-radio-group v-model="form.STORAGE_DEFAULT">
          <a-radio value="LOCAL">本地存储</a-radio>
          <a-radio value="S3">对象存储</a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- 本地存储分组 -->
      <a-divider>本地存储配置</a-divider>
      <a-form-item
        field="STORAGE_LOCAL_BUCKET"
        :label="storageConfig.STORAGE_LOCAL_BUCKET.name"
        :help="storageConfig.STORAGE_LOCAL_BUCKET.description"
        hide-asterisk
      >
        <a-input v-model="form.STORAGE_LOCAL_BUCKET" class="input-width" placeholder="请输入绝对路径" />
      </a-form-item>
      <a-form-item
        field="STORAGE_LOCAL_ENDPOINT"
        :label="storageConfig.STORAGE_LOCAL_ENDPOINT.name"
        :help="storageConfig.STORAGE_LOCAL_ENDPOINT.description"
        hide-asterisk
      >
        <a-input v-model="form.STORAGE_LOCAL_ENDPOINT" class="input-width" placeholder="请输入本地终端节点" />
      </a-form-item>

      <!-- S3存储分组 -->
      <a-divider>对象存储配置</a-divider>
      <a-form-item
        field="STORAGE_S3_ACCESS_KEY"
        :label="storageConfig.STORAGE_S3_ACCESS_KEY.name"
        :help="storageConfig.STORAGE_S3_ACCESS_KEY.description"
        hide-asterisk
      >
        <a-input v-model="form.STORAGE_S3_ACCESS_KEY" class="input-width" />
      </a-form-item>
      <a-form-item
        field="STORAGE_S3_SECRET_KEY"
        :label="storageConfig.STORAGE_S3_SECRET_KEY.name"
        :help="storageConfig.STORAGE_S3_SECRET_KEY.description"
        hide-asterisk
      >
        <a-input-password v-model="form.STORAGE_S3_SECRET_KEY" class="input-width" />
      </a-form-item>
      <a-form-item
        field="STORAGE_S3_BUCKET"
        :label="storageConfig.STORAGE_S3_BUCKET.name"
        :help="storageConfig.STORAGE_S3_BUCKET.description"
        hide-asterisk
      >
        <a-input v-model="form.STORAGE_S3_BUCKET" class="input-width" />
      </a-form-item>
      <a-form-item
        field="STORAGE_S3_ENDPOINT"
        :label="storageConfig.STORAGE_S3_ENDPOINT.name"
        :help="storageConfig.STORAGE_S3_ENDPOINT.description"
        hide-asterisk
      >
        <a-input v-model="form.STORAGE_S3_ENDPOINT" class="input-width" />
      </a-form-item>
      <a-form-item
        field="STORAGE_S3_REGION"
        :label="storageConfig.STORAGE_S3_REGION.name"
        :help="storageConfig.STORAGE_S3_REGION.description"
        hide-asterisk
      >
        <a-input v-model="form.STORAGE_S3_REGION" class="input-width" />
      </a-form-item>

      <!-- 操作按钮 -->
      <a-space style="margin-bottom: 16px">
        <a-button v-if="!isUpdate" v-permission="['system:config:update']" type="primary" @click="onUpdate">
          <template #icon>
            <icon-edit />
          </template>
          修改
        </a-button>
        <a-button v-if="!isUpdate" v-permission="['system:config:reset']" @click="onResetValue">
          <template #icon>
            <icon-undo />
          </template>
          恢复默认
        </a-button>
        <a-button v-if="isUpdate" type="primary" @click="handleSave">
          <template #icon>
            <icon-save />
          </template>
          保存
        </a-button>
        <a-button v-if="isUpdate" @click="reset">
          <template #icon>
            <icon-refresh />
          </template>
          重置
        </a-button>
        <a-button v-if="isUpdate" @click="handleCancel">
          <template #icon>
            <icon-undo />
          </template>
          取消
        </a-button>
      </a-space>
    </a-form>
  </a-spin>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type FormInstance, Message, Modal } from '@arco-design/web-vue'
import {
  type OptionResp,
  type SecurityConfig,
  type StorageConfig,
  listOption,
  resetOptionValue,
  updateOption,
} from '@/apis/system'
import { useResetReactive } from '@/hooks'

defineOptions({ name: 'StorageSetting' })
const { width } = useWindowSize()

const loading = ref<boolean>(false)
const formRef = ref<FormInstance>()

const [form] = useResetReactive({
  STORAGE_DEFAULT: 'LOCAL', // 默认选中本地存储
  STORAGE_LOCAL_BUCKET: '',
  STORAGE_LOCAL_ENDPOINT: '',
  STORAGE_S3_ACCESS_KEY: '',
  STORAGE_S3_SECRET_KEY: '',
  STORAGE_S3_BUCKET: '',
  STORAGE_S3_ENDPOINT: '',
  STORAGE_S3_REGION: '',
})

const rules: FormInstance['rules'] = {
  STORAGE_LOCAL_BUCKET: [{ required: true, message: '请输入本地存储路径' }],
  STORAGE_LOCAL_ENDPOINT: [{ required: true, message: '请输入本地终端地址' }],
  STORAGE_S3_ACCESS_KEY: [{ required: true, message: '请输入对象存储访问密钥' }],
  STORAGE_S3_SECRET_KEY: [{ required: true, message: '请输入对象存储私有密钥' }],
  STORAGE_S3_BUCKET: [{ required: true, message: '请输入对象存储存储桶名称' }],
  STORAGE_S3_ENDPOINT: [{ required: true, message: '请输入对象存储终端节点' }],
}

const storageConfig = ref<StorageConfig>({
  STORAGE_DEFAULT: {},
  STORAGE_LOCAL_BUCKET: {},
  STORAGE_LOCAL_ENDPOINT: {},
  STORAGE_S3_ACCESS_KEY: {},
  STORAGE_S3_SECRET_KEY: {},
  STORAGE_S3_BUCKET: {},
  STORAGE_S3_ENDPOINT: {},
  STORAGE_S3_REGION: {},
})

const reset = () => {
  formRef.value?.resetFields()
  Object.keys(form).forEach((key) => {
    form[key] = storageConfig.value[key]?.value || form[key] // 兜底设置默认值
  })
}

const isUpdate = ref(false)

const onUpdate = () => {
  isUpdate.value = true
}

const handleCancel = () => {
  reset()
  isUpdate.value = false
}

const queryForm = { category: 'STORAGE' }

const getDataList = async () => {
  loading.value = true
  const { data } = await listOption(queryForm)
  storageConfig.value = data.reduce((obj: SecurityConfig, option: OptionResp) => {
    obj[option.code] = { ...option, value: option.value }
    return obj
  }, {})
  reset() // 初始化时同步表单值
  loading.value = false
}

const handleSave = async () => {
  const isInvalid = await formRef.value?.validate()
  if (isInvalid) return
  await updateOption(
    Object.entries(form).map(([key, value]) => ({ id: storageConfig.value[key].id, code: key, value })),
  )
  await getDataList()
  Message.success('保存成功')
}

const handleResetValue = async () => {
  await resetOptionValue(queryForm)
  Message.success('恢复成功')
  await getDataList()
}

const onResetValue = () => {
  Modal.warning({
    title: '警告',
    content: '确认恢复存储配置为默认值吗？',
    hideCancel: false,
    maskClosable: false,
    onOk: handleResetValue,
  })
}

onMounted(() => {
  getDataList()
})
</script>

<style scoped lang="scss">
.input-width {
  width: 300px;
}
</style>
