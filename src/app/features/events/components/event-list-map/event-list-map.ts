import { Component, inject, computed } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

import { EventsStore } from "../../services/events.store";

@Component({
    selector: "app-event-list-map",
    templateUrl: "./event-list-map.html",
    styleUrl: "./event-list-map.scss",
})
export class EventListMap {
    store = inject(EventsStore);
    private sanitizer = inject(DomSanitizer);

    mapUrl = computed<string>(() => this.store.mapUrl);
    trustedMapUrl = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.mapUrl()));
}
