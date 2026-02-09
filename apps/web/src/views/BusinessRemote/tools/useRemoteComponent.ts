import { defineAsyncComponent } from "vue";
import { loadRemoteUI } from "./loadRemoteUI";

import type { RemoteUI } from "./remote-ui";

export function useRemoteComponent<K extends keyof RemoteUI>(name: K) {
	return defineAsyncComponent(async () => {
		const remote = await loadRemoteUI();
		const component = remote[name];
		if (!component) {
			throw new Error(`Remote component "${name}" not found`);
		}

		return component;
	});

	// return defineAsyncComponent({
	// 	loader: async () => {
	// 		const remote = await loadRemoteUI();
	// 		return remote[name];
	// 	},
	// 	loadingComponent: Loading,
	// 	errorComponent: ErrorComp,
	// 	delay: 200,
	// 	timeout: 10000,
	// });
}
