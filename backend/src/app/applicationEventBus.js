import { createInProcessEventBus } from "../shared/infrastructure/events/createInProcessEventBus.js";

export const applicationEventBus = createInProcessEventBus();
