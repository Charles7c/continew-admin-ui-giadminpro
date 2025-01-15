<template>
  <div class="gi-space" :class="getClass" :style="getStyle">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'

interface Props {
  size?: number | [number, number] | 'mini' | 'small' | 'medium' | 'large'
  direction?: 'horizontal' | 'vertical'
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around'
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch'
  wrap?: boolean
  fill?: boolean // 充满整行
}

const props = withDefaults(defineProps<Props>(), {
  size: 'small',
  direction: 'horizontal',
  justify: 'start',
  align: 'center',
  wrap: true,
  fill: false,
})

const getClass = computed(() => {
  const arr: string[] = []
  if (props.wrap) {
    arr.push('gi-space-wrap')
  }
  if (props.direction) {
    arr.push(`gi-space-direction-${props.direction}`)
  }
  if (props.fill) {
    arr.push('gi-space-fill')
  }
  return arr.join(' ')
})

const getStyle = computed(() => {
  const obj: CSSProperties = {}
  if (Array.isArray(props.size)) {
    const [colGap = 0, rowGap = 0] = props.size
    obj.gap = props.wrap ? `${rowGap}px ${colGap}px` : `0 ${colGap}px`
  } else {
    const sizeMap: Record<'mini' | 'small' | 'medium' | 'large', number> = {
      mini: 4,
      small: 8,
      medium: 16,
      large: 24,
    }
    const size = sizeMap[props.size] || props.size
    obj.gap = props.wrap ? `${size}px` : `0 ${size}px`
  }
  obj['justify-content'] = props.justify
  obj['align-items'] = props.align
  return obj
})
</script>

<style lang="scss" scoped>
.gi-space {
  display: inline-flex;

  &.gi-space-wrap {
    flex-wrap: wrap;
  }

  &.gi-space-fill {
    display: flex;
  }

  &.gi-space-direction-horizontal {
    flex-direction: row;
  }

  &.gi-space-direction-vertical {
    flex-direction: column;
  }
}
</style>
