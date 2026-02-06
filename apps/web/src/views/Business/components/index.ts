import { agricultureComponents } from "./Agriculture";
import { vehicleComponents } from "./Vehicle";

import type { RegisteredComponent } from "@idu/core";

const AllComponents: RegisteredComponent[] = [
	...agricultureComponents,
	...vehicleComponents,
];

export default AllComponents;
