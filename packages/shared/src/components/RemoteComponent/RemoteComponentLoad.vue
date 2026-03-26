<template>
	<Suspense>
		<template #default>
			<component :is="AsyncComponent" v-bind="componentProps" />
		</template>
		<template #fallback>
			<slot name="fallback">
				<div class="loading">加载远程组件中...</div>
			</slot>
		</template>
	</Suspense>
</template>

<script lang="ts">
// 使用模块级作用域缓存已加载的脚本，避免同一个远程组件地址被重复请求
const scriptCache: Record<string, Promise<any> | undefined> = {};
</script>

<script setup lang="ts">
import { defineAsyncComponent, computed } from "vue";

const props = withDefaults(
	defineProps<{
		/** 远程组件 JS 文件的 URL */
		url: string;
		/** 挂载在 window.RemoteUI 上的组件名称 */
		name: string;
		/** 传递给远程组件的参数 */
		componentProps?: Record<string, any>;
	}>(),
	{
		componentProps: () => ({}),
	}
);

// 动态加载远程组件脚本
const loadRemoteUI = (url: string): Promise<any> => {
	// 1. 如果该 URL 正在加载或已加载，直接返回缓存的 Promise
	if (scriptCache[url]) {
		return scriptCache[url]!;
	}

	// 2. 如果全局对象上已经存在 RemoteUI（例如预加载或同包已加载），直接返回
	if ((window as any).RemoteUI) {
		return Promise.resolve((window as any).RemoteUI);
	}

	// 3. 否则创建新的加载任务并缓存
	const promise = new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = url;
		script.async = true;

		script.onload = () => {
			resolve((window as any).RemoteUI);
		};

		script.onerror = (err) => {
			delete scriptCache[url]; // 加载失败时清除缓存，允许后续重试
			reject(err);
		};

		document.head.appendChild(script);
	});

	scriptCache[url] = promise;
	return promise;
};

// 使用 computed 响应式地创建异步组件，支持 url 或 name 动态切换
const AsyncComponent = computed(() => {
	return defineAsyncComponent(async () => {
		const remote = await loadRemoteUI(props.url);
		const component = remote?.[props.name];
		if (!component) {
			throw new Error(`Remote component "${props.name}" not found at ${props.url}`);
		}
		return component;
	});
});
</script>

<style scoped>
.loading {
	padding: 20px;
	text-align: center;
	color: #666;
}
</style>
