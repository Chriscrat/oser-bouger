import { Component, input } from "@angular/core";
import { Event } from "../../models/event";

@Component({
    selector: "app-event-card",
    imports: [],
    templateUrl: "./event-card.html",
    styleUrl: "./event-card.scss",
})
export class EventCard {
    event = input.required<Event>();
}
