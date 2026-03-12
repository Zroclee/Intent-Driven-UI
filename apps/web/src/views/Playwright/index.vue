<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { IDUHeader, IDUBubble, IDUInput } from "@idu/core";

const router = useRouter();

interface Message {
	id: number | string;
	content?: string;
	align?: "left" | "right";
	loading?: boolean;
	avatar?: string;
	name?: string;
}

const AI_AVATAR = "https://api.dicebear.com/7.x/bottts/svg?seed=Milo";
const USER_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

const messages = ref<Message[]>([
	{
		id: 1,
		content: "你好，我是你的 Playwright 助手，有什么可以帮你的吗？",
		align: "left",
		avatar: AI_AVATAR,
		name: "Playwright 助手",
	},
]);

const inputValue = ref("");
const chatContentRef = ref<HTMLElement | null>(null);

const scrollToBottom = async () => {
	await nextTick();
	if (chatContentRef.value) {
		chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight;
	}
};

const curChatId = ref("");

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
    inputValue.value = content
});

const myES = ref<EventSource | null>(null);

const closeSSE = () => {
	if (myES.value) {
		myES.value.close();
		myES.value = null;
	}
};

onUnmounted(() => {
	closeSSE();
});

  const content = `新增用户操作
1. 前往用户管理页面：http://localhost:5173/product/users
2. 点击新增“新增”按钮
3. 在弹窗中填写用户信息：用户名（input name="form-username"）、组织（select name="form-organization"）、角色（select name="form-role"）
4. 点击"确认"按钮

用户名：李照鹏，组织：市场部，角色：普通用户
`


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
		name: "业务助手",
		loading: true,
	});
	messages.value.push(aiMessage.value);
	scrollToBottom();

	const url =
		"http://localhost:3000/chat/playwright?query=" +
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
					// 可选：显示工具调用过程
					// aiMessage.value.content += `\n\n> 正在调用工具: ${data.tool_name}...\n\n`;
					break;
				case "tool_output":
					console.log("📤 工具返回:", data.content);
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
					// console.log("❓ 未知事件:", data);
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

// 模拟添加动态组件的函数（保留按钮但移除模拟数据逻辑，避免干扰）
const toggleDynamicComponent = () => {
	console.log("Dynamic components are now driven by AI.");
	router.push("/business-setting");
};
</script>

<template>
	<div class="business-assistant">
		<IDUHeader title="业务助手">
			<template #left>
				<button class="header-icon-btn" @click="router.push('/')">🔙</button>
			</template>
			<template #right>
				<button class="header-icon-btn" @click="toggleDynamicComponent">
					⚙️
				</button>
			</template>
		</IDUHeader>

		<div class="content-container">
			<!-- 左侧聊天区域 -->
			<div class="chat-panel">
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
		</div>
	</div>
</template>

<style scoped>
.business-assistant {
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: #f9f9f9;
	overflow: hidden;
}

.content-container {
	flex: 1;
	display: flex;
	overflow: hidden;
	position: relative;
}

.chat-panel {
	width: 100%;
	display: flex;
	flex-direction: column;
	transition: width 0.5s ease;
	border-right: 1px solid transparent;
}

.chat-panel.is-shrunk {
	width: 33.33%; /* 1/3 宽度 */
	border-right: 1px solid #eee;
}

.dynamic-panel {
	flex: 1;
	background-color: #fff;
	padding: 20px;
	overflow-y: auto;
}

/* 过渡动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
	transition: all 0.5s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
	transform: translateX(100%);
	opacity: 0;
}

.header-icon-btn {
	border: none;
	background: transparent;
	cursor: pointer;
	outline: none;
	padding: 4px;
	font-size: 1.2rem;
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
