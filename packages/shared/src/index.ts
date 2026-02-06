import type { App, Plugin } from "vue";
import IDUHeader from "./components/Header";
import IDUBubble from "./components/Bubble";
import IDUInput from "./components/Input";
import IDUDynamicRenderer from "./components/DynamicRenderer";
import "./components/styles/idu.css"; // 引入全局样式

const components = [IDUHeader, IDUBubble, IDUInput, IDUDynamicRenderer];

const IDUCore: Plugin = {
	install(app: App) {
		components.forEach((component) => {
			if (component.name) {
				app.component(component.name, component);
			}
		});
	},
};

export { IDUHeader, IDUBubble, IDUInput, IDUDynamicRenderer };
export type {
	RegisteredComponent,
	DynamicComponentData,
} from "./components/types/index";

export default IDUCore;
