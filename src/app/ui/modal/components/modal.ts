import { Component, input, computed } from "@angular/core";
import { Icon } from "../../icon/components/icon";

@Component({
    selector: "app-modal",
    imports: [Icon],
    templateUrl: "./modal.html",
    styleUrl: "./modal.scss",
})
export class Modal {
    id = input.required<string>();
    protected readonly buttonId = computed(() => `button-${this.id()}`);
    protected readonly buttonModalId = computed(() => `button-modal-${this.id()}`);
    protected readonly modalId = computed(() => `modal-${this.id()}`);
    readonly modalTitleId = computed(() => `modal-${this.id()}-title`);
    buttonTitle = input("Ouvrir");
}
