import { Component, computed, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { EventsStore } from "../services/events.store";
import { EventCover } from "../components/event-cover/event-cover";
import { EventDetails } from "../components/event-details/event-details";
import { FormatedEvent } from "../models/event";
import { mapEventToCardDetails } from "../mappers/event-card.mapper";
import { Alert } from "../../../ui/alert/components/alert";

@Component({
    selector: "app-event-page",
    standalone: true,
    imports: [EventCover, EventDetails, Alert],
    templateUrl: "./event-page.html",
})
export class EventPage implements OnInit {
    store = inject(EventsStore);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    ngOnInit(): void {
        const eventId = this.route.snapshot.paramMap.get("id");
        if (eventId) {
            void this.store.fetchEvent(eventId);
        }
    }
    eventId = computed(() => this.route.snapshot.paramMap.get("id"));
    event = computed<FormatedEvent | null>(() => {
        const event = this.store.currentEvent();
        return event === null ? null : mapEventToCardDetails(event);
    });
    alertDisclaimer = {
        title: "Ce service n'est pas un projet officiel",
        description:
            "Il a pour but d'implémenter le DSFR à des fins de test par un particulier et n'est aucunement associé aux équipes digitales des entités de l'État français.",
    };
    alertNoEventFound = { description: "Aucun évènement trouvé" };

    async goBack() {
        await this.router.navigate(["/"], {
            queryParams: { page: 1 },
            replaceUrl: true,
        });
    }
}
