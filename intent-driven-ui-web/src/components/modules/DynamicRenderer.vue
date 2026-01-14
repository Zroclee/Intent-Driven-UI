<template>
  <div class="dynamic-renderer-container"></div>
</template>

<script setup lang="ts">
/**
 * 动态渲染组件
 */
export interface DynamicRendererProps<T = any> {
  components: {
    componentName: {
      type: String
      default: ''
    }
    componentProps: {
      type: T
      default: () => {}
    }
  }
}

const myProps = defineProps<DynamicRendererProps>()
</script>

<style scoped></style>
