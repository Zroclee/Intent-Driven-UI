<template>
	<div class="error-wrapper">
		<span v-if="data">{{ data }}</span>
		<span v-else>Error: Component Not Found</span>
	</div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";

defineProps({
	data: {
		type: [String, Number, Array, Object] as PropType<
			string | number | Array<any> | Record<string, any>
		>,
		default: null,
	},
});
</script>

<style scoped></style>
