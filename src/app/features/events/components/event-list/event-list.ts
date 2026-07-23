import { Component, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";

import { Card } from "../../../../ui/card/components/card";
import { Alert } from "../../../../ui/alert/components/alert";
import { EventsService } from "../../services/events.service";

@Component({
    selector: "app-event-list",
    imports: [Card, Alert],
    templateUrl: "./event-list.html",
})
export class EventList {
    private eventService = inject(EventsService);
    eventList = toSignal(this.eventService.getEvents(), {
        initialValue: { total_count: 0, results: null },
    });
    alertNoEventFound = { description: "Aucun évènement trouvé" };
}
