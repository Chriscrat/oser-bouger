import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

import { EventsStore } from "../../services/events.store";
import { mapEventToCardDetails } from "../../mappers/event-card.mapper";
import { ToastService } from "../../../../ui/toast/services/toast.service";
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
export class EventList implements OnInit {
    store = inject(EventsStore);
    sidemenuService = inject(SidemenuService);

    ngOnInit(): void {
        this.store.loadNextPage();
    }

    private sanitizer = inject(DomSanitizer);

    mapUrl = computed<string>(() => this.store.getEventsMapUrl());
    trustedMapUrl = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.mapUrl()));

    events = computed(() => this.store.events().map(mapEventToCardDetails));
    buttonModalTitle = "Voir plus";

    private toastService = inject(ToastService);

    onScrollEnd(): void {
        this.store.loadNextPage();
        this.toastService.info("Récupération de nouveaux évènements ...");
    }

    currentView = signal<EventView>("list");
    totalRecordText = computed<string>(() =>
        this.currentView() === "list"
            ? `${this.store.events().length} sur ${this.store.total()} évènement(s) affiché(s)`
            : `${this.store.total()} évènement(s) disponible(s)`
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
