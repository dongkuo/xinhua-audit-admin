<script setup lang="ts">

const settingsStore = useSettingsStore()

const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)')
watch(() => settingsStore.settings.app.colorScheme, (colorScheme) => {
  if (colorScheme === '') {
    prefersColorScheme.addEventListener('change', updateTheme)
  }
  else {
    prefersColorScheme.removeEventListener('change', updateTheme)
  }
  nextTick(() => {
    updateTheme()
  })
}, {
  immediate: true,
})
function updateTheme() {
  switch (settingsStore.currentColorScheme) {
    case 'light':
      document.documentElement.removeAttribute('theme-mode')
      break
    case 'dark':
      document.documentElement.setAttribute('theme-mode', 'dark')
      break
  }
}
</script>

<template>
  <TConfigProvider>
    <slot />
  </TConfigProvider>
</template>
