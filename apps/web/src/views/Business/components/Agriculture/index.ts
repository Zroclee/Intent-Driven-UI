import { defineAsyncComponent } from "vue";

import type { RegisteredComponent } from "@idu/core";

export const agricultureComponents: RegisteredComponent[] = [
	{
		componentId: "FarmingWeather",
		description: "组件-气象监测组件，参数配置：data: 气象监测数据",
		component: defineAsyncComponent(() => import("./FarmingWeather.vue")),
		props: {
			data: {},
		},
	},
	{
		componentId: "FarmingCamera",
		description: "组件-摄像头列表组件，参数配置：data: 摄像头数据列表",
		component: defineAsyncComponent(() => import("./FarmingCamera.vue")),
		props: {
			data: [],
		},
	},
	{
		componentId: "FarmingDevice",
		description: "组件-农业设备列表组件，参数配置：data: 设备数据列表",
		component: defineAsyncComponent(() => import("./FarmingDevice.vue")),
		props: {
			data: [],
		},
	},
	{
		componentId: "FarmingSoil",
		description: "组件-土壤监测组件，参数配置：data: 土壤监测数据",
		component: defineAsyncComponent(() => import("./FarmingSoil.vue")),
		props: {
			data: {},
		},
	},
	{
		componentId: "FarmingWater",
		description: "组件-水质监测组件，参数配置：data: 水质监测数据",
		component: defineAsyncComponent(() => import("./FarmingWater.vue")),
		props: {
			data: {},
		},
	},
];

export default agricultureComponents;
