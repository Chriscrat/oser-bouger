import { Injectable, signal } from "@angular/core";
import { ToastInstance, ToastOptions, toastTypes } from "../models/toast";
import { iconClass } from "../../icon/models/icon";

const DEFAULT_DURATION = 5000;

const DEFAULT_ICONS: Record<toastTypes, iconClass> = {
    success: "checkbox-circle",
    error: "error-warning",
    warning: "alert",
    info: "information",
};

/**
 * Manages the lifecycle of toast notifications across the application.
 *
 * Exposes a read-only signal consumed by `ToastContainer`. Each toast is
 * auto-dismissed after its duration; the corresponding timer is stored in
 * `timers` so that a manual `dismiss()` call can cancel it and avoid a
 * ghost state update after the element is already gone.
 *
 * @example
 * const toastService = inject(ToastService);
 * const id = toastService.success('Enregistrement réussi.');
 * // dismiss manually before the 5 s timeout if needed
 * toastService.dismiss(id);
 */
@Injectable({ providedIn: "root" })
export class ToastService {
    private toastsSignal = signal<ToastInstance[]>([]);
    /** Tracks active auto-dismiss timers by toast id to allow early cancellation. */
    private timers = new Map<number, ReturnType<typeof setTimeout>>();
    private nextId = 0;

    readonly toasts = this.toastsSignal.asReadonly();

    success(message: string, options?: ToastOptions): number {
        return this.show("success", message, options);
    }

    error(message: string, options?: ToastOptions): number {
        return this.show("error", message, options);
    }

    warning(message: string, options?: ToastOptions): number {
        return this.show("warning", message, options);
    }

    info(message: string, options?: ToastOptions): number {
        return this.show("info", message, options);
    }

    /**
     * Removes a toast immediately and cancels its auto-dismiss timer.
     *
     * Called both by user interaction (close button) and by the auto-dismiss
     * timeout. The timer is always cleared to prevent a second `dismiss` call
     * on an already-removed toast when the user closes it before the timeout fires.
     *
     * @param id - The id returned by `success`, `error`, `warning`, or `info`.
     */
    dismiss(id: number): void {
        this.toastsSignal.update(toasts => toasts.filter(toast => toast.id !== id));
        const timer = this.timers.get(id);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(id);
        }
    }

    /**
     * @returns The toast id, usable for programmatic early dismissal.
     */
    private show(type: toastTypes, message: string, options?: ToastOptions): number {
        const id = this.nextId++;
        const duration = options?.duration ?? DEFAULT_DURATION;

        const toast: ToastInstance = {
            id,
            type,
            message,
            icon: options?.icon ?? DEFAULT_ICONS[type],
            duration,
        };

        this.toastsSignal.update(toasts => [...toasts, toast]);
        this.timers.set(
            id,
            setTimeout(() => this.dismiss(id), duration)
        );

        return id;
    }
}
