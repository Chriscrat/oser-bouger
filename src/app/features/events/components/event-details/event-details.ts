import { Component, input, computed } from "@angular/core";
import { FormatedEvent } from "../../models/event";
import { EventDetails as EventDetailsModel } from "./models/event-details";
import { EventContactTag as EventTagModel } from "../event-contact-tag/models/event-contact-tag";
import { EventContactSocial } from "../event-contact-social/event-contact-social";
import { EventContactTag } from "../event-contact-tag/event-contact-tag";
import { EventContact as EventContactModel } from "../event-contact-social/models/event-contact-social";
@Component({
    selector: "app-event-details",
    imports: [EventContactTag, EventContactSocial],
    standalone: true,
    templateUrl: "./event-details.html",
    styleUrl: "./event-details.scss",
})
export class EventDetails {
    event = input.required<FormatedEvent>();
    eventDetails = computed<EventDetailsModel>(() => {
        const event = this.event();

        return {
            id: event.id,
            title: event.title,
            description: event.description,
            contacts: event.contacts,
            address: event.address,
            tags: event.tags,
        };
    });
    eventDescription = computed<string>(() => this.eventDetails().description);
    eventTag = computed<EventTagModel>(() => {
        const details = this.eventDetails();

        return {
            id: details.id,
            title: details.title,
            address: details.address,
            tags: details.tags,
        };
    });
    contacts = computed<EventContactModel>(() => {
        return this.eventDetails().contacts;
    });
}
