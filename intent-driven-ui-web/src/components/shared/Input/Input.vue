<template>
  <div class="id-input">
    <slot></slot>
    <div class="id-input-content">
      <textarea v-model="model" :placeholder="placeholder" @keydown.enter="handleEnter"></textarea>
      <send-button @send="handleSend"></send-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import SendButton from './components/SendButton.vue'
const model = defineModel({
  type: String
})

const emit = defineEmits<{
  send: [value: string]
}>()

const props = defineProps({
  placeholder: {
    type: String,
    default: ''
  },
  value: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const handleSend = () => {
  if (model.value && model.value.trim() !== '') {
    emit('send', model.value)
  }
}

const handleEnter = (e: KeyboardEvent) => {
  if (!e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>
<style scoped lang="scss">
@use './input.scss';
</style>
