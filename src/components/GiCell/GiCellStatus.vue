<template>
  <span v-if="props.status === 1">
    <icon-check-circle-fill class="success" />
    <span>启用</span>
  </span>
  <span v-if="props.status === 2">
    <icon-minus-circle-fill class="warning" />
    <span>禁用</span>
  </span>
</template>

<script setup lang="ts">
defineOptions({ name: 'GiCellStatus' })

const props = withDefaults(defineProps<Props>(), {
  status: 1,
})

interface Props {
  status: 1 | 2
}
</script>

<style scoped lang="scss"></style>
