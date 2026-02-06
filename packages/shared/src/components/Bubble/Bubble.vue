<script setup lang="ts">
import { computed } from "vue";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-light.css";

defineOptions({
	name: "IDUBubble",
});

const props = defineProps<{
	content?: string;
	align?: "left" | "right";
	loading?: boolean;
	avatar?: string;
	name?: string;
}>();

const md: any = new MarkdownIt({
	html: false,
	linkify: true,
	typographer: true,
	highlight: function (str: string, lang: string) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return (
					'<pre><code class="hljs">' +
					hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
					"</code></pre>"
				);
			} catch (__) {}
		}

		return (
			'<pre><code class="hljs">' + md.utils.escapeHtml(str) + "</code></pre>"
		);
	},
});

const renderedContent = computed(() => {
	if (!props.content) return "";
	return md.render(props.content);
});
</script>

<template>
	<div
		class="bubble-wrapper"
		:class="{ 'bubble-wrapper--right': align === 'right' }"
	>
		<img v-if="avatar" :src="avatar" class="bubble-avatar" alt="avatar" />
		<div class="bubble-content">
			<span v-if="name" class="bubble-name">{{ name }}</span>
			<div
				class="bubble"
				:class="{
					'bubble--primary': align === 'right',
				}"
			>
				<div v-if="loading" class="bubble__loading">
					<span class="dot"></span>
					<span class="dot"></span>
					<span class="dot"></span>
				</div>
				<div
					v-else
					class="bubble-text markdown-body"
					v-html="renderedContent"
				></div>
			</div>
			<div v-if="$slots.actions" class="bubble-actions">
				<slot name="actions"></slot>
			</div>
		</div>
	</div>
</template>

<style scoped>
@import "../styles/idu.css";

.bubble-wrapper {
	display: flex;
	gap: 8px;
	width: 100%;
}

.bubble-wrapper--right {
	flex-direction: row-reverse;
}

.bubble-content {
	display: flex;
	flex-direction: column;
	max-width: 80%;
}

.bubble-wrapper--right .bubble-content {
	align-items: flex-end;
}

.bubble-avatar {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	object-fit: cover;
	flex-shrink: 0;
}

.bubble-name {
	font-size: 12px;
	color: var(--idu-text-color-secondary);
	margin-bottom: 4px;
	line-height: 1;
}

.bubble {
	padding: 10px 15px;
	border-radius: 12px;
	background-color: var(--idu-bg-color-gray);
	color: var(--idu-text-color);
	word-wrap: break-word;
	box-shadow: var(--idu-shadow-sm);
}

.bubble--primary {
	background-color: var(--idu-color-primary);
	color: var(--idu-text-color-inverse);
}

.bubble-actions {
	margin-top: 4px;
	display: flex;
	gap: 8px;
	font-size: 12px;
	color: var(--idu-text-color-secondary);
}

.bubble__loading {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 4px;
	min-height: 20px;
}

.dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background-color: var(--idu-color-primary);
	animation: loading-color 1.5s infinite ease-in-out;
}

.dot:nth-child(1) {
	animation-delay: 0s;
}

.dot:nth-child(2) {
	animation-delay: 0.2s;
}

.dot:nth-child(3) {
	animation-delay: 0.4s;
}

@keyframes loading-color {
	0%,
	100% {
		background-color: var(--idu-color-primary-dark);
	}
	33% {
		background-color: var(--idu-color-primary);
	}
	66% {
		background-color: var(--idu-color-primary-light);
	}
}

/* Markdown Styles */
:deep(.markdown-body) {
	font-size: 14px;
	line-height: 1.6;
}

:deep(.markdown-body p) {
	margin: 0 0 8px 0;
}

:deep(.markdown-body p:last-child) {
	margin-bottom: 0;
}

:deep(.markdown-body pre) {
	margin: 8px 0;
	padding: 12px;
	border-radius: 8px;
	background-color: #f6f8fa;
	overflow-x: auto;
}

:deep(.markdown-body code) {
	font-family: "Menlo", "Monaco", "Courier New", monospace;
	font-size: 12px;
}

:deep(.markdown-body img) {
	max-width: 100%;
	border-radius: 4px;
}

/* Adapt for primary bubble (user side) */
.bubble--primary :deep(.markdown-body pre) {
	background-color: rgba(255, 255, 255, 0.15);
	color: #fff;
}

.bubble--primary :deep(.markdown-body code.hljs) {
	background: transparent;
	color: inherit;
}
</style>
