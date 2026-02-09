import * as Vue from "vue";
import { createApp } from "vue";
import "./assets/main.css";
import App from "./App.vue";
import router from "./router";

// Expose Vue to global window object for UMD remote components
(window as any).Vue = Vue;

const app = createApp(App);

app.use(router);

app.mount("#app");
