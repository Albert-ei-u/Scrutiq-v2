import { toast as sonnerToast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning";

const notifySystem = (message: string, type: ToastType) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("app-toast", {
        detail: { message, type },
      }),
    );
  }
};

export const toast = {
  success: (msg: string | React.ReactNode, options?: any) => {
    const message = typeof msg === "string" ? msg : "Success";
    sonnerToast.success(msg, options);
    notifySystem(message, "success");
  },
  error: (msg: string | React.ReactNode, options?: any) => {
    const message = typeof msg === "string" ? msg : "Error occurred";
    sonnerToast.error(msg, options);
    notifySystem(message, "error");
  },
  info: (msg: string | React.ReactNode, options?: any) => {
    const message = typeof msg === "string" ? msg : "Information";
    sonnerToast.info(msg, options);
    notifySystem(message, "info");
  },
  warning: (msg: string | React.ReactNode, options?: any) => {
    const message = typeof msg === "string" ? msg : "Warning";
    sonnerToast.warning(msg, options);
    notifySystem(message, "warning");
  },
  message: (msg: string | React.ReactNode, options?: any) => {
    const message = typeof msg === "string" ? msg : "Notification";
    sonnerToast(msg, options);
    notifySystem(message, "info");
  },
};
