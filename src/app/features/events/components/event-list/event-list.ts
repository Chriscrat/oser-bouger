import { Component, computed, inject, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

import { Card } from "../../../../ui/card/components/card";
import { Alert } from "../../../../ui/alert/components/alert";
import { InfiniteScrollDirective } from "../../../../ui/directives/infinite-scroll.directive";
import { EventsStore } from "../../services/events.store";
import { mapEventToCardDetails } from "../../mappers/event-card.mapper";
import { Modal } from "../../../../ui/modal/components/modal";
import { EventCover } from "../event-cover/event-cover";
import { EventDetails } from "../event-details/event-details";
import { ToastService } from "../../../../ui/toast/services/toast.service";
import { ButtonGroup } from "../../../../ui/button-group/components/button-group";
import { EventView } from "../../models/event";
import { ButtonGroupModel } from "../../../../ui/button-group/models/button-group";
import { SidemenuService } from "../../../../ui/sidemenu/services/sidemenu.service";
@Component({
    selector: "app-event-list",
    imports: [Card, Alert, InfiniteScrollDirective, Modal, EventCover, EventDetails, ButtonGroup],
    templateUrl: "./event-list.html",
    styleUrl: "./event-list.scss",
})
export class EventList implements OnInit {
    store = inject(EventsStore);
    sidemenuService = inject(SidemenuService);

    ngOnInit(): void {
        this.store.loadNextPage();
    }

    private sanitizer = inject(DomSanitizer);

    mapUrl = computed<string>(() => this.store.getEventsMapUrl());
    trustedMapUrl = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.mapUrl()));

    alertNoEventFound = { description: "Aucun évènement trouvé" };
    events = computed(() => this.store.events().map(mapEventToCardDetails));
    buttonModalTitle = "Voir plus";

    private toastService = inject(ToastService);

    onScrollEnd(): void {
        this.store.loadNextPage();
        this.toastService.info("Récupération de nouveaux évènements ...");
    }

    currentView: EventView = "list";
    toggleEventView = (view: string): void => {
        this.currentView = view as EventView;
    };

    buttons: ButtonGroupModel = {
        title: "Affichage",
        clickAction: this.toggleEventView,
        buttons: [
            {
                text: "Liste",
                value: "list",
                checked: true,
            },
            {
                text: "Carte",
                value: "map",
            },
        ],
    };
}
