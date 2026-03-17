<template>
	<div :id="myId"></div>
</template>

<script setup lang="ts">
import AMapLoader from "@amap/amap-jsapi-loader";
import { onMounted, onUnmounted } from "vue";
import { ref } from "vue";

const props = defineProps({
	myId: String,
});

let AMap: any;
let myAmap: any | null = null;
const isMapLoaded = ref(false);
const cacheList: Array<{ funcName: string; args: any }> = [];

const add_marker = (lng: number, lat: number) => {
	console.log("add_marker", lng, lat);
	if (isMapLoaded.value && AMap && myAmap) {
		// 地图已加载，直接添加标记
		const marker = new AMap.Marker({
			position: [lng, lat],
		});
		myAmap.add(marker);
		myAmap.setZoomAndCenter(13, [lng, lat]);
	} else {
		// 地图未加载，缓存标记数据
		cacheList.push({ funcName: "add_marker", args: { lng: lng, lat: lat } });
	}
};
const add_track = (tracks: { lng: number; lat: number }[]) => {
	console.log("add_track", tracks.length);
	if (isMapLoaded.value && AMap && myAmap) {
		const LngLats = tracks.map((item) => new AMap.LngLat(item.lng, item.lat));
		// 创建轨迹对象
		const polyline = new AMap.Polyline({
			path: LngLats,
			strokeColor: "#FF33FF",
			strokeOpacity: 1,
			strokeWeight: 5,
		});
		// 添加轨迹对象到地图上
		myAmap.add(polyline);

		// 设置地图的显示范围
		myAmap.setFitView();
	} else {
		// 地图未加载，缓存标记数据
		cacheList.push({ funcName: "add_track", args: tracks });
	}
};

defineExpose({
	add_marker,
	add_track,
});

onMounted(() => {
	loadAmap();
});
onUnmounted(() => {
	if (myAmap) {
		myAmap.destroy();
		myAmap = null;
	}
});

const loadAmap = async () => {
	try {
		const key = import.meta.env.VITE_APP_AMAP_KEY;
		AMap = await AMapLoader.load({
			key: key,
			version: "2.0",
			plugins: [
				"AMap.Scale",
				"AMap.ToolBar",
				"AMap.MapType",
				"AMap.PolyEditor",
				"AMap.CircleEditor",
			],
		});

		// console.log('AMap loaded', AMap)
		// 22.5445741, 114.0545429
		myAmap = new AMap.Map(props.myId, {
			zoom: 13,
			center: [114.0545429, 22.5445741],
		});

		console.log("AMap loaded", AMap);

		// 地图加载完成，标记加载状态
		isMapLoaded.value = true;

		// 处理缓存的标记数据
		processCachedMarkers();
	} catch (error) {
		console.log("error:", error);
	}
};

// 处理缓存的标记数据
const processCachedMarkers = () => {
	console.log("processCachedMarkers", cacheList);
	if (cacheList.length > 0 && AMap && myAmap) {
		cacheList.forEach((data: any) => {
			switch (data.funcName) {
				case "add_marker":
					add_marker(data.args.lng, data.args.lat);
					break;
				case "add_track":
					add_track(data.args);
					break;
				default:
					break;
			}
		});
		// 清空缓存
		cacheList.length = 0;
	}
};
</script>

<style scoped>
#container {
	width: 100%;
	height: 100%;
}
</style>
