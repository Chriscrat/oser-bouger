import { Component, computed, inject, OnInit } from "@angular/core";

import { Card } from "../../../../ui/card/components/card";
import { Alert } from "../../../../ui/alert/components/alert";
import { InfiniteScrollDirective } from "../../../../ui/directives/infinite-scroll.directive";
import { EventsStore } from "../../services/events.store";
import { mapEventToCardDetails } from "../../mappers/event-card.mapper";
import { Modal } from "../../../../ui/modal/components/modal";
import { EventCover } from "../event-cover/event-cover";
import { EventDetails } from "../event-details/event-details";
@Component({
    selector: "app-event-list",
    imports: [Card, Alert, InfiniteScrollDirective, Modal, EventCover, EventDetails],
    templateUrl: "./event-list.html",
    styleUrl: "./event-list.scss",
})
export class EventList implements OnInit {
    store = inject(EventsStore);
    ngOnInit(): void {
        this.store.loadNextPage();
    }
    alertNoEventFound = { description: "Aucun évènement trouvé" };
    events = computed(() => this.store.events().map(mapEventToCardDetails));
    buttonModalTitle = "Voir plus";
}
