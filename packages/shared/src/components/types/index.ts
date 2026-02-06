import type { Component } from "vue";
export interface RegisteredComponent {
	componentId: string;
	description?: string;
	component: Component;
	props?: Record<string, any>;
}

export interface DynamicComponentData {
	componentId: string;
	data?: Record<string, any>;
	// Optional unique key, otherwise index will be used
	key?: string | number;
}
