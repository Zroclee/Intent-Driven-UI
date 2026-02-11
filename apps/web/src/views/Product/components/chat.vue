<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import eventBus from "../../../utils/eventBus";
import { IDUBubble, IDUInput } from "@idu/core";

interface Message {
	id: number | string;
	content?: string;
	align?: "left" | "right";
	loading?: boolean;
	avatar?: string;
	name?: string;
}

const AI_AVATAR = "https://api.dicebear.com/7.x/bottts/svg?seed=ProductAI";
const USER_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

const messages = ref<Message[]>([
	{
		id: 1,
		content: "你好，我是你的产品助手，有什么可以帮你的吗？",
		align: "left",
		avatar: AI_AVATAR,
		name: "产品助手",
	},
]);

const inputValue = ref("");
const chatContentRef = ref<HTMLElement | null>(null);
const curChatId = ref("");
const myES = ref<EventSource | null>(null);

const scrollToBottom = () => {
	nextTick(() => {
		if (chatContentRef.value) {
			chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight;
		}
	});
};

/**
 * 生成唯一的对话ID
 */
const createChatId = () => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

onMounted(() => {
	curChatId.value = createChatId();
});

const closeSSE = () => {
	if (myES.value) {
		myES.value.close();
		myES.value = null;
	}
};

onUnmounted(() => {
	closeSSE();
});

const connectSSE = async (query: string) => {
	if (myES.value) {
		console.log("SSE 已存在，请勿重复创建");
		return;
	}

	// 创建 AI 消息占位
	const aiMessageId = Date.now();
	const aiMessage = ref<Message>({
		id: aiMessageId,
		content: "",
		align: "left",
		avatar: AI_AVATAR,
		name: "产品助手",
		loading: true,
	});
	messages.value.push(aiMessage.value);
	scrollToBottom();

	const url =
		"http://localhost:3000/chat/product?query=" +
		encodeURIComponent(query) +
		"&thread_id=" +
		curChatId.value;
	console.log("🔗 连接 SSE:", url);

	const es = new EventSource(url);

	es.onopen = () => {
		console.log("✅ SSE 连接已建立");
	};

	es.onmessage = (event) => {
		try {
			const data = JSON.parse(event.data);
			// 收到消息后取消 loading 状态
			if (aiMessage.value.loading) {
				aiMessage.value.loading = false;
			}

			switch (data.event_type) {
				case "llm_start":
					console.log("🤖 AI 开始生成:", data.content);
					break;
				case "llm_content":
					aiMessage.value.content += data.content;
					break;
				case "llm_end":
					console.log("✅ 大模型生成完成");
					break;
				case "tool_call_start":
					console.log("🔧 调用工具:", data.tool_name, data.tool_args);
					break;
				case "tool_output":
					console.log("📤 工具返回:", data.content);
					// 解析 action 并通过 EventBus 通知
					try {
						const output = JSON.parse(data.content);
						if (output.actions && Array.isArray(output.actions)) {
							output.actions.forEach((action: any) => {
								console.log("🚀 触发 Action (EventBus):", action);
								eventBus.emit("action", action);
							});
						}
					} catch (e) {
						console.warn("⚠️ 解析工具返回数据失败:", e);
					}
					break;
				case "tool_call_end":
					console.log("✅ 工具调用完成");
					break;
				case "stream_end":
					console.log("🏁 流结束:", data.content);
					closeSSE();
					break;
				case "error":
					console.error("❌ 错误:", data.content);
					aiMessage.value.content += `\n\n[出错: ${data.content}]`;
					closeSSE();
					break;
				default:
					break;
			}
			scrollToBottom();
		} catch (error) {
			console.error("❌ 解析 SSE 数据失败:", error, "Raw data:", event.data);
			closeSSE();
		}
	};

	es.onerror = (error) => {
		console.error("❌ SSE error:", error);
		if (aiMessage.value.loading) {
			aiMessage.value.loading = false;
			aiMessage.value.content += "（连接中断）";
		}
		closeSSE();
	};

	myES.value = es;
};

const sendMessage = () => {
	if (!inputValue.value.trim()) return;

	const userText = inputValue.value;
	// 添加用户消息
	messages.value.push({
		id: Date.now(),
		content: userText,
		align: "right",
		avatar: USER_AVATAR,
	});

	inputValue.value = "";
	scrollToBottom();

	// 发起 SSE 请求
	connectSSE(userText);
};
</script>

<template>
	<div class="chat-container">
		<div class="chat-content" ref="chatContentRef">
			<div v-for="msg in messages" :key="msg.id" class="message-wrapper">
				<IDUBubble
					:content="msg.content"
					:align="msg.align"
					:loading="msg.loading"
					:avatar="msg.avatar"
					:name="msg.name"
				>
					<template #actions v-if="msg.align === 'left' && !msg.loading">
						<button
							class="action-btn"
							title="复制"
							@click="console.log('复制', msg.content)"
						>
							📋
						</button>
						<button
							class="action-btn"
							title="重新生成"
							@click="console.log('重新生成')"
						>
							🔄
						</button>
					</template>
				</IDUBubble>
			</div>
		</div>

		<div class="chat-footer">
			<IDUInput
				v-model="inputValue"
				placeholder="请输入您的问题..."
				@enter="sendMessage"
			/>
		</div>
	</div>
</template>

<style scoped>
.chat-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	background-color: #fff;
	overflow: hidden;
}

.chat-content {
	flex: 1;
	padding: 20px;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.message-wrapper {
	display: flex;
	width: 100%;
}

.action-btn {
	background: none;
	border: none;
	color: #606266;
	cursor: pointer;
	font-size: 12px;
	padding: 0;
	display: flex;
	align-items: center;
	gap: 4px;
	outline: none;
}

.chat-footer {
	padding: 16px;
	background-color: #fff;
	border-top: 1px solid #e0e0e0;
}
</style>
