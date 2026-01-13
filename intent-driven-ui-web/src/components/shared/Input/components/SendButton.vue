<template>
  <button class="id-input-send-button" @click="handleClick">
    <span class="send-button-content">
      <GeneratIcon v-if="props.loading"></GeneratIcon>
      <SendIcon v-else></SendIcon>
    </span>
  </button>
</template>

<script setup lang="ts">
import GeneratIcon from './GeneratIcon.vue'
import SendIcon from './SendIcon.vue'
// import SendSVG from './send.svg'

const myEmit = defineEmits(['send'])

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const handleClick = () => {
  myEmit('send')
}
</script>

<style scoped lang="scss">
.id-input-send-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--id-color-primary, #1890ff) 0%, #096dd9 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  padding: 0;
  transition: all var(--id-duration-base, 200ms) var(--id-ease-in-out);
  box-shadow:
    0 2px 4px rgba(24, 144, 255, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.05);

  .send-button-content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--id-color-white);

    svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
      transition: transform var(--id-duration-base, 200ms) var(--id-ease-in-out);
    }

    // 加载动画样式
    .loading-icon {
      animation: spin 1s linear infinite;
      opacity: 0.9;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  }

  &:hover:not(.disabled) {
    background: linear-gradient(135deg, var(--id-color-primary-hover, #40a9ff) 0%, #1890ff 100%);
    transform: translateY(-2px) scale(1.05);
    box-shadow:
      0 4px 12px rgba(24, 144, 255, 0.3),
      0 2px 6px rgba(0, 0, 0, 0.1);
  }

  &:active:not(.disabled) {
    transform: translateY(0) scale(1);
    box-shadow:
      0 2px 6px rgba(24, 144, 255, 0.25),
      0 1px 3px rgba(0, 0, 0, 0.08);
  }

  &.disabled {
    background: linear-gradient(135deg, #d9d9d9 0%, #bfbfbf 100%);
    cursor: not-allowed;
    opacity: 0.6;
    box-shadow: none;

    &:hover {
      transform: none;

      .send-button-content svg {
        transform: none;
      }
    }
  }
}
</style>
