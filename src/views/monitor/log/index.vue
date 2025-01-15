<template>
  <div class="gi_table_page">
    <!-- <a-row justify="space-between" align="center" class="header">
      <a-space wrap>
        <div class="title">系统日志</div>
      </a-space>
    </a-row> -->
    <a-tabs v-model:active-key="activeKey" type="card-gutter" size="large" @change="change">
      <a-tab-pane key="1">
        <template #title><icon-lock /> 登录日志</template>
      </a-tab-pane>
      <a-tab-pane key="2">
        <template #title><icon-find-replace /> 操作日志</template>
      </a-tab-pane>
    </a-tabs>
    <keep-alive>
      <component :is="PaneMap[activeKey]" />
    </keep-alive>
  </div>
</template>

<script setup lang="ts">
import LoginLog from './login/index.vue'
import OperationLog from './operation/index.vue'

const route = useRoute()
const router = useRouter()

const PaneMap: Record<string, Component> = {
  1: LoginLog,
  2: OperationLog,
}

const activeKey = ref('1')
watch(
  () => route.query,
  () => {
    if (route.query.tabKey) {
      activeKey.value = String(route.query.tabKey)
    }
  },
  { immediate: true },
)

const change = (key: string | number) => {
  activeKey.value = key as string
  router.replace({ path: route.path, query: { tabKey: key } })
}
</script>

<style scoped lang="scss">
:deep(.arco-tabs .arco-tabs-nav-type-card-gutter .arco-tabs-tab-active) {
  box-shadow: inset 0 2px 0 rgb(var(--primary-6)), inset -1px 0 0 var(--color-border-2),
    inset 1px 0 0 var(--color-border-2);
  position: relative;
}

:deep(.arco-tabs-nav-type-card-gutter .arco-tabs-tab) {
  border-radius: var(--border-radius-medium) var(--border-radius-medium) 0 0;
}

:deep(.arco-tabs-type-card-gutter > .arco-tabs-content) {
  border: none;
}

:deep(.arco-tabs-nav::before) {
  left: -20px;
  right: -20px;
}

:deep(.arco-tabs) {
  overflow: visible;
}

:deep(.arco-tabs-nav) {
  overflow: visible;
}
</style>
