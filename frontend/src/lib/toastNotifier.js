import toast from "react-hot-toast";

export const toastNotifier = {
  success: (msg) => toast.success(msg),
  error:   (msg) => toast.error(msg),
  info:    (msg) => toast(msg),
  loading: (msg) => toast.loading(msg),
  dismiss: (id)  => toast.dismiss(id),
};
