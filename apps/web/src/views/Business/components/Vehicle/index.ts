import { defineAsyncComponent } from "vue";

import type { RegisteredComponent } from "@idu/core";
export const vehicleComponents: RegisteredComponent[] = [
	{
		componentId: "CarList",
		description: "组件-车辆列表组件，参数配置：data: 车辆列表数据",
		component: defineAsyncComponent(() => import("./CarList.vue")),
		props: {
			data: [],
		},
	},
	{
		componentId: "CarTrack",
		description: "组件-车辆轨迹回放组件，参数配置：data: 轨迹点列表",
		component: defineAsyncComponent(() => import("./CarTrack.vue")),
		props: {
			data: [],
		},
	},
	{
		componentId: "CarMap",
		description: "组件-车辆定位组件，参数配置：data: 车辆定位数据",
		component: defineAsyncComponent(() => import("./CarMap.vue")),
		props: {
			data: {},
		},
	},
];

export default vehicleComponents;
