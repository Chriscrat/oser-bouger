import { Component, input } from "@angular/core";

@Component({
    selector: "app-checkbox",
    templateUrl: "./checkbox.html",
})
export class Checkbox {
    title = input.required<string>();
}
