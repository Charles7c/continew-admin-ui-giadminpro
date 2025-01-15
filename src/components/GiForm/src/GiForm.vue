<template>
  <a-form ref="formRef" :auto-label-width="true" v-bind="options.form" :model="modelValue">
    <a-grid class="w-full" :col-gap="8" v-bind="options.grid" :collapsed="collapsed">
      <template v-for="(item, index) in columns" :key="item.field">
        <a-grid-item
          v-if="item.show !== undefined ? isShow(item) : !isHide(item)"
          v-show="colVShow(index)"
          v-bind="item.gridItemProps || props.options.gridItem"
          :span="item.span || options.gridItem?.span"
        >
          <a-form-item
            v-bind="item.formItemProps" :field="item.field" :rules="item.rules"
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
                <template v-for="(slotValue, slotKey) in item?.slots" :key="slotKey" #[slotKey]>
                  <template v-if="typeof slotValue === 'string'">{{ slotValue }}</template>
                  <component :is="slotValue" v-else></component>
                </template>
              </component>
            </slot>
            <slot v-else name="group-title">
              <a-alert v-bind="item.props">{{ item.label }}</a-alert>
            </slot>
          </a-form-item>
        </a-grid-item>
      </template>
      <a-grid-item v-if="!options.btns?.hide" :suffix="options.fold?.enable">
        <a-space wrap :size="[8, 16]" style="flex-wrap: nowrap">
          <slot name="suffix">
            <a-button type="primary" @click="emit('search')">
              <template #icon><icon-search /></template>
              <template #default>{{ options.btns?.searchBtnText || '搜索' }}</template>
            </a-button>
            <a-button @click="emit('reset')">
              <template #icon><icon-refresh /></template>
              <template #default>重置</template>
            </a-button>
            <a-button
              v-if="options.fold?.enable" class="gi-form__fold-btn" type="text" size="mini"
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
import { cloneDeep } from 'lodash-es'
import type { ColumnsItem, Options } from './type'

interface Props {
  modelValue: any
  options?: Options
  columns: ColumnsItem[]
}

const props = withDefaults(defineProps<Props>(), {
  options: () => ({}),
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'search'): void
  (e: 'reset'): void
}>()

const options = computed(() => ({
  grid: { cols: 1 },
  gridItem: { span: { xs: 2, sm: 1 } },
  ...props.options,
}
))

const formRef = useTemplateRef('formRef')
const collapsed = ref(props.options.fold?.defaultCollapsed ?? false)
const dicData: Record<string, any> = reactive({})

// col组件的显示隐藏
const colVShow = (index: number) => {
  return index <= (props.options.fold?.index || 0) || (index >= (props.options.fold?.index || 0) && !collapsed.value)
}

// 组件的默认props配置
const getComponentBindProps = (item: ColumnsItem) => {
  const obj: Partial<ColumnsItem['props'] & { placeholder: string }> = {}
  switch (item.type) {
    case 'input':
    case 'input-password':
    case 'input-number':
      obj.allowClear = true
      obj.placeholder = `请输入${item.label}`
      break
    case 'textarea':
      obj.placeholder = `请输入${item.label}`
      obj.maxLength = 200
      break
    case 'select':
    case 'cascader':
      obj.allowClear = true
      obj.placeholder = `请选择${item.label}`
      obj.options = dicData[item.field] || item.options
      break
    case 'tree-select':
      obj.allowClear = true
      obj.placeholder = `请选择${item.label}`
      obj.data = dicData[item.field] || item.data
      break
    case 'radio-group':
    case 'checkbox-group':
      obj.options = dicData[item.field] || item.options
      break
    case 'date-picker':
      obj.placeholder = '请选择日期'
      break
    case 'time-picker':
      obj.allowClear = true
      obj.placeholder = `请选择时间`
      break
  }
  return { ...obj, ...item.props }
}

const valueChange = (value: any, field: string) => {
  emit('update:modelValue', Object.assign(props.modelValue, { [field]: value }))
}

/** 显示表单项 */
const isShow = (item: ColumnsItem) => {
  if (typeof item.show === 'boolean') return item.show
  if (typeof item.show === 'function') {
    return item.show(props.modelValue)
  }
}

/** 隐藏表单项 */
const isHide = (item: ColumnsItem) => {
  if (item.hide === undefined) return false
  if (typeof item.hide === 'boolean') return item.hide
  if (typeof item.hide === 'function') {
    return item.hide(props.modelValue)
  }
}

/** 禁用表单项 */
const isDisabled = (item: ColumnsItem) => {
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
const hasCascaderColumns: ColumnsItem[] = []
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
              emit('update:modelValue', Object.assign(props.modelValue, { [i.field]: '' }))
            }
          })
        } else if (i.request && !newVal[item.field]) {
          dicData[i.field] = []
          emit('update:modelValue', Object.assign(props.modelValue, { [i.field]: '' }))
        }
      })
    }
  })
})

defineExpose({ formRef })
</script>

<style scoped lang="scss">
:deep(.arco-form-item-layout-inline) {
  margin-right: 0;
}
.gi-form__fold-btn {
  padding: 0 5px;
}
</style>
