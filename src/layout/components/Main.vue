<template>
  <a-layout class="main">
    <router-view v-slot="{ Component, route }">
      <transition :name="appStore.transitionName" mode="out-in" appear>
        <keep-alive :include="(tabsStore.cacheList as string[])">
          <component :is="Component" v-if="tabsStore.reloadFlag" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
  </a-layout>
</template>

<script setup lang="ts">
import { useAppStore, useTabsStore } from '@/stores'

defineOptions({ name: 'LayoutMain' })
const appStore = useAppStore()
const tabsStore = useTabsStore()
</script>

<style scoped lang="scss">
.main {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
</style>
