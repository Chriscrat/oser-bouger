import { Component, computed, OnInit, inject } from "@angular/core";
import { EventsStore } from "../../../services/events.store";
import { EventFilters as EventFiltersModel, FilterName } from "../../../models/event-filters";
import { EventFilter } from "../../event-filter/components/event-filter";

@Component({
    selector: "app-event-filters",
    templateUrl: "./event-filters.html",
    imports: [EventFilter],
})
export class EventFilters implements OnInit {
    store = inject(EventsStore);
    ngOnInit(): void {
        void this.store.getFacets();
    }

    private FILTERS = {
        address_name: "Adresse",
        address_zipcode: "Code postal",
        address_city: "Ville",
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

    updateFilter(filterName: FilterName | undefined, filterValue: string) {
        if (filterName) {
            this.store.setFilters(filterName, filterValue);
        }
    }

    resetFilters = (): void => {
        this.store.resetFilters();
    };
}
