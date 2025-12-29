<template>
  <header class="id-header">
    <!-- Logo 区域 -->
    <div
      class="id-header-logo-container"
      :class="{ clickable: isLogoClickable }"
      @click="handleLogoClick"
    >
      <img
        v-if="logo"
        :src="logo"
        :alt="logoAlt || 'logo'"
        class="id-header-logo"
      />
      <div class="id-header-title">
        {{ title }}
      </div>
    </div>

    <!-- 右侧操作区域 -->
    <div class="id-header-operation">
      <slot name="operation"></slot>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  logo?: string
  logoAlt?: string
  isLogoClickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Intent Driven UI',
  logo: '',
  logoAlt: 'logo',
  isLogoClickable: false
})

const emit = defineEmits<{
  logoClick: []
}>()

const handleLogoClick = () => {
  if (props.isLogoClickable) {
    emit('logoClick')
  }
}
</script>

<style scoped src="./header.scss"></style>
