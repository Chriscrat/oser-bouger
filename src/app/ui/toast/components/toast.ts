import { Component, computed, input, output } from "@angular/core";
import { Icon } from "../../icon/components/icon";
import { ToastInstance } from "../models/toast";

@Component({
    selector: "app-toast",
    imports: [Icon],
    templateUrl: "./toast.html",
    styleUrl: "./toast.scss",
})
export class Toast {
    toast = input.required<ToastInstance>();
    closed = output<void>();

    classType = computed(() => `fr-toast--${this.toast().type}`);
}
