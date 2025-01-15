import type * as A from '@arco-design/web-vue'
import type { VNode } from 'vue'

export type FormType =
  | 'input'
  | 'input-password'
  | 'input-number'
  | 'select'
  | 'radio-group'
  | 'checkbox-group'
  | 'textarea'
  | 'date-picker'
  | 'year-picker'
  | 'quarter-picker'
  | 'week-picker'
  | 'range-picker'
  | 'month-picker'
  | 'time-picker'
  | 'color-picker'
  | 'rate'
  | 'switch'
  | 'slider'
  | 'cascader'
  | 'tree-select'
  | 'upload'
  | 'group-title'

export type ColumnsItemPropsKey =
  | keyof A.InputInstance['$props']
  | keyof A.InputPasswordInstance['$props']
  | keyof A.InputNumberInstance['$props']
  | keyof A.SelectInstance['$props']
  | keyof A.TextareaInstance['$props']
  | keyof A.DatePickerInstance['$props']
  | keyof A.TimePickerInstance['$props']
  | keyof A.YearPickerInstance['$props']
  | keyof A.MonthPickerInstance['$props']
  | keyof A.QuarterPickerInstance['$props']
  | keyof A.WeekPickerInstance['$props']
  | keyof A.RangePickerInstance['$props']
  | keyof A.RadioGroupInstance['$props']
  | keyof A.CheckboxGroupInstance['$props']
  | keyof A.ColorPickerInstance['$props']
  | keyof A.RateInstance['$props']
  | keyof A.SwitchInstance['$props']
  | keyof A.SliderInstance['$props']
  | keyof A.CascaderInstance['$props']
  | keyof A.TreeSelectInstance['$props']
  | keyof A.UploadInstance['$props']
  | keyof A.AlertInstance['$props']

export type ColumnsItemHide<F> = boolean | ((form: F) => boolean)
export type ColumnsItemShow<F> = boolean | ((form: F) => boolean)
export type ColumnsItemDisabled<F> = boolean | ((form: F) => boolean)
export type ColumnsItemRequest<F = any> = (form: F) => Promise<any>
export type ColumnsItemFormat<T = any> = (
  res: T
) =>
| A.SelectInstance['$props']['options']
| A.RadioGroupInstance['$props']['options']
| A.CheckboxGroupInstance['$props']['options']
| A.CascaderInstance['$props']['options']
| A.TreeSelectInstance['$props']['data']

export type ColumnsItemOptionsOrData =
  | A.SelectInstance['$props']['options']
  | A.RadioGroupInstance['$props']['options']
  | A.CheckboxGroupInstance['$props']['options']
  | A.CascaderInstance['$props']['options']
  | A.TreeSelectInstance['$props']['data']

export interface ColumnsItem<F = any> {
  type?: FormType // 类型
  label?: A.FormItemInstance['label'] | (() => VNode) // 标签
  field: A.FormItemInstance['field'] // 字段(必须唯一)
  gridItemProps?: A.GridItemProps
  formItemProps?: Omit<A.FormItemInstance['$props'], 'label' | 'field'> // a-form-item的props
  props?:
    & A.InputInstance['$props']
    & A.InputPasswordInstance['$props']
    & A.InputNumberInstance['$props']
    & A.SelectInstance['$props']
    & A.TextareaInstance['$props']
    & A.DatePickerInstance['$props']
    & A.TimePickerInstance['$props']
    & A.RadioGroupInstance['$props']
    & A.CheckboxGroupInstance['$props']
    & A.RateInstance['$props']
    & A.SwitchInstance['$props']
    & A.SliderInstance['$props']
    & A.CascaderInstance['$props']
    & A.TreeSelectInstance['$props']
    & A.UploadInstance['$props']
    & A.AlertInstance['$props']
  rules?: A.FormItemInstance['$props']['rules'] // 表单校验规则
  // 下拉列表|复选框组|单选框组|级联选择组件的options
  options?:
    | A.SelectInstance['$props']['options']
    | A.RadioGroupInstance['$props']['options']
    | A.CheckboxGroupInstance['$props']['options']
    | A.CascaderInstance['$props']['options']
  // 下拉树组件的data
  span?: A.GridItemProps['span']
  data?: A.TreeSelectInstance['$props']['data']
  show?: ColumnsItemShow<F> // 是否显示（优先级比hide高）
  hide?: ColumnsItemHide<F> // 是否隐藏
  disabled?: ColumnsItemDisabled<F> // 是否禁用
  request?: ColumnsItemRequest<F> // 接口请求api
  resultFormat?: ColumnsItemFormat // 结果集格式化
  init?: boolean // 初始化请求
  cascader?: string[] // 级联的field字段列表
  slots?: Partial<Record<'prepend' | 'append' | 'suffix' | 'prefix', string | (() => VNode)>>
  formItemSlots?: Partial<Record<'help' | 'extra', string | (() => VNode)>>
}

export interface Options {
  form?: Omit<A.FormInstance['$props'], 'model'>
  grid?: A.GridProps
  gridItem?: A.GridItemProps
  btns?: { hide?: boolean, searchBtnText?: string }
  fold?: { enable?: boolean, index?: number, defaultCollapsed?: boolean }
}

export type Columns<F = any> = ColumnsItem<F>[]
