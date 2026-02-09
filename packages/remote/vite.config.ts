import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue(), cssInjectedByJsPlugin()],
	build: {
		outDir: resolve(__dirname, "../../apps/express/remote"),
		emptyOutDir: true,
		lib: {
			// Could also be a dictionary or array of multiple entry points
			entry: resolve(__dirname, "src/index.ts"),
			name: "RemoteUI",
			// the proper extensions will be added
			fileName: () => "remote-ui.umd.js",
			formats: ["umd"],
		},
		rollupOptions: {
			// make sure to externalize deps that shouldn't be bundled
			// into your library
			external: ["vue"],
			output: {
				// Provide global variables to use in the UMD build
				// for externalized deps
				globals: {
					vue: "Vue",
				},
			},
		},
	},
});
