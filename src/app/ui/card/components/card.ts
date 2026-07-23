import { Component, input, computed } from "@angular/core";
import { OrientationType } from "../models/card";

@Component({
    selector: "app-card",
    templateUrl: "./card.html",
})
export class Card {
    orientation = input<OrientationType>();
    orientationTypeClass = computed(() => `fr-card--${this.orientation() || "vertical"}`);
}
