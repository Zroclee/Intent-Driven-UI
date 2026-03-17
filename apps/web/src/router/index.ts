import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import BusinessAssistantView from "../views/Business/index.vue";
import BusinessSettingView from "../views/BusinessRemote/setting.vue";

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
      path: "/business-remote",
      name: "business-remote",
      component: () => import("../views/BusinessRemote/index.vue"),
    },
    {
      path: "/business-setting",
      name: "business-setting",
      component: BusinessSettingView,
    },
    {
      path: "/playwright",
      name: "Playwright",
      component: () => import("../views/Playwright/index.vue"),
    },
    {
      path: "/deep-agent",
      name: "PlaywrightDeepAgent",
      component: () => import("../views/Playwright/deepAgent.vue"),
    },
    {
      path: "/product",
      name: "product-layout",
      component: () => import("../views/Product/index.vue"),
      redirect: "/product/users",
      children: [
        {
          path: "apps",
          name: "application-management",
          component: () =>
            import("../views/Product/pages/ApplicationManagement.vue"),
        },
        {
          path: "users",
          name: "user-management",
          component: () => import("../views/Product/pages/UserManagement.vue"),
        },
        {
          path: "roles",
          name: "role-management",
          component: () => import("../views/Product/pages/RoleManagement.vue"),
        },
        {
          path: "data-ledger",
          name: "data-ledger",
          component: () => import("../views/Product/pages/DataLedger.vue"),
        },
        {
          path: "stats",
          name: "statistics-report",
          component: () =>
            import("../views/Product/pages/StatisticsReport.vue"),
        },
      ],
    },
  ],
});

export default router;
