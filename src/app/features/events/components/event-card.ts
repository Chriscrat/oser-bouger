import { Component, input } from "@angular/core";
import { EventModel } from "../models/event";

@Component({
    selector: "app-event-card",
    imports: [],
    templateUrl: "./event-card.html",
})
export class EventCard {
    event = input.required<EventModel>();
}
