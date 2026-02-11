import mitt from "mitt";

type Events = {
	action: any;
	[key: string]: any;
};

const eventBus = mitt<Events>();

export default eventBus;
