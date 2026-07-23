import { iconClass } from "../../icon/models/icon";

export type toastTypes = "success" | "error" | "warning" | "info";

export interface ToastOptions {
    icon?: iconClass;
    /** Auto-dismiss delay in milliseconds. Defaults to 5000. */
    duration?: number;
}

export interface ToastInstance {
    id: number;
    type: toastTypes;
    message: string;
    icon?: iconClass;
    duration: number;
}
