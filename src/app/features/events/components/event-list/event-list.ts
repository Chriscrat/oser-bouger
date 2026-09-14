import { Component, computed, inject, signal } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

import { EventsStore } from "../../services/events.store";
import { mapEventToCardDetails } from "../../mappers/event-card.mapper";
import { ButtonGroup } from "../../../../ui/button-group/components/button-group";
import { EventView } from "../../models/event";
import { ButtonGroupModel } from "../../../../ui/button-group/models/button-group";
import { SidemenuService } from "../../../../ui/sidemenu/services/sidemenu.service";
import { EventListCards } from "../event-list-cards/event-list-cards";
import { EventListMap } from "../event-list-map/event-list-map";
@Component({
    selector: "app-event-list",
    imports: [ButtonGroup, EventListCards, EventListMap],
    templateUrl: "./event-list.html",
    styleUrl: "./event-list.scss",
})
export class EventList {
    store = inject(EventsStore);
    sidemenuService = inject(SidemenuService);

    private sanitizer = inject(DomSanitizer);

    mapUrl = computed<string>(() => this.store.getEventsMapUrl());
    trustedMapUrl = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.mapUrl()));

    events = computed(() => this.store.events().map(mapEventToCardDetails));
    buttonModalTitle = "Voir plus";

    currentView = signal<EventView>("list");
    totalRecordText = computed<string>(() =>
        this.currentView() === "map" ? `${this.store.total()} évènement(s) disponible(s)` : ""
    );
    mapMounted = false;
    toggleEventView = (view: string): void => {
        this.currentView.set(view as EventView);
        if (view === "map") {
            this.mapMounted = true;
        }
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
