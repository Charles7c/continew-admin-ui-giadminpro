<template>
  <div class="gi-split-button" :class="getClass" @click="emit('click')">
    <icon-right v-if="props.collapsed" />
    <icon-left v-else />
  </div>
</template>

<script lang='ts' setup>
interface Props {
  collapsed: boolean
  type?: 'default' | 'circle'
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  type: 'circle',
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const getClass = computed(() => {
  return `gi-split-button--${props.type}`
})
</script>

<style lang='scss' scoped>
.gi-split-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  border: 1px solid var(--color-border-2);
  background-color: var(--color-bg-1);
  cursor: pointer;

  &--default {
    width: 18px;
    height: 40px;
    left: 0;
    box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  }

  &--circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    left: -12px;
    z-index: 999;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
}
</style>
