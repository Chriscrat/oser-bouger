import { Component, input, output } from "@angular/core";

@Component({
    selector: "app-checkbox",
    templateUrl: "./checkbox.html",
})
export class Checkbox {
    title = input.required<string>();
    checkedChange = output<boolean>();

    onChange(event: Event): void {
        this.checkedChange.emit((event.target as HTMLInputElement).checked);
    }
}
