<template>
  <a-drawer
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'"
    @before-ok="save"
    @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :options="options" :columns="columns" />
  </a-drawer>
</template>

<script setup lang="ts">
import { Message, type TreeNodeData } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { addUser, getUser, updateUser } from '@/apis/system/user'
import { type Columns, GiForm, type Options } from '@/components/GiForm'
import type { Gender, Status } from '@/types/global'
import { GenderList } from '@/constant/common'
import { useResetReactive } from '@/hooks'
import { useDept, useRole } from '@/hooks/app'
import { encryptByRsa } from '@/utils/encrypt'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改用户' : '新增用户'))
const formRef = ref<InstanceType<typeof GiForm>>()
const { roleList, getRoleList } = useRole()
const { deptList, getDeptList } = useDept()

const options: Options = {
  form: { size: 'large' },
  btns: { hide: true },
}

const [form, resetForm] = useResetReactive({
  gender: 1 as Gender,
  status: 1 as Status,
})

const columns: Columns = reactive([
  {
    label: '用户名',
    field: 'username',
    type: 'input',
    props: {
      maxLength: 64,
      showWordLimit: true,
    },
    rules: [{ required: true, message: '请输入用户名' }],
  },
  {
    label: '昵称',
    field: 'nickname',
    type: 'input',
    props: {
      maxLength: 30,
      showWordLimit: true,
    },
    rules: [{ required: true, message: '请输入昵称' }],
  },
  {
    label: '密码',
    field: 'password',
    type: 'input-password',
    props: {
      maxLength: 32,
      showWordLimit: true,
    },
    rules: [{ required: true, message: '请输入密码' }],
    hide: () => {
      return isUpdate.value
    },
  },
  {
    label: '手机号码',
    field: 'phone',
    type: 'input',
    props: {
      maxLength: 11,
    },
  },
  {
    label: '邮箱',
    field: 'email',
    type: 'input',
    props: {
      maxLength: 255,
    },
  },
  {
    label: '性别',
    field: 'gender',
    type: 'radio-group',
    options: GenderList,
  },
  {
    label: '所属部门',
    field: 'deptId',
    type: 'tree-select',
    data: deptList,
    props: {
      allowClear: true,
      allowSearch: true,
      fallbackOption: false,
      filterTreeNode(searchKey: string, nodeData: TreeNodeData) {
        if (nodeData.title) {
          return nodeData.title.toLowerCase().includes(searchKey.toLowerCase())
        }
        return false
      },
    },
    rules: [{ required: true, message: '请选择所属部门' }],
  },
  {
    label: '角色',
    field: 'roleIds',
    type: 'select',
    options: roleList,
    props: {
      multiple: true,
      allowClear: true,
      allowSearch: true,
    },
    rules: [{ required: true, message: '请选择角色' }],
  },
  {
    label: '描述',
    field: 'description',
    type: 'textarea',
    props: {
      maxLength: 200,
      showWordLimit: true,
      autoSize: { minRows: 3, maxRows: 5 },
    },
  },
  {
    label: '状态',
    field: 'status',
    type: 'switch',
    props: {
      type: 'round',
      checkedValue: 1,
      uncheckedValue: 2,
      checkedText: '启用',
      uncheckedText: '禁用',
    },
  },
])

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}

// 保存
const save = async () => {
  const rawPassword = form.password
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    if (isUpdate.value) {
      await updateUser(form, dataId.value)
      Message.success('修改成功')
    } else {
      if (rawPassword) {
        form.password = encryptByRsa(rawPassword) || ''
      }
      await addUser(form)
      Message.success('新增成功')
    }
    emit('save-success')
    return true
  } catch (error) {
    form.password = rawPassword
    return false
  }
}

// 新增
const onAdd = async () => {
  reset()
  if (!deptList.value.length) {
    await getDeptList()
  }
  if (!roleList.value.length) {
    await getRoleList()
  }
  dataId.value = ''
  visible.value = true
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  if (!deptList.value.length) {
    await getDeptList()
  }
  if (!roleList.value.length) {
    await getRoleList()
  }
  const { data } = await getUser(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
