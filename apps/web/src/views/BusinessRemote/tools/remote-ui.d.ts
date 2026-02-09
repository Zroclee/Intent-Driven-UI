import { DefineComponent } from "vue";

export interface RemoteUI {
	CustomerSignList: DefineComponent<any, any, any>;
	WitnessAssetList: DefineComponent<any, any, any>;
	WitnessTaskList: DefineComponent<any, any, any>;
}

declare global {
	interface Window {
		RemoteUI: RemoteUI;
	}
}
