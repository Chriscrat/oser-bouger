import { Component, computed, input } from "@angular/core";
import { FormatedEvent } from "../../models/event";
import { EventCover as EventCoverModel } from "./models/event-cover";

@Component({
    selector: "app-event-cover",
    standalone: true,
    templateUrl: "./event-cover.html",
    styleUrl: "./event-cover.scss",
})
export class EventCover {
    event = input.required<FormatedEvent>();
    titleId = input.required<string>();
    eventCover = computed<EventCoverModel>(() => {
        const event = this.event();

        return {
            id: event.id ?? "",
            title: event.title ?? "",
            date_description: event.date_description ?? "",
            cover: {
                url: event.cover?.url ?? "",
                alt: event.cover?.alt ?? "",
                credit: event.cover?.credit ?? "",
            },
        };
    });
}
