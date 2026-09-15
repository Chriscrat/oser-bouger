import { Component, computed, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";

import { Alert } from "../../../../ui/alert/components/alert";
import { Card } from "../../../../ui/card/components/card";
import { EventsStore } from "../../services/events.store";
import { mapEventToCardDetails } from "../../mappers/event-card.mapper";
import { Pagination } from "../../../../ui/pagination/components/pagination";
import { Icon } from "../../../../ui/icon/components/icon";
@Component({
    selector: "app-event-list-cards",
    imports: [Alert, Card, Pagination, Icon],
    styleUrl: "./event-list-cards.scss",
    templateUrl: "./event-list-cards.html",
})
export class EventListCards implements OnInit {
    store = inject(EventsStore);
    private route = inject(ActivatedRoute);
    private destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
            const page = Number(params.get("page")) || 1;
            void this.store.goToPage(page);
        });
    }

    alertNoEventFound = { description: "Aucun évènement trouvé" };
    events = computed(() => this.store.events().map(mapEventToCardDetails));
    buttonTitle = "Voir plus";

    eventsPerPage = computed<number>(() => this.store.pageSize);
    totalEvents = computed<number>(() => this.store.total());

    getFormatDate(date: string) {
        return new Date(date).toLocaleDateString();
    }
}
