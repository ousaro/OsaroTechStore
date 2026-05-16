import toast from "react-hot-toast";

const toastMessage = (msg, fallback = "Something went wrong") => {
  if (!msg) return fallback;
  if (typeof msg === "string") return msg;
  if (typeof msg.message === "string") return msg.message;
  if (typeof msg.code === "string") return msg.code;
  return fallback;
};

export const toastNotifier = {
  success: (msg) => toast.success(toastMessage(msg, "Done")),
  error:   (msg) => toast.error(toastMessage(msg)),
  info:    (msg) => toast(toastMessage(msg, "")),
  loading: (msg) => toast.loading(toastMessage(msg, "Loading")),
  dismiss: (id)  => toast.dismiss(id),
};
