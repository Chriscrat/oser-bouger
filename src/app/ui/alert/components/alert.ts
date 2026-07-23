import { Component, input, computed } from "@angular/core";
import { AlertModel, alertTypes } from "../models/alert";

@Component({
    selector: "app-alert",
    imports: [],
    templateUrl: "./alert.html",
})
export class Alert {
    type = input<alertTypes>();
    classType = computed(() => `fr-alert--${this.type()}`);
    alert = input.required<AlertModel>();
}
