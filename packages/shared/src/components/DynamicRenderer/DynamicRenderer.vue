<script setup lang="ts">
import { computed, markRaw, toRaw } from "vue";
import { RegisteredComponent, DynamicComponentData } from "../types/index";
import ErrorComponent from "./components/Error.vue";

defineOptions({
	name: "IDUDynamicRenderer",
});

const props = defineProps<{
	registeredComponents: RegisteredComponent[];
	dynamicComponents: DynamicComponentData[];
}>();

const renderList = computed(() => {
	return props.dynamicComponents.map((item, index) => {
		const def = props.registeredComponents.find(
			(rc) => rc.componentId === item.componentId
		);

		if (!def) {
			console.warn(
				`[IDUDynamicRenderer] Component with id "${item.componentId}" not found in registeredComponents.`
			);
			return {
				uniqueKey: item.key ?? `${item.componentId}-${index}`,
				component: markRaw(ErrorComponent),
				mergedProps: {
					data: JSON.stringify(item.data),
				},
			};
		}

		return {
			// Use provided key or fallback to componentId-index combination
			uniqueKey: item.key ?? `${item.componentId}-${index}`,
			component: markRaw(toRaw(def.component)),
			mergedProps: {
				...def.props,
				...item.data,
			},
		};
	});
});
</script>

<template>
	<div class="dynamic-renderer">
		<template v-for="item in renderList" :key="item.uniqueKey">
			<component :is="item.component" v-bind="item.mergedProps" />
		</template>
	</div>
</template>

<style scoped>
@import "../styles/idu.css";

.dynamic-renderer {
	display: flex;
	flex-direction: column;
	width: 100%;
	gap: 16px;
}
</style>
