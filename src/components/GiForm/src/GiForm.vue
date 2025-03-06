<template>
  <a-form ref="formRef" v-bind="formProps" :model="modelValue" :size="props.size ?? 'large'" :layout="props.layout ?? (props.search ? 'inline' : 'horizontal')">
    <a-grid class="w-full" :col-gap="8" v-bind="props.gridProps" :collapsed="collapsed">
      <template v-for="item in columns" :key="item.field">
        <a-grid-item
          v-if="item.show !== undefined ? isShow(item) : !isHide(item)"
          v-bind="item.gridItemProps || defaultGridItemProps"
          :span="item.span || item.gridItemProps?.span || defaultGridItemProps?.span"
        >
          <a-form-item
            v-bind="item.formItemProps" :field="item.field" :rules="getFormItemRules(item)"
            :disabled="isDisabled(item)"
          >
            <template #label>
              <template v-if="typeof item.label === 'string'">{{ item.label }}</template>
              <component :is="item.label" v-else></component>
            </template>
            <slot
              v-if="!['group-title'].includes(item.type || '')" :name="item.field"
              v-bind="{ disabled: isDisabled(item) }"
            >
              <template v-if="item.type === 'range-picker'">
                <DateRangePicker
                  v-bind="(item.props as A.RangePickerInstance['$props'])"
                  :model-value="modelValue[item.field as keyof typeof modelValue]"
                  @update:model-value="valueChange($event, item.field)"
                />
              </template>
              <component
                :is="`a-${item.type}`" v-else v-bind="getComponentBindProps(item)"
                :model-value="modelValue[item.field as keyof typeof modelValue]"
                @update:model-value="valueChange($event, item.field)"
              >
                <template v-for="(slotValue, slotKey) in item?.slots" :key="slotKey" #[slotKey]="scope">
                  <template v-if="typeof slotValue === 'string'">{{ slotValue }}</template>
                  <template v-else-if="slotValue">
                    <component :is="slotValue(scope)"></component>
                  </template>
                </template>
              </component>
            </slot>
            <slot v-else name="group-title">
              <a-alert v-bind="item.props">{{ item.label }}</a-alert>
            </slot>
            <template v-for="(slotValue, slotKey) in item?.formItemSlots" :key="slotKey" #[slotKey]>
              <template v-if="typeof slotValue === 'string'">{{ slotValue }}</template>
              <component :is="slotValue" v-else></component>
            </template>
          </a-form-item>
        </a-grid-item>
      </template>
      <a-grid-item
        v-if="props.search" v-bind="defaultGridItemProps" :span="defaultGridItemProps?.span"
        :suffix="props.search && props.suffix"
      >
        <a-space wrap>
          <slot name="suffix">
            <a-button type="primary" @click="emit('search')">
              <template #icon><icon-search /></template>
              <template #default>{{ props.searchBtnText }}</template>
            </a-button>
            <a-button @click="emit('reset')">
              <template #icon><icon-refresh /></template>
              <template #default>重置</template>
            </a-button>
            <a-button
              v-if="!props.hideFoldBtn" class="gi-form__fold-btn" type="text" size="mini"
              @click="collapsed = !collapsed"
            >
              <template #icon>
                <icon-up v-if="!collapsed" />
                <icon-down v-else />
              </template>
              <template #default>{{ collapsed ? '展开' : '收起' }}</template>
            </a-button>
          </slot>
        </a-space>
      </a-grid-item>
    </a-grid>
  </a-form>
</template>

<script setup lang="ts">
import { cloneDeep, omit } from 'lodash-es'
import type { FormInstance, GridItemProps, GridProps } from '@arco-design/web-vue'
import type { ColumnItem } from './type'

interface Props {
  modelValue: any
  layout?: FormInstance['layout']
  size?: FormInstance['size']
  labelColProps?: FormInstance['labelColProps']
  wrapperColProps?: FormInstance['wrapperColProps']
  labelAlign?: FormInstance['labelAlign']
  disabled?: FormInstance['disabled']
  rules?: FormInstance['rules']
  autoLabelWidth?: FormInstance['autoLabelWidth']
  id?: FormInstance['id']
  scrollToFirstError?: FormInstance['scrollToFirstError']
  // 额外自定义属性
  columns: ColumnItem[]
  gridProps?: GridProps
  gridItemProps?: GridItemProps
  search?: boolean // 搜索模式
  defaultCollapsed?: boolean // 折叠按钮默认折叠
  searchBtnText?: string // 搜索按钮文字
  hideFoldBtn?: boolean // 隐藏展开收起按钮，在表单项少的时候手动隐藏
  suffix?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoLabelWidth: true,
  scrollToFirstError: true,
  defaultCollapsed: false,
  search: false,
  gridItemProps: { span: { xs: 24, sm: 8, xxl: 8 } },
  searchBtnText: '搜索',
  hideFoldBtn: false,
  suffix: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'search'): void
  (e: 'reset'): void
}>()

const formProps = computed(() => {
  const baseProps = omit(props, ['columns', 'gridProps', 'gridItemProps', 'search', 'defaultCollapsed', 'searchBtnText', 'hideFoldBtn', 'suffix', 'layout'])
  return { ...baseProps }
})

const defaultGridItemProps = computed(() => {
  return props.gridItemProps
})

const formRef = useTemplateRef('formRef')
const collapsed = ref(props.defaultCollapsed)
const dicData: Record<string, any> = reactive({})

// 组件的默认props配置
const getComponentBindProps = (item: ColumnItem) => {
  // 组件默认配置映射表
  const ConfigMap = new Map<ColumnItem['type'], Partial<ColumnItem['props'] & { placeholder: string }>>([
    ['input', { allowClear: true, placeholder: `请输入${item.label}`, maxLength: 255, showWordLimit: true }],
    ['input-password', { placeholder: `请输入${item.label}` }],
    ['input-number', { placeholder: `请输入${item.label}` }],
    ['textarea', { allowClear: false, placeholder: `请输入${item.label}`, maxLength: 200, showWordLimit: true, autoSize: { minRows: 3, maxRows: 5 } }],
    ['input-tag', { allowClear: true, placeholder: `请输入${item.label}` }],
    ['mention', { allowClear: true, placeholder: `请输入${item.label}` }],
    ['select', { allowClear: true, placeholder: `请选择${item.label}`, options: dicData[item.field] || [] }],
    ['tree-select', { allowClear: true, placeholder: `请选择${item.label}` }],
    ['cascader', { allowClear: true, placeholder: `请选择${item.label}`, options: dicData[item.field] || [] }],
    ['radio-group', { options: dicData[item.field] || [] }],
    ['checkbox-group', { options: dicData[item.field] || [] }],
    ['date-picker', { allowClear: true, placeholder: '请选择日期' }],
    ['time-picker', { allowClear: true, placeholder: '请选择时间' }],
  ])
  // 获取默认配置
  const defaultProps = ConfigMap.get(item.type) || {}
  // 合并默认配置和自定义配置
  return { ...defaultProps, ...item.props }
}

/** 表单数据更新  */
const valueChange = (value: any, field: string) => {
  emit('update:modelValue', Object.assign(props.modelValue, { [field]: value }))
}

/** 表单项校验规则 */
const getFormItemRules = (item: ColumnItem) => {
  if (item.required) {
    const defaultProps = getComponentBindProps(item)
    return [{ required: true, message: defaultProps.placeholder || `请输入${item.label}` }, ...(Array.isArray(item.rules) ? item.rules : [])]
  }
  return item.rules
}

/** 显示表单项 */
const isShow = (item: ColumnItem) => {
  if (typeof item.show === 'boolean') return item.show
  if (typeof item.show === 'function') {
    return item.show(props.modelValue)
  }
}

/** 隐藏表单项 */
const isHide = (item: ColumnItem) => {
  if (item.hide === undefined) return false
  if (typeof item.hide === 'boolean') return item.hide
  if (typeof item.hide === 'function') {
    return item.hide(props.modelValue)
  }
}

/** 禁用表单项 */
const isDisabled = (item: ColumnItem) => {
  if (item.disabled === undefined) return false
  if (typeof item.disabled === 'boolean') return item.disabled
  if (typeof item.disabled === 'function') {
    return item.disabled(props.modelValue)
  }
}

props.columns.forEach((item) => {
  if (item.request && typeof item.request === 'function' && item?.init) {
    item.request(props.modelValue).then((res) => {
      dicData[item.field] = item.resultFormat ? item.resultFormat(res) : res.data
      // console.log('dicData', dicData)
    })
  }
})

// 先找出有级联的项
// 如果这个字段改变了值，那么就找出它的cascader属性对应的字段项，去请求里面的request
const hasCascaderColumns: ColumnItem[] = []
props.columns.forEach((item) => {
  const arr = hasCascaderColumns.map((i) => i.field)
  if (item.cascader?.length && !arr.includes(item.field)) {
    hasCascaderColumns.push(item)
  }
})

// 要深克隆，否则无法监听新旧值变化
const cloneForm = computed(() => cloneDeep(props.modelValue))

watch(cloneForm as any, (newVal, oldVal) => {
  hasCascaderColumns.forEach((item) => {
    if (newVal[item.field] !== oldVal[item.field]) {
      const arr = props.columns.filter((a) => {
        return item?.cascader?.includes(a.field)
      })
      arr.forEach((i) => {
        if (i.request && Boolean(newVal[item.field])) {
          i.request(props.modelValue).then((res) => {
            dicData[i.field] = i.resultFormat ? i.resultFormat(res) : res.data
            if (!dicData[i.field].map((i: any) => i.value).includes(props.modelValue[i.field])) {
              emit('update:modelValue', Object.assign(props.modelValue, { [i.field]: Array.isArray(props.modelValue[i.field]) ? [] : '' }))
            }
          })
        } else if (i.request && !newVal[item.field]) {
          dicData[i.field] = []
          emit('update:modelValue', Object.assign(props.modelValue, { [i.field]: Array.isArray(props.modelValue[i.field]) ? [] : '' }))
        }
      })
    }
  })
})

defineExpose({ formRef })
</script>

<style lang="scss" scoped>
.gi-form__fold-btn {
  padding: 0 5px;
}
</style>
