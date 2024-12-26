<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    draggable
    :width="width >= 500 ? 500 : '100%'"
    @before-ok="save"
    @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :options="options" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { addTenant, getTenant, listAllDbConnect, listAllPackage, updateTenant } from '@/apis/tenant/tenant'
import { type Columns, GiForm, type Options } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'
import { encryptByRsa } from '@/utils/encrypt'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改租户' : '新增租户'))
const formRef = ref<InstanceType<typeof GiForm>>()
const { dis_enable_status_enum } = useDict('dis_enable_status_enum')

const options: Options = {
  form: { size: 'large' },
  btns: { hide: true },
}

const tenantListOptions = ref([])
const dbConnectListOptions = ref([])

const getListAllTenantPackage = async () => {
  const data = await listAllPackage()
  tenantListOptions.value = []
  data.data.forEach((item: any) => {
    tenantListOptions.value.push({ label: item.name, value: item.id, disabled: item.status != 1 })
  })
}

const getListAllDbConnect = async () => {
  const data = await listAllDbConnect()
  dbConnectListOptions.value = []
  data.data.forEach((item: any) => {
    dbConnectListOptions.value.push({ label: item.connectName, value: item.id })
  })
}

const [form, resetForm] = useResetReactive({
  status: 2,
  plaintextPwd: undefined,
})

const columns: Columns = reactive([
  {
    label: '租户名称',
    field: 'name',
    type: 'input',
    rules: [{ required: true, message: '请输入租户名称' }],
  },
  {
    label: '登陆用户',
    field: 'username',
    type: 'input',
    props: {
      placeholder: '请输入用户名',
      maxLength: 64,
      showWordLimit: true,
    },
    rules: [{ required: true, message: '请输入登陆用户名' }],
    hide: () => {
      return isUpdate.value
    },
  },
  {
    label: '登陆密码',
    field: 'plaintextPwd',
    type: 'input-password',
    props: {
      placeholder: '请输入密码',
      maxLength: 32,
      showWordLimit: true,
    },
    rules: [{ required: true, message: '请输入登陆密码' }],
    hide: () => {
      return isUpdate.value
    },
  },
  {
    label: '绑定域名',
    field: 'domain',
    type: 'input',
  },
  {
    label: '租户套餐',
    field: 'packageId',
    type: 'select',
    options: tenantListOptions,
    rules: [{ required: true, message: '请选择租户套餐' }],
    hide: () => {
      return isUpdate.value
    },
  },

  {
    label: '隔离级别',
    field: 'isolationLevel',
    type: 'radio-group',
    rules: [{ required: true, message: '请选择隔离级别' }],
    props: {
      type: 'button',
      size: 'small',
    },
    options: [
      { label: '行级', value: 0 },
      { label: '数据源级', value: 1 },
    ],
    hide: () => {
      return isUpdate.value
    },
  },
  {
    label: '数据连接',
    field: 'dbConnectId',
    type: 'select',
    options: dbConnectListOptions,
    rules: [{ required: true, message: '请选择数据连接' }],
    hide: () => {
      return isUpdate.value || form.isolationLevel !== 1
    },
  },
  {
    label: '状态',
    field: 'status',
    type: 'switch',
    options: dis_enable_status_enum,
    props: {
      type: 'round',
      checkedValue: 1,
      uncheckedValue: 2,
      checkedText: '启用',
      uncheckedText: '禁用',
    },
  },
  {
    label: '过期时间',
    field: 'expireTime',
    type: 'date-picker',
    props: {
      placeholder: '请选择过期时间',
      showTime: true,
    },
  },
])

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  getListAllTenantPackage()
  getListAllDbConnect()
  resetForm()
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    if (isUpdate.value) {
      await updateTenant(form, dataId.value)
      Message.success('修改成功')
    } else {
      const data = form
      data.password = encryptByRsa(form.plaintextPwd) || ''
      await addTenant(data)
      Message.success('新增成功')
    }
    emit('save-success')
    return true
  } catch (error) {
    return false
  }
}

// 新增
const onAdd = async () => {
  reset()
  dataId.value = ''
  visible.value = true
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getTenant(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
