<template>
  <a-button size="mini" class="gi_hover_btn" @click="handleToggleTheme">
    <template #icon>
      <icon-moon-fill v-if="appStore.theme === 'light'" :size="18" />
      <icon-sun-fill v-else :size="18" />
    </template>
  </a-button>
</template>

<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

import { useAppStore } from '@/stores'

defineOptions({
  name: 'ToggleDark',
})

const appStore = useAppStore()

const isDark = useDark({
  onChanged(dark: boolean) {
    document.documentElement.setAttribute('class', dark ? 'dark' : 'light')
    appStore.toggleTheme(dark)
  },
})

const toggleTheme = useToggle(isDark)

const isAppearanceTransition = typeof document !== 'undefined'
  && 'startViewTransition' in document
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

const handleToggleTheme = (event?: MouseEvent) => {
  if (!isAppearanceTransition || !event) {
    return toggleTheme()
  }

  const { clientX: x, clientY: y } = event
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  )
  const transition = (document as any).startViewTransition(toggleTheme)

  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ]
    document.documentElement.animate(
      {
        clipPath: isDark.value ? [...clipPath].reverse() : clipPath,
      },
      {
        duration: 500,
        easing: 'ease-in',
        pseudoElement: isDark.value
          ? '::view-transition-old(root)'
          : '::view-transition-new(root)',
      },
    )
  })
}
</script>
