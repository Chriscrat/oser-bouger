import { Component, computed, OnInit, inject } from "@angular/core";
import { EventsStore } from "../../../services/events.store";
import { EventFilters as EventFiltersModel, FilterName } from "../../../models/event-filters";
import { EventFilter } from "../../event-filter/components/event-filter";

@Component({
    selector: "app-event-filters",
    templateUrl: "./event-filters.html",
    imports: [EventFilter],
    styleUrl: "./event-filters.scss",
})
export class EventFilters implements OnInit {
    store = inject(EventsStore);
    ngOnInit(): void {
        void this.store.getFacets();
    }

    private FILTERS = {
        address_name: "Nom du lieu",
        address_zipcode: "Code postal",
        address_city: "Ville",
        price_type: "Type de prix",
        deaf: "Accès mal entendant",
        blind: "Accès mal voyant",
        pmr: "Accès PMR",
    };
    filters = computed<EventFiltersModel[]>(() => {
        const facets = this.store.facets();
        const result: EventFiltersModel[] = [];
        (Object.keys(facets) as FilterName[]).forEach(key => {
            result.push({
                name: key,
                label: this.FILTERS[key],
                filters: facets[key],
            });
        });

        return result;
    });

    resetFilters = (): void => {
        void this.store.resetFilters();
    };

    async updateFilter(filterName: FilterName | undefined, filterValue: string) {
        if (filterName) {
            await this.store.setFilters(filterName, filterValue);
        }
    }
}
