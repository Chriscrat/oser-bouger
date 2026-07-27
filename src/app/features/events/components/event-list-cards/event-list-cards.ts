import { Component, computed, inject, OnInit } from "@angular/core";

import { Alert } from "../../../../ui/alert/components/alert";
import { Card } from "../../../../ui/card/components/card";
import { InfiniteScrollDirective } from "../../../../ui/directives/infinite-scroll.directive";
import { EventsStore } from "../../services/events.store";
import { mapEventToCardDetails } from "../../mappers/event-card.mapper";
import { Modal } from "../../../../ui/modal/components/modal";
import { EventCover } from "../event-cover/event-cover";
import { EventDetails } from "../event-details/event-details";
import { ToastService } from "../../../../ui/toast/services/toast.service";

@Component({
    selector: "app-event-list-cards",
    imports: [Alert, Card, InfiniteScrollDirective, Modal, EventCover, EventDetails],
    templateUrl: "./event-list-cards.html",
})
export class EventListCards implements OnInit {
    store = inject(EventsStore);

    ngOnInit(): void {
        this.store.loadNextPage();
    }

    alertNoEventFound = { description: "Aucun évènement trouvé" };
    events = computed(() => this.store.events().map(mapEventToCardDetails));
    buttonModalTitle = "Voir plus";

    private toastService = inject(ToastService);

    onScrollEnd(): void {
        this.store.loadNextPage();
        this.toastService.info("Récupération de nouveaux évènements ...");
    }
}
