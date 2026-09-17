import { Component, computed, OnInit, inject } from "@angular/core";
import { EventsStore } from "../../../services/events.store";
import {
    EventFilters as EventFiltersModel,
    FilterName,
    TagName,
} from "../../../models/event-filters";
import { EventFilter } from "../../event-filter/components/event-filter";
import { Category } from "../../../models/event";
import { ActivatedRoute } from "@angular/router";

@Component({
    selector: "app-event-filters",
    templateUrl: "./event-filters.html",
    imports: [EventFilter],
    styleUrl: "./event-filters.scss",
})
export class EventFilters implements OnInit {
    store = inject(EventsStore);
    route = inject(ActivatedRoute);
    ngOnInit(): void {
        void this.store.getFacets();
    }

    filters = computed<EventFiltersModel[]>(() => {
        const facets = this.store.facets();
        const eventFilters: EventFiltersModel[] = [];
        (Object.keys(facets) as FilterName[]).forEach(key => {
            eventFilters.push({
                name: key,
                label: this.store.FILTER_LIST[key].name,
                filters: facets[key],
                displayed: this.store.FILTER_LIST[key].displayed,
            });
        });

        return eventFilters.filter(filter => filter.displayed);
    });

    categories = computed<Category[]>(() => this.store.categoryList().slice(0, 15));

    priceTypes = computed(() => {
        const facets = this.store.facets();
        return facets["price_type"];
    });

    resetFilters = (): void => {
        void this.store.resetFilters();
    };

    async updateFilter(filterName: FilterName | undefined, filterValue: string) {
        if (filterName) {
            await this.store.setFilters(filterName, filterValue);
        }
    }

    filterByTag(category: TagName, value: string): void {
        void this.store.filterByTag(category, value);
    }

    isChecked(category: TagName, value: string): boolean {
        const urlParameters = this.route.snapshot.queryParams;
        const parameter = urlParameters[category] as string | string[] | undefined;
        return parameter?.includes(value) ?? false;
    }
}
