<template>
  <a-card
    class="general-card"
    title="快捷操作"
    :header-style="{ paddingBottom: '0' }"
    :body-style="{ padding: '24px 20px 16px 20px' }"
  >
    <a-row :gutter="8">
      <a-empty v-if="!has.hasPermOr(links.map((item) => item.permission))" />
      <a-col
        v-for="link in links"
        v-else
        v-show="has.hasPerm(link.permission)"
        :key="link.text"
        :span="8"
        class="wrapper"
        @click="router.replace({ path: link.path })"
      >
        <div class="icon">
          <GiSvgIcon :name="link.icon" />
        </div>
        <a-typography-paragraph class="text">
          {{ link.text }}
        </a-typography-paragraph>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup lang="ts">
import has from '@/utils/has'

const router = useRouter()

const links = [
  { text: '用户管理', icon: 'user', path: '/system/user', permission: 'system:user:list' },
  { text: '角色管理', icon: 'user-group', path: '/system/role', permission: 'system:role:list' },
  { text: '菜单管理', icon: 'menu', path: '/system/menu', permission: 'system:menu:list' },
  { text: '文件管理', icon: 'file', path: '/system/file', permission: 'system:file:list' },
  { text: '代码生成', icon: 'code', path: '/code/generator', permission: 'code:generator:list' },
  { text: '系统日志', icon: 'history', path: '/monitor/log', permission: 'monitor:log:list' },
]
</script>

<style scoped lang="less"></style>
