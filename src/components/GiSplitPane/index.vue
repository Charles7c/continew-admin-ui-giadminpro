<template>
  <div class="gi-split-pane">
    <GiSplitPaneFlexibleBox v-model:visible="visible">
      <div class="gi-split-pane__left">
        <slot name="left"></slot>
      </div>
    </GiSplitPaneFlexibleBox>
    <div class="gi-split-pane__line">
      <GiSplitButton :collapsed="!visible" @click="handleClick"></GiSplitButton>
    </div>
    <div class="gi-split-pane__right">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang='ts'>
defineSlots<{
  left: () => void
}>()

const visible = ref(true)

const handleClick = () => {
  visible.value = !visible.value
}
</script>

<style lang='scss' scoped>
.gi-split-pane {
  flex: 1;
  display: flex;
  align-items: stretch;
  overflow: hidden;

  &__left,
  &__right {
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
  }

  &__left {
    padding-right: $padding;
  }

  &__right {
    flex: 1;
    padding-left: $padding;
  }

  &__line {
    width: 1px;
    height: auto;
    background-color: var(--color-border-2);
    position: relative;
  }
}
</style>
