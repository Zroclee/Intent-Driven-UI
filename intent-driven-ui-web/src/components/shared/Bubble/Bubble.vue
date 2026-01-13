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
      <div
        v-if="content && content.length !== 0"
        class="id-bubble-content"
        :class="`variant-${variant}`"
      >
        {{ content }}
      </div>

      <!-- Steps Content -->
      <div v-if="steps" class="id-bubble-steps id-bubble-content variant-filled">
        <div v-for="(step, index) in steps" :key="index">
          <div v-if="isStepJsonButton(step)" class="id-bubble-step-button">
            <button class="id-bubble-action-btn" @click="handleStepClick(step)">
              {{ getStepButtonLabel(step) }}
            </button>
          </div>
          <div v-else class="id-bubble-step-content">{{ step }}</div>
        </div>
      </div>

      <!-- Suffix Slot -->
      <div v-if="$slots.suffix" class="id-bubble-suffix">
        <slot name="suffix"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 气泡组件
 * 功能描述：
 * 1. 支持头像、名称。
 *   头像、名称、气泡三种组合方式：1. 只有气泡，名称、头像都不展示。2. 头像在左侧，名称和气泡在右侧。3.气泡在左侧，名称不显示，气泡在右侧。
 * 2. 支持加载中状态。
 *   有两种加载中情况：1. 对话刚开始、无内容，显示一个加载中的图。2. 对话进行中，智能体需要思考，显示一个三个点跳动的动画，并在左侧显示当前进度标题。
 * 3. 分步骤展示AI返回内容。
 *   1. 默认情况下，直接展示content。
 *   2. 当content为数组时，则展示数组中的每一项，并自动换行。
 *
 */
import { computed } from 'vue'

interface AvatarConfig {
  imgSrc: string
  alt?: string
  size?: string
}

export interface StepJsonData {
  code: number
  data: unknown
  componentName: string
}

const props = withDefaults(
  defineProps<{
    content?: string
    steps?: { [key: string]: string } | null
    align?: 'left' | 'right'
    variant?: 'filled' | 'bordered' | 'none'
    loading?: boolean
    avatarConfig?: AvatarConfig
  }>(),
  {
    steps: null,
    content: '',
    align: 'left',
    variant: 'filled',
    loading: false,
    avatarConfig: undefined
  }
)

const emit = defineEmits<{
  stepClick: [data: StepJsonData]
}>()

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

const isStepJsonButton = (step: string): boolean => {
  try {
    const parsed = JSON.parse(step) as StepJsonData
    return !!(
      parsed.code === 200 &&
      parsed.componentName &&
      parsed.componentName.length > 0 &&
      (Array.isArray(parsed.data) || typeof parsed.data === 'object')
    )
  } catch {
    return false
  }
}

const getStepButtonLabel = (step: string): string => {
  try {
    const parsed = JSON.parse(step) as StepJsonData
    return parsed.componentName || '操作'
  } catch {
    return '操作'
  }
}

const handleStepClick = (step: string) => {
  try {
    const parsed = JSON.parse(step) as StepJsonData
    emit('stepClick', parsed)
  } catch (error) {
    console.error('Failed to parse step data:', error)
  }
}
</script>

<style scoped src="./bubble.scss"></style>
