import toast from "react-hot-toast";
import { getErrorMessage } from "./errorUtils.js";

const toastMessage = (msg, fallback = "Something went wrong") => {
  return getErrorMessage(msg, fallback);
};

export const toastNotifier = {
  success: (msg) => toast.success(toastMessage(msg, "Done")),
  error:   (msg) => toast.error(toastMessage(msg)),
  info:    (msg) => toast(toastMessage(msg, "")),
  loading: (msg) => toast.loading(toastMessage(msg, "Loading")),
  dismiss: (id)  => toast.dismiss(id),
};
