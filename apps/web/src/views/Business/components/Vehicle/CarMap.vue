<template>
	<div class="car-map-container">
		<Amap class="amap" my-id="car-map" ref="amapRef"></Amap>
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
		type: Object,
		default: null,
	},
});

onMounted(() => {
	if (amapRef.value) {
		amapRef.value.add_marker(myProps.data.longitude, myProps.data.latitude);
	}
});
</script>

<style scoped>
.car-map-container {
	width: 100%;
	height: 400px;
}
.amap {
	width: 100%;
	height: 100%;
}
</style>
