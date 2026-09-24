import { Component, inject, computed } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

import { EventsStore } from "../../services/events.store";
import { EventsService } from "../../services/events.service";
import { Alert } from "../../../../ui/alert/components/alert";
import { AlertModel } from "../../../../ui/alert/models/alert";

@Component({
    selector: "app-event-list-map",
    imports: [Alert],
    templateUrl: "./event-list-map.html",
    styleUrl: "./event-list-map.scss",
})
export class EventListMap {
    store = inject(EventsStore);
    private sanitizer = inject(DomSanitizer);

    isFallbackMode = inject(EventsService).isFallbackMode;
    unavailableMapAlert: AlertModel = {
        title: "Carte indisponible",
        description:
            "La carte dépend de l'API opendata de la Ville de Paris, actuellement inaccessible. Les évènements restent consultables en vue liste.",
    };

    mapUrl = computed<string>(() => this.store.mapUrl);
    trustedMapUrl = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.mapUrl()));
}
