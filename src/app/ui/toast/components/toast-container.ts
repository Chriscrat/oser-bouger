import { Component, computed, inject } from "@angular/core";
import { Toast } from "./toast";
import { ToastService } from "../services/toast.service";

@Component({
    selector: "app-toast-container",
    imports: [Toast],
    templateUrl: "./toast-container.html",
    styleUrl: "./toast-container.scss",
})
export class ToastContainer {
    private toastService = inject(ToastService);

    toasts = this.toastService.toasts;
    /**
     * Switches the live region to `assertive` when an error toast is present
     * so that screen readers interrupt the current reading flow immediately,
     * rather than waiting for the next idle slot (`polite`).
     */
    ariaLive = computed(() =>
        this.toasts().some(toast => toast.type === "error") ? "assertive" : "polite"
    );

    dismiss(id: number): void {
        this.toastService.dismiss(id);
    }
}
