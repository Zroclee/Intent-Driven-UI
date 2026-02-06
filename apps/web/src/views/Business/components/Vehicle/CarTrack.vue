<template>
	<div class="car-track-container">
		<Amap class="amap" my-id="car-track" ref="amapRef"></Amap>
	</div>
</template>

<script setup lang="ts">
import Amap from "./components/Amap.vue";
import { useTemplateRef, onMounted } from "vue";
export interface TypeLatLng {
	lat: number;
	lng: number;
}
const amapRef = useTemplateRef("amapRef");
const myProps = defineProps({
	data: {
		type: Array,
		default: null,
	},
});

onMounted(() => {
	if (amapRef.value && myProps.data && myProps.data.length > 0) {
		const tracks = myProps.data.map((item: any) => {
			return {
				lng: item.longitude,
				lat: item.latitude,
			};
		});
		amapRef.value.add_track(tracks);
	}
});
</script>

<style scoped>
.car-track-container {
	width: 100%;
	height: 400px;
}
.amap {
	width: 100%;
	height: 100%;
}
</style>
