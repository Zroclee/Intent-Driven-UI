<template>
  <div class="id-input">
    <slot></slot>
    <div class="input-wrapper">
      <textarea v-model="model" :placeholder="placeholder" @keydown.enter="handleEnter"></textarea>
      <button
        class="send-button"
        :class="{ disabled: !model || model.trim() === '' || loading }"
        :disabled="!model || model.trim() === '' || loading"
        @click="handleSend"
      >
        <svg v-if="!loading" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 4V20M12 4L8 8M12 4L16 8"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg
          v-else
          class="loading-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
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
