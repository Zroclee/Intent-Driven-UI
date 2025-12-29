<template>
  <div class="id-bubble" :class="bubbleClass">
    <!-- Avatar -->
    <div v-if="avatarConfig && avatarConfig.imgSrc" class="id-bubble-avatar">
      <span class="id-bubble-avatar-wrapper">
        <img :src="avatarConfig.imgSrc" :alt="avatarConfig.alt || 'avatar'" :style="avatarStyle" />
      </span>
    </div>

    <!-- Content Container -->
    <div
      class="id-bubble-content-container"
      :class="{ 'with-avatar': avatarConfig && avatarConfig.imgSrc }"
    >
      <!-- Prefix Slot -->
      <div v-if="$slots.prefix" class="id-bubble-prefix">
        <slot name="prefix"></slot>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <slot name="loadingTpl">
          <div class="id-bubble-loading">
            <div class="loading-dot dot-start"></div>
            <div class="loading-dot dot-middle"></div>
            <div class="loading-dot dot-end"></div>
          </div>
        </slot>
      </div>

      <!-- Bubble Content -->
      <div v-else class="id-bubble-content" :class="`variant-${variant}`">
        {{ content }}
      </div>

      <!-- Suffix Slot -->
      <div v-if="$slots.suffix" class="id-bubble-suffix">
        <slot name="suffix"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface AvatarConfig {
  imgSrc: string
  alt?: string
  size?: string
}

const props = withDefaults(
  defineProps<{
    content?: string
    align?: 'left' | 'right'
    variant?: 'filled' | 'bordered' | 'none'
    loading?: boolean
    avatarConfig?: AvatarConfig
  }>(),
  {
    content: '',
    align: 'left',
    variant: 'filled',
    loading: false,
    avatarConfig: undefined
  }
)

const bubbleClass = computed(() => {
  return [
    `id-bubble-${props.align}`,
    props.avatarConfig?.imgSrc ? 'id-bubble-avatar-side' : '',
    props.loading ? 'id-bubble-loading' : ''
  ]
})

const avatarStyle = computed(() => {
  const size = props.avatarConfig?.size || '36px'
  return {
    height: size,
    width: size,
    borderRadius: '100%'
  }
})
</script>

<style scoped src="./bubble.scss"></style>
