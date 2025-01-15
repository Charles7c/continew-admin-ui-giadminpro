<template>
  <div>
    <a-card title="" :bordered="false" :body-style="{ padding: 0 }">
      <a-menu :default-open-keys="['0']" :selected-keys="[selectedKey]">
        <a-sub-menu key="0">
          <template #icon>
            <icon-apps></icon-apps>
          </template>
          <template #title>文件类型</template>
          <a-menu-item v-for="item in FileTypeList" :key="item.value.toString()" @click="onClickItem(item)">
            <template #icon>
              <GiSvgIcon :size="28" :name="item.icon"></GiSvgIcon>
            </template>
            <span>{{ item.name }}</span>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-card>
    <FileAsideStatistics />
  </div>
</template>

<script setup lang="ts">
import { FileTypeList, type FileTypeListItem } from '@/constant/file'
import FileAsideStatistics from '@/views/system/file/main/FileAsideStatistics.vue'

const route = useRoute()
const router = useRouter()

const selectedKey = ref('0')

// 监听路由变化
watch(
  () => route.query,
  () => {
    selectedKey.value = route.query.type as string || '0'
  },
  {
    immediate: true,
  },
)

// 点击事件
const onClickItem = (item: FileTypeListItem) => {
  router.replace({ name: 'SystemFile', query: { type: item.value } })
}
</script>

<style scoped lang="scss">
:deep(.arco-card) {
  .arco-card-header {
    border-bottom-style: dashed;
    margin: 0 16px;
    padding-left: 0;
    padding-right: 0;
    .arco-card-header-title {
      color: var(--color-text-1);
      font-size: 18px;
      font-weight: 500;
      line-height: 1.5;
    }
  }
}
</style>
