import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import BusinessAssistantView from "../views/Business/index.vue";
import BusinessSettingView from "../views/Business/setting.vue";
import ProductAssistantView from "../views/ProductAssistantView.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: HomeView,
		},
		{
			path: "/business-assistant",
			name: "business-assistant",
			component: BusinessAssistantView,
		},
		{
			path: "/business-setting",
			name: "business-setting",
			component: BusinessSettingView,
		},
		{
			path: "/product-assistant",
			name: "product-assistant",
			component: ProductAssistantView,
		},
	],
});

export default router;
