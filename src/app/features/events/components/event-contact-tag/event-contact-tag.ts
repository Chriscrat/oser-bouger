import { Component, input, computed } from "@angular/core";
import { Tag } from "../../../../ui/tag/components/tag";
import { EventContactTag as EventContactTagModel } from "./models/event-contact-tag";

@Component({
    selector: "app-event-contact-tag",
    imports: [Tag],
    standalone: true,
    templateUrl: "./event-contact-tag.html",
    styleUrl: "./event-contact-tag.scss",
})
export class EventContactTag {
    event = input.required<EventContactTagModel>();
    completeAddress = computed<string | null>(() => {
        const eventValue = this.event();
        if (!eventValue) {
            return null;
        }
        const addressObj = eventValue.address;
        if (!addressObj) {
            return null;
        }
        const hasAddress = Object.values(addressObj).every(str => str !== null);
        if (hasAddress) {
            return `<b>${addressObj.name}</b>
                    <br>
                    ${addressObj.street}
                    ${addressObj.zipcode} - ${addressObj.city}`;
        } else {
            return null;
        }
    });
}
