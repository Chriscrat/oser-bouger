import { Injectable, inject, signal, computed } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { EMPTY, catchError, finalize, tap } from "rxjs";
import { EventsService } from "./events.service";
import { Event, EventView } from "../models/event";
import { FacetsRecord, FilterName, ActiveFacetsRecord } from "../models/event-filters";

interface EventsListState {
    items: Event[];
    total: number;
    loading: boolean;
    error: string | null;
}

@Injectable({ providedIn: "root" })
export class EventsStore {
    private api = inject(EventsService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    pageSize = 20;

    // --- Filtres ---
    private facetsState = signal<FacetsRecord>({});
    facets = this.facetsState.asReadonly();

    filters: ActiveFacetsRecord = {
        address_city: [],
        address_name: [],
        address_zipcode: [],
    };

    currentView: EventView = "list";

    // --- State liste ---
    private listState = signal<EventsListState>({
        items: [],
        total: 0,
        loading: false,
        error: null,
    });

    private currentPageState = signal(1);
    currentPage = this.currentPageState;

    events = computed(() => this.listState().items);
    total = computed(() => this.listState().total);
    listLoading = computed(() => this.listState().loading);
    listError = computed(() => this.listState().error);

    mapUrl = this.getEventsMapUrl();

    async setFilters(filterName: FilterName, filterValue: string): Promise<void> {
        if (this.filters[filterName]?.includes(filterValue)) {
            const valueIndex = this.filters[filterName].indexOf(filterValue);
            this.filters[filterName].splice(valueIndex, 1);
        } else {
            this.filters[filterName]?.push(filterValue);
        }

        await this.goToPage(1);
        this.mapUrl = this.getEventsMapUrl();
    }

    async goToPage(page: number): Promise<void> {
        if (page < 1) return;

        this.currentPageState.set(page);
        this.listState.update(s => ({ ...s, loading: true, error: null }));

        const offset = (page - 1) * this.pageSize;

        this.api
            .getEvents(this.filters, { limit: this.pageSize, offset })
            .pipe(
                tap(response => {
                    const results = response.results ?? [];
                    const totalCount = response.total_count ?? 0;
                    this.listState.update(s => ({
                        ...s,
                        items: results,
                        total: totalCount,
                    }));
                }),
                catchError(err => {
                    this.listState.update(s => ({ ...s, error: `Erreur de chargement: ${err}` }));
                    return EMPTY;
                }),
                finalize(() => this.listState.update(s => ({ ...s, loading: false })))
            )
            .subscribe();

        await this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page },
            queryParamsHandling: "merge",
        });
    }

    async resetFilters() {
        (Object.keys(this.filters) as FilterName[]).forEach((key: FilterName): void => {
            this.filters[key] = [];
        });
        await this.goToPage(1);
        this.mapUrl = this.getEventsMapUrl();
    }

    getEventsMapUrl(): string {
        return this.api.getEventsMap(this.filters);
    }

    async getFacets(): Promise<void> {
        try {
            const facets = await this.api.getFacetsList();
            this.facetsState.set(facets);
        } catch (error) {
            console.error("Error", error);
        }
    }

    updateView(view: EventView) {
        this.currentView = view;
    }
}
