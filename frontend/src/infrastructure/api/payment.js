import { apiRequest, userToken } from "./client";
import { endpoints } from "./endpoints";

export const addNewPayment = async (user, items) => {
  try {
    const result = await apiRequest(endpoints.payments.intent, {
      method: "POST",
      body: items,
      token: userToken(user),
    });

    return { ...result, url: result.data?.url };
  } catch (error) {
    return { error };
  }
}
