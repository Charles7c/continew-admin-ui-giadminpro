<template>
  <div
    ref="rootRef"
    class="ca-split-panel"
    :class="{
      'is-vertical': vertical,
      'is-reverse': reverse,
      'is-resizing': resizing,
      'is-collapse': isCollapse,
      'is-responsive': isResponsive,
      'is-mobile': isMobile,
    }"
    :style="customStyle"
  >
    <div ref="sideRef" class="ca-split-panel__side" :style="sideStyle">
      <div class="ca-split-panel__content">
        <slot name="left"></slot>
      </div>
    </div>

    <!-- 竖线和按钮 -->
    <div class="divider">
      <div
        v-if="allowCollapse"
        class="ca-split-panel__collapse-trigger"
        :class="{
          'is-collapse': isCollapse,
          'is-mobile': isMobile,
        }"
        :style="!isMobile ? collapseTriggerStyle : undefined"
        @click="toggleCollapse"
      >
        <a-button size="mini">
          <template #icon>
            <div v-if="reverse">
              <IconRight v-if="!isCollapse" />
              <IconLeft v-else />
            </div>
            <div v-else>
              <IconLeft v-if="!isCollapse" />
              <IconRight v-else />
            </div>
          </template>
        </a-button>
      </div>
    </div>

    <div class="ca-split-panel__main" :style="mainStyle">
      <div class="ca-split-panel__main-content">
        <slot name="main"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { IconLeft, IconRight } from '@arco-design/web-vue/es/icon'
import type { CSSProperties } from 'vue'

/**
 * 组件属性定义
 * @property {string} size - 侧边栏尺寸，支持百分比或像素值，默认 '20%'
 * @property {number} minSize - 侧边栏最小尺寸（像素），默认 200
 * @property {number} maxSize - 侧边栏最大尺寸（像素），默认 800
 * @property {object} customStyle - 自定义根元素样式
 * @property {object} bodyStyle - 自定义内容区域样式
 * @property {boolean} allowCollapse - 是否允许折叠，默认 true
 * @property {boolean} collapse - 是否折叠状态，默认 false
 * @property {boolean} vertical - 是否垂直分割，默认 false
 * @property {boolean} reverse - 是否反转布局，默认 false
 * @property {boolean} responsive - 是否启用响应式，默认 true
 */
const props = withDefaults(defineProps<{
  size?: string | number
  minSize?: number
  maxSize?: number
  customStyle?: any
  bodyStyle?: any
  allowCollapse?: boolean
  collapse?: boolean
  vertical?: boolean
  reverse?: boolean
  responsive?: boolean
}>(), {
  size: '20%',
  minSize: 200,
  maxSize: 800,
  allowCollapse: true,
  collapse: false,
  vertical: false,
  reverse: false,
  responsive: true,
})

// 定义事件
const emit = defineEmits(['update:collapse'])

// DOM 引用
const rootRef = ref<HTMLElement | null>(null)
const sideRef = ref<HTMLElement | null>(null)

// 状态管理
const isCollapse = ref(props.collapse) // 折叠状态
const resizing = ref(false) // 是否正在调整大小
const resizedSize = ref<string | null>(null) // 调整后的尺寸
const isMobile = ref(false) // 是否移动端

/**
 * 将 size 属性转换为带单位的尺寸值
 * 处理百分比和像素值的转换
 */
const normalizedSize = computed(() => {
  // 如果已经带有单位（%或px），直接返回
  if (typeof props.size === 'string') {
    if (props.size.includes('%') || props.size.includes('px')) {
      return props.size
    }
  }
  return `${props.size}px`
})

/**
 * 计算侧边栏样式
 */
const sideStyle = computed((): CSSProperties => ({
  [props.vertical ? 'height' : 'width']: isCollapse.value
    ? '0'
    : (isMobile.value ? '100%' : (resizedSize.value || normalizedSize.value)),
  transition: 'all 0.3s ease',
  position: isMobile.value ? 'absolute' : 'relative',
  zIndex: isMobile.value ? 10 : 1,
}))

/**
 * 计算主内容区域样式
 */
const mainStyle = computed(() => ({
  transition: 'padding-left 0.3s ease',
  flex: 1,
}))

/**
 * 判断是否启用响应式布局
 * 当屏幕宽度小于 768px 时启用移动端模式
 */
const isResponsive = computed(() => {
  if (!props.responsive) return false
  return window.innerWidth < 768
})

/**
 * 计算折叠触发器的样式
 */
const collapseTriggerStyle = computed(() => {
  if (isMobile.value) {
    return {}
  }

  const baseSize = resizedSize.value || normalizedSize.value
  const buttonOffset = '16px' // 按钮偏移量

  if (props.reverse) {
    return {
      right: isCollapse.value
        ? `-${buttonOffset}`
        : `calc(${baseSize} - ${buttonOffset})`,
    }
  }

  return {
    left: isCollapse.value
      ? `-${buttonOffset}`
      : `calc(${baseSize} - ${buttonOffset})`,
  }
})

/**
 * 切换折叠状态
 * 触发 update:collapse 事件通知父组件
 */
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
  emit('update:collapse', isCollapse.value)
}

/**
 * 检查是否为移动端设备
 * 根据窗口宽度判断
 */
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 组件挂载时初始化
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style lang="scss" scoped>
.ca-split-panel {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  background: var(--color-bg-2);

  .divider {
    width: 2px;
    background-color: var(--color-border);
    margin-right: 10px;
    margin-left: 10px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // 布局变体
  &.is-vertical {
    flex-direction: column;
  }

  &.is-reverse {
    flex-direction: row-reverse;

    .ca-split-panel__side {
      border-right: none;
      border-left: 1px solid var(--color-border);
    }

    &__main-content {
/*      margin-left: 10px;*/

      :deep(.arco-table-border .arco-table-container) {
        border-right: none;
        border-left: 1px solid var(--color-border);
      }
    }

    &.is-mobile {
      .ca-split-panel__side {
        left: auto;
        right: 0;
      }

      .ca-split-panel__collapse-trigger {
        left: 10px;
        right: auto;

        &.is-collapse {
          left: auto;
          right: 10px;
        }
      }

      &.is-collapse .ca-split-panel__side {
        transform: translateX(100%);
      }
    }
  }

  // 基础组件
  &__side {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    background: var(--color-bg-2);
    overflow: hidden;

    transition: transform 0.3s ease, width 0.3s ease;
  }

  &__content,
  &__main-content {
    flex: 1;
    overflow: hidden;

    :deep(.arco-table-border .arco-table-container) {
    /*  border-left: none;*/
      border: none;
    }
  }
  .ca-split-panel__main {
    padding-left: 10px;
  }
  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--color-bg-1);
  }

  // 折叠触发器
  &__collapse-trigger {
    align-items: center;
    cursor: pointer;
    width: 32px;
    height: 60px;
    background-color: var(--color-bg-2);
    border: 1px solid var(--color-border);
    justify-content: center;

    // 遮罩效果，让分隔线看起来被按钮"切断"
    &::before {
      content: '';
      position: absolute;
      left: 50%;
      top: -2px;
      bottom: -2px;
      transform: translateX(-50%);
      width: 4px;
      background-color: var(--color-bg-2);
      z-index: -1;
    }

    :deep(.arco-btn) {
      padding: 0;
      border: none;
      background: transparent;
      box-shadow: none;
      width: 100%;
      height: 100%;

      &:hover,
      &:focus,
      &:active {
        background: transparent;
        border: none;
        box-shadow: none;
      }
    }
  }

  // 折叠状态
  &.is-collapse {
    .ca-split-panel__side {
      width: 0;
    }

/*    .ca-split-panel__main {
      padding-left: 0;
    }*/
  }

  // 移动端样式
  &.is-mobile {
    .ca-split-panel__side {
      position: fixed;
      left: 0;
      top: 0;
      height: 100%;
      background: var(--color-bg-2);
      z-index: 1000;
    }

    .divider {
      width: 0;
      margin: 0;
      background: none;
    }

    .ca-split-panel__collapse-trigger {
      position: fixed;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 12;
      width: 32px;
      height: 40px;

      &::before {
        display: none;
      }

      &.is-collapse {
        left: 10px;
        right: auto;
      }
    }

    &.is-collapse .ca-split-panel__side {
      transform: translateX(-100%);
    }
  }

  // 表格固定列适配
  :deep(.arco-table-col-fixed-left),
  :deep(.arco-table-col-fixed-right) {
    position: sticky; // 默认状态
    z-index: 10;
  }

  // 移动端表格固定列适配
  &.is-mobile {
    :deep(.arco-table-col-fixed-left),
    :deep(.arco-table-col-fixed-right) {
      position: static; // 移动端状态
    }
  }
}
</style>
