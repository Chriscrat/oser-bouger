import { Component, computed, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { KeyValuePipe } from "@angular/common";

import { EventsStore } from "../../services/events.store";
import { mapEventToCardDetails } from "../../mappers/event-card.mapper";
import { ButtonGroup } from "../../../../ui/button-group/components/button-group";
import { EventView } from "../../models/event";
import { ButtonGroupModel } from "../../../../ui/button-group/models/button-group";
import { SidemenuService } from "../../../../ui/sidemenu/services/sidemenu.service";
import { EventListCards } from "../event-list-cards/event-list-cards";
import { EventListMap } from "../event-list-map/event-list-map";
import { FilterName, TagName } from "../../models/event-filters";

type ActiveFilter = Partial<Record<TagName | FilterName, { name: string; values: string[] }>>;
@Component({
    selector: "app-event-list",
    imports: [ButtonGroup, EventListCards, EventListMap, KeyValuePipe],
    templateUrl: "./event-list.html",
    styleUrl: "./event-list.scss",
})
export class EventList {
    store = inject(EventsStore);
    sidemenuService = inject(SidemenuService);
    route = inject(ActivatedRoute);

    private sanitizer = inject(DomSanitizer);

    mapUrl = computed<string>(() => this.store.getEventsMapUrl());
    trustedMapUrl = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.mapUrl()));

    events = computed(() => this.store.events().map(mapEventToCardDetails));
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

    urlParamters = toSignal(this.route.queryParams, {
        initialValue: this.route.snapshot.queryParams,
    });

    activeFilters = computed<ActiveFilter>((): ActiveFilter => {
        const filters: ActiveFilter = {};

        for (const [key, values] of Object.entries(this.urlParamters())) {
            if (key === "page") {
                continue;
            }

            const filterKey = key as TagName;
            const filter = this.store.FILTER_LIST[filterKey];
            const filterValues = (Array.isArray(values) ? values : [values]).filter(
                (value): value is string => value !== null && value !== undefined
            );

            filters[filterKey] = {
                name: filter?.name ?? key,
                values: filterValues,
            };
        }
        return filters;
    });

    async removeFilter(category: TagName | FilterName, value: string): Promise<void> {
        const currentFilter = this.store.FILTER_LIST[category as FilterName];
        const isFilter = currentFilter !== undefined && currentFilter.displayed;
        if (isFilter) {
            await this.store.setFilters(category as FilterName, value);
        } else {
            void this.store.filterByTag(category as TagName, value);
        }
    }
}
