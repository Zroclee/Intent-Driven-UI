<script setup lang="ts">
import { computed } from "vue";
import SendIcon from "./components/SendIcon.vue";

defineOptions({
	name: "IDUInput",
});

const props = withDefaults(
	defineProps<{
		modelValue?: string;
		placeholder?: string;
		maxlength?: number;
	}>(),
	{
		maxlength: 2000,
	}
);

const emit = defineEmits<{
	(e: "update:modelValue", value: string): void;
	(e: "enter"): void;
}>();

const currentLength = computed(() => props.modelValue?.length || 0);

const handleInput = (event: Event) => {
	const target = event.target as HTMLTextAreaElement;
	emit("update:modelValue", target.value);
};

const handleKeydown = (event: KeyboardEvent) => {
	if (event.key === "Enter" && !event.shiftKey) {
		event.preventDefault(); // 阻止默认的换行行为
		emit("enter");
	}
};

const handleSend = () => {
	emit("enter");
};
</script>

<template>
	<div class="input-wrapper">
		<div v-if="$slots.header" class="input-header">
			<slot name="header"></slot>
		</div>
		<textarea
			class="input-textarea"
			:value="modelValue"
			:placeholder="placeholder"
			:maxlength="maxlength"
			rows="2"
			@input="handleInput"
			@keydown="handleKeydown"
		></textarea>
		<div class="input-footer">
			<div class="footer-left">
				<slot name="footer-left">
					<span class="char-count">{{ currentLength }} / {{ maxlength }}</span>
				</slot>
			</div>
			<button class="send-btn" @click="handleSend">
				<span>Send</span>
				<SendIcon />
			</button>
		</div>
	</div>
</template>

<style scoped>
@import "../styles/idu.css";

.input-wrapper {
	width: 100%;
	border: 1px solid var(--idu-border-color);
	border-radius: 8px;
	background-color: var(--idu-bg-color-white);
	transition: border-color 0.2s, box-shadow 0.2s;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.input-wrapper:focus-within {
	border-color: var(--idu-color-primary);
	box-shadow: 0 0 0 2px rgba(90, 200, 250, 0.2);
}

.input-textarea {
	width: 100%;
	padding: 10px 14px;
	border: none;
	outline: none;
	background-color: transparent;
	color: var(--idu-text-color);
	resize: none; /* 禁止手动调整大小，或者根据需求改为 vertical */
	font-family: inherit;
	font-size: inherit;
	line-height: 1.5;
}

.input-textarea::placeholder {
	color: #999;
}

.input-header {
	padding: 8px 14px 0;
}

.input-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8px 14px;
	/* border-top: 1px solid #f0f0f0;  可选：如果想要分隔线 */
}

.footer-left {
	display: flex;
	align-items: center;
	font-size: 12px;
	color: #999;
}

.send-btn {
	display: flex;
	align-items: center;
	gap: 6px;
	background-color: var(--idu-color-primary);
	color: white;
	border: none;
	border-radius: 4px;
	padding: 4px 12px;
	font-size: 12px;
	cursor: pointer;
	transition: background-color 0.2s;
	font-weight: 500;
}

.send-btn:hover {
	background-color: var(--idu-color-primary-dark);
}

.send-btn:active {
	background-color: var(--idu-color-primary-dark);
	opacity: 0.9;
}
</style>
