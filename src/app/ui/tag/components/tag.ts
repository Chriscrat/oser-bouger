import { Component, input, computed } from "@angular/core";
import { Icon } from "../../icon/components/icon";
import { iconClass, iconSize } from "../../icon/models/icon";

@Component({
    selector: "app-tag",
    imports: [Icon],
    standalone: true,
    templateUrl: "./tag.html",
    styleUrl: "./tag.scss",
})
export class Tag {
    private TAGS_COLOR: Record<string, string> = {
        red: "fr-text-action-high--red-marianne",
        grey: "fr-text-default--grey",
    };

    icon = input<iconClass>("mail");
    color = input<"red" | "grey">("grey");
    colorIcon = computed(() => this.TAGS_COLOR[this.color()]);
    size = input<iconSize>("lg");
    iconHidden = input(false);
}
