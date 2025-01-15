<template>
  <div ref="boxRef" class="gi-flexible-box" :style="getStyle">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { type CSSProperties, computed, ref } from 'vue'
import { useBreakpoint } from '@/hooks'

interface Props {
  visible: boolean
  direction?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  direction: 'left',
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const boxRef = ref<HTMLElement | null>()
const { breakpoint } = useBreakpoint()
watch(() => breakpoint.value, (val) => {
  if (['xs'].includes(val)) {
    emit('update:visible', false)
  } else {
    emit('update:visible', true)
  }
}, { immediate: true })

const getStyle = computed(() => {
  const obj: CSSProperties = {}
  obj[`margin-${props.direction}`]
    = !props.visible && boxRef.value && boxRef.value.clientWidth ? `-${boxRef.value.clientWidth}px` : 0
  return obj
})
</script>

<style lang="scss" scoped>
.gi-flexible-box {
  transition: all 0.36s;
}
</style>
