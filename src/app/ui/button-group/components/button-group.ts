import { Component, input } from "@angular/core";
import { ButtonGroupModel } from "../models/button-group";
@Component({
    selector: "app-button-group",
    imports: [],
    templateUrl: "./button-group.html",
})
export class ButtonGroup {
    buttonGroup = input.required<ButtonGroupModel>();
}
