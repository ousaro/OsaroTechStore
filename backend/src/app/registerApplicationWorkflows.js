import { registerOrderWorkflows } from "../modules/orders/composition.js";


export const registerApplicationWorkflows = ({ eventBus }) => {
  registerOrderWorkflows({ eventBus : eventBus})
};