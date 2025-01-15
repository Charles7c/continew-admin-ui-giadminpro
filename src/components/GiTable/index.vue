<template>
  <div class="gi-table" :class="{ 'gi-table--fullscreen': isFullscreen }">
    <a-row v-if="props.title" justify="space-between" align="center" class="gi-table__header">
      <a-space wrap>
        <slot name="custom-title">
          <div class="gi-table__header-title">{{ props.title }}</div>
        </slot>
      </a-space>
    </a-row>
    <a-row>
      <slot name="top"></slot>
    </a-row>
    <a-row justify="space-between" align="center" class="gi-table__toolbar">
      <a-space wrap class="gi-table__toolbar-left" :size="[8, 8]">
        <slot name="toolbar-left"></slot>
      </a-space>
      <a-space wrap class="gi-table__toolbar-right" :size="[8, 8]">
        <slot name="toolbar-right"></slot>
        <a-tooltip content="刷新">
          <a-button v-if="showRefreshBtn" @click="refresh">
            <template #icon><icon-refresh /></template>
          </a-button>
        </a-tooltip>
        <a-dropdown v-if="showSizeBtn" @select="handleSelect">
          <a-tooltip content="尺寸">
            <a-button>
              <template #icon><icon-table-size style="width: 14px; height: 14px" /></template>
            </a-button>
          </a-tooltip>
          <template #content>
            <a-doption v-for="item in sizeList" :key="item.value" :value="item.value" :active="item.value === size">
              {{ item.label }}
            </a-doption>
          </template>
        </a-dropdown>
        <a-popover
          v-if="showSettingColumnBtn" trigger="click" position="br"
          :content-style="{ minWidth: '120px', padding: '6px 8px 10px' }"
        >
          <a-tooltip content="列设置">
            <a-button>
              <template #icon>
                <icon-settings />
              </template>
            </a-button>
          </a-tooltip>
          <template #content>
            <div class="gi-table__draggable">
              <VueDraggable v-model="settingColumnList">
                <div v-for="item in settingColumnList" :key="item.title" class="drag-item">
                  <div class="drag-item__move"><icon-drag-dot-vertical /></div>
                  <a-checkbox v-model:model-value="item.show" :disabled="item.disabled">{{ item.title }}</a-checkbox>
                </div>
              </VueDraggable>
            </div>
            <a-divider :margin="6" />
            <a-row justify="center">
              <a-button type="primary" size="mini" long @click="resetSettingColumns">
                <template #icon><icon-refresh /></template>
                <template #default>重置</template>
              </a-button>
            </a-row>
          </template>
        </a-popover>
        <a-tooltip content="全屏">
          <a-button v-if="showFullscreenBtn" @click="isFullscreen = !isFullscreen">
            <template #icon>
              <icon-fullscreen v-if="!isFullscreen" />
              <icon-fullscreen-exit v-else />
            </template>
          </a-button>
        </a-tooltip>
      </a-space>
    </a-row>
    <a-row class="gi-table__toolbar-bottom">
      <slot name="toolbar-bottom"></slot>
    </a-row>
    <div class="gi-table__body" :class="`gi-table__body-pagination-${attrs['page-position']}`">
      <div class="gi-table__container">
        <a-table
          ref="tableRef"
          :stripe="stripe"
          :size="size"
          column-resizable
          :bordered="{ cell: isBordered }"
          v-bind="{ ...attrs, columns: _columns }"
          :scrollbar="true"
          :data="data"
        >
          <template v-for="key in Object.keys(slots)" :key="key" #[key]="scoped">
            <slot :key="key" :name="key" v-bind="scoped"></slot>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends TableData">
import type { DropdownInstance, TableColumnData, TableData, TableInstance } from '@arco-design/web-vue'
import { VueDraggable } from 'vue-draggable-plus'

defineOptions({ name: 'GiTable', inheritAttrs: false })
const props = withDefaults(defineProps<Props>(), {
  title: '',
  data: () => [],
  disabledTools: () => [], // 禁止显示的工具
  disabledColumnKeys: () => [], // 禁止控制显示隐藏的列
})

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

defineSlots<{
  'th': (props: { column: TableColumnData }) => void
  'thead': () => void
  'empty': (props: { column: TableColumnData }) => void
  'summary-cell': (props: { column: TableColumnData, record: T, rowIndex: number }) => void
  'pagination-right': () => void
  'pagination-left': () => void
  'td': (props: { column: TableColumnData, record: T, rowIndex: number }) => void
  'tr': (props: { record: T, rowIndex: number }) => void
  'tbody': () => void
  'drag-handle-icon': () => void
  'footer': () => void
  'expand-row': (props: { record: T }) => void
  'expand-icon': (props: { record: T, expanded?: boolean }) => void
  'columns': () => void
  'custom-title': () => void
  'top': () => void
  'toolbar-left': () => void
  'toolbar-right': () => void
  'toolbar-bottom': () => void
  [propsName: string]: (props: { key: string, record: T, column: TableColumnData, rowIndex: number }) => void
}>()

const attrs = useAttrs()
const slots = useSlots()

interface Props {
  title?: string
  data: T[]
  disabledTools?: string[]
  disabledColumnKeys?: string[]
}

const tableRef = ref<TableInstance | null>(null)
const stripe = ref(false)
const size = ref<TableInstance['size']>('medium')
const isBordered = ref(false)
const isFullscreen = ref(false)

interface SizeItem { label: string, value: TableInstance['size'] }
const sizeList: SizeItem[] = [
  { label: '紧凑', value: 'small' },
  { label: '默认', value: 'medium' },
]

const handleSelect: DropdownInstance['onSelect'] = (value) => {
  size.value = value as TableInstance['size']
}

const refresh = () => {
  emit('refresh')
}

const showRefreshBtn = computed(() => !props.disabledTools.includes('refresh'))
const showSizeBtn = computed(() => !props.disabledTools.includes('size'))
const showFullscreenBtn = computed(() => !props.disabledTools.includes('fullscreen'))
const showSettingColumnBtn = computed(
  () => !props.disabledTools.includes('setting') && attrs?.columns && (attrs?.columns as TableColumnData[])?.length,
)
interface SettingColumnItem { title: string, key: string, show: boolean, disabled: boolean }
const settingColumnList = ref<SettingColumnItem[]>([])

// 重置配置列
const resetSettingColumns = () => {
  settingColumnList.value = []
  if (attrs.columns) {
    const arr = attrs.columns as TableColumnData[]
    arr.forEach((item) => {
      settingColumnList.value.push({
        key: item.dataIndex || (typeof item.title === 'string' ? item.title : ''),
        title: typeof item.title === 'string' ? item.title : '',
        show: item.show ?? true,
        disabled: props.disabledColumnKeys.includes(
          item.dataIndex || (typeof item.title === 'string' ? item.title : ''),
        ),
      })
    })
  }
}

watch(
  () => attrs,
  () => {
    resetSettingColumns()
  },
  { immediate: true },
)

// 排序和过滤可显示的列数据
const _columns = computed(() => {
  if (!attrs.columns) return []
  const arr = attrs.columns as TableColumnData[]
  // 显示的dataIndex
  const showDataIndexs = settingColumnList.value
    .filter((i) => i.show)
    .map((i) => i.key || (typeof i.title === 'string' ? i.title : ''))
  // 显示的columns数据
  const filterColumns = arr.filter((i) =>
    showDataIndexs.includes(i.dataIndex || (typeof i.title === 'string' ? i.title : '')),
  )
  const sortedColumns: TableColumnData[] = []
  settingColumnList.value.forEach((i) => {
    filterColumns.forEach((j) => {
      if (i.key === (j.dataIndex || j.title)) {
        sortedColumns.push(j)
      }
    })
  })
  return sortedColumns
})

defineExpose({ tableRef })
</script>

<style scoped lang="scss">
.gi-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  background: var(--color-bg-1);
  position: relative;
  box-sizing: border-box;
  &--fullscreen {
    padding: $padding;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1001;
  }

  &__container {
    max-height: 100%;
    overflow: hidden;
    flex: 1;

    // 控制table高度占满
    :deep(.arco-table-border:not(.arco-table-border-cell) .arco-table-container) {
      height: 100%;
    }

    :deep(.arco-table-container) {
      flex: 1;
    }

    :deep(.arco-table-body) {
      height: 100%;
    }

    // 控制表格最后一行的下边框显示
    :deep(.arco-table-border .arco-table-scroll-y .arco-table-body .arco-table-tr:last-of-type .arco-table-td,
      .arco-table-border .arco-table-scroll-y tfoot .arco-table-tr:last-of-type .arco-table-td) {
      border-bottom: 1px solid var(--color-border-table);
    }
  }

  &__body {

    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: auto;

    //如果为空时，将表格铺满
    :deep(.arco-table-element):has(tbody .arco-table-tr-empty) {
      height: 100%;
    }

    // 分页默认位置
    :deep(.arco-pagination) {
      margin-top: 10px;
      justify-content: end;
    }

    &-pagination-top {
      flex-direction: column-reverse;

      :deep(.arco-pagination) {
        margin-bottom: 10px;
        justify-content: center;
      }
    }

    // 上
    &-pagination-t {
      &l {
        flex-direction: column-reverse;

        :deep(.arco-pagination) {
          margin-bottom: 10px;
          justify-content: start;
        }
      }

      &r {
        flex-direction: column-reverse;

        :deep(.arco-pagination) {
          margin-bottom: 10px;
          justify-content: end;
        }
      }
    }

    //下
    &-pagination-bottom {
      :deep(.arco-pagination) {
        margin-top: 10px;
        justify-content: center;
      }
    }

    &-pagination-b {
      &l {
        :deep(.arco-pagination) {
          margin-top: 10px;
          justify-content: start;
        }
      }

      &r {
        :deep(.arco-pagination) {
          margin-top: 10px;
          justify-content: end;
        }
      }
    }

    :deep(.link-text.arco-typography) {
      color: rgb(var(--link-6));
    }
  }

  &__header {
    padding: 0 0 10px;

    &-title {
      color: var(--color-text-1);
      font-size: 18px;
      font-weight: 500;
      line-height: 1.5;
    }
  }

  &__toolbar {
    :deep(.arco-form-item-layout-inline) {
      margin-right: 8px;

      &:last-of-type {
        margin-right: 0;
      }
    }

    :deep(.arco-form-layout-inline .arco-form-item) {
      margin-bottom: 0;
    }

    &-bottom {
      margin-bottom: 8px;
    }
  }

  &__draggable {
    padding: 1px 0; // 解决 max-height 和 overflow:auto 始终显示垂直滚动条问题
    max-height: 250px;
    box-sizing: border-box;
    overflow: hidden;
    overflow-y: auto;
  }
}

.drag-item {
  display: flex;
  align-items: center;

  cursor: pointer;

  &:hover {
    background-color: var(--color-fill-2);
  }

  &__move {
    padding-left: 2px;
    padding-right: 2px;
    cursor: move;
  }

  :deep(.arco-checkbox) {
    width: 100%;
    font-size: 12px;

    .arco-checkbox-icon {
      width: 14px;
      height: 14px;
    }
  }
}
</style>
