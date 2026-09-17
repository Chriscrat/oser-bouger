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

    private FILTERS = {
        address_name: { name: "Nom du lieu", displayed: true },
        address_zipcode: { name: "Code postal", displayed: true },
        address_city: { name: "Ville", displayed: true },
        price_type: { name: "Type de prix", displayed: false },
        deaf: { name: "Accès malentendant", displayed: true },
        blind: { name: "Nom mal voyant", displayed: true },
        pmr: { name: "Accès PMR", displayed: true },
    };

    filters = computed<EventFiltersModel[]>(() => {
        const facets = this.store.facets();
        const eventFilters: EventFiltersModel[] = [];
        (Object.keys(facets) as FilterName[]).forEach(key => {
            eventFilters.push({
                name: key,
                label: this.FILTERS[key].name,
                filters: facets[key],
                displayed: this.FILTERS[key].displayed,
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
