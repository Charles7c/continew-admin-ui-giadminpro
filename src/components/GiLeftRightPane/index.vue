<template>
  <a-row align="stretch" :gutter="14" class="gi-left-right-pane">
    <a-col
      :xs="0" :sm="8" :md="7" :lg="6" :xl="5" :xxl="4" flex="260px" v-bind="props.leftColProps"
      class="h-full overflow-hidden"
    >
      <div class="gi-left-right-pane__left">
        <slot name="left"></slot>
      </div>
    </a-col>

    <a-col
      :xs="24" :sm="16" :md="17" :lg="18" :xl="19" :xxl="20" flex="1" v-bind="props.rightColProps"
      class="h-full overflow-hidden"
    >
      <div class="gi-left-right-pane__right">
        <slot></slot>
      </div>
    </a-col>
  </a-row>
</template>

<script lang='ts' setup>
import type { ColProps } from '@arco-design/web-vue'

interface Props {
  leftColProps?: ColProps
  rightColProps?: ColProps
}

defineOptions({ name: 'GiLeftRightPane' })

const props = withDefaults(defineProps<Props>(), {
  leftColProps: () => ({}),
  rightColProps: () => ({}),
})

// 一般用于左树右表结构页面

defineSlots<{
  left: () => void
}>()
</script>

<style lang='scss' scoped>
.gi-left-right-pane {
  flex: 1;
  overflow: hidden;
  padding: $margin;
  box-sizing: border-box;

  &__left,
  &__right {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}
</style>
