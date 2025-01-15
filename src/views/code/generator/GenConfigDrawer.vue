<template>
  <a-drawer
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 1350 ? 1350 : '100%'"
    @before-ok="save"
    @close="reset"
  >
    <a-tabs v-model:active-key="activeKey">
      <a-tab-pane key="1" title="生成配置">
        <GiForm ref="formRef" v-model="form" :options="options" :columns="formColumns" />
      </a-tab-pane>
      <a-tab-pane key="2" title="字段配置">
        <GiTable
          row-key="tableName"
          :data="dataList"
          :columns="columns"
          :loading="loading"
          :scroll="{ x: '100%', y: 800, minWidth: 900 }"
          :pagination="false"
          :draggable="{ type: 'handle', width: 40 }"
          :disabled-tools="['setting', 'refresh']"
          :disabled-column-keys="['tableName']"
          @change="handleChangeSort"
        >
          <template #toolbar-left>
            <a-popconfirm
              content="是否确定同步最新数据表结构？同步后只要不点击确定保存，则不影响原有配置数据。"
              type="warning"
              @ok="handleRefresh(form.tableName)"
            >
              <a-tooltip content="同步最新数据表结构">
                <a-button
                  type="primary"
                  status="success"
                  size="small"
                  title="同步"
                  :disabled="dataList.length !== 0 && dataList[0].createTime == null"
                >
                  <template #icon><icon-sync /></template>同步
                </a-button>
              </a-tooltip>
            </a-popconfirm>
          </template>
          <template #fieldName="{ record }">
            <a-input v-model="record.fieldName" />
          </template>
          <template #fieldType="{ record }">
            <a-select
              v-model="record.fieldType"
              placeholder="请选择字段类型"
              allow-search
              allow-create
              :error="!record.fieldType"
            >
              <a-option value="String">String</a-option>
              <a-option value="Integer">Integer</a-option>
              <a-option value="Long">Long</a-option>
              <a-option value="Float">Float</a-option>
              <a-option value="Double">Double</a-option>
              <a-option value="Boolean">Boolean</a-option>
              <a-option value="BigDecimal">BigDecimal</a-option>
              <a-option value="LocalDate">LocalDate</a-option>
              <a-option value="LocalTime">LocalTime</a-option>
              <a-option value="LocalDateTime">LocalDateTime</a-option>
            </a-select>
          </template>
          <template #comment="{ record }">
            <a-input v-model="record.comment" />
          </template>
          <template #showInList="{ record }">
            <a-checkbox v-model="record.showInList" value="true" />
          </template>
          <template #showInForm="{ record }">
            <a-checkbox v-model="record.showInForm" value="true" />
          </template>
          <template #isRequired="{ record }">
            <a-checkbox v-if="record.showInForm" v-model="record.isRequired" value="true" />
            <a-checkbox v-else disabled />
          </template>
          <template #showInQuery="{ record }">
            <a-checkbox v-model="record.showInQuery" value="true" />
          </template>
          <template #formType="{ record }">
            <a-select
              v-if="record.showInForm || record.showInQuery"
              v-model="record.formType"
              :options="form_type_enum"
              :default-value="1"
              placeholder="请选择表单类型"
            />
            <span v-else>无需设置</span>
          </template>
          <template #queryType="{ record }">
            <a-select
              v-if="record.showInQuery"
              v-model="record.queryType"
              :options="query_type_enum"
              :default-value="1"
              placeholder="请选择查询方式"
            />
            <span v-else>无需设置</span>
          </template>
          <template #dictCode="{ record }">
            <a-select
              v-model="record.dictCode"
              :options="dictList"
              placeholder="请选择字典类型"
              allow-search
              allow-clear
            />
          </template>
        </GiTable>
      </a-tab-pane>
    </a-tabs>
  </a-drawer>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { type FieldConfigResp, type GeneratorConfigResp, getGenConfig, listFieldConfig, listFieldConfigDict, saveGenConfig } from '@/apis/code/generator'
import type { LabelValueState } from '@/types/global'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { type Columns, GiForm, type Options } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const title = ref('')
const visible = ref(false)
const activeKey = ref('1')
const formRef = ref<InstanceType<typeof GiForm>>()
const { form_type_enum, query_type_enum } = useDict('form_type_enum', 'query_type_enum')
const dictList = ref<LabelValueState[]>([])

const options: Options = {
  form: { size: 'large' },
  grid: { cols: 2 },
  btns: { hide: true },
}
const [form, resetForm] = useResetReactive({
  isOverride: false,
})
const formColumns: Columns = reactive([
  {
    label: '作者名称',
    field: 'author',
    type: 'input',
    rules: [{ required: true, message: '请输入作者名称' }],
  },
  {
    label: '业务名称',
    field: 'businessName',
    type: 'input',
    props: {
      placeholder: '自定义业务名称，例如：用户',
    },
    rules: [{ required: true, message: '请输入业务名称' }],
  },
  {
    label: '所属模块',
    field: 'moduleName',
    type: 'input',
    props: {
      placeholder: '项目模块名称，例如：continew-system',
    },
    rules: [{ required: true, message: '请输入所属模块' }],
  },
  {
    label: '模块包名',
    field: 'packageName',
    type: 'input',
    props: {
      placeholder: '项目模块包名，例如：top.continew.admin.system',
    },
    rules: [{ required: true, message: '请输入模块包名' }],
  },
  {
    label: '去表前缀',
    field: 'tablePrefix',
    type: 'input',
    props: {
      placeholder: '数据库表前缀，例如：sys_',
      width: '200',
    },
  },
  {
    label: '是否覆盖',
    field: 'isOverride',
    type: 'switch',
    props: {
      type: 'round',
      checkedValue: true,
      uncheckedValue: false,
      checkedText: '是',
      uncheckedText: '否',
    },
  },
])

const dataList = ref<FieldConfigResp[]>([])
const loading = ref(false)
// 查询列表数据
const getDataList = async (tableName: string, requireSync: boolean) => {
  try {
    loading.value = true
    const { data } = await listFieldConfig(tableName, requireSync)
    dataList.value = data
  } finally {
    loading.value = false
  }
}

// Table 字段配置
const columns: TableInstanceColumns[] = [
  { title: '名称', slotName: 'fieldName' },
  { title: '类型', slotName: 'fieldType' },
  { title: '描述', slotName: 'comment', width: 170 },
  { title: '列表', slotName: 'showInList', width: 60, align: 'center' },
  { title: '表单', slotName: 'showInForm', width: 60, align: 'center' },
  { title: '必填', slotName: 'isRequired', width: 60, align: 'center' },
  { title: '查询', slotName: 'showInQuery', width: 60, align: 'center' },
  { title: '表单类型', slotName: 'formType' },
  { title: '查询方式', slotName: 'queryType' },
  { title: '关联字典', slotName: 'dictCode' },
]

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}

// 同步
const handleRefresh = async (tableName: string) => {
  await getDataList(tableName, true)
}

// 拖拽排序
const handleChangeSort = (newDataList: FieldConfigResp[]) => {
  dataList.value = newDataList
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) {
      activeKey.value = '1'
      return false
    }
    await saveGenConfig(form.tableName, {
      genConfig: form,
      fieldConfigs: dataList.value,
    } as GeneratorConfigResp)
    Message.success('保存成功')
    emit('save-success')
    return true
  } catch (error) {
    return false
  }
}

// 打开
const onOpen = async (tableName: string, comment: string) => {
  reset()
  comment = comment ? `（${comment}）` : ' '
  title.value = `${tableName}${comment}配置`
  // 查询生成配置
  const { data } = await getGenConfig(tableName)
  Object.assign(form, data)
  form.isOverride = form.isOverride || false
  visible.value = true
  // 查询字段配置
  await getDataList(tableName, false)
  const res = await listFieldConfigDict()
  dictList.value = res.data
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss">
:deep(.gen-config.arco-form) {
  width: 50%;
}
</style>
