import { Component, inject, OnInit } from "@angular/core";

import { Card } from "../../../../ui/card/components/card";
import { Alert } from "../../../../ui/alert/components/alert";
import { InfiniteScrollDirective } from "../../../../ui/directives/infinite-scroll.directive";
import { EventsStore } from "../../services/events.store";

@Component({
    selector: "app-event-list",
    imports: [Card, Alert, InfiniteScrollDirective],
    templateUrl: "./event-list.html",
    styleUrl: "./event-list.scss",
})
export class EventList implements OnInit {
    store = inject(EventsStore);
    ngOnInit(): void {
        this.store.loadNextPage();
    }
    alertNoEventFound = { description: "Aucun évènement trouvé" };
}
